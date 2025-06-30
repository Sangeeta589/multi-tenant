import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/ManageAccounts';
import axios from 'axios';
import AdminLayout from '../layouts/AdminLayout';

const AdminSettings = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [users, setUsers] = useState([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const filteredUsers = res.data.filter(user => !['super-admin', 'tenant-admin'].includes(user.role));
      setUsers(filteredUsers);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChangePassword = async () => {
    try {
      await axios.post('/api/admin/change-password', {
        currentPassword,
        newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSnackbar({ open: true, message: 'Password updated successfully.', severity: 'success' });
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to change password', severity: 'error' });
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm("Are you sure you want to remove this user?")) {
      try {
        await axios.delete(`/api/admin/user/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchUsers();
        setSnackbar({ open: true, message: 'User removed.', severity: 'success' });
      } catch (err) {
        setSnackbar({ open: true, message: 'Error removing user.', severity: 'error' });
      }
    }
  };

  const openEditDialog = (user) => {
    setSelectedUser(user);
    setNewRole(user.role || 'user');
    setEditDialogOpen(true);
  };

  const handleRoleUpdate = async () => {
    try {
      await axios.put(`/api/admin/user/${selectedUser._id}/role`, { newRole }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditDialogOpen(false);
      fetchUsers();
      setSnackbar({ open: true, message: 'Role updated.', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to update role.', severity: 'error' });
    }
  };

  return (
    <AdminLayout>
      <Container sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>Admin Settings</Typography>

        <Paper elevation={3} sx={{ p: 3, mb: 5 }}>
          <Typography variant="h6">Change Password</Typography>
          <TextField
            label="Current Password"
            type="password"
            fullWidth
            margin="normal"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <TextField
            label="New Password"
            type="password"
            fullWidth
            margin="normal"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <Button variant="contained" onClick={handleChangePassword}>Update Password</Button>
        </Paper>

        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>User Management</Typography>
          <List>
            {users.map((user) => (
              <ListItem
                key={user._id}
                secondaryAction={
                  <>
                    <IconButton edge="end" onClick={() => openEditDialog(user)}><EditIcon /></IconButton>
                    <IconButton edge="end" color="error" onClick={() => handleDeleteUser(user._id)}><DeleteIcon /></IconButton>
                  </>
                }
              >
                <ListItemText
                  primary={`${user.username || user.email}`}
                  secondary={`Role: ${user.role || 'user'}`}
                />
              </ListItem>
            ))}
          </List>
        </Paper>

        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
          <DialogTitle>Edit User Role</DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Role</InputLabel>
              <Select
                value={newRole}
                label="Role"
                onChange={(e) => setNewRole(e.target.value)}
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="visitor">Visitor</MenuItem>
                <MenuItem value="editor">Editor</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleRoleUpdate}>Save</Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
        </Snackbar>
      </Container>
    </AdminLayout>
  );
};

export default AdminSettings;
