import React from 'react';
import { Box, Typography, Card, CardContent, Grid, Chip, Button } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
  },
}));

const MyClaimsPage = () => {
  const claims = [
    {
      id: 1,
      itemName: 'MacBook Pro',
      location: 'Library',
      dateSubmitted: '2025-03-31',
      status: 'Pending',
      description: 'Silver MacBook Pro with stickers on the cover',
    },
    {
      id: 2,
      itemName: 'Student ID Card',
      location: 'Student Center',
      dateSubmitted: '2025-03-30',
      status: 'Approved',
      description: 'GSU Student ID Card',
    },
    {
      id: 3,
      itemName: 'Water Bottle',
      location: 'Recreation Center',
      dateSubmitted: '2025-03-29',
      status: 'Rejected',
      description: 'Black Hydro Flask water bottle',
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        My Claims
      </Typography>
      <Grid container spacing={3}>
        {claims.map((claim) => (
          <Grid item xs={12} key={claim.id}>
            <StyledCard>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {claim.itemName}
                    </Typography>
                    <Typography color="text.secondary" gutterBottom>
                      {claim.location}
                    </Typography>
                  </Box>
                  <Chip
                    label={claim.status}
                    color={getStatusColor(claim.status)}
                    size="small"
                  />
                </Box>
                <Typography variant="body2" paragraph>
                  {claim.description}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    Submitted on {claim.dateSubmitted}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {claim.status === 'Pending' && (
                      <>
                        <Button size="small" color="error" variant="outlined">
                          Cancel Claim
                        </Button>
                        <Button size="small" color="primary" variant="contained">
                          View Details
                        </Button>
                      </>
                    )}
                    {claim.status === 'Approved' && (
                      <Button size="small" color="success" variant="contained">
                        Pickup Instructions
                      </Button>
                    )}
                    {claim.status === 'Rejected' && (
                      <Button size="small" color="primary" variant="outlined">
                        View Reason
                      </Button>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default MyClaimsPage;
