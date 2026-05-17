package com.example.bus_booking.service;

import com.example.bus_booking.domain.SeatLayoutTemplate;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class SeatLayoutParser {

	private final ObjectMapper objectMapper;

	public SeatLayoutParser(ObjectMapper objectMapper) {
		this.objectMapper = objectMapper;
	}

	public List<ParsedSeat> parse(SeatLayoutTemplate template) {
		try {
			LayoutRoot root = objectMapper.readValue(template.getLayoutJson(), LayoutRoot.class);
			if (root.seats == null || root.seats.isEmpty()) {
				throw new IllegalArgumentException("Seat layout has no seats");
			}
			return root.seats.stream()
					.sorted(Comparator.comparing(s -> s.label))
					.map(s -> new ParsedSeat(s.label, s.row, s.col))
					.toList();
		} catch (JacksonException e) {
			throw new IllegalArgumentException("Invalid seat layout JSON", e);
		}
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	public static class LayoutRoot {
		public List<SeatDef> seats;
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	public static class SeatDef {
		public String label;
		public Integer row;
		public Integer col;
	}

	public record ParsedSeat(String label, Integer row, Integer col) {
	}
}
