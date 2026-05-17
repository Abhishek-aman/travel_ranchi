package com.example.bus_booking.web;

import com.example.bus_booking.domain.Booking;
import com.example.bus_booking.domain.BulkBookingRequest;
import com.example.bus_booking.domain.BusType;
import com.example.bus_booking.repository.BookingRepository;
import com.example.bus_booking.repository.BulkBookingRequestRepository;
import com.example.bus_booking.service.AdminManagementService;
import com.example.bus_booking.service.BookingService;
import com.example.bus_booking.service.InventoryAdminService;
import com.example.bus_booking.service.BulkBookingService;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

	private final AdminManagementService adminManagementService;
	private final BookingService bookingService;
	private final BookingRepository bookingRepository;
	private final InventoryAdminService inventoryAdminService;
	private final BulkBookingService bulkBookingService;
	private final BulkBookingRequestRepository bulkBookingRequestRepository;

	public AdminController(AdminManagementService adminManagementService, BookingService bookingService,
			BookingRepository bookingRepository, InventoryAdminService inventoryAdminService,
			BulkBookingService bulkBookingService, BulkBookingRequestRepository bulkBookingRequestRepository) {
		this.adminManagementService = adminManagementService;
		this.bookingService = bookingService;
		this.bookingRepository = bookingRepository;
		this.inventoryAdminService = inventoryAdminService;
		this.bulkBookingService = bulkBookingService;
		this.bulkBookingRequestRepository = bulkBookingRequestRepository;
	}

	public record RouteCreateBody(String operatorCode, String origin, String destination, Integer distanceKm,
			String departureTime) {
	}

	@PostMapping("/routes")
	public PublicController.RouteDto createRoute(@RequestBody RouteCreateBody b) {
		var r = adminManagementService.createRoute(b.operatorCode(), b.origin(), b.destination(), b.distanceKm(),
				b.departureTime());
		return PublicController.RouteDto.from(r);
	}

	public record LayoutCreateBody(String name, BusType busType, String layoutJson) {
	}

	@PostMapping("/layouts")
	public LayoutDto createLayout(@RequestBody LayoutCreateBody b) {
		var l = adminManagementService.createLayout(b.name(), b.busType(), b.layoutJson());
		return new LayoutDto(l.getId(), l.getName(), l.getBusType().name());
	}

	public record LayoutDto(Long id, String name, String busType) {
	}

	public record BusCreateBody(String operatorCode, String registrationNumber, BusType busType, Long layoutTemplateId) {
	}

	public record BusDto(Long id, String registrationNumber) {
	}

	public record BusListDto(Long id, String operatorCode, String registrationNumber, String busType,
			Long layoutTemplateId) {
		static BusListDto from(AdminManagementService.BusListItem i) {
			return new BusListDto(i.id(), i.operatorCode(), i.registrationNumber(), i.busType().name(),
					i.layoutTemplateId());
		}
	}

	@GetMapping("/buses")
	public List<BusListDto> listBuses() {
		return adminManagementService.listBuses().stream().map(BusListDto::from).toList();
	}

	@PostMapping("/buses")
	public BusDto createBus(@RequestBody BusCreateBody b) {
		var bus = adminManagementService.createBus(b.operatorCode(), b.registrationNumber(), b.busType(),
				b.layoutTemplateId());
		return new BusDto(bus.getId(), bus.getRegistrationNumber());
	}

	public record TripCreateBody(Long routeId, Long busId, LocalDate tripDate, Instant departureAt, Instant arrivalAt) {
	}

	@PostMapping("/trips")
	public PublicController.TripDto createTrip(@RequestBody TripCreateBody b) {
		var t = adminManagementService.createTrip(b.routeId(), b.busId(), b.tripDate(), b.departureAt(), b.arrivalAt());
		return PublicController.TripDto.from(t);
	}

	public record BlockSeatBody(String seatLabel, String reason) {
	}

	@PostMapping("/trips/{tripId}/seats/block")
	public ResponseEntity<Void> blockSeat(@PathVariable Long tripId, @RequestBody BlockSeatBody body) {
		inventoryAdminService.blockSeat(tripId, body.seatLabel(), body.reason());
		return ResponseEntity.ok().build();
	}

	@PostMapping("/trips/{tripId}/seats/unblock")
	public ResponseEntity<Void> unblockSeat(@PathVariable Long tripId, @RequestBody Map<String, String> body) {
		inventoryAdminService.unblockSeat(tripId, body.get("seatLabel"));
		return ResponseEntity.ok().build();
	}

	@PostMapping("/bookings/{bookingReference}/cancel")
	public BookingSummary cancel(@PathVariable String bookingReference) {
		Booking b = bookingService.cancelBooking(bookingReference, false);
		return BookingSummary.from(b);
	}

	@PostMapping("/bookings/{bookingReference}/refund")
	public BookingSummary refund(@PathVariable String bookingReference) {
		Booking b = bookingService.cancelBooking(bookingReference, true);
		return BookingSummary.from(b);
	}

	public record BookingSummary(String bookingReference, String status) {
		static BookingSummary from(Booking b) {
			return new BookingSummary(b.getBookingReference(), b.getBookingStatus().name());
		}
	}

	@GetMapping("/bulk-requests")
	public List<BulkDto> listBulk() {
		return bulkBookingRequestRepository.findAll().stream().map(BulkDto::from).toList();
	}

	public record BulkDto(Long id, String status, String email, int seats) {
		static BulkDto from(BulkBookingRequest r) {
			return new BulkDto(r.getId(), r.getStatus().name(), r.getEmail(), r.getRequestedSeats());
		}
	}

	public record ApproveBody(String paymentLinkUrl) {
	}

	@PostMapping("/bulk-requests/{id}/approve")
	public BulkDto approve(@PathVariable Long id, @RequestBody ApproveBody body) {
		return BulkDto.from(bulkBookingService.approve(id, body.paymentLinkUrl()));
	}

	@PostMapping("/bulk-requests/{id}/reject")
	public BulkDto reject(@PathVariable Long id) {
		return BulkDto.from(bulkBookingService.reject(id));
	}

	@GetMapping("/reports/summary")
	public Map<String, Object> summary() {
		long bookings = bookingRepository.count();
		return Map.of("totalBookings", bookings);
	}
}
