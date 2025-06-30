// AdminDashboardView.js

import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Table, TableContainer, TableHead,
  TableRow, TableCell, TableBody, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, useMediaQuery, MenuItem, Select, Card, CardContent
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format, toZonedTime } from 'date-fns-tz';
import AdminLayout from '../layouts/AdminLayout';
import LanIcon from '@mui/icons-material/Lan';
import MemoryIcon from '@mui/icons-material/Memory';
import StorageIcon from '@mui/icons-material/Storage';
import LayersIcon from '@mui/icons-material/Layers';
import SecurityIcon from '@mui/icons-material/Security';
import PublicIcon from '@mui/icons-material/Public';

const formatIST = (date) => {
  try {
    const timeZone = 'Asia/Kolkata';
    const parsedDate = new Date(date);
    if (isNaN(parsedDate)) return '-';
    const zonedDate = toZonedTime(parsedDate, timeZone);
    return format(zonedDate, 'dd MMMM yyyy, h:mm a', { timeZone });
  } catch {
    return '-';
  }
};

const typeIcons = {
  'VCN': <LanIcon sx={{ fontSize: 50 }} />,
  'Compute': <MemoryIcon sx={{ fontSize: 50 }} />,
  'storage': <StorageIcon sx={{ fontSize: 50 }} />,
  'load balancers': <LayersIcon sx={{ fontSize: 50 }} />,
  'web application firewall': <SecurityIcon sx={{ fontSize: 50 }} />,
  'firewall rules': <SecurityIcon sx={{ fontSize: 50 }} />,
  'cdn': <PublicIcon sx={{ fontSize: 50 }} />,
};

const displayType = (type) => {
  if (!type) return '';
  const lowerType = type.toLowerCase();
  if (lowerType === 'vcn') return 'VCN';
  if (lowerType === 'compute') return 'Compute';
  return type;
};
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const AdminDashboardView = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const navigate = useNavigate();

  const type = query.get('type');
  const typeValue = query.get('typeValue');
  const tenantId = query.get('tenantId');
