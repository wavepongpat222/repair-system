import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './Navbar'; 
import Home from './Home'; 
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
import RepairHistory from './RepairHistory';
import MyTasks from './MyTasks';

// ✅ เพิ่ม Import 2 หน้าใหม่สำหรับระบบลืมรหัสผ่าน
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';

function App() {
  return (
    <BrowserRouter>
      {/* Wrapper คลุมทั้งหมดเพื่อจัด Layout */}
      <div className="page-wrapper">
        
        {/* Navbar อยู่บนสุด */}
        <Navbar />

        {/* ส่วนเนื้อหาหลัก */}
        <div className="main-content">
          <Routes>
            {/* 2. ปรับเปลี่ยน Route หลัก */}
            <Route path="/" element={<Home />} />           {/* หน้าแรก = Home */}
            <Route path="/login" element={<Login />} />     {/* หน้า Login แยกออกมา */}
            
            {/* ✅ เพิ่ม Route สำหรับลืมรหัสผ่าน */}
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Route อื่นๆ เหมือนเดิม */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/my-tasks" element={<MyTasks />} />
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
            <Route path="/history" element={<RepairHistory />} />
          </Routes>
        </div>

        {/* Footer ด้านล่างสุด */}
        <footer className="site-footer">
            <div className="footer-container">
                <div className="footer-links">
                    <span>🏠 หน้าแรก</span>
                    <span>• ประวัติการแจ้งซ่อม</span>
                    <span>• คู่มือการใช้งาน</span>
                    <span>• ติดต่อเรา</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
                    <div className="footer-social">
                        <span style={{color:'#1877F2', fontSize:'1.2rem', marginRight:'10px', cursor:'pointer'}}>Facebook</span>
                        <span style={{color:'#06C755', fontSize:'1.2rem', cursor:'pointer'}}>LINE</span>
                    </div>
                    <div style={{fontSize: '0.8rem'}}>© 2024 ระบบแจ้งซ่อม. All rights reserved.</div>
                </div>
            </div>
        </footer>

      </div>
    </BrowserRouter>
  );
}

export default App;