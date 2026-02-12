import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './App.css';

function AddUser() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [role, setRole] = useState('user');
    const [email, setEmail] = useState(''); // ✅ เพิ่ม state email
    
    const navigate = useNavigate();

    // ✅ ฟังก์ชันเช็คว่ามีตัวเลขปนไหม (Regular Expression)
    const hasNumber = (str) => /\d/.test(str);

    const handleSubmit = (e) => {
        e.preventDefault();

        // 1. เช็คชื่อ-นามสกุล ห้ามมีตัวเลข
        if (hasNumber(firstName) || hasNumber(lastName)) {
            alert("❌ ชื่อและนามสกุลต้องเป็นตัวอักษรเท่านั้น ห้ามใส่ตัวเลข");
            return;
        }

        // 2. เช็ค Password ตรงกันไหม
        if (password !== confirmPassword) {
            alert("❌ รหัสผ่านยืนยันไม่ตรงกัน! กรุณากรอกใหม่");
            return;
        }

        axios.post('http://localhost:3001/add-user', {
            username, 
            password, 
            first_name: firstName, 
            last_name: lastName, 
            role, 
            email // ✅ ส่ง email ไปด้วย
        })
        .then(res => {
            if(res.data === "Success") {
                alert("✅ เพิ่มผู้ใช้เรียบร้อย");
                navigate('/admin-dashboard'); 
            } else if (res.data === "Username Already Exists") {
                alert("❌ Username นี้มีผู้ใช้แล้ว");
            } else if (res.data === "Email Already Exists") {
                alert("❌ Email นี้มีในระบบแล้ว ห้ามซ้ำ!");
            } else {
                alert("เกิดข้อผิดพลาด");
            }
        })
        .catch(err => console.log(err));
    }

    return (
        <div className="container" style={{ maxWidth: '500px', marginTop: '50px' }}>
            <div className="card">
                <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>👤 เพิ่มผู้ใช้งานใหม่</h2>
                
                <form onSubmit={handleSubmit}>
                    
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>ชื่อจริง (ห้ามตัวเลข)</label>
                            <input type="text" className="form-control" required onChange={e => setFirstName(e.target.value)} />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>นามสกุล (ห้ามตัวเลข)</label>
                            <input type="text" className="form-control" required onChange={e => setLastName(e.target.value)} />
                        </div>
                    </div>

                    {/* ✅ เพิ่มช่องกรอก Email */}
                    <div className="form-group">
                        <label>อีเมล (ห้ามซ้ำ)</label>
                        <input type="email" className="form-control" required onChange={e => setEmail(e.target.value)} placeholder="name@example.com" />
                    </div>

                    <div className="form-group">
                        <label>Username</label>
                        <input type="text" className="form-control" required onChange={e => setUsername(e.target.value)} />
                    </div>

                    <div className="form-group">
                        <label>Password (รหัสผ่าน)</label>
                        <input type="password" className="form-control" required onChange={e => setPassword(e.target.value)} />
                    </div>

                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input 
                            type="password" 
                            className="form-control" 
                            required 
                            onChange={e => setConfirmPassword(e.target.value)}
                            style={{ borderColor: (confirmPassword && password !== confirmPassword) ? 'red' : '#ccc' }}
                        />
                         {confirmPassword && password !== confirmPassword && (
                            <small style={{ color: 'red' }}>❌ รหัสผ่านไม่ตรงกัน</small>
                        )}
                    </div>

                    <div className="form-group">
                        <label>ตำแหน่ง</label>
                        <select onChange={e => setRole(e.target.value)} value={role} className="form-control" style={{ width: '100%', padding: '10px' }}>
                            <option value="user">ผู้ใช้งานทั่วไป (User)</option>
                            <option value="technician">ช่าง (Technician)</option>
                            <option value="supervisor">หัวหน้าช่าง (Supervisor)</option>
                            <option value="inventory">เจ้าหน้าที่คลัง (Inventory)</option>
                            <option value="admin">ผู้ดูแลระบบ (Admin)</option>
                        </select>
                    </div>  

                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>บันทึก</button>
                        <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => navigate('/admin-dashboard')}>ยกเลิก</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddUser;