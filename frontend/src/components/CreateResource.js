//src/components/CreateResource.js

import React, { useState , useEffect} from 'react';
import { TextField, Button, MenuItem, Paper, Typography, Select, FormControl, InputLabel ,Box} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TenantLayout from '../layouts/TenantLayout';

const processors = [
  "Intel Xeon",
  "Intel Core i9",
  "AMD EPYC",
  "AMD Ryzen",
  "ARM Neoverse",
  "NVIDIA Grace CPU",
];
const regions = [
  { name: "US East (Ashburn)", key: "us-ashburn-1" },
  { name: "US West (Phoenix)", key: "us-phoenix-1" },
  { name: "Canada Southeast (Toronto)", key: "ca-toronto-1" },
  { name: "Brazil East (São Paulo)", key: "sa-saopaulo-1" },
  { name: "UK South (London)", key: "uk-london-1" },
  { name: "Germany Central (Frankfurt)", key: "eu-frankfurt-1" },
  { name: "France Central (Paris)", key: "eu-paris-1" },
  { name: "Switzerland North (Zurich)", key: "eu-zurich-1" },
  { name: "India West (Mumbai)", key: "ap-mumbai-1" },
  { name: "India South (Hyderabad)", key: "ap-hyderabad-1" },
  { name: "Australia East (Sydney)", key: "ap-sydney-1" },
  { name: "Australia Southeast (Melbourne)", key: "ap-melbourne-1" },
  { name: "Japan East (Tokyo)", key: "ap-tokyo-1" },
  { name: "South Korea Central (Seoul)", key: "ap-seoul-1" },
  { name: "Singapore", key: "ap-singapore-1" },
  { name: "UAE East (Dubai)", key: "me-dubai-1" },
  { name: "Saudi Arabia West (Jeddah)", key: "me-jeddah-1" },
];

