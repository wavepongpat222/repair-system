import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './App.css';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Show Loading
        Swal.fire({ title: 'กำลังส่งอีเมล...', didOpen: () => Swal.showLoading() });

        axios.post('http://localhost:3001/forgot-password', { email })
            .then(res => {
                if(res.data === "Success") {
                    Swal.fire('ส่งสำเร็จ', 'กรุณาตรวจสอบลิงก์ในอีเมลของคุณ', 'success')
                    .then(() => navigate('/login'));
                } else if (res.data === "User Not Found") {
                    Swal.fire('ไม่พบผู้ใช้', 'อีเมลนี้ไม่มีอยู่ในระบบ', 'error');
                } else {
                    Swal.fire('Error', 'เกิดข้อผิดพลาด', 'error');
                }
            })
            .catch(err => Swal.fire('Error', 'เชื่อมต่อ Server ไม่ได้', 'error'));
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <h2 className="login-title">🔑 ลืมรหัสผ่าน</h2>
                <p style={{marginBottom:'20px', color:'#666'}}>กรุณากรอกอีเมลของคุณเพื่อรับลิงก์รีเซ็ต</p>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>อีเมล</label>
                        <input type="email" className="form-control" required onChange={e => setEmail(e.target.value)} placeholder="name@example.com" />
                    </div>
                    <button type="submit" className="btn-primary">ส่งลิงก์รีเซ็ต</button>
                    <button type="button" className="btn-secondary" style={{width:'100%', marginTop:'10px'}} onClick={() => navigate('/login')}>กลับหน้า Login</button>
                </form>
            </div>
        </div>
    );
}

export default ForgotPassword;