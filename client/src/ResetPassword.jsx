import { useState, useEffect } from 'react';
import api from './api'; // ✅ เปลี่ยนจาก axios เป็น api
import { useNavigate, useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import './App.css';

function ResetPassword() {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    // ดึง token จาก URL (เช่น ?token=xyz...)
    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            Swal.fire('Error', 'ลิงก์ไม่ถูกต้อง', 'error').then(() => navigate('/login'));
        }
    }, [token, navigate]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            Swal.fire('ผิดพลาด', 'รหัสผ่านไม่ตรงกัน', 'warning');
            return;
        }

        // ✅ เปลี่ยนเป็น api.post และตัด localhost ออก
        api.post('/reset-password', { token, newPassword })
            .then(res => {
                if(res.data === "Success") {
                    Swal.fire('สำเร็จ', 'เปลี่ยนรหัสผ่านเรียบร้อย! กรุณาล็อกอินใหม่', 'success')
                    .then(() => navigate('/login'));
                } else if (res.data === "Invalid or Expired Token") {
                    Swal.fire('ลิ้งก์หมดอายุ', 'กรุณาขอรีเซ็ตรหัสผ่านใหม่อีกครั้ง', 'error');
                } else {
                    Swal.fire('Error', 'เกิดข้อผิดพลาด', 'error');
                }
            })
            .catch(err => {
                console.error(err);
                Swal.fire('Error', 'ไม่สามารถเชื่อมต่อ Server ได้', 'error');
            });
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <h2 className="login-title">🔐 ตั้งรหัสผ่านใหม่</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>รหัสผ่านใหม่</label>
                        <input type="password" class="form-control" required onChange={e => setNewPassword(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>ยืนยันรหัสผ่านใหม่</label>
                        <input type="password" class="form-control" required onChange={e => setConfirmPassword(e.target.value)} />
                    </div>
                    <button type="submit" className="btn-primary">บันทึกรหัสผ่าน</button>
                </form>
            </div>
        </div>
    );
}

export default ResetPassword;