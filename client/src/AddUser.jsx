import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './App.css';

function AddUser() {
    // 1. ประกาศตัวแปร State ให้ครบ
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState(''); // <--- ตัวแปรสำหรับเช็คยืนยัน
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [role, setRole] = useState('user');
    const [email, setEmail] = useState('');
    
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();

        // 2. เช็คว่ารหัสผ่านตรงกันไหมก่อนส่ง
        if (password !== confirmPassword) {
            alert("❌ รหัสผ่านยืนยันไม่ตรงกัน! กรุณากรอกใหม่");
            return; // หยุดทำงานทันที ไม่ส่งข้อมูลไป Server
        }

        // ส่งข้อมูลไปหลังบ้าน
        axios.post('http://localhost:3001/add-user', {
            username, 
            password, 
            first_name: firstName, 
            last_name: lastName, 
            role, 
            email
        })
        .then(res => {
            if(res.data === "Success") {
                alert("✅ เพิ่มผู้ใช้เรียบร้อย");
                navigate('/admin-dashboard'); 
            } else {
                alert("เกิดข้อผิดพลาด (Username อาจซ้ำ)");
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
                            <label>ชื่อจริง</label>
                            <input type="text" className="form-control" required onChange={e => setFirstName(e.target.value)} />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>นามสกุล</label>
                            <input type="text" className="form-control" required onChange={e => setLastName(e.target.value)} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>อีเมล</label>
                        <input type="email" className="form-control" onChange={e => setEmail(e.target.value)} placeholder="name@example.com" />
                    </div>

                    <div className="form-group">
                        <label>Username</label>
                        <input type="text" className="form-control" required onChange={e => setUsername(e.target.value)} />
                    </div>

                    {/* ส่วนรหัสผ่าน (Password) */}
                    <div className="form-group">
                        <label>Password (รหัสผ่าน)</label>
                        <input 
                            type="password" 
                            className="form-control" 
                            required 
                            onChange={e => setPassword(e.target.value)} // เก็บค่าเข้าตัวแปร password
                        />
                    </div>

                    {/* ส่วนยืนยันรหัสผ่าน (Confirm Password) */}
                    <div className="form-group">
                        <label>Confirm Password (ยืนยันรหัสผ่าน)</label>
                        <input 
                            type="password" 
                            className="form-control" 
                            required 
                            onChange={e => setConfirmPassword(e.target.value)} // เก็บค่าเข้าตัวแปร confirmPassword
                            
                            // ลูกเล่น: ถ้าพิมพ์ไม่ตรงกัน ขอบช่องจะเป็นสีแดง
                            style={{ 
                                borderColor: (confirmPassword && password !== confirmPassword) ? 'red' : '#ccc' 
                            }}
                        />
                        {/* ข้อความเตือนเล็กๆ สีแดง */}
                        {confirmPassword && password !== confirmPassword && (
                            <small style={{ color: 'red', display: 'block', marginTop: '5px' }}>
                                ❌ รหัสผ่านไม่ตรงกัน
                            </small>
                        )}
                    </div>

                    <div className="form-group">
                        <label>ตำแหน่ง</label>
                        <select 
                            onChange={e => setRole(e.target.value)} 
                            value={role} 
                            className="form-control" 
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                        >
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