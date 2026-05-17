package com.example.bus_booking.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import java.awt.image.BufferedImage;
import org.springframework.stereotype.Service;

@Service
public class QrCodeService {

	public BufferedImage encodePng(String payload, int size) {
		try {
			QRCodeWriter writer = new QRCodeWriter();
			BitMatrix matrix = writer.encode(payload, BarcodeFormat.QR_CODE, size, size);
			return MatrixToImageWriter.toBufferedImage(matrix);
		} catch (Exception e) {
			throw new IllegalStateException("QR generation failed", e);
		}
	}
}
