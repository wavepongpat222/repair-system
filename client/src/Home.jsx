import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

function Home() {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);

    // 1. เช็คว่ามีคนล็อกอินอยู่ไหมตอนโหลดหน้าเว็บ
    useEffect(() => {
        const userString = localStorage.getItem('user');
        if (userString) {
            setCurrentUser(JSON.parse(userString));
        }
    }, []);

    // ฟังก์ชันหาหน้าแรกของแต่ละ Role (เอาไว้พาเขากลับไปหน้าทำงาน)
    const getHomeLink = () => {
        if (!currentUser) return '/login';
        switch(currentUser.role) {
            case 'admin': return '/admin-dashboard';
            case 'technician': return '/my-tasks'; // หรือ /dashboard
            case 'supervisor': return '/dashboard';
            case 'inventory': return '/inventory-dashboard';
            case 'user': return '/create';
            default: return '/';
        }
    };

    return (
        <div className="container" style={{ marginTop: '50px', textAlign: 'center' }}>
            <div className="card" style={{ padding: '60px 40px', backgroundColor: '#fff', maxWidth: '900px', margin: '0 auto', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                <h1 style={{ color: '#3b82f6', fontSize: '2.5rem', marginBottom: '20px', fontWeight: 'bold' }}>
                    🔧 ระบบแจ้งซ่อมพัสดุและครุภัณฑ์ออนไลน์
                </h1>
                <p style={{ fontSize: '1.2rem', color: '#64748b', marginBottom: '40px', lineHeight: '1.6' }}>
                    ยินดีต้อนรับเข้าสู่ระบบจัดการงานซ่อมบำรุงภายในองค์กร <br/>
                    ท่านสามารถแจ้งปัญหา ติดตามสถานะงาน และตรวจสอบประวัติการซ่อมได้ง่ายๆ ตลอด 24 ชั่วโมง
                </p>

                {/* กล่อง Feature 3 อัน */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginBottom: '50px', flexWrap: 'wrap' }}>
                    <div className="feature-item" style={{ width: '220px', padding: '20px', background: '#f8fafc', borderRadius: '12px' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📝</div>
                        <h3 style={{ margin: '10px 0', color: '#334155' }}>แจ้งซ่อมง่าย</h3>
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>กรอกข้อมูลและอัปโหลดรูปภาพความเสียหายได้ทันที</p>
                    </div>
                    <div className="feature-item" style={{ width: '220px', padding: '20px', background: '#f8fafc', borderRadius: '12px' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '15px' }}>⚡</div>
                        <h3 style={{ margin: '10px 0', color: '#334155' }}>ติดตามงานไว</h3>
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>ทราบสถานะการดำเนินงานแบบ Real-time ทุกขั้นตอน</p>
                    </div>
                    <div className="feature-item" style={{ width: '220px', padding: '20px', background: '#f8fafc', borderRadius: '12px' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📊</div>
                        <h3 style={{ margin: '10px 0', color: '#334155' }}>ตรวจสอบได้</h3>
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>ดูประวัติการซ่อมย้อนหลังเพื่อวิเคราะห์ปัญหาได้</p>
                    </div>
                </div>

                {/* --- 🔴 ส่วนปุ่มด้านล่าง (Conditional Rendering) --- */}
                {currentUser ? (
                    // กรณีล็อกอินแล้ว: เปลี่ยนปุ่มเป็น "กลับสู่หน้าหลักระบบ" แทน (หรือจะลบทิ้งก็ได้ แต่มีไว้จะ UX ดีกว่าครับ)
                    <div style={{ animation: 'fadeIn 0.5s' }}>
                        <p style={{marginBottom:'15px', color:'#059669', fontWeight:'bold'}}>
                            ✅ คุณกำลังเข้าใช้งานในชื่อ: {currentUser.first_name} {currentUser.last_name} ({currentUser.role.toUpperCase()})
                        </p>
                        <button 
                            className="btn btn-primary" 
                            style={{ padding: '15px 50px', fontSize: '1.2rem', borderRadius: '50px', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)' }}
                            onClick={() => navigate(getHomeLink())}
                        >
                            🏠 กลับสู่หน้าทำงานของคุณ
                        </button>
                    </div>
                ) : (
                    // กรณี "ยังไม่ล็อกอิน": โชว์ปุ่ม Login เหมือนเดิม
                    <button 
                        className="btn btn-primary" 
                        style={{ padding: '15px 50px', fontSize: '1.2rem', borderRadius: '50px', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)' }}
                        onClick={() => navigate('/login')}
                    >
                        🚀 เข้าสู่ระบบ / แจ้งซ่อมทันที
                    </button>
                )}
            </div>
        </div>
    );
}

export default Home;