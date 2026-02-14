import { useEffect, useState } from 'react';
import api from './api'; 
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './App.css';

function MaterialApprovals() {
    const [requests, setRequests] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [activeTab, setActiveTab] = useState('pending'); 
    const navigate = useNavigate();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !['supervisor', 'admin', 'inventory'].includes(user.role)) { 
            navigate('/'); 
            return; 
        }
        setCurrentUser(user);
        fetchRequests();
    }, [navigate]);

    const fetchRequests = () => {
        api.get('/all-withdrawal-requests')
        .then(res => setRequests(res.data))
        .catch(err => console.log(err));
    }

    // --- Action สำหรับ Supervisor ---
    const clickApprove = (id) => {
        Swal.fire({
            title: 'ยืนยันการอนุมัติ?',
            text: "รายการนี้จะถูกส่งต่อไปยังฝ่ายคลัง",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3b82f6',
            confirmButtonText: 'อนุมัติ',
            cancelButtonText: 'ยกเลิก'
        }).then((result) => {
            if (result.isConfirmed) {
                api.put('/supervisor-approve', { id }).then(res => {
                    if (res.data === "Success") {
                        Swal.fire('สำเร็จ', 'อนุมัติเรียบร้อย', 'success');
                        fetchRequests();
                    }
                });
            }
        });
    }

    // --- Action สำหรับ Inventory ---
    const clickInventoryConfirm = (id) => {
        Swal.fire({
            title: 'ยืนยันการจ่ายวัสดุ?',
            text: "ระบบจะทำการตัดสต็อกทันที",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            confirmButtonText: 'ยืนยันการจ่าย',
            cancelButtonText: 'ยกเลิก'
        }).then((result) => {
            if (result.isConfirmed) {
                api.put('/inventory-confirm', { id }).then(res => {
                    if (res.data === "Success") {
                        Swal.fire('สำเร็จ', 'ตัดสต็อกและบันทึกสถานะเรียบร้อย', 'success');
                        fetchRequests();
                    } else if (res.data === "Not Enough Stock") {
                        Swal.fire('แจ้งเตือน', 'จำนวนคงเหลือในคลังไม่พอ!', 'error');
                    } else {
                        Swal.fire('Error', 'เกิดข้อผิดพลาด', 'error');
                    }
                });
            }
        });
    }

    const clickReject = (id) => {
        Swal.fire({
            title: 'ปฏิเสธคำขอ?',
            text: "ต้องการตีกลับรายการนี้ใช่หรือไม่",
            icon: 'warning',
            input: 'text',
            inputPlaceholder: 'ระบุเหตุผล (ถ้ามี)...',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'ปฏิเสธ',
            cancelButtonText: 'ยกเลิก'
        }).then((result) => {
            if (result.isConfirmed) {
                api.put('/reject-withdrawal', { id }).then(res => {
                    if (res.data === "Success") {
                        Swal.fire('เรียบร้อย', 'ปฏิเสธคำขอแล้ว', 'success');
                        fetchRequests();
                    }
                });
            }
        });
    }

    const filteredRequests = requests.filter(r => {
        if (!currentUser) return false;
        if (activeTab === 'pending') {
            if (currentUser.role === 'supervisor') return r.status === 'pending';
            if (currentUser.role === 'inventory') return r.status === 'approved_by_sup';
            if (currentUser.role === 'admin') return r.status === 'pending' || r.status === 'approved_by_sup';
            return false;
        } else {
            if (currentUser.role === 'supervisor') return r.status !== 'pending';
            if (currentUser.role === 'inventory') return r.status !== 'approved_by_sup' && r.status !== 'pending';
            return true;
        }
    });

    return (
        <div className="container" style={{marginTop: '20px'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                <h2 style={{margin:0}}>
                    {currentUser?.role === 'inventory' ? '📦 รายการรอจ่ายวัสดุ' : '📋 ตรวจสอบการเบิกวัสดุ'}
                </h2>
                <div style={{display:'flex', gap:'10px'}}>
                    <button className={`btn ${activeTab === 'pending' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('pending')}>
                        {currentUser?.role === 'inventory' ? 'รอจ่ายของ' : 'รายการรออนุมัติ'}
                    </button>
                    <button className={`btn ${activeTab === 'history' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('history')}>
                        ประวัติการดำเนินการ
                    </button>
                </div>
            </div>

            <div className="card" style={{padding: '0', overflow: 'hidden', border: '1px solid #e5e7eb'}}>
                <table className="custom-table">
                    <thead>
                        <tr style={{backgroundColor: '#f9fafb'}}>
                            <th style={{textAlign:'center', width:'60px'}}>#</th>
                            <th>วันที่</th>
                            <th>ผู้เบิก</th>
                            <th>งานซ่อม (อุปกรณ์)</th>
                            <th>รายการวัสดุ</th>
                            <th style={{textAlign:'center'}}>จำนวน</th>
                            <th style={{textAlign:'center'}}>สถานะ</th>
                            {/* ❌ เอาหัวข้อคอลัมน์ "จัดการ" ออกถาวร */}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRequests.length > 0 ? filteredRequests.map((r, index) => (
                            <tr key={r.id}>
                                <td style={{textAlign: 'center'}}>{index + 1}</td>
                                <td>{new Date(r.date_requested).toLocaleString('th-TH')}</td>
                                <td>{r.first_name} {r.last_name}</td>
                                <td>{r.device_name}</td>
                                <td style={{fontWeight:'500'}}>{r.material_name}</td>
                                <td style={{textAlign:'center', fontWeight:'bold'}}>{r.quantity} {r.unit}</td>
                                <td style={{textAlign:'center'}}>
                                    {r.status === 'pending' && <span className="status-badge status-pending">รอหัวหน้าอนุมัติ</span>}
                                    {r.status === 'approved_by_sup' && <span className="status-badge" style={{backgroundColor: '#dbeafe', color: '#1e40af'}}>รอคลังจ่ายของ</span>}
                                    {(r.status === 'approved' || r.status === 'completed') && <span className="status-badge status-done">✅ จ่ายแล้ว</span>}
                                    {r.status === 'rejected' && <span className="status-badge" style={{backgroundColor: '#fee2e2', color: '#b91c1c'}}>❌ ไม่อนุมัติ</span>}
                                </td>
                                {/* ❌ เอาช่องใส่ปุ่มจัดการออกถาวร */}
                            </tr>
                        )) : (
                            <tr><td colSpan="7" style={{textAlign: 'center', padding: '30px', color: '#999'}}>ไม่มีรายการ</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default MaterialApprovals;