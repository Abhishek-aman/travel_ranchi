package com.example.bus_booking.security;

import com.example.bus_booking.repository.AppUserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.http.HttpHeaders;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

	private final JwtService jwtService;
	private final AppUserRepository userRepository;

	public JwtAuthenticationFilter(JwtService jwtService, AppUserRepository userRepository) {
		this.jwtService = jwtService;
		this.userRepository = userRepository;
	}

	@Override
	protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response,
			@NonNull FilterChain filterChain) throws ServletException, IOException {
		final String auth = request.getHeader(HttpHeaders.AUTHORIZATION);
		if (auth == null || !auth.startsWith("Bearer ")) {
			filterChain.doFilter(request, response);
			return;
		}
		final String jwt = auth.substring(7);
		try {
			final String email = jwtService.extractUsername(jwt);
			if (email != null) {
				// Always apply a valid Bearer token for this request. Do not skip when
				// SecurityContext already has an Authentication (e.g. anonymous or stale),
				// or JWT is ignored and @PreAuthorize sees the wrong principal → 403.
				userRepository.findByEmailIgnoreCase(email.trim()).ifPresent(user -> {
					if (jwtService.isTokenValid(jwt, user.getEmail())) {
						var principal = new SecurityUser(user);
						var authToken = new UsernamePasswordAuthenticationToken(principal, null,
								principal.getAuthorities());
						authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
						SecurityContextHolder.getContext().setAuthentication(authToken);
					}
				});
			}
		} catch (Exception ignored) {
			// invalid token — leave unauthenticated
		}
		filterChain.doFilter(request, response);
	}
}
