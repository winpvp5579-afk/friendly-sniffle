const express = require('express');
const axios = require('axios');
const multer = require('multer');
const FormData = require('form-data');
const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.static(__dirname));

app.post('/api/verify-slip', upload.single('slip'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'ไม่มีไฟล์สลิป' });

        const form = new FormData();
        form.append('file', req.file.buffer, { filename: 'slip.jpg' });

        const response = await axios.post('https://api.slipok.com/api/line/apikey/66773', form, {
            headers: {
                ...form.getHeaders(),
                'x-api-key': 'SLIPOKWS7CZU1'
            }
        });

        res.json({ success: true, result: response.data });

    } catch (error) {
        // --- ส่วนนี้คือระบบรายงานจุดพัง ---
        let errorMessage = 'ตรวจสอบไม่ผ่าน';
        
        if (error.response) {
            // ดึงข้อความจาก SlipOK โดยตรง (เช่น สลิปซ้ำ, ไม่พบ QR)
            errorMessage = `SlipOK Error: ${JSON.stringify(error.response.data)}`;
        } else if (error.request) {
            errorMessage = 'ไม่สามารถติดต่อเซิร์ฟเวอร์ SlipOK ได้';
        } else {
            errorMessage = error.message;
        }

        console.error("DEBUG - รายละเอียดจุดพัง:", errorMessage);
        res.status(500).json({ success: false, message: errorMessage });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
