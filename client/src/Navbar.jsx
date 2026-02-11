import { Link, useNavigate, useLocation } from 'react-router-dom';
import './App.css';

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user || location.pathname === '/') return null;

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/');
    };

    const handlePrint = () => {
        window.print();
    };

    const getHomeLink = (role) => {
        switch(role) {
            case 'admin': return '/admin-dashboard';
            case 'technician': return '/dashboard';
            case 'supervisor': return '/dashboard';
            case 'inventory': return '/inventory-dashboard';
            case 'user': return '/create'; // ✅ เปลี่ยนหน้าแรกของ User เป็นหน้าแจ้งซ่อม
            default: return '/';
        }
    };

    return (
        <nav className="navbar-modern no-print">
            <div className="navbar-container">
                
                {/* 1. โลโก้ */}
                <div className="navbar-brand">
                    <span style={{ fontSize: '1.2rem', marginRight: '8px' }}>🔧</span> 
                    <span className="brand-text">ระบบแจ้งซ่อม</span>
                </div>

                {/* 2. เมนูตรงกลาง */}
                <div className="navbar-menu-center">
                    
                    {/* ปุ่มหน้าหลัก (แสดงให้ทุกคน ยกเว้น User) */}
                    {user.role !== 'user' && (
                        <Link 
                            to={getHomeLink(user.role)} 
                            className={`nav-pill ${location.pathname.includes('dashboard') && user.role !== 'technician' ? 'active' : ''}`}
                        >
                            🏠 หน้าหลัก
                        </Link>
                    )}

                    {/* --- USER (ผู้แจ้ง) --- */}
                    {user.role === 'user' && (
                        <>
                            {/* ✅ หน้าหลักของ User คือ "แจ้งซ่อม" */}
                            <Link to="/create" className={`nav-pill ${location.pathname === '/create' ? 'active' : ''}`}>
                                🏠 หน้าหลัก
                            </Link>
                            <Link to="/history" className={`nav-pill ${location.pathname === '/history' ? 'active' : ''}`}>
                                📋 ประวัติ
                            </Link>
                        </>
                    )}
                    
                    {/* --- ADMIN --- */}
                    {user.role === 'admin' && (
                        <>
                            <Link to="/add-user" className={`nav-pill ${location.pathname === '/add-user' ? 'active' : ''}`}>
                                + เพิ่มผู้ใช้
                            </Link>
                            <button onClick={handlePrint} className="nav-pill-btn">🖨️ พิมพ์</button>
                        </>
                    )}

                    {/* --- TECHNICIAN (ช่าง) --- */}
                    {user.role === 'technician' && (
                        <>
                            

                            <Link to="/my-tasks" className={`nav-pill ${location.pathname === '/my-tasks' ? 'active' : ''}`}>
                                🛠️ งานของฉัน
                            </Link>
                            
                            <Link to="/inventory" className={`nav-pill ${location.pathname === '/inventory' ? 'active' : ''}`}>
                                📦 เบิกวัสดุ
                            </Link>
                        </>
                    )}

                    {/* --- SUPERVISOR (หัวหน้าช่าง) --- */}
                    {user.role === 'supervisor' && (
                        <>
                             
                            <Link to="/approvals" className={`nav-pill ${location.pathname === '/approvals' ? 'active' : ''}`}>
                                ✅ อนุมัติวัสดุ
                            </Link>
                            <Link to="/reports" className={`nav-pill ${location.pathname === '/reports' ? 'active' : ''}`}>
                                📊 รายงาน
                            </Link>
                            
                        </>
                    )}

                    {/* --- INVENTORY (เจ้าหน้าที่คลัง) --- */}
                    {user.role === 'inventory' && (
                        <>
                            <Link to="/inventory-report" className={`nav-pill ${location.pathname === '/inventory-report' ? 'active' : ''}`}>
                                📉 สรุปสต็อก
                            </Link>
                            
                            {(location.pathname === '/inventory-report' || location.pathname === '/inventory-dashboard') && (
                                <button onClick={handlePrint} className="nav-pill-btn">🖨️ พิมพ์รายงาน</button>
                            )}
                        </>
                    )}
                </div>

                {/* 3. ข้อมูลผู้ใช้ */}
                <div className="navbar-user">
                    <div className="user-info">
                        <span className="user-icon">👤</span>
                        <div style={{display:'flex', flexDirection:'column', lineHeight:'1.2'}}>
                            <span className="user-name">{user.first_name} {user.last_name}</span>
                            <span style={{fontSize:'0.75rem', color:'#64748b'}}>{user.role.toUpperCase()}</span>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="btn-logout-red">🚪 ออก</button>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;