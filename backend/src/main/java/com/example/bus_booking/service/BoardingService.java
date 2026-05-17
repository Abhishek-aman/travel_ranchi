package com.example.bus_booking.service;

import com.example.bus_booking.domain.BoardingStatus;
import com.example.bus_booking.domain.Passenger;
import com.example.bus_booking.repository.PassengerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BoardingService {

	private final PassengerRepository passengerRepository;

	public BoardingService(PassengerRepository passengerRepository) {
		this.passengerRepository = passengerRepository;
	}

	@Transactional
	public Passenger markNoShow(Long passengerId) {
		Passenger p = passengerRepository.findById(passengerId)
				.orElseThrow(() -> new IllegalArgumentException("Passenger not found"));
		p.setBoardingStatus(BoardingStatus.NO_SHOW);
		return passengerRepository.save(p);
	}

	@Transactional
	public Passenger markOffboarded(Long passengerId) {
		Passenger p = passengerRepository.findById(passengerId)
				.orElseThrow(() -> new IllegalArgumentException("Passenger not found"));
		p.setBoardingStatus(BoardingStatus.OFFBOARDED);
		return passengerRepository.save(p);
	}
}
