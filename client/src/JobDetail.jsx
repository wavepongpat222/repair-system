import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2'; // ✅ Use SweetAlert2
import './App.css';

function JobDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [status, setStatus] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) { navigate('/'); return; }
        setCurrentUser(user);
        fetchJob();
    }, [id]);

    const fetchJob = () => {
        axios.get('http://localhost:3001/job/' + id)
            .then(res => {
                if (res.data && res.data.length > 0) {
                    setJob(res.data[0]);
                    setStatus(res.data[0].status);
                }
            })
            .catch(err => console.log(err));
    }

    const handleBack = () => {
        // ✅ แก้ปุ่มย้อนกลับตาม Role
        if (currentUser.role === 'user') navigate('/history');
        else if (currentUser.role === 'technician') navigate('/my-tasks');
        else navigate('/dashboard'); // Super/Admin ไป Dashboard
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
                if (imageFile) formData.append('repair_image', imageFile); // ✅ รูปหลังซ่อม (เฉพาะช่าง)

                axios.put('http://localhost:3001/update-job', formData)
                    .then(res => {
                        if(res.data === "Success") {
                            Swal.fire('สำเร็จ', 'บันทึกข้อมูลเรียบร้อย', 'success')
                            .then(() => {
                                // ✅ ช่างบันทึกแล้วเด้งกลับงานของฉัน
                                if(currentUser.role === 'technician') navigate('/my-tasks'); 
                                else fetchJob();
                            });
                        }
                    });
            }
        });
    }

    const handleDeleteImage = () => {
        Swal.fire({
            title: 'ลบรูปภาพ?',
            text: "คุณต้องการลบรูปภาพนี้ใช่หรือไม่?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'ลบเลย'
        }).then((result) => {
            if (result.isConfirmed) {
                axios.put('http://localhost:3001/delete-job-image', { id: id })
                    .then(res => { 
                        if(res.data === "Success") { 
                            Swal.fire('ลบแล้ว', 'รูปภาพถูกลบเรียบร้อย', 'success');
                            fetchJob(); 
                        } 
                    });
            }
        });
    }

    if (!job) return <div>Loading...</div>;

    // ✅ เช็คว่าเป็น User หรือไม่ (ถ้าใช่ ให้เป็น Read-only)
    const isUser = currentUser?.role === 'user';

    return (
        <div className="container" style={{marginTop: '20px', maxWidth:'800px'}}>
            <div className="card">
                <h2>🛠️ รายละเอียดงานซ่อม #{job.id}</h2>
                <hr style={{margin:'20px 0', borderTop:'1px solid #eee'}}/>
                
                {/* ข้อมูลทั่วไป (User เห็นเหมือนเดิม) */}
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px'}}>
                    <div>
                        <p><strong>อุปกรณ์:</strong> {job.device_name}</p>
                        <p><strong>อาการ:</strong> {job.problem_detail}</p>
                        <p><strong>สถานที่:</strong> {job.location}</p>
                        {/* ✅ โชว์รูปตอนแจ้งซ่อม (ถ้ามี) */}
                        {job.repair_image_before && ( /* ต้องแก้ backend ให้ส่ง repair_image (original) มาด้วย หรือใช้ field เดิม */ 
                            <div>
                                <p><strong>รูปแจ้งซ่อม:</strong></p>
                                <img src={`http://localhost:3001/uploads/${job.repair_image}`} alt="Before" style={{maxWidth:'100%', borderRadius:'8px'}}/>
                            </div>
                        )}
                    </div>
                    <div>
                        <p><strong>ผู้แจ้ง:</strong> {job.reporter_first_name} {job.reporter_last_name}</p>
                        <p><strong>วันที่แจ้ง:</strong> {new Date(job.date_created).toLocaleString('th-TH')}</p>
                        <p><strong>สถานะ:</strong> <span className={`status-badge status-${job.status}`}>{job.status}</span></p>
                    </div>
                </div>

                {/* ส่วนดำเนินการ (ซ่อนหรือ Read-only สำหรับ User) */}
                <div style={{marginTop: '20px', padding:'20px', backgroundColor:'#f8fafc', borderRadius:'8px'}}>
                    <h3>🔧 การดำเนินการ {isUser ? '(ดูเท่านั้น)' : '(สำหรับช่าง)'}</h3>
                    
                    <div className="form-group">
                        <label>สถานะงาน</label>
                        <select 
                            className="input-modern" 
                            value={status} 
                            onChange={(e) => setStatus(e.target.value)}
                            disabled={isUser} // ✅ User ห้ามแก้
                        >
                            <option value="pending">⏳ รอรับเรื่อง</option>
                            <option value="doing">🛠 กำลังดำเนินการซ่อม</option>
                            <option value="done">✅ ซ่อมเสร็จสิ้น / ปิดงาน</option>
                        </select>
                    </div>

                    {!isUser && ( // ✅ User ไม่เห็นช่องอัปโหลดรูปหลังซ่อม
                        <div className="form-group">
                            <label>รูปภาพหลังซ่อม (Update)</label>
                            {/* Logic รูปภาพเดิม ... */}
                            {job.repair_image && job.status === 'done' && ( /* สมมติว่าเก็บรูปหลังซ่อมทับรูปเดิม หรือมี field ใหม่ */
                               <div style={{marginBottom:'10px'}}>
                                   <img src={`http://localhost:3001/uploads/${job.repair_image}`} width="150"/>
                                   <button onClick={handleDeleteImage} className="btn-sm btn-logout-red">ลบรูป</button>
                               </div>
                            )}
                            <input type="file" className="input-modern" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
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