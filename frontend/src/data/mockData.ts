export type SeatKind = 'seat' | 'sleeper' | 'blocked' | 'driver' | 'aisle' | 'wc'

export interface SeatCell {
  id: string
  label: string
  kind: SeatKind
  row: number
  col: number
}

export interface Trip {
  id: string
  operator: string
  busName: string
  busType: string
  layout: '2x2' | '2x3' | 'sleeper' | 'hybrid'
  from: string
  to: string
  departure: string
  arrival: string
  duration: string
  baseFare: number
  seatsAvailable: number
  rating: number
  amenities: string[]
}

export const cities = [
  'Mumbai',
  'Pune',
  'Bangalore',
  'Hyderabad',
  'Chennai',
  'Goa',
  'Delhi',
]

export const mockTrips: Trip[] = [
  {
    id: 'trip-101',
    operator: 'BlueLine Express',
    busName: 'Volvo B11R',
    busType: 'AC Semi-Sleeper',
    layout: '2x2',
    from: 'Mumbai',
    to: 'Pune',
    departure: '06:30',
    arrival: '10:45',
    duration: '4h 15m',
    baseFare: 499,
    seatsAvailable: 18,
    rating: 4.6,
    amenities: ['Wi‑Fi', 'USB charging', 'Water', 'Blanket'],
  },
  {
    id: 'trip-102',
    operator: 'BlueLine Express',
    busName: 'Scania Metrolink',
    busType: 'AC Sleeper',
    layout: 'sleeper',
    from: 'Mumbai',
    to: 'Pune',
    departure: '22:00',
    arrival: '02:15',
    duration: '4h 15m',
    baseFare: 799,
    seatsAvailable: 8,
    rating: 4.8,
    amenities: ['Wi‑Fi', 'Reading light', 'Snacks', 'Blanket'],
  },
  {
    id: 'trip-201',
    operator: 'Coastal Coaches',
    busName: 'Mercedes Multi-Axle',
    busType: 'AC Seater',
    layout: '2x3',
    from: 'Bangalore',
    to: 'Chennai',
    departure: '21:30',
    arrival: '06:00',
    duration: '8h 30m',
    baseFare: 899,
    seatsAvailable: 24,
    rating: 4.4,
    amenities: ['Wi‑Fi', 'USB charging', 'Water'],
  },
]

/** Deterministic "booked" seats for demo */
export function getBookedSeatIds(tripId: string): Set<string> {
  const seeds: Record<string, string[]> = {
    'trip-101': ['A1', 'A2', 'B4', 'C3'],
    'trip-102': ['L1-L', 'L2-U', 'U3-L'],
    'trip-201': ['R1-1', 'R1-2', 'R2-4', 'R3-2'],
  }
  return new Set(seeds[tripId] ?? [])
}

export function buildSeatGrid(layout: Trip['layout']): SeatCell[][] {
  if (layout === 'sleeper') {
    const rows: SeatCell[][] = []
    for (let r = 0; r < 6; r++) {
      const lower: SeatCell = {
        id: `L${r + 1}-L`,
        label: `L${r + 1}`,
        kind: 'sleeper',
        row: r,
        col: 0,
      }
      const aisle: SeatCell = {
        id: `aisle-${r}`,
        label: '',
        kind: 'aisle',
        row: r,
        col: 1,
      }
      const upper: SeatCell = {
        id: `U${r + 1}-U`,
        label: `U${r + 1}`,
        kind: 'sleeper',
        row: r,
        col: 2,
      }
      rows.push([lower, aisle, upper])
    }
    return rows
  }

  if (layout === '2x3') {
    const rows: SeatCell[][] = []
    rows.push([
      {
        id: 'drv',
        label: 'Driver',
        kind: 'driver',
        row: 0,
        col: 0,
      },
      { id: 'a0', label: '', kind: 'aisle', row: 0, col: 1 },
      { id: 'door', label: 'Door', kind: 'blocked', row: 0, col: 2 },
    ])
    const labels = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
    let idx = 0
    for (let r = 1; r <= 5; r++) {
      const row: SeatCell[] = []
      for (let c = 0; c < 3; c++) {
        const label = labels[idx++]
        row.push({
          id: `R${r}-${c}`,
          label,
          kind: 'seat',
          row: r,
          col: c,
        })
      }
      rows.push(row)
    }
    return rows
  }

  // 2x2 default
  const rows: SeatCell[][] = []
  rows.push([
    { id: 'drv', label: 'Driver', kind: 'driver', row: 0, col: 0 },
    { id: 'a0', label: '', kind: 'aisle', row: 0, col: 1 },
    { id: 'wc', label: 'WC', kind: 'wc', row: 0, col: 2 },
  ])
  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
  letters.forEach((L, r) => {
    rows.push([
      { id: `${L}1`, label: `${L}1`, kind: 'seat', row: r + 1, col: 0 },
      { id: `aisle-${L}`, label: '', kind: 'aisle', row: r + 1, col: 1 },
      { id: `${L}2`, label: `${L}2`, kind: 'seat', row: r + 1, col: 2 },
    ])
  })
  return rows
}

export function getTripById(id: string): Trip | undefined {
  return mockTrips.find((t) => t.id === id)
}

export interface BulkRequest {
  id: string
  org: string
  seats: number
  route: string
  date: string
  status: 'pending' | 'approved' | 'rejected'
}

export const mockBulkRequests: BulkRequest[] = [
  {
    id: 'BR-2401',
    org: 'TechCorp Offsite',
    seats: 42,
    route: 'Bangalore → Chennai',
    date: '2026-04-22',
    status: 'pending',
  },
  {
    id: 'BR-2398',
    org: 'Springfield School',
    seats: 55,
    route: 'Mumbai → Pune',
    date: '2026-04-20',
    status: 'approved',
  },
]

export interface AgentRecord {
  id: string
  name: string
  stop: string
  tripsToday: number
  status: 'active' | 'away'
}

export const mockAgents: AgentRecord[] = [
  { id: 'ag-1', name: 'Ravi Kumar', stop: 'Mumbai — Borivali', tripsToday: 14, status: 'active' },
  { id: 'ag-2', name: 'Sneha Patil', stop: 'Pune — Wakad', tripsToday: 9, status: 'active' },
  { id: 'ag-3', name: 'Imran Sheikh', stop: 'Bangalore — Madiwala', tripsToday: 0, status: 'away' },
]

export interface InventoryRow {
  tripId: string
  route: string
  time: string
  total: number
  sold: number
  blocked: number
}

export const mockInventory: InventoryRow[] = mockTrips.map((t) => ({
  tripId: t.id,
  route: `${t.from} → ${t.to}`,
  time: t.departure,
  total: 45,
  sold: 45 - t.seatsAvailable + 3,
  blocked: 2,
}))
