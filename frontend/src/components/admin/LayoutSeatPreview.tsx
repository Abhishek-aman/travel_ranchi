import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'
import type { LayoutSeat } from '../../utils/busLayoutPresets'

interface LayoutSeatPreviewProps {
  seats: LayoutSeat[]
  /** Optional heading */
  title?: string
}

/** Read-only grid preview from layout seats (row/col positions). */
export function LayoutSeatPreview({ seats, title = 'Preview' }: LayoutSeatPreviewProps) {
  const theme = useTheme()

  if (!seats.length) {
    return (
      <Typography variant="body2" color="text.secondary">
        No seats to preview.
      </Typography>
    )
  }

  let maxRow = 1
  let maxCol = 1
  for (const s of seats) {
    maxRow = Math.max(maxRow, s.row)
    maxCol = Math.max(maxCol, s.col)
  }

  const grid: (string | null)[][] = Array.from({ length: maxRow }, () =>
    Array.from({ length: maxCol }, () => null),
  )
  for (const s of seats) {
    const r = s.row - 1
    const c = s.col - 1
    if (r >= 0 && r < maxRow && c >= 0 && c < maxCol) {
      grid[r][c] = s.label
    }
  }

  return (
    <Box>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, fontWeight: 600 }}>
        {title}
      </Typography>
      <Box
        component="div"
        role="img"
        aria-label="Seat layout preview"
        sx={{
          p: 2,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.primary.main, 0.04),
          border: '1px dashed',
          borderColor: 'divider',
          overflowX: 'auto',
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: `repeat(${maxCol}, minmax(40px, 1fr))`,
            gap: 0.75,
            minWidth: maxCol * 44,
          }}
        >
          {grid.map((row, ri) =>
            row.map((cell, ci) => (
              <Paper
                key={`${ri}-${ci}`}
                elevation={0}
                sx={{
                  minHeight: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  borderRadius: 1,
                  bgcolor: cell
                    ? alpha(theme.palette.success.main, 0.18)
                    : alpha(theme.palette.grey[500], 0.08),
                  color: cell ? 'success.dark' : 'text.disabled',
                  border: '1px solid',
                  borderColor: cell ? alpha(theme.palette.success.main, 0.35) : 'transparent',
                }}
              >
                {cell ?? '·'}
              </Paper>
            )),
          )}
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
          · = gap / aisle (no seat). Labels match what passengers will see when booking.
        </Typography>
      </Box>
    </Box>
  )
}
