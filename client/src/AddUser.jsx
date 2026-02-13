import { useState } from 'react';
import api from './api'; // ✅ เปลี่ยนจาก axios เป็น api
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './App.css';

function AddUser() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [role, setRole] = useState('user');
    const [email, setEmail] = useState('');
    
    const navigate = useNavigate();

    const hasNumber = (str) => /\d/.test(str);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (hasNumber(firstName) || hasNumber(lastName)) {
            Swal.fire('ข้อมูลไม่ถูกต้อง', 'ชื่อและนามสกุลต้องเป็นตัวอักษรเท่านั้น ห้ามใส่ตัวเลข', 'warning');
            return;
        }

        if (password !== confirmPassword) {
            Swal.fire('ข้อผิดพลาด', 'รหัสผ่านยืนยันไม่ตรงกัน', 'error');
            return;
        }

        // ✅ เรียกใช้ api.post และตัด URL ข้างหน้าออก
        api.post('/add-user', {
            username, 
            password, 
            first_name: firstName, 
            last_name: lastName, 
            role, 
            email
        })
        .then(res => {
            if(res.data === "Success") {
                Swal.fire('สำเร็จ', 'เพิ่มผู้ใช้งานเรียบร้อย', 'success')
                .then(() => navigate('/admin-dashboard'));
            } else if (res.data === "Username Already Exists") {
                Swal.fire('ข้อมูลซ้ำ', 'Username นี้มีผู้ใช้แล้ว', 'error');
            } else if (res.data === "Email Already Exists") {
                Swal.fire('ข้อมูลซ้ำ', 'Email นี้มีในระบบแล้ว', 'error');
            } else {
                Swal.fire('ข้อผิดพลาด', 'เกิดข้อผิดพลาดในการบันทึก', 'error');
            }
        })
        .catch(err => console.log(err));
    }

    return (
        <div className="container" style={{ maxWidth: '500px', marginTop: '50px' }}>
            <div className="card hide-on-print-page">
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

                    <div className="form-group">
                        <label>อีเมล (ห้ามซ้ำ)</label>
                        <input type="email" className="form-control" required onChange={e => setEmail(e.target.value)} placeholder="name@example.com" />
                    </div>

                    <div className="form-group">
                        <label>Username</label>
                        <input type="text" className="form-control" required onChange={e => setUsername(e.target.value)} />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" className="form-control" required onChange={e => setPassword(e.target.value)} />
                    </div>

                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input 
                            type="password" 
                            className="form-control" 
                            required 
                            onChange={e => setConfirmPassword(e.target.value)}
                            style={{ borderColor: (confirmPassword && password !== confirmPassword) ? 'red' : '#e2e8f0' }}
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

            <div className="only-print" style={{display:'none', textAlign:'center', marginTop:'50px'}}>
                <h3>⚠️ กรุณาไปที่หน้า "หน้าหลักระบบ" (Admin Dashboard) เพื่อพิมพ์รายชื่อผู้ใช้</h3>
            </div>
        </div>
    );
}

export default AddUser;