//App.js

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ResourceTable from "./pages/ResourceTable";
import AdminDashboard from "./pages/AdminDashboard";
import CreateResource from './components/CreateResource';
import AdminPage from "./pages/AdminPage";
import TenantDashboard from "./components/TenantDashboard";
import CreateTenant from "./components/CreateTenant";
import TenantTable from "./components/TenantTable";
import UserResourceView from "./pages/UserResourceView";
import TenancyLogin from "./pages/TenancyLogin";
import ServiceDashboard from "./pages/ServiceDashboard";
import ServiceCatalog from "./pages/ServiceCatalog";
import ServiceRequest from "./pages/ServiceRequest";
import IncidentForm from "./pages/IncidentForm";
import MyItems from "./pages/MyItems";
import AdminNotification from './pages/AdminNotification';
import UserNotification from './pages/UserNotification';
import TenantNotification from "./pages/TenantNotification";
import AdminSettings from "./components/AdminSettings";
import DashboardView from "./pages/DashboardView";
import AdminDashboardView from "./pages/AdminDashboardView";
import AddServiceForm from "./components/AddServices";
function App() {
  
  return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />}/>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard/>}/>    
          <Route path="/resources" element={<ResourceTable />} />
          <Route path ='/create' element={<CreateResource />}/>
          <Route path ='/admin-page' element={<AdminPage />}/>
          <Route path="/tenant-dashboard" element={<TenantDashboard />}/>
          <Route path="/create-tenant" element={<CreateTenant />} />
          <Route path ="/tenants" element={<TenantTable/>}/>
          <Route path="/user-resources" element={<UserResourceView/>}/>
          <Route path="/" element={<TenancyLogin/>}/>
          <Route path="/service-dashboard" element={<ServiceDashboard />} />
          <Route path="/catalog" element={<ServiceCatalog />} />
          <Route path="/service-request/:category" element={<ServiceRequest />} />
          <Route path="/incidents" element={<IncidentForm />}/>
          <Route path="/my-items" element={<MyItems userId={localStorage.getItem("userId")} />} />
          <Route path="/admin-notifi" element={<AdminNotification />} />
          <Route path="/user-notifi" element={<UserNotification />} />
<Route path="/tenant-notifi" element={<TenantNotification />}/>
<Route path="/admin-settings" element={<AdminSettings />}/>
<Route path="/dashboard-view" element={<DashboardView />}/>
<Route path="/admin-dashboard-view" element={<AdminDashboardView />}/>
<Route path="/add-service" element={<AddServiceForm />}/>
        </Routes>
      </Router>
   
  );
}


export default App;

