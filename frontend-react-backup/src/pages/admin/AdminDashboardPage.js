import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
}));

const AdminDashboardPage = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          <StyledPaper>
            <Typography variant="h6" gutterBottom>
              Total Items
            </Typography>
            <Typography variant="h3" color="primary">
              120
            </Typography>
          </StyledPaper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <StyledPaper>
            <Typography variant="h6" gutterBottom>
              Active Claims
            </Typography>
            <Typography variant="h3" color="secondary">
              45
            </Typography>
          </StyledPaper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <StyledPaper>
            <Typography variant="h6" gutterBottom>
              Total Users
            </Typography>
            <Typography variant="h3" color="info.main">
              350
            </Typography>
          </StyledPaper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <StyledPaper>
            <Typography variant="h6" gutterBottom>
              Drop-off Locations
            </Typography>
            <Typography variant="h3" color="success.main">
              8
            </Typography>
          </StyledPaper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboardPage;
