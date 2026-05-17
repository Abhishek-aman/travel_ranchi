import { apiBlob, apiJson } from './http'
import type { CreateBookingRequest, CreateBookingResponse, PassengerVerifyDto, AgentWalletDto } from './types'

export function getAgentWallet(accessToken: string) {
  return apiJson<AgentWalletDto>('/api/agent/wallet', { accessToken })
}

export function createAgentBooking(accessToken: string, body: CreateBookingRequest) {
  return apiJson<CreateBookingResponse>('/api/agent/bookings', {
    method: 'POST',
    accessToken,
    body: JSON.stringify(body),
  })
}

export function verifyQr(accessToken: string, tripId: number, qrToken: string) {
  return apiJson<PassengerVerifyDto>(`/api/agent/trips/${tripId}/verify/qr`, {
    method: 'POST',
    accessToken,
    body: JSON.stringify({ qrToken }),
  })
}

export function verifyReference(accessToken: string, tripId: number, bookingReference: string) {
  return apiJson<PassengerVerifyDto>(`/api/agent/trips/${tripId}/verify/reference`, {
    method: 'POST',
    accessToken,
    body: JSON.stringify({ bookingReference }),
  })
}

export function verifyPhone(accessToken: string, tripId: number, bookingReference: string, phone: string) {
  return apiJson<PassengerVerifyDto>(`/api/agent/trips/${tripId}/verify/phone`, {
    method: 'POST',
    accessToken,
    body: JSON.stringify({ bookingReference, phone }),
  })
}

export function markNoShow(accessToken: string, passengerId: number) {
  return apiJson<PassengerVerifyDto>(`/api/agent/passengers/${passengerId}/no-show`, {
    method: 'PATCH',
    accessToken,
  })
}

export function markOffboard(accessToken: string, passengerId: number) {
  return apiJson<PassengerVerifyDto>(`/api/agent/passengers/${passengerId}/offboard`, {
    method: 'PATCH',
    accessToken,
  })
}

export function getTripManifest(accessToken: string, tripId: number) {
  return apiJson<PassengerVerifyDto[]>(`/api/agent/trips/${tripId}/manifest`, {
    accessToken,
  })
}

export function downloadAgentTicketPdf(accessToken: string, bookingReference: string) {
  return apiBlob(`/api/agent/bookings/${encodeURIComponent(bookingReference)}/ticket.pdf`, accessToken)
}
