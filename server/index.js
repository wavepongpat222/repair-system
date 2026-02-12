const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// เปิดให้เข้าถึงไฟล์รูปภาพ
app.use('/uploads', express.static('uploads'));

// ตั้งค่า Database
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'repair_system',
    port: process.env.DB_PORT || 3306 
});

// ตั้งค่าการอัปโหลดไฟล์
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = './uploads';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
})
const upload = multer({ storage: storage });

// ==========================================
// 1. ZONE: AUTHENTICATION & USER MANAGEMENT
// ==========================================

app.post('/login', (req, res) => {
    const sql = "SELECT * FROM personnel WHERE username = ?";
    db.query(sql, [req.body.username], (err, data) => {
        if (err) return res.json("Error");
        if (data.length > 0) {
            bcrypt.compare(req.body.password, data[0].password, (err, response) => {
                if(response) return res.json({ status: "Login Success", user: data[0] });
                else return res.json("Wrong Password");
            });
        } else {
            return res.json("No Record");
        }
    });
});

app.post('/add-user', (req, res) => {
    const { username, password, first_name, last_name, role, email } = req.body;
    bcrypt.hash(password, 10, (err, hash) => {
        if(err) return res.json("Error Hashing");
        const sql = "INSERT INTO personnel (username, password, first_name, last_name, role, email) VALUES (?, ?, ?, ?, ?, ?)";
        db.query(sql, [username, hash, first_name, last_name, role, email], (err, result) => {
            if(err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    if (err.sqlMessage.includes('email')) return res.json("Email Already Exists");
                    return res.json("Username Already Exists");
                }
                return res.json(err);
            }
            return res.json("Success");
        });
    });
});

app.put('/update-user', (req, res) => {
    const { user_id, password, first_name, last_name, role, email } = req.body;
    
    if (password && password.trim() !== "") {
        bcrypt.hash(password, 10, (err, hash) => {
            if(err) return res.json("Error Hashing");
            const sql = "UPDATE personnel SET password = ?, first_name = ?, last_name = ?, role = ?, email = ? WHERE user_id = ?";
            db.query(sql, [hash, first_name, last_name, role, email, user_id], (err, result) => {
                if(err) {
                    if (err.code === 'ER_DUP_ENTRY') return res.json("Email Already Exists");
                    return res.json(err);
                } 
                return res.json("Success");
            });
        });
    } else {
        const sql = "UPDATE personnel SET first_name = ?, last_name = ?, role = ?, email = ? WHERE user_id = ?";
        db.query(sql, [first_name, last_name, role, email, user_id], (err, result) => {
            if(err) {
                if (err.code === 'ER_DUP_ENTRY') return res.json("Email Already Exists");
                return res.json(err);
            }
            return res.json("Success");
        });
    }
});

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

app.delete('/delete-user/:id', (req, res) => {
    db.query("DELETE FROM personnel WHERE user_id = ?", [req.params.id], (err, result) => {
        if(err) return res.json(err); return res.json("Success");
    });
});

app.get('/users', (req, res) => {
    db.query("SELECT user_id, username, first_name, last_name, role, email FROM personnel ORDER BY user_id ASC", (err, result) => {
        if(err) return res.json(err); return res.json(result);
    });
});

app.get('/technicians', (req, res) => {
    db.query("SELECT user_id AS id, username, first_name, last_name FROM personnel WHERE role = 'technician'", (err, result) => {
        if(err) return res.json(err); 
        return res.json(result); 
    });
});

// ==========================================
// 2. ZONE: REPAIR REQUESTS (งานซ่อม)
// ==========================================

app.post('/add-repair', upload.single('repair_image'), (req, res) => {
    const { user_id, device_name, problem_detail, location } = req.body;
    const image_filename = req.file ? req.file.filename : null;
    const sql = "INSERT INTO repair_request (device_name, problem_detail, location, status, reporter_id, repair_image, date_created) VALUES (?, ?, ?, 'pending', ?, ?, NOW())";
    db.query(sql, [device_name, problem_detail, location, user_id, image_filename], (err, result) => {
        if(err) { console.log(err); return res.json("Error"); }
        return res.json("Success");
    });
});

app.get('/repairs', (req, res) => {
    const sql = `
        SELECT r.*, p.first_name AS reporter_first_name, p.last_name AS reporter_last_name
        FROM repair_request r
        LEFT JOIN personnel p ON r.reporter_id = p.user_id
        ORDER BY r.date_created DESC
    `;
    db.query(sql, (err, data) => {
        if(err) return res.json(err); return res.json(data);
    });
});

