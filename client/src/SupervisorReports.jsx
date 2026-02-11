import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './App.css';

function SupervisorReports() {
    const [repairs, setRepairs] = useState([]);
    const [withdrawals, setWithdrawals] = useState([]);
    const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7)); // ค่าเริ่มต้นเป็นเดือนปัจจุบัน (YYYY-MM)
    const navigate = useNavigate();

    useEffect(() => {
        // ดึงข้อมูลทั้งหมดมาคำนวณที่ Frontend
        axios.get('http://localhost:3001/repairs').then(res => setRepairs(res.data));
        axios.get('http://localhost:3001/all-withdrawal-requests').then(res => setWithdrawals(res.data));
    }, []);

    const handlePrint = () => { window.print(); }

    // --- Logic การกรองและคำนวณ ---
    
    // 1. กรองงานซ่อมตามเดือนที่เลือก
    const filteredRepairs = repairs.filter(r => r.date_created.startsWith(filterMonth));
    
    // 2. นับสถานะงาน
    const stats = {
        total: filteredRepairs.length,
        done: filteredRepairs.filter(r => r.status === 'done').length,
        doing: filteredRepairs.filter(r => r.status === 'doing').length,
        pending: filteredRepairs.filter(r => r.status === 'pending').length
    };

    // 3. สรุปงานรายบุคคล (Technician Performance)
    const techStats = {};
    filteredRepairs.forEach(r => {
        if(r.technician_id) {
            // เราไม่มีชื่อช่างในตาราง repairs โดยตรง ต้องไปแมพเอา หรือใช้ ID ไปก่อนใน Dashboard แบบง่าย
            // แต่เพื่อให้ง่าย เราจะนับตาม ID ช่าง
            const techId = r.technician_id;
            if(!techStats[techId]) techStats[techId] = { done: 0, total: 0 };
            techStats[techId].total++;
            if(r.status === 'done') techStats[techId].done++;
        }
    });

    // 4. สรุปการใช้วัสดุ (เฉพาะที่อนุมัติแล้ว)
    const materialUsage = {};
    withdrawals.filter(w => w.status === 'approved' && w.date_requested.startsWith(filterMonth)).forEach(w => {
        if(!materialUsage[w.material_name]) materialUsage[w.material_name] = { qty: 0, unit: w.unit };
        materialUsage[w.material_name].qty += w.quantity;
    });

    return (
        <div className="container">
            <div className="no-print" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                <h2>📊 รายงานสรุปผลการดำเนินงาน</h2>
                <div style={{display: 'flex', gap: '10px'}}>
                    <input 
                        type="month" 
                        value={filterMonth} 
                        onChange={e => setFilterMonth(e.target.value)}
                        style={{padding: '8px', borderRadius: '5px', border: '1px solid #ccc'}}
                    />
                    <button className="btn btn-primary" onClick={handlePrint}>🖨️ พิมพ์รายงาน</button>
                </div>
            </div>

            <div className="card report-area">
                <h3 style={{textAlign: 'center', marginBottom: '20px'}}>
                    รายงานประจำเดือน {new Date(filterMonth).toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}
                </h3>

                {/* Section 1: สรุปสถานะงานซ่อม */}
                <h4>1. สรุปงานซ่อมทั้งหมด</h4>
                <div style={{display: 'flex', gap: '20px', marginBottom: '30px'}}>
                    <div className="card" style={{flex: 1, textAlign: 'center', backgroundColor: '#f3f4f6'}}>
                        <h1>{stats.total}</h1>
                        <p>งานทั้งหมด</p>
                    </div>
                    <div className="card" style={{flex: 1, textAlign: 'center', backgroundColor: '#d1fae5'}}>
                        <h1 style={{color: '#059669'}}>{stats.done}</h1>
                        <p>เสร็จสิ้น</p>
                    </div>
                    <div className="card" style={{flex: 1, textAlign: 'center', backgroundColor: '#dbeafe'}}>
                        <h1 style={{color: '#2563eb'}}>{stats.doing}</h1>
                        <p>กำลังซ่อม</p>
                    </div>
                    <div className="card" style={{flex: 1, textAlign: 'center', backgroundColor: '#fee2e2'}}>
                        <h1 style={{color: '#dc2626'}}>{stats.pending}</h1>
                        <p>รอดำเนินการ</p>
                    </div>
                </div>

                {/* Section 2: รายการซ่อมในเดือนนี้ */}
                <h4>2. รายการแจ้งซ่อมในเดือนนี้</h4>
                <table className="custom-table" style={{width: '100%', marginBottom: '30px'}}>
                    <thead>
                        <tr>
                            <th>วันที่</th>
                            <th>อุปกรณ์</th>
                            <th>อาการ</th>
                            <th>สถานะ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRepairs.length > 0 ? filteredRepairs.map(r => (
                            <tr key={r.id}>
                                <td>{new Date(r.date_created).toLocaleDateString('th-TH')}</td>
                                <td>{r.device_name}</td>
                                <td>{r.problem_detail}</td>
                                <td>{r.status === 'done' ? '✅ เสร็จสิ้น' : r.status === 'doing' ? '🛠 กำลังทำ' : '⏳ รอ'}</td>
                            </tr>
                        )) : <tr><td colSpan="4" style={{textAlign: 'center'}}>ไม่มีข้อมูล</td></tr>}
                    </tbody>
                </table>

                {/* Section 3: การเบิกวัสดุ */}
                <h4>3. สรุปการใช้วัสดุอุปกรณ์ (อนุมัติแล้ว)</h4>
                <table className="custom-table" style={{width: '100%'}}>
                    <thead>
                        <tr>
                            <th>รายการวัสดุ</th>
                            <th style={{textAlign: 'center'}}>จำนวนที่ใช้ไป</th>
                            <th style={{textAlign: 'center'}}>หน่วย</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(materialUsage).length > 0 ? Object.keys(materialUsage).map((matName, idx) => (
                            <tr key={idx}>
                                <td>{matName}</td>
                                <td style={{textAlign: 'center', fontWeight: 'bold'}}>{materialUsage[matName].qty}</td>
                                <td style={{textAlign: 'center'}}>{materialUsage[matName].unit}</td>
                            </tr>
                        )) : <tr><td colSpan="3" style={{textAlign: 'center'}}>ไม่มีการเบิกในเดือนนี้</td></tr>}
                    </tbody>
                </table>
            </div>

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    .container { width: 100%; max-width: 100%; margin: 0; padding: 0; }
                    .card { border: none; box-shadow: none; }
                    @page { margin: 2cm; }
                }
            `}</style>
        </div>
    );
}

export default SupervisorReports;