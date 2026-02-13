import { useEffect, useState } from 'react';
import api from './api';
import { useNavigate } from 'react-router-dom';
import './App.css';

function RepairHistory() {
    const [repairs, setRepairs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    // ✅ State สำหรับ Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelId, setCancelId] = useState(null);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) { navigate('/'); return; }
        fetchRepairs();
    }, []);

    const fetchRepairs = () => {
        const user = JSON.parse(localStorage.getItem('user'));
        api.get('/my-repairs/' + user.user_id)
            .then(res => setRepairs(Array.isArray(res.data) ? res.data : []))
            .catch(err => console.log(err));
    }

    const handleClickCancel = (id) => {
        setCancelId(id);
        setShowCancelModal(true);
    }

    const confirmCancel = () => {
        api.delete('/cancel-repair/' + cancelId).then(res => {
            if(res.data === "Success") {
                fetchRepairs();
                setShowCancelModal(false);
            }
        });
    }

    // --- Logic การกรองและแบ่งหน้า ---
    const filteredRepairs = repairs.filter(repair => 
        repair.device_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        repair.problem_detail.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentRepairs = filteredRepairs.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredRepairs.length / itemsPerPage);

    return (
        <div className="container" style={{marginTop: '20px'}}>
            <h2 style={{textAlign: 'left', marginBottom: '20px'}}>📋 ประวัติการแจ้งซ่อมของฉัน</h2>

            <div className="card no-print" style={{padding:'15px', marginBottom:'20px'}}>
                <div style={{display:'flex', alignItems:'center', gap:'10px', background:'#f8fafc', padding:'8px 15px', borderRadius:'50px', border:'1px solid #e2e8f0', maxWidth:'400px'}}>
                    <span style={{fontSize:'1.2rem'}}>🔍</span>
                    <input type="text" placeholder="ค้นหาประวัติ..." value={searchTerm} onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}} style={{border:'none', background:'transparent', outline:'none', width:'100%'}} />
                </div>
            </div>

            <div className="card" style={{ padding: '0', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                <table className="custom-table">
                    <thead>
                        <tr style={{backgroundColor: '#f9fafb'}}>
                            <th style={{textAlign: 'center', width: '60px'}}>ลำดับ</th>
                            <th>วันที่แจ้ง</th>
                            <th>อุปกรณ์</th>
                            <th>อาการ</th>
                            <th>สถานะ</th>
                            <th style={{textAlign: 'center', width: '180px'}}>จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentRepairs.map((repair, index) => (
                            <tr key={repair.id}>
                                <td style={{textAlign: 'center'}}>{indexOfFirstItem + index + 1}</td>
                                <td>{new Date(repair.date_created).toLocaleDateString('th-TH')}</td>
                                <td style={{fontWeight:'500'}}>{repair.device_name}</td>
                                <td>{repair.problem_detail}</td>
                                <td><span className={`status-badge ${repair.status === 'done' ? 'status-done' : repair.status === 'doing' ? 'status-doing' : 'status-pending'}`}>{repair.status === 'done' ? '✅ เสร็จสิ้น' : repair.status === 'doing' ? '🛠 กำลังซ่อม' : '⏳ รอรับเรื่อง'}</span></td>
                                <td style={{textAlign: 'center'}}>
                                    <div style={{display: 'flex', gap: '5px', justifyContent: 'center'}}>
                                        <button onClick={() => navigate(`/job/${repair.id}`)} className="btn-sm btn-primary">📄 ดูข้อมูล</button>
                                        {repair.status === 'pending' && (
                                            <button onClick={() => handleClickCancel(repair.id)} className="btn-sm" style={{backgroundColor: '#fee2e2', color: '#b91c1c', border:'1px solid #fca5a5'}}>❌ ยกเลิก</button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {currentRepairs.length === 0 && <tr><td colSpan="6" style={{textAlign:'center', padding:'30px', color:'#999'}}>ไม่พบข้อมูลที่ค้นหา</td></tr>}
                    </tbody>
                </table>

                {/* ✅ Pagination Controls */}
                {totalPages > 1 && (
                    <div className="no-print" style={{display:'flex', justifyContent:'center', padding:'20px', gap:'15px', alignItems:'center', background:'#fafafa', borderTop:'1px solid #eee'}}>
                        <button className="btn-sm btn-secondary" disabled={currentPage===1} onClick={()=>setCurrentPage(p=>p-1)}>&lt; ก่อนหน้า</button>
                        <span style={{fontWeight:'500', color:'#555'}}> หน้า {currentPage} จาก {totalPages} </span>
                        <button className="btn-sm btn-secondary" disabled={currentPage===totalPages} onClick={()=>setCurrentPage(p=>p+1)}>ถัดไป &gt;</button>
                    </div>
                )}
            </div>

            {/* Popup ยกเลิก */}
            {showCancelModal && (
                <div className="modal-overlay" style={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    <div className="modal-box" style={{backgroundColor: 'white', padding: '30px', borderRadius: '16px', width: '90%', maxWidth: '350px', textAlign: 'center'}}>
                        <h3 style={{marginTop: 0, color:'#333'}}>ยกเลิกรายการ?</h3>
                        <p style={{color: '#666', marginBottom: '25px'}}>ต้องการยกเลิกการแจ้งซ่อมนี้ใช่ไหม?</p>
                        <div style={{display: 'flex', gap: '10px'}}>
                            <button onClick={confirmCancel} className="btn-sm" style={{flex: 1, backgroundColor: '#ef4444', color: 'white', padding:'10px', fontSize:'1rem'}}>ใช่, ยกเลิกเลย</button>
                            <button onClick={() => setShowCancelModal(false)} className="btn-sm" style={{flex: 1, backgroundColor: '#e5e7eb', color: '#374151', padding:'10px', fontSize:'1rem'}}>ไม่</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
export default RepairHistory;