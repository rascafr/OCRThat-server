const tesseract = require('node-tesseract-ocr');
const express = require('express');
const app = express();
const multer = require('multer');
const PostOCR = require('./PostOCR');

const IMG_DEST = __dirname + '/file/uploads/';
app.use(multer({
    dest: IMG_DEST
}).any());

const port = 4242;

const args = process.argv;

if (args.length > 2) {
    let path = args[2];
    console.log('Test mode: will perform OCR on', path);
    startOCR(path).then(res => {
        console.log(res);
    });
    return;
}

app.post('/ocrThat', (req, res) => {
    let files = req.files;
    if (files.length === 1) {
        let file = files[0];
        startOCR(file.path).then(data => {
            console.log('Processed document,', data.parags, 'paragraphs in', data.duration, 'ms');
            res.send(JSON.stringify(data));
        }).catch(err => {
            console.log('Error during OCR sequence', err);
            res.statusCode = 500;
            res.send('Server error occurred during OCR sequence');
        });
    } else {
        res.statusCode = 418;
        res.send('One image document is required');
    }
});

function startOCR(path) {
    return new Promise((resolve, reject) => {
        const t1 = new Date();
        tesseract.recognize(path).then(data => {
            let obj = PostOCR.runTasks([data]);
            obj.duration = (new Date() - t1);
            resolve(obj);
        }).catch(reject);
    });
}

app.listen(port, () => console.log(`OCRThat app listening on port ${port}!`))