const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

// API สำหรับรับสลิปไปตรวจสอบที่ SlipOK
app.post('/verify-slip', async (req, res) => {
    const { imageRaw, name, message } = req.body;

    try {
        // ส่งไปตรวจสอบที่ SlipOK
        const slipResult = await axios.post('https://api.slipok.com/api/line/apikey/66773', {
            image: imageRaw
        }, {
            headers: { 'x-api-key': 'SLIPOKWS7CZU1' }
        });

        if (slipResult.data.data.status === 'SUCCESS') {
            const amount = slipResult.data.data.amount;
            
            // ส่งเข้า Discord (ใส่ Webhook URL ของคุณที่นี่)
            await axios.post('YOUR_DISCORD_WEBHOOK_URL', {
                content: `🎉 ${name} โดเนทมา ${amount} บาท! ข้อความ: ${message}`
            });

            res.send({ status: 'Success', amount: amount });
        } else {
            res.status(400).send({ status: 'Failed', message: 'สลิปไม่ถูกต้อง' });
        }
    } catch (error) {
        res.status(500).send({ error: 'Server Error' });
    }
});

app.listen(process.env.PORT || 3000);
