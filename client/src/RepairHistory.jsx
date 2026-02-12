import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './App.css';

function RepairHistory() {
    const [repairs, setRepairs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    // Popup State
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelId, setCancelId] = useState(null);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) { navigate('/'); return; }
        fetchRepairs();
    }, []);

    const fetchRepairs = () => {
        const user = JSON.parse(localStorage.getItem('user'));
        axios.get('http://localhost:3001/my-repairs/' + user.user_id)
            .then(res => setRepairs(res.data))
            .catch(err => console.log(err));
    }

    const handleClickCancel = (id) => {
        setCancelId(id);
        setShowCancelModal(true);
    }

    const confirmCancel = () => {
        axios.delete('http://localhost:3001/cancel-repair/' + cancelId)
            .then(res => {
                if(res.data === "Success") {
                    fetchRepairs();
                    setShowCancelModal(false);
                }
            })
            .catch(err => console.log(err));
    }

    const filteredRepairs = repairs.filter(repair => 
        repair.device_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        repair.problem_detail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        repair.id.toString().includes(searchTerm)
    );

    return (
        <div className="container" style={{marginTop: '20px'}}>
            <h2 style={{textAlign: 'left', marginBottom: '20px'}}>📋 ประวัติการแจ้งซ่อมของฉัน</h2>

            <div className="card no-print" style={{padding:'15px', marginBottom:'20px'}}>
                <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                    <span style={{fontSize:'1.2rem'}}>🔍</span>
                    <input type="text" className="input-modern" placeholder="ค้นหา..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{maxWidth: '100%', margin: 0}} />
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
                        {filteredRepairs.map((repair, index) => (
                            <tr key={repair.id}>
                                <td style={{textAlign: 'center'}}>{index + 1}</td>
                                <td>{new Date(repair.date_created).toLocaleDateString('th-TH')}</td>
                                <td>{repair.device_name}</td>
                                <td>{repair.problem_detail}</td>
                                <td>
                                    <span className={`status-badge ${repair.status === 'done' ? 'status-done' : repair.status === 'doing' ? 'status-doing' : 'status-pending'}`}>
                                        {repair.status === 'done' ? '✅ เสร็จสิ้น' : repair.status === 'doing' ? '🛠 กำลังซ่อม' : '⏳ รอรับเรื่อง'}
                                    </span>
                                </td>
                                
                                {/* ✅ ปรับปุ่มตรงนี้ใหม่ ให้เล็กลงและเรียงสวยๆ */}
                                <td style={{textAlign: 'center'}}>
                                    <div style={{display: 'flex', gap: '5px', justifyContent: 'center'}}>
                                        
                                        {/* ปุ่มดูข้อมูล (สีฟ้า เล็ก) */}
                                        <button 
                                            onClick={() => navigate(`/job/${repair.id}`)} 
                                            style={{
                                                backgroundColor: '#3b82f6', color: 'white', border: 'none',
                                                padding: '6px 12px', borderRadius: '4px', cursor: 'pointer',
                                                fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px'
                                            }}
                                            title="ดูรายละเอียด"
                                        >
                                            📄 ดูข้อมูล
                                        </button>
                                        
                                        {/* ปุ่มยกเลิก (สีแดงอ่อน เล็ก) - โชว์เฉพาะตอนรอรับเรื่อง */}
                                        {repair.status === 'pending' && (
                                            <button 
                                                onClick={() => handleClickCancel(repair.id)}
                                                style={{
                                                    backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5',
                                                    padding: '6px 12px', borderRadius: '4px', cursor: 'pointer',
                                                    fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px'
                                                }}
                                                title="ยกเลิกการแจ้งซ่อม"
                                            >
                                                ❌ ยกเลิก
                                            </button>
                                        )}
                                    </div>
                                </td>

                            </tr>
                        ))}
                        {filteredRepairs.length === 0 && (
                            <tr><td colSpan="6" style={{textAlign:'center', padding:'30px', color:'#999'}}>ไม่พบข้อมูลที่ค้นหา</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Popup ยืนยันยกเลิก */}
            {showCancelModal && (
                <div className="modal-overlay" style={modalOverlayStyle}>
                    <div className="modal-box" style={modalBoxStyle}>
                        <div style={{fontSize: '3rem', marginBottom: '10px'}}>⚠️</div>
                        <h3 style={{marginTop: 0, color:'#333'}}>ยกเลิกรายการ?</h3>
                        <p style={{color: '#666', marginBottom: '25px'}}>ต้องการยกเลิกการแจ้งซ่อมนี้ใช่ไหม?</p>
                        <div style={{display: 'flex', gap: '10px'}}>
                            <button onClick={confirmCancel} style={{flex: 1, backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer'}}>ใช่, ยกเลิกเลย</button>
                            <button onClick={() => setShowCancelModal(false)} style={{flex: 1, backgroundColor: '#e5e7eb', color: '#374151', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer'}}>ไม่</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Style
const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' };
const modalBoxStyle = { backgroundColor: 'white', padding: '30px', borderRadius: '16px', width: '90%', maxWidth: '350px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' };

export default RepairHistory;