import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './App.css';

function Dashboard() {
    const [jobs, setJobs] = useState([]);
    const [searchTerm, setSearchTerm] = useState(''); // ✅ เพิ่มตัวแปรสำหรับค้นหา
    const navigate = useNavigate();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) { navigate('/'); return; }
        // อนุญาตให้ Technician และ Supervisor เข้าได้
        if (!['technician', 'supervisor'].includes(user.role)) {
            navigate('/'); return;
        }
        fetchJobs();
    }, []);

    const fetchJobs = () => {
        axios.get('http://localhost:3001/repairs')
            .then(res => setJobs(res.data))
            .catch(err => console.log(err));
    }

    // ✅ ฟังก์ชันกรองข้อมูล (ค้นหาจาก ชื่ออุปกรณ์, อาการ, สถานที่, ชื่อผู้แจ้ง, หรือเลขงาน)
    const filteredJobs = jobs.filter(job => {
        const term = searchTerm.toLowerCase();
        const reporterName = `${job.reporter_first_name} ${job.reporter_last_name}`.toLowerCase();
        
        return (
            job.device_name.toLowerCase().includes(term) ||
            job.problem_detail.toLowerCase().includes(term) ||
            job.location.toLowerCase().includes(term) ||
            reporterName.includes(term) ||
            job.id.toString().includes(term)
        );
    });

    return (
        <div className="container" style={{marginTop: '20px'}}>
            
            <h2 style={{textAlign: 'left', marginBottom: '20px'}}>
                🛠️ รายการงานซ่อมทั้งหมด ({filteredJobs.length} งาน)
            </h2>

            {/* ✅ ช่องค้นหา (Search Bar) */}
            <div className="card no-print" style={{padding:'15px', marginBottom:'20px'}}>
                <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                    <span style={{fontSize:'1.2rem'}}>🔍</span>
                    <input 
                        type="text" 
                        className="input-modern" 
                        placeholder="ค้นหาชื่องาน, อาการ, สถานที่ หรือชื่อผู้แจ้ง..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{maxWidth: '100%', margin: 0}}
                    />
                </div>
            </div>

            <div className="card" style={{ padding: '0', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                <table className="custom-table">
                    <thead>
                        <tr style={{backgroundColor: '#f9fafb'}}>
                            <th>#</th>
                            <th>วันที่แจ้ง</th>
                            <th>อุปกรณ์</th>
                            <th>อาการ</th>
                            <th>สถานที่</th>
                            <th>ผู้แจ้ง</th>
                            <th>สถานะ</th>
                            <th style={{textAlign: 'center'}}>จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredJobs.map((job) => (
                            <tr key={job.id}>
                                <td>{job.id}</td>
                                <td>{new Date(job.date_created).toLocaleDateString('th-TH')}</td>
                                <td>{job.device_name}</td>
                                <td>{job.problem_detail}</td>
                                <td>{job.location}</td>
                                
                                {/* แสดงชื่อผู้แจ้ง */}
                                <td>
                                    {job.reporter_first_name 
                                        ? `${job.reporter_first_name} ${job.reporter_last_name}`
                                        : <span style={{color:'#999'}}>ไม่ระบุ</span>
                                    }
                                </td>

                                <td>
                                    <span className={`status-badge ${job.status === 'done' ? 'status-done' : job.status === 'doing' ? 'status-doing' : 'status-pending'}`}>
                                        {job.status === 'done' ? '✅ เสร็จสิ้น' : job.status === 'doing' ? '🛠 กำลังซ่อม' : '⏳ รอรับเรื่อง'}
                                    </span>
                                </td>
                                <td style={{textAlign: 'center'}}>
                                    <button 
                                        className="btn-sm btn-primary"
                                        onClick={() => navigate(`/job/${job.id}`)}
                                    >
                                        รายละเอียด
                                    </button>
                                </td>
                            </tr>
                        ))}
                         {filteredJobs.length === 0 && <tr><td colSpan="8" style={{textAlign:'center', padding:'30px', color:'#999'}}>ไม่พบข้อมูลที่ค้นหา</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Dashboard;