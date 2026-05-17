import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha, useTheme, type Theme } from '@mui/material/styles'
import type { SeatCell } from '../data/mockData'
import { getBookedSeatIds } from '../data/mockData'

interface SeatMapProps {
  tripId: string
  grid: SeatCell[][]
  selectedIds: string[]
  onToggle: (seatId: string) => void
  readOnly?: boolean
}

function seatColors(theme: Theme, state: 'empty' | 'booked' | 'selected' | 'na') {
  if (state === 'booked') return { bg: alpha(theme.palette.error.main, 0.15), fg: theme.palette.error.dark }
  if (state === 'selected') return { bg: theme.palette.primary.main, fg: theme.palette.primary.contrastText }
  if (state === 'na') return { bg: alpha(theme.palette.text.disabled, 0.2), fg: theme.palette.text.disabled }
  return { bg: alpha(theme.palette.success.main, 0.15), fg: theme.palette.success.dark }
}

function SeatButton({
  cell,
  state,
  onClick,
}: {
  cell: SeatCell
  state: 'empty' | 'booked' | 'selected' | 'na'
  onClick?: () => void
}) {
  const theme = useTheme()
  const isSleeper = cell.kind === 'sleeper'
  const minW = isSleeper ? 72 : 44
  const minH = isSleeper ? 40 : 40

  if (cell.kind === 'aisle') {
    return (
      <Box
        sx={{
          width: 14,
          minHeight: minH,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      />
    )
  }

  if (cell.kind === 'driver' || cell.kind === 'blocked' || cell.kind === 'wc') {
    return (
      <Chip
        label={cell.label}
        size="small"
        sx={{
          minWidth: minW,
          height: minH,
          fontWeight: 600,
          bgcolor: (t) => alpha(t.palette.text.secondary, 0.12),
          color: 'text.secondary',
        }}
      />
    )
  }

  const { bg, fg } = seatColors(theme, state)

  return (
    <Box
      component="button"
      type="button"
      disabled={state === 'booked' || state === 'na' || !onClick}
      onClick={onClick}
      sx={{
        minWidth: minW,
        height: minH,
        border: 'none',
        borderRadius: 1.5,
        cursor: state === 'booked' || state === 'na' ? 'not-allowed' : 'pointer',
        fontWeight: 700,
        fontSize: isSleeper ? '0.8rem' : '0.75rem',
        transition: 'transform 0.12s ease, box-shadow 0.12s ease',
        '&:hover:not(:disabled)': {
          transform: 'translateY(-1px)',
          boxShadow: 2,
        },
        ...(state !== 'empty' && state !== 'selected'
          ? {}
          : {
              '&:hover:not(:disabled)': {
                bgcolor: (t) => alpha(t.palette.success.main, 0.25),
              },
            }),
      }}
    >
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 1.5,
          bgcolor: bg,
          color: fg,
        }}
      >
        {cell.label}
      </Box>
    </Box>
  )
}

export function SeatMap({ tripId, grid, selectedIds, onToggle, readOnly }: SeatMapProps) {
  const booked = getBookedSeatIds(tripId)

  return (
    <Box>
      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
        <Chip size="small" label="Available" sx={{ bgcolor: (t) => alpha(t.palette.success.main, 0.15) }} />
        <Chip size="small" label="Selected" color="primary" variant="outlined" />
        <Chip size="small" label="Booked" sx={{ bgcolor: (t) => alpha(t.palette.error.main, 0.12) }} />
      </Stack>
      <Box
        sx={{
          p: 2,
          borderRadius: 2,
          bgcolor: 'background.paper',
          boxShadow: '0 8px 32px rgba(11, 60, 93, 0.08)',
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'auto',
        }}
      >
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
          Front of bus
        </Typography>
        <Stack spacing={1}>
          {grid.map((row, ri) => (
            <Stack key={ri} direction="row" spacing={0.75} alignItems="center" justifyContent="center">
              {row.map((cell) => {
                if (cell.kind === 'aisle') {
                  return <SeatButton key={cell.id} cell={cell} state="empty" />
                }
                if (cell.kind !== 'seat' && cell.kind !== 'sleeper') {
                  return <SeatButton key={cell.id} cell={cell} state="na" />
                }
                const bookedSeat = booked.has(cell.id)
                const selected = selectedIds.includes(cell.id)
                const state = bookedSeat ? 'booked' : selected ? 'selected' : 'empty'
                return (
                  <SeatButton
                    key={cell.id}
                    cell={cell}
                    state={state}
                    onClick={
                      readOnly || bookedSeat
                        ? undefined
                        : () => {
                            onToggle(cell.id)
                          }
                    }
                  />
                )
              })}
            </Stack>
          ))}
        </Stack>
      </Box>
    </Box>
  )
}
