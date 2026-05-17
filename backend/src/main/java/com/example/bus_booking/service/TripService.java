package com.example.bus_booking.service;

import com.example.bus_booking.domain.Bus;
import com.example.bus_booking.domain.Route;
import com.example.bus_booking.domain.SeatInventoryStatus;
import com.example.bus_booking.domain.Trip;
import com.example.bus_booking.domain.TripSeat;
import com.example.bus_booking.domain.TripStatus;
import com.example.bus_booking.repository.BusRepository;
import com.example.bus_booking.repository.RouteRepository;
import com.example.bus_booking.repository.TripRepository;
import com.example.bus_booking.repository.TripSeatRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.DateTimeParseException;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TripService {

	private final TripRepository tripRepository;
	private final TripSeatRepository tripSeatRepository;
	private final RouteRepository routeRepository;
	private final BusRepository busRepository;
	private final SeatLayoutParser seatLayoutParser;

	public TripService(TripRepository tripRepository, TripSeatRepository tripSeatRepository,
			RouteRepository routeRepository, BusRepository busRepository, SeatLayoutParser seatLayoutParser) {
		this.tripRepository = tripRepository;
		this.tripSeatRepository = tripSeatRepository;
		this.routeRepository = routeRepository;
		this.busRepository = busRepository;
		this.seatLayoutParser = seatLayoutParser;
	}

	@Transactional(readOnly = true)
	public List<Trip> searchTrips(Long routeId, LocalDate date) {
		return tripRepository.findActiveByRouteAndDate(routeId, date, TripStatus.CANCELLED);
	}

	@Transactional
	public Trip createTrip(Long routeId, Long busId, LocalDate tripDate, Instant departureAt, Instant arrivalAt) {
		Route route = routeRepository.findById(routeId).orElseThrow(() -> new IllegalArgumentException("Route not found"));
		Bus bus = busRepository.findById(busId).orElseThrow(() -> new IllegalArgumentException("Bus not found"));
		Trip trip = Trip.builder()
				.route(route)
				.bus(bus)
				.tripDate(tripDate)
				.departureAt(departureAt)
				.arrivalAt(arrivalAt)
				.status(TripStatus.SCHEDULED)
				.build();
		trip = tripRepository.save(trip);
		var seats = seatLayoutParser.parse(bus.getSeatLayoutTemplate());
		for (var ps : seats) {
			TripSeat ts = TripSeat.builder()
					.trip(trip)
					.seatLabel(ps.label())
					.rowIndex(ps.row())
					.colIndex(ps.col())
					.status(SeatInventoryStatus.AVAILABLE)
					.build();
			tripSeatRepository.save(ts);
		}
		return trip;
	}

	/** Parse route.departureTime "HH:mm" with system default zone for a given date */
	public static Instant departureInstant(LocalDate date, String hhmm, ZoneId zone) {
		try {
			LocalTime t = LocalTime.parse(hhmm);
			return date.atTime(t).atZone(zone).toInstant();
		} catch (DateTimeParseException e) {
			throw new IllegalArgumentException("Invalid departure time: " + hhmm);
		}
	}
}
