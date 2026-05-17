package com.example.bus_booking.security;

import com.example.bus_booking.domain.AppUser;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {

	private SecurityUtils() {
	}

	public static AppUser currentUser() {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		if (auth == null || !(auth.getPrincipal() instanceof SecurityUser su)) {
			throw new IllegalStateException("Not authenticated");
		}
		return su.getAppUser();
	}
}
