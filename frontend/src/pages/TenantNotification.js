import React, { useEffect, useState } from "react";
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
  Divider,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import axios from "axios";
import TenantLayout from "../layouts/TenantLayout";

const TenantNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get("/api/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          recipientType: "tenant-admin", // For tenant-admin
        },
      });

      // Filter access log notifications
      const accessLogNotifications = res.data.filter(
        (n) => n.type === "access-log"
      );
      setNotifications(accessLogNotifications);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
      setError("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };
const markAsRead = async () => {
      try {
        await axios.put('/api/notifications/notifications/mark-read', {
          recipientType: 'tenant-admin',
        });

        // Refresh the sidebar badge count after marking as read
        if (typeof window.refreshNotificationCount === 'function') {
          window.refreshNotificationCount();
        }

      } catch (err) {
        console.error('Failed to mark notifications as read', err);
      }
    };
  useEffect(() => {
    fetchNotifications();
    markAsRead();

  }, []);

  return (
    <TenantLayout>
      <Container>
        <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
          Access Log Notifications
        </Typography>

        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : notifications.length === 0 ? (
          <Typography>No access log notifications found.</Typography>
        ) : (
          <Paper>
            <List>
              {notifications.map((note) => (
                <React.Fragment key={note._id}>
                  <ListItem alignItems="flex-start">
                    <ListItemIcon>
                      <NotificationsIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={note.title || "Access Log Notification"}
                      secondary={
                        <>
                          <Typography variant="body2" color="text.primary">
                            {note.message}
                          </Typography>
                          <Typography variant="caption" display="block">
                            {new Date(note.createdAt).toLocaleString()}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>
          </Paper>
        )}
      </Container>
    </TenantLayout>
  );
};

export default TenantNotification;
