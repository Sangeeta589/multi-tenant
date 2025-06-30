// src/components/CreateTenant.js

import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
} from "@mui/material";
import axios from "axios";
import mongoose from "mongoose";
import { useNavigate } from "react-router-dom";
import TenantLayout from "../layouts/TenantLayout";

const CreateTenant = () => {
  const [tenantName, settenantName] = useState("");
  const [tenantId, setTenantId] = useState("");
  const navigate = useNavigate();

  const generateTenantId = () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    setTenantId(id);
  };

  const handleCreate = async () => {
    try {
      const token = localStorage.getItem("token"); // Get the token from local storage
      const res = await axios.post("http://localhost:5000/api/tenants/create-tenant", {
        tenantName,
        tenantId,
      }, {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the headers
        },
      });
      alert("Tenant created!");
      settenantName("");
      setTenantId("");
      navigate("/tenants");
    } catch (error) {
      alert("Error creating tenant: " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <TenantLayout>
      <Paper elevation={3} sx={{ maxWidth: 600, margin: "auto", p: 4, mt: 5 }}>
        <Typography variant="h5" gutterBottom>
          Create Tenant
        </Typography>
        <form onSubmit={(e) => { e.preventDefault(); handleCreate(); }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Tenant Name"
                value={tenantName}
                onChange={(e) => settenantName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Tenant ID"
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
              />
            </Grid>
            <Grid item xs={6}>
              <Button
                onClick={generateTenantId}
                variant="outlined"
                fullWidth
              >
                Generate ID
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
              >
                Create
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </TenantLayout>
  );
};

export default CreateTenant;
