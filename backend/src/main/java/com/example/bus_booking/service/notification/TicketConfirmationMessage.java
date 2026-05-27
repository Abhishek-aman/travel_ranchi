package com.example.bus_booking.service.notification;

import java.util.Map;

public record TicketConfirmationMessage(
		String to,
		String passengerName,
		String bookingReference,
		String route,
		String travelDate,
		String departureTime,
		String seatLabels,
		String ticketUrl) {

	public Map<String, String> placeholders() {
		return Map.of(
				"passengerName", passengerName,
				"bookingReference", bookingReference,
				"route", route,
				"travelDate", travelDate,
				"departureTime", departureTime,
				"seatLabels", seatLabels,
				"ticketUrl", ticketUrl);
	}
}
