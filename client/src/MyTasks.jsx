import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './App.css';

function MyTasks() {
    const [jobs, setJobs] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || user.role !== 'technician') { navigate('/'); return; }
        
        // ดึงงานเฉพาะของช่างคนนี้
        axios.get('http://localhost:3001/technician-jobs/' + user.user_id)
            .then(res => setJobs(res.data))
            .catch(err => console.log(err));
    }, []);

    return (
        <div className="container" style={{marginTop: '20px'}}>
            <h2 style={{textAlign: 'left', marginBottom: '20px', color: '#2563eb'}}>
                🛠️ งานของฉัน (Assigned to Me) - {jobs.length} งาน
            </h2>

            <div className="card" style={{ padding: '0', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                <table className="custom-table">
                    <thead>
                        <tr style={{backgroundColor: '#eff6ff'}}> {/* สีหัวตารางต่างจากหน้าหลักนิดหน่อย */}
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
                        {jobs.map((job) => (
                            <tr key={job.id}>
                                <td>{new Date(job.date_created).toLocaleDateString('th-TH')}</td>
                                <td>{job.device_name}</td>
                                <td>{job.problem_detail}</td>
                                <td>{job.location}</td>
                                <td>{job.reporter_first_name} {job.reporter_last_name}</td>
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
                                        อัปเดตงาน
                                    </button>
                                </td>
                            </tr>
                        ))}
                         {jobs.length === 0 && <tr><td colSpan="7" style={{textAlign:'center', padding:'30px', color:'#888'}}>คุณยังไม่มีงานที่รับผิดชอบ</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default MyTasks;