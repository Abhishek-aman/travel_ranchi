export type TripStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
export type SeatInventoryStatus = 'AVAILABLE' | 'RESERVED' | 'BOOKED' | 'BLOCKED'
export type BookingStatus = 'PENDING_PAYMENT' | 'CONFIRMED' | 'CANCELLED' | 'REFUNDED'
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
export type BoardingStatus = 'NOT_BOARDED' | 'BOARDED' | 'NO_SHOW' | 'OFFBOARDED'
export type BulkRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID'
export type BusType = 'SEATER_2X2' | 'SEATER_2X3' | 'SLEEPER' | 'HYBRID'

/** GET /api/admin/buses — field names may vary slightly by backend */
export interface AdminBusDto {
  id: number
  registrationNumber: string
  operatorCode?: string
  busType?: BusType
  layoutTemplateId?: number
}

export interface RouteDto {
  id: number
  origin: string
  destination: string
  departureTime: string
  /** Present on some admin or detailed responses */
  distanceKm?: number
  operatorCode?: string
}

export interface TripDto {
  id: number
  routeId: number
  tripDate: string
  departureAt: string
  status: TripStatus
  /** When present, use for arrival / duration in UI */
  arrivalAt?: string
  busType?: BusType
  farePerSeat?: number
}

export interface TripSeatDto {
  id: number
  label: string
  status: SeatInventoryStatus
}

export interface LoginRequest {
  email: string
  password: string
}

/** Backend may use camelCase or snake_case — see extractAccessToken */
export interface AuthResponse {
  accessToken?: string
  access_token?: string
  token?: string
}

export interface RegisterRequest {
  email: string
  password: string
  phone: string
}

export interface CreateBookingRequest {
  tripId: number
  tripSeatIds: number[]
  passengers: { name: string; phone: string }[]
  totalAmount: number
}

export interface CreateBookingResponse {
  bookingReference: string
  status: BookingStatus
  paymentStatus: PaymentStatus
}

export interface PaymentRequest {
  paymentGatewayRef: string
}

export interface PassengerVerifyDto {
  id: number
  name: string
  seat: string
  boardingStatus: BoardingStatus
}

export interface BulkBookingRequestPayload {
  requesterName: string
  email: string
  phone: string
  routeId: number
  tripDate: string
  requestedSeats: number
  notes?: string
}

export interface BulkRequestCreated {
  id: number
  status: BulkRequestStatus
}

export interface AdminBulkDto {
  id: number
  status: BulkRequestStatus
  email: string
  seats: number
}

export interface ReportsSummary {
  totalBookings: number
}

/** GET /api/admin/reports/by-bus-agent — optional breakdown for operations. */
export interface BusAgentReportRow {
  busId: number
  busRegistration: string
  agentId: number
  agentLabel: string
  bookingsCount: number
  grossRevenue: number
}

export interface AgentWalletDto {
  balance: number
  currency: string
  pendingSettlement?: number
}
