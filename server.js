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
        form.append('image', req.file.buffer, { filename: 'slip.jpg' });

        // เปลี่ยน header เป็น x-authorization ตามมาตรฐาน OpenAPI ของ SlipOK
        const slipResult = await axios.post('https://api.slipok.com/api/v1/openapi/verify', 
            form, 
            { 
                headers: { 
                    ...form.getHeaders(), 
                    'x-authorization': 'SLIPOKWS7CZU1' 
                } 
            }
        );

        if (slipResult.data && slipResult.data.status === 'success') {
            const amount = slipResult.data.data.amount;
            const { username, message } = req.body;

            await axios.post(process.env.DISCORD_WEBHOOK_URL, {
                content: `🎉 **${username}** โดเนทมา **${amount}** บาท!\nข้อความ: ${message}`
            });

            res.json({ success: true, message: `ยืนยันยอด ${amount} บาท สำเร็จ!` });
        } else {
            res.status(400).json({ success: false, message: 'สลิปไม่ถูกต้อง' });
        }
    } catch (error) {
        console.error("Critical Error Detail:", error.response ? JSON.stringify(error.response.data) : error.message);
        res.status(500).json({ success: false, message: 'ตรวจสอบสลิปไม่ผ่าน' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
