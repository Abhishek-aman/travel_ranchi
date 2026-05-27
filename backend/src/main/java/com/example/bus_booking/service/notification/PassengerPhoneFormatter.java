package com.example.bus_booking.service.notification;

import com.example.bus_booking.config.WhatsAppProperties;
import org.springframework.stereotype.Component;

@Component
public class PassengerPhoneFormatter {

	private final WhatsAppProperties properties;

	public PassengerPhoneFormatter(WhatsAppProperties properties) {
		this.properties = properties;
	}

	public String toWhatsAppRecipient(String rawPhone) {
		if (rawPhone == null || rawPhone.isBlank()) {
			return "";
		}
		String digits = rawPhone.replaceAll("[^0-9]", "");
		if (digits.startsWith("00")) {
			digits = digits.substring(2);
		}
		if (digits.length() == 10) {
			return properties.defaultCountryCodeOrDefault() + digits;
		}
		return digits;
	}
}