app.get('/my-repairs/:id', (req, res) => {
    const sql = "SELECT * FROM repair_request WHERE reporter_id = ? ORDER BY date_created DESC";
    db.query(sql, [req.params.id], (err, data) => {
        if(err) return res.json(err); return res.json(data);
    });
});

app.get('/technician-jobs/:id', (req, res) => {
    const sql = `
        SELECT r.*, p.first_name AS reporter_first_name, p.last_name AS reporter_last_name
        FROM repair_request r
        LEFT JOIN personnel p ON r.reporter_id = p.user_id
        WHERE r.technician_id = ? 
        ORDER BY r.date_created DESC
    `;
    db.query(sql, [req.params.id], (err, data) => {
        if(err) return res.json(err); return res.json(data);
    });
});

app.get('/job/:id', (req, res) => {
    const id = req.params.id;
    const sql = `
        SELECT r.*, p.first_name AS reporter_first_name, p.last_name AS reporter_last_name, p.role AS reporter_role 
        FROM repair_request r 
        LEFT JOIN personnel p ON r.reporter_id = p.user_id 
        WHERE r.id = ?
    `;
    db.query(sql, [id], (err, result) => {
        if(err) { console.log(err); return res.json({Error: "Error fetching job"}); }
        return res.json(result);
    });
});

app.put('/update-job', upload.single('repair_image'), (req, res) => {
    const { id, status } = req.body;
    let sql = "UPDATE repair_request SET status = ? WHERE id = ?";
    let params = [status, id];

    if (req.file) {
        sql = "UPDATE repair_request SET status = ?, repair_image = ? WHERE id = ?";
        params = [status, req.file.filename, id];
    }

    db.query(sql, params, (err, result) => {
        if(err) return res.json(err); 
        return res.json("Success");
    });
});

app.put('/delete-job-image', (req, res) => {
    const { id } = req.body;
    const sql = "UPDATE repair_request SET repair_image = NULL WHERE id = ?";
    db.query(sql, [id], (err, result) => {
        if(err) return res.json(err);
        return res.json("Success");
    });
});

app.put('/assign-job', (req, res) => {
    const { repair_id, technician_id } = req.body;
    const sql = "UPDATE repair_request SET technician_id = ?, status = 'doing' WHERE id = ?";
    db.query(sql, [technician_id, repair_id], (err, result) => {
        if(err) return res.json(err); return res.json("Success");
    });
});

app.delete('/cancel-repair/:id', (req, res) => {
    const sql = "DELETE FROM repair_request WHERE id = ? AND status = 'pending'";
    db.query(sql, [req.params.id], (err, result) => {
        if(err) return res.json(err); return res.json("Success");
    });
});

app.delete('/delete-repair/:id', (req, res) => {
    db.query("DELETE FROM repair_request WHERE id = ?", [req.params.id], (err, result) => {
        if(err) return res.json(err); return res.json("Success");
    });
});


// ==========================================
// 3. ZONE: INVENTORY & WITHDRAWAL (คลังวัสดุ)
// ==========================================

app.get('/materials', (req, res) => {
    db.query("SELECT * FROM materials ORDER BY material_name ASC", (err, result) => {
        if(err) return res.json(err); return res.json(result);
    });
});

// ✅ เพิ่มวัสดุใหม่ (เพิ่ม .trim() และส่ง Duplicate Name)
app.post('/add-material', (req, res) => {
    console.log("-----------------------------------------");
    console.log("👉 1. ได้รับคำขอเพิ่มวัสดุ:", req.body);
    
    const { name, qty, unit } = req.body;
    const cleanName = name.trim();
    console.log("👉 2. ชื่อที่ตรวจสอบ (ตัดช่องว่างแล้ว):", `'${cleanName}'`);

    // 1. เช็คชื่อซ้ำ
    db.query("SELECT * FROM materials WHERE material_name = ?", [cleanName], (err, result) => {
        if(err) {
            console.log("❌ 3. เกิด Error ตอนค้นหา:", err);
            return res.json(err);
        }
        
        console.log("👉 3. ผลการค้นหาใน DB:", result); // ดูว่าเจอซ้ำไหม?

        if(result.length > 0) {
            console.log("⛔ 4. เจอซ้ำ! กำลังส่ง 'Duplicate Name' กลับไป...");
            return res.json("Duplicate Name"); // ❌ เจอชื่อซ้ำ!
        }

        console.log("✅ 4. ไม่ซ้ำ! กำลังบันทึก...");
        // 2. ถ้าไม่ซ้ำ ให้บันทึก
        db.query("INSERT INTO materials (material_name, quantity, unit) VALUES (?, ?, ?)", [cleanName, qty, unit], (err, result) => {
            if(err) {
                console.log("❌ 5. Error ตอนบันทึก:", err);
                return res.json(err);
            }
            console.log("✅ 5. บันทึกสำเร็จ!");
            return res.json("Success");
        });
    });
});

