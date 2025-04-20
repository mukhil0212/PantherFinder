import React from 'react';
import { Box, Typography, Tabs, Tab, Card, CardContent, Grid, Chip, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const MyItemsPage = () => {
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const foundItems = [
    {
      id: 1,
      name: 'MacBook Pro',
      location: 'Library',
      date: '2025-03-31',
      status: 'Found',
    },
    {
      id: 2,
      name: 'Student ID Card',
      location: 'Student Center',
      date: '2025-03-30',
      status: 'Claimed',
    },
  ];

  const lostItems = [
    {
      id: 3,
      name: 'Water Bottle',
      location: 'Recreation Center',
      date: '2025-03-29',
      status: 'Lost',
    },
  ];

  const ItemCard = ({ item }) => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h6" gutterBottom>
              {item.name}
            </Typography>
            <Typography color="text.secondary" gutterBottom>
              {item.location}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {item.date}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={item.status}
              color={
                item.status === 'Found'
                  ? 'success'
                  : item.status === 'Claimed'
                  ? 'primary'
                  : 'warning'
              }
              size="small"
            />
            <IconButton size="small" color="primary">
              <EditIcon />
            </IconButton>
            <IconButton size="small" color="error">
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        My Items
      </Typography>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={value} onChange={handleChange}>
          <Tab label="Found Items" />
          <Tab label="Lost Items" />
        </Tabs>
      </Box>
      <Box>
        {value === 0 ? (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              {foundItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </Grid>
          </Grid>
        ) : (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              {lostItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </Grid>
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default MyItemsPage;
