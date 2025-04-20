import React from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';

const AdminItemsPage = () => {
  const items = [
    { id: 1, name: 'Laptop', category: 'Electronics', status: 'Found', location: 'Library' },
    { id: 2, name: 'Water Bottle', category: 'Personal', status: 'Claimed', location: 'Student Center' },
    { id: 3, name: 'Textbook', category: 'Books', status: 'Found', location: 'Classroom Building' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Found':
        return 'success';
      case 'Claimed':
        return 'primary';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Manage Items
      </Typography>
      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Location</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.id}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>
                  <Chip label={item.status} color={getStatusColor(item.status)} size="small" />
                </TableCell>
                <TableCell>{item.location}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AdminItemsPage;
