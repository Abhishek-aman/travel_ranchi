package com.example.bus_booking.repository;

import com.example.bus_booking.domain.BulkBookingRequest;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BulkBookingRequestRepository extends JpaRepository<BulkBookingRequest, Long> {
}
