import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './App.css';

function ChangePassword() {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        const user = JSON.parse(localStorage.getItem('user'));
        
        if(newPassword !== confirmPassword) {
            alert("รหัสผ่านใหม่ไม่ตรงกัน");
            return;
        }

        axios.put('http://localhost:3001/change-password', {
            user_id: user.user_id,
            oldPassword: oldPassword,
            newPassword: newPassword
        }).then(res => {
            if(res.data === "Success") {
                alert("เปลี่ยนรหัสผ่านสำเร็จ! กรุณาล็อกอินใหม่");
                localStorage.removeItem('user');
                navigate('/');
            } else if (res.data === "Wrong Old Password") {
                alert("รหัสผ่านเดิมไม่ถูกต้อง");
            } else {
                alert("เกิดข้อผิดพลาด");
            }
        });
    }

    return (
        <div className="container" style={{maxWidth: '400px', marginTop: '50px'}}>
            <div className="card">
                <h2>🔐 เปลี่ยนรหัสผ่าน</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>รหัสผ่านเดิม</label>
                        <input type="password" required onChange={e => setOldPassword(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>รหัสผ่านใหม่</label>
                        <input type="password" required onChange={e => setNewPassword(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>ยืนยันรหัสผ่านใหม่</label>
                        <input type="password" required onChange={e => setConfirmPassword(e.target.value)} />
                    </div>
                    <div style={{marginTop: '20px', display: 'flex', gap: '10px'}}>
                        <button type="submit" className="btn btn-primary" style={{flex: 1}}>บันทึก</button>
                        <button type="button" className="btn btn-secondary" style={{flex: 1}} onClick={() => navigate('/dashboard')}>ยกเลิก</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ChangePassword;