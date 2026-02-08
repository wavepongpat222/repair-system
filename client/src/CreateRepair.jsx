import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './App.css';

function CreateRepair() {
    const [device, setDevice] = useState('');
    const [problem, setProblem] = useState('');
    const [location, setLocation] = useState('');
    const [file, setFile] = useState(null); // State เก็บไฟล์รูป
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // ดึงข้อมูล User จาก LocalStorage
        const user = JSON.parse(localStorage.getItem('user'));
        if(!user) {
            alert("กรุณา Login ใหม่");
            navigate('/');
            return;
        }

        // ใช้ FormData สำหรับส่งไฟล์
        const formData = new FormData();
        formData.append('device_name', device);
        formData.append('problem_detail', problem);
        formData.append('location', location);
        formData.append('reporter_id', user.user_id); // ส่ง ID คนแจ้ง
        if (file) {
            formData.append('image', file); // แนบไฟล์
        }

        axios.post('http://localhost:3001/create-repair', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(res => {
            if(res.data === "Success") {
                alert("แจ้งซ่อมสำเร็จ ✅");
                navigate('/dashboard');
            } else {
                alert("เกิดข้อผิดพลาด");
            }
        })
        .catch(err => console.log(err));
    }

    return (
        <div className="container" style={{maxWidth: '600px', marginTop: '50px'}}>
            <div className="card">
                <h2>📝 แจ้งซ่อมพัสดุ/ครุภัณฑ์</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>ชื่ออุปกรณ์ / หมายเลขเครื่อง</label>
                        <input type="text" className="form-control" required onChange={(e) => setDevice(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>อาการที่ชำรุด</label>
                        <textarea className="form-control" required onChange={(e) => setProblem(e.target.value)} rows="3"></textarea>
                    </div>
                    <div className="form-group">
                        <label>สถานที่ / ห้อง</label>
                        <input type="text" className="form-control" required onChange={(e) => setLocation(e.target.value)} />
                    </div>
                    
                    {/* ช่องอัปโหลดรูปภาพ */}
                    <div className="form-group">
                        <label>รูปภาพประกอบ (ถ้ามี)</label>
                        <input type="file" className="form-control" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
                    </div>

                    <div style={{display: 'flex', gap: '10px', marginTop: '20px'}}>
                        <button type="submit" className="btn btn-primary" style={{flex: 1}}>ยืนยันแจ้งซ่อม</button>
                        <button type="button" className="btn btn-secondary" style={{flex: 1}} onClick={() => navigate('/dashboard')}>ยกเลิก</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateRepair;