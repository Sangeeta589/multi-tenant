// src/pages/MyItems.js

import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, CircularProgress
} from '@mui/material';
import axios from 'axios';

const MyItems = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serviceRequests, setServiceRequests] = useState([]);
const email = localStorage.getItem('email')?.toLowerCase();
  const emailPrefix = email ? email.split('@')[0] : '';
  

  // In MyItems.js
useEffect(() => {
  const fetchItems = async () => {
    setLoading(true);
    try {
      const incidentRes = await axios.get(`/api/incidents/user/name/${email}`);
      setIncidents(Array.isArray(incidentRes.data) ? incidentRes.data : []);

      const serviceRes = await axios.get(`/api/service-requests/user/${emailPrefix}`);
      setServiceRequests(Array.isArray(serviceRes.data) ? serviceRes.data : []);
    } catch (err) {
      console.error('Error fetching items:', err);
      setIncidents([]);
      setServiceRequests([]);
    } finally {
      setLoading(false);
    }
  };

  if (emailPrefix) fetchItems();
}, [emailPrefix]);


  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        My Submitted Items
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        <>
          {/* Incidents Table */}
          <Typography variant="h6" gutterBottom>
            Incidents
          </Typography>
          <TableContainer component={Paper} sx={{ mb: 4 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Incident ID</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Summary</TableCell>
                  <TableCell>Urgency</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {incidents.map((incident) => (
                  <TableRow key={incident._id}>
                    <TableCell>{incident.incidentId}</TableCell>
                    <TableCell>{incident.status}</TableCell>
                    <TableCell>{incident.summary}</TableCell>
                    <TableCell>{incident.urgency}</TableCell>
                  </TableRow>
                ))}
                {incidents.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No incidents found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Service Requests Table */}
          <Typography variant="h6" gutterBottom>
            Service Requests
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Request ID</TableCell>
                  <TableCell>Admin Name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Database Name</TableCell>
                  <TableCell>IP Address</TableCell>
                  <TableCell>Permission</TableCell>
                  <TableCell>Additional Info</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {serviceRequests.map((request) => (
                  <TableRow key={request._id}>
                    <TableCell>{request.requestId}</TableCell>
                    <TableCell>{request.adminName}</TableCell>
                    <TableCell>{request.status}</TableCell>
                    <TableCell>{request.dbName}</TableCell>
                    <TableCell>{request.ip}</TableCell>
                    <TableCell>{request.permission ? 'Yes' : 'No'}</TableCell>
                    <TableCell>{request.additionalInfo || 'N/A'}</TableCell>
                  </TableRow>
                ))}
                {serviceRequests.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No service requests found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Box>
  );
};

export default MyItems;
