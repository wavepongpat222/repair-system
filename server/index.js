const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// เปิดให้เข้าถึงโฟลเดอร์ uploads (สำหรับดูรูปภาพ)
app.use('/uploads', express.static('uploads'));

// เชื่อมต่อฐานข้อมูล
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'repair_system'
});

// --- Config Multer (ตั้งค่าการอัปโหลดรูปภาพ) ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = './uploads';
        // ถ้าไม่มีโฟลเดอร์ให้สร้างใหม่
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }
        cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        // ตั้งชื่อไฟล์: เวลาปัจจุบัน + นามสกุลเดิม (ป้องกันชื่อซ้ำ)
        cb(null, Date.now() + path.extname(file.originalname));
    }
})
const upload = multer({ storage: storage });


// ==========================================
// 1. ZONE: AUTHENTICATION & USER MANAGEMENT
// ==========================================

// Login
app.post('/login', (req, res) => {
    const sql = "SELECT * FROM personnel WHERE username = ?";
    db.query(sql, [req.body.username], (err, data) => {
        if (err) return res.json("Error");
        if (data.length > 0) {
            bcrypt.compare(req.body.password, data[0].password, (err, response) => {
                if(response) {
                    return res.json({ status: "Login Success", user: data[0] });
                } else {
                    return res.json("Wrong Password");
                }
            });
        } else {
            return res.json("No Record");
        }
    });
});

// เพิ่มผู้ใช้ใหม่ (Add User)
app.post('/add-user', (req, res) => {
    const { username, password, first_name, last_name, role } = req.body;
    bcrypt.hash(password, 10, (err, hash) => {
        if(err) return res.json("Error Hashing");
        const sql = "INSERT INTO personnel (username, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)";
        db.query(sql, [username, hash, first_name, last_name, role], (err, result) => {
            if(err) return res.json(err);
            return res.json("Success");
        });
    });
});

// เปลี่ยนรหัสผ่าน (User เปลี่ยนเอง)
app.put('/change-password', (req, res) => {
    const { user_id, oldPassword, newPassword } = req.body;
    db.query("SELECT password FROM personnel WHERE user_id = ?", [user_id], (err, result) => {
        if(err) return res.json(err);
        if(result.length === 0) return res.json("User Not Found");

        bcrypt.compare(oldPassword, result[0].password, (err, isMatch) => {
            if(!isMatch) return res.json("Wrong Old Password");
            bcrypt.hash(newPassword, 10, (err, hash) => {
                db.query("UPDATE personnel SET password = ? WHERE user_id = ?", [hash, user_id], (err, result) => {
                    if(err) return res.json(err); return res.json("Success");
                });
            });
        });
    });
});

// รีเซ็ตรหัสผ่าน (Admin ทำให้)
app.put('/reset-password', (req, res) => {
    const { user_id, newPassword } = req.body;
    bcrypt.hash(newPassword, 10, (err, hash) => {
        if(err) return res.json("Error Hashing");
        db.query("UPDATE personnel SET password = ? WHERE user_id = ?", [hash, user_id], (err, result) => {
            if(err) return res.json(err); return res.json("Success");
        });
    });
});

// ดึงรายชื่อผู้ใช้ทั้งหมด
app.get('/users', (req, res) => {
    db.query("SELECT user_id, username, first_name, last_name, role FROM personnel ORDER BY role ASC", (err, result) => {
        if(err) return res.json(err); return res.json(result);
    });
});

// ลบผู้ใช้
app.delete('/delete-user/:id', (req, res) => {
    db.query("DELETE FROM personnel WHERE user_id = ?", [req.params.id], (err, result) => {
        if(err) return res.json(err); return res.json("Success");
    });
});

// แก้ไขข้อมูลผู้ใช้
app.put('/update-user', (req, res) => {
    const { user_id, first_name, last_name, role } = req.body;
    db.query("UPDATE personnel SET first_name = ?, last_name = ?, role = ? WHERE user_id = ?", [first_name, last_name, role, user_id], (err, result) => {
        if(err) return res.json(err); return res.json("Success");
    });
});

// ดึงรายชื่อช่าง (Technician) สำหรับ Dropdown มอบหมายงาน
app.get('/technicians', (req, res) => {
    db.query("SELECT user_id AS id, username, first_name, last_name FROM personnel WHERE role = 'technician'", (err, result) => {
        if(err) return res.json(err); return res.json(result); 
    });
});


