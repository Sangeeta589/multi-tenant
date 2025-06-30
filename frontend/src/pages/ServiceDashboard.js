//src/pages/ServiceDashboard.js

import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const ServiceDashboard = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ backgroundColor: "#e9f1f6", minHeight: "100vh", p: 3 }}>
      <Box
        sx={{
          background: "linear-gradient(to right, #21445b, #4b5c7a)",
          padding: 4,
          borderRadius: 2,
          color: "#fff",
          mb: 3,
        }}
      >
        <TextField
          fullWidth
          placeholder="How can we help you?"
          variant="outlined"
          sx={{ backgroundColor: "#fff", borderRadius: 1 }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card
            sx={{ cursor: "pointer", minHeight: 150 }}
            onClick={() => navigate("/catalog")}
          >
            <CardContent>
              <Typography variant="h6">Service Catalog</Typography>
              <Typography>
                Explore the service catalog from all the departments in the
                organization
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            sx={{ cursor: "pointer", minHeight: 150 }}
            onClick={() => navigate("/incidents")}
          >
            <CardContent>
              <Typography variant="h6">Report an Issue</Typography>
              <Typography>
                Report any issues under service catalog from all departments
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            sx={{ cursor: "pointer", minHeight: 150 }}
            onClick={() => navigate("/my-items")}
          >
            <CardContent>
              <Typography variant="h6">My Items</Typography>
              <Typography>
                Review the status of your submitted issues and requests
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box mt={4}>
        <Typography variant="h6">News and Announcements</Typography>
        <Typography sx={{ color: "#666", mt: 1 }}>
          There are currently no items to display.
        </Typography>
      </Box>
    </Box>
  );
};

export default ServiceDashboard;
