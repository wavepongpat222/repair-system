import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from './api';
import Swal from 'sweetalert2';
import './App.css';

// ✅ คอมโพเนนต์พิเศษ: โหลดรูปผ่าน API เพื่อทะลุบล็อก ngrok
const SecureImage = ({ fileName, altText }) => {
    const [imgUrl, setImgUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!fileName) return;

        // เรียก API ไปดึงรูปมาเป็น Blob (ไฟล์ดิบ)
        api.get(`/uploads/${fileName}`, { responseType: 'blob' })
            .then(res => {
                // แปลงไฟล์ดิบเป็น URL ที่แสดงบนหน้าเว็บได้
                const objectUrl = URL.createObjectURL(res.data);
                setImgUrl(objectUrl);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error loading image:", err);
                setError(true);
                setLoading(false);
            });

        // Cleanup function
        return () => {
            if (imgUrl) URL.revokeObjectURL(imgUrl);
        };
    }, [fileName]);

    if (error) return (
        <div style={{width:'100%', height:'200px', background:'#f3f4f6', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'8px', border:'1px dashed #ccc', color:'#999', flexDirection:'column'}}>
            <span style={{fontSize:'30px'}}>🖼️</span>
            <span style={{fontSize:'12px'}}>โหลดรูปไม่ได้</span>
        </div>
    );

    if (loading) return (
        <div style={{width:'100%', height:'200px', background:'#f3f4f6', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'8px'}}>
            <span style={{fontSize:'12px', color:'#666'}}>⏳ กำลังโหลดรูป...</span>
        </div>
    );

    return (
        <img 
            src={imgUrl} 
            alt={altText} 
            style={{maxWidth:'100%', maxHeight:'250px', borderRadius:'4px', objectFit:'contain', border:'1px solid #ddd'}} 
        />
    );
};

function JobDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    
    const [status, setStatus] = useState('');
    const [afterImage, setAfterImage] = useState(null); 
    const [previewAfter, setPreviewAfter] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) { navigate('/'); return; }
        setCurrentUser(user);
        fetchJob();
    }, []);

    const fetchJob = () => {
        api.get('/job/' + id).then(res => {
            if (res.data && res.data.length > 0) {
                setJob(res.data[0]);
                setStatus(res.data[0].status);
            }
        }).catch(err => console.log(err));
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAfterImage(file);
            setPreviewAfter(URL.createObjectURL(file));
        }
    }

    const handleRemovePreview = () => {
        setAfterImage(null);
        setPreviewAfter(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    const handleUpdate = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('id', id);
        formData.append('status', status);
        if (afterImage) formData.append('after_image', afterImage);

        api.put('/update-job', formData).then(res => {
            if (res.data === "Success") {
                Swal.fire('สำเร็จ', 'อัปเดตงานเรียบร้อย', 'success');
                fetchJob();
                handleRemovePreview();
            }
        }).catch(err => {
            Swal.fire('Error', 'เกิดข้อผิดพลาด', 'error');
        });
    }

    if (!job) return <div className="container" style={{marginTop:'20px'}}>⏳ กำลังโหลด...</div>;

    return (
        <div className="container" style={{marginTop:'20px'}}>
            <button className="btn btn-secondary no-print" onClick={() => navigate(-1)} style={{marginBottom:'20px'}}>⬅ ย้อนกลับ</button>
            
            <div className="card">
                <h2>📄 รายละเอียดงานซ่อม #{job.id}</h2>
                <hr style={{margin:'15px 0', borderTop:'1px solid #eee'}} />
                
                <div style={{display:'flex', flexWrap:'wrap', gap:'20px'}}>
                    <div style={{flex:1, minWidth:'300px'}}>
                        <p><strong>อุปกรณ์:</strong> {job.device_name}</p>
                        <p><strong>อาการ:</strong> {job.problem_detail}</p>
                        <p><strong>สถานที่:</strong> {job.location}</p>
                        <p><strong>ผู้แจ้ง:</strong> {job.reporter_first_name} {job.reporter_last_name}</p>
                        <p><strong>วันที่แจ้ง:</strong> {new Date(job.date_created).toLocaleString('th-TH')}</p>
                        <p><strong>สถานะ:</strong> <span className={`status-badge status-${job.status}`}>{job.status.toUpperCase()}</span></p>
                    </div>

                    <div style={{flex:1, minWidth:'300px', display:'flex', flexDirection:'column', gap:'15px'}}>
                        
                        {/* รูปก่อนซ่อม (ใช้ SecureImage) */}
                        <div style={{border:'1px solid #eee', padding:'10px', borderRadius:'8px', textAlign:'center', background:'#fff'}}>
                            <p style={{fontWeight:'bold', color:'#ef4444', marginBottom:'10px'}}>❌ ภาพก่อนซ่อม (Before)</p>
                            {job.before_image ? (
                                <SecureImage fileName={job.before_image} altText="Before Image" />
                            ) : <p style={{color:'#ccc'}}>ไม่มีรูปภาพ</p>}
                        </div>
                        
                        {/* รูปหลังซ่อม (ใช้ SecureImage) */}
                        <div style={{border:'1px solid #eee', padding:'10px', borderRadius:'8px', textAlign:'center', background:'#fff'}}>
                            <p style={{fontWeight:'bold', color:'#10b981', marginBottom:'10px'}}>✅ ภาพหลังซ่อม (After)</p>
                            {job.after_image ? (
                                <SecureImage fileName={job.after_image} altText="After Image" />
                            ) : <p style={{color:'#ccc'}}>ยังไม่มีรูปปิดงาน</p>}
                        </div>

                    </div>
                </div>

                {(currentUser.role === 'technician' || currentUser.role === 'admin') && (
                    <div className="no-print" style={{marginTop:'30px', background:'#f8fafc', padding:'20px', borderRadius:'12px', border:'1px solid #e2e8f0'}}>
                        <h3 style={{marginTop:0}}>🛠️ อัปเดตสถานะงาน</h3>
                        <form onSubmit={handleUpdate}>
                            <div className="form-group">
                                <label>เปลี่ยนสถานะ:</label>
                                <select className="input-modern" value={status} onChange={e => setStatus(e.target.value)}>
                                    <option value="pending">⏳ รอรับเรื่อง</option>
                                    <option value="doing">🛠 กำลังดำเนินการ</option>
                                    <option value="done">✅ เสร็จสิ้น</option>
                                </select>
                            </div>

                            <div className="form-group" style={{marginTop:'15px'}}>
                                <label>📸 อัปโหลดรูปหลังซ่อม (After):</label>
                                <input type="file" className="input-modern" onChange={handleFileChange} ref={fileInputRef} accept="image/*" />
                                {previewAfter && (
                                    <div style={{marginTop:'15px', position:'relative', display:'inline-block'}}>
                                        <img src={previewAfter} alt="Preview" style={{maxHeight:'150px', borderRadius:'8px', border:'2px solid #3b82f6'}} />
                                        <button type="button" onClick={handleRemovePreview} style={{position: 'absolute', top: '-10px', right: '-10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '25px', height: '25px', cursor: 'pointer', fontWeight: 'bold'}}>✕</button>
                                    </div>
                                )}
                            </div>
                            <button type="submit" className="btn btn-primary" style={{marginTop:'15px', width:'100%'}}>บันทึกการเปลี่ยนแปลง</button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}

export default JobDetail;