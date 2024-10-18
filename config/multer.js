
const multer = require('multer');
const { storage } = require('./cloudinaryConfig'); // Import Cloudinary storage

// Initialize multer with Cloudinary storage
const upload = multer({ storage });

module.exports = upload;
