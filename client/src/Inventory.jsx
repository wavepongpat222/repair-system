import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './App.css';

function Inventory() {
    const [materials, setMaterials] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();

    // Form States
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [name, setName] = useState('');
    const [qty, setQty] = useState(0);
    const [unit, setUnit] = useState('');

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) { navigate('/'); return; }
        setCurrentUser(user);
        fetchMaterials();
    }, []);

    const fetchMaterials = () => {
        axios.get('http://localhost:3001/materials').then(res => setMaterials(res.data));
    }

    const handleSave = (e) => {
        e.preventDefault();
        if (isEditing) {
            axios.put('http://localhost:3001/update-material', { id: editId, name, quantity: qty, unit })
                .then(res => {
                    if(res.data === "Success") { alert("แก้ไขสำเร็จ"); resetForm(); fetchMaterials(); }
                });
        } else {
            axios.post('http://localhost:3001/add-material', { name, qty, unit })
                .then(res => {
                    if(res.data === "Success") { alert("เพิ่มวัสดุสำเร็จ"); resetForm(); fetchMaterials(); }
                });
        }
    }

    const handleEditClick = (mat) => {
        setIsEditing(true);
        setEditId(mat.id);
        setName(mat.material_name);
        setQty(mat.quantity);
        setUnit(mat.unit);
    }

    const handleDelete = (id) => {
        if(!window.confirm("ยืนยันการลบวัสดุนี้?")) return;
        axios.delete('http://localhost:3001/delete-material/' + id)
            .then(res => { if(res.data === "Success") fetchMaterials(); });
    }

    const resetForm = () => {
        setIsEditing(false); setEditId(null); setName(''); setQty(0); setUnit('');
    }

    // +++ เพิ่มฟังก์ชันนี้ครับ: เช็คว่าใครกดปุ่มกลับ +++
    const handleBack = () => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user?.role === 'inventory') {
            navigate('/inventory-dashboard'); // ฝ่ายคลัง กลับบ้านตัวเอง
        } else {
            navigate('/dashboard'); // คนอื่น กลับ Dashboard รวม
        }
    }

    const canManage = currentUser?.role === 'inventory' || currentUser?.role === 'admin';

    return (
        <div className="container">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                <h2>📦 คลังวัสดุอุปกรณ์</h2>
                {/* เรียกใช้ handleBack แทนการ navigate ตรงๆ */}
                <button className="btn btn-secondary" onClick={handleBack}>🔙 กลับหน้าหลัก</button>
            </div>

            {canManage && (
                <div className="card" style={{marginBottom: '20px', backgroundColor: '#f9fafb'}}>
                    <h4>{isEditing ? '✏️ แก้ไขรายการวัสดุ' : '➕ เพิ่มวัสดุใหม่'}</h4>
                    <form onSubmit={handleSave} style={{display: 'flex', gap: '10px', alignItems: 'flex-end'}}>
                        <div style={{flex: 2}}>
                            <label>ชื่อวัสดุ</label>
                            <input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} required />
                        </div>
                        <div style={{flex: 1}}>
                            <label>จำนวนคงเหลือ</label>
                            <input type="number" className="form-control" value={qty} onChange={e => setQty(e.target.value)} required />
                        </div>
                        <div style={{flex: 1}}>
                            <label>หน่วยนับ</label>
                            <input type="text" className="form-control" value={unit} onChange={e => setUnit(e.target.value)} required placeholder="เช่น ชิ้น, อัน" />
                        </div>
                        <button type="submit" className="btn btn-primary">{isEditing ? 'บันทึกแก้ไข' : 'เพิ่มรายการ'}</button>
                        {isEditing && <button type="button" className="btn btn-secondary" onClick={resetForm}>ยกเลิก</button>}
                    </form>
                </div>
            )}

            <div className="card" style={{padding: '0', overflow: 'hidden'}}>
                <table className="custom-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>รายการวัสดุ</th>
                            <th style={{textAlign: 'center'}}>คงเหลือ</th>
                            <th style={{textAlign: 'center'}}>หน่วย</th>
                            {canManage && <th style={{textAlign: 'center'}}>จัดการ</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {materials.map(m => (
                            <tr key={m.id}>
                                <td>{m.id}</td>
                                <td style={{fontWeight: '500'}}>{m.material_name}</td>
                                <td style={{textAlign: 'center', color: m.quantity < 10 ? 'red' : 'black', fontWeight: 'bold'}}>
                                    {m.quantity}
                                </td>
                                <td style={{textAlign: 'center'}}>{m.unit}</td>
                                {canManage && (
                                    <td style={{textAlign: 'center'}}>
                                        <button onClick={() => handleEditClick(m)} style={{marginRight: '5px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem'}}>✏️</button>
                                        <button onClick={() => handleDelete(m.id)} style={{color: 'red', border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem'}}>🗑️</button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Inventory;