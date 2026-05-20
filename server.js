const express = require('express');
const axios = require('axios');
const multer = require('multer');
const path = require('path');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// 1. ส่งไฟล์ index.html ให้กับผู้ที่เข้ามาเยี่ยมชมหน้าเว็บ
app.use(express.static(__dirname));

// 2. API รับสลิปและตรวจสอบ
app.post('/api/verify-slip', upload.single('slip'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'กรุณาอัปโหลดสลิป' });

        // แปลงไฟล์เป็น Base64
        const imageBase64 = req.file.buffer.toString('base64');

        // ตรวจสอบกับ SlipOK
        const slipResult = await axios.post('https://api.slipok.com/api/line/apikey/66773', 
            { image: imageBase64 }, 
            { headers: { 'x-api-key': 'SLIPOKWS7CZU1' } } // API Key ของคุณ
        );

        // ตรวจสอบสถานะการโอน
        if (slipResult.data.data.status === 'SUCCESS') {
            const amount = slipResult.data.data.amount;
            const { username, message } = req.body;

            // ส่งเข้า Discord (ใส่ Webhook URL ของคุณที่นี่)
            await axios.post('YOUR_DISCORD_WEBHOOK_URL_HERE', {
                content: `🎉 **${username}** โดเนทมา **${amount}** บาท!\nข้อความ: ${message}`
            });

            res.json({ success: true, message: `ยืนยันยอด ${amount} บาท สำเร็จ!` });
        } else {
            res.json({ success: false, message: 'สลิปไม่ถูกต้อง หรือตรวจสอบไม่ผ่าน' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'เซิร์ฟเวอร์ขัดข้อง' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
