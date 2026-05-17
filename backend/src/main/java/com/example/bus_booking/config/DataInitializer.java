package com.example.bus_booking.config;

import com.example.bus_booking.domain.AppUser;
import com.example.bus_booking.domain.Bus;
import com.example.bus_booking.domain.BusType;
import com.example.bus_booking.domain.Operator;
import com.example.bus_booking.domain.Route;
import com.example.bus_booking.domain.SeatLayoutTemplate;
import com.example.bus_booking.domain.UserRole;
import com.example.bus_booking.repository.AppUserRepository;
import com.example.bus_booking.repository.BusRepository;
import com.example.bus_booking.repository.OperatorRepository;
import com.example.bus_booking.repository.RouteRepository;
import com.example.bus_booking.repository.SeatLayoutTemplateRepository;
import com.example.bus_booking.service.TripService;
import java.time.LocalDate;
import java.time.ZoneId;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

	@Bean
	CommandLineRunner seed(OperatorRepository operatorRepository, SeatLayoutTemplateRepository layoutRepository,
			BusRepository busRepository, RouteRepository routeRepository, AppUserRepository userRepository,
			PasswordEncoder passwordEncoder, TripService tripService) {
		return args -> {
			if (operatorRepository.count() > 0) {
				return;
			}
			Operator op = operatorRepository.save(Operator.builder().name("Demo Fleet").code("DEMO").build());

			String layoutJson = """
					{"seats":[
					{"label":"A1","row":1,"col":1},{"label":"A2","row":1,"col":2},
					{"label":"B1","row":2,"col":1},{"label":"B2","row":2,"col":2},
					{"label":"C1","row":3,"col":1},{"label":"C2","row":3,"col":2},
					{"label":"D1","row":4,"col":1},{"label":"D2","row":4,"col":2}
					]}""";
			SeatLayoutTemplate layout = layoutRepository.save(SeatLayoutTemplate.builder()
					.name("Standard 2x2")
					.busType(BusType.SEATER_2X2)
					.layoutJson(layoutJson)
					.build());

			Bus bus = busRepository.save(Bus.builder()
					.operator(op)
					.registrationNumber("MH-01-AB-1234")
					.busType(BusType.SEATER_2X2)
					.seatLayoutTemplate(layout)
					.build());

			Route route = routeRepository.save(Route.builder()
					.operator(op)
					.originCity("Mumbai")
					.destinationCity("Pune")
					.distanceKm(150)
					.departureTime("08:00")
					.build());

			userRepository.save(AppUser.builder()
					.email("admin@demo.local")
					.passwordHash(passwordEncoder.encode("admin123"))
					.phone("+910000000001")
					.role(UserRole.ADMIN)
					.operator(op)
					.enabled(true)
					.build());

			userRepository.save(AppUser.builder()
					.email("agent@demo.local")
					.passwordHash(passwordEncoder.encode("agent123"))
					.phone("+910000000002")
					.role(UserRole.AGENT)
					.agentCode("AG001")
					.operator(op)
					.enabled(true)
					.build());

			LocalDate tomorrow = LocalDate.now().plusDays(1);
			var zone = ZoneId.systemDefault();
			var dep = TripService.departureInstant(tomorrow, route.getDepartureTime(), zone);
			tripService.createTrip(route.getId(), bus.getId(), tomorrow, dep, dep.plusSeconds(4 * 3600));
		};
	}
}
