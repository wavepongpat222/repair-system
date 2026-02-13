import { useState } from 'react';
import api from './api'; // ✅ เปลี่ยนจาก import axios เป็น api
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './App.css';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (event) => {
        event.preventDefault();

        // ✅ แก้ตรงนี้: ใช้ api.post และตัด URL ข้างหน้าออก เหลือแค่ /login
        api.post('/login', { username, password })
            .then(res => {
                if(res.data === "No Record" || res.data === "Wrong Password") {
                     // ดัก Error ก่อน เพราะ Backend ส่ง String มา
                     Swal.fire('ข้อผิดพลาด', 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง', 'error');
                } else if(res.data.status === "Login Success") {
                    localStorage.setItem('user', JSON.stringify(res.data.user));
                    const role = res.data.user.role;
                    
                    Swal.fire({
                        icon: 'success',
                        title: 'เข้าสู่ระบบสำเร็จ',
                        showConfirmButton: false,
                        timer: 1500
                    }).then(() => {
                         if (role === 'admin') navigate('/admin-dashboard');
                         else if (role === 'user') navigate('/create');
                         else if (role === 'inventory') navigate('/inventory-dashboard');
                         else if (role === 'technician') navigate('/my-tasks');
                         else navigate('/dashboard');
                    });
                } else {
                    Swal.fire('ข้อผิดพลาด', 'เกิดข้อผิดพลาดไม่ทราบสาเหตุ', 'error');
                }
            })
            .catch(err => {
                console.log(err);
                Swal.fire('Error', 'ไม่สามารถเชื่อมต่อ Server ได้', 'error');
            });
    }

    const handleForgotPassword = () => {
        navigate('/forgot-password'); 
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-icon">🔧</div>
                <h2 className="login-title">เข้าสู่ระบบแจ้งซ่อม</h2>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Username</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            required 
                            onChange={e => setUsername(e.target.value)} 
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input 
                            type="password" 
                            className="form-control" 
                            required 
                            onChange={e => setPassword(e.target.value)} 
                        />
                    </div>
                    
                    <button type="submit" className="btn-primary">เข้าสู่ระบบ</button>
                    
                    <p 
                        style={{textAlign:'center', marginTop:'15px', fontSize:'0.9rem', cursor:'pointer', color:'#3b82f6'}} 
                        onClick={handleForgotPassword}
                    >
                        ลืมรหัสผ่าน?
                    </p>
                </form>
            </div>
        </div>
    );
}

export default Login;