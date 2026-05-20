const Jimp = require('jimp');
const QrCode = require('qrcode-reader');

// ฟังก์ชันสำหรับอ่าน QR Code จาก Buffer ของรูปภาพ
async function decodeQr(buffer) {
    const image = await Jimp.read(buffer);
    const qr = new QrCode();
    return new Promise((resolve, reject) => {
        qr.callback = (err, value) => {
            if (err) reject(err);
            else resolve(value.result);
        };
        qr.decode(image.bitmap);
    });
}

// ใน Route ของคุณ ให้ใช้แบบนี้ครับ:
app.post('/api/verify-slip', upload.single('slip'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'ไม่มีไฟล์' });

        // 1. อ่านรูปให้เป็นข้อความ QR (Payload)
        const payload = await decodeQr(req.file.buffer);

        // 2. ส่ง Payload ไปตรวจสอบ
        const result = await inquiry({
            provider: slipok({ branchId: '66773', apiKey: 'SLIPOKWS7CZU1' }),
            payload: payload
        });

        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: 'อ่าน QR ไม่เจอหรือไม่ผ่าน: ' + error.message });
    }
});
