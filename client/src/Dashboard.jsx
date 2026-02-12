import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './App.css';

function Dashboard() {
    const [jobs, setJobs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [technicians, setTechnicians] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();

    // Modal มอบหมายงาน
    const [assignModal, setAssignModal] = useState({ show: false, jobId: null });
    const [selectedTech, setSelectedTech] = useState('');

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !['technician', 'supervisor', 'admin'].includes(user.role)) { navigate('/'); return; }
        setCurrentUser(user);
        fetchJobs();
        if (user.role === 'supervisor' || user.role === 'admin') {
            fetchTechnicians();
        }
    }, []);

    const fetchJobs = () => {
        axios.get('http://localhost:3001/repairs').then(res => setJobs(res.data)).catch(err => console.log(err));
    }

    const fetchTechnicians = () => {
        axios.get('http://localhost:3001/technicians').then(res => setTechnicians(res.data)).catch(err => console.log(err));
    }

    const handleOpenAssign = (jobId) => {
        setAssignModal({ show: true, jobId });
        setSelectedTech('');
    }

    const handleAssignSubmit = () => {
        if (!selectedTech) { alert("กรุณาเลือกช่าง"); return; }
        
        axios.put('http://localhost:3001/assign-job', {
            repair_id: assignModal.jobId,
            technician_id: selectedTech
        }).then(res => {
            if (res.data === "Success") {
                alert("✅ มอบหมายงานสำเร็จ");
                setAssignModal({ show: false, jobId: null });
                fetchJobs();
            }
        });
    }

    const filteredJobs = jobs.filter(job => {
        const term = searchTerm.toLowerCase();
        return job.device_name.toLowerCase().includes(term) || job.problem_detail.toLowerCase().includes(term) || job.location.toLowerCase().includes(term);
    });

    return (
        <div className="container" style={{marginTop: '20px'}}>
            <h2 style={{textAlign: 'left', marginBottom: '20px'}}>🛠️ รายการงานซ่อมทั้งหมด</h2>
            <div className="card no-print" style={{padding:'15px', marginBottom:'20px'}}>
                <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                    <span style={{fontSize:'1.2rem'}}>🔍</span>
                    <input type="text" className="input-modern" placeholder="ค้นหาชื่องาน..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{maxWidth: '100%', margin: 0}} />
                </div>
            </div>

            <div className="card" style={{ padding: '0', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                <table className="custom-table">
                    <thead>
                        <tr style={{backgroundColor: '#f9fafb'}}>
                            <th style={{textAlign: 'center', width: '50px'}}>#</th>
                            <th>วันที่แจ้ง</th>
                            <th>อุปกรณ์</th>
                            <th>อาการ</th>
                            <th>สถานที่</th>
                            <th style={{textAlign:'center'}}>สถานะ</th>
                            <th style={{textAlign: 'center', width: '160px'}}>จัดการ</th> {/* ✅ เพิ่มความกว้างคอลัมน์นิดหน่อย */}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredJobs.map((job, index) => (
                            <tr key={job.id}>
                                <td style={{textAlign: 'center'}}>{index + 1}</td>
                                <td>{new Date(job.date_created).toLocaleDateString('th-TH')}</td>
                                <td>{job.device_name}</td>
                                <td style={{maxWidth:'200px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}} title={job.problem_detail}>{job.problem_detail}</td>
                                <td>{job.location}</td>
                                <td style={{textAlign:'center'}}><span className={`status-badge ${job.status === 'done' ? 'status-done' : job.status === 'doing' ? 'status-doing' : 'status-pending'}`}>{job.status === 'done' ? '✅ เสร็จสิ้น' : job.status === 'doing' ? '🛠 กำลังซ่อม' : '⏳ รอรับเรื่อง'}</span></td>
                                
                                {/* ✅ แก้ไขส่วนปุ่มจัดการ: ใช้ Flexbox + ปุ่มขนาดเล็ก */}
                                <td style={{textAlign: 'center'}}>
                                    <div style={{display: 'flex', justifyContent: 'center', gap: '5px'}}>
                                        
                                        {/* ปุ่มรายละเอียด (สีฟ้า เล็ก) */}
                                        <button 
                                            onClick={() => navigate(`/job/${job.id}`)}
                                            style={{
                                                backgroundColor: '#3b82f6', color: 'white', border: 'none',
                                                padding: '4px 8px', borderRadius: '4px', cursor: 'pointer',
                                                fontSize: '0.8rem', whiteSpace: 'nowrap'
                                            }}
                                            title="ดูรายละเอียด"
                                        >
                                            📄 รายละเอียด
                                        </button>
                                        
                                        {/* ปุ่มมอบหมายงาน (สีส้ม เล็ก) - แสดงเฉพาะตอน Pending */}
                                        {(currentUser.role === 'supervisor' || currentUser.role === 'admin') && job.status === 'pending' && (
                                            <button 
                                                onClick={() => handleOpenAssign(job.id)}
                                                style={{
                                                    backgroundColor: '#f59e0b', color: 'white', border: 'none',
                                                    padding: '4px 8px', borderRadius: '4px', cursor: 'pointer',
                                                    fontSize: '0.8rem', whiteSpace: 'nowrap', display:'flex', alignItems:'center', gap:'2px'
                                                }}
                                                title="มอบหมายงานให้ช่าง"
                                            >
                                                👷 มอบหมาย
                                            </button>
                                        )}
                                    </div>
                                </td>

                            </tr>
                        ))}
                         {filteredJobs.length === 0 && <tr><td colSpan="7" style={{textAlign:'center', padding:'20px', color:'#999'}}>ไม่มีข้อมูล</td></tr>}
                    </tbody>
                </table>
            </div>

            {/* Modal เลือกช่าง */}
            {assignModal.show && (
                <div style={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    <div style={{backgroundColor: 'white', padding: '30px', borderRadius: '16px', width: '350px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)'}}>
                        <h3 style={{marginTop:0}}>👷 เลือกช่างผู้รับผิดชอบ</h3>
                        <p style={{color:'#666', marginBottom:'20px'}}>มอบหมายงานซ่อม ID: #{assignModal.jobId}</p>
                        <div className="form-group">
                            <select className="input-modern" value={selectedTech} onChange={e => setSelectedTech(e.target.value)} style={{width:'100%'}}>
                                <option value="">-- กรุณาเลือกช่าง --</option>
                                {technicians.map(tech => (
                                    <option key={tech.id} value={tech.id}>{tech.first_name} {tech.last_name}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{display: 'flex', gap: '10px', marginTop:'20px'}}>
                            <button onClick={handleAssignSubmit} className="btn btn-primary" style={{flex: 1}}>บันทึก</button>
                            <button onClick={() => setAssignModal({show:false, jobId:null})} className="btn btn-secondary" style={{flex: 1}}>ยกเลิก</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;