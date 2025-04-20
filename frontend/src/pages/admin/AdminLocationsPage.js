import React from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';

const AdminLocationsPage = () => {
  const locations = [
    { id: 1, name: 'Library', building: 'Library North', floor: '2nd Floor', status: 'Active' },
    { id: 2, name: 'Student Center', building: 'Student Center', floor: '1st Floor', status: 'Active' },
    { id: 3, name: 'Recreation Center', building: 'Recreation Center', floor: 'Ground Floor', status: 'Inactive' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Manage Drop-off Locations
      </Typography>
      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Building</TableCell>
              <TableCell>Floor</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {locations.map((location) => (
              <TableRow key={location.id}>
                <TableCell>{location.id}</TableCell>
                <TableCell>{location.name}</TableCell>
                <TableCell>{location.building}</TableCell>
                <TableCell>{location.floor}</TableCell>
                <TableCell>
                  <Chip
                    label={location.status}
                    color={location.status === 'Active' ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AdminLocationsPage;
