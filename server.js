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

        // เตรียม FormData สำหรับส่งไฟล์ให้ SlipOK
        const form = new FormData();
        form.append('files', req.file.buffer, { filename: 'slip.jpg' });

        // เรียก SlipOK ด้วย Endpoint ที่ถูกต้อง
        const slipResult = await axios.post('https://api.slipok.com/api/v1/openapi/verify', 
            form, 
            { 
                headers: { 
                    ...form.getHeaders(), 
                    'x-api-key': 'SLIPOKWS7CZU1' 
                } 
            }
        );

        // ตรวจสอบสถานะการโอนเงิน
        if (slipResult.data && slipResult.data.data && slipResult.data.data.status === 'SUCCESS') {
            const amount = slipResult.data.data.amount;
            const { username, message } = req.body;

            // แจ้งเตือน Discord
            await axios.post(process.env.DISCORD_WEBHOOK_URL, {
                content: `🎉 **${username}** โดเนทมา **${amount}** บาท!\nข้อความ: ${message}`
            });

            // แจ้งเตือน Streamlabs
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
        console.error("Error Detail:", error.response ? error.response.data : error.message);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการตรวจสอบสลิป' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
