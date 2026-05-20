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
        // แก้ไข: เปลี่ยนชื่อ field จาก 'file' เป็น 'files' ตามที่ API แจ้งเตือนใน Error 1000
        form.append('files', req.file.buffer, { filename: 'slip.jpg' });

        const slipResult = await axios.post('https://api.slipok.com/api/line/apikey/66773', 
            form, 
            { 
                headers: { 
                    ...form.getHeaders(), 
                    'x-api-key': 'SLIPOKWS7CZU1' 
                } 
            }
        );

        console.log("SlipOK Success:", JSON.stringify(slipResult.data));

        if (slipResult.data && (slipResult.data.status === 'success' || slipResult.data.code === 200)) {
            const amount = slipResult.data.data ? slipResult.data.data.amount : 0;
            const { username, message } = req.body;

            await axios.post(process.env.DISCORD_WEBHOOK_URL, {
                content: `🎉 **${username}** โดเนทมา **${amount}** บาท!\nข้อความ: ${message}`
            });

            res.json({ success: true, message: `ยืนยันยอด ${amount} บาท สำเร็จ!` });
        } else {
            res.json({ success: false, message: 'สลิปไม่ถูกต้อง หรือตรวจสอบไม่ผ่าน' });
        }
    } catch (error) {
        console.error("Critical Error Detail:", error.response ? error.response.data : error.message);
        res.status(500).json({ success: false, message: 'ตรวจสอบสลิปไม่ผ่าน (รหัส 1000)' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
