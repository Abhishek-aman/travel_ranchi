package com.example.bus_booking.service;

import com.example.bus_booking.domain.AppUser;
import com.example.bus_booking.domain.Booking;
import com.example.bus_booking.domain.BookingChannel;
import com.example.bus_booking.domain.BookingStatus;
import com.example.bus_booking.domain.BoardingStatus;
import com.example.bus_booking.domain.Passenger;
import com.example.bus_booking.domain.PaymentStatus;
import com.example.bus_booking.domain.SeatInventoryStatus;
import com.example.bus_booking.domain.TripSeat;
import com.example.bus_booking.repository.BookingRepository;
import com.example.bus_booking.repository.PassengerRepository;
import com.example.bus_booking.repository.TripRepository;
import com.example.bus_booking.repository.TripSeatRepository;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BookingService {

	private final TripRepository tripRepository;
	private final TripSeatRepository tripSeatRepository;
	private final BookingRepository bookingRepository;
	private final PassengerRepository passengerRepository;
	private final ReferenceGenerator referenceGenerator;

	public BookingService(TripRepository tripRepository, TripSeatRepository tripSeatRepository,
			BookingRepository bookingRepository, PassengerRepository passengerRepository,
			ReferenceGenerator referenceGenerator) {
		this.tripRepository = tripRepository;
		this.tripSeatRepository = tripSeatRepository;
		this.bookingRepository = bookingRepository;
		this.passengerRepository = passengerRepository;
		this.referenceGenerator = referenceGenerator;
	}

	@Transactional
	public Booking bookOnline(AppUser customer, Long tripId, List<Long> tripSeatIds,
			List<PassengerLine> passengers, BigDecimal totalAmount) {
		var trip = tripRepository.findById(tripId).orElseThrow(() -> new IllegalArgumentException("Trip not found"));
		validatePassengerCount(tripSeatIds, passengers);
		List<TripSeat> locked = tripSeatRepository.findAllByIdIn(new ArrayList<>(tripSeatIds));
		List<TripSeat> ordered = orderSeats(tripSeatIds, locked);
		validateSeatsForTrip(tripId, ordered);
		for (TripSeat ts : ordered) {
			ts.setStatus(SeatInventoryStatus.RESERVED);
		}
		tripSeatRepository.saveAll(ordered);
		String ref = referenceGenerator.bookingReference();
		Booking booking = Booking.builder()
				.bookingReference(ref)
				.trip(trip)
				.bookedBy(customer)
				.channel(BookingChannel.ONLINE)
				.bookingStatus(BookingStatus.PENDING_PAYMENT)
				.paymentStatus(PaymentStatus.PENDING)
				.totalAmount(totalAmount)
				.createdAt(Instant.now())
				.build();
		booking = bookingRepository.save(booking);
		savePassengersAndAssignSeats(booking, ordered, passengers);
		return bookingRepository.findById(booking.getId()).orElseThrow();
	}

	@Transactional
	public Booking bookAgent(AppUser agent, Long tripId, List<Long> tripSeatIds,
			List<PassengerLine> passengers, BigDecimal totalAmount) {
		var trip = tripRepository.findById(tripId).orElseThrow(() -> new IllegalArgumentException("Trip not found"));
		validatePassengerCount(tripSeatIds, passengers);
		List<TripSeat> locked = tripSeatRepository.findAllByIdIn(new ArrayList<>(tripSeatIds));
		List<TripSeat> ordered = orderSeats(tripSeatIds, locked);
		validateSeatsForTrip(tripId, ordered);
		String ref = referenceGenerator.bookingReference();
		Booking booking = Booking.builder()
				.bookingReference(ref)
				.trip(trip)
				.bookedBy(agent)
				.channel(BookingChannel.OFFLINE_AGENT)
				.bookingStatus(BookingStatus.CONFIRMED)
				.paymentStatus(PaymentStatus.PAID)
				.totalAmount(totalAmount)
				.createdAt(Instant.now())
				.build();
		booking = bookingRepository.save(booking);
		for (TripSeat ts : ordered) {
			ts.setStatus(SeatInventoryStatus.BOOKED);
			ts.setBooking(booking);
		}
		tripSeatRepository.saveAll(ordered);
		savePassengersAndAssignSeats(booking, ordered, passengers);
		return bookingRepository.findById(booking.getId()).orElseThrow();
	}

	private void validatePassengerCount(List<Long> tripSeatIds, List<PassengerLine> passengers) {
		if (passengers == null || passengers.size() != tripSeatIds.size()) {
			throw new IllegalArgumentException("Passenger count must match seat count");
		}
	}

	private void savePassengersAndAssignSeats(Booking booking, List<TripSeat> seats, List<PassengerLine> lines) {
		for (int i = 0; i < lines.size(); i++) {
			PassengerLine line = lines.get(i);
			TripSeat seat = seats.get(i);
			seat.setBooking(booking);
			Passenger p = Passenger.builder()
					.booking(booking)
					.fullName(line.name())
					.phone(line.phone())
					.tripSeat(seat)
					.boardingStatus(BoardingStatus.NOT_BOARDED)
					.verificationToken(referenceGenerator.verificationToken())
					.build();
			passengerRepository.save(p);
		}
		tripSeatRepository.saveAll(seats);
	}

	private List<TripSeat> orderSeats(List<Long> tripSeatIds, List<TripSeat> seats) {
		if (seats.size() != tripSeatIds.size()) {
			throw new IllegalArgumentException("One or more seats not found");
		}
		Map<Long, TripSeat> byId = seats.stream().collect(Collectors.toMap(TripSeat::getId, s -> s));
		return tripSeatIds.stream().map(id -> {
			TripSeat ts = byId.get(id);
			if (ts == null) {
				throw new IllegalArgumentException("Seat id not in result set: " + id);
			}
			return ts;
		}).toList();
	}

	private void validateSeatsForTrip(Long tripId, List<TripSeat> seats) {
		for (TripSeat ts : seats) {
			if (!ts.getTrip().getId().equals(tripId)) {
				throw new IllegalArgumentException("Seat does not belong to trip");
			}
			if (ts.getStatus() != SeatInventoryStatus.AVAILABLE) {
				throw new IllegalStateException("Seat not available: " + ts.getSeatLabel());
			}
		}
	}

	@Transactional
	public Booking confirmOnlinePayment(String bookingReference, String paymentGatewayRef) {
		Booking b = bookingRepository.findByBookingReference(bookingReference)
				.orElseThrow(() -> new IllegalArgumentException("Booking not found"));
		if (b.getBookingStatus() != BookingStatus.PENDING_PAYMENT) {
			throw new IllegalStateException("Booking not awaiting payment");
		}
		List<TripSeat> seats = tripSeatRepository.findByBooking_Id(b.getId());
		for (TripSeat ts : seats) {
			if (ts.getStatus() == SeatInventoryStatus.RESERVED) {
				ts.setStatus(SeatInventoryStatus.BOOKED);
			}
		}
		tripSeatRepository.saveAll(seats);
		b.setBookingStatus(BookingStatus.CONFIRMED);
		b.setPaymentStatus(PaymentStatus.PAID);
		b.setPaymentGatewayRef(paymentGatewayRef);
		return bookingRepository.save(b);
	}

	@Transactional
	public Booking cancelBooking(String bookingReference, boolean refund) {
		Booking b = bookingRepository.findByBookingReference(bookingReference)
				.orElseThrow(() -> new IllegalArgumentException("Booking not found"));
		if (b.getBookingStatus() == BookingStatus.CANCELLED) {
			return b;
		}
		passengerRepository.deleteAll(passengerRepository.findByBooking_Id(b.getId()));
		List<TripSeat> seats = tripSeatRepository.findByBooking_Id(b.getId());
		for (TripSeat ts : seats) {
			ts.setStatus(SeatInventoryStatus.AVAILABLE);
			ts.setBooking(null);
			ts.setBlockReason(null);
		}
		tripSeatRepository.saveAll(seats);
		b.setBookingStatus(refund ? BookingStatus.REFUNDED : BookingStatus.CANCELLED);
		b.setPaymentStatus(refund ? PaymentStatus.REFUNDED : PaymentStatus.FAILED);
		return bookingRepository.save(b);
	}

	public record PassengerLine(String name, String phone) {
	}
}
