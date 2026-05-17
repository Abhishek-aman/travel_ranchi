package com.example.bus_booking.security;

import com.example.bus_booking.config.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Date;
import java.util.function.Function;
import javax.crypto.SecretKey;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

	private final JwtProperties props;

	public JwtService(JwtProperties props) {
		this.props = props;
	}

	public String extractUsername(String token) {
		return extractClaim(token, Claims::getSubject);
	}

	public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
		final Claims claims = extractAllClaims(token);
		return claimsResolver.apply(claims);
	}

	public String generateToken(String subject, String role, Long userId) {
		Date now = new Date();
		Date expiry = new Date(now.getTime() + props.expirationMs());
		return Jwts.builder()
				.subject(subject)
				.claim("role", role)
				.claim("uid", userId)
				.issuedAt(now)
				.expiration(expiry)
				.signWith(signingKey())
				.compact();
	}

	public boolean isTokenValid(String token, String expectedEmail) {
		final String email = extractUsername(token);
		if (email == null || expectedEmail == null) {
			return false;
		}
		return email.trim().equalsIgnoreCase(expectedEmail.trim()) && !isTokenExpired(token);
	}

	private boolean isTokenExpired(String token) {
		return extractExpiration(token).before(new Date());
	}

	private Date extractExpiration(String token) {
		return extractClaim(token, Claims::getExpiration);
	}

	private Claims extractAllClaims(String token) {
		return Jwts.parser()
				.verifyWith(signingKey())
				.build()
				.parseSignedClaims(token)
				.getPayload();
	}

	private SecretKey signingKey() {
		byte[] keyBytes = props.secret().getBytes(StandardCharsets.UTF_8);
		if (keyBytes.length < 32) {
			keyBytes = Arrays.copyOf(keyBytes, 32);
		}
		return Keys.hmacShaKeyFor(keyBytes);
	}
}
