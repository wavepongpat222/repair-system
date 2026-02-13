import axios from 'axios';

const api = axios.create({
    baseURL: 'https://0c4b-2403-6200-8838-a490-7c50-941-d23e-f4b5.ngrok-free.app',
    headers: {
        'ngrok-skip-browser-warning': 'true' // ✅ เพิ่มบรรทัดนี้เพื่อข้ามหน้าสีขาวโดยอัตโนมัติ
    }
});

export default api;