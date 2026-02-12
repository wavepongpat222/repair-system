import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

function JobDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [status, setStatus] = useState('');
    const [imageFile, setImageFile] = useState(null);
    
    // เพิ่ม State เช็ค Error
    const [error, setError] = useState(null);

    // Modal State
    const [modalConfig, setModalConfig] = useState({ show: false, type: '', title: '', message: '' });

    useEffect(() => {
        if (!id) {
            setError("ไม่พบรหัสงานซ่อม (Invalid ID)");
            return;
        }
        fetchJob();
    }, [id]);

    const fetchJob = () => {
        axios.get('http://localhost:3001/job/' + id)
            .then(res => {
                // ✅ เช็คก่อนว่ามีข้อมูลไหม
                if (res.data && res.data.length > 0) {
                    setJob(res.data[0]);
                    setStatus(res.data[0].status);
                } else {
                    // ถ้า Server ตอบกลับมาแต่ไม่มีข้อมูล (Array ว่าง)
                    setError("ไม่พบข้อมูลงานซ่อมนี้ในระบบ (อาจถูกลบไปแล้ว)");
                }
            })
            .catch(err => {
                console.log(err);
                setError("เชื่อมต่อฐานข้อมูลไม่ได้ หรือ Server ยังไม่เปิด");
            });
    }

    const handleUpdate = () => {
        setModalConfig({ show: true, type: 'confirm', title: 'ยืนยันการบันทึก?', message: 'ต้องการอัปเดตสถานะงานใช่หรือไม่?' });
    }

    const confirmUpdate = () => {
        const formData = new FormData();
        formData.append('id', id);
        formData.append('status', status);
        if (imageFile) formData.append('repair_image', imageFile);

        axios.put('http://localhost:3001/update-job', formData)
            .then(res => {
                if(res.data === "Success") {
                    setModalConfig({ show: false, type: '', title: '', message: '' });
                    alert("✅ บันทึกข้อมูลเรียบร้อย");
                    fetchJob();
                }
            })
            .catch(err => console.log(err));
    }

    const handleDeleteImage = () => {
        if (confirm("ต้องการลบรูปภาพนี้ใช่หรือไม่?")) {
            axios.put('http://localhost:3001/delete-job-image', { id: id })
                .then(res => { if(res.data === "Success") { alert("ลบรูปภาพเรียบร้อย"); fetchJob(); } });
        }
    }

    const clearNewImage = () => {
        setImageFile(null);
        document.getElementById('fileInput').value = "";
    }

    // ❌ ส่วนที่แก้: ถ้ามี Error ให้แสดง Error แทน Loading
    if (error) {
        return (
            <div className="container" style={{marginTop: '50px', textAlign:'center'}}>
                <div className="card" style={{borderColor: 'red'}}>
                    <h2 style={{color:'red'}}>❌ เกิดข้อผิดพลาด</h2>
                    <p style={{fontSize:'1.2rem'}}>{error}</p>
                    <button onClick={() => navigate('/my-tasks')} className="btn btn-primary" style={{marginTop:'20px'}}>
                        🔙 กลับไปหน้ารายการงาน
                    </button>
                </div>
            </div>
        );
    }

    if (!job) return <div style={{marginTop:'50px', textAlign:'center'}}>⏳ กำลังโหลดข้อมูล...</div>;

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
                    </div>
                    <div>
                        <p><strong>ผู้แจ้ง:</strong> {job.reporter_first_name} {job.reporter_last_name}</p>
                        <p><strong>เบอร์โทร:</strong> {job.reporter_phone || '-'}</p>
                        <p><strong>วันที่แจ้ง:</strong> {new Date(job.date_created).toLocaleString('th-TH')}</p>
                    </div>
                </div>

                <div style={{marginTop: '20px', padding:'20px', backgroundColor:'#f8fafc', borderRadius:'8px'}}>
                    <h3>🔧 การดำเนินการ (สำหรับช่าง)</h3>
                    
                    <div className="form-group">
                        <label>สถานะงานปัจจุบัน</label>
                        <select className="input-modern" value={status} onChange={(e) => setStatus(e.target.value)}>
                            <option value="pending">⏳ รอรับเรื่อง</option>
                            <option value="doing">🛠 กำลังดำเนินการซ่อม</option>
                            <option value="done">✅ ซ่อมเสร็จสิ้น / ปิดงาน</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>รูปภาพหลังซ่อม</label>
                        
                        {job.repair_image && (
                            <div style={{marginBottom: '10px', position:'relative', display:'inline-block'}}>
                                <img src={`http://localhost:3001/uploads/${job.repair_image}`} alt="Repair" style={{maxWidth: '200px', borderRadius:'8px', border:'1px solid #ddd'}} />
                                <button onClick={handleDeleteImage} style={{position: 'absolute', top: '-10px', right: '-10px', backgroundColor: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer'}}>✕</button>
                            </div>
                        )}

                        <div style={{display:'flex', gap:'10px'}}>
                            <input id="fileInput" type="file" className="input-modern" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
                            {imageFile && <button onClick={clearNewImage} className="btn btn-secondary">ยกเลิกรูป</button>}
                        </div>
                    </div>

                    <div style={{display:'flex', gap:'10px', marginTop:'20px'}}>
                        <button onClick={handleUpdate} className="btn btn-primary" style={{flex:1}}>บันทึกการเปลี่ยนแปลง</button>
                        <button onClick={() => navigate('/my-tasks')} className="btn btn-secondary" style={{flex:1}}>ย้อนกลับ</button>
                    </div>
                </div>
            </div>

            {modalConfig.show && (
                <div className="modal-overlay" style={modalOverlayStyle}>
                    <div className="modal-box" style={modalBoxStyle}>
                        <div style={{fontSize: '3rem', marginBottom: '10px'}}>💾</div>
                        <h3 style={{marginTop: 0}}>{modalConfig.title}</h3>
                        <p style={{color: '#666', marginBottom: '25px'}}>{modalConfig.message}</p>
                        <div style={{display: 'flex', gap: '10px'}}>
                            <button onClick={confirmUpdate} className="btn btn-primary" style={{flex: 1}}>ยืนยัน</button>
                            <button onClick={() => setModalConfig({...modalConfig, show: false})} className="btn btn-secondary" style={{flex: 1}}>ยกเลิก</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' };
const modalBoxStyle = { backgroundColor: 'white', padding: '30px', borderRadius: '16px', width: '90%', maxWidth: '350px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' };

export default JobDetail;