const allowedCpuOptions = [1, 2, 4, 8, 16, 32, 64, 128,256,512];
const CreateResource = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole]=useState("");
  const [tenants, setTenants] = useState([]);
  const [resource, setResource] = useState({
    name: '',
    type: '',
    provider: '',
    region: '',
    cost: '',
    status: '',
    tenantId: '',
    cpu: '',
    memory: '',
    processor: '',
  });
  useEffect(() => {
    fetchUserRole();
    fetchTenants();
  }, []);

  const fetchUserRole = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("User not authenticated. Please log in.");
        return;
      }

      const response = await axios.get("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUserRole(response.data.role);
    } catch (error) {
      console.error("Error fetching user role:", error);
    }
  };
  const fetchTenants = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/tenants/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Tenants response:", res.data); // ✅ Check structure here
  
      // Ensure res.data is an array before setting tenants
      if (Array.isArray(res.data)) {
        setTenants(res.data);
      } else if (res.data && Array.isArray(res.data.tenants)) {
        setTenants(res.data.tenants);
      } else {
        setTenants([]); // Fallback to an empty array
        console.error("Unexpected tenants data format:", res.data);
      }
    } catch (error) {
      console.error("Error fetching tenants:", error);
      setTenants([]); // Fallback in case of error
    }
  };
  
  
  const handleChange = (e) => {
    setResource({ ...resource, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (userRole !== "tenant-admin") {
      alert("Access Denied: Only Tenant Admins can create resources.");
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert("User not authenticated. Please log in.");
      return;
    }
    try {
      await axios.post(
        'http://localhost:5000/api/resources/create',
        resource,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      alert("Resource Created Successfully!");
      navigate('/resources');
    } catch (error) {
      alert("Error creating resource: " + (error.response?.data?.message || "Unknown error"));
    }
  };

  return (
    <TenantLayout>
    <Paper elevation={3} sx={{ maxWidth: 600, margin: "auto", p: 4 }}>
      <Typography variant="h4" gutterBottom>Create Resource</Typography>
      {userRole !== "tenant-admin" ? (
        <Typography color="error">Access Denied: Only Tenant Admins can create resources.</Typography>
      ) : (
        <>
          <form onSubmit={handleSubmit}>
            <TextField fullWidth label="Name" name="name" value={resource.name} onChange={handleChange} margin="normal" required />
  
            <FormControl fullWidth margin="normal">
              <InputLabel>Type</InputLabel>
              <Select name="type" value={resource.type} onChange={handleChange} required>
                <MenuItem value="Compute">COMPUTE</MenuItem>
                <MenuItem value="VCN">VCN</MenuItem>
                <MenuItem value="Database">DATABASE</MenuItem>
              </Select>
            </FormControl>
  {/* Show CPU only for Compute */}
              {resource.type === "Compute" && (
                <FormControl fullWidth margin="normal">
                  <InputLabel>Number of CPUs</InputLabel>
                  <Select
                    name="cpu"
                    value={resource.cpu}
                    onChange={handleChange}
                    required
                  >
                    {allowedCpuOptions.map((count) => (
                      <MenuItem key={count} value={count}>
                        {count}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

            {/* Dynamic fields for Compute/VM */}
            {(resource.type === "Compute" || resource.type === "VCN") && (
              <>
                <TextField
                  label="Memory (GB)"
                  name="memory"
                  type="number"
                  fullWidth
                  margin="normal"
                  value={resource.memory}
                  onChange={handleChange}
                  required
                />
                <TextField
                  select
                  name="processor"
                  label="Processor"
                  value={resource.processor}
                  onChange={handleChange}
                  fullWidth
                  required
                >
                  {processors.map((proc, index) => (
                    <MenuItem key={index} value={proc}>
                      {proc}
                    </MenuItem>
                  ))}
                </TextField>
              </>
            )}
  
            <FormControl fullWidth margin="normal">
              <InputLabel>Provider</InputLabel>
              <Select name="provider" value={resource.provider} onChange={handleChange} required>
                <MenuItem value="AWS">AWS</MenuItem>
                <MenuItem value="Azure">Azure</MenuItem>
                <MenuItem value="GCP">GCP</MenuItem>
                <MenuItem value="OCI">OCI</MenuItem>
              </Select>
            </FormControl>
  
            <FormControl fullWidth margin="normal">
              <InputLabel>Region</InputLabel>
              <Select name="region" value={resource.region} onChange={handleChange} required>
                {regions.map((region) => (
                  <MenuItem key={region.key} value={region.key}>{region.name} ({region.key})</MenuItem>
                ))}
              </Select>
            </FormControl>
  
            <TextField fullWidth label="Cost" name="cost" type="number" value={resource.cost} onChange={handleChange} margin="normal" required />
  
            <FormControl fullWidth margin="normal">
  <InputLabel>Status</InputLabel>
  <Select name="status" value={resource.status} onChange={handleChange}>
    <MenuItem value="Active">
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box
          sx={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: 'green',
            mr: 1,
          }}
        />
        Active
      </Box>
    </MenuItem>
    <MenuItem value="Idle">
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box
          sx={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: 'orange',
            mr: 1,
          }}
        />
        Idle
      </Box>
    </MenuItem>
    <MenuItem value="Terminated">
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box
          sx={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: 'red',
            mr: 1,
          }}
        />
        Terminated
      </Box>
    </MenuItem>
  </Select>
</FormControl>

            <FormControl fullWidth margin="normal">
  <InputLabel>Select Tenant</InputLabel>
  <Select
    name="tenantId"
    value={resource.tenantId}
    onChange={handleChange}
    required
  >
    {Array.isArray(tenants) && tenants.length > 0 ? (
      tenants.map((tenant) => (
        <MenuItem key={tenant._id} value={tenant.tenantId}>
          {tenant.tenantName} ({tenant.tenantId})
        </MenuItem>
      ))
    ) : (
      <MenuItem disabled>No tenants available</MenuItem>
    )}
  </Select>
</FormControl>
            <Button type="submit" variant="contained" color="primary" fullWidth style={{ marginTop: '20px' }}>
              Create Resource
            </Button>
          </form>
        </>
      )}
    </Paper>
    </TenantLayout>
  );
  
};

export default CreateResource;