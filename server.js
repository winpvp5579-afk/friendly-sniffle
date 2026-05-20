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
        // ส่งไฟล์ในชื่อ field 'file' ซึ่งเป็นชื่อที่ Endpoint ของคุณรองรับ
        form.append('file', req.file.buffer, { filename: 'slip.jpg' });

        // ยิงไปที่ Endpoint ตามที่คุณได้มาในหน้า Dashboard
        const response = await axios.post('https://api.slipok.com/api/line/apikey/66773', form, {
            headers: {
                ...form.getHeaders(),
                'x-api-key': 'SLIPOKWS7CZU1'
            }
        });

        // ส่งข้อมูลที่ได้จาก SlipOK กลับไปที่หน้าเว็บเพื่อดูผลลัพธ์
        res.json({ success: true, result: response.data });

    } catch (error) {
        // ดึง Error ออกมาดูแบบละเอียด
        const errorDetail = error.response ? error.response.data : error.message;
        console.error("Error Detail:", errorDetail);
        res.status(500).json({ success: false, message: 'ตรวจสอบไม่ผ่าน', detail: errorDetail });
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));
