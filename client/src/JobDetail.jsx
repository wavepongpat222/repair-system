import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './App.css';

function JobDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    // เพิ่ม State สำหรับสถานะและรายละเอียดการซ่อม (เผื่อช่างต้องอัปเดต)
    const [status, setStatus] = useState('');
    const [repairDetails, setRepairDetails] = useState('');
    const [imageAfter, setImageAfter] = useState(null);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) { navigate('/'); return; }
        setCurrentUser(user);

        // ดึงข้อมูลงานซ่อม
        axios.get('http://localhost:3001/repair/' + id)
            .then(res => {
                setJob(res.data);
                setStatus(res.data.status);
                setRepairDetails(res.data.repair_details || '');
            })
            .catch(err => console.log(err));
    }, [id, navigate]);

    // --- ฟังก์ชัน "ย้อนกลับ" แบบฉลาด (เช็ค Role) ---
    const handleBack = () => {
        if (!currentUser) {
            navigate('/');
            return;
        }

        switch (currentUser.role) {
            case 'admin':
                navigate('/admin-dashboard');
                break;
            case 'technician':
            case 'supervisor':
                navigate('/dashboard'); // ช่าง/หัวหน้าช่าง กลับไปหน้างานซ่อม
                break;
            case 'inventory':
                navigate('/inventory-dashboard');
                break;
            case 'user':
                navigate('/history'); // User กลับไปหน้าประวัติ
                break;
            default:
                navigate('/');
        }
    };

    // ฟังก์ชันอัปเดตงาน (สำหรับช่าง)
    const handleUpdateJob = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('id', id);
        formData.append('status', status);
        formData.append('repair_details', repairDetails);
        if (imageAfter) {
            formData.append('image_after', imageAfter);
        }

        axios.put('http://localhost:3001/update-repair-job', formData)
            .then(res => {
                if (res.data === "Success") {
                    alert("บันทึกการซ่อมเรียบร้อย ✅");
                    navigate('/dashboard'); // บันทึกเสร็จกลับไปหน้า Dashboard ช่าง
                }
            })
            .catch(err => console.log(err));
    };

    if (!job) return <div className="container" style={{textAlign:'center', marginTop:'50px'}}>กำลังโหลดข้อมูล...</div>;

    return (
        <div className="container" style={{ marginTop: '20px', paddingBottom: '40px' }}>
            
            {/* ปุ่มย้อนกลับ */}
            <button 
                onClick={handleBack} 
                className="btn-secondary no-print"
                style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '5px' }}
            >
                ⬅️ ย้อนกลับ
            </button>

            <div className="card">
                <h2 style={{ borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                    🛠️ รายละเอียดใบแจ้งซ่อม #{job.id}
                </h2>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px' }}>
                    {/* ข้อมูลฝั่งซ้าย (รายละเอียดปัญหา) */}
                    <div style={{ flex: 1, minWidth: '300px' }}>
                        <p><strong>📅 วันที่แจ้ง:</strong> {new Date(job.date_created).toLocaleDateString('th-TH')} {new Date(job.date_created).toLocaleTimeString('th-TH')}</p>
                        <p><strong>👤 ผู้แจ้ง:</strong> {job.reporter_first_name} {job.reporter_last_name}</p>
                        <p><strong>💻 อุปกรณ์:</strong> <span style={{color:'#3b82f6', fontWeight:'bold'}}>{job.device_name}</span></p>
                        <p><strong>📍 สถานที่:</strong> {job.location}</p>
                        <div style={{ background: '#f9fafb', padding: '15px', borderRadius: '8px', marginTop: '10px' }}>
                            <strong>อาการเสีย:</strong>
                            <p style={{ margin: '5px 0 0 0', color: '#374151' }}>{job.problem_detail}</p>
                        </div>

                        {/* รูปภาพก่อนซ่อม */}
                        {job.repair_image && (
                            <div style={{ marginTop: '20px' }}>
                                <strong>รูปภาพประกอบ (ก่อนซ่อม):</strong><br />
                                <img 
                                    src={`http://localhost:3001/uploads/${job.repair_image}`} 
                                    alt="Before" 
                                    style={{ maxWidth: '100%', borderRadius: '8px', marginTop: '10px', maxHeight: '300px', border: '1px solid #ddd' }} 
                                />
                            </div>
                        )}
                    </div>

                    {/* ข้อมูลฝั่งขวา (ส่วนการซ่อมของช่าง) */}
                    <div style={{ flex: 1, minWidth: '300px', borderLeft: '1px solid #eee', paddingLeft: '20px' }}>
                        <h4 style={{ marginTop: 0 }}>🔧 ส่วนของเจ้าหน้าที่/ช่าง</h4>
                        
                        {/* ถ้าเป็นช่าง หรือ Admin ให้แสดงฟอร์มแก้ไข */}
                        {['technician', 'supervisor', 'admin'].includes(currentUser?.role) ? (
                            <form onSubmit={handleUpdateJob}>
                                <div className="form-group">
                                    <label>สถานะงานปัจจุบัน</label>
                                    <select 
                                        className="input-modern" 
                                        value={status} 
                                        onChange={e => setStatus(e.target.value)}
                                    >
                                        <option value="pending">⏳ รอรับเรื่อง</option>
                                        <option value="doing">🛠 กำลังซ่อม</option>
                                        <option value="done">✅ ซ่อมเสร็จสิ้น</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>รายละเอียดการแก้ไข / สาเหตุ</label>
                                    <textarea 
                                        className="input-modern" 
                                        rows="4" 
                                        value={repairDetails} 
                                        onChange={e => setRepairDetails(e.target.value)}
                                        placeholder="ระบุสิ่งที่ทำไป หรืออะไหล่ที่เปลี่ยน..."
                                    ></textarea>
                                </div>

                                <div className="form-group">
                                    <label>รูปภาพหลังซ่อมเสร็จ (ถ้ามี)</label>
                                    <div className="file-input-wrapper">
                                        <input type="file" onChange={e => setImageAfter(e.target.files[0])} />
                                    </div>
                                </div>

                                <button type="submit" className="btn btn-primary" style={{width: '100%'}}>
                                    💾 บันทึกผลการซ่อม
                                </button>
                            </form>
                        ) : (
                            // ถ้าเป็น User ทั่วไป ให้ดูได้อย่างเดียว
                            <div>
                                <p><strong>สถานะ:</strong> 
                                    <span className={`status-badge ${job.status === 'done' ? 'status-done' : job.status === 'doing' ? 'status-doing' : 'status-pending'}`} style={{marginLeft:'10px'}}>
                                        {job.status === 'done' ? 'เสร็จสิ้น' : job.status === 'doing' ? 'กำลังซ่อม' : 'รอรับเรื่อง'}
                                    </span>
                                </p>
                                <div style={{ background: '#f0fdf4', padding: '15px', borderRadius: '8px', marginTop: '10px', border:'1px solid #dcfce7' }}>
                                    <strong>ผลการซ่อม:</strong>
                                    <p style={{ margin: '5px 0 0 0' }}>{job.repair_details || "-"}</p>
                                </div>
                            </div>
                        )}

                        {/* รูปภาพหลังซ่อม (แสดงให้ทุกคนเห็นถ้ามี) */}
                        {job.repair_image_after && (
                            <div style={{ marginTop: '20px' }}>
                                <strong>รูปภาพหลังซ่อม:</strong><br />
                                <img 
                                    src={`http://localhost:3001/uploads/${job.repair_image_after}`} 
                                    alt="After" 
                                    style={{ maxWidth: '100%', borderRadius: '8px', marginTop: '10px', maxHeight: '300px', border: '1px solid #ddd' }} 
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default JobDetail;