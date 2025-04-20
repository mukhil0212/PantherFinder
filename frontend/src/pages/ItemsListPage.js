import React from 'react';
import { Box, Grid, Card, CardContent, CardMedia, Typography, Chip, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';

const ItemsListPage = () => {
  const navigate = useNavigate();
  const items = [
    {
      id: 1,
      name: 'MacBook Pro',
      category: 'Electronics',
      location: 'Library',
      date: '2025-03-31',
      status: 'Found',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 2,
      name: 'Notebook',
      category: 'Stationery',
      location: 'Classroom Building',
      date: '2025-04-02',
      status: 'Found',
      image: '/note-thanun-38_r4yQ1fHI-unsplash.jpg',
    },
    {
      id: 3,
      name: 'Water Bottle',
      category: 'Personal',
      location: 'Recreation Center',
      date: '2025-03-29',
      status: 'Claimed',
      image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Lost & Found Items
      </Typography>
      <Grid container spacing={3}>
        {items.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  transition: 'transform 0.2s ease-in-out',
                },
              }}
              onClick={() => navigate(`/items/${item.id}`)}
            >
              <CardMedia
                component="img"
                height="200"
                image={item.image}
                alt={item.name}
              />
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {item.name}
                  </Typography>
                  <IconButton size="small">
                    <SearchIcon />
                  </IconButton>
                </Box>
                <Typography color="text.secondary" gutterBottom>
                  {item.location}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Chip 
                    label={item.category} 
                    size="small" 
                    color="primary" 
                    variant="outlined" 
                  />
                  <Chip 
                    label={item.status} 
                    size="small" 
                    color={item.status === 'Found' ? 'success' : 'default'} 
                  />
                </Box>
                <Typography variant="caption" display="block" sx={{ mt: 2 }}>
                  Found on {item.date}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ItemsListPage;
