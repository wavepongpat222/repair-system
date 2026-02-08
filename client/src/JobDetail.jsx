import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './App.css';

function JobDetail() {
    const { id } = useParams(); // รับ ID งานซ่อมจาก URL
    const navigate = useNavigate();
    const [repair, setRepair] = useState(null);
    const [materials, setMaterials] = useState([]); // รายชื่อวัสดุในคลัง
    const [requests, setRequests] = useState([]);   // ประวัติการเบิกของงานนี้
    
    // Form States
    const [details, setDetails] = useState('');
    const [status, setStatus] = useState('');
    const [file, setFile] = useState(null);
    
    // Withdrawal Form
    const [selectedMat, setSelectedMat] = useState('');
    const [qty, setQty] = useState(1);

    const currentUser = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        fetchRepairData();
        fetchMaterials();
        fetchRequests();
    }, []);

    const fetchRepairData = () => {
        axios.get('http://localhost:3001/repair/' + id).then(res => {
            setRepair(res.data);
            setDetails(res.data.repair_details || '');
            setStatus(res.data.status);
        });
    }
    const fetchMaterials = () => {
        axios.get('http://localhost:3001/materials').then(res => setMaterials(res.data));
    }
    const fetchRequests = () => {
        axios.get('http://localhost:3001/job-materials/' + id).then(res => setRequests(res.data));
    }

    const handleUpdateJob = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('id', id);
        formData.append('repair_details', details);
        formData.append('status', status);
        if(file) formData.append('image_after', file);

        axios.put('http://localhost:3001/update-repair-job', formData, {
            headers: {'Content-Type': 'multipart/form-data'}
        }).then(res => {
            if(res.data === "Success") { alert("บันทึกข้อมูลสำเร็จ ✅"); fetchRepairData(); }
        });
    }

    const handleRequestMaterial = () => {
        if(!selectedMat) return alert("เลือกวัสดุก่อน");
        axios.post('http://localhost:3001/request-material', {
            repair_id: id,
            material_id: selectedMat,
            quantity: qty,
            technician_id: currentUser.user_id
        }).then(res => {
            if(res.data === "Success") { alert("ส่งคำขอเบิกแล้ว 📦"); fetchRequests(); }
        });
    }

    const handlePrint = () => { window.print(); }

    if (!repair) return <div>Loading...</div>;

    return (
        <div className="container" style={{paddingBottom: '50px'}}>
            {/* Header ส่วนนี้ซ่อนตอนปริ้น */}
            <div className="no-print" style={{marginBottom: '20px', display: 'flex', justifyContent: 'space-between'}}>
                <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>🔙 กลับหน้าหลัก</button>
                <button className="btn btn-primary" onClick={handlePrint}>🖨️ พิมพ์รายงาน</button>
            </div>

            {/* --- รายงานการซ่อม (ส่วนที่จะถูกปริ้น) --- */}
            <div className="card report-area">
                <h2 style={{textAlign: 'center', borderBottom: '2px solid #ddd', paddingBottom: '10px'}}>📄 ใบรายงานการซ่อมบำรุง</h2>
                
                <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '20px'}}>
                    <div>
                        <p><b>เลขที่ใบแจ้งซ่อม:</b> {repair.id}</p>
                        <p><b>อุปกรณ์:</b> {repair.device_name}</p>
                        <p><b>สถานที่:</b> {repair.location}</p>
                    </div>
                    <div style={{textAlign: 'right'}}>
                        <p><b>วันที่แจ้ง:</b> {new Date(repair.date_created).toLocaleDateString('th-TH')}</p>
                        <p><b>สถานะปัจจุบัน:</b> {repair.status === 'done' ? '✅ ซ่อมเสร็จสิ้น' : repair.status === 'doing' ? '🛠 กำลังดำเนินการ' : '⏳ รอดำเนินการ'}</p>
                    </div>
                </div>

                <hr />
                
                <h4>1. รายละเอียดปัญหา</h4>
                <p>{repair.problem_detail}</p>
                <div style={{marginBottom: '20px'}}>
                    {repair.repair_image && <img src={`http://localhost:3001/uploads/${repair.repair_image}`} alt="before" style={{maxWidth: '200px', border: '1px solid #ccc'}} />}
                    <p style={{fontSize: '0.8rem', color: '#666'}}>* รูปภาพก่อนซ่อม</p>
                </div>

                <h4>2. ผลการดำเนินงาน (สำหรับช่าง)</h4>
                <div className="no-print" style={{backgroundColor: '#f9fafb', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #eee'}}>
                    <form onSubmit={handleUpdateJob}>
                        <div className="form-group">
                            <label>สถานะงาน:</label>
                            <select value={status} onChange={e => setStatus(e.target.value)} style={{marginLeft: '10px', padding: '5px'}}>
                                <option value="pending">รอดำเนินการ</option>
                                <option value="doing">กำลังซ่อม</option>
                                <option value="done">ดำเนินการเสร็จสิ้น</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>รายละเอียดการซ่อม:</label>
                            <textarea className="form-control" rows="3" value={details} onChange={e => setDetails(e.target.value)} placeholder="ระบุสิ่งที่ทำไป..."></textarea>
                        </div>
                        <div className="form-group">
                            <label>รูปภาพหลังซ่อม:</label>
                            <input type="file" onChange={e => setFile(e.target.files[0])} />
                        </div>
                        <button type="submit" className="btn btn-primary">💾 บันทึกผลการซ่อม</button>
                    </form>
                </div>
                
                {/* ส่วนแสดงผล (Show Only) สำหรับการปริ้น */}
                <div className="print-only-block">
                    <p>{repair.repair_details || "-"}</p>
                    {repair.repair_image_after && (
                        <div>
                            <img src={`http://localhost:3001/uploads/${repair.repair_image_after}`} alt="after" style={{maxWidth: '200px', border: '1px solid #ccc'}} />
                            <p style={{fontSize: '0.8rem', color: '#666'}}>* รูปภาพหลังซ่อม</p>
                        </div>
                    )}
                </div>

                <hr />

                <h4>3. รายการวัสดุอุปกรณ์ที่ใช้ (เบิก)</h4>
                {/* ฟอร์มขอเบิก (ซ่อนตอนปริ้น) */}
                <div className="no-print" style={{display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'flex-end'}}>
                    <div style={{flex: 2}}>
                        <label>เลือกวัสดุ:</label>
                        <select className="form-control" onChange={e => setSelectedMat(e.target.value)} value={selectedMat} style={{width: '100%', padding: '8px'}}>
                            <option value="">-- เลือก --</option>
                            {materials.map(m => <option key={m.id} value={m.id}>{m.material_name} (คงเหลือ: {m.quantity} {m.unit})</option>)}
                        </select>
                    </div>
                    <div style={{flex: 1}}>
                        <label>จำนวน:</label>
                        <input type="number" className="form-control" min="1" value={qty} onChange={e => setQty(e.target.value)} style={{width: '100%', padding: '8px'}} />
                    </div>
                    <button onClick={handleRequestMaterial} className="btn btn-secondary" style={{backgroundColor: '#10b981', color: 'white'}}>➕ ขอเบิก</button>
                </div>

                {/* ตารางรายการเบิก */}
                <table className="custom-table" style={{width: '100%'}}>
                    <thead>
                        <tr>
                            <th>รายการวัสดุ</th>
                            <th style={{textAlign: 'center'}}>จำนวน</th>
                            <th style={{textAlign: 'center'}}>สถานะการอนุมัติ</th>
                            <th style={{textAlign: 'center'}}>วันที่ขอ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.length > 0 ? requests.map(r => (
                            <tr key={r.id}>
                                <td>{r.material_name}</td>
                                <td style={{textAlign: 'center'}}>{r.quantity} {r.unit}</td>
                                <td style={{textAlign: 'center'}}>
                                    <span className={`status-badge ${r.status === 'approved' ? 'status-done' : r.status === 'rejected' ? 'status-pending' : 'status-doing'}`}>
                                        {r.status === 'approved' ? 'อนุมัติแล้ว' : r.status === 'rejected' ? 'ไม่อนุมัติ' : 'รออนุมัติ'}
                                    </span>
                                </td>
                                <td style={{textAlign: 'center'}}>{new Date(r.date_requested).toLocaleString('th-TH')}</td>
                            </tr>
                        )) : <tr><td colSpan="4" style={{textAlign: 'center', color: '#999'}}>ไม่มีรายการเบิก</td></tr>}
                    </tbody>
                </table>

                <div className="only-print" style={{marginTop: '50px', display: 'flex', justifyContent: 'space-between'}}>
                    <div style={{textAlign: 'center'}}>
                        <p>_________________________</p>
                        <p>ผู้แจ้งซ่อม</p>
                    </div>
                    <div style={{textAlign: 'center'}}>
                        <p>_________________________</p>
                        <p>ช่างผู้ปฏิบัติงาน</p>
                    </div>
                </div>
            </div>

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    .print-only-block { display: block !important; }
                    .only-print { display: flex !important; }
                    .container { width: 100%; max-width: 100%; margin: 0; padding: 0; }
                    .card { border: none; box-shadow: none; }
                    @page { margin: 2cm; }
                }
            `}</style>
        </div>
    );
}

export default JobDetail;