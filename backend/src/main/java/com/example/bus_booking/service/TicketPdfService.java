package com.example.bus_booking.service;

import com.example.bus_booking.domain.Booking;
import com.example.bus_booking.domain.Passenger;
import com.lowagie.text.Document;
import com.lowagie.text.Image;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.util.List;
import javax.imageio.ImageIO;
import org.springframework.stereotype.Service;

@Service
public class TicketPdfService {

	private final QrCodeService qrCodeService;

	public TicketPdfService(QrCodeService qrCodeService) {
		this.qrCodeService = qrCodeService;
	}

	public byte[] buildTicketPdf(Booking booking, List<Passenger> passengers) {
		try {
			ByteArrayOutputStream out = new ByteArrayOutputStream();
			Document doc = new Document();
			PdfWriter.getInstance(doc, out);
			doc.open();
			doc.add(new Paragraph("Bus Ticket — " + booking.getBookingReference()));
			doc.add(new Paragraph("Route: " + booking.getTrip().getRoute().getOriginCity() + " → "
					+ booking.getTrip().getRoute().getDestinationCity()));
			doc.add(new Paragraph("Trip date: " + booking.getTrip().getTripDate()));
			doc.add(new Paragraph("Departure: " + booking.getTrip().getDepartureAt()));
			for (Passenger p : passengers) {
				doc.add(new Paragraph("Passenger: " + p.getFullName() + " | Seat: " + p.getTripSeat().getSeatLabel()));
				String payload = p.getVerificationToken();
				BufferedImage qr = qrCodeService.encodePng(payload, 160);
				ByteArrayOutputStream png = new ByteArrayOutputStream();
				ImageIO.write(qr, "png", png);
				Image img = Image.getInstance(png.toByteArray());
				doc.add(img);
			}
			doc.close();
			return out.toByteArray();
		} catch (Exception e) {
			throw new IllegalStateException("PDF generation failed", e);
		}
	}
}
