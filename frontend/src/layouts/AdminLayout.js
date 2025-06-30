//src/layouts/AdminLayout.js

import { Box } from "@mui/material";
import Sidebaradmin from "../components/Sidebaradmin";

const AdminLayout = ({ children }) => {
  return (
    <Box sx={{ display: "flex" }}>
      <Sidebaradmin />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {children}
      </Box>
    </Box>
  );
};

export default AdminLayout;
