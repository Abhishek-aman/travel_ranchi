package com.example.bus_booking.service;

import com.example.bus_booking.config.WhatsAppProperties;
import com.example.bus_booking.domain.Booking;
import com.example.bus_booking.domain.Passenger;
import com.example.bus_booking.repository.PassengerRepository;
import com.example.bus_booking.service.notification.PassengerPhoneFormatter;
import com.example.bus_booking.service.notification.TicketConfirmationMessage;
import com.example.bus_booking.service.notification.WhatsAppTicketNotificationService;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

	private static final Logger log = LoggerFactory.getLogger(NotificationService.class);
	private static final DateTimeFormatter DEPARTURE_FORMATTER = DateTimeFormatter.ofPattern("hh:mm a");

	private final PassengerRepository passengerRepository;
	private final WhatsAppProperties whatsAppProperties;
	private final PassengerPhoneFormatter phoneFormatter;
	private final WhatsAppTicketNotificationService whatsAppTicketNotificationService;

	public NotificationService(PassengerRepository passengerRepository, WhatsAppProperties whatsAppProperties,
			PassengerPhoneFormatter phoneFormatter, WhatsAppTicketNotificationService whatsAppTicketNotificationService) {
		this.passengerRepository = passengerRepository;
		this.whatsAppProperties = whatsAppProperties;
		this.phoneFormatter = phoneFormatter;
		this.whatsAppTicketNotificationService = whatsAppTicketNotificationService;
	}

	public void sendTicketConfirmation(Booking booking, byte[] pdfBytes) {
		log.info("Ticket confirmed: ref={}; dispatching configured notifications", booking.getBookingReference());
		if (pdfBytes != null) {
			log.debug("Generated ticket PDF size={} bytes for ref={}", pdfBytes.length, booking.getBookingReference());
		}
		sendWhatsAppTicketConfirmation(booking);
	}

	private void sendWhatsAppTicketConfirmation(Booking booking) {
		if (!whatsAppProperties.enabled()) {
			log.info("WhatsApp notifications disabled; skipping booking ref={}", booking.getBookingReference());
			return;
		}
		List<Passenger> passengers = passengerRepository.findByBooking_Id(booking.getId());
		if (passengers.isEmpty()) {
			log.warn("No passengers found for booking ref={}; skipping WhatsApp confirmation",
					booking.getBookingReference());
			return;
		}

		var passengersByPhone = passengers.stream()
				.collect(Collectors.groupingBy(p -> phoneFormatter.toWhatsAppRecipient(p.getPhone()), LinkedHashMap::new,
						Collectors.toList()));
		for (var entry : passengersByPhone.entrySet()) {
			var recipient = entry.getKey();
			var groupedPassengers = entry.getValue();
			whatsAppTicketNotificationService.sendTicketConfirmation(buildMessage(booking, recipient, groupedPassengers));
		}
	}

	private TicketConfirmationMessage buildMessage(Booking booking, String recipient, List<Passenger> passengers) {
		String passengerName = passengers.stream().map(Passenger::getFullName).collect(Collectors.joining(", "));
		String seatLabels = passengers.stream()
				.map(p -> p.getTripSeat().getSeatLabel())
				.collect(Collectors.joining(", "));
		String route = booking.getTrip().getRoute().getOriginCity() + " to "
				+ booking.getTrip().getRoute().getDestinationCity();
		String departureTime = booking.getTrip().getDepartureAt()
				.atZone(ZoneId.of("Asia/Kolkata"))
				.format(DEPARTURE_FORMATTER);
		return new TicketConfirmationMessage(
				recipient,
				passengerName,
				booking.getBookingReference(),
				route,
				booking.getTrip().getTripDate().toString(),
				departureTime,
				seatLabels,
				ticketUrl(booking));
	}

	private String ticketUrl(Booking booking) {
		String baseUrl = whatsAppProperties.ticketBaseUrl();
		if (baseUrl == null || baseUrl.isBlank()) {
			return "https://travelranchi.com";
		}
		String trimmed = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
		return trimmed + "/confirmation?bookingReference=" + booking.getBookingReference();
	}
}
