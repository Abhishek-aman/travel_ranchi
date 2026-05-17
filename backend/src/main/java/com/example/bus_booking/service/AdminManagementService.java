package com.example.bus_booking.service;

import com.example.bus_booking.domain.Bus;
import com.example.bus_booking.domain.BusType;
import com.example.bus_booking.domain.Operator;
import com.example.bus_booking.domain.Route;
import com.example.bus_booking.domain.SeatLayoutTemplate;
import com.example.bus_booking.domain.Trip;
import com.example.bus_booking.repository.BusRepository;
import com.example.bus_booking.repository.OperatorRepository;
import com.example.bus_booking.repository.RouteRepository;
import com.example.bus_booking.repository.SeatLayoutTemplateRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminManagementService {

	private final OperatorRepository operatorRepository;
	private final RouteRepository routeRepository;
	private final SeatLayoutTemplateRepository seatLayoutTemplateRepository;
	private final BusRepository busRepository;
	private final TripService tripService;

	public AdminManagementService(OperatorRepository operatorRepository, RouteRepository routeRepository,
			SeatLayoutTemplateRepository seatLayoutTemplateRepository, BusRepository busRepository,
			TripService tripService) {
		this.operatorRepository = operatorRepository;
		this.routeRepository = routeRepository;
		this.seatLayoutTemplateRepository = seatLayoutTemplateRepository;
		this.busRepository = busRepository;
		this.tripService = tripService;
	}

	@Transactional
	public Route createRoute(String operatorCode, String origin, String destination, Integer distanceKm,
			String departureTime) {
		Operator op = operatorRepository.findByCode(operatorCode)
				.orElseThrow(() -> new IllegalArgumentException("Operator not found"));
		return routeRepository.save(Route.builder()
				.operator(op)
				.originCity(origin)
				.destinationCity(destination)
				.distanceKm(distanceKm)
				.departureTime(departureTime)
				.build());
	}

	@Transactional
	public SeatLayoutTemplate createLayout(String name, BusType busType, String layoutJson) {
		return seatLayoutTemplateRepository.save(SeatLayoutTemplate.builder()
				.name(name)
				.busType(busType)
				.layoutJson(layoutJson)
				.build());
	}

	@Transactional
	public Bus createBus(String operatorCode, String registrationNumber, BusType busType, Long layoutTemplateId) {
		Operator op = operatorRepository.findByCode(operatorCode)
				.orElseThrow(() -> new IllegalArgumentException("Operator not found"));
		SeatLayoutTemplate layout = seatLayoutTemplateRepository.findById(layoutTemplateId)
				.orElseThrow(() -> new IllegalArgumentException("Layout not found"));
		return busRepository.save(Bus.builder()
				.operator(op)
				.registrationNumber(registrationNumber)
				.busType(busType)
				.seatLayoutTemplate(layout)
				.build());
	}

	@Transactional(readOnly = true)
	public List<BusListItem> listBuses() {
		return busRepository.findAll().stream()
				.map(b -> new BusListItem(b.getId(), b.getOperator().getCode(), b.getRegistrationNumber(),
						b.getBusType(), b.getSeatLayoutTemplate().getId()))
				.toList();
	}

	public record BusListItem(Long id, String operatorCode, String registrationNumber, BusType busType,
			Long layoutTemplateId) {
	}

	@Transactional
	public Trip createTrip(Long routeId, Long busId, java.time.LocalDate tripDate, java.time.Instant departureAt,
			java.time.Instant arrivalAt) {
		return tripService.createTrip(routeId, busId, tripDate, departureAt, arrivalAt);
	}
}
