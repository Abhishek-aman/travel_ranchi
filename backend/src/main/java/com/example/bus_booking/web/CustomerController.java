package com.example.bus_booking.web;

import com.example.bus_booking.domain.Booking;
import com.example.bus_booking.repository.BookingRepository;
import com.example.bus_booking.repository.PassengerRepository;
import com.example.bus_booking.security.SecurityUtils;
import com.example.bus_booking.service.BookingService;
import com.example.bus_booking.service.BookingService.PassengerLine;
import com.example.bus_booking.service.NotificationService;
import com.example.bus_booking.service.TicketPdfService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/customer")
@PreAuthorize("hasRole('CUSTOMER')")
public class CustomerController {

	private final BookingService bookingService;
	private final BookingRepository bookingRepository;
	private final PassengerRepository passengerRepository;
	private final TicketPdfService ticketPdfService;
	private final NotificationService notificationService;

	public CustomerController(BookingService bookingService, BookingRepository bookingRepository,
			PassengerRepository passengerRepository, TicketPdfService ticketPdfService,
			NotificationService notificationService) {
		this.bookingService = bookingService;
		this.bookingRepository = bookingRepository;
		this.passengerRepository = passengerRepository;
		this.ticketPdfService = ticketPdfService;
		this.notificationService = notificationService;
	}

	public record CreateBookingRequest(@NotNull Long tripId, @NotEmpty List<Long> tripSeatIds,
			@NotEmpty List<PassengerLineDto> passengers, @NotNull BigDecimal totalAmount) {
	}

	public record PassengerLineDto(String name, String phone) {
		PassengerLine toLine() {
			return new PassengerLine(name, phone);
		}
	}

	public record BookingResponse(String bookingReference, String status, String paymentStatus) {
		static BookingResponse from(Booking b) {
			return new BookingResponse(b.getBookingReference(), b.getBookingStatus().name(), b.getPaymentStatus().name());
		}
	}

	public record PayRequest(String paymentGatewayRef) {
	}

	@PostMapping("/bookings")
	public BookingResponse book(@Valid @RequestBody CreateBookingRequest req) {
		var user = SecurityUtils.currentUser();
		var lines = req.passengers().stream().map(PassengerLineDto::toLine).toList();
		var booking = bookingService.bookOnline(user, req.tripId(), req.tripSeatIds(), lines, req.totalAmount());
		return BookingResponse.from(booking);
	}

	@PostMapping("/bookings/{bookingReference}/payment")
	public BookingResponse pay(@PathVariable String bookingReference, @RequestBody PayRequest req) {
		var booking = assertCustomerBooking(bookingReference);
		var confirmed = bookingService.confirmOnlinePayment(booking.getBookingReference(), req.paymentGatewayRef());
		var passengers = passengerRepository.findByBooking_Id(confirmed.getId());
		byte[] pdf = ticketPdfService.buildTicketPdf(confirmed, passengers);
		notificationService.sendTicketConfirmation(confirmed, pdf);
		return BookingResponse.from(confirmed);
	}

	@GetMapping("/bookings/{bookingReference}/ticket.pdf")
	public ResponseEntity<byte[]> ticketPdf(@PathVariable String bookingReference) {
		var booking = assertCustomerBooking(bookingReference);
		var passengers = passengerRepository.findByBooking_Id(booking.getId());
		byte[] pdf = ticketPdfService.buildTicketPdf(booking, passengers);
		return ResponseEntity.ok()
				.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=ticket-" + bookingReference + ".pdf")
				.contentType(MediaType.APPLICATION_PDF)
				.body(pdf);
	}

	private Booking assertCustomerBooking(String bookingReference) {
		var user = SecurityUtils.currentUser();
		Booking b = bookingRepository.findByBookingReference(bookingReference)
				.orElseThrow(() -> new IllegalArgumentException("Booking not found"));
		if (!b.getBookedBy().getId().equals(user.getId())) {
			throw new IllegalArgumentException("Booking not found");
		}
		return b;
	}
}
