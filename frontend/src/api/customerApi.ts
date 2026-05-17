import { apiBlob, apiJson } from './http'
import type { CreateBookingRequest, CreateBookingResponse, PaymentRequest } from './types'

export function createBooking(accessToken: string, body: CreateBookingRequest) {
  return apiJson<CreateBookingResponse>('/api/customer/bookings', {
    method: 'POST',
    accessToken,
    body: JSON.stringify(body),
  })
}

export function confirmPayment(accessToken: string, bookingReference: string, body: PaymentRequest) {
  return apiJson<CreateBookingResponse>(
    `/api/customer/bookings/${encodeURIComponent(bookingReference)}/payment`,
    {
      method: 'POST',
      accessToken,
      body: JSON.stringify(body),
    },
  )
}

export function downloadCustomerTicketPdf(accessToken: string, bookingReference: string) {
  return apiBlob(
    `/api/customer/bookings/${encodeURIComponent(bookingReference)}/ticket.pdf`,
    accessToken,
  )
}
