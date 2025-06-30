import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Alert,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import axios from 'axios';
import Sidebaruser from '../components/Sidebaruser';
import UserLayout from '../layouts/UserLayout';

const UserNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get('/api/notifications', {
          params: {
            recipientType: 'user',
          },
        });
        setNotifications(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError('Failed to load notifications.');
        setLoading(false);
      }
    };

    const markAsRead = async () => {
      try {
        await axios.put('/api/notifications/notifications/mark-read', {
          recipientType: 'user',
        });

        // Refresh the sidebar badge count after marking as read
        if (typeof window.refreshNotificationCount === 'function') {
          window.refreshNotificationCount();
        }

      } catch (err) {
        console.error('Failed to mark notifications as read', err);
      }
    };

    // Fetch notifications and mark them as read
    fetchNotifications();
    markAsRead();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ textAlign: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Sidebaruser />
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <UserLayout>
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Sidebaruser />
      <Typography variant="h5" gutterBottom>
        Notifications
      </Typography>
      {notifications.length === 0 ? (
        <Typography>No notifications to display.</Typography>
      ) : (
        <Paper>
          <List>
            {notifications.map((notification) => (
              <ListItem key={notification._id} divider>
                <ListItemIcon>
                  <NotificationsIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary={notification.message}
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary" component="span">
                        From: {notification.title || 'Admin'} •{' '}
                        {new Date(notification.createdAt).toLocaleString()}
                      </Typography>
                      <br />
                      <Typography variant="caption" color="primary">
                        Sent by: Admin
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Container>
    </UserLayout>
  );
};

export default UserNotification;
