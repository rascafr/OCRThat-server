const tesseract = require('node-tesseract-ocr');
const express = require('express');
const app = express();
var multer = require('multer');
const IMG_DEST = __dirname + '/file/uploads/';
app.use(multer({
    dest: IMG_DEST
}).any());

const port = 4242;

app.post('/ocrThat', (req, res) => {
    console.log('ocrThat called')
    let files = req.files;
    if (files.length === 1) {
        let file = files[0];
        tesseract.recognize(file.path).then(data => {
            console.log(data);
        });
    }
    console.log(req.files)
    res.send('OCR will be... one day')
})

app.listen(port, () => console.log(`OCRThat app listening on port ${port}!`))