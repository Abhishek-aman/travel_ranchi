package com.example.bus_booking.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

	@Bean
	public OpenAPI busBookingOpenApi() {
		final String scheme = "bearerAuth";
		return new OpenAPI()
				.info(new Info()
						.title("Bus Booking API")
						.version("1.0")
						.description("""
								REST API for private fleet bus ticketing: routes, trips, inventory, \
								online/agent bookings, ticket PDF/QR, verification, boarding, bulk requests, admin. \
								Authenticate via POST /api/auth/login or /api/auth/register, then send the JWT as: \
								Authorization: Bearer <token>. \
								Role required: CUSTOMER (customer APIs), AGENT (agent APIs), ADMIN (admin APIs)."""))
				.externalDocs(new ExternalDocumentation()
						.description("OpenAPI JSON document")
						.url("/v3/api-docs"))
				.components(new Components().addSecuritySchemes(scheme,
						new SecurityScheme()
								.name(scheme)
								.type(SecurityScheme.Type.HTTP)
								.scheme("bearer")
								.bearerFormat("JWT")
								.description("JWT from /api/auth/login or /api/auth/register")));
	}
}
