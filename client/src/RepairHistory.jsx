import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './App.css';

function RepairHistory() {
    const [repairs, setRepairs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) { navigate('/'); return; }
        axios.get('http://localhost:3001/my-repairs/' + user.user_id).then(res => setRepairs(res.data)).catch(err => console.log(err));
    }, []);

    const filteredRepairs = repairs.filter(repair => 
        repair.device_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        repair.problem_detail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        repair.id.toString().includes(searchTerm)
    );

    return (
        <div className="container" style={{marginTop: '20px'}}>
            <h2 style={{textAlign: 'left', marginBottom: '20px'}}>📋 ประวัติการแจ้งซ่อมของฉัน</h2>
            <div className="card no-print" style={{padding:'15px', marginBottom:'20px'}}>
                <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                    <span style={{fontSize:'1.2rem'}}>🔍</span>
                    <input type="text" className="input-modern" placeholder="ค้นหา..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{maxWidth: '100%', margin: 0}} />
                </div>
            </div>

            <div className="card" style={{ padding: '0', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                <table className="custom-table">
                    <thead>
                        <tr style={{backgroundColor: '#f9fafb'}}>
                            {/* ✅ เปลี่ยนเป็น ลำดับ */}
                            <th style={{textAlign: 'center', width: '60px'}}>ลำดับ</th>
                            <th>วันที่แจ้ง</th>
                            <th>อุปกรณ์</th>
                            <th>อาการ</th>
                            <th>สถานะ</th>
                            <th style={{textAlign: 'center'}}>รายละเอียด</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRepairs.map((repair, index) => ( // ✅ รับ index
                            <tr key={repair.id}>
                                {/* ✅ แสดงลำดับ */}
                                <td style={{textAlign: 'center'}}>{index + 1}</td>
                                <td>{new Date(repair.date_created).toLocaleDateString('th-TH')}</td>
                                <td>{repair.device_name}</td>
                                <td>{repair.problem_detail}</td>
                                <td><span className={`status-badge ${repair.status === 'done' ? 'status-done' : repair.status === 'doing' ? 'status-doing' : 'status-pending'}`}>{repair.status === 'done' ? '✅ เสร็จสิ้น' : repair.status === 'doing' ? '🛠 กำลังซ่อม' : '⏳ รอรับเรื่อง'}</span></td>
                                <td style={{textAlign: 'center'}}><button className="btn-sm btn-primary" onClick={() => navigate(`/job/${repair.id}`)}>ดูข้อมูล</button></td>
                            </tr>
                        ))}
                        {filteredRepairs.length === 0 && <tr><td colSpan="6" style={{textAlign:'center', padding:'30px', color:'#999'}}>ไม่พบข้อมูลที่ค้นหา</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default RepairHistory;