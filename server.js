const express = require('express');
const axios = require('axios');
const multer = require('multer');
const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// เสิร์ฟหน้าเว็บ index.html ที่คุณทำไว้
app.use(express.static('.'));

app.post('/api/verify-slip', upload.single('slip'), async (req, res) => {
    try {
        // 1. แปลงไฟล์รูปภาพเป็น Base64 เพื่อส่งให้ SlipOK
        const imageBase64 = req.file.buffer.toString('base64');
        
        // 2. ตรวจสอบสลิปกับ SlipOK
        const slipResult = await axios.post('https://api.slipok.com/api/line/apikey/66773', {
            image: imageBase64
        }, {
            headers: { 'x-api-key': 'SLIPOKWS7CZU1' } // API Key ของคุณ
        });

        // 3. ถ้าโอนจริง (ตรวจสอบสถานะ)
        if (slipResult.data.data.status === 'SUCCESS') {
            const { amount } = slipResult.data.data;
            const { username, message } = req.body;

            // 4. ส่งเข้า Discord (นำ Webhook URL ของคุณมาใส่ตรงนี้)
            await axios.post('YOUR_DISCORD_WEBHOOK_URL_HERE', {
                content: `🎉 **${username}** โดเนทมา **${amount}** บาท!\nข้อความ: ${message}`
            });

            res.json({ success: true, message: 'ยืนยันการโอนเงินสำเร็จ!' });
        } else {
            res.json({ success: false, message: 'ตรวจสอบสลิปไม่ผ่านหรือสลิปไม่ถูกต้อง' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการตรวจสอบ' });
    }
});

app.listen(process.env.PORT || 3000);
