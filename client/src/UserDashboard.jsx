import { useState, useEffect } from 'react';
import api from './api';
import { useNavigate } from 'react-router-dom';
import './App.css';

function UserDashboard() {
    const [deviceName, setDeviceName] = useState('');
    const [problemDetail, setProblemDetail] = useState('');
    const [location, setLocation] = useState('');
    const [beforeImage, setBeforeImage] = useState(null); // ✅ เปลี่ยนชื่อตัวแปร
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) { navigate('/'); } 
        else { setCurrentUser(user); }
    }, [navigate]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('user_id', currentUser.user_id);
        formData.append('device_name', deviceName);
        formData.append('problem_detail', problemDetail);
        formData.append('location', location);
        
        // ✅ ส่งเป็น key 'before_image'
        if (beforeImage) formData.append('before_image', beforeImage);

        api.post('/add-repair', formData)
            .then(res => {
                if(res.data === "Success") {
                    alert("บันทึกข้อมูลเรียบร้อย ✅");
                    navigate('/history'); 
                } else {
                    alert("เกิดข้อผิดพลาด");
                }
            })
            .catch(err => console.log(err));
    }

    return (
        <div className="page-background">
            <div className="form-card-container" style={{marginTop:'30px'}}>
                <div className="form-header">
                    <h3>🔧 แจ้งซ่อมอุปกรณ์ใหม่</h3>
                </div>
                <form onSubmit={handleSubmit} className="modern-form">
                    {/* ... (ส่วน input อื่นๆ เหมือนเดิม) ... */}
                    <div className="form-group-modern">
                        <label>ชื่ออุปกรณ์ / ประเภท</label>
                        <select className="input-modern" value={deviceName} onChange={e => setDeviceName(e.target.value)} required>
                            <option value="">-- กรุณาเลือกรายการ --</option>
                            <option value="Computer PC">คอมพิวเตอร์ตั้งโต๊ะ (PC)</option>
                            <option value="Notebook">โน้ตบุ๊ก (Notebook)</option>
                            <option value="Printer">เครื่องพิมพ์ (Printer/Scanner)</option>
                            <option value="Network/WiFi">อินเทอร์เน็ต / WiFi</option>
                            <option value="Other">อื่นๆ</option>
                        </select>
                    </div>
                    <div className="form-group-modern">
                        <label>สถานที่</label>
                        <select className="input-modern" value={location} onChange={e => setLocation(e.target.value)} required>
                            <option value="">-- กรุณาเลือกสถานที่ --</option>
                            <option value="อาคารสำนักงาน - ชั้น 1">อาคารสำนักงาน - ชั้น 1</option>
                            <option value="ฝ่ายผลิต">ฝ่ายผลิต</option>
                            <option value="อื่นๆ">อื่นๆ</option>
                        </select>
                    </div>
                    <div className="form-group-modern">
                        <label>รายละเอียดปัญหา</label>
                        <textarea className="input-modern" rows="4" value={problemDetail} onChange={e => setProblemDetail(e.target.value)} required></textarea>
                    </div>

                    {/* ✅ แก้ไขส่วนอัปโหลดรูป */}
                    <div className="form-group-modern">
                        <label>📸 รูปภาพก่อนซ่อม (Before)</label>
                        <div className="file-input-wrapper">
                            <input type="file" className="input-file-modern" onChange={e => setBeforeImage(e.target.files[0])} />
                        </div>
                    </div>

                    <button type="submit" className="btn-submit-modern">ส่งแจ้งซ่อม</button>
                </form>
            </div>
        </div>
    );
}

export default UserDashboard;