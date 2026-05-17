package com.example.bus_booking.service;

import com.example.bus_booking.domain.Booking;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

	private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

	public void sendTicketConfirmation(Booking booking, byte[] pdfBytes) {
		log.info("Ticket confirmed: ref={} — Email/WhatsApp: integrate SMTP (spring-boot-starter-mail) and WhatsApp Business API.",
				booking.getBookingReference());
		if (pdfBytes != null) {
			log.debug("PDF size {} bytes (would attach to email/WhatsApp)", pdfBytes.length);
		}
	}
}
