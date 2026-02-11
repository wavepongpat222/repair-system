import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './App.css';

function MaterialApprovals() {
    const [requests, setRequests] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();

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

    // --- Action 1: หัวหน้าช่างกดอนุมัติ ---
    const handleSupervisorApprove = (id) => {
        if(!window.confirm("ยืนยันการอนุมัติ? (รายการจะถูกส่งต่อไปยังฝ่ายคลัง)")) return;
        axios.put('http://localhost:3001/supervisor-approve', { id })
            .then(res => {
                if(res.data === "Success") { alert("ส่งต่อให้ฝ่ายคลังแล้ว ✅"); fetchRequests(); }
            });
    }

    // --- Action 2: ฝ่ายคลังกดจ่ายของ (ตัดสต็อก) ---
    const handleInventoryConfirm = (id) => {
        if(!window.confirm("ยืนยันการจ่ายวัสดุ? (ระบบจะตัดสต็อกทันที)")) return;
        axios.put('http://localhost:3001/inventory-confirm', { id })
            .then(res => {
                if(res.data === "Success") { alert("ตัดสต็อกเรียบร้อย ✅"); fetchRequests(); }
                else if(res.data === "Not Enough Stock") alert("❌ สต็อกไม่พอ");
            });
    }

    const handleReject = (id) => {
        if(!window.confirm("ยืนยันการปฏิเสธ?")) return;
        axios.put('http://localhost:3001/reject-withdrawal', { id })
            .then(res => { if(res.data === "Success") { alert("ปฏิเสธแล้ว"); fetchRequests(); } });
    }

    const handleBack = () => {
        if (currentUser?.role === 'inventory') navigate('/inventory-dashboard');
        else navigate('/dashboard');
    }

    // --- Logic การกรองข้อมูลที่จะแสดง ---
    const filteredRequests = requests.filter(r => {
        if (!currentUser) return false;

        if (currentUser.role === 'supervisor') {
            // หัวหน้าช่าง: เห็นเฉพาะรายการที่ 'รอตรวจสอบ' (pending)
            return r.status === 'pending';
        } 
        else if (currentUser.role === 'inventory') {
            // ฝ่ายคลัง: เห็นเฉพาะรายการที่ 'หัวหน้าอนุมัติแล้ว' (approved_by_sup)
            return r.status === 'approved_by_sup';
        }
        else if (currentUser.role === 'admin') {
            // Admin: เห็นหมด (pending และ approved_by_sup) ที่ยังไม่เสร็จสิ้น
            return r.status === 'pending' || r.status === 'approved_by_sup';
        }
        return false;
    });

    return (
        <div className="container">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                <h2>
                    {currentUser?.role === 'inventory' ? '📦 รายการรอจ่ายวัสดุ (ผ่านการอนุมัติแล้ว)' : '📋 รายการรอตรวจสอบ (Supervisor)'}
                </h2>
                
            </div>

            <div className="card" style={{padding: '0', overflow: 'hidden'}}>
                <table className="custom-table">
                    <thead>
                        <tr>
                            <th>วันที่ขอ</th>
                            <th>ผู้ขอเบิก</th>
                            <th>ใช้งานกับ</th>
                            <th>วัสดุ</th>
                            <th style={{textAlign: 'center'}}>จำนวน</th>
                            <th style={{textAlign: 'center'}}>สถานะ</th>
                            <th style={{textAlign: 'center'}}>จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRequests.length > 0 ? filteredRequests.map(r => (
                            <tr key={r.id}>
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
                                    
                                    {/* ปุ่มสำหรับ Supervisor (เห็นเฉพาะตอน pending) */}
                                    {(currentUser.role === 'supervisor' || currentUser.role === 'admin') && r.status === 'pending' && (
                                        <>
                                            <button onClick={() => handleSupervisorApprove(r.id)} style={{marginRight: '5px', backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer'}}>✓ อนุมัติ</button>
                                            <button onClick={() => handleReject(r.id)} style={{backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer'}}>✕ ปฏิเสธ</button>
                                        </>
                                    )}

                                    {/* ปุ่มสำหรับ Inventory (เห็นเฉพาะตอน approved_by_sup) */}
                                    {(currentUser.role === 'inventory' || currentUser.role === 'admin') && r.status === 'approved_by_sup' && (
                                        <>
                                            <button onClick={() => handleInventoryConfirm(r.id)} style={{marginRight: '5px', backgroundColor: '#10b981', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer'}}>📦 จ่ายของ/ตัดสต็อก</button>
                                            <button onClick={() => handleReject(r.id)} style={{backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer'}}>✕ ยกเลิก</button>
                                        </>
                                    )}

                                </td>
                            </tr>
                        )) : <tr><td colSpan="7" style={{textAlign: 'center', padding: '20px', color: '#999'}}>ไม่มีรายการที่ต้องดำเนินการ</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default MaterialApprovals;