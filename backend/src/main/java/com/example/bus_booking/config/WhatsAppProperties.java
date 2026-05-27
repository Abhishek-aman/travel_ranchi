package com.example.bus_booking.config;

import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.whatsapp")
public record WhatsAppProperties(
		boolean enabled,
		String gupshupApiKey,
		String gupshupSourceNumber,
		String gupshupAppName,
		String gupshupTemplateEndpoint,
		String gupshupMessageEndpoint,
		String defaultCountryCode,
		String ticketBaseUrl,
		MessageMode messageMode,
		String ticketConfirmationTemplateId,
		String ticketConfirmationLanguageCode,
		List<String> ticketConfirmationTemplateParams,
		String ticketConfirmationTextTemplate) {

	public enum MessageMode {
		TEXT,
		TEMPLATE
	}

	public String gupshupTemplateEndpointOrDefault() {
		return hasText(gupshupTemplateEndpoint) ? gupshupTemplateEndpoint : "https://api.gupshup.io/wa/api/v1/template/msg";
	}

	public String gupshupMessageEndpointOrDefault() {
		return hasText(gupshupMessageEndpoint) ? gupshupMessageEndpoint : "https://api.gupshup.io/wa/api/v1/msg";
	}

	public String defaultCountryCodeOrDefault() {
		return hasText(defaultCountryCode) ? defaultCountryCode : "91";
	}

	public MessageMode messageModeOrDefault() {
		return messageMode != null ? messageMode : MessageMode.TEMPLATE;
	}

	public String ticketConfirmationLanguageCodeOrDefault() {
		return hasText(ticketConfirmationLanguageCode) ? ticketConfirmationLanguageCode : "en";
	}

	public List<String> ticketConfirmationTemplateParamsOrDefault() {
		return ticketConfirmationTemplateParams == null || ticketConfirmationTemplateParams.isEmpty()
				? List.of("passengerName", "bookingReference", "route", "travelDate", "departureTime", "seatLabels",
						"ticketUrl")
				: ticketConfirmationTemplateParams;
	}

	public String ticketConfirmationTextTemplateOrDefault() {
		if (hasText(ticketConfirmationTextTemplate)) {
			return ticketConfirmationTextTemplate;
		}
		return """
				Hello {{passengerName}}, your Travel Ranchi ticket is confirmed.

				Booking: {{bookingReference}}
				Route: {{route}}
				Date: {{travelDate}}
				Departure: {{departureTime}}
				Seats: {{seatLabels}}
				Ticket: {{ticketUrl}}

				Please show this booking reference while boarding.
				""";
	}

	public boolean isConfigured() {
		return enabled && hasText(gupshupApiKey) && hasText(gupshupSourceNumber);
	}

	private static boolean hasText(String value) {
		return value != null && !value.isBlank();
	}
}
