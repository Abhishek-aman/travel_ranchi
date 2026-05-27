package com.example.bus_booking.service.notification;

import com.example.bus_booking.config.WhatsAppProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class WhatsAppTicketNotificationService {

	private static final Logger log = LoggerFactory.getLogger(WhatsAppTicketNotificationService.class);

	private final WhatsAppProperties properties;
	private final WhatsAppMessageClient client;
	private final WhatsAppTemplateRenderer renderer;

	public WhatsAppTicketNotificationService(WhatsAppProperties properties, WhatsAppMessageClient client,
			WhatsAppTemplateRenderer renderer) {
		this.properties = properties;
		this.client = client;
		this.renderer = renderer;
	}

	public void sendTicketConfirmation(TicketConfirmationMessage message) {
		if (!properties.enabled()) {
			log.info("WhatsApp notifications disabled; skipping booking ref={}", message.bookingReference());
			return;
		}
		if (!properties.isConfigured()) {
			log.warn("WhatsApp notifications enabled but Gupshup API key/source number missing; skipping booking ref={}",
					message.bookingReference());
			return;
		}
		if (message.to() == null || message.to().isBlank()) {
			log.warn("Passenger phone missing; skipping WhatsApp booking ref={}", message.bookingReference());
			return;
		}

		try {
			if (properties.messageModeOrDefault() == WhatsAppProperties.MessageMode.TEMPLATE) {
				sendTemplate(message);
			} else {
				sendText(message);
			}
			log.info("WhatsApp ticket confirmation sent to={} ref={}", maskRecipient(message.to()),
					message.bookingReference());
		} catch (RuntimeException ex) {
			log.error("WhatsApp ticket confirmation failed for ref={} to={}: {}", message.bookingReference(),
					maskRecipient(message.to()), ex.getMessage());
		}
	}

	private void sendText(TicketConfirmationMessage message) {
		String body = renderer.renderText(properties.ticketConfirmationTextTemplateOrDefault(), message.placeholders());
		client.sendText(message.to(), body);
	}

	private void sendTemplate(TicketConfirmationMessage message) {
		String templateId = properties.ticketConfirmationTemplateId();
		if (templateId == null || templateId.isBlank()) {
			log.warn("WhatsApp template mode enabled without Gupshup ticket confirmation template id; skipping ref={}",
					message.bookingReference());
			return;
		}
		var parameters = renderer.resolveParameters(properties.ticketConfirmationTemplateParamsOrDefault(),
				message.placeholders());
		client.sendTemplate(message.to(), templateId, properties.ticketConfirmationLanguageCodeOrDefault(), parameters);
	}

	private String maskRecipient(String recipient) {
		if (recipient == null || recipient.length() <= 4) {
			return "****";
		}
		return "****" + recipient.substring(recipient.length() - 4);
	}
}
