package com.example.bus_booking.repository;

import com.example.bus_booking.domain.Route;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RouteRepository extends JpaRepository<Route, Long> {

	@Query("SELECT r FROM Route r WHERE LOWER(r.originCity) LIKE LOWER(CONCAT('%', :origin, '%')) "
			+ "AND LOWER(r.destinationCity) LIKE LOWER(CONCAT('%', :dest, '%'))")
	List<Route> search(@Param("origin") String origin, @Param("dest") String destination);
}
