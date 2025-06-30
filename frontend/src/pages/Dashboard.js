import React, { useState, useEffect } from 'react';
import {
  Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Card, CardContent, Menu, MenuItem
} from '@mui/material';
import UserLayout from '../layouts/UserLayout';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { SafeStorage } from '../utils/SafeStorage';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useTheme, useMediaQuery } from '@mui/material';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import ChatWindow from './ChatWindow';
import MemoryIcon from '@mui/icons-material/Memory';
import StorageIcon from '@mui/icons-material/Storage';
import LanIcon from '@mui/icons-material/Lan';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SecurityIcon from '@mui/icons-material/Security';
import PublicIcon from '@mui/icons-material/Public';
import LayersIcon from '@mui/icons-material/Layers';

const Dashboard = () => {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null); // For dropdown menu
  const open = Boolean(anchorEl);

  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const email = localStorage.getItem('email')?.toLowerCase();
  const token = localStorage.getItem('token');
const tenantId = SafeStorage.getItem('tenantId') || localStorage.getItem('tenantId');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  const fetchData = async () => {
    try {
      if (!tenantId || !token || !email) return;
      const emailPrefix = email.split('@')[0];
      const [resourceRes, incidentRes, serviceRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/resources/user?tenantId=${tenantId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`http://localhost:5000/api/incidents/user/name/${email}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`http://localhost:5000/api/service-requests/user/${emailPrefix}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setResources(Array.isArray(resourceRes.data) ? resourceRes.data : []);
      setIncidents(Array.isArray(incidentRes.data) ? incidentRes.data : []);
      setServiceRequests(Array.isArray(serviceRes.data) ? serviceRes.data : []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 30000);
    return () => clearInterval(intervalId);
  }, []);

  const getStatusCounts = () => {
    const statusTypes = ['logged', 'pending', 'opened', 'resolved'];
    const countStatus = (arr, status) => arr.filter(item => item.status?.toLowerCase() === status).length;
    return statusTypes.map(status => ({
      status: status.toUpperCase(),
      Incidents: countStatus(incidents, status),
      'Service Requests': countStatus(serviceRequests, status),
    }));
  };

  const chartData = getStatusCounts();

  const groupResourcesByType = (resources) => {
    const grouped = {};
    resources.forEach((res) => {
      const type = res.type?.toLowerCase();
      const normalized = type?.includes('vcn') ? 'VCN' : type?.includes('compute') ? 'Compute' : res.type || 'Unknown';
      if (!grouped[normalized]) grouped[normalized] = { type: normalized, total: 0 };
      grouped[normalized].total++;
    });
    return Object.values(grouped);
  };

  const typeIcons = {
    'VCN': <LanIcon sx={{ fontSize: 50 }} />, 'Compute': <MemoryIcon sx={{ fontSize: 50 }} />, 'Storage': <StorageIcon sx={{ fontSize: 50 }} />,
    'Load Balancers': <LayersIcon sx={{ fontSize: 50 }} />, 'Web Application Firewall': <SecurityIcon sx={{ fontSize: 50 }} />,
    'Firewall Rules': <SecurityIcon sx={{ fontSize: 50 }} />, 'CDN': <PublicIcon sx={{ fontSize: 50 }} />
  };

  const TypeCard = ({ data }) => (
    <Card onClick={() => navigate(`/dashboard-view?type=resource&typeValue=${data.type}`)} sx={{ width: 200, p: 2, borderRadius: 3, boxShadow: 3 }}>
      <CardContent>
        <Box display="flex" justifyContent="center" mb={2}>{typeIcons[data.type] || typeIcons['Unknown']}</Box>
        <Typography variant="h6" align="center">{data.type}</Typography>
        <Typography align="center" color="text.secondary">Total: {data.total}</Typography>
      </CardContent>
    </Card>
  );

  const SummaryCard = ({ title, icon, items, type }) => {
    const count = (status) => items.filter(i => i.status?.toLowerCase() === status).length;
    return (
      <Card
  onClick={() => navigate(`/dashboard-view?type=${type}`)}
  sx={{
    width: 200,
    p: 2,
    borderRadius: 3,
    boxShadow: 3,
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'start',
    height: 260, // enforce consistent card height
  }}
>
  <CardContent
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      p: 0,
      mt: 1,
    }}
  >
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 60,
        width: 60,
        mb: 1,
      }}
    >
      {React.cloneElement(icon, {
        sx: {
          fontSize: 50,
          color: icon.props.sx?.color || 'inherit',
        },
      })}
    </Box>
    <Typography variant="h6" align="center" gutterBottom>{title}</Typography>
    <Typography><strong>Total:</strong> {items.length}</Typography>
    {['logged', 'opened', 'pending', 'resolved'].map((s) => (
      <Typography key={s}>
        <strong>{s.charAt(0).toUpperCase() + s.slice(1)}:</strong>{' '}
        {count(s)}
      </Typography>
    ))}
  </CardContent>
