import { Link as RouterLink } from 'react-router-dom'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

export function NotFoundPage() {
  return (
    <Container sx={{ py: 10, textAlign: 'center' }}>
      <Typography variant="h3" gutterBottom sx={{ fontWeight: 800 }}>
        404
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        This page is not in the demo map.
      </Typography>
      <Button component={RouterLink} to="/" variant="contained">
        Back home
      </Button>
    </Container>
  )
}
