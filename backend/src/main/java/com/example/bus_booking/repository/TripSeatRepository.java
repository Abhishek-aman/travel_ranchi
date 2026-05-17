package com.example.bus_booking.repository;

import com.example.bus_booking.domain.TripSeat;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import jakarta.persistence.LockModeType;

public interface TripSeatRepository extends JpaRepository<TripSeat, Long> {

	List<TripSeat> findByTripIdOrderBySeatLabel(Long tripId);

	@Lock(LockModeType.PESSIMISTIC_WRITE)
	List<TripSeat> findAllByIdIn(Collection<Long> ids);

	Optional<TripSeat> findByTripIdAndSeatLabel(Long tripId, String seatLabel);

	List<TripSeat> findByBooking_Id(Long bookingId);
}
