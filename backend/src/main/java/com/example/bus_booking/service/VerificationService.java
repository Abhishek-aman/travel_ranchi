package com.example.bus_booking.service;

import com.example.bus_booking.domain.BoardingStatus;
import com.example.bus_booking.domain.BookingStatus;
import com.example.bus_booking.domain.Passenger;
import com.example.bus_booking.repository.PassengerRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class VerificationService {

	private final PassengerRepository passengerRepository;

	public VerificationService(PassengerRepository passengerRepository) {
		this.passengerRepository = passengerRepository;
	}

	@Transactional
	public Passenger verifyAndBoard(Long tripId, String qrToken) {
		Passenger p = passengerRepository.findByVerificationToken(qrToken)
				.orElseThrow(() -> new IllegalArgumentException("Invalid ticket"));
		return verifyCommon(tripId, p);
	}

	@Transactional
	public Passenger verifyAndBoardByReference(Long tripId, String bookingReference) {
		List<Passenger> list = passengerRepository.findByBooking_BookingReferenceAndBooking_Trip_Id(bookingReference,
				tripId);
		if (list.isEmpty()) {
			throw new IllegalArgumentException("No passenger for this reference on this trip");
		}
		if (list.size() > 1) {
			throw new IllegalStateException("Multiple passengers — use phone or QR");
		}
		return verifyCommon(tripId, list.get(0));
	}

	@Transactional
	public Passenger verifyAndBoardByPhone(Long tripId, String bookingReference, String phone) {
		Passenger p = passengerRepository.findByBooking_BookingReferenceAndPhone(bookingReference, phone)
				.orElseThrow(() -> new IllegalArgumentException("No matching passenger"));
		return verifyCommon(tripId, p);
	}

	private Passenger verifyCommon(Long tripId, Passenger p) {
		if (!p.getBooking().getTrip().getId().equals(tripId)) {
			throw new IllegalArgumentException("Ticket is for a different trip");
		}
		if (p.getBooking().getBookingStatus() != BookingStatus.CONFIRMED) {
			throw new IllegalStateException("Booking is not confirmed");
		}
		p.setBoardingStatus(BoardingStatus.BOARDED);
		return passengerRepository.save(p);
	}
}
