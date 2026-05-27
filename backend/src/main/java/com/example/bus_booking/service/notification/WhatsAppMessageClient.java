package com.example.bus_booking.service.notification;

import java.util.List;

public interface WhatsAppMessageClient {

	void sendText(String to, String body);

	void sendTemplate(String to, String templateId, String languageCode, List<String> bodyParameters);
}
