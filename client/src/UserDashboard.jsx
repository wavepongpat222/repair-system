import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './App.css';

function UserDashboard() {
    const [deviceName, setDeviceName] = useState('');
    const [problemDetail, setProblemDetail] = useState('');
    const [location, setLocation] = useState('');
    const [image, setImage] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) { navigate('/'); } 
        else { setCurrentUser(user); }
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (deviceName === "") { alert("กรุณาเลือกชื่ออุปกรณ์"); return; }
        if (location === "") { alert("กรุณาเลือกสถานที่"); return; }

        const formData = new FormData();
        formData.append('user_id', currentUser.user_id);
        formData.append('device_name', deviceName);
        formData.append('problem_detail', problemDetail);
        formData.append('location', location);
        if (image) formData.append('repair_image', image);

        axios.post('http://localhost:3001/add-repair', formData)
            .then(res => {
                if(res.data === "Success") {
                    alert("บันทึกข้อมูลเรียบร้อย ✅");
                    // เมื่อแจ้งซ่อมเสร็จ ให้เด้งไปหน้าประวัติทันที
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
                    <div className="form-group-modern">
                        <label>ชื่ออุปกรณ์ / ประเภท</label>
                        <select className="input-modern" value={deviceName} onChange={e => setDeviceName(e.target.value)} required>
                            <option value="">-- กรุณาเลือกรายการ --</option>
                            <option value="Computer PC">คอมพิวเตอร์ตั้งโต๊ะ (PC)</option>
                            <option value="Notebook">โน้ตบุ๊ก (Notebook)</option>
                            <option value="Printer">เครื่องพิมพ์ (Printer/Scanner)</option>
                            <option value="Network/WiFi">อินเทอร์เน็ต / WiFi</option>
                            <option value="Software/Program">โปรแกรม / ซอฟต์แวร์</option>
                            <option value="Monitor">หน้าจอ (Monitor)</option>
                            <option value="UPS">เครื่องสำรองไฟ (UPS)</option>
                            <option value="Other">อื่นๆ</option>
                        </select>
                    </div>
                    <div className="form-group-modern">
                        <label>สถานที่ / แผนก</label>
                        <select className="input-modern" value={location} onChange={e => setLocation(e.target.value)} required>
                            <option value="">-- กรุณาเลือกสถานที่ --</option>
                            <option value="อาคารสำนักงาน - ชั้น 1">อาคารสำนักงาน - ชั้น 1</option>
                            <option value="อาคารสำนักงาน - ชั้น 2">อาคารสำนักงาน - ชั้น 2</option>
                            <option value="แผนกบัญชี/การเงิน">แผนกบัญชี/การเงิน</option>
                            <option value="แผนกบุคคล (HR)">แผนกบุคคล (HR)</option>
                            <option value="ฝ่ายผลิต (Production)">ฝ่ายผลิต (Production)</option>
                            <option value="คลังสินค้า (Warehouse)">คลังสินค้า (Warehouse)</option>
                            <option value="ห้อง Server / IT">ห้อง Server / IT</option>
                            <option value="ป้อมรปภ.">ป้อมรปภ.</option>
                        </select>
                    </div>
                    <div className="form-group-modern">
                        <label>รายละเอียดปัญหา</label>
                        <textarea className="input-modern" rows="4" placeholder="อาการเป็นอย่างไร..." value={problemDetail} onChange={e => setProblemDetail(e.target.value)} required></textarea>
                    </div>
                    <div className="form-group-modern">
                        <label>รูปภาพประกอบ (ถ้ามี)</label>
                        <div className="file-input-wrapper">
                            <input type="file" id="fileInput" className="input-file-modern" onChange={e => setImage(e.target.files[0])} />
                        </div>
                    </div>
                    <button type="submit" className="btn-submit-modern">ส่งแจ้งซ่อม</button>
                </form>
            </div>
        </div>
    );
}

export default UserDashboard;