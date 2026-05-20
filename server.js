const express = require('express');
const axios = require('axios');
const multer = require('multer');
const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.static(__dirname));

app.post('/api/verify-slip', upload.single('slip'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'กรุณาอัปโหลดสลิป' });

        // วิธีนี้เราไม่ใช้ FormData แต่ส่งเป็น JSON
        // *หมายเหตุ: บางระบบของ SlipOK LINE ต้องการให้ส่งไฟล์เป็น Base64 หรือต้องอัปรูปขึ้นที่อื่นก่อน
        // แต่ลองส่งด้วยชื่อ field 'file' แบบเก่าในรูปแบบ JSON ดูครับ
        
        const response = await axios.post('https://api.slipok.com/api/line/apikey/66773', {
            // ลองส่งข้อมูลในรูปแบบนี้
            file: req.file.buffer.toString('base64') 
        }, {
            headers: {
                'x-api-key': 'SLIPOKWS7CZU1',
                'Content-Type': 'application/json'
            }
        });

        if (response.data && response.data.status === 'success') {
            const amount = response.data.data.amount;
            res.json({ success: true, message: `สำเร็จ! ยอด: ${amount} บาท` });
        } else {
            res.json({ success: false, message: 'ตรวจสอบไม่ผ่าน: ' + JSON.stringify(response.data) });
        }
    } catch (error) {
        console.error("Error Detail:", error.response ? error.response.data : error.message);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาด' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
