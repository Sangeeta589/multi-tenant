import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
  TextField,
  Card,
  CardContent,
  Autocomplete,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
} from "@mui/material";

import CloudIcon from "@mui/icons-material/Cloud";
import StorageIcon from "@mui/icons-material/Storage";
import ComputerIcon from "@mui/icons-material/Computer";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SecurityIcon from "@mui/icons-material/Security";
import DnsIcon from "@mui/icons-material/Dns";
import WifiIcon from "@mui/icons-material/Wifi";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import GppGoodIcon from "@mui/icons-material/GppGood";
import BackupIcon from "@mui/icons-material/Backup";
import LockIcon from "@mui/icons-material/Lock";
import SettingsIcon from "@mui/icons-material/Settings";
import BuildIcon from "@mui/icons-material/Build";
import BarChartIcon from "@mui/icons-material/BarChart";
import PsychologyIcon from "@mui/icons-material/Psychology";
import BubbleChartIcon from "@mui/icons-material/BubbleChart";
import AllInboxIcon from "@mui/icons-material/AllInbox";
import SpeedIcon from "@mui/icons-material/Speed";
import MarkunreadMailboxIcon from "@mui/icons-material/MarkunreadMailbox";
import EmailIcon from "@mui/icons-material/Email";
import ApiIcon from "@mui/icons-material/Api";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import SearchIcon from "@mui/icons-material/Search";

import { useNavigate } from "react-router-dom";

const iconMap = {
  Cloud: <CloudIcon fontSize="large" />,
  Storage: <StorageIcon fontSize="large" />,
  Computer: <ComputerIcon fontSize="large" />,
  Calendar: <CalendarMonthIcon fontSize="large" />,
  Security: <SecurityIcon fontSize="large" />,
  Dns: <DnsIcon fontSize="large" />,
  Wifi: <WifiIcon fontSize="large" />,
  Monitor: <MonitorHeartIcon fontSize="large" />,
  Firewall: <GppGoodIcon fontSize="large" />,
  Backup: <BackupIcon fontSize="large" />,
  Lock: <LockIcon fontSize="large" />,
  Settings: <SettingsIcon fontSize="large" />,
  DevOps: <BuildIcon fontSize="large" />,
  Analytics: <BarChartIcon fontSize="large" />,
  AI: <PsychologyIcon fontSize="large" />,
  Kubernetes: <BubbleChartIcon fontSize="large" />,
  Container: <AllInboxIcon fontSize="large" />,
  CDN: <SpeedIcon fontSize="large" />,
  Queue: <MarkunreadMailboxIcon fontSize="large" />,
  Email: <EmailIcon fontSize="large" />,
  API: <ApiIcon fontSize="large" />,
  IAM: <VerifiedUserIcon fontSize="large" />,
  Scheduler: <CalendarMonthIcon fontSize="large" />,
  Function: <FlashOnIcon fontSize="large" />,
  LoadBalancer: <SwapVertIcon fontSize="large" />,
  Default: <AddCircleIcon fontSize="large" />,
};

const staticServices = [
  { category: "Load Balancer", title: "Add New LoadBalancer", icon: "Cloud" },
  { category: "Schedule Activity", title: "Connectivity Test", icon: "Calendar" },
  { category: "Database", title: "Create Database", icon: "Storage" },
  { category: "Computer", title: "Create Backup System", icon: "Computer" },
  { category: "Storage", title: "Expand Storage Capacity", icon: "Storage" },
  { category: "Firewall", title: "Configure Firewall", icon: "Firewall" },
  { category: "Security", title: "Scan for Vulnerabilities", icon: "Security" },
  { category: "Monitoring", title: "Set Up Alerts", icon: "Monitor" },
  { category: "Networking", title: "Create VLAN", icon: "Wifi" },
];

const fixedFilters = ["Report New Incident", "Schedule Activity"];

