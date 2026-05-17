package com.example.bus_booking.repository;

import com.example.bus_booking.domain.AppUser;
import com.example.bus_booking.domain.UserRole;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {
	Optional<AppUser> findByEmail(String email);

	Optional<AppUser> findByEmailIgnoreCase(String email);

	Optional<AppUser> findByAgentCode(String agentCode);

	List<AppUser> findByRole(UserRole role);
}
