import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './App.css';

function MaterialApprovals() {
    const [requests, setRequests] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();

    // Modal State
    const [modalConfig, setModalConfig] = useState({
        show: false,
        type: '',       // 'approve', 'confirm_stock', 'reject'
        id: null,
        title: '',
        message: '',
        color: ''
    });

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || (user.role !== 'supervisor' && user.role !== 'admin' && user.role !== 'inventory')) {
            navigate('/');
            return;
        }
        setCurrentUser(user);
        fetchRequests();
    }, []);

    const fetchRequests = () => {
        axios.get('http://localhost:3001/all-withdrawal-requests')
            .then(res => setRequests(res.data))
            .catch(err => console.log(err));
    }

    // --- เตรียมเปิด Popup ---
    const clickApprove = (id) => {
        setModalConfig({
            show: true, type: 'approve', id: id,
            title: 'ยืนยันการอนุมัติ?', message: 'รายการจะถูกส่งต่อไปยังฝ่ายคลังเพื่อจ่ายของ',
            color: '#3b82f6'
        });
    }

    const clickInventoryConfirm = (id) => {
        setModalConfig({
            show: true, type: 'confirm_stock', id: id,
            title: 'ยืนยันการจ่ายวัสดุ?', message: 'ระบบจะตัดสต็อกทันที การกระทำนี้ย้อนกลับไม่ได้',
            color: '#10b981'
        });
    }

    const clickReject = (id) => {
        setModalConfig({
            show: true, type: 'reject', id: id,
            title: 'ปฏิเสธคำขอ?', message: 'คุณต้องการตีกลับรายการนี้ใช่หรือไม่',
            color: '#ef4444'
        });
    }

    // --- กดยืนยันใน Popup ---
    const handleConfirmAction = () => {
        const { type, id } = modalConfig;
        let url = '';

        if (type === 'approve') url = 'http://localhost:3001/supervisor-approve';
        else if (type === 'confirm_stock') url = 'http://localhost:3001/inventory-confirm';
        else if (type === 'reject') url = 'http://localhost:3001/reject-withdrawal';

        axios.put(url, { id })
            .then(res => {
                if (res.data === "Success") {
                    setModalConfig({ ...modalConfig, show: false });
                    fetchRequests();
                } else if (res.data === "Not Enough Stock") {
                    alert("❌ สต็อกไม่พอ!");
                    setModalConfig({ ...modalConfig, show: false });
                }
            })
            .catch(err => console.log(err));
    }

    const filteredRequests = requests.filter(r => {
        if (!currentUser) return false;
        if (currentUser.role === 'supervisor') return r.status === 'pending';
        else if (currentUser.role === 'inventory') return r.status === 'approved_by_sup';
        else if (currentUser.role === 'admin') return r.status === 'pending' || r.status === 'approved_by_sup';
        return false;
    });

    return (
        <div className="container" style={{marginTop: '20px'}}>
            <h2>
                {currentUser?.role === 'inventory' ? '📦 รายการรอจ่ายวัสดุ (ผ่านการอนุมัติแล้ว)' : '📋 รายการรอตรวจสอบ (Supervisor)'}
            </h2>

            <div className="card" style={{padding: '0', overflow: 'hidden'}}>
                <table className="custom-table">
                    <thead>
                        <tr>
                            <th style={{textAlign: 'center', width: '60px'}}>ลำดับ</th>
                            <th>วันที่ขอ</th>
                            <th>ผู้เบิก</th>
                            <th>ใช้งานกับ</th>
                            <th>วัสดุ</th>
                            <th style={{textAlign: 'center'}}>จำนวน</th>
                            <th style={{textAlign: 'center'}}>สถานะ</th>
                            <th style={{textAlign: 'center'}}>จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRequests.length > 0 ? filteredRequests.map((r, index) => (
                            <tr key={r.id}>
                                <td style={{textAlign: 'center'}}>{index + 1}</td>
                                <td>{new Date(r.date_requested).toLocaleString('th-TH')}</td>
                                <td>{r.first_name} {r.last_name}</td>
                                <td>{r.device_name}</td>
                                <td>{r.material_name}</td>
                                <td style={{textAlign: 'center', fontWeight: 'bold'}}>{r.quantity} {r.unit}</td>
                                <td style={{textAlign: 'center'}}>
                                    {r.status === 'pending' && <span className="status-badge status-pending">รอหัวหน้าอนุมัติ</span>}
                                    {r.status === 'approved_by_sup' && <span className="status-badge" style={{backgroundColor: '#dbeafe', color: '#1e40af'}}>รอคลังจ่ายของ</span>}
                                </td>
                                <td style={{textAlign: 'center'}}>
                                    {(currentUser.role === 'supervisor' || currentUser.role === 'admin') && r.status === 'pending' && (
                                        <>
                                            <button onClick={() => clickApprove(r.id)} style={{marginRight: '5px', backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer'}}>✓</button>
                                            <button onClick={() => clickReject(r.id)} style={{backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer'}}>✕</button>
                                        </>
                                    )}
                                    {(currentUser.role === 'inventory' || currentUser.role === 'admin') && r.status === 'approved_by_sup' && (
                                        <>
                                            <button onClick={() => clickInventoryConfirm(r.id)} style={{marginRight: '5px', backgroundColor: '#10b981', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer'}}>📦 จ่าย</button>
                                            <button onClick={() => clickReject(r.id)} style={{backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer'}}>✕</button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        )) : <tr><td colSpan="8" style={{textAlign: 'center', padding: '20px', color: '#999'}}>ไม่มีรายการที่ต้องดำเนินการ</td></tr>}
                    </tbody>
                </table>
            </div>

            {/* --- Modal Popup (กลางจอ) --- */}
            {modalConfig.show && (
                <div className="modal-overlay" style={modalOverlayStyle}>
                    <div className="modal-box" style={modalBoxStyle}>
                        <div style={{fontSize: '3rem', marginBottom: '10px'}}>
                            {modalConfig.type === 'reject' ? '⚠️' : '✅'}
                        </div>
                        <h3 style={{marginTop: 0, color: '#333'}}>{modalConfig.title}</h3>
                        <p style={{color: '#666', marginBottom: '25px'}}>{modalConfig.message}</p>
                        
                        <div style={{display: 'flex', gap: '10px', justifyContent: 'center'}}>
                            <button onClick={handleConfirmAction} style={{backgroundColor: modalConfig.color, color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', flex: 1}}>
                                ยืนยัน
                            </button>
                            <button onClick={() => setModalConfig({...modalConfig, show: false})} style={{backgroundColor: '#e5e7eb', color: '#374151', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', flex: 1}}>
                                ยกเลิก
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// สไตล์สำหรับ Popup กลางจอ
const modalOverlayStyle = {
    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999,
    display: 'flex', justifyContent: 'center', alignItems: 'center'
};

const modalBoxStyle = {
    backgroundColor: 'white', padding: '30px', borderRadius: '16px',
    width: '90%', maxWidth: '350px', textAlign: 'center',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)', animation: 'fadeIn 0.2s ease-out'
};

export default MaterialApprovals;