import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './App.css';

function AddUser() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [role, setRole] = useState('user');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post('http://localhost:3001/add-user', {
            username, password, first_name: firstName, last_name: lastName, role
        })
        .then(res => {
            if(res.data === "Success") {
                alert("เพิ่มผู้ใช้เรียบร้อย ✅");
                navigate('/admin-dashboard'); // <--- กลับไปหน้า Admin
            } else {
                alert("เกิดข้อผิดพลาด");
            }
        });
    }

    return (
        <div className="container" style={{ maxWidth: '500px', marginTop: '50px' }}>
            <div className="card">
                <h2>👤 เพิ่มผู้ใช้งานใหม่</h2>
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>ชื่อจริง</label>
                            <input type="text" required onChange={e => setFirstName(e.target.value)} />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>นามสกุล</label>
                            <input type="text" required onChange={e => setLastName(e.target.value)} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Username</label>
                        <input type="text" required onChange={e => setUsername(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" required onChange={e => setPassword(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>ตำแหน่ง</label>
                        <select onChange={e => setRole(e.target.value)} value={role} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}>
                            <option value="user">ผู้ใช้งานทั่วไป (User)</option>
                            <option value="technician">ช่าง (Technician)</option>
                            <option value="supervisor">หัวหน้าช่าง (Supervisor)</option>
                            <option value="inventory">เจ้าหน้าที่คลัง (Inventory)</option>
                            <option value="admin">ผู้ดูแลระบบ (Admin)</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>บันทึก</button>
                        <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => navigate('/admin-dashboard')}>ยกเลิก</button> {/* <--- กลับไปหน้า Admin */}
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddUser;