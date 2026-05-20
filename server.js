const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

// จุดรับ Webhook จาก SlipOK
app.post('/webhook-slipok', async (req, res) => {
    const data = req.body;
    
    // เช็คว่าโอนเงินสำเร็จจาก SlipOK
    if (data.status === 'success') {
        try {
            // ยิงข้อมูลไปหา Streamlabs API เพื่อแสดง Alert
            await axios.post('https://streamlabs.com/api/v1.0/alerts', {
                access_token: 'D9772DDC5C67DFECA2ADBA16CD7455A391F16450893DB7E32F37AC268BA1598A4412238F643ADE9E9EA41AF9169EE5CFE18BF48C0C68FB4EB26CAF9D57585A31FE9699C7CFC68C1497025155F10DDE39E59B655CBC3924EE551EAF6A9C7B994475BF47984C3501FDCB65627550D9DD375727310203481C0EAB636B9CB5', // ใส่ Token จาก Streamlabs
                type: 'donation',
                message: `คุณ ${data.sender_name} สนับสนุน ${data.amount} บาท`,
                image_href: 'URL_ภาพ_GIF_ของคุณ',
                sound_href: 'URL_ไฟล์เสียง_ของคุณ'
            });
            res.status(200).send('OK');
        } catch (error) {
            res.status(500).send('Error');
        }
    }
});

app.listen(process.env.PORT || 3000, () => console.log('Server is running'));