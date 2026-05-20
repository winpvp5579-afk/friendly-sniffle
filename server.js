const express = require('express');
const axios = require('axios');
const multer = require('multer');
const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// เสิร์ฟหน้าเว็บ index.html
app.use(express.static(__dirname));

app.post('/api/verify-slip', upload.single('slip'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'กรุณาอัปโหลดสลิป' });

        // 1. แปลงไฟล์รูปภาพเป็น Base64
        const imageBase64 = req.file.buffer.toString('base64');
        
        // 2. ตรวจสอบสลิปกับ SlipOK (ใช้ API Key ของคุณ)
        const slipResult = await axios.post('https://api.slipok.com/api/line/apikey/66773', 
            { image: imageBase64 }, 
            { headers: { 'x-api-key': 'SLIPOKWS7CZU1' } }
        );

        if (slipResult.data.data.status === 'SUCCESS') {
            const amount = slipResult.data.data.amount;
            const { username, message } = req.body;

            // 3. แจ้งเตือนเข้า Discord (ใช้ตัวแปรจาก Environment Variables)
            await axios.post(process.env.DISCORD_WEBHOOK_URL, {
                content: `🎉 **${username}** โดเนทมา **${amount}** บาท!\nข้อความ: ${message}`
            });

            // 4. แจ้งเตือนเข้า Streamlabs (ใช้ตัวแปรจาก Environment Variables)
            await axios.post('https://streamlabs.com/api/v1.0/alerts', {
                access_token: process.env.STREAMLABS_TOKEN,
                type: 'donation',
                name: username,
                message: message,
                amount: amount,
                currency: 'THB'
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
