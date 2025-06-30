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
import Sidebaradmin from '../components/Sidebaradmin';

const AdminNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get('/api/notifications', {
          params: {
            recipientType: 'admin',
          }
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
          recipientType: 'admin',
        });
      } catch (err) {
        console.error('Failed to mark notifications as read', err);
      }
    };

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
        <Sidebaradmin />
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Sidebaradmin />
      <Typography variant="h5" gutterBottom>
        User Notifications
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
                      {notification.title && (
                        <Typography variant="body2" color="text.secondary" component="span">
                          From: {notification.title} •{' '}
                        </Typography>
                      )}
                      <Typography variant="body2" color="text.secondary" component="span">
                        {new Date(notification.createdAt).toLocaleString()}
                      </Typography>
                      <br />
                      <Typography variant="caption" color="primary">
                        {notification.recipientType === 'user'
                          ? 'Sent to: user'
                          : 'Sent by: user'}
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
  );
};

export default AdminNotification;
