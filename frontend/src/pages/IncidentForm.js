import React, { useState, useEffect } from 'react';
import {
  Box, Drawer, Typography, TextField, MenuItem,
  Button, Paper, Grid
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import HomeIcon from '@mui/icons-material/Home';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import axios from 'axios';
import { SafeStorage } from '../utils/SafeStorage';
import { useNavigate , useLocation} from 'react-router-dom';

const drawerWidth = 70;

const IncidentForm = () => {
  const [incidentId, setIncidentId] = useState('');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState('Medium');
  const [tenantId, setTenantId] = useState('');
  const [tenantName, setTenantName] = useState('');
  const navigate = useNavigate();
const location = useLocation();

 const queryParams = new URLSearchParams(location.search);
  const resourceId = queryParams.get('resourceId');
  const resourceName = queryParams.get('resourceName');
  const provider = queryParams.get('provider');
  useEffect(() => {
    const email = localStorage.getItem('email');
    const tenantId = localStorage.getItem('tenantId');
const tenantName = localStorage.getItem('tenantName');
    if (email && tenantId && tenantName) {
      const newId = `${email.split('@')[0]}-${Date.now()}`;
      setIncidentId(newId);
       setTenantId(tenantId);
      setTenantName(tenantName);
    } else {
      alert("User info missing. Please log in again.");
    }
    if (resourceName || provider) {
      const prefillSummary = `Incident for ${resourceName || 'Resource'} (Provider: ${provider || 'N/A'})`;
      setSummary(prefillSummary);
    }
  }, [resourceName, provider]);

 const handleSubmit = async (e) => {
  e.preventDefault();

  const tenantInfo = {
    tenantId: SafeStorage.getItem("tenantId"),
    tenantName: SafeStorage.getItem("tenantName"),
  };

  const email = localStorage.getItem('email');
  const reporterEmail = email;

  if (!incidentId || !summary || !description || !tenantInfo.tenantId || !tenantInfo.tenantName || !email) {
    alert("Missing required fields!");
    return;
  }

  const newIncident = {
    incidentId,
    status: 'logged',
    summary,
    description,
    urgency,
    tenantId: tenantInfo.tenantId,
    tenantName: tenantInfo.tenantName,
    createdBy: email,
    resourceId,
    resourceName,
    provider,
    reporterEmail,
  };

  try {
    await axios.post('http://localhost:5000/api/incidents', newIncident);
    alert('Incident submitted successfully!');
    setSummary('');
    setDescription('');
    setUrgency('Medium');
    const newId = `${email.split('@')[0]}-${Date.now()}`;
    setIncidentId(newId);
  } catch (error) {
    console.error(error);
    alert('Error submitting incident');
  }
};
  return (
    <Box sx={{ display: 'flex' }}>
      {/* Sidebar */}
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
        <HomeIcon
          sx={{ mb: 4, color: 'grey.600', cursor: 'pointer' }}
          onClick={() => navigate('/service-dashboard')}
        />
        <DescriptionIcon
          sx={{ mb: 4, color: 'grey.600', cursor: 'pointer' }}
          onClick={() => navigate('/catalog')}
        />
        <ReportProblemIcon
          sx={{ color: 'grey.600', cursor: 'pointer' }}
          onClick={() => navigate('/my-items')}
        />
      </Drawer>

      {/* Main Form */}
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 4, backgroundColor: '#f4f6f8', minHeight: '100vh' }}
      >
        <Typography variant="h5" gutterBottom>
          New Incident
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Submit New Generic Incident
        </Typography>

        <Paper elevation={3} sx={{ p: 4, maxWidth: 700 }}>
          <Box mb={3}>
            <Typography>
              <strong>Incident ID:</strong> <span style={{ color: '#1976d2' }}>{incidentId}</span>
            </Typography>
            <Typography>
              <strong>Status:</strong> <span style={{ color: 'green' }}>logged</span>
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Summary"
                  fullWidth
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Description"
                  fullWidth
                  multiline
                  minRows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Urgency"
                  select
                  fullWidth
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value)}
                >
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <Button type="submit" variant="contained" color="primary">
                  Submit Incident
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </Box>
  );
};

export default IncidentForm;
