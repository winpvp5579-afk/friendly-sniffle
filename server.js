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
        form.append('file', req.file.buffer, { filename: 'slip.jpg' });

        // เรียก API
        const slipResult = await axios.post('https://api.slipok.com/api/line/apikey/66773', 
            form, 
            { 
                headers: { 
                    ...form.getHeaders(), 
                    'x-api-key': 'SLIPOKWS7CZU1' 
                } 
            }
        );

        // --- เพิ่มจุดเช็ค Log เพื่อให้รู้ว่า SlipOK ตอบกลับมาว่าอะไร ---
        console.log("SlipOK Response Data:", JSON.stringify(slipResult.data));

        // ตรวจสอบเงื่อนไขให้กว้างขึ้นเผื่อกรณีที่สถานะไม่ได้ส่งมาเป็น 'success'
        if (slipResult.data && (slipResult.data.status === 'success' || slipResult.data.code === 200)) {
            const amount = slipResult.data.data ? slipResult.data.data.amount : 0;
            const { username, message } = req.body;

            await axios.post(process.env.DISCORD_WEBHOOK_URL, {
                content: `🎉 **${username}** โดเนทมา **${amount}** บาท!\nข้อความ: ${message}`
            });

            res.json({ success: true, message: `ยืนยันยอด ${amount} บาท สำเร็จ!` });
        } else {
            console.error("SlipOK Failed Response:", slipResult.data);
            res.json({ success: false, message: 'สลิปไม่ถูกต้อง หรือตรวจสอบไม่ผ่าน' });
        }
    } catch (error) {
        // บันทึก Error ละเอียดๆ ลง Log
        console.error("Critical Error Detail:", error.response ? error.response.data : error.message);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการตรวจสอบสลิป' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
