package com.example.bus_booking.repository;

import com.example.bus_booking.domain.Booking;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingRepository extends JpaRepository<Booking, Long> {
	Optional<Booking> findByBookingReference(String bookingReference);
}