// ✅ แก้ไขวัสดุ (เพิ่ม .trim() และส่ง Duplicate Name)
app.put('/update-material', (req, res) => {
    const { id, name, quantity, unit } = req.body;
    const cleanName = name.trim(); // ตัดช่องว่าง

    // 1. เช็คชื่อซ้ำ (ห้ามซ้ำกับคนอื่น)
    db.query("SELECT * FROM materials WHERE material_name = ? AND id != ?", [cleanName, id], (err, result) => {
        if(err) return res.json(err);
        if(result.length > 0) return res.json("Duplicate Name"); // ❌ เจอชื่อซ้ำ!

        // 2. อัปเดตข้อมูล
        db.query("UPDATE materials SET material_name = ?, quantity = ?, unit = ? WHERE id = ?", [cleanName, quantity, unit, id], (err, result) => {
            if(err) return res.json(err); return res.json("Success");
        });
    });
});

app.delete('/delete-material/:id', (req, res) => {
    db.query("DELETE FROM materials WHERE id = ?", [req.params.id], (err, result) => {
        if(err) return res.json(err); return res.json("Success");
    });
});

app.post('/request-material', (req, res) => {
    const { repair_id, material_id, quantity, technician_id } = req.body;
    const sql = "INSERT INTO withdrawal_requests (repair_id, material_id, quantity, technician_id, status, date_requested) VALUES (?, ?, ?, ?, 'pending', NOW())";
    db.query(sql, [repair_id, material_id, quantity, technician_id], (err, result) => {
        if(err) return res.json(err); return res.json("Success");
    });
});

app.delete('/delete-withdrawal/:id', (req, res) => {
    db.query("DELETE FROM withdrawal_requests WHERE id = ? AND status = 'pending'", [req.params.id], (err, result) => {
        if(err) return res.json(err); return res.json("Success");
    });
});

app.get('/my-withdrawals/:id', (req, res) => {
    const id = req.params.id;
    const sql = `
        SELECT w.id, w.date_requested, m.material_name, w.quantity, m.unit, w.status 
        FROM withdrawal_requests w 
        JOIN materials m ON w.material_id = m.id 
        WHERE w.technician_id = ? 
        ORDER BY w.date_requested DESC
    `;
    db.query(sql, [id], (err, result) => {
        if(err) return res.json(err); return res.json(result);
    });
});

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

app.put('/supervisor-approve', (req, res) => {
    const { id } = req.body;
    db.query("UPDATE withdrawal_requests SET status = 'approved_by_sup' WHERE id = ?", [id], (err, result) => {
        if(err) return res.json(err); return res.json("Success");
    });
});

app.put('/inventory-confirm', (req, res) => {
    const { id } = req.body;
    db.query("SELECT * FROM withdrawal_requests WHERE id = ?", [id], (err, requests) => {
        if(err) return res.json(err);
        if(requests.length === 0) return res.json("Not Found");
        
        const reqData = requests[0];

        db.query("SELECT quantity FROM materials WHERE id = ?", [reqData.material_id], (err, materials) => {
            if(err) return res.json(err);
            if(materials.length === 0) return res.json("Material Not Found");
            if(materials[0].quantity < reqData.quantity) return res.json("Not Enough Stock");

            db.query("UPDATE materials SET quantity = quantity - ? WHERE id = ?", [reqData.quantity, reqData.material_id], (err, result) => {
                if(err) return res.json(err);
                db.query("UPDATE withdrawal_requests SET status = 'completed' WHERE id = ?", [id], (err, result) => {
                    if(err) return res.json(err); return res.json("Success");
                });
            });
        });
    });
});

app.put('/reject-withdrawal', (req, res) => {
    const { id } = req.body;
    db.query("UPDATE withdrawal_requests SET status = 'rejected' WHERE id = ?", [id], (err, result) => {
        if(err) return res.json(err); return res.json("Success");
    });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});