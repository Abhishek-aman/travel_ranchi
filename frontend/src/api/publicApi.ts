import { apiJson } from './http'
import type {
  BulkBookingRequestPayload,
  BulkRequestCreated,
  RouteDto,
  TripDto,
  TripSeatDto,
} from './types'

export function searchRoutes(origin: string, destination: string) {
  const q = new URLSearchParams({ origin, destination })
  return apiJson<RouteDto[]>(`/api/public/routes/search?${q.toString()}`)
}

export function listTripsForRoute(routeId: number, date: string) {
  const q = new URLSearchParams({ date })
  return apiJson<TripDto[]>(`/api/public/routes/${routeId}/trips?${q.toString()}`)
}

export function listTripSeats(tripId: number) {
  return apiJson<TripSeatDto[]>(`/api/public/trips/${tripId}/seats`)
}

export function submitBulkBookingRequest(body: BulkBookingRequestPayload) {
  return apiJson<BulkRequestCreated>('/api/public/bulk-booking-requests', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
