package com.example.bus_booking.web;

import com.example.bus_booking.domain.Route;
import com.example.bus_booking.domain.Trip;
import com.example.bus_booking.domain.TripSeat;
import com.example.bus_booking.repository.RouteRepository;
import com.example.bus_booking.repository.TripRepository;
import com.example.bus_booking.repository.TripSeatRepository;
import com.example.bus_booking.service.BulkBookingService;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public")
public class PublicController {

	private final RouteRepository routeRepository;
	private final TripRepository tripRepository;
	private final TripSeatRepository tripSeatRepository;
	private final BulkBookingService bulkBookingService;

	public PublicController(RouteRepository routeRepository, TripRepository tripRepository,
			TripSeatRepository tripSeatRepository, BulkBookingService bulkBookingService) {
		this.routeRepository = routeRepository;
		this.tripRepository = tripRepository;
		this.tripSeatRepository = tripSeatRepository;
		this.bulkBookingService = bulkBookingService;
	}

	public record RouteDto(Long id, String origin, String destination, String departureTime) {
		static RouteDto from(Route r) {
			return new RouteDto(r.getId(), r.getOriginCity(), r.getDestinationCity(), r.getDepartureTime());
		}
	}

	public record TripDto(Long id, Long routeId, LocalDate tripDate, String departureAt, String status) {
		static TripDto from(Trip t) {
			return new TripDto(t.getId(), t.getRoute().getId(), t.getTripDate(), t.getDepartureAt().toString(),
					t.getStatus().name());
		}
	}

	public record SeatDto(Long id, String label, String status) {
		static SeatDto from(TripSeat s) {
			return new SeatDto(s.getId(), s.getSeatLabel(), s.getStatus().name());
		}
	}

	@GetMapping("/routes/search")
	public List<RouteDto> searchRoutes(@RequestParam String origin, @RequestParam String destination) {
		return routeRepository.search(origin, destination).stream().map(RouteDto::from).toList();
	}

	@GetMapping("/routes/{routeId}/trips")
	public List<TripDto> tripsForRoute(@PathVariable Long routeId,
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
		return tripRepository.findActiveByRouteAndDate(routeId, date,
				com.example.bus_booking.domain.TripStatus.CANCELLED).stream().map(TripDto::from).toList();
	}

	@GetMapping("/trips/{tripId}/seats")
	public List<SeatDto> seats(@PathVariable Long tripId) {
		return tripSeatRepository.findByTripIdOrderBySeatLabel(tripId).stream().map(SeatDto::from).toList();
	}

	public record BulkRequestBody(String requesterName, String email, String phone, Long routeId,
			@DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate tripDate, int requestedSeats, String notes) {
	}

	@PostMapping("/bulk-booking-requests")
	public BulkBookingResponse submitBulk(@RequestBody BulkRequestBody body) {
		var r = bulkBookingService.submit(body.requesterName(), body.email(), body.phone(), body.routeId(),
				body.tripDate(), body.requestedSeats(), body.notes());
		return new BulkBookingResponse(r.getId(), r.getStatus().name());
	}

	public record BulkBookingResponse(Long id, String status) {
	}
}
