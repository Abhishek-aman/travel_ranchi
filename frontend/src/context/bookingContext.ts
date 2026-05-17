import { createContext } from 'react'

export interface SelectedSeat {
  tripSeatId: number
  label: string
}

export interface BookingState {
  tripId: number | null
  routeId: number | null
  origin: string
  destination: string
  tripDate: string
  departureAt: string | null
  tripStatus: string | null
  selectedSeats: SelectedSeat[]
  /** Contact for account / receipts (customer) */
  contactEmail: string
  bookingReference: string | null
  bookingStatus: string | null
  paymentStatus: string | null
}

export const initialBookingState: BookingState = {
  tripId: null,
  routeId: null,
  origin: '',
  destination: '',
  tripDate: '',
  departureAt: null,
  tripStatus: null,
  selectedSeats: [],
  contactEmail: '',
  bookingReference: null,
  bookingStatus: null,
  paymentStatus: null,
}

export const BookingContext = createContext<{
  booking: BookingState
  setBooking: (partial: Partial<BookingState> | ((b: BookingState) => BookingState)) => void
  toggleSeat: (seat: SelectedSeat) => void
  clearSeats: () => void
  reset: () => void
} | null>(null)
