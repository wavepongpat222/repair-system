import { useEffect, useState } from 'react';
import api from './api';
import Swal from 'sweetalert2';
import './App.css';

function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    
    // ✅ State สำหรับ Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10); // แสดงหน้าละ 10 คน

    // Modal Edit State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState({ 
        user_id: '', username: '', first_name: '', last_name: '', role: '', email: '', password: '' 
    });
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = () => {
        api.get('/users')
            .then(res => {
                // ป้องกัน Error หากข้อมูลไม่ใช่ Array
                if (Array.isArray(res.data)) setUsers(res.data);
                else setUsers([]);
            })
            .catch(err => {
                console.log(err);
                setUsers([]);
            });
    }

    const handleEditClick = (user) => {
        setEditingUser({ ...user, password: '' });
        setConfirmPassword('');
        setIsModalOpen(true);
    }

    const handleDeleteClick = (id) => {
        Swal.fire({
            title: 'ยืนยันการลบ?',
            text: "ข้อมูลจะหายไปถาวร",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'ลบเลย',
            cancelButtonText: 'ยกเลิก'
        }).then((result) => {
            if (result.isConfirmed) {
                api.delete('/delete-user/' + id).then(res => {
                    if (res.data === "Success") {
                        Swal.fire('ลบแล้ว', 'ลบผู้ใช้งานเรียบร้อย', 'success');
                        fetchUsers();
                    }
                });
            }
        });
    }

    const handleSaveEdit = (e) => {
        e.preventDefault();
        if (editingUser.password && editingUser.password !== confirmPassword) {
            Swal.fire('ข้อผิดพลาด', 'รหัสผ่านใหม่ไม่ตรงกัน', 'error');
            return;
        }

        api.put('/update-user', editingUser).then(res => {
            if (res.data === "Success") {
                Swal.fire('สำเร็จ', 'แก้ไขข้อมูลเรียบร้อย', 'success');
                setIsModalOpen(false);
                fetchUsers();
            } else if (res.data === "Email Already Exists") {
                Swal.fire('ซ้ำ', 'อีเมลนี้มีผู้ใช้งานแล้ว', 'error');
            } else {
                Swal.fire('Error', 'เกิดข้อผิดพลาด', 'error');
            }
        });
    }

    // --- Logic การกรองและแบ่งหน้า ---
    const filteredUsers = Array.isArray(users) ? users.filter(u => 
        (u.first_name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
        (u.last_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.username || "").toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    return (
        <div className="container" style={{marginTop: '20px'}}>
            <h2 style={{textAlign: 'left', marginBottom: '20px'}}>👤 จัดการผู้ใช้งาน (Admin)</h2>

            <div className="card no-print" style={{padding:'15px', marginBottom:'20px'}}>
                <div style={{display:'flex', alignItems:'center', gap:'10px', background:'#f8fafc', padding:'8px 15px', borderRadius:'50px', border:'1px solid #e2e8f0', maxWidth:'400px'}}>
                    <span style={{fontSize:'1.2rem'}}>🔍</span>
                    <input 
                        type="text" 
                        placeholder="ค้นหาชื่อ, username..." 
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
                            <th style={{textAlign: 'center', width: '50px'}}>#</th>
                            <th>Username</th>
                            <th>ชื่อ-นามสกุล</th>
                            <th>ตำแหน่ง</th>
                            <th>อีเมล</th>
                            <th style={{textAlign: 'center'}} className="no-print">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.map((u, index) => (
                            <tr key={u.user_id}>
                                <td style={{textAlign: 'center'}}>{indexOfFirstItem + index + 1}</td>
                                <td style={{fontWeight:'500'}}>{u.username}</td>
                                <td>{u.first_name} {u.last_name}</td>
                                <td>
                                    <span className={`status-badge`} style={{
                                        backgroundColor: u.role === 'admin' ? '#fee2e2' : u.role === 'technician' ? '#e0f2fe' : '#f3f4f6',
                                        color: u.role === 'admin' ? '#b91c1c' : u.role === 'technician' ? '#0369a1' : '#374151'
                                    }}>
                                        {(u.role || "").toUpperCase()}
                                    </span>
                                </td>
                                <td style={{color:'#64748b'}}>{u.email}</td>
                                <td style={{textAlign: 'center'}} className="no-print">
                                    {/* ✅ ปรับเป็นกลุ่มปุ่มขนาดเล็กเรียงกัน */}
                                    <div className="action-group">
                                        <button onClick={() => handleEditClick(u)} className="btn-sm btn-edit">✏️ แก้ไข</button>
                                        <button onClick={() => handleDeleteClick(u.user_id)} className="btn-sm btn-delete">🗑️ ลบ</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {currentItems.length === 0 && (
                            <tr><td colSpan="6" style={{textAlign:'center', padding:'20px', color:'#999'}}>ไม่พบข้อมูล</td></tr>
                        )}
                    </tbody>
                </table>

                {/* ✅ Pagination Controls */}
                {totalPages > 1 && (
                    <div className="no-print" style={{ display: 'flex', justifyContent: 'center', padding: '20px', gap: '15px', alignItems: 'center', background: '#fafafa', borderTop: '1px solid #eee' }}>
                        <button 
                            className="btn-sm btn-secondary" 
                            disabled={currentPage === 1} 
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            style={{ cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                        >
                            &lt; ก่อนหน้า
                        </button>
                        
                        <span style={{ fontSize: '0.9rem', fontWeight: '500', color: '#555' }}> หน้า {currentPage} จาก {totalPages} </span>
                        
                        <button 
                            className="btn-sm btn-secondary" 
                            disabled={currentPage === totalPages} 
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            style={{ cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                        >
                            ถัดไป &gt;
                        </button>
                    </div>
                )}
            </div>

            {/* Modal Edit User */}
            {isModalOpen && (
                <div className="modal-overlay" style={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    <div className="modal-box" style={{backgroundColor: 'white', padding: '30px', borderRadius: '16px', width: '400px', maxWidth:'90%', maxHeight: '90vh', overflowY: 'auto'}}>
                        <h3 style={{marginTop: 0, marginBottom: '20px'}}>✏️ แก้ไขข้อมูลผู้ใช้</h3>
                        <form onSubmit={handleSaveEdit}>
                            <div className="form-group" style={{marginBottom:'15px'}}>
                                <label>Username</label>
                                <input type="text" className="input-modern" value={editingUser.username} disabled style={{backgroundColor:'#f3f4f6'}} />
                            </div>
                            <div style={{display:'flex', gap:'10px', marginBottom:'15px'}}>
                                <div style={{flex:1}}>
                                    <label>ชื่อจริง</label>
                                    <input type="text" className="input-modern" value={editingUser.first_name} onChange={e => setEditingUser({...editingUser, first_name: e.target.value})} required />
                                </div>
                                <div style={{flex:1}}>
                                    <label>นามสกุล</label>
                                    <input type="text" className="input-modern" value={editingUser.last_name} onChange={e => setEditingUser({...editingUser, last_name: e.target.value})} required />
                                </div>
                            </div>
                            <div className="form-group" style={{marginBottom:'15px'}}>
                                <label>อีเมล</label>
                                <input type="email" className="input-modern" value={editingUser.email} onChange={e => setEditingUser({...editingUser, email: e.target.value})} required />
                            </div>
                            <div className="form-group" style={{marginBottom:'15px'}}>
                                <label>ตำแหน่ง</label>
                                <select className="input-modern" value={editingUser.role} onChange={e => setEditingUser({...editingUser, role: e.target.value})}>
                                    <option value="user">User</option>
                                    <option value="technician">Technician</option>
                                    <option value="supervisor">Supervisor</option>
                                    <option value="inventory">Inventory</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            
                            <hr style={{margin:'20px 0', border:'none', borderTop:'1px dashed #ccc'}} />
                            
                            <div className="form-group" style={{marginBottom:'15px'}}>
                                <label>รีเซ็ตรหัสผ่านใหม่ (ว่างไว้ถ้าไม่เปลี่ยน)</label>
                                <input 
                                    type="password" 
                                    className="input-modern" 
                                    placeholder="รหัสผ่านใหม่" 
                                    value={editingUser.password} 
                                    onChange={e => setEditingUser({...editingUser, password: e.target.value})} 
                                />
                            </div>

                            <div className="form-group" style={{marginBottom:'20px'}}>
                                <label>ยืนยันรหัสผ่านใหม่</label>
                                <input 
                                    type="password" 
                                    className="input-modern" 
                                    placeholder="กรอกรหัสผ่านใหม่อีกครั้ง" 
                                    value={confirmPassword} 
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    style={{borderColor: (editingUser.password && confirmPassword && editingUser.password !== confirmPassword) ? 'red' : ''}} 
                                    disabled={!editingUser.password}
                                />
                                {editingUser.password && confirmPassword && editingUser.password !== confirmPassword && (
                                    <small style={{color:'red', display:'block', marginTop:'5px'}}>❌ รหัสผ่านไม่ตรงกัน</small>
                                )}
                            </div>

                            <div style={{display: 'flex', gap: '10px'}}>
                                <button type="submit" className="btn btn-primary" style={{flex: 1}}>บันทึก</button>
                                <button type="button" className="btn btn-secondary" style={{flex: 1}} onClick={() => setIsModalOpen(false)}>ยกเลิก</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;