package com.example.bus_booking.web;

import com.example.bus_booking.domain.Booking;
import com.example.bus_booking.domain.Passenger;
import com.example.bus_booking.repository.BookingRepository;
import com.example.bus_booking.repository.PassengerRepository;
import com.example.bus_booking.security.SecurityUtils;
import com.example.bus_booking.service.BookingService;
import com.example.bus_booking.service.BookingService.PassengerLine;
import com.example.bus_booking.service.BoardingService;
import com.example.bus_booking.service.NotificationService;
import com.example.bus_booking.service.TicketPdfService;
import com.example.bus_booking.service.VerificationService;
import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/agent")
@PreAuthorize("hasRole('AGENT')")
public class AgentController {

	private final BookingService bookingService;
	private final BookingRepository bookingRepository;
	private final PassengerRepository passengerRepository;
	private final VerificationService verificationService;
	private final BoardingService boardingService;
	private final TicketPdfService ticketPdfService;
	private final NotificationService notificationService;

	public AgentController(BookingService bookingService, BookingRepository bookingRepository,
			PassengerRepository passengerRepository, VerificationService verificationService,
			BoardingService boardingService, TicketPdfService ticketPdfService,
			NotificationService notificationService) {
		this.bookingService = bookingService;
		this.bookingRepository = bookingRepository;
		this.passengerRepository = passengerRepository;
		this.verificationService = verificationService;
		this.boardingService = boardingService;
		this.ticketPdfService = ticketPdfService;
		this.notificationService = notificationService;
	}

	public record AgentBookingRequest(Long tripId, List<Long> tripSeatIds, List<CustomerController.PassengerLineDto> passengers,
			BigDecimal totalAmount) {
	}

	public record BookingRefResponse(String bookingReference, String status) {
	}

	@PostMapping("/bookings")
	public BookingRefResponse bookCash(@RequestBody AgentBookingRequest req) {
		var agent = SecurityUtils.currentUser();
		var lines = req.passengers().stream().map(CustomerController.PassengerLineDto::toLine).toList();
		Booking b = bookingService.bookAgent(agent, req.tripId(), req.tripSeatIds(), lines, req.totalAmount());
		var passengers = passengerRepository.findByBooking_Id(b.getId());
		byte[] pdf = ticketPdfService.buildTicketPdf(b, passengers);
		notificationService.sendTicketConfirmation(b, pdf);
		return new BookingRefResponse(b.getBookingReference(), b.getBookingStatus().name());
	}

	public record VerifyQrBody(@NotBlank String qrToken) {
	}

	@PostMapping("/trips/{tripId}/verify/qr")
	public PassengerDto verifyQr(@PathVariable Long tripId, @RequestBody VerifyQrBody body) {
		Passenger p = verificationService.verifyAndBoard(tripId, body.qrToken());
		return PassengerDto.from(p);
	}

	public record VerifyRefBody(@NotBlank String bookingReference) {
	}

	@PostMapping("/trips/{tripId}/verify/reference")
	public PassengerDto verifyRef(@PathVariable Long tripId, @RequestBody VerifyRefBody body) {
		Passenger p = verificationService.verifyAndBoardByReference(tripId, body.bookingReference());
		return PassengerDto.from(p);
	}

	public record VerifyPhoneBody(@NotBlank String bookingReference, @NotBlank String phone) {
	}

	@PostMapping("/trips/{tripId}/verify/phone")
	public PassengerDto verifyPhone(@PathVariable Long tripId, @RequestBody VerifyPhoneBody body) {
		Passenger p = verificationService.verifyAndBoardByPhone(tripId, body.bookingReference(), body.phone());
		return PassengerDto.from(p);
	}

	public record PassengerDto(Long id, String name, String seat, String boardingStatus) {
		static PassengerDto from(Passenger p) {
			return new PassengerDto(p.getId(), p.getFullName(), p.getTripSeat().getSeatLabel(),
					p.getBoardingStatus().name());
		}
	}

	@PatchMapping("/passengers/{passengerId}/no-show")
	public PassengerDto noShow(@PathVariable Long passengerId) {
		return PassengerDto.from(boardingService.markNoShow(passengerId));
	}

	@PatchMapping("/passengers/{passengerId}/offboard")
	public PassengerDto offboard(@PathVariable Long passengerId) {
		return PassengerDto.from(boardingService.markOffboarded(passengerId));
	}

	@GetMapping("/trips/{tripId}/manifest")
	public List<PassengerDto> manifest(@PathVariable Long tripId) {
		return passengerRepository.findByBooking_Trip_Id(tripId).stream().map(PassengerDto::from).toList();
	}

	@GetMapping("/bookings/{bookingReference}/ticket.pdf")
	public ResponseEntity<byte[]> ticketPdf(@PathVariable String bookingReference) {
		Booking booking = bookingRepository.findByBookingReference(bookingReference)
				.orElseThrow(() -> new IllegalArgumentException("Booking not found"));
		var passengers = passengerRepository.findByBooking_Id(booking.getId());
		byte[] pdf = ticketPdfService.buildTicketPdf(booking, passengers);
		return ResponseEntity.ok()
				.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=ticket-" + bookingReference + ".pdf")
				.contentType(MediaType.APPLICATION_PDF)
				.body(pdf);
	}
}
