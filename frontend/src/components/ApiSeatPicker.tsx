import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'
import type { TripSeatDto } from '../api/types'

interface ApiSeatPickerProps {
  seats: TripSeatDto[]
  selectedTripSeatIds: number[]
  onToggle: (seat: TripSeatDto) => void
  readOnly?: boolean
}

export function ApiSeatPicker({ seats, selectedTripSeatIds, onToggle, readOnly }: ApiSeatPickerProps) {
  const theme = useTheme()
  const selectedSet = new Set(selectedTripSeatIds)

  return (
    <Box>
      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
        <Chip size="small" label="Available" sx={{ bgcolor: (t) => alpha(t.palette.success.main, 0.15) }} />
        <Chip size="small" label="Selected" color="primary" variant="outlined" />
        <Chip size="small" label="Taken / blocked" sx={{ bgcolor: (t) => alpha(t.palette.error.main, 0.12) }} />
      </Stack>
      <Box
        sx={{
          p: 2,
          borderRadius: 2,
          bgcolor: 'background.paper',
          boxShadow: '0 8px 32px rgba(11, 60, 93, 0.08)',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
          Tap a seat to select (available only)
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            justifyContent: 'center',
          }}
        >
          {seats.map((seat) => {
            const isAvail = seat.status === 'AVAILABLE'
            const selected = selectedSet.has(seat.id)
            const clickable = !readOnly && isAvail

            let bg = alpha(theme.palette.success.main, 0.15)
            let fg = theme.palette.success.dark
            if (!isAvail) {
              bg = alpha(theme.palette.error.main, 0.12)
              fg = theme.palette.error.dark
            }
            if (selected) {
              bg = theme.palette.primary.main
              fg = theme.palette.primary.contrastText
            }

            return (
              <Box
                key={seat.id}
                component="button"
                type="button"
                disabled={!clickable && !selected}
                onClick={() => {
                  if (clickable || (selected && isAvail)) {
                    onToggle(seat)
                  }
                }}
                sx={{
                  minWidth: 48,
                  height: 44,
                  border: 'none',
                  borderRadius: 1.5,
                  cursor: clickable || selected ? 'pointer' : 'not-allowed',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  bgcolor: bg,
                  color: fg,
                  opacity: isAvail || selected ? 1 : 0.85,
                  '&:hover:not(:disabled)': { transform: 'translateY(-1px)', boxShadow: 2 },
                }}
                title={`${seat.label} · ${seat.status}`}
              >
                {seat.label}
              </Box>
            )
          })}
        </Box>
      </Box>
    </Box>
  )
}
