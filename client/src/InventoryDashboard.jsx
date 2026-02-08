import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './App.css';

function InventoryDashboard() {
    const [materials, setMaterials] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        
        // 1. เช็คสิทธิ์: ต้องเป็น Inventory หรือ Admin เท่านั้น
        if (!user || (user.role !== 'inventory' && user.role !== 'admin')) {
            navigate('/');
            return;
        }
        setCurrentUser(user);
        fetchMaterials();
    }, []);

    const fetchMaterials = () => {
        axios.get('http://localhost:3001/materials').then(res => setMaterials(res.data));
    }

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/');
    }

    // คำนวณของใกล้หมด (ต่ำกว่า 10 ชิ้น)
    const lowStockCount = materials.filter(m => m.quantity < 10).length;

    return (
        <div className="container">
            {/* Header */}
            <div style={{ textAlign: 'right', marginBottom: '10px', color: '#666', fontSize: '0.9rem' }}>
                👋 สวัสดี, <b>{currentUser?.first_name}</b> (เจ้าหน้าที่คลัง) 
                | <span style={{color: 'blue', cursor: 'pointer', textDecoration: 'underline'}} onClick={() => navigate('/change-password')}>เปลี่ยนรหัสผ่าน</span>
            </div>

            {/* Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>📦 ระบบบริหารจัดการคลังวัสดุ</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    
                    {/* ปุ่มเมนูสำหรับฝ่ายคลัง */}
                    <Link to="/inventory">
                        <button className="btn btn-primary">➕ จัดการ/เพิ่มวัสดุ</button>
                    </Link>
                    <Link to="/approvals">
                        <button className="btn btn-secondary" style={{backgroundColor: '#f59e0b', color: 'white'}}>📋 รายการขอเบิก</button>
                    </Link>
                    <Link to="/inventory-report">
                        <button className="btn btn-secondary" style={{backgroundColor: '#8b5cf6', color: 'white'}}>📊 รายงานสรุป</button>
                    </Link>
                    
                    <button className="btn" onClick={handleLogout} style={{ backgroundColor: '#ef4444', color: 'white' }}>ออกจากระบบ</button>
                </div>
            </div>

            {/* Dashboard Stats */}
            <div style={{display: 'flex', gap: '20px', marginBottom: '20px'}}>
                <div className="card" style={{flex: 1, textAlign: 'center', backgroundColor: '#eff6ff'}}>
                    <h1 style={{color: '#2563eb'}}>{materials.length}</h1>
                    <p>รายการวัสดุทั้งหมด</p>
                </div>
                <div className="card" style={{flex: 1, textAlign: 'center', backgroundColor: lowStockCount > 0 ? '#fef2f2' : '#f0fdf4'}}>
                    <h1 style={{color: lowStockCount > 0 ? '#dc2626' : '#16a34a'}}>{lowStockCount}</h1>
                    <p>{lowStockCount > 0 ? '⚠️ วัสดุใกล้หมด' : '✅ สถานะปกติ'}</p>
                </div>
            </div>

            {/* Table แสดงรายการวัสดุ */}
            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <h3 style={{padding: '15px', borderBottom: '1px solid #eee', margin: 0}}>รายการวัสดุคงคลังล่าสุด</h3>
                <table className="custom-table">
                    <thead>
                        <tr>
                            <th>รหัส</th>
                            <th>ชื่อวัสดุ</th>
                            <th style={{textAlign: 'center'}}>คงเหลือ</th>
                            <th style={{textAlign: 'center'}}>หน่วยนับ</th>
                            <th style={{textAlign: 'center'}}>สถานะ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {materials.length > 0 ? materials.map(m => (
                            <tr key={m.id}>
                                <td>{m.id}</td>
                                <td style={{fontWeight: 'bold'}}>{m.material_name}</td>
                                <td style={{textAlign: 'center', fontSize: '1.1rem', color: m.quantity < 10 ? 'red' : 'black'}}>
                                    {m.quantity}
                                </td>
                                <td style={{textAlign: 'center'}}>{m.unit}</td>
                                <td style={{textAlign: 'center'}}>
                                    {m.quantity === 0 ? 
                                        <span className="status-badge" style={{backgroundColor: '#fee2e2', color: '#dc2626'}}>หมดสต็อก</span> :
                                        m.quantity < 10 ? 
                                        <span className="status-badge" style={{backgroundColor: '#fef3c7', color: '#d97706'}}>ใกล้หมด</span> :
                                        <span className="status-badge status-done">ปกติ</span>
                                    }
                                </td>
                            </tr>
                        )) : <tr><td colSpan="5" style={{textAlign: 'center', padding: '20px'}}>ยังไม่มีข้อมูลวัสดุ</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default InventoryDashboard;