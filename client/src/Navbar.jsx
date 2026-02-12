import { useState } from 'react'; // ✅ เพิ่ม useState
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios'; // ✅ เพิ่ม axios
import './App.css';

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;

    // --- State สำหรับเปลี่ยนรหัสผ่าน ---
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [pwdData, setPwdData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handlePrint = () => {
        window.print();
    };

    const handleChangePassword = (e) => {
        e.preventDefault();
        if (pwdData.newPassword !== pwdData.confirmPassword) {
            alert("❌ รหัสผ่านใหม่ไม่ตรงกัน");
            return;
        }
        
        axios.put('http://localhost:3001/change-password', {
            user_id: user.user_id,
            oldPassword: pwdData.oldPassword,
            newPassword: pwdData.newPassword
        })
        .then(res => {
            if (res.data === "Success") {
                alert("✅ เปลี่ยนรหัสผ่านสำเร็จ! กรุณาเข้าสู่ระบบใหม่");
                handleLogout(); // บังคับ Logout
            } else if (res.data === "Wrong Old Password") {
                alert("❌ รหัสผ่านเดิมไม่ถูกต้อง");
            } else {
                alert("เกิดข้อผิดพลาด");
            }
        })
        .catch(err => console.log(err));
    }

    const getHomeLink = (role) => {
        switch(role) {
            case 'admin': return '/admin-dashboard';
            case 'technician': return '/my-tasks';
            case 'supervisor': return '/dashboard';
            case 'inventory': return '/inventory-dashboard';
            case 'user': return '/create';
            default: return '/';
        }
    };

    return (
        <>
        <nav className="navbar-modern no-print">
            <div className="navbar-container">
                <Link to="/" className="navbar-brand" style={{ textDecoration: 'none' }}>
                    <span style={{ fontSize: '1.2rem', marginRight: '8px' }}>🔧</span> 
                    <span className="brand-text">ระบบแจ้งซ่อม</span>
                </Link>

                <div className="navbar-menu-center">
                    {!user && <Link to="/" className={`nav-pill ${location.pathname === '/' ? 'active' : ''}`}>🏠 หน้าแรก</Link>}
                    {user && (
                        <>
                            {user.role !== 'user' && <Link to={getHomeLink(user.role)} className={`nav-pill ${location.pathname.includes('dashboard') ? 'active' : ''}`}>🏠 หน้าหลักระบบ</Link>}
                            {user.role === 'user' && (
                                <>
                                    <Link to="/create" className={`nav-pill ${location.pathname === '/create' ? 'active' : ''}`}>📝 แจ้งซ่อม</Link>
                                    <Link to="/history" className={`nav-pill ${location.pathname === '/history' ? 'active' : ''}`}>📋 ประวัติ</Link>
                                </>
                            )}
                            {user.role === 'admin' && (
                                <>
                                    <Link to="/add-user" className={`nav-pill ${location.pathname === '/add-user' ? 'active' : ''}`}>+ เพิ่มผู้ใช้</Link>
                                    <button onClick={handlePrint} className="nav-pill-btn">🖨️ พิมพ์</button>
                                </>
                            )}
                            {user.role === 'technician' && (
                                <>
                                    <Link to="/my-tasks" className={`nav-pill ${location.pathname === '/my-tasks' ? 'active' : ''}`}>🛠️ งานของฉัน</Link>
                                    <Link to="/inventory" className={`nav-pill ${location.pathname === '/inventory' ? 'active' : ''}`}>📦 เบิกวัสดุ</Link>
                                </>
                            )}
                            {user.role === 'supervisor' && (
                                <>
                                    <Link to="/approvals" className={`nav-pill ${location.pathname === '/approvals' ? 'active' : ''}`}>✅ อนุมัติวัสดุ</Link>
                                    <Link to="/reports" className={`nav-pill ${location.pathname === '/reports' ? 'active' : ''}`}>📊 รายงาน</Link>
                                </>
                            )}
                            {user.role === 'inventory' && (
                                <>
                                    <Link to="/inventory-report" className={`nav-pill ${location.pathname === '/inventory-report' ? 'active' : ''}`}>📉 สรุปสต็อก</Link>
                                    {(location.pathname === '/inventory-report' || location.pathname === '/inventory-dashboard') && <button onClick={handlePrint} className="nav-pill-btn">🖨️ พิมพ์รายงาน</button>}
                                </>
                            )}
                        </>
                    )}
                </div>

                <div className="navbar-user">
                    {user ? (
                        <>
                            <div className="user-info">
                                <span className="user-icon">👤</span>
                                <div style={{display:'flex', flexDirection:'column', lineHeight:'1.2'}}>
                                    <span className="user-name">{user.first_name} {user.last_name}</span>
                                    <span style={{fontSize:'0.75rem', color:'#64748b'}}>{user.role.toUpperCase()}</span>
                                </div>
                            </div>
                            {/* ✅ ปุ่มเปลี่ยนรหัสผ่าน */}
                            <button onClick={() => setShowPasswordModal(true)} className="btn-sm" style={{marginRight:'5px', background:'none', border:'1px solid #ccc', color:'#333'}}>🔑</button>
                            <button onClick={handleLogout} className="btn-logout-red">🚪 ออก</button>
                        </>
                    ) : (
                        <Link to="/login" className="btn btn-primary" style={{ textDecoration: 'none', color: 'white', padding: '8px 20px' }}>🔐 เข้าสู่ระบบ</Link>
                    )}
                </div>
            </div>
        </nav>

        {/* --- Modal เปลี่ยนรหัสผ่าน --- */}
        {showPasswordModal && (
            <div className="modal-overlay" style={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                <div style={{backgroundColor: 'white', padding: '30px', borderRadius: '16px', width: '350px', textAlign: 'center'}}>
                    <h3 style={{marginTop: 0}}>🔑 เปลี่ยนรหัสผ่าน</h3>
                    <form onSubmit={handleChangePassword}>
                        <div className="form-group" style={{textAlign:'left'}}>
                            <label>รหัสผ่านเดิม</label>
                            <input type="password" className="input-modern" required onChange={e => setPwdData({...pwdData, oldPassword: e.target.value})} />
                        </div>
                        <div className="form-group" style={{textAlign:'left'}}>
                            <label>รหัสผ่านใหม่</label>
                            <input type="password" className="input-modern" required onChange={e => setPwdData({...pwdData, newPassword: e.target.value})} />
                        </div>
                        <div className="form-group" style={{textAlign:'left'}}>
                            <label>ยืนยันรหัสผ่านใหม่</label>
                            <input type="password" className="input-modern" required onChange={e => setPwdData({...pwdData, confirmPassword: e.target.value})} />
                        </div>
                        <div style={{display: 'flex', gap: '10px', marginTop:'20px'}}>
                            <button type="submit" className="btn btn-primary" style={{flex: 1}}>ยืนยัน</button>
                            <button type="button" onClick={() => setShowPasswordModal(false)} className="btn btn-secondary" style={{flex: 1}}>ยกเลิก</button>
                        </div>
                    </form>
                </div>
            </div>
        )}
        </>
    );
}

export default Navbar;