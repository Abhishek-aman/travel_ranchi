import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

export function AdminAgentsPage() {
  return (
    <Stack spacing={2}>
      <div>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Agents
        </Typography>
        <Typography color="text.secondary">
          The documented REST API does not expose agent user management. Provision agent accounts in the backend (seed or
          ops). Demo agent: <code>agent@demo.local</code> / <code>agent123</code>.
        </Typography>
      </div>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            When your team adds admin endpoints for agents, wire this screen to list and invite users.
          </Typography>
        </CardContent>
      </Card>
    </Stack>
  )
}
