import { Box, Skeleton, Stack, Grid, Card, CardContent } from '@mui/material';

export default function AdminLoading() {
  return (
    <Box sx={{ p: 0 }}>
      {/* Header skeleton */}
      <Stack spacing={1} sx={{ mb: 3 }}>
        <Skeleton variant="text" width={200} height={32} />
        <Skeleton variant="text" width={300} height={20} />
      </Stack>

      {/* KPI Cards skeleton */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[1, 2, 3, 4].map((i) => (
          <Grid key={i} size={{ xs: 6, md: 3 }}>
            <Card>
              <CardContent sx={{ py: 2 }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Skeleton variant="rounded" width={44} height={44} />
                  <Stack spacing={0.5} sx={{ flex: 1 }}>
                    <Skeleton variant="text" width={60} height={28} />
                    <Skeleton variant="text" width={90} height={16} />
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Table skeleton */}
      <Card>
        <Box sx={{ p: 2 }}>
          <Skeleton variant="text" width={150} height={24} />
        </Box>
        <Stack spacing={0}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Stack key={i} direction="row" spacing={2} sx={{ px: 2, py: 1.5, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <Skeleton variant="circular" width={36} height={36} />
              <Skeleton variant="text" width="20%" height={20} />
              <Skeleton variant="text" width="15%" height={20} />
              <Skeleton variant="text" width="15%" height={20} />
              <Skeleton variant="rounded" width={80} height={24} />
              <Skeleton variant="text" width="10%" height={20} />
            </Stack>
          ))}
        </Stack>
      </Card>
    </Box>
  );
}
