//src/layouts/TenantLayout.js
import { Box } from "@mui/material";
import SidebarTenant from "../components/sidebartenant";

const TenantLayout = ({ children }) => {
  return (
    <Box sx={{ display: "flex" }}>
      <SidebarTenant />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {children}
      </Box>
    </Box>
  );
};

export default TenantLayout;
