// backend/routes/imageRoutes.js
const express = require("express");
const fs = require("fs");
const path = require("path");
const upload = require("../config/multer");

const router = express.Router();

//Route to hand image upload
router.post("/image-upload", upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400)
                .json({ error: true, message: "No image uploaded" });
        }
        const imageUrl = `http://localhost:8000/uploads/${req.file.filename}`;
        res.status(200).json({ imageUrl });
    } catch (error) {
        res.status(500).json({ error: true, message: error.message });
    }
});

module.exports = router;
