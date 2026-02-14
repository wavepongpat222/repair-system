import axios from 'axios';

const api = axios.create({
    baseURL: 'https://2c40-2403-6200-8838-a490-2c44-1ee7-adcd-bd26.ngrok-free.app',
    headers: {
        'ngrok-skip-browser-warning': 'true' // ✅ เพิ่มบรรทัดนี้เพื่อข้ามหน้าสีขาวโดยอัตโนมัติ
    }
});

export default api;