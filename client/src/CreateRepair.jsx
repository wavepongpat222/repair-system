import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './App.css';

function CreateRepair() {
    const [device, setDevice] = useState('');
    const [problem, setProblem] = useState('');
    const [location, setLocation] = useState('');
    const [file, setFile] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (device === "") { alert("กรุณาเลือกชื่ออุปกรณ์"); return; }
        if (location === "") { alert("กรุณาเลือกสถานที่"); return; }

        const user = JSON.parse(localStorage.getItem('user'));
        if(!user) {
            alert("กรุณา Login ใหม่");
            navigate('/');
            return;
        }

        const formData = new FormData();
        formData.append('user_id', user.user_id); 
        formData.append('device_name', device);
        formData.append('problem_detail', problem);
        formData.append('location', location);
        
        if (file) {
            formData.append('repair_image', file);
        }

        axios.post('http://localhost:3001/add-repair', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(res => {
            if(res.data === "Success") {
                alert("แจ้งซ่อมสำเร็จ ✅");
                // ✅ แก้ไขตรงนี้: บันทึกเสร็จให้ไปหน้า "ประวัติ" (ถ้าไป dashboard จะโดนเด้งออก)
                navigate('/history'); 
            } else {
                alert("เกิดข้อผิดพลาด");
            }
        })
        .catch(err => console.log(err));
    }

    return (
        <div className="container" style={{maxWidth: '600px', marginTop: '50px'}}>
            <div className="card">
                <h2 style={{marginBottom: '20px'}}>📝 แจ้งซ่อมพัสดุ/ครุภัณฑ์</h2>
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>ชื่ออุปกรณ์ / ประเภท</label>
                        <select className="form-control" value={device} onChange={(e) => setDevice(e.target.value)} required>
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

                    <div className="form-group">
                        <label>อาการที่ชำรุด</label>
                        <textarea className="form-control" required onChange={(e) => setProblem(e.target.value)} rows="4" placeholder="ระบุอาการเสียให้ชัดเจน..."></textarea>
                    </div>

                    <div className="form-group">
                        <label>สถานที่ / ห้อง</label>
                        <select className="form-control" value={location} onChange={(e) => setLocation(e.target.value)} required>
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
                    
                    <div className="form-group">
                        <label>รูปภาพประกอบ (ถ้ามี)</label>
                        <input type="file" className="form-control" accept="image/*" onChange={(e) => setFile(e.target.files[0])} style={{padding: '6px'}}/>
                    </div>

                    <div style={{display: 'flex', gap: '10px', marginTop: '20px'}}>
                        <button type="submit" className="btn btn-primary" style={{flex: 1}}>ยืนยันแจ้งซ่อม</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateRepair;