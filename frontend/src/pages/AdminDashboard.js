import React, { useState, useEffect } from 'react';
import {
  Typography, Box, Card, CardContent, CircularProgress,
  FormControl, InputLabel, Select, MenuItem, useTheme, useMediaQuery,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,TextField
} from '@mui/material';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GroupIcon from '@mui/icons-material/Group';
import LayersIcon from '@mui/icons-material/Layers';
import AdminLayout from '../layouts/AdminLayout';
import ChatWindow from './ChatWindow';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentView = searchParams.get('view');

  const [resources, setResources] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [allIncidents, setAllIncidents] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [allServiceRequests, setAllServiceRequests] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [selectedUserEmail, setSelectedUserEmail] = useState('');
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [loadBalancers, setLoadBalancers] = useState([]);
  const token = localStorage.getItem('token');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  const extractNameFromEmail = (email) =>
    email?.split('@')[0]?.toLowerCase().replace(/\s+/g, '');

  const resolveEmail = (createdBy) => {
    if (!createdBy) return 'Unknown';
    const match = users.find(
      (user) =>
        user.email.toLowerCase() === createdBy.toLowerCase() ||
        extractNameFromEmail(user.email) === createdBy.toLowerCase()
    );
    return match ? match.email : createdBy;
  };

  const filterByTenantAndUser = (data) =>
    data.filter(item => {
      const matchesUser = !selectedUserEmail || resolveEmail(item.createdBy) === selectedUserEmail;
      const matchesTenant = !selectedTenantId || item.tenantId === selectedTenantId;
      return matchesUser && matchesTenant;
    });

  const getPerUserCount = (items) =>
    filterByTenantAndUser(items).reduce((acc, curr) => {
      const email = resolveEmail(curr.createdBy);
      acc[email] = (acc[email] || 0) + 1;
      return acc;
    }, {});

  const getStatusChartData = () => {
    const statuses = ['logged', 'pending', 'opened', 'resolved'];
    const filteredIncidents = filterByTenantAndUser(incidents);
    const filteredServiceRequests = filterByTenantAndUser(serviceRequests);

    const countByStatus = (arr, status) =>
      arr.filter(item => item.status?.toLowerCase() === status).length;

    return statuses.map(status => ({
      status: status.toUpperCase(),
      Incidents: countByStatus(filteredIncidents, status),
      'Service Requests': countByStatus(filteredServiceRequests, status),
    }));
  };

  const filteredTenantsByUser = tenants.filter((tenant) => {
    if (!selectedUserEmail) return true;

    const hasUserData =
      allIncidents.some(
        (item) =>
          item.tenantId === tenant.tenantId &&
          resolveEmail(item.createdBy) === selectedUserEmail
      ) ||
      allServiceRequests.some(
        (item) =>
          item.tenantId === tenant.tenantId &&
          resolveEmail(item.createdBy) === selectedUserEmail
      );

    return hasUserData;
  });

  useEffect(() => {
    const tenantIsValid = filteredTenantsByUser.some(t => t.tenantId === selectedTenantId);
    if (!tenantIsValid) {
      setSelectedTenantId('');
    }
  }, [selectedUserEmail, tenants, selectedTenantId, allIncidents, allServiceRequests]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, [token]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [incidentsRes, srRes, tenantRes, resourcesRes] = await Promise.all([
          axios.get('http://localhost:5000/api/incidents/all', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5000/api/service-requests/all', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5000/api/tenants/all', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5000/api/resources/all', { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        setAllIncidents(incidentsRes.data || []);
        setAllServiceRequests(srRes.data || []);
        setServiceRequests(srRes.data || []);
        setLoadBalancers((srRes.data || []).filter(sr => sr.Name?.toLowerCase() === 'load balancer'));
        setTenants(Array.isArray(tenantRes.data) ? tenantRes.data : []);
        setResources(resourcesRes.data || []);
        setIncidents(incidentsRes.data || []);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const handleTenantRowClick = (tenant) => {
  navigate(`/admin-dashboard-view?type=tenant&tenantId=${tenant.tenantId}&tenantName=${encodeURIComponent(tenant.tenantName)}`);
};

const getStatusByDateChartData = () => {
  const statuses = ['logged', 'pending', 'opened', 'resolved'];
  const allItems = [...allIncidents, ...allServiceRequests];

  const grouped = {};

  allItems.forEach(item => {
    const tenantId = item.tenantId;
    if (selectedTenantId && tenantId !== selectedTenantId) return;

    const status = item.status?.toLowerCase();
    const createdAt = new Date(item.createdAt);
    const dateStr = `${createdAt.getDate().toString().padStart(2, '0')}-${(createdAt.getMonth() + 1).toString().padStart(2, '0')}-${createdAt.getFullYear()}`;

    if (!grouped[dateStr]) {
      grouped[dateStr] = { date: dateStr };
      statuses.forEach(s => (grouped[dateStr][s] = 0));
    }

    if (statuses.includes(status)) {
      grouped[dateStr][status]++;
    }
  });

  return Object.values(grouped).sort((a, b) => {
    const [dayA, monthA, yearA] = a.date.split('-').map(Number);
    const [dayB, monthB, yearB] = b.date.split('-').map(Number);
    return new Date(yearA, monthA - 1, dayA) - new Date(yearB, monthB - 1, dayB);
  });
};


return (
  <AdminLayout>
    <Box
      sx={{
        position: 'relative',
        paddingRight: isMobile || isTablet ? 0 : '400px',
        paddingBottom: isMobile ? 8 : 12,
      }}
    >
      <Typography variant="h4" gutterBottom>Admin Dashboard</Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        <>
          {/* MAIN DASHBOARD CARDS */}
          {currentView !== 'tenants' && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
              {/* Incidents */}
              <Box sx={{ cursor: 'pointer' }} onClick={() => navigate('/admin-dashboard-view?type=incident')}>
                <Card sx={{ width: 300, p: 2, borderRadius: 3, boxShadow: 3 }}>
                  <CardContent>
                    <Box display="flex" justifyContent="center" mb={1}>
                      <ReportProblemIcon sx={{ fontSize: 50, color: '#f57c00' }} />
                    </Box>
                    <Typography variant="h6" align="center" gutterBottom>
                      Total Incidents: {allIncidents.length}
                    </Typography>
                    <Box mt={2}>
                      {Object.entries(getPerUserCount(allIncidents)).map(([email, count]) => (
                        <Typography key={email} variant="body2" align="center">
                          User : {extractNameFromEmail(email)}: {count}
                        </Typography>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Box>

              {/* Service Requests */}
              <Box sx={{ cursor: 'pointer' }} onClick={() => navigate('/admin-dashboard-view?type=service-request')}>
                <Card sx={{ width: 300, p: 2, borderRadius: 3, boxShadow: 3 }}>
                  <CardContent>
                    <Box display="flex" justifyContent="center" mb={1}>
                      <AssignmentIcon sx={{ fontSize: 50, color: '#1976d2' }} />
                    </Box>
                    <Typography variant="h6" align="center" gutterBottom>
                      Total Service Requests: {allServiceRequests.length}
                    </Typography>
                    <Box mt={2}>
                      {Object.entries(getPerUserCount(allServiceRequests)).map(([email, count]) => (
                        <Typography key={email} variant="body2" align="center">
                          User : {extractNameFromEmail(email)}: {count}
                        </Typography>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Box>

              {/* Load Balancer Requests */}
              <Box sx={{ cursor: 'pointer' }} onClick={() => navigate('/admin-dashboard-view?type=load-balancer')}>
                <Card sx={{ width: 300, p: 2, borderRadius: 3, boxShadow: 3 }}>
                  <CardContent>
                    <Box display="flex" justifyContent="center" mb={1}>
                      <LayersIcon sx={{ fontSize: 50, color: '#673ab7' }} />
                    </Box>
                    <Typography variant="h6" align="center" gutterBottom>
                      Load Balancer Requests: {loadBalancers.length}
                    </Typography>
                    <Box mt={2}>
                      {Object.entries(getPerUserCount(loadBalancers)).map(([email, count]) => (
                        <Typography key={email} variant="body2" align="center">
                          User : {extractNameFromEmail(email)}: {count}
                        </Typography>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Box>

              {/* Tenants Card */}
              <Box sx={{ cursor: 'pointer' }} onClick={() => navigate('/admin-dashboard?view=tenants')}>
                <Card sx={{ width: 300, height: 166, p: 2, borderRadius: 3, boxShadow: 3 }}>
                  <CardContent>
                    <Box display="flex" justifyContent="center" mb={2}>
                      <GroupIcon sx={{ fontSize: 50, color: '#4caf50' }} />
                    </Box>
                    <Typography variant="h6" align="center">
                      Total Tenants Created: {tenants.length}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          )}

          {/* TENANT LIST TABLE VIEW */}
          {currentView === 'tenants' && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h5" gutterBottom>Tenants List</Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Tenant ID</TableCell>
                      <TableCell>Tenant Name</TableCell>
                      <TableCell>Created At</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tenants.map((tenant) => (
                      <TableRow
                        key={tenant.tenantId}
                        hover
                        sx={{ cursor: 'pointer' }}
                        onClick={() => handleTenantRowClick(tenant)}
                      >
                        <TableCell>{tenant.tenantId}</TableCell>
                        <TableCell sx={{ color: 'blue', textDecoration: 'underline' }}>
                          {tenant.tenantName}
                        </TableCell>
                        <TableCell>{new Date(tenant.createdAt).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* CHART 1 - Status Overview */}
          {currentView !== 'tenants' && (
            <Box sx={{ width: '100%', pr: isMobile || isTablet ? 0 : '400px', mb: 4, mt: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
                <Typography variant="h6" gutterBottom>
                  Incident & Service Request Status Overview
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                  <FormControl size="small" sx={{ minWidth: 200, mr: 2 }}>
                    <InputLabel id="select-user-label">Select User</InputLabel>
                    <Select
                      labelId="select-user-label"
                      value={selectedUserEmail}
                      onChange={(e) => setSelectedUserEmail(e.target.value)}
                      label="Select User"
                    >
                      <MenuItem value="">All Users</MenuItem>
                      {users.map((user) => (
                        <MenuItem key={user._id} value={user.email}>
                         {extractNameFromEmail(user.email)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel id="select-tenant-label">Select Tenant</InputLabel>
                    <Select
                      labelId="select-tenant-label"
                      value={selectedTenantId}
                      onChange={(e) => setSelectedTenantId(e.target.value)}
                      label="Select Tenant"
                    >
                      <MenuItem value="">All Tenants</MenuItem>
                      {filteredTenantsByUser.map((tenant) => (
                        <MenuItem key={tenant.tenantId} value={tenant.tenantId}>
                          {tenant.tenantName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getStatusChartData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Incidents" fill="#81C1F7" />
                  <Bar dataKey="Service Requests" fill="#2196f3" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          )}

          {/* CHART 2 - By Date */}
          {currentView !== 'tenants' && (
            <Box sx={{ width: '100%', pr: isMobile || isTablet ? 0 : '400px', mb: 4, mt: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
                <Typography variant="h6" gutterBottom>
                  Incident & Service Requests per Tenant
                </Typography>
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel id="tenant-filter-label">Filter by Tenant</InputLabel>
                  <Select
                    labelId="tenant-filter-label"
                    value={selectedTenantId}
                    onChange={(e) => setSelectedTenantId(e.target.value)}
                    label="Filter by Tenant"
                  >
                    <MenuItem value="">All Tenants</MenuItem>
                    {tenants.map((tenant) => (
                      <MenuItem key={tenant.tenantId} value={tenant.tenantId}>
                        {tenant.tenantName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={getStatusByDateChartData()}
                  barSize={30} 
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="logged" fill="#f44336" />
                  <Bar dataKey="pending" fill="#FFC107" />
                  <Bar dataKey="opened" fill="#42A5F5" />
                  <Bar dataKey="resolved" fill="#66BB6A" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          )}
        </>
      )}

      {/* CHAT */}
      <Box
        sx={{
          position: isMobile || isTablet ? 'static' : 'fixed',
          bottom: isMobile || isTablet ? 'auto' : 16,
          right: isMobile || isTablet ? 'auto' : 16,
          width: isMobile || isTablet ? '100%' : 350,
          zIndex: 1300,
        }}
      >
        <ChatWindow isAdmin={true} userList={users.map(user => user.email)} key={users.length} />
      </Box>
    </Box>
  </AdminLayout>
);

};

export default AdminDashboard;
