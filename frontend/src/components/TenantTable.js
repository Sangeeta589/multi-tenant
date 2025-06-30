// src/components/TenantTable.js

import React, { useState, useEffect } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Box, useMediaQuery
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import TenantLayout from "../layouts/TenantLayout";

const TenantTable = () => {
  const [tenants, setTenants] = useState([]);
  const [error, setError] = useState(null);

  const [selectedTenant, setSelectedTenant] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editedTenant, setEditedTenant] = useState({ name: "", tenantId: "" });

  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const fetchTenants = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/tenants/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTenants(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error fetching tenants:", error);
      setError("Failed to fetch tenants. Please try again later.");
      setTenants([]);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleView = (tenant) => {
    setSelectedTenant(tenant);
    setIsViewOpen(true);
  };

  const handleEdit = (tenant) => {
    setSelectedTenant(tenant);
    setEditedTenant({ tenantName: tenant.tenantName, tenantId: tenant.tenantId });
    setIsEditOpen(true);
  };

  const handleUpdateTenant = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/tenants/${selectedTenant._id}`, editedTenant, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsEditOpen(false);
      fetchTenants(); // Refresh table
    } catch (error) {
      console.error("Error updating tenant:", error);
    }
  };

  return (
    <TenantLayout>
    <Paper sx={{ width: "95%", margin: "auto", p: isMobile ? 2 : 3, mt: 5 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between",
          alignItems: isMobile ? "flex-start" : "center",
          mb: 2,
          gap: 2
        }}
      >
        <Typography variant="h6">Tenant List</Typography>
        <Button
          variant="contained"
          onClick={() => navigate("/create-tenant")}
        >
          Create Tenant
        </Button>
      </Box>

      {error && <Typography color="error">{error}</Typography>}

      <TableContainer component={Paper}>
        <Table size={isMobile ? "small" : "medium"}>
          <TableHead>
            <TableRow>
              <TableCell><strong>Tenant Name</strong></TableCell>
              <TableCell><strong>Tenant ID</strong></TableCell>
              <TableCell><strong>Created At</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tenants.map((tenant) => (
              <TableRow key={tenant._id}>
                <TableCell>{tenant.tenantName}</TableCell>
                <TableCell>{tenant.tenantId}</TableCell>
                <TableCell>{new Date(tenant.createdAt).toLocaleString()}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ mr: 1, mb: isMobile ? 1 : 0 }}
                    onClick={() => handleView(tenant)}
                  >
                    View
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleEdit(tenant)}
                  >
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* View Dialog */}
      <Dialog open={isViewOpen} onClose={() => setIsViewOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>View Tenant</DialogTitle>
        <DialogContent dividers>
          {selectedTenant && (
            <>
              <Typography><strong>Name:</strong> {selectedTenant.tenantName}</Typography>
              <Typography><strong>Tenant ID:</strong> {selectedTenant.tenantId}</Typography>
              <Typography><strong>Created At:</strong> {new Date(selectedTenant.createdAt).toLocaleString()}</Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsViewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onClose={() => setIsEditOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Tenant</DialogTitle>
        <DialogContent dividers>
          <TextField
            margin="dense"
            label="Tenant Name"
            fullWidth
            value={editedTenant.tenantName}
            onChange={(e) => setEditedTenant({ ...editedTenant, tenantName: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Tenant ID"
            fullWidth
            value={editedTenant.tenantId}
            onChange={(e) => setEditedTenant({ ...editedTenant, tenantId: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateTenant}>Save</Button>
        </DialogActions>
      </Dialog>
    </Paper>
    </TenantLayout>
  );
};

export default TenantTable;
