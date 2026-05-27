package com.example.bus_booking.service.notification;

import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class WhatsAppTemplateRenderer {

	public String renderText(String template, Map<String, String> values) {
		String rendered = template;
		for (var entry : values.entrySet()) {
			rendered = rendered.replace("{{" + entry.getKey() + "}}", valueOrDash(entry.getValue()));
		}
		return rendered;
	}

	public List<String> resolveParameters(List<String> parameterNames, Map<String, String> values) {
		return parameterNames.stream().map(values::get).map(this::valueOrDash).toList();
	}

	private String valueOrDash(String value) {
		return value == null || value.isBlank() ? "-" : value;
	}
}
