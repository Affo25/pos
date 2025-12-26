// middlewares/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

/**
 * @param {string} folderName - e.g. 'tasks' | 'events' | 'users'
 */
function createUploader(folderName) {
    const uploadDir = path.join('uploads', folderName);

    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, uniqueName + path.extname(file.originalname));
        },
    });

    const fileFilter = (req, file, cb) => {
        const allowedTypes = [
            'image/png',
            'image/jpeg',
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only PNG, JPG, PDF, DOCX or TXT files are allowed!'), false);
        }
    };

    return multer({
        storage,
        fileFilter,
        limits: { fileSize: 10 * 1024 * 1024 },
    });
}

module.exports = createUploader;
