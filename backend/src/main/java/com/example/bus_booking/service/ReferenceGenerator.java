package com.example.bus_booking.service;

import java.security.SecureRandom;
import org.springframework.stereotype.Component;

@Component
public class ReferenceGenerator {

	private static final String ALPHANUM = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
	private final SecureRandom random = new SecureRandom();

	public String bookingReference() {
		return "BK-" + randomString(8);
	}

	public String verificationToken() {
		return randomString(32) + randomString(32);
	}

	private String randomString(int len) {
		StringBuilder sb = new StringBuilder(len);
		for (int i = 0; i < len; i++) {
			sb.append(ALPHANUM.charAt(random.nextInt(ALPHANUM.length())));
		}
		return sb.toString();
	}
}
