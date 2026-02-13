import { useEffect, useState } from 'react';
import api from './api'; // ✅ เปลี่ยนจาก axios เป็น api
import { useNavigate } from 'react-router-dom';
import './App.css';

function Inventory() {
    const [materials, setMaterials] = useState([]);
    const [history, setHistory] = useState([]);
    const [myJobs, setMyJobs] = useState([]); 
    const [currentUser, setCurrentUser] = useState(null);
    const [activeTab, setActiveTab] = useState('stock'); 
    const navigate = useNavigate();

    // Modal Add/Edit Material
    const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState(null);
    const [matFormData, setMatFormData] = useState({ name: '', quantity: 0, unit: '' });

    // Modal Withdraw
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [withdrawQty, setWithdrawQty] = useState(1);
    const [selectedJobId, setSelectedJobId] = useState('');
    
    // Alert Modal
    const [alertModal, setAlertModal] = useState({ show: false, type: '', title: '', message: '' });

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) { navigate('/'); return; }
        
        setCurrentUser(user);
        fetchMaterials();

        if (user.role === 'technician') {
            fetchMyActiveJobs(user.user_id);
            fetchHistory(user.user_id);
        }
    }, []);

    // ✅ เปลี่ยนจาก axios เป็น api และตัด URL ส่วนเกินออก
    const fetchMaterials = () => { api.get('/materials').then(res => setMaterials(res.data)); }
    const fetchHistory = (userId) => { api.get('/my-withdrawals/' + userId).then(res => setHistory(res.data)); }
    const fetchMyActiveJobs = (userId) => {
        api.get('/repairs').then(allJobs => {
            const active = allJobs.data.filter(job => job.technician_id === userId && job.status === 'doing');
            setMyJobs(active);
        });
    }

    const isNumeric = (str) => { return /^\d+$/.test(str); } 
    
    const openAddMaterial = () => {
        setEditingMaterial(null);
        setMatFormData({ name: '', quantity: 0, unit: '' });
        setIsMaterialModalOpen(true);
    }

    const openEditMaterial = (m) => {
        setEditingMaterial(m);
        setMatFormData({ name: m.material_name, quantity: m.quantity, unit: m.unit });
        setIsMaterialModalOpen(true);
    }

    const handleMaterialSubmit = async (e) => {
        e.preventDefault();
        if (matFormData.quantity <= 0) { alert('❌ จำนวนห้ามเป็น 0 หรือติดลบ'); return; }
        if (isNumeric(matFormData.unit)) { alert('❌ หน่วยนับห้ามเป็นตัวเลข'); return; }

        const payload = editingMaterial ? { ...matFormData, id: editingMaterial.id } : matFormData;
        
        try {
            // ✅ ใช้ api.put หรือ api.post
            const res = editingMaterial 
                ? await api.put('/update-material', payload) 
                : await api.post('/add-material', payload);

            if (res.data === "Duplicate Name" || (res.data && res.data.message === "Duplicate Name") || (res.data && res.data.code === 'ER_DUP_ENTRY')) {
                window.alert(`❌ ชื่อซ้ำกัน!\nชื่อ "${matFormData.name}" มีอยู่ในระบบแล้ว`);
                return;
            }

            if (res.data === "Success") {
                window.alert('✅ บันทึกข้อมูลเรียบร้อย');
                setIsMaterialModalOpen(false);
                fetchMaterials();
            } else {
                window.alert('❌ เกิดข้อผิดพลาด');
            }
        } catch (err) {
            console.error("API Error:", err);
            window.alert('❌ เชื่อมต่อ Server ไม่ได้');
        }
    }

    const handleOpenWithdraw = (material) => { setSelectedMaterial(material); setWithdrawQty(1); setSelectedJobId(''); setIsWithdrawModalOpen(true); }
    
    const handleSubmitWithdraw = (e) => {
        e.preventDefault();
        if (parseInt(withdrawQty) > selectedMaterial.quantity) {
            setIsWithdrawModalOpen(false);
            setAlertModal({ show: true, type: 'error', title: '❌ เบิกเกินจำนวน!', message: `ในคลังมีแค่ ${selectedMaterial.quantity} ${selectedMaterial.unit}` });
            return;
        }
        if (parseInt(withdrawQty) <= 0) { 
            setAlertModal({ show: true, type: 'error', title: '❌ ข้อมูลผิดพลาด', message: 'จำนวนต้องมากกว่า 0' });
            return; 
        }

        // ✅ เปลี่ยนเป็น api.post
        api.post('/request-material', { 
            repair_id: selectedJobId, material_id: selectedMaterial.id, quantity: withdrawQty, technician_id: currentUser.user_id 
        }).then(res => { 
            if (res.data === "Success") { 
                setIsWithdrawModalOpen(false);
                setAlertModal({ show: true, type: 'success', title: '✅ ส่งคำขอเรียบร้อย', message: 'กรุณารอหัวหน้าอนุมัติ' });
                fetchHistory(currentUser.user_id); 
            } 
        });
    }

    const handleDeleteWithdrawal = (id) => {
        if(confirm("ต้องการยกเลิกคำขอนี้ใช่หรือไม่?")) {
            // ✅ เปลี่ยนเป็น api.delete
            api.delete('/delete-withdrawal/' + id).then(res => { if(res.data === "Success") { fetchHistory(currentUser.user_id); } });
        }
    }

    const handlePrint = () => { window.print(); }

    if (!currentUser) return <div style={{marginTop:'50px', textAlign:'center'}}>⏳ กำลังโหลดข้อมูล...</div>;

    return (
        <div className="container" style={{marginTop: '20px'}}>
            <div className="no-print" style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                <h2 style={{margin:0}}>📦 ระบบคลังวัสดุ</h2>
                <div style={{display:'flex', gap:'10px'}}>
                    <button className={`btn ${activeTab === 'stock' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('stock')}>รายการวัสดุ</button>
                    {currentUser.role === 'technician' && (
                        <button className={`btn ${activeTab === 'history' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('history')}>ประวัติการเบิก</button>
                    )}
                </div>
            </div>

            <div className="only-print" style={{display:'none', textAlign:'center', marginBottom:'20px'}}>
                <h1>{activeTab === 'stock' ? 'รายงานสรุปสต็อกวัสดุ' : 'รายงานประวัติการเบิกวัสดุ'}</h1>
                <p>พิมพ์วันที่: {new Date().toLocaleDateString('th-TH')}</p>
                <hr/>
            </div>

            {activeTab === 'stock' && (
                <div>
                    {currentUser.role === 'inventory' && (
                        <div className="no-print" style={{marginBottom:'10px', textAlign:'right'}}>
                            <button onClick={openAddMaterial} className="btn btn-primary" style={{marginRight:'10px'}}>+ เพิ่มวัสดุ</button>
                            <button onClick={handlePrint} className="btn btn-secondary">🖨️ พิมพ์รายงาน</button>
                        </div>
                    )}
                    
                    <div className="card" style={{ padding: '0', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                        <table className="custom-table" style={{width:'100%'}}>
                            <thead>
                                <tr style={{backgroundColor: '#f9fafb'}}>
                                    <th style={{textAlign: 'center', width: '50px'}}>#</th>
                                    <th>ชื่อวัสดุ</th>
                                    <th style={{textAlign: 'center'}}>คงเหลือ</th>
                                    <th style={{textAlign: 'center'}}>หน่วย</th>
                                    <th style={{textAlign: 'center'}} className="no-print">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {materials.map((m, index) => (
                                    <tr key={m.id}>
                                        <td style={{textAlign: 'center'}}>{index + 1}</td>
                                        <td>{m.material_name}</td>
                                        <td style={{textAlign: 'center', fontWeight: 'bold', color: m.quantity === 0 ? 'red' : 'green'}}>{m.quantity}</td>
                                        <td style={{textAlign: 'center'}}>{m.unit}</td>
                                        <td style={{textAlign: 'center'}} className="no-print">
                                            {currentUser.role === 'technician' && (
                                                <button className="btn-sm btn-primary" onClick={() => handleOpenWithdraw(m)} disabled={m.quantity === 0} style={{opacity: m.quantity === 0 ? 0.5 : 1}}>เบิก</button>
                                            )}
                                            {currentUser.role === 'inventory' && (
                                                <button className="btn-sm" onClick={() => openEditMaterial(m)} style={{backgroundColor:'#f59e0b', color:'white', border:'none'}}>แก้ไข</button>
                                            )}
                                            {!['technician', 'inventory'].includes(currentUser.role) && (
                                                <span style={{color:'#999', fontSize:'0.8rem'}}>-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {materials.length === 0 && (
                                    <tr><td colSpan="5" style={{textAlign:'center', padding:'20px', color:'#888'}}>ไม่พบรายการวัสดุในคลัง</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'history' && currentUser.role === 'technician' && (
                <div>
                     <div className="no-print" style={{textAlign:'right', marginBottom:'10px'}}>
                         <button onClick={handlePrint} className="btn btn-secondary">🖨️ พิมพ์ประวัติ</button>
                    </div>

                    <div className="card" style={{ padding: '0', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                        <table className="custom-table" style={{width:'100%'}}>
                            <thead>
                                <tr style={{backgroundColor: '#f9fafb'}}>
                                    <th>วันที่</th>
                                    <th>รายการ</th>
                                    <th style={{textAlign:'center'}}>จำนวน</th>
                                    <th style={{textAlign:'center'}}>สถานะ</th>
                                    <th className="no-print" style={{textAlign:'center'}}>จัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((h, index) => (
                                    <tr key={h.id}>
                                        <td>{new Date(h.date_requested).toLocaleDateString('th-TH')}</td>
                                        <td>{h.material_name}</td>
                                        <td style={{textAlign:'center'}}>{h.quantity} {h.unit}</td>
                                        
                                        <td style={{textAlign:'center'}}>
                                            <span className="only-print">
                                                {h.status === 'pending' ? 'รออนุมัติ' : 
                                                 h.status === 'approved_by_sup' ? 'รอรับของ' : 
                                                 h.status === 'completed' ? 'ได้รับแล้ว' : 
                                                 h.status === 'rejected' ? 'ไม่อนุมัติ' : h.status}
                                            </span>
                                            <span className="no-print">
                                                {h.status === 'pending' && <span className="status-badge status-pending">รอหัวหน้า</span>}
                                                {h.status === 'approved_by_sup' && <span className="status-badge" style={{backgroundColor:'#dbeafe', color:'#1e40af'}}>รอคลังจ่าย</span>}
                                                {(h.status === 'approved' || h.status === 'completed') && <span className="status-badge status-done">✅ ได้รับของแล้ว</span>}
                                                {h.status === 'rejected' && <span className="status-badge" style={{backgroundColor:'#fee2e2', color:'#b91c1c'}}>❌ ไม่อนุมัติ</span>}
                                            </span>
                                        </td>
                                        <td className="no-print" style={{textAlign:'center'}}>
                                            {h.status === 'pending' && (
                                                <button onClick={() => handleDeleteWithdrawal(h.id)} style={{backgroundColor:'#fee2e2', color:'red', border:'1px solid #fca5a5', padding:'4px 8px', borderRadius:'4px', cursor:'pointer', fontSize:'0.8rem'}}>
                                                    ยกเลิก
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {history.length === 0 && (
                                    <tr><td colSpan="5" style={{textAlign:'center', padding:'20px', color:'#888'}}>ไม่พบประวัติการเบิก</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {isMaterialModalOpen && (
                <div className="modal-overlay" style={modalOverlayStyle}>
                    <div className="modal-box" style={{...modalBoxStyle, width: '350px'}}>
                        <h3>{editingMaterial ? '✏️ แก้ไขวัสดุ' : '➕ เพิ่มวัสดุใหม่'}</h3>
                        <form onSubmit={handleMaterialSubmit}>
                            <div className="form-group"><label>ชื่อวัสดุ</label><input type="text" className="input-modern" required value={matFormData.name} onChange={e => setMatFormData({...matFormData, name: e.target.value})} /></div>
                            <div className="form-group"><label>จำนวนคงเหลือ</label><input type="number" className="input-modern" required value={matFormData.quantity} onChange={e => setMatFormData({...matFormData, quantity: e.target.value})} /></div>
                            <div className="form-group"><label>หน่วยนับ</label><input type="text" className="input-modern" required value={matFormData.unit} onChange={e => setMatFormData({...matFormData, unit: e.target.value})} placeholder="เช่น อัน, กล่อง, เมตร" /></div>
                            <div style={{display: 'flex', gap: '10px', marginTop:'20px'}}>
                                <button type="submit" className="btn btn-primary" style={{flex: 1}}>บันทึก</button>
                                <button type="button" className="btn btn-secondary" style={{flex: 1}} onClick={() => setIsMaterialModalOpen(false)}>ยกเลิก</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isWithdrawModalOpen && selectedMaterial && (
                <div className="modal-overlay" style={modalOverlayStyle}>
                    <div className="modal-box" style={{...modalBoxStyle, width: '400px'}}>
                        <h3 style={{marginTop: 0}}>🛠️ เบิก: {selectedMaterial.material_name}</h3>
                        <p style={{color:'#666', fontSize:'0.9rem'}}>คงเหลือ: {selectedMaterial.quantity} {selectedMaterial.unit}</p>
                        <form onSubmit={handleSubmitWithdraw}>
                            <div className="form-group"><label>ใช้สำหรับงานซ่อม</label><select className="input-modern" value={selectedJobId} onChange={e => setSelectedJobId(e.target.value)} required><option value="">-- เลือกงาน --</option>{myJobs.map(job => <option key={job.id} value={job.id}>งาน #{job.id} : {job.device_name}</option>)}</select></div>
                            <div className="form-group"><label>จำนวนที่เบิก</label><input type="number" className="input-modern" min="1" max={selectedMaterial.quantity} value={withdrawQty} onChange={e => setWithdrawQty(e.target.value)} required /></div>
                            <div style={{display: 'flex', gap: '10px', marginTop:'20px'}}><button type="submit" className="btn btn-primary" style={{flex: 1}}>ยืนยัน</button><button type="button" className="btn btn-secondary" style={{flex: 1}} onClick={() => setIsWithdrawModalOpen(false)}>ยกเลิก</button></div>
                        </form>
                    </div>
                </div>
            )}

            {alertModal.show && (
                <div className="modal-overlay" style={modalOverlayStyle}>
                    <div className="modal-box" style={modalBoxStyle}>
                        <div style={{fontSize: '3rem', marginBottom: '10px'}}>{alertModal.type === 'error' ? '❌' : '✅'}</div>
                        <h3 style={{marginTop: 0}}>{alertModal.title}</h3>
                        <p style={{color: '#666', marginBottom: '25px'}}>{alertModal.message}</p>
                        <button onClick={() => setAlertModal({...alertModal, show: false})} className="btn btn-primary" style={{width: '100%'}}>ตกลง</button>
                    </div>
                </div>
            )}

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    .only-print { display: block !important; }
                    .card { border: none !important; box-shadow: none !important; padding: 0 !important; }
                    .container { margin: 0 !important; max-width: 100% !important; }
                    table { width: 100% !important; border-collapse: collapse; }
                    th, td { border: 1px solid #000 !important; padding: 8px !important; color: black !important; font-size: 14px; }
                    td button { display: none !important; }
                }
            `}</style>
        </div>
    );
}

const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' };
const modalBoxStyle = { backgroundColor: 'white', padding: '30px', borderRadius: '16px', width: '90%', maxWidth: '350px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' };

export default Inventory;