//src/pages/TenancyLogin.js
import React, { useState } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  Typography,
  Box,
  AppBar,
  Toolbar,
  Paper,
  Divider,
} from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import logo from "../images/logo.png"; // Ensure your logo path is correct
import { SafeStorage } from "../utils/SafeStorage";

const TenancyLogin = () => {
  const [tenantName, setTenantName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  console.log("Submitted tenantName:", tenantName);

  try {
    const res = await axios.post("/api/tenants/validate-by-name", {
      tenantName: tenantName,
    });

    console.log("API Response:", res.data);

    const tenantId = res.data.tenantId;
    const validatedTenantName = res.data.tenantName;

    console.log("Storing tenantId:", tenantId);
    console.log("Storing tenantName:", validatedTenantName);

    SafeStorage.setItem("tenantId", tenantId, true);   // force = true allows initial setting
    SafeStorage.setItem("tenantName", validatedTenantName, true);

    setTimeout(() => {
      console.log("Navigating to /login with tenantId:", tenantId);
      navigate("/login", { state: { tenantId } });
    }, 1000);
  } catch (err) {
    console.error("Validation Error:", err.response?.data || err.message);
    setError(err.response?.data?.message || "Error validating tenant name");
  }
};

  return (
    <>
      {/* Custom Navbar with different background */}
      <AppBar position="static" sx={{ backgroundColor: "#e0e0e0" }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box display="flex" alignItems="center">
            <img
              src={logo}
              alt="Company Logo"
              style={{ height: 60, marginRight: 12}}
            />
            <Typography variant="h6" sx={{ color: "#000" }}>
              Phoenix Console
            </Typography>
          </Box>
          <Button
            variant="contained"
            sx={{ backgroundColor: "#005b96", color: "#fff" }}
            onClick={() => navigate("/register")}
          >
            Sign up with Cloud Account
          </Button>
        </Toolbar>
      </AppBar>

      {/* Centered Form */}
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="90vh"
        sx={{ backgroundColor: "#f5f5f5", px: 2 }}
      >
        <Paper
          elevation={3}
          sx={{ p: 5, maxWidth: 400, width: "100%", borderRadius: 2 }}
        >
          <Typography variant="h6" gutterBottom>
            Tenancy Name
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              variant="outlined"
              fullWidth
              placeholder="Enter your tenancy name"
              value={tenantName}
              onChange={(e) => setTenantName(e.target.value)}
              sx={{ mb: 2 }}
            />

            <Button
              variant="contained"
              fullWidth
              type="submit"
              sx={{
                backgroundColor: "#2e2e2e",
                color: "white",
                fontWeight: "bold",
                textTransform: "none",
                mb: 2,
                "&:hover": {
                  backgroundColor: "#1c1c1c",
                },
              }}
            >
              Next
            </Button>
          </form>

          {error && (
            <Typography color="error" variant="body2" mb={2}>
              {error}
            </Typography>
          )}

          <Typography variant="body2" sx={{ mb: 0.5 }}>
            Forgot your tenancy name?{" "}
            <Link to="#" style={{ textDecoration: "underline" }}>
              Get help
            </Link>
          </Typography>
          <Typography variant="body2">
            Do you have a Traditional Cloud Account?{" "}
            <Link to="#" style={{ textDecoration: "underline" }}>
              Sign In
            </Link>
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="body2" gutterBottom>
            Not a Phoenix Console customer yet?
          </Typography>
          <Button
            variant="contained"
            sx={{ backgroundColor: "#005b96", color: "#fff" }}
            onClick={() => navigate("/register")}
          >
            Sign Up
          </Button>
        </Paper>
      </Box>
    </>
  );
};

export default TenancyLogin;
