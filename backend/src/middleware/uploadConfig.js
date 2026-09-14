const multer = require('multer');
const path = require('path');

const taskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'taskUploads');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});


const submitStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'submitUploads');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const uploadTask = multer({ storage: taskStorage });
const uploadSubmit = multer({ storage: submitStorage });

module.exports = { uploadTask, uploadSubmit };