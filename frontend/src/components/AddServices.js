// src/pages/AddServiceForm.js
import React, { useState } from "react";
import {
  Box,
  TextField,
  Typography,
  MenuItem,
  Button,
  Alert,
  Paper,
} from "@mui/material";
import axios from "axios";
import AdminLayout from "../layouts/AdminLayout";

const iconOptions = [
  "Cloud",
  "Storage",
  "Computer",
  "Calendar",
  "Security",
  "Dns",
  "Wifi",
  "Monitor",
  "Firewall",
  "Backup",
  "Lock",
  "Settings",
  "DevOps",
  "Analytics",
  "AI",
  "Kubernetes",
  "Container",
  "CDN",
  "Queue",
  "Email",
  "API",
  "IAM",
  "Scheduler",
  "Function",
];


const AddServiceForm = () => {
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    icon: "Cloud",
  });
  const [status, setStatus] = useState(null); // success | error | null

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setStatus(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/services", formData);
      setStatus("success");
      setFormData({ title: "", category: "", icon: "Cloud" });
    } catch (err) {
      console.error("Error creating service:", err);
      setStatus("error");
    }
  };

  return (
    <AdminLayout>
    <Box sx={{ p: 4, maxWidth: 500, margin: "0 auto" }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Add New Service to Catalog
        </Typography>

        {status === "success" && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Service created successfully!
          </Alert>
        )}
        {status === "error" && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Failed to create service. Please try again.
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            fullWidth
            required
            sx={{ mb: 2 }}
          />

          <TextField
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            fullWidth
            required
            sx={{ mb: 2 }}
          />

          <TextField
            select
            label="Select Icon"
            name="icon"
            value={formData.icon}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 3 }}
          >
            {iconOptions.map((icon) => (
              <MenuItem key={icon} value={icon}>
                {icon}
              </MenuItem>
            ))}
          </TextField>

          <Button variant="contained" color="primary" type="submit" fullWidth>
            Add Service
          </Button>
        </form>
      </Paper>
    </Box>
    </AdminLayout>
  );
};

export default AddServiceForm;
