import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, CircularProgress,
  TextField, MenuItem, Stack, Box, useMediaQuery
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import UserLayout from "../layouts/UserLayout";

const sections = {
  Analytics: ['Redshift', 'Synapse', 'BigQuery'],
  Compute: ['EC2 Web Server', 'VM Scale Set', 'Compute Engine', 'Droplet'],
  Containers: ['EKS Cluster', 'AKS', 'GKE'],
  Database: ['RDS MySQL', 'Cosmos DB', 'Cloud SQL'],
  Networking: ['VPC', 'Virtual Network', 'VPC Network'],
  Security: ['WAF', 'Sentinel', 'Security Command'],
  Serverless: ['Lambda Function', 'Azure Functions', 'Cloud Functions'],
  Storage: [],
};

const providers = ['AWS', 'Azure', 'GCP', 'OCI'];

const UserResourceView = () => {
  const [resources, setResources] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [selectedProvider, setSelectedProvider] = useState('all');
  const [selectedSection, setSelectedSection] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [search, setSearch] = useState('');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const tenantId = localStorage.getItem("tenantId");
        const token = localStorage.getItem("token");

        if (!tenantId || !token) {
          console.error("Missing tenantId or token");
          return;
        }

        const response = await axios.get(`http://localhost:5000/api/resources/user?tenantId=${tenantId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setResources(response.data || []);
      } catch (error) {
        console.error("Failed to fetch resources:", error);
        setError("Could not fetch resources");
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  const regions = [...new Set(resources.map(res => res.region))].filter(Boolean);

  const filteredResources = resources.filter(res => {
    const providerMatch = selectedProvider === 'all' || res.provider === selectedProvider;

    let sectionMatch = true;
    if (selectedSection !== 'all') {
      if (selectedSection === 'Compute') {
        sectionMatch = res.type === 'Compute';
      } else if (selectedSection === 'Networking') {
        sectionMatch = res.type === 'VCN';
      }
    }

    const regionMatch = selectedRegion === 'all' || res.region === selectedRegion;
    const searchMatch = search === '' || res.name.toLowerCase().includes(search.toLowerCase());

    return providerMatch && sectionMatch && regionMatch && searchMatch;
  });

  return (
    <UserLayout>
      <Box sx={{ padding: isMobile ? 2 : 4 }}>
        <Typography variant={isMobile ? "h5" : "h4"} gutterBottom>User Resources</Typography>

        {/* Filters */}
        <Box sx={{ mb: 3 }}>
          <Stack
            direction={isMobile ? "column" : "row"}
            spacing={2}
            sx={{ mb: 2 }}
          >
            <TextField
              select
              label="Provider"
              size="small"
              fullWidth={isMobile}
              sx={{ minWidth: isMobile ? '100%' : 180 }}
              value={selectedProvider}
              onChange={e => setSelectedProvider(e.target.value)}
            >
              <MenuItem value="all">All Providers</MenuItem>
              {providers.map(prov => (
                <MenuItem key={prov} value={prov}>{prov}</MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Section"
              size="small"
              fullWidth={isMobile}
              sx={{ minWidth: isMobile ? '100%' : 180 }}
              value={selectedSection}
              onChange={e => setSelectedSection(e.target.value)}
            >
              <MenuItem value="all">All Sections</MenuItem>
              {Object.keys(sections).map(section => (
                <MenuItem key={section} value={section}>{section}</MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Region"
              size="small"
              fullWidth={isMobile}
              sx={{ minWidth: isMobile ? '100%' : 180 }}
              value={selectedRegion}
              onChange={e => setSelectedRegion(e.target.value)}
            >
              <MenuItem value="all">All Regions</MenuItem>
              {regions.map(region => (
                <MenuItem key={region} value={region}>{region}</MenuItem>
              ))}
            </TextField>

            <TextField
              size="small"
              placeholder="Search resources..."
              fullWidth
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </Stack>
        </Box>

        {/* Table */}
        {loading ? (
          <CircularProgress />
        ) : (
          <Paper elevation={3} sx={{ p: isMobile ? 2 : 3 }}>
            <Typography variant="h6" gutterBottom>Your Tenant's Resources</Typography>
            {error && <Typography color="error">{error}</Typography>}
            <Box sx={{ overflowX: 'auto' }}>
          <TableContainer>
  <Table size="small">
    <TableHead>
      <TableRow>
        <TableCell sx={{ fontSize: '1rem', fontWeight: 'bold' }}>Name</TableCell>
        <TableCell sx={{ fontSize: '1rem', fontWeight: 'bold' }}>Provider</TableCell>
        <TableCell sx={{ fontSize: '1rem', fontWeight: 'bold' }}>Type</TableCell>
        <TableCell sx={{ fontSize: '1rem', fontWeight: 'bold' }}>Status</TableCell>
        <TableCell sx={{ fontSize: '1rem', fontWeight: 'bold' }}>CPU</TableCell>
        <TableCell sx={{ fontSize: '1rem', fontWeight: 'bold' }}>Memory</TableCell>
        <TableCell sx={{ fontSize: '1rem', fontWeight: 'bold' }}>Tenant Name</TableCell>
        <TableCell sx={{ fontSize: '1rem', fontWeight: 'bold' }}>Created At</TableCell>
    <TableCell sx={{ fontSize: '1rem', fontWeight: 'bold' }}>Terminated At</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {filteredResources.length > 0 ? (
        filteredResources.map((res) => (
          <TableRow key={res._id}>
            <TableCell sx={{ fontSize: '1rem' }}>{res.name}</TableCell>
            <TableCell sx={{ fontSize: '1rem' }}>{res.provider}</TableCell>
             <TableCell sx={{ fontSize: '1rem' }}>{res.type}</TableCell>
            <TableCell sx={{ fontSize: '1rem' }}>{res.status}</TableCell>
            <TableCell sx={{ fontSize: '1rem' }}>{res.cpu}</TableCell>
            <TableCell sx={{ fontSize: '1rem' }}>{res.memory}</TableCell>
            <TableCell sx={{ fontSize: '1rem' }}>{res.tenantName || 'N/A'}</TableCell>
            <TableCell sx={{ fontSize: '1rem' }}>
    {res.createdAt ? new Date(res.createdAt).toLocaleString() : 'N/A'}
  </TableCell>
  <TableCell sx={{ fontSize: '1rem' }}>
    {res.terminatedAt ? new Date(res.terminatedAt).toLocaleString() : '—'}
  </TableCell>
          </TableRow>
        ))
      ) : (
        <TableRow>
          <TableCell colSpan={7} align="center" sx={{ fontSize: '1rem' }}>
            No matching resources found.
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  </Table>
</TableContainer>

            </Box>
          </Paper>
        )}
      </Box>
    </UserLayout>
  );
};

export default UserResourceView;
