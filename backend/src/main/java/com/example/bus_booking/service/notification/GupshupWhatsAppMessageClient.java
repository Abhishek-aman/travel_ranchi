package com.example.bus_booking.service.notification;

import com.example.bus_booking.config.WhatsAppProperties;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class GupshupWhatsAppMessageClient implements WhatsAppMessageClient {

	private static final String CHANNEL = "whatsapp";

	private final WhatsAppProperties properties;
	private final ObjectMapper objectMapper;
	private final HttpClient httpClient;

	public GupshupWhatsAppMessageClient(WhatsAppProperties properties) {
		this.properties = properties;
		this.objectMapper = new ObjectMapper();
		this.httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();
	}

	@Override
	public void sendText(String to, String body) {
		List<FormField> fields = commonFields(to);
		fields.add(new FormField("message", toJson(Map.of("type", "text", "text", body))));
		post(properties.gupshupMessageEndpointOrDefault(), fields);
	}

	@Override
	public void sendTemplate(String to, String templateId, String languageCode, List<String> bodyParameters) {
		List<FormField> fields = commonFields(to);
		fields.add(new FormField("template", toJson(Map.of("id", templateId, "params", bodyParameters))));
		post(properties.gupshupTemplateEndpointOrDefault(), fields);
	}

	private List<FormField> commonFields(String to) {
		List<FormField> fields = new ArrayList<>();
		fields.add(new FormField("channel", CHANNEL));
		fields.add(new FormField("source", properties.gupshupSourceNumber()));
		fields.add(new FormField("destination", to));
		if (properties.gupshupAppName() != null && !properties.gupshupAppName().isBlank()) {
			fields.add(new FormField("src.name", properties.gupshupAppName()));
		}
		return fields;
	}

	private void post(String endpoint, List<FormField> fields) {
		try {
			HttpRequest request = HttpRequest.newBuilder()
					.uri(URI.create(endpoint))
					.timeout(Duration.ofSeconds(20))
					.header("apikey", properties.gupshupApiKey())
					.header("accept", "application/json")
					.header("Content-Type", "application/x-www-form-urlencoded")
					.POST(HttpRequest.BodyPublishers.ofString(formBody(fields)))
					.build();
			HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
			if (response.statusCode() < 200 || response.statusCode() >= 300) {
				throw new IllegalStateException("Gupshup API returned " + response.statusCode() + ": " + response.body());
			}
		} catch (IOException e) {
			throw new IllegalStateException("Could not call Gupshup WhatsApp API", e);
		} catch (InterruptedException e) {
			Thread.currentThread().interrupt();
			throw new IllegalStateException("Gupshup WhatsApp API call interrupted", e);
		}
	}

	private String formBody(List<FormField> fields) {
		return fields.stream()
				.map(field -> encode(field.name()) + "=" + encode(field.value()))
				.reduce((left, right) -> left + "&" + right)
				.orElse("");
	}

	private String encode(String value) {
		return URLEncoder.encode(value == null ? "" : value, StandardCharsets.UTF_8);
	}

	private String toJson(Map<String, Object> body) {
		try {
			return objectMapper.writeValueAsString(body);
		} catch (JsonProcessingException e) {
			throw new IllegalStateException("Could not serialize Gupshup payload", e);
		}
	}

	private record FormField(String name, String value) {
	}
}
