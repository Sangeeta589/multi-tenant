// Responsive AdminPage Component
import React, { useEffect, useState } from "react";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Box,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import axios from "axios";
import mongoose from "mongoose";
import AdminLayout from "../layouts/AdminLayout";

const AdminPage = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [tenantId, setTenantId] = useState({});
  const [error, setError] = useState("");

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("User not authenticated. Please log in.");
        return;
      }

      const response = await axios.get("http://localhost:5000/api/admin/pending-registrations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPendingUsers(response.data);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load pending users.");
    }
  };

  const generateTenantId = (userId) => {
    setTenantId((prev) => ({ ...prev, [userId]: new mongoose.Types.ObjectId().toHexString() }));
  };

  const handleApprove = async (userId) => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Please login again.");
    if (!tenantId[userId]) return alert("Please generate a Tenant ID first.");

    try {
      await axios.post(
        `http://localhost:5000/api/admin/approve/${userId}`,
        { tenantId: tenantId[userId] },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      alert("User approved successfully!");
      fetchPendingUsers();
    } catch (error) {
      alert("Error approving user: " + (error.response?.data?.message || "Unknown error"));
    }
  };

  const handleDecline = async (userId) => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Please login.");

    try {
      await axios.delete(`http://localhost:5000/api/admin/decline/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("User registration declined successfully.");
      fetchPendingUsers();
    } catch (error) {
      alert("Error declining user: " + (error.response?.data?.message || "Unknown error"));
    }
  };

  return (
    <AdminLayout>
      <Box
        sx={{
          px: { xs: 2, sm: 3, md: 6 },
          py: { xs: 3, md: 5 },
          maxWidth: "1000px",
          mx: "auto",
        }}
      >
        <Typography
          variant="h5"
          align="center"
          gutterBottom
          sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
        >
          Pending User Approvals
        </Typography>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <Paper elevation={3} sx={{ padding: { xs: 1, sm: 2 } }}>
          <Box sx={{ overflowX: "auto" }}>
            <TableContainer>
              <Table size={isMobile ? "small" : "medium"}>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Tenant ID</TableCell>
                    <TableCell colSpan={2}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingUsers.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: { xs: "column", sm: "row" },
                            alignItems: { sm: "center" },
                            gap: 1,
                          }}
                        >
                          <TextField
                            size="small"
                            value={tenantId[user._id] || ""}
                            placeholder="Generate Tenant ID"
                            disabled
                            sx={{ flexGrow: 1 }}
                          />
                          <Button
                            variant="outlined"
                            color="secondary"
                            size="small"
                            onClick={() => generateTenantId(user._id)}
                          >
                            Generate
                          </Button>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          fullWidth={isMobile}
                          onClick={() => handleApprove(user._id)}
                        >
                          Approve
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          fullWidth={isMobile}
                          onClick={() => handleDecline(user._id)}
                        >
                          Decline
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Paper>
      </Box>
    </AdminLayout>
  );
};

export default AdminPage;
