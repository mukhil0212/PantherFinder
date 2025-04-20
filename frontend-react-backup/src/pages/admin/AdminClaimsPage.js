import React from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';

const AdminClaimsPage = () => {
  const claims = [
    { id: 1, itemName: 'Laptop', claimant: 'John Doe', status: 'Pending', date: '2025-03-31' },
    { id: 2, itemName: 'Water Bottle', claimant: 'Jane Smith', status: 'Approved', date: '2025-03-30' },
    { id: 3, itemName: 'Textbook', claimant: 'Mike Johnson', status: 'Rejected', date: '2025-03-29' },
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
        Manage Claims
      </Typography>
      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Item Name</TableCell>
              <TableCell>Claimant</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {claims.map((claim) => (
              <TableRow key={claim.id}>
                <TableCell>{claim.id}</TableCell>
                <TableCell>{claim.itemName}</TableCell>
                <TableCell>{claim.claimant}</TableCell>
                <TableCell>
                  <Chip
                    label={claim.status}
                    color={getStatusColor(claim.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{claim.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AdminClaimsPage;
