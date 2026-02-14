import { useEffect, useState } from 'react';
import api from './api';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './App.css';

function InventoryDashboard() {
    const [materials, setMaterials] = useState([]);
    const [newMaterial, setNewMaterial] = useState({ name: '', qty: '', unit: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState({ id: '', name: '', qty: '', unit: '' });

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || user.role !== 'inventory') { navigate('/'); return; }
        fetchMaterials();
    }, [navigate]);

    const fetchMaterials = () => {
        api.get('/materials')
            .then(res => setMaterials(Array.isArray(res.data) ? res.data : []))
            .catch(err => console.log(err));
    }

    const hasNumber = (str) => /\d/.test(str);

    const handleAdd = (e) => {
        e.preventDefault();
        
        if (hasNumber(newMaterial.unit)) {
            Swal.fire({
                title: 'ข้อมูลไม่ถูกต้อง',
                text: 'หน่วยนับต้องเป็นตัวอักษรเท่านั้น ห้ามใส่ตัวเลข',
                icon: 'warning',
                confirmButtonColor: '#3b82f6'
            });
            return;
        }

        api.post('/add-material', newMaterial).then(res => {
            if(res.data === "Success") {
                Swal.fire('สำเร็จ', 'เพิ่มวัสดุเรียบร้อย', 'success');
                setNewMaterial({ name: '', qty: '', unit: '' });
                fetchMaterials();
            } else if (res.data === "Duplicate Name") {
                Swal.fire('ชื่อซ้ำ', 'มีวัสดุชื่อนี้ในระบบแล้ว', 'error');
            }
        });
    }

    const handleUpdateMaterial = (e) => {
        e.preventDefault();

        if (hasNumber(editingMaterial.unit)) {
            // ✅ แก้ไข: เพิ่ม didOpen เพื่อบังคับให้แจ้งเตือนอยู่หน้าสุด (zIndex)
            Swal.fire({
                title: 'ข้อมูลไม่ถูกต้อง',
                text: 'หน่วยนับต้องเป็นตัวอักษรเท่านั้น ห้ามใส่ตัวเลข',
                icon: 'warning',
                confirmButtonColor: '#3b82f6',
                // บังคับให้ลอยทับทุกอย่าง
                didOpen: () => {
                    Swal.getContainer().style.zIndex = "10000";
                }
            });
            return;
        }

        api.put('/update-material', {
            id: editingMaterial.id,
            name: editingMaterial.name,
            quantity: editingMaterial.qty,
            unit: editingMaterial.unit
        }).then(res => {
            if(res.data === "Success") {
                Swal.fire({
                    title: 'สำเร็จ',
                    text: 'แก้ไขข้อมูลเรียบร้อย',
                    icon: 'success',
                    didOpen: () => { Swal.getContainer().style.zIndex = "10000"; }
                });
                setIsEditModalOpen(false);
                fetchMaterials();
            }
        });
    }

    const handleDeleteMaterial = (id) => {
        Swal.fire({
            title: 'ยืนยันการลบวัสดุ?',
            text: "ข้อมูลวัสดุนี้จะถูกลบออกจากคลังถาวร",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'ลบเลย',
            cancelButtonText: 'ยกเลิก'
        }).then((result) => {
            if (result.isConfirmed) {
                api.delete('/delete-material/' + id).then(res => {
                    if (res.data === "Success") {
                        Swal.fire('ลบแล้ว', 'ลบวัสดุเรียบร้อย', 'success');
                        fetchMaterials();
                    }
                }).catch(err => {
                    Swal.fire('Error', 'ไม่สามารถลบได้ เนื่องจากมีการใช้งานวัสดุนี้ในระบบ', 'error');
                });
            }
        });
    }

    const filteredMaterials = materials.filter(m => 
        m.material_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentMaterials = filteredMaterials.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredMaterials.length / itemsPerPage);

    return (
        <div className="container" style={{marginTop: '20px'}}>
            <h2 style={{textAlign: 'left', marginBottom: '20px'}}>📦 จัดการคลังวัสดุอุปกรณ์</h2>

            <div style={{display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap:'wrap'}}>
                <div style={{flex: 2, minWidth:'300px'}}>
                    <div className="card no-print" style={{padding:'15px', marginBottom:'20px'}}>
                         <div style={{display:'flex', alignItems:'center', gap:'10px', background:'#f8fafc', padding:'8px 15px', borderRadius:'50px', border:'1px solid #e2e8f0', maxWidth:'400px'}}>
                            <span style={{fontSize:'1.2rem'}}>🔍</span>
                            <input 
                                type="text" 
                                placeholder="ค้นหาชื่อวัสดุ..." 
                                value={searchTerm}
                                onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
                                style={{border:'none', background:'transparent', outline:'none', width:'100%', fontSize:'1rem'}}
                            />
                        </div>
                    </div>

                    <div className="card" style={{ padding: '0', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                        <table className="custom-table">
                            <thead>
                                <tr style={{backgroundColor: '#f9fafb'}}>
                                    <th style={{textAlign: 'center', width: '60px'}}>#</th>
                                    <th>ชื่อวัสดุ</th>
                                    <th style={{textAlign: 'center'}}>คงเหลือ</th>
                                    <th style={{textAlign: 'center'}}>หน่วย</th>
                                    <th style={{textAlign: 'center'}} className="no-print">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentMaterials.map((m, index) => (
                                    <tr key={m.id}>
                                        <td style={{textAlign: 'center'}}>{indexOfFirstItem + index + 1}</td>
                                        <td style={{fontWeight:'500'}}>{m.material_name}</td>
                                        <td style={{textAlign: 'center', fontWeight: 'bold', color: m.quantity < 5 ? 'red' : 'black'}}>
                                            {m.quantity}
                                        </td>
                                        <td style={{textAlign: 'center'}}>{m.unit}</td>
                                        <td style={{textAlign: 'center'}} className="no-print">
                                            <div className="action-group">
                                                <button 
                                                    onClick={() => {setEditingMaterial({id: m.id, name: m.material_name, qty: m.quantity, unit: m.unit}); setIsEditModalOpen(true);}} 
                                                    className="btn-sm btn-edit"
                                                >
                                                    ✏️ แก้ไข
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteMaterial(m.id)} 
                                                    className="btn-sm btn-delete"
                                                >
                                                    🗑️ ลบ
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {currentMaterials.length === 0 && <tr><td colSpan="5" style={{textAlign:'center', padding:'20px', color:'#888'}}>ไม่พบวัสดุที่ค้นหา</td></tr>}
                            </tbody>
                        </table>

                        {totalPages > 1 && (
                            <div className="no-print" style={{display:'flex', justifyContent:'center', padding:'20px', gap:'15px', alignItems:'center', background:'#fafafa', borderTop:'1px solid #eee'}}>
                                <button className="btn-sm btn-secondary" disabled={currentPage===1} onClick={()=>setCurrentPage(p=>p-1)}>&lt; ก่อนหน้า</button>
                                <span style={{fontWeight:'500', color:'#555', fontSize:'0.9rem'}}> หน้า {currentPage} จาก {totalPages} </span>
                                <button className="btn-sm btn-secondary" disabled={currentPage===totalPages} onClick={()=>setCurrentPage(p=>p+1)}>ถัดไป &gt;</button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="card no-print" style={{flex: 1, padding: '20px', minWidth:'250px'}}>
                    <h4 style={{marginTop:0, borderBottom:'1px solid #eee', paddingBottom:'10px'}}>+ เพิ่มวัสดุใหม่</h4>
                    <form onSubmit={handleAdd}>
                        <div className="form-group"><label>ชื่อวัสดุ</label><input type="text" className="input-modern" value={newMaterial.name} onChange={e => setNewMaterial({...newMaterial, name: e.target.value})} required /></div>
                        <div className="form-group"><label>จำนวน</label><input type="number" className="input-modern" value={newMaterial.qty} onChange={e => setNewMaterial({...newMaterial, qty: e.target.value})} required /></div>
                        <div className="form-group"><label>หน่วยนับ</label><input type="text" className="input-modern" value={newMaterial.unit} onChange={e => setNewMaterial({...newMaterial, unit: e.target.value})} placeholder="เช่น ชิ้น, อัน" required /></div>
                        <button type="submit" className="btn btn-primary" style={{width: '100%'}}>บันทึก</button>
                    </form>
                </div>
            </div>

            {/* Modal Edit (zIndex: 9999) */}
            {isEditModalOpen && (
                <div className="modal-overlay" style={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '16px', width: '400px', maxWidth:'90%', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                        <h3 style={{marginTop: 0, marginBottom: '20px'}}>✏️ แก้ไขข้อมูลวัสดุ</h3>
                        <form onSubmit={handleUpdateMaterial}>
                            <div className="form-group"><label>ชื่อวัสดุ</label><input type="text" className="input-modern" value={editingMaterial.name} onChange={e => setEditingMaterial({...editingMaterial, name: e.target.value})} required /></div>
                            <div className="form-group"><label>จำนวนคงเหลือ</label><input type="number" className="input-modern" value={editingMaterial.qty} onChange={e => setEditingMaterial({...editingMaterial, qty: e.target.value})} required /></div>
                            <div className="form-group"><label>หน่วยนับ</label><input type="text" className="input-modern" value={editingMaterial.unit} onChange={e => setEditingMaterial({...editingMaterial, unit: e.target.value})} required /></div>
                            <div style={{display: 'flex', gap: '10px', marginTop:'20px'}}>
                                <button type="submit" className="btn btn-primary" style={{flex: 1}}>บันทึก</button>
                                <button type="button" className="btn btn-secondary" style={{flex: 1}} onClick={() => setIsEditModalOpen(false)}>ยกเลิก</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
export default InventoryDashboard;