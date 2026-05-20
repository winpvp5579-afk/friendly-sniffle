const express = require('express');
const axios = require('axios');
const multer = require('multer');
const FormData = require('form-data');
const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.static(__dirname));

app.post('/api/verify-slip', upload.single('slip'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'กรุณาอัปโหลดสลิป' });

        const form = new FormData();
        form.append('files', req.file.buffer, { filename: 'slip.jpg' }); // ลองเปลี่ยนกลับเป็น 'files' ตามมาตรฐาน OpenAPI

        // โค้ดนี้ใช้สำหรับ OpenAPI (ตรวจสอบสลิป) โดยเฉพาะ
const slipResult = await axios.post('https://api.slipok.com/api/v1/openapi/verify', 
    form, 
    { 
        headers: { 
            ...form.getHeaders(), 
            'x-authorization': 'YOUR_OPENAPI_KEY_HERE' // ใส่ Key ของ OpenAPI ตรงนี้
        } 
    }
);

        res.json({ success: true, data: slipResult.data });
    } catch (error) {
        // บรรทัดนี้สำคัญมาก: มันจะบอกเราว่า SlipOK ตอบกลับมาว่าอะไร
        const errorMsg = error.response ? error.response.data : error.message;
        console.error("SlipOK Error Response:", errorMsg);
        res.status(500).json({ success: false, message: errorMsg });
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));
