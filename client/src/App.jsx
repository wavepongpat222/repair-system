import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';
import CreateRepair from './CreateRepair';
import AddUser from './AddUser';
import Inventory from './Inventory';
import UserManagement from './UserManagement';
import ChangePassword from './ChangePassword'; 
import UserDashboard from './UserDashboard';
import JobDetail from './JobDetail';
import MaterialApprovals from './MaterialApprovals';
import SupervisorReports from './SupervisorReports';
import InventoryReport from './InventoryReport';
import InventoryDashboard from './InventoryDashboard';
import AdminDashboard from './AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create" element={<CreateRepair />} />
        <Route path="/add-user" element={<AddUser />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/job/:id" element={<JobDetail />} />
        <Route path="/approvals" element={<MaterialApprovals />} />
        <Route path="/reports" element={<SupervisorReports />} />
        <Route path="/inventory-report" element={<InventoryReport />} />
        <Route path="/inventory-dashboard" element={<InventoryDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;