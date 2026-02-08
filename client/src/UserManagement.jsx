import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './App.css';

function UserManagement() {
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || user.role !== 'admin') {
            alert("คุณไม่มีสิทธิ์เข้าถึงหน้านี้");
            navigate('/dashboard');
            return;
        }
        fetchUsers();
    }, []);

    const fetchUsers = () => {
        axios.get('http://localhost:3001/users')
            .then(res => setUsers(res.data))
            .catch(err => console.log(err));
    }

    const handleDelete = (id) => {
        if(!window.confirm("คุณแน่ใจไหมว่าจะลบผู้ใช้นี้? (กู้คืนไม่ได้)")) return;
        axios.delete('http://localhost:3001/delete-user/' + id)
            .then(res => {
                if(res.data === "Success") fetchUsers();
            })
            .catch(err => console.log(err));
    }

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

    const handleEdit = (user) => {
        const newFirst = prompt("แก้ไขชื่อจริง:", user.first_name);
        if(newFirst === null) return;
        
        const newLast = prompt("แก้ไขนามสกุล:", user.last_name);
        if(newLast === null) return;

        const newRole = prompt("แก้ไขตำแหน่ง (user, technician, supervisor, admin):", user.role);
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

    return (
        <div className="container">
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>👥 จัดการบัญชีผู้ใช้งาน</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>🔙 กลับ</button>
                    <button className="btn btn-primary" onClick={() => navigate('/add-user')}>+ เพิ่มผู้ใช้</button>
                    <button className="btn btn-secondary" style={{backgroundColor: '#059669', color: 'white'}} onClick={handlePrint}>🖨️ พิมพ์รายงาน</button>
                </div>
            </div>

            <div className="only-print" style={{ display: 'none', textAlign: 'center', marginBottom: '20px' }}>
                <h1>รายงานบัญชีผู้ใช้งาน</h1>
                <p>วันที่พิมพ์: {new Date().toLocaleString('th-TH')}</p>
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
                                    <span className={`status-badge ${u.role === 'admin' ? 'status-done' : u.role === 'supervisor' ? 'status-doing' : ''}`}>
                                        {u.role.toUpperCase()}
                                    </span>
                                </td>
                                <td className="no-print" style={{textAlign: 'center'}}>
                                    <button onClick={() => handleEdit(u)} style={{marginRight: '5px', cursor: 'pointer', background:'none', border:'none', fontSize: '1.2rem'}}>✏️</button>
                                    <button onClick={() => handleResetPassword(u.user_id, u.username)} style={{marginRight: '5px', cursor: 'pointer', background:'none', border:'none', fontSize: '1.2rem'}} title="รีเซ็ตรหัส">🔑</button>
                                    <button onClick={() => handleDelete(u.user_id)} style={{cursor: 'pointer', background:'none', border:'none', color: 'red', fontSize: '1.2rem'}}>🗑️</button>
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

export default UserManagement;