// ==========================================
// 2. ZONE: REPAIR REQUESTS (งานซ่อม)
// ==========================================

// แจ้งซ่อมใหม่ (User) - รองรับรูปภาพ
app.post('/create-repair', upload.single('image'), (req, res) => {
    const { device_name, problem_detail, location, reporter_id } = req.body;
    const image_filename = req.file ? req.file.filename : null;
    const sql = "INSERT INTO repair_request (device_name, problem_detail, location, status, reporter_id, repair_image, date_created) VALUES (?, ?, ?, 'pending', ?, ?, NOW())";
    db.query(sql, [device_name, problem_detail, location, reporter_id, image_filename], (err, result) => {
        if(err) return res.json(err); return res.json("Success");
    });
});

// ดึงรายการซ่อมทั้งหมด
app.get('/repairs', (req, res) => {
    const sql = "SELECT * FROM repair_request ORDER BY date_created DESC";
    db.query(sql, (err, data) => {
        if(err) return res.json(err); return res.json(data);
    });
});

// ดึงงานซ่อมตาม ID (สำหรับหน้า JobDetail)
app.get('/repair/:id', (req, res) => {
    const sql = "SELECT * FROM repair_request WHERE id = ?";
    db.query(sql, [req.params.id], (err, result) => {
        if(err) return res.json(err); return res.json(result[0]);
    });
});

// มอบหมายงาน (Assign Job)
app.put('/assign-job', (req, res) => {
    const { repair_id, technician_id } = req.body;
    const sql = "UPDATE repair_request SET technician_id = ?, status = 'doing' WHERE id = ?";
    db.query(sql, [technician_id, repair_id], (err, result) => {
        if(err) return res.json(err); return res.json("Success");
    });
});

// อัปเดตสถานะงานซ่อม (Update Status)
app.put('/update-status/:id', (req, res) => {
    const sql = "UPDATE repair_request SET status = ? WHERE id = ?";
    db.query(sql, [req.body.status, req.params.id], (err, result) => {
        if(err) return res.json(err); return res.json("Success");
    });
});

// ช่างปิดงาน/บันทึกผล (Update Job Details + After Image)
app.put('/update-repair-job', upload.single('image_after'), (req, res) => {
    const { id, repair_details, status } = req.body;
    let sql = "UPDATE repair_request SET repair_details = ?, status = ? WHERE id = ?";
    let params = [repair_details, status, id];

    if (req.file) {
        sql = "UPDATE repair_request SET repair_details = ?, status = ?, repair_image_after = ? WHERE id = ?";
        params = [repair_details, status, req.file.filename, id];
    }

    db.query(sql, params, (err, result) => {
        if(err) return res.json(err); return res.json("Success");
    });
});

// ยกเลิกงานซ่อม (User เจ้าของเรื่อง)
app.delete('/cancel-repair', (req, res) => {
    const { repair_id, user_id } = req.body;
    const checkSql = "SELECT * FROM repair_request WHERE id = ? AND reporter_id = ? AND status = 'pending'";
    db.query(checkSql, [repair_id, user_id], (err, data) => {
        if(err) return res.json(err);
        if(data.length === 0) return res.json("Cannot Cancel");
        db.query("DELETE FROM repair_request WHERE id = ?", [repair_id], (err, result) => {
            if(err) return res.json(err); return res.json("Success");
        });
    });
});

// ลบงานซ่อม (Admin)
app.delete('/delete-repair/:id', (req, res) => {
    db.query("DELETE FROM repair_request WHERE id = ?", [req.params.id], (err, result) => {
        if(err) return res.json(err); return res.json("Success");
    });
});


// ==========================================
// 3. ZONE: INVENTORY MANAGEMENT (คลังวัสดุ)
// ==========================================

// ดึงรายการวัสดุ
app.get('/materials', (req, res) => {
    db.query("SELECT * FROM materials", (err, result) => {
        if(err) return res.json(err); return res.json(result);
    });
});

// เพิ่มวัสดุใหม่
app.post('/add-material', (req, res) => {
    const { name, qty, unit } = req.body;
    db.query("INSERT INTO materials (material_name, quantity, unit) VALUES (?, ?, ?)", [name, qty, unit], (err, result) => {
        if(err) return res.json(err); return res.json("Success");
    });
});

// แก้ไขวัสดุ
app.put('/update-material', (req, res) => {
    const { id, name, quantity, unit } = req.body;
    db.query("UPDATE materials SET material_name = ?, quantity = ?, unit = ? WHERE id = ?", [name, quantity, unit, id], (err, result) => {
        if(err) return res.json(err); return res.json("Success");
    });
});

