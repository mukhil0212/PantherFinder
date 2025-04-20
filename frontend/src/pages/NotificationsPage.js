import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar, IconButton, Divider } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import { green, blue, orange } from '@mui/material/colors';

const NotificationsPage = () => {
  const notifications = [
    {
      id: 1,
      type: 'claim_update',
      title: 'Claim Approved',
      message: 'Your claim for MacBook Pro has been approved. Please check pickup instructions.',
      time: '2 hours ago',
      read: false,
    },
    {
      id: 2,
      type: 'item_match',
      title: 'Potential Match Found',
      message: 'We found an item matching your lost item description: Black Water Bottle',
      time: '1 day ago',
      read: true,
    },
    {
      id: 3,
      type: 'reminder',
      title: 'Pickup Reminder',
      message: 'Don\'t forget to pick up your claimed item from the Student Center',
      time: '2 days ago',
      read: true,
    },
  ];

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'claim_update':
        return <NotificationsIcon sx={{ color: green[500] }} />;
      case 'item_match':
        return <NotificationsIcon sx={{ color: blue[500] }} />;
      case 'reminder':
        return <NotificationsIcon sx={{ color: orange[500] }} />;
      default:
        return <NotificationsIcon />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Notifications
      </Typography>
      <List sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
        {notifications.map((notification, index) => (
          <React.Fragment key={notification.id}>
            <ListItem
              alignItems="flex-start"
              sx={{
                bgcolor: notification.read ? 'transparent' : 'action.hover',
                transition: 'background-color 0.2s ease-in-out',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
              secondaryAction={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {!notification.read && (
                    <IconButton edge="end" aria-label="mark as read" size="small">
                      <CheckCircleIcon fontSize="small" />
                    </IconButton>
                  )}
                  <IconButton edge="end" aria-label="delete" size="small">
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              }
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'background.paper' }}>
                  {getNotificationIcon(notification.type)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography
                    variant="subtitle1"
                    color="text.primary"
                    sx={{ fontWeight: notification.read ? 400 : 600 }}
                  >
                    {notification.title}
                  </Typography>
                }
                secondary={
                  <React.Fragment>
                    <Typography
                      variant="body2"
                      color="text.primary"
                      sx={{ display: 'block', my: 0.5 }}
                    >
                      {notification.message}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      {notification.time}
                    </Typography>
                  </React.Fragment>
                }
              />
            </ListItem>
            {index < notifications.length - 1 && (
              <Divider variant="inset" component="li" />
            )}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default NotificationsPage;
