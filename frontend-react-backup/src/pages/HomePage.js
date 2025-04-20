import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Container
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  LocationOn as LocationIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const { isAuthenticated } = useAuth();

  const featuredItems = [
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
      status: 'Found',
      image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80',
    },
  ];
  
  return (
    <Box>
      {/* Full-Screen Hero Section */}
      <Box
        sx={{
          position: 'relative',
          minHeight: { xs: '80vh', md: '90vh' },
          maxHeight: '1000px',
          overflow: 'hidden',
          width: '100%',
          background: `url('/SM_Dual-Enrollment_BG.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Container
          sx={{
            position: 'relative',
            zIndex: 2,
            textAlign: 'center',
            p: 4,
            borderRadius: 4,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(5px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            color: '#fff',
            maxWidth: '800px !important',
          }}
        >
          <Typography variant="h3" component="h1" gutterBottom>
            Discover Lost &amp; Found, Reimagined
          </Typography>
          <Typography variant="h6" paragraph sx={{ maxWidth: 600, margin: '0 auto', mb: 4 }}>
            A modern platform to connect lost items with their owners. Effortlessly search, submit, and track your items.
          </Typography>
          <Button
            variant="contained"
            size="large"
            component={RouterLink}
            to={isAuthenticated ? '/items' : '/register'}
          >
            {isAuthenticated ? 'Explore Items' : 'Join Now'}
          </Button>
        </Container>
      </Box>

      {/* Features Section */}
      <Container sx={{ py: 12, position: 'relative' }} maxWidth="lg">
        <Box
          sx={{
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -100,
              left: -200,
              width: 400,
              height: 400,
              background: 'radial-gradient(circle, rgba(167, 139, 250, 0.1) 0%, rgba(167, 139, 250, 0) 70%)',
              borderRadius: '50%',
              zIndex: 0
            }
          }}
        >
          <Typography 
            variant="h4" 
            component="h2" 
            align="center" 
            gutterBottom
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 3
            }}
          >
            How It Works
          </Typography>
          <Typography 
            variant="subtitle1" 
            align="center" 
            sx={{ 
              color: 'text.secondary',
              maxWidth: '800px',
              margin: '0 auto',
              mb: 6
            }}
          >
            Our intuitive platform bridges the gap between lost items and their owners with smart search, easy submissions, location services, and real-time notifications.
          </Typography>
        </Box>
        <Grid container spacing={6} sx={{ mt: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                borderRadius: 3,
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 10px 30px -5px rgba(124, 58, 237, 0.2)',
                transition: 'all 0.3s ease-in-out',
                '&:hover': { 
                  transform: 'translateY(-5px)',
                  boxShadow: '0 20px 40px -5px rgba(124, 58, 237, 0.3)',
                  background: 'rgba(255, 255, 255, 0.95)',
                },
              }}
            >
              <CardMedia
                sx={{
                  pt: '56.25%',
                  position: 'relative',
                  bgcolor: 'primary.light',
                }}
              >
                <SearchIcon
                  sx={{
                    fontSize: 64,
                    color: '#fff',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                  }}
                />
              </CardMedia>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Search
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Quickly find lost items using our smart filters.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                borderRadius: 3,
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 10px 30px -5px rgba(124, 58, 237, 0.2)',
                transition: 'all 0.3s ease-in-out',
                '&:hover': { 
                  transform: 'translateY(-5px)',
                  boxShadow: '0 20px 40px -5px rgba(124, 58, 237, 0.3)',
                  background: 'rgba(255, 255, 255, 0.95)',
                },
              }}
            >
              <CardMedia
                sx={{
                  pt: '56.25%',
                  position: 'relative',
                  bgcolor: 'secondary.light',
                }}
              >
                <AddIcon
                  sx={{
                    fontSize: 64,
                    color: '#fff',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                  }}
                />
              </CardMedia>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Submit
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Share found items with clear photos and details.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                borderRadius: 3,
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 10px 30px -5px rgba(124, 58, 237, 0.2)',
                transition: 'all 0.3s ease-in-out',
                '&:hover': { 
                  transform: 'translateY(-5px)',
                  boxShadow: '0 20px 40px -5px rgba(124, 58, 237, 0.3)',
                  background: 'rgba(255, 255, 255, 0.95)',
                },
              }}
            >
              <CardMedia
                sx={{
                  pt: '56.25%',
                  position: 'relative',
                  bgcolor: 'success.light',
                }}
              >
                <LocationIcon
                  sx={{
                    fontSize: 64,
                    color: '#fff',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                  }}
                />
              </CardMedia>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Locate
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Easily find nearby drop-off points to retrieve your items.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                borderRadius: 3,
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 10px 30px -5px rgba(124, 58, 237, 0.2)',
                transition: 'all 0.3s ease-in-out',
                '&:hover': { 
                  transform: 'translateY(-5px)',
                  boxShadow: '0 20px 40px -5px rgba(124, 58, 237, 0.3)',
                  background: 'rgba(255, 255, 255, 0.95)',
                },
              }}
            >
              <CardMedia
                sx={{
                  pt: '56.25%',
                  position: 'relative',
                  bgcolor: 'info.light',
                }}
              >
                <NotificationsIcon
                  sx={{
                    fontSize: 64,
                    color: '#fff',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                  }}
                />
              </CardMedia>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Notify
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Get real-time alerts when matching items are found.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Recently Found Items Section */}
      <Container 
        sx={{ 
          py: 12,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: -200,
            width: 500,
            height: 500,
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, rgba(139, 92, 246, 0) 70%)',
            borderRadius: '50%',
            zIndex: 0
          }
        }} 
        maxWidth="lg"
      >
        <Typography 
          variant="h4" 
          align="center" 
          gutterBottom
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 6
          }}
        >
          Recently Found Items
        </Typography>
        <Grid container spacing={4}>
          {featuredItems.map((item) => (
            <Grid item key={item.id} xs={12} sm={6} md={4}>
              <Card
                component={RouterLink}
                to={`/items/${item.id}`}
                sx={{
                  textDecoration: 'none',
                  borderRadius: 3,
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 10px 30px -5px rgba(124, 58, 237, 0.2)',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': { 
                    transform: 'translateY(-5px)',
                    boxShadow: '0 20px 40px -5px rgba(124, 58, 237, 0.3)',
                    background: 'rgba(255, 255, 255, 0.95)',
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={item.image}
                  alt={item.name}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {item.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.category}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <LocationIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {item.location}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Call to Action Section */}
      <Box 
        sx={{ 
          position: 'relative',
          py: 12,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.05), rgba(139, 92, 246, 0.1))',
            zIndex: 0
          }
        }}
      >
        <Container maxWidth="sm" sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <Typography variant="h4" gutterBottom>
            Ready to Get Started?
          </Typography>
          <Typography variant="h6" color="text.secondary" paragraph>
            Join our community to help reunite lost items with their owners.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              component={RouterLink}
              to={isAuthenticated ? '/submit-item' : '/register'}
              sx={{
                mx: 1,
                background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #6d28d9, #7c3aed)'
                }
              }}
            >
              {isAuthenticated ? 'Submit Found Item' : 'Sign Up Now'}
            </Button>
            <Button
              variant="outlined"
              size="large"
              component={RouterLink}
              to="/items"
              sx={{
                mx: 1,
                borderColor: '#7c3aed',
                color: '#7c3aed',
                '&:hover': {
                  borderColor: '#6d28d9',
                  color: '#6d28d9',
                  background: 'rgba(124, 58, 237, 0.04)'
                }
              }}
            >
              Browse Items
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;