</Card>

    );
  };

  const autofitColumns = (data) => {
    const keys = Object.keys(data[0] || {});
    return keys.map((key) => ({
      wch: Math.max(
        key.length + 2,
        ...data.map((row) => (row[key] ? row[key].toString().length : 0)),
        12
      )
    }));
  };

  const exportDashboardReport = () => {
    const workbook = XLSX.utils.book_new();
    const pad = (n) => n.toString().padStart(2, '0');
    const formatDate = (date) => `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`;
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const todayDate = today.getDate();
    const todayStr = formatDate(today);
    const isAfter9AM = today.getHours() >= 9;

    const combinedData = [];
    incidents.forEach((inc) => {
      combinedData.push({
        'Date': formatDate(new Date(inc.createdAt)),
        'incident: id': inc.incidentId || '',
        'Service Requests:ID': '',
        'Logged': inc.status?.toLowerCase() === 'logged' ? 'LOGGED' : '',
        'Opened': inc.status?.toLowerCase() === 'opened' ? 'OPENED' : '',
        'Resolved': inc.status?.toLowerCase() === 'resolved' ? 'RESOLVED' : '',
        'Pending': inc.status?.toLowerCase() === 'pending' ? 'PENDING' : '',
        'Remarks': inc.description || '',
        'ADDITIONAL INFO': inc.additionalInfo || '-',
        'Deadline': inc.deadline ? formatDate(new Date(inc.deadline)) : ''
      });
    });
    serviceRequests.forEach((sr) => {
      combinedData.push({
        'Date': formatDate(new Date(sr.createdAt)),
        'incident: id': '',
        'Service Requests:ID': sr.requestId || '',
        'Logged': sr.status?.toLowerCase() === 'logged' ? 'LOGGED' : '',
        'Opened': sr.status?.toLowerCase() === 'opened' ? 'OPENED' : '',
        'Resolved': sr.status?.toLowerCase() === 'resolved' ? 'RESOLVED' : '',
        'Pending': sr.status?.toLowerCase() === 'pending' ? 'PENDING' : '',
        'Remarks': sr.dbName || '',
        'ADDITIONAL INFO': sr.additionalInfo || '',
        'Deadline': sr.deadline ? formatDate(new Date(sr.deadline)) : ''
      });
    });
    const incidentSheet = XLSX.utils.json_to_sheet(combinedData);
    incidentSheet['!cols'] = autofitColumns(combinedData);
    XLSX.utils.book_append_sheet(workbook, incidentSheet, 'Incidents & Requests');

    const monthDates = [];
    for (let day = 1; day < todayDate; day++) {
      const date = new Date(currentYear, currentMonth, day);
      monthDates.push(formatDate(date));
    }
    if (isAfter9AM) {
      monthDates.push(todayStr);
    }

    const monthKey = `${today.toLocaleString('default', { month: 'short' })}-${currentYear}`;
    const headers = ['Sr. No', 'Resource', 'Compartment', 'Health Check Activity', ...monthDates];

    const data = resources.map((res, index) => {
      const row = {
        'Sr. No': index + 1,
        Resource: res.name || 'instance',
        Compartment: res.tenantName || 'Unknown',
        'Health Check Activity': res.name || ''
      };
      let status = 'Stopped';
      if (res.status === 'Active' || res.status === 'Idle') status = 'OK';
      else if (res.status === 'Terminated') status = 'Terminated';
      monthDates.forEach((d) => {
        row[d] = status;
      });
      return row;
    });

    const resourceSheet = XLSX.utils.json_to_sheet(data, { header: headers });
    resourceSheet['!cols'] = autofitColumns(data);
    XLSX.utils.book_append_sheet(workbook, resourceSheet, monthKey);

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'Resources_Report.xlsx');
  };

  const renderTable = (title, data) => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>{title}</Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {Object.keys(data[0] || {}).map((key, idx) => (
                <TableCell key={idx}>{key}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {Object.values(row).map((val, idx) => (
                  <TableCell key={idx}>{String(val)}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  return (
    <UserLayout>
      <Box sx={{ position: 'relative', paddingRight: isMobile || isTablet ? 0 : '400px', paddingBottom: isMobile ? 8 : 12 }}>
        <Typography variant="h4" gutterBottom>Dashboard Report</Typography>

        {loading ? <CircularProgress /> : (
        <>
  {/* Two rows of cards */}
  <Box display="flex" flexWrap="wrap" justifyContent="center" alignItems="center" gap={3} my={4}>
  {/* Render resource type cards except Vcn and Compute */}
  {groupResourcesByType(resources)
    .map((grp, idx) => <TypeCard key={idx} data={grp} />)}

  {/* Add Load Balancer Card based on service requests */}
  {serviceRequests.some(sr => sr.Name?.toLowerCase() === 'load balancer') && (
    <Card
      onClick={() => navigate(`/dashboard-view?type=load-balancer`)}
      sx={{ width: 200, p: 2, borderRadius: 3, boxShadow: 3 }}
    >
      <CardContent>
        <Box display="flex" justifyContent="center" mb={2}>
          <LayersIcon sx={{ fontSize: 50 }} />
        </Box>
        <Typography variant="h6" align="center">Load Balancer</Typography>
        <Typography align="center" color="text.secondary">
          Total: {serviceRequests.filter(sr => sr.Name?.toLowerCase() === 'load balancer').length}
        </Typography>
      </CardContent>
    </Card>
  )}
</Box>


  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
    {/* Incident + Service Requests */}
    <SummaryCard
      title="Incidents"
      icon={<ReportProblemIcon sx={{ fontSize: 50, color: '#f57c00' }} />}
      items={incidents}
      type="incident"
    />
    <SummaryCard
      title="Service Requests"
      icon={<AssignmentIcon sx={{ fontSize: 40, color: '#1976d2' }} />}
      items={serviceRequests}
      type="service-request"
    />
  </Box>

  {/* Chart + Take Action Dropdown */}
  <Box sx={{ width: '100%', mb: 4 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
      <Typography variant="h6">Incident & Service Request Status Overview</Typography>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button variant="outlined" onClick={handleMenuClick}>Take Action</Button>
        <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
          <MenuItem onClick={() => { handleClose(); exportDashboardReport(); }}>Download CSV</MenuItem>
          <MenuItem onClick={() => { handleClose(); setPreviewOpen(true); }}>View Excel</MenuItem>
        </Menu>
      </Box>
    </Box>

            <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" /><YAxis />
                <Tooltip /><Legend />
                <Bar dataKey="Incidents" fill="#81C1F7" />
                <Bar dataKey="Service Requests" fill="#2196f3" />
              </BarChart>
            </ResponsiveContainer>
</Box>
            <Box display="flex" flexWrap="wrap" justifyContent="center" alignItems="center" gap={3} my={4}>
              {groupResourcesByType(resources)
                .filter(grp => grp.type !== 'VCN' && grp.type !== 'Compute')
                .map((grp, idx) => <TypeCard key={idx} data={grp} />)}
            </Box>

            <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="xl" fullWidth>
              <DialogTitle>Excel Sheet Preview</DialogTitle>
              <DialogContent dividers>
                {resources.length > 0 && renderTable('Resources', resources)}
                {incidents.length > 0 && renderTable('Incidents', incidents)}
                {serviceRequests.length > 0 && renderTable('Service Requests', serviceRequests)}
              </DialogContent>
              <DialogActions><Button onClick={() => setPreviewOpen(false)}>Close</Button></DialogActions>
            </Dialog>
          </>
        )}
      </Box>

      {/* Chat window stays untouched */}
      <Box
        sx={{
          position: isMobile || isTablet ? 'static' : 'fixed',
          bottom: isMobile || isTablet ? 'auto' : 16,
          right: isMobile || isTablet ? 'auto' : 16,
          width: isMobile || isTablet ? '100%' : 350,
          zIndex: 1300,
        }}
      >
        <ChatWindow isAdmin={false}/>
      </Box>
    </UserLayout>
  );
};

export default Dashboard;
