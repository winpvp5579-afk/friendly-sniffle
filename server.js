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
        // ส่งไฟล์ในชื่อ field 'file' ตามที่ Endpoint 66773 กำหนด
        form.append('file', req.file.buffer, { filename: 'slip.jpg' });

        // ยิงไปที่ Endpoint สาขา 66773 โดยตรง
        const response = await axios.post('https://api.slipok.com/api/line/apikey/66773', form, {
            headers: {
                ...form.getHeaders(),
                'x-api-key': 'SLIPOKWS7CZU1'
            }
        });

        // ส่งผลลัพธ์กลับไปหน้าเว็บทั้งหมด เพื่อให้เราเห็นว่า SlipOK ตอบว่าอะไร
        res.json({ success: true, result: response.data });

    } catch (error) {
        const errorDetail = error.response ? error.response.data : error.message;
        console.error("Error Detail:", errorDetail);
        res.status(500).json({ success: false, message: 'ตรวจสอบไม่ผ่าน', detail: errorDetail });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
