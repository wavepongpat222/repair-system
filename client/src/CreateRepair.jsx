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

    // --- State สำหรับ Popup ---
    const [showConfirmModal, setShowConfirmModal] = useState(false); // ยืนยันก่อนส่ง
    const [showSuccessModal, setShowSuccessModal] = useState(false); // แจ้งเตือนสำเร็จ

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (device === "") { alert("กรุณาเลือกชื่ออุปกรณ์"); return; }
        if (location === "") { alert("กรุณาเลือกสถานที่"); return; }

        // เปิด Popup ยืนยันก่อน
        setShowConfirmModal(true);
    }

    const confirmSubmit = () => {
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
                setShowConfirmModal(false); // ปิด Popup ยืนยัน
                setShowSuccessModal(true);  // เปิด Popup สำเร็จ
            } else {
                alert("เกิดข้อผิดพลาด");
            }
        })
        .catch(err => console.log(err));
    }

    const handleCloseSuccess = () => {
        setShowSuccessModal(false);
        navigate('/history'); // กด OK แล้วไปหน้าประวัติ
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

            {/* --- Popup 1: ยืนยันก่อนส่ง (เหมือน Admin) --- */}
            {showConfirmModal && (
                <div className="modal-overlay" style={modalOverlayStyle}>
                    <div className="modal-box" style={modalBoxStyle}>
                        <div style={{fontSize: '3rem', marginBottom: '10px'}}>📝</div>
                        <h3 style={{marginTop: 0, color:'#333'}}>ยืนยันการแจ้งซ่อม?</h3>
                        <p style={{color: '#666', marginBottom: '25px'}}>ตรวจสอบข้อมูลถูกต้องแล้วใช่หรือไม่?</p>
                        <div style={{display: 'flex', gap: '10px'}}>
                            <button onClick={confirmSubmit} style={{flex: 1, backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontSize:'1rem'}}>ยืนยัน</button>
                            <button onClick={() => setShowConfirmModal(false)} style={{flex: 1, backgroundColor: '#e5e7eb', color: '#374151', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontSize:'1rem'}}>แก้ไข</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- Popup 2: แจ้งเตือนสำเร็จ --- */}
            {showSuccessModal && (
                <div className="modal-overlay" style={modalOverlayStyle}>
                    <div className="modal-box" style={modalBoxStyle}>
                        <div style={{fontSize: '3rem', marginBottom: '10px'}}>✅</div>
                        <h3 style={{marginTop: 0, color:'#333'}}>แจ้งซ่อมเรียบร้อย!</h3>
                        <p style={{color: '#666', marginBottom: '25px'}}>เจ้าหน้าที่ได้รับข้อมูลแล้ว</p>
                        <button onClick={handleCloseSuccess} style={{width: '100%', backgroundColor: '#10b981', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontSize:'1rem'}}>ตกลง</button>
                    </div>
                </div>
            )}
        </div>
    );
}

// Style
const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' };
const modalBoxStyle = { backgroundColor: 'white', padding: '30px', borderRadius: '16px', width: '90%', maxWidth: '350px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', animation: 'fadeIn 0.2s ease-out' };

export default CreateRepair;