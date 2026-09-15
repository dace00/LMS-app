const multer = require('multer');
const path = require('path');

const taskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'taskUploads');
    },
    filename: (req, file, cb) => {
        const extname = path.extname(file.originalname).toLowerCase();
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + extname);
    }
});

const fileFilter = (req, file, cb) => {
    file.originalname = Buffer.from(file.originalname, 'latin1').toString('UTF-8')
    const allowedMimeTypes = ['application/pdf']
    const extname = path.extname(file.originalname).toLowerCase();
    if(allowedMimeTypes.includes(file.mimetype) && extname === '.pdf') {
        cb(null, true);
    }
    else {
        cb( new Error('Unsupported file extension'), false);
    }
}


const submitStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'submitUploads');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const uploadTask = multer({ storage: taskStorage, fileFilter: fileFilter });
const uploadSubmit = multer({ storage: submitStorage, fileFilter: fileFilter });

module.exports = { uploadTask, uploadSubmit };