const tenantName = query.get("tenantName"); 
  const [data, setData] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [noteInput, setNoteInput] = useState('');
  const [action, setAction] = useState('');

  const token = localStorage.getItem('token');
  const email = localStorage.getItem('email');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const excludedFields = ['__v', 'createdAt', 'updatedAt', 'createdBy', 'updatedBy','createdByEmail'];

   const fetchData = async () => {
    try {
      let url = '';
      if (type === 'incident') {
        url = 'http://localhost:5000/api/incidents/all';
      } else if (type === 'service-request' || type === 'load-balancer') {
        url = 'http://localhost:5000/api/service-requests/all';
      } else if (type === 'tenant') {
        url = `http://localhost:5000/api/resources/user?tenantId=${tenantId}`;
      } else if (type === 'resource') {
        url = 'http://localhost:5000/api/resources/all';
      }

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      let result = res.data || [];

      if (type === 'load-balancer') {
        result = result.filter(sr => sr.Name?.toLowerCase() === 'load balancer');
      }

      if (type === 'tenant') {
        if (typeValue) {
          result = result.filter(r => r.type?.toLowerCase() === typeValue.toLowerCase());
        } else {
          const grouped = result.reduce((acc, item) => {
            const normalized = item.type?.toLowerCase() || 'unknown';
            acc[normalized] = (acc[normalized] || []);
            acc[normalized].push(item);
            return acc;
          }, {});
          const cards = Object.entries(grouped).map(([key, val]) => ({
            type: key,
            total: val.length,
          }));
          setData(cards);
          return;
        }
      }

      setData(result);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [type, typeValue, tenantId]);


  const openDetails = async (item) => {
    let updatedItem = { ...item };

    if (['incident', 'service-request','load-balancer'].includes(type) && item.status === 'logged') {
      const url = type === 'incident'
        ? `http://localhost:5000/api/incidents/edit/${item._id}`
        : `http://localhost:5000/api/service-requests/edit/${item._id}`;

      try {
        const deadline = new Date();
        deadline.setDate(deadline.getDate() + 1);

        await axios.put(url, {
          status: 'opened',
          deadline
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        updatedItem = {
          ...item,
          status: 'opened',
          deadline: deadline.toISOString(),
        };
      } catch (err) {
        console.error('Error updating status to opened:', err);
      }
    }

    setModalData({ ...updatedItem, status: updatedItem.status || 'N/A' });
    setAction(updatedItem.actionTaken || '');
    setNoteInput('');
    setOpenModal(true);
  };

  const handleNoteSubmit = async () => {
    if (!noteInput.trim() || !modalData) return;

    const endpoint = type === 'incident'
      ? `http://localhost:5000/api/incidents/notes/${modalData._id}`
      : `http://localhost:5000/api/service-requests/notes/${modalData._id}`;

    try {
      await axios.post(endpoint, {
        text: noteInput,
        addedBy: 'admin',
        addedByEmail: email,
        role: 'admin',
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setModalData(prev => ({
        ...prev,
        notes: [
          ...(prev.notes || []),
          {
            text: noteInput,
            addedBy: 'admin',
            addedByEmail: email,
            addedAt: new Date().toISOString(),
          },
        ],
      }));

      setNoteInput('');
      fetchData();
    } catch (err) {
      console.error('Failed to submit note:', err);
    }
  };

  const handleUpdate = async () => {
    let allowedFields = {};
if (type === 'incident') {
  allowedFields = {
    summary: modalData.summary,
    description: modalData.description,
    urgency: modalData.urgency,
    status: modalData.status,
    deadline: modalData.deadline,
  };
} else if (type === 'service-request') {
  allowedFields = {
    Name: modalData.Name,
    adminName: modalData.adminName,
    ip: modalData.ip,
    permission: modalData.permission,
    status: modalData.status,
    deadline: modalData.deadline,
  };
} else if (type === 'load-balancer') {
  allowedFields = {
    Name: modalData.Name,
    ip: modalData.ip,
    bandwidth: modalData.bandwidth,
    subnet: modalData.subnet,
    publicOrPrivate: modalData.publicOrPrivate,
    status: modalData.status,
    deadline: modalData.deadline,
  };
}


    const endpoint =
  type === 'incident'
    ? `http://localhost:5000/api/incidents/edit/${modalData._id}`
    : type === 'service-request'
      ? `http://localhost:5000/api/service-requests/edit/${modalData._id}`
      : `http://localhost:5000/api/service-requests/edit/${modalData._id}`; // Assuming load balancer uses same endpoint

    try {
      await axios.put(endpoint, allowedFields, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Updated successfully.');
      fetchData();
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  const handleAction = async () => {
    try {
      let endpoint = '';
if (type === 'incident') {
  endpoint = `http://localhost:5000/api/incidents/action/${modalData._id}`;
} else if (['service-request', 'load-balancer'].includes(type)) {
  endpoint = `http://localhost:5000/api/service-requests/action/${modalData._id}`;
}

      await axios.put(endpoint, { action }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert('Action saved successfully.');
      fetchData();
    } catch (err) {
      console.error('Error submitting action:', err);
      alert('Failed to submit action.');
    }
  };

  return (
    <AdminLayout>
      <Box sx={{ p: isMobile ? 1 : 3 }}>
        <Typography variant={isMobile ? 'h6' : 'h5'} gutterBottom>
          {type === 'tenant' && typeValue ? `${typeValue} resources for tenant ${tenantName}`
            : type === 'tenant' ? `Tenant Resource Types`
              : type === 'resource' ? `${typeValue} resources`
                : type === 'incident' ? 'Incidents'
                  : type === 'service-request' ? 'Service Requests'
                  : type === 'load-balancer' ? 'Load Balancer Requests'
                    : 'Details'}
        </Typography>

        {type === 'tenant' && !typeValue ? (
          <Box display="flex" flexWrap="wrap" gap={3} mt={3}>
            {data.map((grp, idx) => (
              <Card key={idx} onClick={() =>
                navigate(`/admin-dashboard-view?type=tenant&tenantId=${tenantId}&typeValue=${grp.type}&tenantName=${encodeURIComponent(tenantName)}`)
              } sx={{ width: 200, p: 2, borderRadius: 3, boxShadow: 3, cursor: 'pointer' }}>
                <CardContent>
                  <Box display="flex" justifyContent="center" mb={2}>
                    {typeIcons[grp.type] || <LanIcon />}
                  </Box>
                  <Typography variant="h6" align="center">{displayType(grp.type)}</Typography>
                  <Typography align="center" color="text.secondary">Total: {grp.total}</Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : (
          <Paper elevation={3} sx={{ p: 2, mb: 4, overflowX: 'auto' }}>
            <TableContainer>
              <Table size={isMobile ? 'small' : 'medium'}>
                <TableHead>
                  <TableRow>
                    {type === 'service-request' ? (
                      <>
                        <TableCell>Request ID</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Deadline</TableCell>
                      </>
                    ) : type === 'incident' ? (
                      <>
                        <TableCell>Incident ID</TableCell>
                        <TableCell>Summary</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Deadline</TableCell>
                      </>
                       ) : type === 'load-balancer' ? (
                    <>
                      <TableCell>Request ID</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>IP</TableCell>
                      <TableCell>Public/Private</TableCell>
                      <TableCell>Bandwidth</TableCell>
                      <TableCell>Subnet</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Deadline</TableCell>
                    </>
                    ) : (
                      <>
                        <TableCell>Name</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Provider</TableCell>
                      </>
                    )}
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((item, idx) => (
                    <TableRow key={idx}>
                      {type === 'incident' ? (
                        <>
                          <TableCell>{item.incidentId}</TableCell>
                          <TableCell>{item.summary}</TableCell>
                          <TableCell>{item.status}</TableCell>
                          <TableCell>{item.status === 'opened' ? formatIST(item.deadline) : '-'}</TableCell>
                        </>
                      ) : type === 'service-request' ? (
                        <>
                          <TableCell>{item.requestId}</TableCell>
                          <TableCell>{item.Name}</TableCell>
                          <TableCell>{item.status}</TableCell>
                          <TableCell>{item.status === 'opened' ? formatIST(item.deadline) : '-'}</TableCell>
                        </>
                         ) : type === 'load-balancer' ? (
                      <>
                        <TableCell>{item.requestId}</TableCell>
                        <TableCell>{item.Name}</TableCell>
                        <TableCell>{item.ip}</TableCell>
                        <TableCell>{item.publicOrPrivate}</TableCell>
                        <TableCell>{item.bandwidth}</TableCell>
                        <TableCell>{item.subnet}</TableCell>
                        <TableCell>{item.status}</TableCell>
                        <TableCell>{item.status === 'opened' ? formatIST(item.deadline) : '-'}</TableCell>
                      </>
                      ) : (
                        <>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.type}</TableCell>
                          <TableCell>{item.status}</TableCell>
                          <TableCell>{item.provider}</TableCell>
                        </>
                      )}
                      <TableCell>
                        <Button size="small" onClick={() => openDetails(item)}>View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {/* Modal */}
        <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Details</DialogTitle>
          <DialogContent dividers>
            {modalData ? (
              <>

              {/* Explicitly show publicOrPrivate */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2">Public/Private:</Typography>
          <Typography variant="body2">
            <strong>{modalData.publicOrPrivate || '-'}</strong>
          </Typography>
        </Box>
                {Object.entries(modalData)
                  .filter(([key]) => !excludedFields.includes(key) && key !== 'notes' &&
            key !== 'publicOrPrivate')
                  .map(([key, value]) => {
                    const isEditable = (type === 'incident' && ['description', 'urgency'].includes(key)) ||
                      (type === 'service-request' && ['ip', 'permission', 'adminName'].includes(key)) ||
                      (type === 'load-balancer' && ['ip', 'bandwidth', 'subnet', 'permission','adminName'].includes(key))
                    const isStatusField = key === 'status';
                     const isDeadlineField = key === 'deadline';
                    const isEditableStatus = isStatusField && ['opened', 'pending'].includes(modalData.status) &&
  ['incident', 'service-request', 'load-balancer'].includes(type);
 if (isDeadlineField && modalData.status === 'resolved') return null;

                    return (
                      <Box key={key} sx={{ mb: 2 }}>
                        <Typography variant="body2" fontWeight="bold" sx={{ textTransform: 'capitalize' }}>{key}:</Typography>
                        {isEditableStatus ? (
                          <Select
                            fullWidth
                            value={modalData.status}
                            onChange={(e) =>
                              setModalData(prev => ({ ...prev, status: e.target.value }))
                            }
                          >
                            <MenuItem value="opened">Opened</MenuItem>
                            <MenuItem value="pending">Pending</MenuItem>
                          </Select>
                        ) : isStatusField ? (
                          <Typography>{modalData.status}</Typography>
                        ) : isEditable ? (
                          <TextField
                            fullWidth
                            size="small"
                            value={modalData[key] || ''}
                            onChange={(e) =>
                              setModalData(prev => ({ ...prev, [key]: e.target.value }))
                            }
                          />
                        ) : (
                          <Typography>
                             {key === 'deadline'
              ? formatIST(value) // ✅ formatted deadline (e.g., 23 June 2025, 9:26 PM)
              : typeof value === 'string' && (key.includes('date') || key.toLowerCase().includes('at'))
              ? formatIST(value)
              : String(value)}
                          </Typography>
                        )}
                      </Box>
                    );
                  })}
                   {modalData.notes?.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">Previous Notes:</Typography>
                  {modalData.notes.map((note, idx) => {
                    const isCurrentUser = note.addedByEmail?.toLowerCase() === email;
                    const addedByDisplay = isCurrentUser ? `Admin (${note.addedByEmail})` : `User (${note.addedByEmail})`;
                    return (
                      <Box key={idx} sx={{ mb: 1 }}>
                        <Typography variant="body2">
                          <strong>Added by:</strong> {addedByDisplay}, {formatIST(note.addedAt)}
                        </Typography>
                        <Typography sx={{ ml: 2 }}>{note.text}</Typography>
                      </Box>
                    );
                  })}
                </Box>
              )}

                
              {['incident', 'service-request','load-balancer'].includes(type) && (
                <>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1">Add Note</Typography>
                    <textarea
                      value={noteInput}
                      onChange={(e) => setNoteInput(e.target.value)}
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                        marginTop: '8px'
                      }}
                      placeholder="Write your note here..."
                    />
                    <Button
                      variant="contained"
                      sx={{ mt: 1 }}
                      fullWidth={isMobile}
                      onClick={handleNoteSubmit}
                      disabled={!noteInput.trim()}
                    >
                      Submit Note
                    </Button>
                  </Box>

                  <Box sx={{ mt: 3 }}>
                    <TextField
                      fullWidth
                      multiline
                      minRows={3}
                      value={action}
                      onChange={(e) => setAction(e.target.value)}
                      placeholder="Enter action..."
                      label="Action Taken"
                    />
                  </Box>
                </>
              )}
            </>
            ) : (
              <Typography>Loading...</Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenModal(false)}>Close</Button>
              {['incident', 'service-request','load-balancer'].includes(type) && (
              <>
                <Button variant="outlined" onClick={handleUpdate}>Update</Button>
                <Button variant="contained" onClick={handleAction}>Save Action</Button>
              </>
            )}
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  );
};

export default AdminDashboardView;
