package com.example.bus_booking.service;

import com.example.bus_booking.domain.AppUser;
import com.example.bus_booking.domain.UserRole;
import com.example.bus_booking.repository.AppUserRepository;
import com.example.bus_booking.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

	private final AppUserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtService jwtService;
	private final AuthenticationManager authenticationManager;

	public AuthService(AppUserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService,
			AuthenticationManager authenticationManager) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.jwtService = jwtService;
		this.authenticationManager = authenticationManager;
	}

	@Transactional
	public AppUser registerCustomer(String email, String password, String phone) {
		if (userRepository.findByEmail(email).isPresent()) {
			throw new IllegalArgumentException("Email already registered");
		}
		AppUser u = AppUser.builder()
				.email(email)
				.passwordHash(passwordEncoder.encode(password))
				.phone(phone)
				.role(UserRole.CUSTOMER)
				.enabled(true)
				.build();
		return userRepository.save(u);
	}

	public String login(String email, String password) {
		authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, password));
		AppUser user = userRepository.findByEmail(email).orElseThrow();
		return jwtService.generateToken(user.getEmail(), user.getRole().name(), user.getId());
	}
}
