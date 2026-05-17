import type { BusType } from '../api/types'

export interface LayoutSeat {
  label: string
  row: number
  col: number
}

export interface LayoutDocument {
  seats: LayoutSeat[]
}

/** Validate and parse layout JSON before saving a seat template */
export function parseLayoutDocument(json: string): LayoutDocument {
  let raw: unknown
  try {
    raw = JSON.parse(json)
  } catch {
    throw new Error('layoutJson is not valid JSON')
  }
  if (!raw || typeof raw !== 'object' || !Array.isArray((raw as LayoutDocument).seats)) {
    throw new Error('layoutJson must be an object with a "seats" array')
  }
  const seats = (raw as LayoutDocument).seats
  for (let i = 0; i < seats.length; i++) {
    const s = seats[i] as unknown as Record<string, unknown>
    if (typeof s.label !== 'string' || !s.label.trim()) {
      throw new Error(`seats[${i}]: "label" must be a non-empty string`)
    }
    if (typeof s.row !== 'number' || !Number.isFinite(s.row) || s.row < 1) {
      throw new Error(`seats[${i}]: "row" must be a positive number`)
    }
    if (typeof s.col !== 'number' || !Number.isFinite(s.col) || s.col < 1) {
      throw new Error(`seats[${i}]: "col" must be a positive number`)
    }
  }
  return raw as LayoutDocument
}

/**
 * Generates seat positions for common templates.
 * Rows use letter prefixes A..Z; cols encode physical position (aisle = gap in col indices).
 */
export function generateLayout(busType: BusType, rows: number): LayoutDocument {
  const r = Math.min(40, Math.max(1, Math.floor(rows)))
  switch (busType) {
    case 'SEATER_2X2':
      return seater2x2(r)
    case 'SEATER_2X3':
      return seater2x3(r)
    case 'SLEEPER':
      return sleeperBerths(r)
    case 'HYBRID':
      return seaterPlusSleeper(r)
    default:
      return minimalPair()
  }
}

function minimalPair(): LayoutDocument {
  return {
    seats: [
      { label: 'A1', row: 1, col: 1 },
      { label: 'A2', row: 1, col: 2 },
    ],
  }
}

function rowLetter(r: number): string {
  if (r >= 1 && r <= 26) return String.fromCharCode(64 + r)
  return `R${r}`
}

/** Four seats per row: two + aisle + two (cols 1,2 and 4,5). */
function seater2x2(rows: number): LayoutDocument {
  const seats: LayoutSeat[] = []
  for (let r = 1; r <= rows; r++) {
    const letter = rowLetter(r)
    seats.push({ label: `${letter}1`, row: r, col: 1 })
    seats.push({ label: `${letter}2`, row: r, col: 2 })
    seats.push({ label: `${letter}3`, row: r, col: 4 })
    seats.push({ label: `${letter}4`, row: r, col: 5 })
  }
  return { seats }
}

/** Six seats per row, no aisle in coordinates (dense grid). */
function seater2x3(rows: number): LayoutDocument {
  const seats: LayoutSeat[] = []
  for (let r = 1; r <= rows; r++) {
    const letter = rowLetter(r)
    for (let c = 1; c <= 6; c++) {
      seats.push({ label: `${letter}${c}`, row: r, col: c })
    }
  }
  return { seats }
}

/**
 * Front of coach: seater 2+2; rear: sleeper berths. Row count splits roughly half / half
 * (first block uses normal seater rows, remaining rows use L/U sleepers).
 */
function seaterPlusSleeper(totalRows: number): LayoutDocument {
  const r = Math.min(40, Math.max(1, Math.floor(totalRows)))
  if (r <= 1) return seater2x2(1)
  const seaterRows = Math.max(1, Math.floor(r / 2))
  const sleeperRows = r - seaterRows
  const seats: LayoutSeat[] = []
  seats.push(...seater2x2(seaterRows).seats)
  for (let row = seaterRows + 1; row <= seaterRows + sleeperRows; row++) {
    seats.push({ label: `L${row}`, row, col: 1 })
    seats.push({ label: `U${row}`, row, col: 2 })
  }
  return { seats }
}

/** Two berths per row (lower / upper style labels). */
function sleeperBerths(rows: number): LayoutDocument {
  const seats: LayoutSeat[] = []
  for (let r = 1; r <= rows; r++) {
    seats.push({ label: `L${r}`, row: r, col: 1 })
    seats.push({ label: `U${r}`, row: r, col: 2 })
  }
  return { seats }
}

export function formatLayoutJson(doc: LayoutDocument): string {
  return JSON.stringify(doc, null, 2)
}
