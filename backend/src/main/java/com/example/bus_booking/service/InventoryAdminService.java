package com.example.bus_booking.service;

import com.example.bus_booking.domain.SeatInventoryStatus;
import com.example.bus_booking.domain.TripSeat;
import com.example.bus_booking.repository.TripSeatRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InventoryAdminService {

	private final TripSeatRepository tripSeatRepository;

	public InventoryAdminService(TripSeatRepository tripSeatRepository) {
		this.tripSeatRepository = tripSeatRepository;
	}

	@Transactional
	public TripSeat blockSeat(Long tripId, String seatLabel, String reason) {
		TripSeat ts = tripSeatRepository.findByTripIdAndSeatLabel(tripId, seatLabel)
				.orElseThrow(() -> new IllegalArgumentException("Seat not found"));
		if (ts.getStatus() != SeatInventoryStatus.AVAILABLE) {
			throw new IllegalStateException("Can only block available seats");
		}
		ts.setStatus(SeatInventoryStatus.BLOCKED);
		ts.setBlockReason(reason);
		return tripSeatRepository.save(ts);
	}

	@Transactional
	public TripSeat unblockSeat(Long tripId, String seatLabel) {
		TripSeat ts = tripSeatRepository.findByTripIdAndSeatLabel(tripId, seatLabel)
				.orElseThrow(() -> new IllegalArgumentException("Seat not found"));
		if (ts.getStatus() != SeatInventoryStatus.BLOCKED) {
			throw new IllegalStateException("Seat is not blocked");
		}
		ts.setStatus(SeatInventoryStatus.AVAILABLE);
		ts.setBlockReason(null);
		return tripSeatRepository.save(ts);
	}
}
