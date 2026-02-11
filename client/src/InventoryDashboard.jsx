import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './App.css';

function InventoryDashboard() {
    const [materials, setMaterials] = useState([]);
    const [newMaterial, setNewMaterial] = useState({ name: '', qty: '', unit: '' });
    const [searchTerm, setSearchTerm] = useState(''); // 🔍 ตัวแปรสำหรับค้นหา
    const navigate = useNavigate();

    // State สำหรับการแก้ไข (Modal)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState({ id: '', name: '', qty: '', unit: '' });

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

    const handleDelete = (id) => {
        if(!window.confirm("ยืนยันการลบวัสดุนี้?")) return;
        axios.delete('http://localhost:3001/delete-material/' + id)
            .then(res => { if(res.data === "Success") fetchMaterials(); });
    }

    // --- ฟังก์ชันเปิด Modal แก้ไข ---
    const handleEditClick = (material) => {
        setEditingMaterial({
            id: material.id,
            name: material.material_name,
            qty: material.quantity,
            unit: material.unit
        });
        setIsEditModalOpen(true);
    }

    // --- ฟังก์ชันบันทึกการแก้ไข ---
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

    // กรองข้อมูลตามคำค้นหา (Search Logic)
    const filteredMaterials = materials.filter(m => 
        m.material_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container" style={{marginTop: '20px'}}>
            
            <h2 style={{textAlign: 'left', marginBottom: '20px'}}>📦 จัดการคลังวัสดุอุปกรณ์</h2>

            {/* ช่องค้นหา (Search Bar) */}
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
                
                {/* ตารางรายการวัสดุ (ซ้าย) */}
                <div className="card" style={{flex: 2, padding: '0', overflow: 'hidden', minWidth:'300px'}}>
                    <table className="custom-table">
                        <thead>
                            <tr style={{backgroundColor: '#f9fafb'}}>
                                <th>ชื่อวัสดุ</th>
                                <th style={{textAlign: 'center'}}>คงเหลือ</th>
                                <th style={{textAlign: 'center'}}>หน่วย</th>
                                <th style={{textAlign: 'center'}} className="no-print">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMaterials.map((m) => (
                                <tr key={m.id}>
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
                                            onClick={() => handleDelete(m.id)} 
                                            style={{border:'none', background:'none', cursor:'pointer', fontSize:'1.1rem'}} 
                                            title="ลบ"
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredMaterials.length === 0 && (
                                <tr><td colSpan="4" style={{textAlign:'center', padding:'20px', color:'#888'}}>ไม่พบวัสดุที่ค้นหา</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ฟอร์มเพิ่มวัสดุใหม่ (ขวา) */}
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

            {/* --- MODAL สำหรับแก้ไขวัสดุ --- */}
            {isEditModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '400px', maxWidth:'90%', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
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
        </div>
    );
}

export default InventoryDashboard;