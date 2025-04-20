import React, { useState, useEffect, useCallback } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Box,
  Avatar,
  Tooltip,
  useMediaQuery,
  alpha,
  InputBase,
  Divider,
  Fade
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  Search as SearchIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  Logout as LogoutIcon,
  Login as LoginIcon,
  PersonAdd as RegisterIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { useTheme } from '../../context/ThemeContext';
import ThemeToggle from '../ThemeToggle';
import { notificationsApi } from '../../services/api';

const Header = ({ toggleSidebar }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const muiTheme = useMuiTheme();
  const { mode } = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));

  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationMenu = (event) => {
    setNotificationAnchorEl(event.currentTarget);
    fetchNotifications();
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/');
  };

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const response = await notificationsApi.getNotifications({ is_read: false, per_page: 5 });
      setNotifications(response.notifications);
      setUnreadCount(response.unread_count);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [isAuthenticated]);

  const markAsRead = async (notificationId) => {
    try {
      await notificationsApi.markAsRead(notificationId);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();

      // Fetch notifications every minute
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, fetchNotifications]);

  return (
    <AppBar position="sticky">
      <Toolbar>
        {isAuthenticated && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={toggleSidebar}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit',
            fontWeight: 'bold'
          }}
        >
          PantherFinder
        </Typography>

        {!isMobile && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              color="inherit"
              component={RouterLink}
              to="/items"
              startIcon={<SearchIcon />}
            >
              Search Items
            </Button>
          </Box>
        )}

        {isAuthenticated ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="Notifications">
              <IconButton
                color="inherit"
                onClick={handleNotificationMenu}
              >
                <Badge badgeContent={unreadCount} color="error" className="notification-badge">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={notificationAnchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(notificationAnchorEl)}
              onClose={handleNotificationClose}
            >
              {notifications.length > 0 ? (
                <>
                  {notifications.map((notification) => (
                    <MenuItem
                      key={notification.id}
                      onClick={() => {
                        markAsRead(notification.id);
                        handleNotificationClose();
                        if (notification.item_id) {
                          navigate(`/items/${notification.item_id}`);
                        }
                      }}
                      sx={{
                        whiteSpace: 'normal',
                        maxWidth: 300,
                        fontWeight: notification.is_read ? 'normal' : 'bold'
                      }}
                    >
                      {notification.message}
                    </MenuItem>
                  ))}
                  <MenuItem
                    onClick={() => {
                      handleNotificationClose();
                      navigate('/notifications');
                    }}
                    sx={{ borderTop: '1px solid #eee', justifyContent: 'center' }}
                  >
                    View all notifications
                  </MenuItem>
                </>
              ) : (
                <MenuItem onClick={handleNotificationClose}>No new notifications</MenuItem>
              )}
            </Menu>

            <Tooltip title={user?.name || 'Account'}>
              <IconButton
                color="inherit"
                onClick={handleMenu}
                sx={{ ml: 1 }}
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                  {user?.name?.charAt(0) || <AccountCircle />}
                </Avatar>
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem
                onClick={() => {
                  handleClose();
                  navigate('/dashboard');
                }}
              >
                Dashboard
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleClose();
                  navigate('/profile');
                }}
              >
                Profile
              </MenuItem>
              {user?.role === 'admin' && (
                <MenuItem
                  onClick={() => {
                    handleClose();
                    navigate('/admin');
                  }}
                >
                  Admin Panel
                </MenuItem>
              )}
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        ) : (
          <Box>
            <Button color="inherit" component={RouterLink} to="/login">
              Login
            </Button>
            <Button color="inherit" component={RouterLink} to="/register">
              Register
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;