import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './App.css';

function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();

    // Pagination & Search
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState({
        user_id: '',
        username: '',
        password: '',
        first_name: '',
        last_name: '',
        role: 'user'
    });

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

    const handleDelete = (id) => {
        if(!window.confirm("ยืนยันการลบผู้ใช้นี้?")) return;
        axios.delete('http://localhost:3001/delete-user/' + id)
            .then(res => { if(res.data === "Success") fetchUsers(); });
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

    // Filter & Pagination Logic
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
            
            {/* หัวข้อและการค้นหา (ปุ่มเพิ่ม/พิมพ์ ถูกย้ายไป Navbar แล้ว) */}
            <div style={{ marginBottom: '20px' }}>
                <h2 style={{margin: '0 0 15px 0', textAlign:'left'}}>👥 รายชื่อผู้ใช้งานในระบบ ({filteredUsers.length})</h2>
                
                {/* ช่องค้นหา */}
                <input 
                    type="text" 
                    className="no-print"
                    placeholder="🔍 ค้นหาชื่อ, username หรือตำแหน่ง..." 
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                    }}
                    style={{
                        width: '100%', 
                        padding: '12px', 
                        borderRadius: '8px', 
                        border: '1px solid #ddd',
                        fontSize: '1rem',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}
                />
            </div>

            {/* ตารางแสดงข้อมูล */}
            <div className="card" style={{ padding: '0', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                <table className="custom-table medium-table">
                    <thead>
                        <tr style={{backgroundColor: '#f9fafb'}}>
                            <th style={{textAlign: 'center', width: '50px'}}>#</th>
                            <th style={{width: '20%'}}>Username</th>
                            <th style={{width: '30%'}}>ชื่อ-นามสกุล</th>
                            <th style={{width: '15%'}}>ตำแหน่ง</th>
                            <th className="no-print" style={{textAlign: 'center', width: '100px'}}>จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentUsers.map((u, index) => {
                            const realIndex = indexOfFirstUser + index + 1;
                            return (
                                <tr key={u.user_id} style={{borderBottom: '1px solid #f0f0f0'}}>
                                    <td style={{textAlign: 'center'}}>{realIndex}</td>
                                    <td>{u.username}</td>
                                    <td>{u.first_name} {u.last_name}</td>
                                    <td>
                                        <span className="status-badge" style={{
                                            padding: '4px 10px',
                                            fontSize: '0.85rem',
                                            backgroundColor: u.role === 'admin' ? '#fee2e2' : '#e0f2fe',
                                            color: u.role === 'admin' ? '#b91c1c' : '#0369a1',
                                            border: 'none'
                                        }}>
                                            {u.role.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="no-print" style={{textAlign: 'center'}}>
                                        <button onClick={() => handleEditClick(u)} style={{marginRight: '8px', cursor: 'pointer', border:'none', background:'none', fontSize: '1.2rem'}} title="แก้ไข">✏️</button>
                                        
                                        {/* ป้องกันไม่ให้ลบตัวเอง */}
                                        {u.username !== JSON.parse(localStorage.getItem('user'))?.username && (
                                            <button onClick={() => handleDelete(u.user_id)} style={{cursor: 'pointer', border:'none', background:'none', color: 'red', fontSize: '1.2rem'}} title="ลบ">🗑️</button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                        {currentUsers.length === 0 && <tr><td colSpan="5" style={{textAlign:'center', padding:'20px', color:'#999'}}>ไม่พบข้อมูลที่ค้นหา</td></tr>}
                    </tbody>
                </table>

                {/* Pagination Controls */}
                {filteredUsers.length > 10 && (
                    <div className="no-print" style={{ display: 'flex', justifyContent: 'center', padding: '15px', gap: '5px', backgroundColor: '#fff', borderTop: '1px solid #eee' }}>
                        <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} style={{ padding: '6px 12px', fontSize: '0.9rem', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', border:'1px solid #ddd', borderRadius:'4px' }}>&lt;</button>
                        
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button 
                                key={i + 1} 
                                onClick={() => paginate(i + 1)}
                                style={{
                                    padding: '6px 12px',
                                    fontSize: '0.9rem',
                                    cursor: 'pointer',
                                    backgroundColor: currentPage === i + 1 ? '#3b82f6' : 'white',
                                    color: currentPage === i + 1 ? 'white' : 'black',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px'
                                }}
                            >
                                {i + 1}
                            </button>
                        ))}
                        
                        <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} style={{ padding: '6px 12px', fontSize: '0.9rem', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', border:'1px solid #ddd', borderRadius:'4px' }}>&gt;</button>
                    </div>
                )}
            </div>

            {/* Modal แก้ไขข้อมูล (Code ส่วนนี้เหมือนเดิมครับ) */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                        <h3 style={{marginTop: 0, marginBottom: '20px', color:'#333'}}>✏️ แก้ไขข้อมูลผู้ใช้</h3>
                        <form onSubmit={handleSaveEdit}>
                            <div className="form-group" style={{marginBottom: '15px'}}>
                                <label>Username</label>
                                <input type="text" className="form-control" value={editingUser.username} onChange={e => setEditingUser({...editingUser, username: e.target.value})} required style={{width:'100%', padding:'10px', borderRadius:'6px', border:'1px solid #ccc'}} />
                            </div>
                            <div className="form-group" style={{marginBottom: '15px'}}>
                                <label>รหัสผ่านใหม่ <small style={{color:'#666'}}>(เว้นว่างถ้าไม่เปลี่ยน)</small></label>
                                <input type="password" className="form-control" value={editingUser.password} onChange={e => setEditingUser({...editingUser, password: e.target.value})} style={{width:'100%', padding:'10px', borderRadius:'6px', border:'1px solid #ccc', backgroundColor: '#fffbeb'}} placeholder="ตั้งรหัสใหม่" />
                            </div>
                            <div style={{display: 'flex', gap: '10px', marginBottom: '15px'}}>
                                <div style={{flex: 1}}>
                                    <label>ชื่อจริง</label>
                                    <input type="text" className="form-control" value={editingUser.first_name} onChange={e => setEditingUser({...editingUser, first_name: e.target.value})} required style={{width:'100%', padding:'10px', borderRadius:'6px', border:'1px solid #ccc'}} />
                                </div>
                                <div style={{flex: 1}}>
                                    <label>นามสกุล</label>
                                    <input type="text" className="form-control" value={editingUser.last_name} onChange={e => setEditingUser({...editingUser, last_name: e.target.value})} required style={{width:'100%', padding:'10px', borderRadius:'6px', border:'1px solid #ccc'}} />
                                </div>
                            </div>
                            <div className="form-group" style={{marginBottom: '25px'}}>
                                <label>ตำแหน่ง</label>
                                <select className="form-control" value={editingUser.role} onChange={e => setEditingUser({...editingUser, role: e.target.value})} style={{width:'100%', padding:'10px', borderRadius:'6px', border:'1px solid #ccc'}}>
                                    <option value="user">User</option>
                                    <option value="technician">Technician</option>
                                    <option value="supervisor">Supervisor</option>
                                    <option value="inventory">Inventory</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div style={{display: 'flex', gap: '10px'}}>
                                <button type="submit" className="btn btn-primary" style={{flex: 1, padding: '10px', borderRadius:'6px', border:'none', background:'#3b82f6', color:'white', cursor:'pointer'}}>บันทึก</button>
                                <button type="button" className="btn btn-secondary" style={{flex: 1, padding: '10px', borderRadius:'6px', border:'none', background:'#64748b', color:'white', cursor:'pointer'}} onClick={() => setIsModalOpen(false)}>ยกเลิก</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* CSS สำหรับการพิมพ์ (ซ่อนปุ่มที่ไม่จำเป็น) */}
            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    .card { border: none !important; box-shadow: none !important; }
                    .container { margin-top: 0 !important; }
                    /* ซ่อนปุ่มแก้ไข/ลบในตารางตอนพิมพ์ */
                    td button { display: none !important; }
                }
            `}</style>
        </div>
    );
}

export default AdminDashboard;