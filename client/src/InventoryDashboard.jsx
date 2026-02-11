import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './App.css';

function InventoryDashboard() {
    const [materials, setMaterials] = useState([]);
    const [newMaterial, setNewMaterial] = useState({ name: '', qty: '', unit: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    // Modal State สำหรับแก้ไข
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState({ id: '', name: '', qty: '', unit: '' });
    
    // Modal State สำหรับยืนยันการลบ
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || user.role !== 'inventory') { navigate('/'); return; }
        fetchMaterials();
    }, []);

    const fetchMaterials = () => {
        axios.get('http://localhost:3001/materials')
            .then(res => setMaterials(res.data))
            .catch(err => console.log(err));
    }

    const handleAdd = (e) => {
        e.preventDefault();
        axios.post('http://localhost:3001/add-material', newMaterial)
            .then(res => {
                if(res.data === "Success") {
                    alert("เพิ่มวัสดุเรียบร้อย");
                    setNewMaterial({ name: '', qty: '', unit: '' });
                    fetchMaterials();
                }
            });
    }

    // 1. กดปุ่มลบ (เปิด Popup)
    const handleClickDelete = (id) => {
        setDeleteId(id);
        setShowDeleteModal(true);
    }

    // 2. ยืนยันลบ (ยิง API)
    const confirmDelete = () => {
        axios.delete('http://localhost:3001/delete-material/' + deleteId)
            .then(res => { 
                if(res.data === "Success") {
                    fetchMaterials(); 
                    setShowDeleteModal(false);
                }
            });
    }

    const handleEditClick = (material) => {
        setEditingMaterial({
            id: material.id,
            name: material.material_name,
            qty: material.quantity,
            unit: material.unit
        });
        setIsEditModalOpen(true);
    }

    const handleUpdateMaterial = (e) => {
        e.preventDefault();
        axios.put('http://localhost:3001/update-material', {
            id: editingMaterial.id,
            name: editingMaterial.name,
            quantity: editingMaterial.qty,
            unit: editingMaterial.unit
        }).then(res => {
            if(res.data === "Success") {
                alert("แก้ไขข้อมูลเรียบร้อย ✅");
                setIsEditModalOpen(false);
                fetchMaterials();
            } else {
                alert("เกิดข้อผิดพลาดในการแก้ไข");
            }
        });
    }

    const filteredMaterials = materials.filter(m => 
        m.material_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container" style={{marginTop: '20px'}}>
            
            <h2 style={{textAlign: 'left', marginBottom: '20px'}}>📦 จัดการคลังวัสดุอุปกรณ์</h2>

            {/* ช่องค้นหา */}
            <div className="card no-print" style={{padding:'15px', marginBottom:'20px'}}>
                <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                    <span style={{fontSize:'1.2rem'}}>🔍</span>
                    <input 
                        type="text" 
                        placeholder="ค้นหาชื่อวัสดุ..." 
                        className="input-modern"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{maxWidth:'400px'}}
                    />
                </div>
            </div>

            <div style={{display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap:'wrap'}}>
                
                {/* ตารางรายการวัสดุ */}
                <div className="card" style={{flex: 2, padding: '0', overflow: 'hidden', minWidth:'300px'}}>
                    <table className="custom-table">
                        <thead>
                            <tr style={{backgroundColor: '#f9fafb'}}>
                                <th style={{textAlign: 'center', width: '60px'}}>ลำดับ</th>
                                <th>ชื่อวัสดุ</th>
                                <th style={{textAlign: 'center'}}>คงเหลือ</th>
                                <th style={{textAlign: 'center'}}>หน่วย</th>
                                <th style={{textAlign: 'center'}} className="no-print">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMaterials.map((m, index) => (
                                <tr key={m.id}>
                                    <td style={{textAlign: 'center'}}>{index + 1}</td>
                                    <td>{m.material_name}</td>
                                    <td style={{textAlign: 'center', fontWeight: 'bold', color: m.quantity < 5 ? 'red' : 'black'}}>
                                        {m.quantity}
                                    </td>
                                    <td style={{textAlign: 'center'}}>{m.unit}</td>
                                    <td style={{textAlign: 'center'}} className="no-print">
                                        <button 
                                            onClick={() => handleEditClick(m)} 
                                            style={{border:'none', background:'none', cursor:'pointer', fontSize:'1.1rem', marginRight:'10px'}} 
                                            title="แก้ไข"
                                        >
                                            ✏️
                                        </button>
                                        <button 
                                            onClick={() => handleClickDelete(m.id)} 
                                            style={{border:'none', background:'none', cursor:'pointer', fontSize:'1.1rem'}} 
                                            title="ลบ"
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredMaterials.length === 0 && (
                                <tr><td colSpan="5" style={{textAlign:'center', padding:'20px', color:'#888'}}>ไม่พบวัสดุที่ค้นหา</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ฟอร์มเพิ่มวัสดุใหม่ */}
                <div className="card no-print" style={{flex: 1, padding: '20px', minWidth:'250px'}}>
                    <h4 style={{marginTop:0, borderBottom:'1px solid #eee', paddingBottom:'10px'}}>+ เพิ่มวัสดุใหม่</h4>
                    <form onSubmit={handleAdd}>
                        <div className="form-group">
                            <label>ชื่อวัสดุ</label>
                            <input type="text" className="input-modern" value={newMaterial.name} onChange={e => setNewMaterial({...newMaterial, name: e.target.value})} required />
                        </div>
                        <div className="form-group">
                            <label>จำนวน</label>
                            <input type="number" className="input-modern" value={newMaterial.qty} onChange={e => setNewMaterial({...newMaterial, qty: e.target.value})} required />
                        </div>
                        <div className="form-group">
                            <label>หน่วยนับ</label>
                            <input type="text" className="input-modern" value={newMaterial.unit} onChange={e => setNewMaterial({...newMaterial, unit: e.target.value})} placeholder="เช่น ชิ้น, อัน, กล่อง" required />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{width: '100%'}}>บันทึก</button>
                    </form>
                </div>

            </div>

            {/* --- Modal แก้ไขวัสดุ --- */}
            {isEditModalOpen && (
                <div className="modal-overlay" style={modalOverlayStyle}>
                    <div className="modal-box" style={modalBoxStyle}>
                        <h3 style={{marginTop: 0, marginBottom: '20px', color:'#333'}}>✏️ แก้ไขข้อมูลวัสดุ</h3>
                        <form onSubmit={handleUpdateMaterial}>
                            <div className="form-group">
                                <label>ชื่อวัสดุ</label>
                                <input 
                                    type="text" 
                                    className="input-modern" 
                                    value={editingMaterial.name} 
                                    onChange={e => setEditingMaterial({...editingMaterial, name: e.target.value})} 
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <label>จำนวนคงเหลือ</label>
                                <input 
                                    type="number" 
                                    className="input-modern" 
                                    value={editingMaterial.qty} 
                                    onChange={e => setEditingMaterial({...editingMaterial, qty: e.target.value})} 
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <label>หน่วยนับ</label>
                                <input 
                                    type="text" 
                                    className="input-modern" 
                                    value={editingMaterial.unit} 
                                    onChange={e => setEditingMaterial({...editingMaterial, unit: e.target.value})} 
                                    required 
                                />
                            </div>
                            <div style={{display: 'flex', gap: '10px', marginTop:'20px'}}>
                                <button type="submit" className="btn btn-primary" style={{flex: 1}}>บันทึกการแก้ไข</button>
                                <button 
                                    type="button" 
                                    className="btn btn-secondary" 
                                    style={{flex: 1}} 
                                    onClick={() => setIsEditModalOpen(false)}
                                >
                                    ยกเลิก
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- Modal ยืนยันลบ (กลางจอ) --- */}
            {showDeleteModal && (
                <div className="modal-overlay" style={modalOverlayStyle}>
                    <div className="modal-box" style={modalBoxStyle}>
                        <div style={{fontSize: '3rem', marginBottom: '10px'}}>⚠️</div>
                        <h3 style={{marginTop: 0, color:'#333'}}>ยืนยันลบวัสดุ?</h3>
                        <p style={{color: '#666', marginBottom: '25px'}}>คุณต้องการลบรายการนี้ออกจากคลังใช่หรือไม่?</p>
                        <div style={{display: 'flex', gap: '10px'}}>
                            <button onClick={confirmDelete} style={{flex: 1, backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontSize:'1rem'}}>ลบข้อมูล</button>
                            <button onClick={() => setShowDeleteModal(false)} style={{flex: 1, backgroundColor: '#e5e7eb', color: '#374151', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontSize:'1rem'}}>ยกเลิก</button>
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
    width: '90%', maxWidth: '400px', textAlign: 'center',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)', animation: 'fadeIn 0.2s ease-out'
};

export default InventoryDashboard;