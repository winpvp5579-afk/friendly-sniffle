const express = require('express');
const multer = require('multer');
const { SlipVerify } = require('slipverify');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// ใส่ API Key ที่ได้มาจากหน้า Dashboard ของ SlipVerify.com
const sv = new SlipVerify({ apiKey: 'YOUR_SLIPVERIFY_API_KEY' });

app.use(express.static(__dirname));

app.post('/api/verify-slip', upload.single('slip'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'ไม่มีไฟล์สลิป' });

        // ใช้คำสั่ง .verify() จาก SDK 
        // ระบบจะจัดการส่งข้อมูลเข้า API ที่ถูกต้องให้ทันที ไม่ต้องกังวลเรื่อง Endpoint
        const result = await sv.verify(req.file.buffer);

        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
