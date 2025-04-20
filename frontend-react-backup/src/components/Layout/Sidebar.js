import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Inventory as InventoryIcon,
  Assignment as AssignmentIcon,
  Notifications as NotificationsIcon,
  AdminPanelSettings as AdminIcon,
  People as PeopleIcon,
  LocationOn as LocationIcon,
  VerifiedUser as VerifiedUserIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ open, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const isAdmin = user?.role === 'admin';
  
  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };
  
  const drawerContent = (
    <Box sx={{ width: 240, pt: 2 }}>
      <Box sx={{ px: 2, mb: 2 }}>
        <Typography variant="h6" color="primary">
          Navigation
        </Typography>
      </Box>
      
      <Divider />
      
      <List>
        <ListItem 
          button 
          selected={location.pathname === '/dashboard'}
          onClick={() => handleNavigation('/dashboard')}
        >
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
        
        <ListItem 
          button 
          selected={location.pathname === '/profile'}
          onClick={() => handleNavigation('/profile')}
        >
          <ListItemIcon>
            <PersonIcon />
          </ListItemIcon>
          <ListItemText primary="Profile" />
        </ListItem>
      </List>
      
      <Divider />
      
      <Box sx={{ px: 2, py: 1 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Items
        </Typography>
      </Box>
      
      <List>
        <ListItem 
          button 
          selected={location.pathname === '/submit-item'}
          onClick={() => handleNavigation('/submit-item')}
        >
          <ListItemIcon>
            <AddIcon />
          </ListItemIcon>
          <ListItemText primary="Submit Found Item" />
        </ListItem>
        
        <ListItem 
          button 
          selected={location.pathname === '/items'}
          onClick={() => handleNavigation('/items')}
        >
          <ListItemIcon>
            <SearchIcon />
          </ListItemIcon>
          <ListItemText primary="Search Items" />
        </ListItem>
        
        <ListItem 
          button 
          selected={location.pathname === '/my-items'}
          onClick={() => handleNavigation('/my-items')}
        >
          <ListItemIcon>
            <InventoryIcon />
          </ListItemIcon>
          <ListItemText primary="My Items" />
        </ListItem>
        
        <ListItem 
          button 
          selected={location.pathname === '/my-claims'}
          onClick={() => handleNavigation('/my-claims')}
        >
          <ListItemIcon>
            <AssignmentIcon />
          </ListItemIcon>
          <ListItemText primary="My Claims" />
        </ListItem>
        
        <ListItem 
          button 
          selected={location.pathname === '/notifications'}
          onClick={() => handleNavigation('/notifications')}
        >
          <ListItemIcon>
            <NotificationsIcon />
          </ListItemIcon>
          <ListItemText primary="Notifications" />
        </ListItem>
      </List>
      
      {isAdmin && (
        <>
          <Divider />
          
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Admin
            </Typography>
          </Box>
          
          <List>
            <ListItem 
              button 
              selected={location.pathname === '/admin'}
              onClick={() => handleNavigation('/admin')}
            >
              <ListItemIcon>
                <AdminIcon />
              </ListItemIcon>
              <ListItemText primary="Admin Dashboard" />
            </ListItem>
            
            <ListItem 
              button 
              selected={location.pathname === '/admin/users'}
              onClick={() => handleNavigation('/admin/users')}
            >
              <ListItemIcon>
                <PeopleIcon />
              </ListItemIcon>
              <ListItemText primary="Manage Users" />
            </ListItem>
            
            <ListItem 
              button 
              selected={location.pathname === '/admin/items'}
              onClick={() => handleNavigation('/admin/items')}
            >
              <ListItemIcon>
                <InventoryIcon />
              </ListItemIcon>
              <ListItemText primary="Manage Items" />
            </ListItem>
            
            <ListItem 
              button 
              selected={location.pathname === '/admin/locations'}
              onClick={() => handleNavigation('/admin/locations')}
            >
              <ListItemIcon>
                <LocationIcon />
              </ListItemIcon>
              <ListItemText primary="Manage Locations" />
            </ListItem>
            
            <ListItem 
              button 
              selected={location.pathname === '/admin/claims'}
              onClick={() => handleNavigation('/admin/claims')}
            >
              <ListItemIcon>
                <VerifiedUserIcon />
              </ListItemIcon>
              <ListItemText primary="Manage Claims" />
            </ListItem>
          </List>
        </>
      )}
    </Box>
  );
  
  return (
    <>
      {/* Mobile drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={open}
          onClose={onClose}
          ModalProps={{ keepMounted: true }}
        >
          {drawerContent}
        </Drawer>
      )}
      
      {/* Desktop drawer */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          open
          sx={{
            width: 240,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 240,
              boxSizing: 'border-box',
              position: 'relative',
              height: '100%'
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  );
};

export default Sidebar;