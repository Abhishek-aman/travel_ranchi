import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { BookingContext, initialBookingState, type BookingState, type SelectedSeat } from './bookingContext'

export function BookingProvider({ children }: { children: ReactNode }) {
  const [booking, setBookingState] = useState<BookingState>(initialBookingState)

  const setBooking = useCallback((partial: Partial<BookingState> | ((b: BookingState) => BookingState)) => {
    setBookingState((b) => (typeof partial === 'function' ? partial(b) : { ...b, ...partial }))
  }, [])

  const toggleSeat = useCallback((seat: SelectedSeat) => {
    setBookingState((b) => {
      const has = b.selectedSeats.some((s) => s.tripSeatId === seat.tripSeatId)
      const selectedSeats = has
        ? b.selectedSeats.filter((s) => s.tripSeatId !== seat.tripSeatId)
        : [...b.selectedSeats, seat]
      return { ...b, selectedSeats }
    })
  }, [])

  const clearSeats = useCallback(() => {
    setBookingState((b) => ({ ...b, selectedSeats: [] }))
  }, [])

  const reset = useCallback(() => setBookingState(initialBookingState), [])

  const value = useMemo(
    () => ({
      booking,
      setBooking,
      toggleSeat,
      clearSeats,
      reset,
    }),
    [booking, setBooking, toggleSeat, clearSeats, reset],
  )

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
}