const ServiceCatalog = () => {
  const navigate = useNavigate();
  const [selectedTitle, setSelectedTitle] = useState("Most popular");
  const [searchQuery, setSearchQuery] = useState("");
  const [dynamicServices, setDynamicServices] = useState([]);
  const [filters, setFilters] = useState(fixedFilters);

  useEffect(() => {
    const fetchDynamicServices = async () => {
      try {
        const res = await fetch("/api/services/all");
        const data = await res.json();
        setDynamicServices(data);

        const allTitles = [
          ...fixedFilters,
          ...staticServices.map((s) => s.title),
          ...data.map((s) => s.title),
        ];
        const unique = Array.from(new Set(allTitles));
        setFilters(unique);
      } catch (err) {
        console.error("Error fetching services:", err);
      }
    };
    fetchDynamicServices();
  }, []);

  const handleCardClick = (category) => {
    navigate(`/service-request/${encodeURIComponent(category)}`);
  };

  const handleFilterChange = (event, newValue) => {
    if (newValue === "Report New Incident") {
      navigate("/incidents");
    } else if (newValue) {
      setSelectedTitle(newValue);
      setSearchQuery("");
    }
  };

  const handleListClick = (filter) => {
    if (filter === "Report New Incident") {
      navigate("/incidents");
    } else {
      setSelectedTitle(filter);
      setSearchQuery("");
    }
  };

  const allServices = [
    ...staticServices,
    ...dynamicServices.map((srv) => ({
      ...srv,
      icon: srv.icon || "Default",
    })),
  ];

  const filteredServices = allServices.filter((service) => {
    const matchesSearch = service.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      selectedTitle === "Most popular" || service.title === selectedTitle;
    return matchesSearch && matchesFilter;
  });

  return (
    <Box sx={{ display: "flex", height: "100vh", backgroundColor: "#f4f7fa" }}>
      {/* Sidebar */}
      <Box
        sx={{
          width: 250,
          backgroundColor: "#ffffff",
          p: 2,
          boxShadow: 2,
          overflowY: "auto",
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 2 }}>
          Filter Options
        </Typography>

        <Autocomplete
          disablePortal
          options={filters}
          value={selectedTitle}
          onChange={handleFilterChange}
          renderInput={(params) => (
            <TextField {...params} label="Search Filters" variant="outlined" size="small" />
          )}
          sx={{ mb: 2 }}
        />

        <List>
          {filters.map((filter, index) => (
            <ListItem disablePadding key={index}>
              <ListItemButton
                selected={selectedTitle === filter}
                onClick={() => handleListClick(filter)}
                sx={{
                  width: "100%",
                  px: 2,
                  py: 1,
                  borderRadius: 1,
                  "&.Mui-selected": {
                    backgroundColor: "#e3f2fd",
                    fontWeight: "bold",
                  },
                  "&:hover": {
                    backgroundColor: "#f0f0f0",
                  },
                }}
              >
                <ListItemText primary={filter} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, p: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h5" fontWeight="bold">
            Service Catalog
          </Typography>
        </Box>

        <Typography variant="subtitle1" gutterBottom>
          {selectedTitle === "Most popular"
            ? "Popular Items"
            : `Filtered by: ${selectedTitle}`}
        </Typography>

        <TextField
          placeholder="Search services..."
          variant="outlined"
          fullWidth
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <Box component={SearchIcon} sx={{ mr: 1, color: "gray" }} />
            ),
          }}
        />

        <Grid container spacing={3}>
          {filteredServices.length > 0 ? (
            filteredServices.map((service, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  onClick={() => handleCardClick(service.category)}
                  sx={{
                    height: 160,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    cursor: "pointer",
                    transition: "transform 0.2s",
                    "&:hover": { transform: "scale(1.05)" },
                  }}
                >
                  <CardContent>
                    <Box sx={{ textAlign: "center" }}>
                      {iconMap[service.icon] || iconMap.Default}
                      <Typography variant="body2" sx={{ mt: 1, fontWeight: "bold" }}>
                        {service.category}
                      </Typography>
                      <Typography variant="subtitle1">{service.title}</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Typography>No services found matching your criteria.</Typography>
          )}
        </Grid>
      </Box>
    </Box>
  );
};

export default ServiceCatalog;
