package com.example.bus_booking.web;

import com.example.bus_booking.service.AuthService;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

	private final AuthService authService;

	public AuthController(AuthService authService) {
		this.authService = authService;
	}

	public record LoginRequest(@NotBlank @Email String email, @NotBlank String password) {
	}

	public record TokenResponse(String accessToken) {
	}

	public record RegisterRequest(@NotBlank @Email String email, @NotBlank String password, @NotBlank String phone) {
	}

	@PostMapping("/login")
	public TokenResponse login(@RequestBody LoginRequest req) {
		String token = authService.login(req.email(), req.password());
		return new TokenResponse(token);
	}

	@PostMapping("/register")
	public ResponseEntity<TokenResponse> register(@RequestBody RegisterRequest req) {
		var user = authService.registerCustomer(req.email(), req.password(), req.phone());
		String token = authService.login(req.email(), req.password());
		return ResponseEntity.ok(new TokenResponse(token));
	}
}
