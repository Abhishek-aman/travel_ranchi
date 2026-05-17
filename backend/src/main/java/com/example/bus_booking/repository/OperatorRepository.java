package com.example.bus_booking.repository;

import com.example.bus_booking.domain.Operator;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OperatorRepository extends JpaRepository<Operator, Long> {
	Optional<Operator> findByCode(String code);
}
