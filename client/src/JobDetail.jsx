import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from './api'; // ✅ เปลี่ยนจาก axios เป็น api
import Swal from 'sweetalert2';
import './App.css';

function JobDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [status, setStatus] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    // ✅ ดึง URL ของ Backend จาก api.js เพื่อใช้แสดงรูปภาพ
    const BACKEND_URL = api.defaults.baseURL;

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) { navigate('/'); return; }
        setCurrentUser(user);
        fetchJob();
    }, [id]);

    const fetchJob = () => {
        // ✅ เปลี่ยนเป็น api.get
        api.get('/job/' + id)
            .then(res => {
                if (res.data && res.data.length > 0) {
                    setJob(res.data[0]);
                    setStatus(res.data[0].status);
                }
            })
            .catch(err => console.log(err));
    }

    const handleBack = () => {
        if (currentUser.role === 'user') navigate('/history');
        else if (currentUser.role === 'technician') navigate('/my-tasks');
        else navigate('/dashboard');
    }

    const handleClearNewImage = () => {
        setImageFile(null);
        document.getElementById('newFileInput').value = "";
    }

    const handleUpdate = () => {
        Swal.fire({
            title: 'ยืนยันการบันทึก?',
            text: "ต้องการอัปเดตสถานะงานใช่หรือไม่?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'ยืนยัน',
            cancelButtonText: 'ยกเลิก'
        }).then((result) => {
            if (result.isConfirmed) {
                const formData = new FormData();
                formData.append('id', id);
                formData.append('status', status);
                if (imageFile) formData.append('repair_image', imageFile);

                // ✅ เปลี่ยนเป็น api.put
                api.put('/update-job', formData)
                    .then(res => {
                        if(res.data === "Success") {
                            Swal.fire('สำเร็จ', 'บันทึกข้อมูลเรียบร้อย', 'success')
                            .then(() => {
                                if(currentUser.role === 'technician') navigate('/my-tasks'); 
                                else fetchJob();
                            });
                        }
                    });
            }
        });
    }

    if (!job) return <div>Loading...</div>;

    const isUser = currentUser?.role === 'user';

    return (
        <div className="container" style={{marginTop: '20px', maxWidth:'800px'}}>
            <div className="card">
                <h2>🛠️ รายละเอียดงานซ่อม #{job.id}</h2>
                <hr style={{margin:'20px 0', borderTop:'1px solid #eee'}}/>
                
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px'}}>
                    <div>
                        <p><strong>อุปกรณ์:</strong> {job.device_name}</p>
                        <p><strong>อาการ:</strong> {job.problem_detail}</p>
                        <p><strong>สถานที่:</strong> {job.location}</p>
                        
                        {job.repair_image && (
                            <div style={{marginTop: '15px'}}>
                                <div style={{marginBottom: '5px'}}>
                                    <p style={{margin: 0}}><strong>รูปภาพปัจจุบัน:</strong></p>
                                </div>
                                {/* ✅ ปรับการแสดงรูปให้ผ่าน URL ของ ngrok */}
                                <a href={`${BACKEND_URL}/uploads/${job.repair_image}`} target="_blank" rel="noreferrer">
                                    <img 
                                        src={`${BACKEND_URL}/uploads/${job.repair_image}`} 
                                        alt="Repair" 
                                        style={{maxWidth:'100%', maxHeight:'300px', borderRadius:'8px', border:'1px solid #ddd'}}
                                    />
                                </a>
                            </div>
                        )}
                    </div>
                    <div>
                        <p><strong>ผู้แจ้ง:</strong> {job.reporter_first_name} {job.reporter_last_name}</p>
                        <p><strong>วันที่แจ้ง:</strong> {new Date(job.date_created).toLocaleString('th-TH')}</p>
                        <p><strong>สถานะ:</strong> <span className={`status-badge status-${job.status}`}>{job.status === 'done' ? '✅ เสร็จสิ้น' : job.status === 'doing' ? '🛠 กำลังซ่อม' : '⏳ รอรับเรื่อง'}</span></p>
                    </div>
                </div>

                <div style={{marginTop: '20px', padding:'20px', backgroundColor:'#f8fafc', borderRadius:'8px'}}>
                    <h3>🔧 การดำเนินการ {isUser ? '(สถานะปัจจุบัน)' : '(สำหรับช่าง)'}</h3>
                    
                    <div className="form-group">
                        <label>สถานะงาน</label>
                        <select 
                            className="input-modern" 
                            value={status} 
                            onChange={(e) => setStatus(e.target.value)}
                            disabled={isUser} 
                        >
                            <option value="pending">⏳ รอรับเรื่อง</option>
                            <option value="doing">🛠 กำลังดำเนินการซ่อม</option>
                            <option value="done">✅ ซ่อมเสร็จสิ้น / ปิดงาน</option>
                        </select>
                    </div>

                    {!isUser && (
                        <div className="form-group">
                            <label>อัปโหลดรูปภาพใหม่ (แทนที่รูปเดิม)</label>
                            
                            <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
                                <input 
                                    id="newFileInput"
                                    type="file" 
                                    className="input-modern" 
                                    accept="image/*" 
                                    onChange={(e) => setImageFile(e.target.files[0])} 
                                />
                                
                                {imageFile && (
                                    <button 
                                        type="button" 
                                        onClick={handleClearNewImage}
                                        className="btn-secondary"
                                        style={{backgroundColor: '#ef4444', color: 'white', whiteSpace: 'nowrap'}}
                                    >
                                        ❌ เอาออก
                                    </button>
                                )}
                            </div>
                            
                            {imageFile && (
                                <small style={{color: 'green', display: 'block', marginTop: '5px'}}>
                                    * กำลังเลือกไฟล์: {imageFile.name} (กดบันทึกเพื่อยืนยันการอัปโหลด)
                                </small>
                            )}
                        </div>
                    )}

                    <div style={{display:'flex', gap:'10px', marginTop:'20px'}}>
                        {!isUser && <button onClick={handleUpdate} className="btn btn-primary" style={{flex:1}}>บันทึกการเปลี่ยนแปลง</button>}
                        <button onClick={handleBack} className="btn btn-secondary" style={{flex:1}}>ย้อนกลับ</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default JobDetail;