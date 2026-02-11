import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './App.css';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (event) => {
        event.preventDefault();

        axios.post('http://localhost:3001/login', { username, password })
            .then(res => {
                if(res.data.status === "Login Success") {
                    localStorage.setItem('user', JSON.stringify(res.data.user));
                    const role = res.data.user.role;

                    // --- แยกทางเข้าตาม Role ---
                    if (role === 'admin') {
                        navigate('/admin-dashboard'); // Admin ไปหน้าจัดการ User
                    } else if (role === 'user') {
                        navigate('/create');
                    } else if (role === 'inventory') {
                        navigate('/inventory-dashboard');
                    } else {
                        navigate('/dashboard'); // Supervisor, Technician ไปหน้างานซ่อม
                    }
                    
                } else {
                    alert("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง ❌");
                }
            })
            .catch(err => console.log(err));
    }

    return (
        <div className="container" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6' }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '30px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>🔐 ระบบแจ้งซ่อม</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label>Username</label>
                        <input type="text" className="form-control" placeholder="กรอกชื่อผู้ใช้" required onChange={e => setUsername(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                    </div>
                    <div className="form-group" style={{ marginBottom: '25px' }}>
                        <label>Password</label>
                        <input type="password" className="form-control" placeholder="กรอกรหัสผ่าน" required onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '1rem', fontWeight: 'bold' }}>เข้าสู่ระบบ</button>
                </form>
            </div>
        </div>
    )
}

export default Login;