import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './App.css';

function InventoryReport() {
    const [materials, setMaterials] = useState([]);
    const [withdrawals, setWithdrawals] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('http://localhost:3001/materials').then(res => setMaterials(res.data));
        axios.get('http://localhost:3001/all-withdrawal-requests').then(res => setWithdrawals(res.data));
    }, []);

    const handlePrint = () => { window.print(); }

    // +++ เพิ่มฟังก์ชันนี้ครับ: เช็คว่าใครกดปุ่มกลับ +++
    const handleBack = () => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user?.role === 'inventory') {
            navigate('/inventory-dashboard');
        } else {
            navigate('/dashboard');
        }
    }

    const lowStockItems = materials.filter(m => m.quantity < 5);

    return (
        <div className="container">
            <div className="no-print" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                <h2>📊 รายงานสรุปคลังวัสดุอุปกรณ์</h2>
                <div style={{display: 'flex', gap: '10px'}}>
                    {/* เรียกใช้ handleBack */}
                    <button className="btn btn-secondary" onClick={handleBack}>🔙 กลับ</button>
                    <button className="btn btn-primary" onClick={handlePrint}>🖨️ พิมพ์รายงาน</button>
                </div>
            </div>

            <div className="card report-area">
                <h3 style={{textAlign: 'center', marginBottom: '30px'}}>รายงานสถานะคลังพัสดุ</h3>

                {lowStockItems.length > 0 && (
                    <div style={{marginBottom: '30px', padding: '15px', backgroundColor: '#fee2e2', borderRadius: '8px', border: '1px solid #fecaca'}}>
                        <h4 style={{color: '#dc2626', margin: 0}}>⚠️ วัสดุใกล้หมด ({lowStockItems.length} รายการ)</h4>
                        <ul style={{marginTop: '10px', paddingLeft: '20px'}}>
                            {lowStockItems.map(m => (
                                <li key={m.id}>{m.material_name} (เหลือ {m.quantity} {m.unit})</li>
                            ))}
                        </ul>
                    </div>
                )}

                <h4>1. ยอดคงเหลือปัจจุบัน</h4>
                <table className="custom-table" style={{width: '100%', marginBottom: '30px'}}>
                    <thead>
                        <tr>
                            <th>รายการ</th>
                            <th style={{textAlign: 'center'}}>จำนวนคงเหลือ</th>
                            <th style={{textAlign: 'center'}}>หน่วย</th>
                        </tr>
                    </thead>
                    <tbody>
                        {materials.map(m => (
                            <tr key={m.id}>
                                <td>{m.material_name}</td>
                                <td style={{textAlign: 'center', fontWeight: 'bold'}}>{m.quantity}</td>
                                <td style={{textAlign: 'center'}}>{m.unit}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <h4>2. ประวัติการเบิกจ่ายล่าสุด</h4>
                <table className="custom-table" style={{width: '100%'}}>
                    <thead>
                        <tr>
                            <th>วันที่</th>
                            <th>ผู้เบิก</th>
                            <th>รายการ</th>
                            <th>จำนวน</th>
                            <th>สถานะ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {withdrawals.slice(0, 10).map(w => (
                            <tr key={w.id}>
                                <td>{new Date(w.date_requested).toLocaleDateString('th-TH')}</td>
                                <td>{w.first_name} {w.last_name}</td>
                                <td>{w.material_name}</td>
                                <td>{w.quantity} {w.unit}</td>
                                <td>{w.status === 'approved' ? '✅ อนุมัติ' : w.status === 'rejected' ? '❌ ปฏิเสธ' : '⏳ รอ'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    .card { border: none; box-shadow: none; }
                    @page { margin: 2cm; }
                }
            `}</style>
        </div>
    );
}

export default InventoryReport;