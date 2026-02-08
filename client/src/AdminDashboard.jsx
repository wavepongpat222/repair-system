import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './App.css';

function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        
        // เช็คสิทธิ์: ต้องเป็น Admin เท่านั้น
        if (!user || user.role !== 'admin') {
            navigate('/');
            return;
        }
        setCurrentUser(user);
        fetchUsers();
    }, []);

    const fetchUsers = () => {
        axios.get('http://localhost:3001/users')
            .then(res => setUsers(res.data))
            .catch(err => console.log(err));
    }

    // ฟังก์ชันลบผู้ใช้
    const handleDelete = (id) => {
        if(!window.confirm("ยืนยันการลบผู้ใช้นี้? (กู้คืนไม่ได้)")) return;
        axios.delete('http://localhost:3001/delete-user/' + id)
            .then(res => {
                if(res.data === "Success") fetchUsers();
            })
            .catch(err => console.log(err));
    }

    // ฟังก์ชันรีเซ็ตรหัสผ่าน
    const handleResetPassword = (id, username) => {
        const newPass = prompt(`ตั้งรหัสผ่านใหม่สำหรับ "${username}":`, "1234");
        if (!newPass) return;

        axios.put('http://localhost:3001/reset-password', {
            user_id: id,
            newPassword: newPass
        }).then(res => {
            if(res.data === "Success") alert("รีเซ็ตรหัสผ่านเรียบร้อย ✅");
        });
    }

    // ฟังก์ชันแก้ไขข้อมูล
    const handleEdit = (user) => {
        const newFirst = prompt("แก้ไขชื่อจริง:", user.first_name);
        if(newFirst === null) return;
        
        const newLast = prompt("แก้ไขนามสกุล:", user.last_name);
        if(newLast === null) return;

        const newRole = prompt("แก้ไขตำแหน่ง (user, technician, supervisor, inventory, admin):", user.role);
        if(newRole === null) return;

        axios.put('http://localhost:3001/update-user', {
            user_id: user.user_id,
            first_name: newFirst,
            last_name: newLast,
            role: newRole
        }).then(res => {
            if(res.data === "Success") {
                alert("แก้ไขข้อมูลสำเร็จ");
                fetchUsers();
            }
        });
    }

    const handlePrint = () => {
        window.print();
    }

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/');
    }

    return (
        <div className="container">
            {/* Header: ชื่อ Admin, เปลี่ยนรหัสผ่าน, ออกจากระบบ */}
            <div className="no-print" style={{ textAlign: 'right', marginBottom: '10px', color: '#666', fontSize: '0.9rem' }}>
                👋 สวัสดี, <b>{currentUser?.first_name} {currentUser?.last_name}</b> (Administrator) 
                | <span style={{color: 'blue', cursor: 'pointer', textDecoration: 'underline'}} onClick={() => navigate('/change-password')}>เปลี่ยนรหัสผ่าน</span>
                <button className="btn" onClick={handleLogout} style={{ backgroundColor: '#ef4444', color: 'white', marginLeft: '10px', padding: '5px 10px', fontSize: '0.8rem' }}>ออกจากระบบ</button>
            </div>

            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>👥 ระบบจัดการบัญชีผู้ใช้งาน</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn btn-primary" onClick={() => navigate('/add-user')}>+ เพิ่มผู้ใช้ใหม่</button>
                    <button className="btn btn-secondary" style={{backgroundColor: '#059669', color: 'white'}} onClick={handlePrint}>🖨️ พิมพ์รายงาน</button>
                </div>
            </div>

            {/* ส่วนหัวรายงาน (จะโชว์เฉพาะตอน Print) */}
            <div className="only-print" style={{ display: 'none', textAlign: 'center', marginBottom: '20px' }}>
                <h1>รายงานบัญชีผู้ใช้งาน</h1>
                <p>ข้อมูล ณ วันที่: {new Date().toLocaleString('th-TH')}</p>
                <hr />
            </div>

            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <table className="custom-table" style={{ width: '100%' }}>
                    <thead>
                        <tr>
                            <th>ลำดับ</th>
                            <th>Username</th>
                            <th>ชื่อ-นามสกุล</th>
                            <th>ตำแหน่ง</th>
                            <th className="no-print" style={{textAlign: 'center'}}>จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u, index) => (
                            <tr key={u.user_id}>
                                <td>{index + 1}</td>
                                <td>{u.username}</td>
                                <td>{u.first_name} {u.last_name}</td>
                                <td>
                                    <span className={`status-badge`}>
                                        {u.role.toUpperCase()}
                                    </span>
                                </td>
                                <td className="no-print" style={{textAlign: 'center'}}>
                                    <button onClick={() => handleEdit(u)} style={{marginRight: '8px', cursor: 'pointer', background:'none', border:'none', fontSize: '1.2rem'}} title="แก้ไข">✏️</button>
                                    <button onClick={() => handleResetPassword(u.user_id, u.username)} style={{marginRight: '8px', cursor: 'pointer', background:'none', border:'none', fontSize: '1.2rem'}} title="รีเซ็ตรหัสผ่าน">🔑</button>
                                    
                                    {/* ป้องกันไม่ให้ลบตัวเอง */}
                                    {u.user_id !== currentUser?.user_id && (
                                        <button onClick={() => handleDelete(u.user_id)} style={{cursor: 'pointer', background:'none', border:'none', color: 'red', fontSize: '1.2rem'}} title="ลบผู้ใช้">🗑️</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    .only-print { display: block !important; }
                    .card { box-shadow: none; border: none; }
                    .container { max-width: 100%; width: 100%; margin: 0; padding: 0; }
                    @page { margin: 2cm; }
                }
            `}</style>
        </div>
    );
}

export default AdminDashboard;