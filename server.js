const express = require('express');
const multer = require('multer');
// 1. นำเข้า Library ที่จำเป็น
const { inquiry } = require('slipverify');
const { slipok } = require('slipverify/providers');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.static(__dirname));

// 2. สร้าง Endpoint สำหรับรับรูปภาพสลิป
app.post('/api/verify-slip', upload.single('slip'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'ไม่มีไฟล์' });

        // 3. ตรงนี้คือจุดที่คุณต้องเอา Payload มาใส่
        // หมายเหตุ: Library นี้ต้องการ Payload (สตริง QR Code)
        // ถ้าคุณยังไม่มีระบบอ่าน QR Code จากรูป ผมแนะนำให้ใช้ Library เพิ่มเติม
        const result = await inquiry({
            provider: slipok({ 
                branchId: '66773', // ใส่เลขสาขาของคุณ
                apiKey: 'SLIPOKWS7CZU1' // ใส่ API Key ของคุณ
            }),
            payload: '000201...' // ตรงนี้ต้องเป็นค่า QR Code ที่อ่านได้จากไฟล์รูป
        });

        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));
