import { apiJson } from './http'
import type { AdminBulkDto, AdminBusDto, BusType, BusAgentReportRow, ReportsSummary } from './types'

export interface CreateRoutePayload {
  operatorCode: string
  origin: string
  destination: string
  distanceKm: number
  departureTime: string
}

export interface CreateLayoutPayload {
  name: string
  busType: BusType
  layoutJson: string
}

export interface CreateBusPayload {
  operatorCode: string
  registrationNumber: string
  busType: BusType
  layoutTemplateId: number
}

export interface CreateTripPayload {
  routeId: number
  busId: number
  tripDate: string
  departureAt: string
  arrivalAt: string
}

/** Response shape varies by backend; id is used when present. */
export type CreateRouteResponse = { id?: number } & Record<string, unknown>

export function createRoute(accessToken: string, body: CreateRoutePayload) {
  return apiJson<CreateRouteResponse>('/api/admin/routes', {
    method: 'POST',
    accessToken,
    body: JSON.stringify(body),
  })
}

export function createLayout(accessToken: string, body: CreateLayoutPayload) {
  return apiJson<{ id: number; name: string; busType: BusType }>('/api/admin/layouts', {
    method: 'POST',
    accessToken,
    body: JSON.stringify(body),
  })
}

export function createBus(accessToken: string, body: CreateBusPayload) {
  return apiJson<{ id: number; registrationNumber: string }>('/api/admin/buses', {
    method: 'POST',
    accessToken,
    body: JSON.stringify(body),
  })
}

function mapBusRow(x: unknown): AdminBusDto | null {
  if (!x || typeof x !== 'object') return null
  const o = x as Record<string, unknown>
  const id = Number(o.id)
  const reg = o.registrationNumber ?? o.registration_number
  if (!Number.isFinite(id) || typeof reg !== 'string') return null
  const bt = o.busType ?? o.bus_type
  const lt = o.layoutTemplateId ?? o.layout_template_id
  return {
    id,
    registrationNumber: reg,
    operatorCode:
      typeof o.operatorCode === 'string'
        ? o.operatorCode
        : typeof o.operator_code === 'string'
          ? o.operator_code
          : undefined,
    busType: typeof bt === 'string' ? (bt as BusType) : undefined,
    layoutTemplateId: typeof lt === 'number' && Number.isFinite(lt) ? lt : undefined,
  }
}

/** Lists registered vehicles (expects GET /api/admin/buses). */
export async function listBuses(accessToken: string): Promise<AdminBusDto[]> {
  const raw = await apiJson<unknown>('/api/admin/buses', { accessToken })
  if (!Array.isArray(raw)) return []
  return raw.map(mapBusRow).filter((row): row is AdminBusDto => row != null)
}

export function createTrip(accessToken: string, body: CreateTripPayload) {
  return apiJson<unknown>('/api/admin/trips', {
    method: 'POST',
    accessToken,
    body: JSON.stringify(body),
  })
}

export function blockSeat(accessToken: string, tripId: number, seatLabel: string, reason: string) {
  return apiJson<void>(`/api/admin/trips/${tripId}/seats/block`, {
    method: 'POST',
    accessToken,
    body: JSON.stringify({ seatLabel, reason }),
  })
}

export function unblockSeat(accessToken: string, tripId: number, seatLabel: string) {
  return apiJson<void>(`/api/admin/trips/${tripId}/seats/unblock`, {
    method: 'POST',
    accessToken,
    body: JSON.stringify({ seatLabel }),
  })
}

export function cancelBookingAdmin(accessToken: string, bookingReference: string) {
  return apiJson<{ bookingReference: string; status: string }>(
    `/api/admin/bookings/${encodeURIComponent(bookingReference)}/cancel`,
    { method: 'POST', accessToken },
  )
}

export function refundBooking(accessToken: string, bookingReference: string) {
  return apiJson<unknown>(`/api/admin/bookings/${encodeURIComponent(bookingReference)}/refund`, {
    method: 'POST',
    accessToken,
  })
}

export function listBulkRequests(accessToken: string) {
  return apiJson<AdminBulkDto[]>('/api/admin/bulk-requests', { accessToken })
}

export function approveBulkRequest(accessToken: string, id: number, paymentLinkUrl: string) {
  return apiJson<AdminBulkDto>(`/api/admin/bulk-requests/${id}/approve`, {
    method: 'POST',
    accessToken,
    body: JSON.stringify({ paymentLinkUrl }),
  })
}

export function rejectBulkRequest(accessToken: string, id: number) {
  return apiJson<AdminBulkDto>(`/api/admin/bulk-requests/${id}/reject`, {
    method: 'POST',
    accessToken,
  })
}

export function getReportsSummary(accessToken: string) {
  return apiJson<ReportsSummary>('/api/admin/reports/summary', { accessToken })
}

function mapBusAgentRow(x: unknown): BusAgentReportRow | null {
  if (!x || typeof x !== 'object') return null
  const o = x as Record<string, unknown>
  const busId = Number(o.busId ?? o.bus_id)
  const agentId = Number(o.agentId ?? o.agent_id)
  const bookingsCount = Number(o.bookingsCount ?? o.bookings_count ?? 0)
  const grossRevenue = Number(o.grossRevenue ?? o.gross_revenue ?? 0)
  const busRegistration = String(o.busRegistration ?? o.bus_registration ?? '')
  const agentLabel = String(o.agentLabel ?? o.agent_label ?? o.agentEmail ?? o.agent_email ?? '')
  if (!Number.isFinite(busId) || !Number.isFinite(agentId)) return null
  return { busId, busRegistration, agentId, agentLabel, bookingsCount, grossRevenue }
}

/** Lists per-bus, per-agent booking stats when the backend exposes them. */
export async function getReportsByBusAndAgent(accessToken: string): Promise<BusAgentReportRow[]> {
  const raw = await apiJson<unknown>('/api/admin/reports/by-bus-agent', { accessToken })
  if (!Array.isArray(raw)) return []
  return raw.map(mapBusAgentRow).filter((row): row is BusAgentReportRow => row != null)
}
