import React from 'react';
import { Box, Grid, Paper, Typography, Button, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

const DashboardPage = () => {
  const navigate = useNavigate();

  const recentItems = [
    { id: 1, name: 'MacBook Pro', status: 'Found', date: '2025-03-31', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80' },
    { id: 2, name: 'Student ID Card', status: 'Found', date: '2025-03-30', image: 'https://images.unsplash.com/photo-1586157031561-11cb264d9c56?w=600&auto=format&fit=crop&q=80' },
    { id: 3, name: 'Water Bottle', status: 'Claimed', date: '2025-03-29', image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <StyledPaper>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={() => navigate('/items')}
                fullWidth
              >
                Browse Items
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/submit-item')}
                fullWidth
              >
                Submit Item
              </Button>
            </Box>
          </StyledPaper>
        </Grid>

        {/* Statistics */}
        <Grid item xs={12} md={6}>
          <StyledPaper>
            <Typography variant="h6" gutterBottom>
              Your Activity
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6}>
                <Typography variant="h4" color="primary">3</Typography>
                <Typography variant="body2" color="text.secondary">Items Found</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="h4" color="secondary">2</Typography>
                <Typography variant="body2" color="text.secondary">Claims Made</Typography>
              </Grid>
            </Grid>
          </StyledPaper>
        </Grid>

        {/* Recent Items */}
        <Grid item xs={12}>
          <StyledPaper>
            <Typography variant="h6" gutterBottom>
              Recent Items
            </Typography>
            <Box sx={{ mt: 2 }}>
              {recentItems.map((item, index) => (
                <React.Fragment key={item.id}>
                  {index > 0 && <Divider sx={{ my: 2 }} />}
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                      p: 1,
                      borderRadius: 1,
                    }}
                    onClick={() => navigate(`/items/${item.id}`)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{
                          width: 60,
                          height: 60,
                          objectFit: 'cover',
                          borderRadius: 8
                        }}
                      />
                      <Box>
                        <Typography variant="subtitle1">{item.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.date}
                      </Typography>
                      </Box>
                    </Box>
                    <Typography 
                      variant="subtitle2"
                      color={item.status === 'Found' ? 'success.main' : 'text.secondary'}
                    >
                      {item.status}
                    </Typography>
                  </Box>
                </React.Fragment>
              ))}
            </Box>
          </StyledPaper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
