package com.example.bus_booking.service;

import com.example.bus_booking.domain.BulkBookingRequest;
import com.example.bus_booking.domain.BulkRequestStatus;
import com.example.bus_booking.domain.Route;
import com.example.bus_booking.repository.BulkBookingRequestRepository;
import com.example.bus_booking.repository.RouteRepository;
import java.time.LocalDate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BulkBookingService {

	private final BulkBookingRequestRepository bulkBookingRequestRepository;
	private final RouteRepository routeRepository;

	public BulkBookingService(BulkBookingRequestRepository bulkBookingRequestRepository,
			RouteRepository routeRepository) {
		this.bulkBookingRequestRepository = bulkBookingRequestRepository;
		this.routeRepository = routeRepository;
	}

	@Transactional
	public BulkBookingRequest submit(String requesterName, String email, String phone, Long routeId,
			LocalDate tripDate, int requestedSeats, String notes) {
		Route route = routeRepository.findById(routeId).orElseThrow(() -> new IllegalArgumentException("Route not found"));
		BulkBookingRequest req = BulkBookingRequest.builder()
				.requesterName(requesterName)
				.email(email)
				.phone(phone)
				.route(route)
				.tripDate(tripDate)
				.requestedSeats(requestedSeats)
				.status(BulkRequestStatus.PENDING)
				.notes(notes)
				.build();
		return bulkBookingRequestRepository.save(req);
	}

	@Transactional
	public BulkBookingRequest approve(Long id, String paymentLinkUrl) {
		BulkBookingRequest r = bulkBookingRequestRepository.findById(id)
				.orElseThrow(() -> new IllegalArgumentException("Request not found"));
		r.setStatus(BulkRequestStatus.APPROVED);
		r.setPaymentLinkUrl(paymentLinkUrl);
		return bulkBookingRequestRepository.save(r);
	}

	@Transactional
	public BulkBookingRequest reject(Long id) {
		BulkBookingRequest r = bulkBookingRequestRepository.findById(id)
				.orElseThrow(() -> new IllegalArgumentException("Request not found"));
		r.setStatus(BulkRequestStatus.REJECTED);
		return bulkBookingRequestRepository.save(r);
	}
}
