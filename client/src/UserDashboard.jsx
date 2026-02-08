import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './App.css';

function UserDashboard() {
    const [myRepairs, setMyRepairs] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || user.role !== 'user') { // ถ้าไม่ใช่ user ให้ดีดออก
            navigate('/'); 
            return;
        }
        setCurrentUser(user);
        fetchMyRepairs(user.user_id);
    }, []);

    const fetchMyRepairs = (userId) => {
        axios.get('http://localhost:3001/repairs')
            .then(res => {
                // กรองเอาเฉพาะงานของตัวเองทันที
                const myJobs = res.data.filter(item => item.reporter_id === userId);
                setMyRepairs(myJobs);
            })
            .catch(err => console.log(err));
    }

    const handleCancel = (repair_id) => {
        if(!window.confirm("ต้องการยกเลิกการแจ้งซ่อมนี้ใช่ไหม?")) return;
        axios.delete('http://localhost:3001/cancel-repair', { 
            data: { repair_id: repair_id, user_id: currentUser.user_id } 
        }).then(res => { 
             if(res.data==="Success") { alert("ยกเลิกเรียบร้อย"); fetchMyRepairs(currentUser.user_id); }
             else alert("ไม่สามารถยกเลิกได้"); 
        });
    }

    const handleLogout = () => { localStorage.removeItem('user'); navigate('/'); }

    // Logic Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = myRepairs.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(myRepairs.length / itemsPerPage);
    const goToPrev = () => setCurrentPage(p => Math.max(p - 1, 1));
    const goToNext = () => setCurrentPage(p => Math.min(p + 1, totalPages));

    const getStatusClass = (s) => s==='done'?'status-badge status-done':s==='doing'?'status-badge status-doing':'status-badge status-pending';
    const getStatusText = (s) => s==='pending'?'รอดำเนินการ':s==='doing'?'กำลังซ่อม':'เสร็จสิ้น';

    return (
        <div className="container">
            <div style={{ textAlign: 'right', marginBottom: '10px', color: '#666', fontSize: '0.9rem' }}>
                👋 สวัสดี, <b>{currentUser?.first_name}</b> (ผู้ใช้งานทั่วไป) 
                | <span style={{color: 'blue', cursor: 'pointer', textDecoration: 'underline'}} onClick={() => navigate('/change-password')}>เปลี่ยนรหัสผ่าน</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>📋 ประวัติการแจ้งซ่อมของฉัน</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <Link to="/create"><button className="btn btn-primary">+ แจ้งซ่อมใหม่</button></Link>
                    <button className="btn" onClick={handleLogout} style={{ backgroundColor: '#ef4444', color: 'white' }}>ออกจากระบบ</button>
                </div>
            </div>

            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <table className="custom-table">
                    <thead>
                        <tr>
                            <th style={{ width: '50px', textAlign: 'center' }}>ลำดับ</th>
                            <th>รูปภาพ</th>
                            <th>อุปกรณ์</th>
                            <th>อาการเสีย</th>
                            <th>สถานที่</th>
                            <th style={{ textAlign: 'center' }}>สถานะ</th>
                            <th style={{ textAlign: 'center' }}>จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.length > 0 ? (
                            currentItems.map((item, index) => (
                                <tr key={item.id}>
                                    <td style={{ textAlign: 'center' }}><b>{indexOfFirstItem + index + 1}</b></td>
                                    <td>
                                        {item.repair_image ? (
                                            <a href={`http://localhost:3001/uploads/${item.repair_image}`} target="_blank" rel="noreferrer">
                                                <img src={`http://localhost:3001/uploads/${item.repair_image}`} alt="img" style={{width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px'}} />
                                            </a>
                                        ) : '-'}
                                    </td>
                                    <td style={{ fontWeight: '500' }}>{item.device_name}</td>
                                    <td>{item.problem_detail}</td>
                                    <td>{item.location}</td>
                                    
                                    <td style={{ textAlign: 'center' }}>
                                        <span className={getStatusClass(item.status)}>
                                            {getStatusText(item.status)}
                                        </span>
                                    </td>
                                    
                                    <td style={{ textAlign: 'center' }}>
                                        {item.status === 'pending' && (
                                            <button onClick={() => handleCancel(item.id)} style={{backgroundColor: '#fb923c', color: 'white', border: 'none', borderRadius: '4px', padding: '5px 10px', cursor: 'pointer', fontSize: '0.85rem'}}>ยกเลิก</button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>คุณยังไม่เคยแจ้งซ่อม</td></tr>
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                {myRepairs.length > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '15px', gap: '10px', borderTop: '1px solid #eee' }}>
                        <button onClick={goToPrev} disabled={currentPage === 1} className="btn btn-secondary">◀</button>
                        <span>หน้า {currentPage} / {totalPages}</span>
                        <button onClick={goToNext} disabled={currentPage === totalPages} className="btn btn-secondary">▶</button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default UserDashboard;