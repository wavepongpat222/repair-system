import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './App.css';

function MaterialApprovals() {
    const [requests, setRequests] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [activeTab, setActiveTab] = useState('pending'); // ✅ เพิ่ม Tab: pending, history
    const navigate = useNavigate();

    // Popup State
    const [modalConfig, setModalConfig] = useState({ show: false, type: '', id: null, title: '', message: '', color: '' });

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !['supervisor', 'admin', 'inventory'].includes(user.role)) { navigate('/'); return; }
        setCurrentUser(user);
        fetchRequests();
    }, []);

    const fetchRequests = () => {
        axios.get('http://localhost:3001/all-withdrawal-requests').then(res => setRequests(res.data));
    }

    const clickApprove = (id) => { setModalConfig({ show: true, type: 'approve', id: id, title: 'ยืนยันการอนุมัติ?', message: 'ส่งต่อให้ฝ่ายคลังจ่ายของ', color: '#3b82f6' }); }
    const clickInventoryConfirm = (id) => { setModalConfig({ show: true, type: 'confirm_stock', id: id, title: 'ยืนยันการจ่ายวัสดุ?', message: 'ระบบจะตัดสต็อกทันที', color: '#10b981' }); }
    const clickReject = (id) => { setModalConfig({ show: true, type: 'reject', id: id, title: 'ปฏิเสธคำขอ?', message: 'ต้องการตีกลับรายการนี้ใช่หรือไม่', color: '#ef4444' }); }

    const handleConfirmAction = () => {
        const { type, id } = modalConfig;
        let url = type === 'approve' ? 'supervisor-approve' : type === 'confirm_stock' ? 'inventory-confirm' : 'reject-withdrawal';
        axios.put(`http://localhost:3001/${url}`, { id }).then(res => {
            if (res.data === "Success") { setModalConfig({ ...modalConfig, show: false }); fetchRequests(); }
            else if (res.data === "Not Enough Stock") { alert("❌ สต็อกไม่พอ!"); setModalConfig({ ...modalConfig, show: false }); }
        });
    }

    // ✅ ฟิลเตอร์ข้อมูลตามแท็บและ Role
    const filteredRequests = requests.filter(r => {
        if (!currentUser) return false;

        if (activeTab === 'pending') {
            // Tab งานที่ต้องทำ (Pending)
            if (currentUser.role === 'supervisor') return r.status === 'pending';
            if (currentUser.role === 'inventory') return r.status === 'approved_by_sup';
            return r.status === 'pending' || r.status === 'approved_by_sup';
        } else {
            // Tab ประวัติ (History)
            if (currentUser.role === 'supervisor') return r.status !== 'pending';
            if (currentUser.role === 'inventory') return r.status !== 'approved_by_sup' && r.status !== 'pending';
            return true;
        }
    });

    return (
        <div className="container" style={{marginTop: '20px'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                <h2 style={{margin:0}}>
                    {currentUser?.role === 'inventory' ? '📦 รายการเบิกวัสดุ' : '📋 ตรวจสอบการเบิกวัสดุ'}
                </h2>
                {/* ✅ ปุ่มเลือกแท็บ */}
                <div style={{display:'flex', gap:'10px'}}>
                    <button className={`btn ${activeTab === 'pending' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('pending')}>
                        รายการรออนุมัติ
                    </button>
                    <button className={`btn ${activeTab === 'history' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('history')}>
                        ประวัติการตรวจสอบ
                    </button>
                </div>
            </div>

            <div className="card" style={{padding: '0', overflow: 'hidden'}}>
                <table className="custom-table">
                    <thead><tr><th style={{textAlign:'center'}}>#</th><th>วันที่</th><th>ผู้เบิก</th><th>วัสดุ</th><th>จำนวน</th><th style={{textAlign:'center'}}>สถานะ</th><th style={{textAlign:'center'}}>จัดการ</th></tr></thead>
                    <tbody>
                        {filteredRequests.length > 0 ? filteredRequests.map((r, index) => (
                            <tr key={r.id}>
                                <td style={{textAlign: 'center'}}>{index + 1}</td>
                                <td>{new Date(r.date_requested).toLocaleString('th-TH')}</td>
                                <td>{r.first_name} {r.last_name}</td>
                                <td>{r.material_name}</td>
                                <td style={{textAlign:'center', fontWeight:'bold'}}>{r.quantity} {r.unit}</td>
                                <td style={{textAlign:'center'}}>
                                    {r.status === 'pending' && <span className="status-badge status-pending">รอหัวหน้าอนุมัติ</span>}
                                    {r.status === 'approved_by_sup' && <span className="status-badge" style={{backgroundColor: '#dbeafe', color: '#1e40af'}}>รอคลังจ่ายของ</span>}
                                    {r.status === 'approved' || r.status === 'completed' ? <span className="status-badge status-done">✅ อนุมัติ/จ่ายแล้ว</span> : null}
                                    {r.status === 'rejected' && <span className="status-badge" style={{backgroundColor: '#fee2e2', color: '#b91c1c'}}>❌ ไม่อนุมัติ</span>}
                                </td>
                                <td style={{textAlign:'center'}}>
                                    {/* แสดงปุ่มเฉพาะในหน้า Pending */}
                                    {activeTab === 'pending' && (
                                        <>
                                            {(currentUser.role === 'supervisor' || currentUser.role === 'admin') && r.status === 'pending' && <><button onClick={() => clickApprove(r.id)} style={{marginRight:'5px', backgroundColor:'#3b82f6', color:'white', border:'none', padding:'5px 10px', borderRadius:'4px', cursor:'pointer'}}>✓</button><button onClick={() => clickReject(r.id)} style={{backgroundColor:'#ef4444', color:'white', border:'none', padding:'5px 10px', borderRadius:'4px', cursor:'pointer'}}>✕</button></>}
                                            {(currentUser.role === 'inventory' || currentUser.role === 'admin') && r.status === 'approved_by_sup' && <><button onClick={() => clickInventoryConfirm(r.id)} style={{marginRight:'5px', backgroundColor:'#10b981', color:'white', border:'none', padding:'5px 10px', borderRadius:'4px', cursor:'pointer'}}>📦 จ่าย</button><button onClick={() => clickReject(r.id)} style={{backgroundColor:'#ef4444', color:'white', border:'none', padding:'5px 10px', borderRadius:'4px', cursor:'pointer'}}>✕</button></>}
                                        </>
                                    )}
                                    {activeTab === 'history' && <span style={{color:'#999'}}>-</span>}
                                </td>
                            </tr>
                        )) : <tr><td colSpan="7" style={{textAlign: 'center', padding: '20px', color: '#999'}}>ไม่มีข้อมูล</td></tr>}
                    </tbody>
                </table>
            </div>

            {/* Modal Popup */}
            {modalConfig.show && (
                <div style={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    <div style={{backgroundColor: 'white', padding: '30px', borderRadius: '16px', width: '350px', textAlign: 'center'}}>
                        <h3 style={{marginTop: 0}}>{modalConfig.title}</h3>
                        <p>{modalConfig.message}</p>
                        <div style={{display: 'flex', gap: '10px'}}>
                            <button onClick={handleConfirmAction} style={{flex: 1, backgroundColor: modalConfig.color, color: 'white', border: 'none', padding: '10px', borderRadius: '6px', cursor:'pointer'}}>ยืนยัน</button>
                            <button onClick={() => setModalConfig({...modalConfig, show: false})} style={{flex: 1, backgroundColor: '#e5e7eb', border: 'none', padding: '10px', borderRadius: '6px', cursor:'pointer'}}>ยกเลิก</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MaterialApprovals;