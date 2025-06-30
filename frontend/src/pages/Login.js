// src/pages/Login.js

import React, { useState } from "react";
import {
  TextField,
  Button,
  Container,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Box,
} from "@mui/material";
import { SafeStorage } from "../utils/SafeStorage";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
    role: "user",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  const selectedTenantId = SafeStorage.getItem("tenantId");
  const selectedTenantName = SafeStorage.getItem("tenantName");

  console.log("Selected Tenant:", { selectedTenantId, selectedTenantName });

  if (!selectedTenantId || !selectedTenantName) {
    alert("No tenant selected. Please return to tenant selection.");
    navigate("/");
    return;
  }

  try {
    const response = await axios.post("/api/auth/login", {
      email: credentials.email,
      password: credentials.password,
      tenantId: selectedTenantId, // Send selected tenantId to backend
    });

    const { token, user } = response.data;
 localStorage.setItem("token", token);
    // Store user tenant info
    localStorage.setItem("userTenantId", user.userTenantId || "");
    localStorage.setItem("role", user.role);
    localStorage.setItem("email", user.email);

    // Store selected tenant info
    localStorage.setItem("selectedTenantId", user.selectedTenantId);
    localStorage.setItem("selectedTenantName", user.selectedTenantName);

    // SafeStorage as fallback
    SafeStorage.setItem("tenantId", user.selectedTenantId, true);
    SafeStorage.setItem("tenantName", user.selectedTenantName, true);

    console.log("User Tenant ID:", user.userTenantId);
    console.log("Selected Tenant:", {
      tenantId: user.selectedTenantId,
      tenantName: user.selectedTenantName,
    });

      // Route based on role
      switch (credentials.role) {
        case "super-admin":
          navigate("/admin-dashboard");
          break;
        case "tenant-admin":
           console.log("🔐 Redirecting with selected tenant:");
    console.log("Tenant ID:", selectedTenantId?.tenantId);
    console.log("Tenant Name:", selectedTenantName?.tenantName);
    console.log("Logged-in User:", user);
          navigate("/tenant-dashboard");
          break;
        default:
          navigate("/dashboard");
          break;
      }
    } catch (error) {
      if (error.response?.status === 404) {
        alert("User not found. Redirecting to register page...");
        setTimeout(() => navigate("/register"), 2000);
      } else {
        alert("Login failed. Please check your credentials.");
      }
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ padding: 4, marginTop: 8 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Login
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            label="Email"
            name="email"
            fullWidth
            margin="normal"
            onChange={handleChange}
            required
          />
          <TextField
            label="Password"
            type="password"
            name="password"
            fullWidth
            margin="normal"
            onChange={handleChange}
            required
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select
              name="role"
              value={credentials.role}
              onChange={handleChange}
              required
              label="Role"
            >
              <MenuItem value="super-admin">Super Admin</MenuItem>
              <MenuItem value="tenant-admin">Tenant Admin</MenuItem>
              <MenuItem value="viewer">Viewer</MenuItem>
              <MenuItem value="editor">Editor</MenuItem>
              <MenuItem value="user">User</MenuItem>
            </Select>
          </FormControl>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
          >
            Login
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
