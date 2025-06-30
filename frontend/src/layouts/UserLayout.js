//src/layouts/UserLayout.js

import { Box } from "@mui/material";
import Sidebaruser from "../components/Sidebaruser";

const UserLayout = ({ children }) => {
  return (
    <Box sx={{ display: "flex" }}>
      <Sidebaruser />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {children}
      </Box>
    </Box>
  );
};

export default UserLayout;
