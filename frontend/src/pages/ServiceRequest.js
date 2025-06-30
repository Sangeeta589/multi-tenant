import React, { useState, useEffect } from 'react';
import {
  Box, Drawer, Typography, TextField, Button,
  Checkbox, FormControlLabel, Paper, Grid, Radio, RadioGroup
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import DescriptionIcon from '@mui/icons-material/Description';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { SafeStorage } from '../utils/SafeStorage';

const drawerWidth = 70;

const ServiceRequestForm = () => {
  const { category } = useParams(); // example: 'Load Balancer'
  const navigate = useNavigate();

  const normalizedCategory = (category || '').toLowerCase().replace(/\s/g, ''); // Normalize to 'loadbalancer'

  const [requestId, setRequestId] = useState('');
  const [formData, setFormData] = useState({
    ip: '',
    Name: '',
    permission: false,
    adminName: '',
    additionalInfo: '',
    publicOrPrivate: '',
    bandwidth: '',
    subnet: '',
  });

  const email = localStorage.getItem('email') || '';
  const emailPrefix = email.split('@')[0];
const tenantId = localStorage.getItem('tenantId') || '';
const tenantName = localStorage.getItem('tenantName') || '';

console.log(tenantName);  // ✅ Fixes the ESLint error

  useEffect(() => {
    if (email) {
      const generatedId = `${emailPrefix}-${Date.now()}`;
      setRequestId(generatedId);
      setFormData(prev => ({
        ...prev,
        Name: category || ''
      }));
    } else {
      alert("User not found. Please log in again.");
    }
  }, [email, category]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      requestId,
      Name: category,
      ip: formData.ip,
      permission: formData.permission,
      adminName: formData.adminName,
      additionalInfo: formData.additionalInfo,
      createdBy: emailPrefix,
      reporterEmail: email,
      tenantId,
  tenantName,
      ...(normalizedCategory === 'loadbalancer' && {
        publicOrPrivate: formData.publicOrPrivate,
        bandwidth: formData.bandwidth,
        subnet: formData.subnet,
      }),
    };

    try {
      await axios.post("/api/service-requests", payload);
      alert("Service request submitted successfully!");

      setFormData({
        Name: '',
        ip: '',
        permission: false,
        adminName: formData.adminName,
        additionalInfo: '',
        publicOrPrivate: '',
        bandwidth: '',
        subnet: '',
      });

      const newId = `${emailPrefix}-${Date.now()}`;
      setRequestId(newId);
    } catch (error) {
      console.error("Error submitting request:", error.response?.data || error.message);
      alert("Failed to submit request.");
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            alignItems: 'center',
            pt: 2,
          },
        }}
      >
        <HomeIcon sx={{ mb: 4, color: 'grey.600', cursor: 'pointer' }} onClick={() => navigate('/service-dashboard')} />
        <DescriptionIcon sx={{ mb: 4, color: 'grey.600', cursor: 'pointer' }} onClick={() => navigate('/catalog')} />
        <ReportProblemIcon sx={{ color: 'grey.600', cursor: 'pointer' }} onClick={() => navigate('/my-items')} />
      </Drawer>

      <Box
        component="main"
        sx={{ flexGrow: 1, p: 4, backgroundColor: '#f4f6f8', minHeight: '100vh' }}
      >
        <Typography variant="h5" gutterBottom>
          New Service Request
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Submit request for: <strong>{category}</strong>
        </Typography>

        <Paper elevation={3} sx={{ p: 4, maxWidth: 700 }}>
          <Box mb={3}>
            <Typography><strong>Request ID:</strong> <span style={{ color: '#1976d2' }}>{requestId}</span></Typography>
            <Typography><strong>Status:</strong> <span style={{ color: 'green' }}>logged</span></Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Service Name"
                  fullWidth
                  name="Name"
                  value={formData.Name}
                  disabled
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="IP Address"
                  fullWidth
                  name="ip"
                  value={formData.ip}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.permission}
                      onChange={handleChange}
                      name="permission"
                    />
                  }
                  label="Permission"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Admin/User Name"
                  fullWidth
                  name="adminName"
                  value={formData.adminName}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Additional Info"
                  fullWidth
                  multiline
                  minRows={3}
                  name="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={handleChange}
                />
              </Grid>

              {normalizedCategory === 'loadbalancer' && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>Choose IP Type</Typography>
                    <RadioGroup
                      row
                      name="publicOrPrivate"
                      value={formData.publicOrPrivate}
                      onChange={handleChange}
                    >
                      <FormControlLabel value="public" control={<Radio />} label="Public" />
                      <FormControlLabel value="private" control={<Radio />} label="Private" />
                    </RadioGroup>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      label="Bandwidth"
                      fullWidth
                      name="bandwidth"
                      value={formData.bandwidth}
                      onChange={handleChange}
                      required
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      label="Subnet"
                      fullWidth
                      name="subnet"
                      value={formData.subnet}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                </>
              )}

              <Grid item xs={12}>
                <Button type="submit" variant="contained" color="primary">
                  Submit Request
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </Box>
  );
};

export default ServiceRequestForm;
