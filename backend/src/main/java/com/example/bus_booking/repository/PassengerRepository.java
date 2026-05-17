package com.example.bus_booking.repository;

import com.example.bus_booking.domain.Passenger;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PassengerRepository extends JpaRepository<Passenger, Long> {

	Optional<Passenger> findByVerificationToken(String token);

	Optional<Passenger> findByBooking_BookingReferenceAndPhone(String bookingRef, String phone);

	List<Passenger> findByBooking_Trip_Id(Long tripId);

	List<Passenger> findByBooking_BookingReferenceAndBooking_Trip_Id(String bookingReference, Long tripId);

	List<Passenger> findByBooking_Id(Long bookingId);
}