// ลบวัสดุ
app.delete('/delete-material/:id', (req, res) => {
    db.query("DELETE FROM materials WHERE id = ?", [req.params.id], (err, result) => {
        if(err) return res.json(err); return res.json("Success");
    });
});


// ==========================================
// 4. ZONE: WITHDRAWAL REQUESTS (ระบบเบิกจ่าย)
// ==========================================

// ช่างส่งคำขอเบิก (Status: pending)
app.post('/request-material', (req, res) => {
    const { repair_id, material_id, quantity, technician_id } = req.body;
    const sql = "INSERT INTO withdrawal_requests (repair_id, material_id, quantity, technician_id, status) VALUES (?, ?, ?, ?, 'pending')";
    db.query(sql, [repair_id, material_id, quantity, technician_id], (err, result) => {
        if(err) return res.json(err); return res.json("Success");
    });
});

// ดึงรายการขอเบิกทั้งหมด (Join ตารางเพื่อให้เห็นชื่อ)
app.get('/all-withdrawal-requests', (req, res) => {
    const sql = `
        SELECT w.*, m.material_name, m.unit, p.first_name, p.last_name, r.device_name
        FROM withdrawal_requests w
        JOIN materials m ON w.material_id = m.id
        JOIN personnel p ON w.technician_id = p.user_id
        JOIN repair_request r ON w.repair_id = r.id
        ORDER BY w.date_requested DESC
    `;
    db.query(sql, (err, result) => {
        if(err) return res.json(err); return res.json(result);
    });
});

// ดึงประวัติการเบิกของงานซ่อมนั้นๆ (Job Detail)
app.get('/job-materials/:repairId', (req, res) => {
    const sql = `
        SELECT w.*, m.material_name, m.unit 
        FROM withdrawal_requests w
        JOIN materials m ON w.material_id = m.id
        WHERE w.repair_id = ?
        ORDER BY w.date_requested DESC
    `;
    db.query(sql, [req.params.repairId], (err, result) => {
        if(err) return res.json(err); return res.json(result);
    });
});

// --- APPROVAL FLOW (2 ขั้นตอน) ---

// Step 1: หัวหน้าช่างอนุมัติ (เปลี่ยนสถานะเป็น approved_by_sup)
app.put('/supervisor-approve', (req, res) => {
    const { id } = req.body;
    db.query("UPDATE withdrawal_requests SET status = 'approved_by_sup' WHERE id = ?", [id], (err, result) => {
        if(err) return res.json(err); return res.json("Success");
    });
});

// Step 2: ฝ่ายคลังยืนยันจ่ายของ (ตัดสต็อกจริง + เปลี่ยนสถานะเป็น approved)
app.put('/inventory-confirm', (req, res) => {
    const { id } = req.body;

    // 1. ดึงข้อมูลคำขอมาเช็ค
    db.query("SELECT * FROM withdrawal_requests WHERE id = ?", [id], (err, requests) => {
        if(err) return res.json(err);
        if(requests.length === 0) return res.json("Not Found");
        
        const reqData = requests[0];

        // 2. เช็คสต็อก
        db.query("SELECT quantity FROM materials WHERE id = ?", [reqData.material_id], (err, materials) => {
            if(err) return res.json(err);
            if(materials.length === 0) return res.json("Material Not Found");
            
            // ถ้าของไม่พอ
            if(materials[0].quantity < reqData.quantity) {
                return res.json("Not Enough Stock");
            }

            // 3. ตัดสต็อก
            db.query("UPDATE materials SET quantity = quantity - ? WHERE id = ?", [reqData.quantity, reqData.material_id], (err, result) => {
                if(err) return res.json(err);

                // 4. จบงาน เปลี่ยนสถานะ
                db.query("UPDATE withdrawal_requests SET status = 'approved' WHERE id = ?", [id], (err, result) => {
                    if(err) return res.json(err); return res.json("Success");
                });
            });
        });
    });
});

// ปฏิเสธคำขอ (Reject)
app.put('/reject-withdrawal', (req, res) => {
    const { id } = req.body;
    db.query("UPDATE withdrawal_requests SET status = 'rejected' WHERE id = ?", [id], (err, result) => {
        if(err) return res.json(err); return res.json("Success");
    });
});


// Start Server
app.listen(3001, () => {
    console.log("Server is running on port 3001");
});