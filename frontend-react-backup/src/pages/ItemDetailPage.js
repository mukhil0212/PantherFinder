import React from 'react';
import { Box, Paper, Grid, Typography, Button, Chip, Divider } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CategoryIcon from '@mui/icons-material/Category';

const ItemDetailPage = () => {
  const item = {
    id: 1,
    name: 'MacBook Pro',
    category: 'Electronics',
    location: 'Library - 2nd Floor',
    date: '2025-03-31',
    status: 'Found',
    description: 'Silver MacBook Pro 13-inch with stickers on the cover. Found near the study area.',
    image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&auto=format&fit=crop&q=80',
    additionalDetails: {
      brand: 'Apple',
      color: 'Silver',
      identifyingMarks: 'Has several stickers on the cover',
    },
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper 
            sx={{ 
              p: 3,
              mb: 3,
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <img
              src={item.image}
              alt={item.name}
              style={{ 
                width: '100%',
                height: 'auto',
                borderRadius: 8,
                marginBottom: 24,
              }}
            />
            <Typography variant="h4" gutterBottom>
              {item.name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
              <Chip 
                label={item.category} 
                color="primary" 
                variant="outlined" 
                icon={<CategoryIcon />}
              />
              <Chip 
                label={item.status} 
                color={item.status === 'Found' ? 'success' : 'default'} 
              />
            </Box>
            <Typography variant="body1" paragraph>
              {item.description}
            </Typography>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" gutterBottom>
              Additional Details
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(item.additionalDetails).map(([key, value]) => (
                <Grid item xs={12} sm={6} key={key}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </Typography>
                  <Typography variant="body1">{value}</Typography>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Location & Time
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocationOnIcon color="primary" sx={{ mr: 1 }} />
                <Typography>{item.location}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarTodayIcon color="primary" sx={{ mr: 1 }} />
                <Typography>Found on {item.date}</Typography>
              </Box>
            </Box>
            <Button 
              variant="contained" 
              fullWidth 
              size="large"
              sx={{ mb: 2 }}
            >
              Claim This Item
            </Button>
            <Button 
              variant="outlined" 
              fullWidth
              size="large"
            >
              Report Similar Item
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ItemDetailPage;
