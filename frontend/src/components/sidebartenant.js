import React, { useState, useEffect } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Badge,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import CloudIcon from "@mui/icons-material/Cloud";
import GroupIcon from "@mui/icons-material/Group";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const SidebarTenant = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  const toggleDrawer = () => setOpen(!open);

  const fetchNotificationCount = async () => {
    try {
      const response = await axios.get("/api/notifications/notifications/count", {
        params: { recipientType: "admin" },
      });
      setNotificationCount(response.data.count || 0);
    } catch (error) {
      console.error("Failed to fetch notification count", error);
    }
  };

  useEffect(() => {
    fetchNotificationCount();
    window.refreshNotificationCount = fetchNotificationCount;
    return () => {
      window.refreshNotificationCount = null;
    };
  }, []);

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/tenant-dashboard" },
    { text: "Resources", icon: <CloudIcon />, path: "/resources" },
    { text: "Tenants", icon: <GroupIcon />, path: "/tenants" },
    {
      text: "Notification",
      icon: (
        <Badge badgeContent={notificationCount} color="error">
          <NotificationsIcon />
        </Badge>
      ),
      path: "/tenant-notifi",
    },
  ];

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: open ? 200 : 80,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: open ? 200 : 80,
          boxSizing: "border-box",
          backgroundColor: "#005b96",
          color: "#fff",
          transition: "width 0.3s",
        },
      }}
    >
      <List>
        <ListItem button onClick={toggleDrawer}>
          <ListItemIcon sx={{ color: "#fff" }}>
            <MenuIcon />
          </ListItemIcon>
          {open && <ListItemText primary="Menu" />}
        </ListItem>

        {menuItems.map((item) => (
          <Tooltip key={item.text} title={!open ? item.text : ""} placement="right" arrow>
            <ListItem button onClick={() => navigate(item.path)}>
              <ListItemIcon sx={{ color: "#fff" }}>{item.icon}</ListItemIcon>
              {open && <ListItemText primary={item.text} />}
            </ListItem>
          </Tooltip>
        ))}
      </List>
    </Drawer>
  );
};

export default SidebarTenant;
