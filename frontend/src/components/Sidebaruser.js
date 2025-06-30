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
import DashboardIcon from "@mui/icons-material/Dashboard";
import CloudIcon from "@mui/icons-material/Cloud";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AssignmentIcon from "@mui/icons-material/Assignment";
import MenuIcon from "@mui/icons-material/Menu";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Sidebaruser = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  const toggleDrawer = () => {
    setOpen(!open);
  };

  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        const response = await axios.get("/api/notifications/notifications/count", {
          params: { recipientType: "user" },
        });
        setNotificationCount(response.data.count || 0);
      } catch (error) {
        console.error("Failed to fetch notification count", error);
      }
    };

     window.refreshNotificationCount = fetchNotificationCount;
  fetchNotificationCount();
  return () => {
    window.refreshNotificationCount = null;
  };
  }, []);

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    { text: "Resources", icon: <CloudIcon />, path: "/user-resources" },
    {
      text: "Notification",
      icon: (
        <Badge
          badgeContent={notificationCount}
          color="error"
          overlap="circular"
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          sx={{
            "& .MuiBadge-badge": {
              fontSize: "0.7rem",
              height: 18,
              minWidth: 18,
            },
          }}
          invisible={notificationCount === 0}
        >
          <NotificationsIcon />
        </Badge>
      ),
      path: "/user-notifi",
    },
    {
      text: "Service Requests",
      icon: <AssignmentIcon />,
      path: "/service-dashboard",
    },
  ];

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: open ? 200 : 80,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? 200 : 80,
          boxSizing: "border-box",
          backgroundColor: "#005b96",
          color: "#fff",
          transition: "width 0.3s",
          overflow: "visible", // 🧠 Important to show badge outside icon
        },
      }}
    >
      <List>
        {/* Toggle drawer button */}
        <ListItem button onClick={toggleDrawer}>
          <ListItemIcon sx={{ color: "#fff" }}>
            <MenuIcon />
          </ListItemIcon>
          {open && <ListItemText primary="Menu" />}
        </ListItem>

        {/* Menu items */}
        {menuItems.map((item) => (
          <Tooltip
            key={item.text}
            title={!open ? item.text : ""}
            placement="right"
            arrow
          >
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

export default Sidebaruser;