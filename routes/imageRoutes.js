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

//delete an image from uploads folder
router.delete("/delete-image", async (req, res) => {
    const { imageUrl } = req.query;
    if (!imageUrl) {
        return res.status(400)
            .json({ error: true, message: "ImageUrl parameter is required" });
    }
    try {
        //Extract the filename from the imageUrl
        const filename = path.basename(imageUrl);
        //define the file path
        const filePath = path.join(__dirname, '../uploads', filename);

        //check if file exists
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            res.status(200).json({ message: "Image deleted successfully" });
        } else {
            res.status(400).json({ error: true, message: "Image not found" });
        }
    } catch (error) {
        res.status(500).json({ error: true, message: error.message });
    }
});
module.exports = router;
