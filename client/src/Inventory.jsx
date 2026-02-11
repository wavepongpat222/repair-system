import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './App.css';

function Inventory() {
    const [materials, setMaterials] = useState([]);
    const [myJobs, setMyJobs] = useState([]); // งานที่ช่างคนนี้กำลังทำอยู่
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [withdrawQty, setWithdrawQty] = useState(1);
    const [selectedJobId, setSelectedJobId] = useState('');

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) { navigate('/'); return; }
        setCurrentUser(user);

        fetchMaterials();
        
        // ถ้าเป็นช่าง ให้ดึงงานที่ตัวเองกำลังทำอยู่มาด้วย (เพื่อเอามาใส่ใน Dropdown เลือกงาน)
        if (user.role === 'technician') {
            fetchMyActiveJobs(user.user_id);
        }
    }, []);

    const fetchMaterials = () => {
        axios.get('http://localhost:3001/materials')
            .then(res => setMaterials(res.data))
            .catch(err => console.log(err));
    }

    const fetchMyActiveJobs = (userId) => {
        axios.get('http://localhost:3001/my-repairs/' + userId) // เช็ค API นี้ว่าดึงงานของช่างได้ไหม หรือต้องสร้างใหม่
            .then(res => {
                // กรองเอาเฉพาะงานที่สถานะ "กำลังซ่อม" (doing)
                // หมายเหตุ: ถ้า API /my-repairs ดึงตาม reporter_id (คนแจ้ง) อาจจะไม่ตรงกับ technician_id
                // แต่เบื้องต้นใช้รายชื่อทั้งหมดมาเลือกก่อน หรือต้องแก้ API ให้ดึงงานตาม Technician
                // เพื่อความชัวร์ ผมจะดึงงานทั้งหมดแล้วกรองเฉพาะที่ technician_id ตรงกับเรา
                axios.get('http://localhost:3001/repairs').then(allJobs => {
                    const active = allJobs.data.filter(job => 
                        job.technician_id === userId && job.status === 'doing'
                    );
                    setMyJobs(active);
                });
            })
            .catch(err => console.log(err));
    }

    const handleOpenWithdraw = (material) => {
        setSelectedMaterial(material);
        setWithdrawQty(1);
        setSelectedJobId('');
        setIsModalOpen(true);
    }

    const handleSubmitWithdraw = (e) => {
        e.preventDefault();
        if (!selectedJobId) { alert("กรุณาเลือกงานที่จะนำของไปใช้"); return; }
        if (withdrawQty <= 0) { alert("จำนวนต้องมากกว่า 0"); return; }
        if (withdrawQty > selectedMaterial.quantity) { alert("ของในคลังมีไม่พอ"); return; }

        axios.post('http://localhost:3001/request-material', {
            repair_id: selectedJobId,
            material_id: selectedMaterial.id,
            quantity: withdrawQty,
            technician_id: currentUser.user_id
        }).then(res => {
            if (res.data === "Success") {
                alert("ส่งคำขอเบิกเรียบร้อย ✅ รอหัวหน้าอนุมัติ");
                setIsModalOpen(false);
                fetchMaterials(); // รีเฟรชหน้าจอ
            } else {
                alert("เกิดข้อผิดพลาด");
            }
        });
    }

    return (
        <div className="container" style={{marginTop: '20px'}}>
            <h2 style={{textAlign: 'left', marginBottom: '20px'}}>📦 คลังวัสดุอุปกรณ์</h2>

            <div className="card" style={{ padding: '0', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                <table className="custom-table">
                    <thead>
                        <tr style={{backgroundColor: '#f9fafb'}}>
                            <th>รหัส</th>
                            <th>ชื่อวัสดุ</th>
                            <th style={{textAlign: 'center'}}>คงเหลือ</th>
                            <th style={{textAlign: 'center'}}>หน่วย</th>
                            <th style={{textAlign: 'center'}}>ดำเนินการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {materials.map((m) => (
                            <tr key={m.id}>
                                <td>{m.id}</td>
                                <td>{m.material_name}</td>
                                <td style={{textAlign: 'center', fontWeight: 'bold', color: m.quantity === 0 ? 'red' : 'green'}}>
                                    {m.quantity}
                                </td>
                                <td style={{textAlign: 'center'}}>{m.unit}</td>
                                <td style={{textAlign: 'center'}}>
                                    {currentUser?.role === 'technician' && (
                                        <button 
                                            className="btn-sm btn-primary"
                                            onClick={() => handleOpenWithdraw(m)}
                                            disabled={m.quantity === 0}
                                            style={{
                                                opacity: m.quantity === 0 ? 0.5 : 1, 
                                                cursor: m.quantity === 0 ? 'not-allowed' : 'pointer'
                                            }}
                                        >
                                            {m.quantity === 0 ? 'หมด' : 'เบิกของ'}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* --- MODAL (หน้าต่างป๊อปอัพสำหรับเบิกของ) --- */}
            {isModalOpen && selectedMaterial && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '400px', maxWidth:'90%' }}>
                        <h3 style={{marginTop: 0, borderBottom:'1px solid #eee', paddingBottom:'10px'}}>
                            🛠️ เบิก: {selectedMaterial.material_name}
                        </h3>
                        
                        <form onSubmit={handleSubmitWithdraw}>
                            {/* 1. เลือกงานซ่อม */}
                            <div className="form-group">
                                <label>ใช้สำหรับงานซ่อม (Job ID)</label>
                                <select 
                                    className="input-modern" 
                                    value={selectedJobId} 
                                    onChange={e => setSelectedJobId(e.target.value)}
                                    required
                                >
                                    <option value="">-- เลือกงานที่กำลังทำ --</option>
                                    {myJobs.length > 0 ? (
                                        myJobs.map(job => (
                                            <option key={job.id} value={job.id}>
                                                งาน #{job.id} : {job.device_name}
                                            </option>
                                        ))
                                    ) : (
                                        <option value="" disabled>ไม่มีงานที่กำลังซ่อมอยู่</option>
                                    )}
                                </select>
                                {myJobs.length === 0 && <small style={{color:'red'}}>* ต้องมีงานสถานะ "กำลังซ่อม" ถึงจะเบิกได้</small>}
                            </div>

                            {/* 2. ระบุจำนวน */}
                            <div className="form-group">
                                <label>จำนวนที่จะเบิก ({selectedMaterial.unit})</label>
                                <input 
                                    type="number" 
                                    className="input-modern"
                                    min="1" 
                                    max={selectedMaterial.quantity} 
                                    value={withdrawQty} 
                                    onChange={e => setWithdrawQty(e.target.value)} 
                                    required 
                                />
                                <small style={{color:'#666'}}>คงเหลือในคลัง: {selectedMaterial.quantity}</small>
                            </div>

                            <div style={{display: 'flex', gap: '10px', marginTop:'20px'}}>
                                <button type="submit" className="btn btn-primary" style={{flex: 1}}>ยืนยันเบิก</button>
                                <button type="button" className="btn btn-secondary" style={{flex: 1}} onClick={() => setIsModalOpen(false)}>ยกเลิก</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Inventory;