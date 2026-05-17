package com.example.bus_booking.repository;

import com.example.bus_booking.domain.Trip;
import com.example.bus_booking.domain.TripStatus;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TripRepository extends JpaRepository<Trip, Long> {

	List<Trip> findByRouteIdAndTripDate(Long routeId, LocalDate tripDate);

	@Query("SELECT t FROM Trip t JOIN t.route r WHERE r.id = :routeId AND t.tripDate = :date AND t.status <> :cancelled")
	List<Trip> findActiveByRouteAndDate(@Param("routeId") Long routeId, @Param("date") LocalDate date,
			@Param("cancelled") TripStatus cancelled);

	Optional<Trip> findByIdAndRouteId(Long tripId, Long routeId);
}
