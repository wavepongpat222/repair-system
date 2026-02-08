import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './App.css';

function Dashboard() {
    const [repairs, setRepairs] = useState([]);
    const [filteredRepairs, setFilteredRepairs] = useState([]); 
    const [filterType, setFilterType] = useState('all'); 
    
    const [currentUser, setCurrentUser] = useState(null);
    const [technicians, setTechnicians] = useState([]);   
    
    // Pagination Config
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const navigate = useNavigate();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        
        // 1. ตรวจสอบการล็อกอิน
        if (!user) { 
            navigate('/'); 
            return; 
        }

        // 2. แยกหน้าตาม Role
        if (user.role === 'user') {
            navigate('/user-dashboard');
            return;
        }
        if (user.role === 'admin') {
            navigate('/admin-dashboard');
            return;
        }
        if (user.role === 'inventory') {
            navigate('/inventory-dashboard');
            return;
        }

        setCurrentUser(user);
        fetchRepairs();
        fetchTechnicians();

    }, []);

    // Logic การกรองข้อมูล
    useEffect(() => {
        let result = repairs;
        if (filterType === 'mine' && currentUser) {
            result = repairs.filter(item => item.technician_id === currentUser.user_id);
        }
        setFilteredRepairs(result);
        setCurrentPage(1); 
    }, [repairs, filterType, currentUser]);

    // Logic Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredRepairs.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredRepairs.length / itemsPerPage);

    const goToPrev = () => setCurrentPage(prev => Math.max(prev - 1, 1));
    const goToNext = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));

    // API Calls
    const fetchRepairs = () => {
        axios.get('http://localhost:3001/repairs')
            .then(res => {
                setRepairs(res.data);
                setFilteredRepairs(res.data);
            })
            .catch(err => console.log(err));
    }

    const fetchTechnicians = () => {
        axios.get('http://localhost:3001/technicians')
            .then(res => {
                if (Array.isArray(res.data)) setTechnicians(res.data);
            })
            .catch(err => console.log(err));
    }

    // Handlers
    const handleAssign = (repair_id, tech_id) => {
        if(!tech_id) return; 
        if(!window.confirm(`ยืนยันการมอบหมายงานให้ช่าง?`)) return;
        axios.put('http://localhost:3001/assign-job', { repair_id, technician_id: tech_id })
             .then(res => { if(res.data==="Success") { alert("มอบหมายงานสำเร็จ"); fetchRepairs(); } });
    }

    const handleStatusChange = (id, newStatus) => {
        if(!window.confirm("ยืนยันการเปลี่ยนสถานะ?")) return;
        axios.put('http://localhost:3001/update-status/'+id, { status: newStatus })
             .then(res => { if(res.data==="Success") fetchRepairs(); });
    }

    const handleLogout = () => { localStorage.removeItem('user'); navigate('/'); }

    const getStatusClass = (s) => s==='done'?'status-badge status-done':s==='doing'?'status-badge status-doing':'status-badge status-pending';

    return (
        <div className="container">
            {/* Header */}
            <div style={{ textAlign: 'right', marginBottom: '10px', color: '#666', fontSize: '0.9rem' }}>
                👋 สวัสดี, <b>{currentUser?.first_name} {currentUser?.last_name}</b> ({currentUser?.role}) 
                | <span style={{color: 'blue', cursor: 'pointer', textDecoration: 'underline'}} onClick={() => navigate('/change-password')}>เปลี่ยนรหัสผ่าน</span>
            </div>

            {/* Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>🔧 ระบบจัดการงานซ่อม (เจ้าหน้าที่)</h2>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    
                    {/* ปุ่มคลังวัสดุ (ทุกคนที่เป็น Staff เห็นได้) */}
                    <Link to="/inventory">
                        <button className="btn btn-secondary" style={{ backgroundColor: '#6366f1', color: 'white' }}>
                            📦 คลังวัสดุ
                        </button>
                    </Link>

                    {/* ปุ่มสำหรับ Supervisor */}
                    {currentUser?.role === 'supervisor' && (
                        <>
                            <Link to="/approvals">
                                <button className="btn btn-secondary" style={{ backgroundColor: '#10b981', color: 'white' }}>
                                    ✅ อนุมัติวัสดุ
                                </button>
                            </Link>
                            <Link to="/reports">
                                <button className="btn btn-secondary" style={{ backgroundColor: '#8b5cf6', color: 'white' }}>
                                    📊 รายงานซ่อม
                                </button>
                            </Link>
                        </>
                    )}
                    
                    {/* --- เอาปุ่มแจ้งซ่อมออกแล้ว --- */}
                    
                    <button className="btn" onClick={handleLogout} style={{ backgroundColor: '#ef4444', color: 'white', marginLeft: '10px' }}>ออกจากระบบ</button>
                </div>
            </div>

            {/* Filter Buttons (เฉพาะช่าง) */}
            {currentUser?.role === 'technician' && (
                <div style={{marginBottom: '15px', display: 'flex', gap: '10px'}}>
                    <button onClick={() => setFilterType('all')} className="btn" style={{backgroundColor: filterType === 'all' ? '#3b82f6' : '#e5e7eb', color: filterType === 'all' ? 'white' : 'black'}}>📋 งานทั้งหมด</button>
                    <button onClick={() => setFilterType('mine')} className="btn" style={{backgroundColor: filterType === 'mine' ? '#10b981' : '#e5e7eb', color: filterType === 'mine' ? 'white' : 'black'}}>🟢 งานของฉัน ({repairs.filter(r => r.technician_id === currentUser.user_id).length})</button>
                </div>
            )}

            {/* Table */}
            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <table className="custom-table">
                    <thead>
                        <tr>
                            <th style={{ width: '50px', textAlign: 'center' }}>ลำดับ</th>
                            <th>รูปภาพ</th>
                            <th>อุปกรณ์</th>
                            <th>อาการเสีย</th>
                            <th>สถานที่</th>
                            {currentUser?.role === 'supervisor' && <th>ผู้รับผิดชอบ</th>}
                            <th style={{ textAlign: 'center' }}>สถานะ</th>
                            <th style={{ textAlign: 'center' }}>จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.length > 0 ? (
                            currentItems.map((item, index) => {
                                const isMyJob = item.technician_id === currentUser?.user_id;
                                const realIndex = indexOfFirstItem + index + 1;

                                return (
                                    <tr key={item.id} style={{
                                        backgroundColor: isMyJob ? '#d1fae5' : 'white',
                                        borderLeft: isMyJob ? '5px solid #10b981' : 'none' 
                                    }}>
                                        <td style={{ textAlign: 'center' }}><b>{realIndex}</b></td>
                                        <td>
                                            {item.repair_image ? (
                                                <a href={`http://localhost:3001/uploads/${item.repair_image}`} target="_blank" rel="noreferrer">
                                                    <img src={`http://localhost:3001/uploads/${item.repair_image}`} alt="img" style={{width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px'}} />
                                                </a>
                                            ) : '-'}
                                        </td>
                                        <td style={{ fontWeight: '500' }}>
                                            {item.device_name}
                                            {isMyJob && <span style={{fontSize:'0.7rem', backgroundColor:'#10b981', color:'white', padding:'2px 5px', borderRadius:'4px', marginLeft:'5px'}}>งานฉัน</span>}
                                        </td>
                                        <td>{item.problem_detail}</td>
                                        <td>{item.location}</td>
                                        
                                        {/* Dropdown เลือกช่าง (เฉพาะ Supervisor) */}
                                        {currentUser?.role === 'supervisor' && (
                                            <td>
                                                <select value={item.technician_id || ''} onChange={(e) => handleAssign(item.id, e.target.value)} style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ccc', width: '100%' }}>
                                                    <option value="">-- เลือกช่าง --</option>
                                                    {technicians.map(tech => <option key={tech.id} value={tech.id}>{tech.first_name} {tech.last_name}</option>)}
                                                </select>
                                            </td>
                                        )}

                                        <td style={{ textAlign: 'center' }}>
                                            {/* ถ้าเป็นช่างคนอื่น ห้ามเปลี่ยนสถานะ (เว้นแต่เป็น Super) */}
                                            {(currentUser.role === 'technician' && !isMyJob) ? (
                                                <span className={getStatusClass(item.status)}>
                                                    {item.status === 'pending' ? 'รอดำเนินการ' : item.status === 'doing' ? 'กำลังซ่อม' : 'เสร็จสิ้น'}
                                                </span>
                                            ) : (
                                                <select value={item.status} onChange={(e) => handleStatusChange(item.id, e.target.value)} className={getStatusClass(item.status)} style={{ border: 'none', cursor: 'pointer', padding: '5px' }}>
                                                    <option value="pending">รอดำเนินการ</option>
                                                    <option value="doing">กำลังซ่อม</option>
                                                    <option value="done">เสร็จสิ้น</option>
                                                </select>
                                            )}
                                        </td>
                                        
                                        <td style={{ textAlign: 'center' }}>
                                            <button 
                                                onClick={() => navigate(`/job/${item.id}`)}
                                                style={{
                                                    backgroundColor: '#3b82f6', 
                                                    color: 'white', 
                                                    border: 'none', 
                                                    borderRadius: '4px', 
                                                    padding: '5px 10px', 
                                                    cursor: 'pointer',
                                                    fontSize: '0.85rem'
                                                }}
                                                title="ดูรายละเอียด/ปิดงาน/เบิกของ"
                                            >
                                                📝 รายละเอียด
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })
                        ) : (
                            <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>ไม่มีงานซ่อมในขณะนี้</td></tr>
                        )}
                    </tbody>
                </table>

                {/* Pagination Controls */}
                {filteredRepairs.length > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '15px', gap: '10px', borderTop: '1px solid #eee' }}>
                        <button onClick={goToPrev} disabled={currentPage === 1} className="btn btn-secondary" style={{ opacity: currentPage === 1 ? 0.5 : 1 }}>◀ ก่อนหน้า</button>
                        <span style={{ fontWeight: 'bold', color: '#555' }}>หน้าที่ {currentPage} / {totalPages}</span>
                        <button onClick={goToNext} disabled={currentPage === totalPages} className="btn btn-secondary" style={{ opacity: currentPage === totalPages ? 0.5 : 1 }}>ถัดไป ▶</button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;