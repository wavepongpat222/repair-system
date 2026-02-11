import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './App.css';

function Inventory() {
    const [materials, setMaterials] = useState([]);
    const [myJobs, setMyJobs] = useState([]); 
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [withdrawQty, setWithdrawQty] = useState(1);
    const [selectedJobId, setSelectedJobId] = useState('');

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) { navigate('/'); return; }
        setCurrentUser(user);
        fetchMaterials();
        if (user.role === 'technician') fetchMyActiveJobs(user.user_id);
    }, []);

    const fetchMaterials = () => { axios.get('http://localhost:3001/materials').then(res => setMaterials(res.data)); }
    const fetchMyActiveJobs = (userId) => {
        axios.get('http://localhost:3001/repairs').then(allJobs => {
            const active = allJobs.data.filter(job => job.technician_id === userId && job.status === 'doing');
            setMyJobs(active);
        });
    }

    const handleOpenWithdraw = (material) => { setSelectedMaterial(material); setWithdrawQty(1); setSelectedJobId(''); setIsModalOpen(true); }
    const handleSubmitWithdraw = (e) => {
        e.preventDefault();
        if (!selectedJobId) { alert("กรุณาเลือกงานที่จะนำของไปใช้"); return; }
        if (withdrawQty > selectedMaterial.quantity) { alert("ของในคลังมีไม่พอ"); return; }
        axios.post('http://localhost:3001/request-material', { repair_id: selectedJobId, material_id: selectedMaterial.id, quantity: withdrawQty, technician_id: currentUser.user_id })
            .then(res => { if (res.data === "Success") { alert("ส่งคำขอเบิกเรียบร้อย ✅"); setIsModalOpen(false); fetchMaterials(); } });
    }

    return (
        <div className="container" style={{marginTop: '20px'}}>
            <h2 style={{textAlign: 'left', marginBottom: '20px'}}>📦 คลังวัสดุอุปกรณ์</h2>
            <div className="card" style={{ padding: '0', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                <table className="custom-table">
                    <thead>
                        <tr style={{backgroundColor: '#f9fafb'}}>
                            {/* ✅ เปลี่ยนเป็น ลำดับ */}
                            <th style={{textAlign: 'center', width: '60px'}}>ลำดับ</th>
                            <th>ชื่อวัสดุ</th>
                            <th style={{textAlign: 'center'}}>คงเหลือ</th>
                            <th style={{textAlign: 'center'}}>หน่วย</th>
                            <th style={{textAlign: 'center'}}>ดำเนินการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {materials.map((m, index) => ( // ✅ รับ index
                            <tr key={m.id}>
                                {/* ✅ แสดงลำดับ */}
                                <td style={{textAlign: 'center'}}>{index + 1}</td>
                                <td>{m.material_name}</td>
                                <td style={{textAlign: 'center', fontWeight: 'bold', color: m.quantity === 0 ? 'red' : 'green'}}>{m.quantity}</td>
                                <td style={{textAlign: 'center'}}>{m.unit}</td>
                                <td style={{textAlign: 'center'}}>
                                    {currentUser?.role === 'technician' && (
                                        <button className="btn-sm btn-primary" onClick={() => handleOpenWithdraw(m)} disabled={m.quantity === 0} style={{opacity: m.quantity === 0 ? 0.5 : 1, cursor: m.quantity === 0 ? 'not-allowed' : 'pointer'}}>
                                            {m.quantity === 0 ? 'หมด' : 'เบิกของ'}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* Modal เหมือนเดิม */}
            {isModalOpen && selectedMaterial && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '400px', maxWidth:'90%' }}>
                        <h3 style={{marginTop: 0}}>🛠️ เบิก: {selectedMaterial.material_name}</h3>
                        <form onSubmit={handleSubmitWithdraw}>
                            <div className="form-group"><label>ใช้สำหรับงานซ่อม</label><select className="input-modern" value={selectedJobId} onChange={e => setSelectedJobId(e.target.value)} required><option value="">-- เลือกงาน --</option>{myJobs.map(job => <option key={job.id} value={job.id}>งาน #{job.id} : {job.device_name}</option>)}</select></div>
                            <div className="form-group"><label>จำนวน</label><input type="number" className="input-modern" min="1" max={selectedMaterial.quantity} value={withdrawQty} onChange={e => setWithdrawQty(e.target.value)} required /></div>
                            <div style={{display: 'flex', gap: '10px', marginTop:'20px'}}><button type="submit" className="btn btn-primary" style={{flex: 1}}>ยืนยัน</button><button type="button" className="btn btn-secondary" style={{flex: 1}} onClick={() => setIsModalOpen(false)}>ยกเลิก</button></div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
export default Inventory;