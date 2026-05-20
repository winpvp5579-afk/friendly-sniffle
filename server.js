const express = require('express');
const multer = require('multer');
const Jimp = require('jimp');
const QrCode = require('qrcode-reader');
const { inquiry } = require('slipverify');
const { slipok } = require('slipverify/providers');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// ฟังก์ชันสำหรับอ่าน QR Code จาก Buffer
async function decodeQr(buffer) {
    const image = await Jimp.read(buffer);
    const qr = new QrCode();
    return new Promise((resolve, reject) => {
        qr.callback = (err, value) => {
            if (err) reject(err);
            else if (!value) reject(new Error("ไม่พบ QR Code ในรูปภาพ"));
            else resolve(value.result);
        };
        qr.decode(image.bitmap);
    });
}

app.post('/api/verify-slip', upload.single('slip'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'ไม่มีไฟล์' });

        const payload = await decodeQr(req.file.buffer);

        const result = await inquiry({
            provider: slipok({ branchId: '66773', apiKey: 'SLIPOKWS7CZU1' }),
            payload: payload
        });

        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
