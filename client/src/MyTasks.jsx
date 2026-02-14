import { useEffect, useState } from 'react';
import api from './api';
import { useNavigate } from 'react-router-dom';
import './App.css';

function MyTasks() {
    const [jobs, setJobs] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();

    // ✅ State สำหรับ Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || user.role !== 'technician') { navigate('/'); return; }
        setCurrentUser(user);
        
        api.get('/technician-jobs/' + user.user_id)
            .then(res => setJobs(Array.isArray(res.data) ? res.data : []))
            .catch(err => console.log(err));
    }, [navigate]);

    const handlePrintJobs = () => { window.print(); }

    // --- Logic Pagination ---
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentJobs = jobs.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(jobs.length / itemsPerPage);

    return (
        <div className="container" style={{marginTop: '20px'}}>
            <div className="no-print" style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                <h2 style={{color: '#2563eb', margin:0}}>🛠️ งานของฉัน (Assigned Tasks)</h2>
                <button onClick={handlePrintJobs} className="btn btn-secondary">🖨️ พิมพ์รายงาน</button>
            </div>

            <div className="only-print" style={{display:'none', textAlign:'center', marginBottom:'20px'}}>
                <h1>รายงานการปฏิบัติงานซ่อมบำรุง</h1>
                <h3>ช่างผู้ปฏิบัติงาน: {currentUser?.first_name} {currentUser?.last_name}</h3>
                <p>วันที่พิมพ์: {new Date().toLocaleDateString('th-TH')}</p>
                <hr />
            </div>

            <div className="card" style={{ padding: '0', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                <table className="custom-table">
                    <thead>
                        <tr style={{backgroundColor: '#eff6ff'}}>
                            <th style={{textAlign: 'center', width: '60px'}}>ลำดับ</th>
                            <th>วันที่แจ้ง</th>
                            <th>อุปกรณ์</th>
                            <th>อาการ</th>
                            <th>สถานที่</th>
                            <th>สถานะ</th>
                            <th style={{textAlign: 'center'}} className="no-print">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentJobs.map((job, index) => (
                            <tr key={job.id}>
                                <td style={{textAlign: 'center'}}>{indexOfFirstItem + index + 1}</td>
                                <td>{new Date(job.date_created).toLocaleDateString('th-TH')}</td>
                                <td>{job.device_name}</td>
                                <td>{job.problem_detail}</td>
                                <td>{job.location}</td>
                                <td><span className={`status-badge ${job.status === 'done' ? 'status-done' : job.status === 'doing' ? 'status-doing' : 'status-pending'}`}>{job.status === 'done' ? '✅ เสร็จสิ้น' : job.status === 'doing' ? '🛠 กำลังซ่อม' : '⏳ รอรับเรื่อง'}</span></td>
                                <td style={{textAlign: 'center'}} className="no-print">
                                    {/* ✅ ปรับเป็นปุ่ม btn-sm และใส่ใน action-group */}
                                    <div className="action-group">
                                        <button className="btn-sm btn-view" onClick={() => navigate(`/job/${job.id}`)}>
                                            🛠️ อัปเดตงาน
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                         {currentJobs.length === 0 && <tr><td colSpan="7" style={{textAlign:'center', padding:'30px', color:'#888'}}>คุณยังไม่มีงานที่รับผิดชอบ</td></tr>}
                    </tbody>
                </table>

                {/* ✅ Pagination Controls */}
                {totalPages > 1 && (
                    <div className="no-print" style={{display:'flex', justifyContent:'center', padding:'20px', gap:'15px', alignItems:'center', background:'#fafafa', borderTop:'1px solid #eee'}}>
                        <button className="btn-sm btn-secondary" disabled={currentPage===1} onClick={()=>setCurrentPage(p=>p-1)}>&lt; ก่อนหน้า</button>
                        <span style={{fontWeight:'500', color:'#555'}}> หน้า {currentPage} จาก {totalPages} </span>
                        <button className="btn-sm btn-secondary" disabled={currentPage===totalPages} onClick={()=>setCurrentPage(p=>p+1)}>ถัดไป &gt;</button>
                    </div>
                )}
            </div>
        </div>
    );
}
export default MyTasks;