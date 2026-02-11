import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './App.css';

function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();

    // Pagination & Search State
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState({ user_id: '', username: '', password: '', first_name: '', last_name: '', role: 'user' });

    // --- State สำหรับ Popup ลบ ---
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || user.role !== 'admin') { navigate('/'); return; }
        fetchUsers();
    }, []);

    const fetchUsers = () => {
        axios.get('http://localhost:3001/users')
            .then(res => setUsers(res.data))
            .catch(err => console.log(err));
    }

    // เปิด Popup ลบ
    const handleClickDelete = (id) => {
        setDeleteId(id);
        setShowDeleteModal(true);
    }

    // ยืนยันลบ
    const confirmDelete = () => {
        axios.delete('http://localhost:3001/delete-user/' + deleteId)
            .then(res => { if(res.data === "Success") { fetchUsers(); setShowDeleteModal(false); } });
    }

    const handleEditClick = (user) => {
        setEditingUser({ ...user, password: '' });
        setIsModalOpen(true);
    }

    const handleSaveEdit = (e) => {
        e.preventDefault();
        axios.put('http://localhost:3001/update-user', {
            user_id: editingUser.user_id,
            username: editingUser.username,
            password: editingUser.password,
            first_name: editingUser.first_name,
            last_name: editingUser.last_name,
            role: editingUser.role
        }).then(res => {
            if(res.data === "Success") {
                alert("แก้ไขข้อมูลสำเร็จ ✅");
                setIsModalOpen(false);
                fetchUsers();
            } else {
                alert("เกิดข้อผิดพลาด");
            }
        });
    }

    const filteredUsers = users.filter((u) => {
        const text = searchTerm.toLowerCase();
        return (
            u.username.toLowerCase().includes(text) ||
            u.first_name.toLowerCase().includes(text) ||
            u.last_name.toLowerCase().includes(text) ||
            u.role.toLowerCase().includes(text)
        );
    });

    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="container" style={{marginTop: '20px'}}>
            {/* Header & Search */}
            <div style={{ marginBottom: '20px' }}>
                <h2 style={{margin: '0 0 15px 0', textAlign:'left'}}>👥 รายชื่อผู้ใช้งาน ({filteredUsers.length})</h2>
                <input type="text" className="no-print" placeholder="🔍 ค้นหา..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }} />
            </div>

            {/* Table */}
            <div className="card" style={{ padding: '0', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                <table className="custom-table medium-table">
                    <thead>
                        <tr style={{backgroundColor: '#f9fafb'}}>
                            <th style={{textAlign: 'center'}}>#</th>
                            <th>Username</th>
                            <th>ชื่อ-นามสกุล</th>
                            <th>ตำแหน่ง</th>
                            <th className="no-print" style={{textAlign: 'center'}}>จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentUsers.map((u, index) => (
                            <tr key={u.user_id} style={{borderBottom: '1px solid #f0f0f0'}}>
                                <td style={{textAlign: 'center'}}>{indexOfFirstUser + index + 1}</td>
                                <td>{u.username}</td>
                                <td>{u.first_name} {u.last_name}</td>
                                <td><span className="status-badge" style={{padding: '4px 10px', fontSize: '0.85rem', backgroundColor: u.role === 'admin' ? '#fee2e2' : '#e0f2fe', color: u.role === 'admin' ? '#b91c1c' : '#0369a1', border: 'none'}}>{u.role.toUpperCase()}</span></td>
                                <td className="no-print" style={{textAlign: 'center'}}>
                                    <button onClick={() => handleEditClick(u)} style={{marginRight: '8px', cursor: 'pointer', border:'none', background:'none', fontSize: '1.2rem'}}>✏️</button>
                                    {u.username !== JSON.parse(localStorage.getItem('user'))?.username && (
                                        <button onClick={() => handleClickDelete(u.user_id)} style={{cursor: 'pointer', border:'none', background:'none', color: 'red', fontSize: '1.2rem'}}>🗑️</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {/* Pagination */}
                {filteredUsers.length > 10 && (
                    <div className="no-print" style={{ display: 'flex', justifyContent: 'center', padding: '15px', gap: '5px', backgroundColor: '#fff', borderTop: '1px solid #eee' }}>
                         <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} style={{ padding: '6px 12px', border:'1px solid #ddd', borderRadius:'4px' }}>&lt;</button>
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button key={i + 1} onClick={() => paginate(i + 1)} style={{ padding: '6px 12px', cursor: 'pointer', backgroundColor: currentPage === i + 1 ? '#3b82f6' : 'white', color: currentPage === i + 1 ? 'white' : 'black', border: '1px solid #ddd', borderRadius: '4px' }}>{i + 1}</button>
                        ))}
                        <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} style={{ padding: '6px 12px', border:'1px solid #ddd', borderRadius:'4px' }}>&gt;</button>
                    </div>
                )}
            </div>

            {/* Modal แก้ไข */}
            {isModalOpen && (
                <div className="modal-overlay" style={modalOverlayStyle}>
                    <div className="modal-box" style={modalBoxStyle}>
                        <h3 style={{marginTop: 0}}>✏️ แก้ไขข้อมูลผู้ใช้</h3>
                        <form onSubmit={handleSaveEdit}>
                            <div className="form-group"><label>Username (แก้ไขไม่ได้)</label><input type="text" className="form-control" value={editingUser.username} disabled style={{width:'100%', padding:'10px', backgroundColor: '#e5e7eb', color: '#6b7280', cursor: 'not-allowed'}} /></div>
                            <div className="form-group"><label>รหัสผ่านใหม่</label><input type="password" className="form-control" value={editingUser.password} onChange={e => setEditingUser({...editingUser, password: e.target.value})} style={{width:'100%', padding:'10px'}} /></div>
                            <div style={{display: 'flex', gap: '10px'}}><div style={{flex: 1}}><label>ชื่อจริง</label><input type="text" className="form-control" value={editingUser.first_name} onChange={e => setEditingUser({...editingUser, first_name: e.target.value})} /></div><div style={{flex: 1}}><label>นามสกุล</label><input type="text" className="form-control" value={editingUser.last_name} onChange={e => setEditingUser({...editingUser, last_name: e.target.value})} /></div></div>
                            <div className="form-group" style={{marginTop: '15px'}}><label>ตำแหน่ง</label><select className="form-control" value={editingUser.role} onChange={e => setEditingUser({...editingUser, role: e.target.value})} style={{width:'100%', padding:'10px'}}><option value="user">User</option><option value="technician">Technician</option><option value="supervisor">Supervisor</option><option value="inventory">Inventory</option><option value="admin">Admin</option></select></div>
                            <div style={{display: 'flex', gap: '10px', marginTop:'20px'}}><button type="submit" className="btn btn-primary" style={{flex: 1}}>บันทึก</button><button type="button" className="btn btn-secondary" style={{flex: 1}} onClick={() => setIsModalOpen(false)}>ยกเลิก</button></div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- 🔴 Popup ยืนยันการลบ (กลางจอ) --- */}
            {showDeleteModal && (
                <div className="modal-overlay" style={modalOverlayStyle}>
                    <div className="modal-box" style={modalBoxStyle}>
                        <div style={{fontSize: '3rem', marginBottom: '10px'}}>⚠️</div>
                        <h3 style={{marginTop: 0, color:'#333'}}>ยืนยันการลบ?</h3>
                        <p style={{color: '#666', marginBottom: '25px'}}>คุณต้องการลบผู้ใช้งานนี้ใช่หรือไม่?</p>
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

// สไตล์สำหรับทำ Popup กลางจอ
const modalOverlayStyle = {
    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999,
    display: 'flex', justifyContent: 'center', alignItems: 'center' // หัวใจสำคัญของการจัดกลาง
};

const modalBoxStyle = {
    backgroundColor: 'white', padding: '30px', borderRadius: '16px',
    width: '90%', maxWidth: '400px', textAlign: 'center',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)', animation: 'fadeIn 0.2s ease-out'
};

export default AdminDashboard;