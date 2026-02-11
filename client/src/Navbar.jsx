import { Link, useNavigate, useLocation } from 'react-router-dom';
import './App.css';

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    
    // 1. ดึง user แบบปลอดภัย (เผื่อยังไม่ได้ login)
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;

    // 2. ลบบรรทัดที่ซ่อน Navbar ออก เพื่อให้แสดงทุกหน้า
    // if (!user || location.pathname === '/') return null; 

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login'); // เปลี่ยนให้กลับไปหน้า Login
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
            case 'user': return '/create';
            default: return '/';
        }
    };

    return (
        <nav className="navbar-modern no-print">
            <div className="navbar-container">
                
                {/* 1. โลโก้ (คลิกแล้วกลับหน้า Home) */}
                <Link to="/" className="navbar-brand" style={{ textDecoration: 'none' }}>
                    <span style={{ fontSize: '1.2rem', marginRight: '8px' }}>🔧</span> 
                    <span className="brand-text">ระบบแจ้งซ่อม</span>
                </Link>

                {/* 2. เมนูตรงกลาง */}
                <div className="navbar-menu-center">
                    
                    {/* ถ้ายังไม่ Login ให้โชว์ปุ่มหน้าแรก */}
                    {!user && (
                        <Link to="/" className={`nav-pill ${location.pathname === '/' ? 'active' : ''}`}>
                            🏠 หน้าแรก
                        </Link>
                    )}

                    {/* ถ้า Login แล้ว โชว์เมนูตาม Role (ใช้โค้ดเดิมของคุณ) */}
                    {user && (
                        <>
                            {/* ปุ่มหน้าหลักระบบ (สำหรับเจ้าหน้าที่) */}
                            {user.role !== 'user' && (
                                <Link 
                                    to={getHomeLink(user.role)} 
                                    className={`nav-pill ${location.pathname.includes('dashboard') && user.role !== 'technician' ? 'active' : ''}`}
                                >
                                    🏠 หน้าหลักระบบ
                                </Link>
                            )}

                            {/* --- USER (ผู้แจ้ง) --- */}
                            {user.role === 'user' && (
                                <>
                                    <Link to="/create" className={`nav-pill ${location.pathname === '/create' ? 'active' : ''}`}>
                                        📝 แจ้งซ่อม
                                    </Link>
                                    <Link to="/history" className={`nav-pill ${location.pathname === '/history' ? 'active' : ''}`}>
                                        📋 ประวัติ
                                    </Link>
                                </>
                            )}
                            
                            {/* --- ADMIN --- */}
                            {user.role === 'admin' && (
                                <>
                                    <Link to="/users" className={`nav-pill ${location.pathname === '/users' ? 'active' : ''}`}>
                                        👥 จัดการผู้ใช้
                                    </Link>
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
                        </>
                    )}
                </div>

                {/* 3. ส่วนขวา: ข้อมูลผู้ใช้ หรือ ปุ่ม Login */}
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
                            <button onClick={handleLogout} className="btn-logout-red">🚪 ออก</button>
                        </>
                    ) : (
                        // ถ้ายังไม่ Login ให้โชว์ปุ่มเข้าสู่ระบบ
                        <Link to="/login" className="btn btn-primary" style={{ textDecoration: 'none', color: 'white', padding: '8px 20px' }}>
                            🔐 เข้าสู่ระบบ
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;