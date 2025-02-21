const express = require("express");
const multer = require("multer");
const fileService = require("../services/fileService");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });


// TODO:

// Upload file API
// Unsecure - threat agent may upload files to someones storage
router.post("/upload/:username", upload.single("file"), async (req, res) => {
    const { username } = req.params;
    
    if (!req.file) { 
        return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    try {
        const result = await fileService.saveFile(username, req.file);

        res.json(result);
    } catch (error) {
        console.error("File upload error:", error);
        res.status(500).json({ success: false, message: "Server error while uploading file." });
    }
});



// Download file API
// The API might be overloaded very easly
router.get("/download/:username/:filename", (req, res) => {
    const { username, filename } = req.params;
    const filePath = fileService.getFile(username, filename);

    if (!filePath) {
        return res.status(404).json({ message: "File not found." });
    }

    res.download(filePath, filename, (err) => {
        if (err) {
            console.error("Error downloading file:", err);
            res.status(500).json({ message: "Error downloading file." });
        }
    });
});

// 🔹 Get all files for a user (Ensure it's placed above `/details/:username/:filename`)
router.get("/userfiles/:username", async (req, res) => {
    const { username } = req.params;

    try {
        const fileDetails = await fileService.getFileDetails(username);

        if (!fileDetails.success) {
            return res.status(404).json(fileDetails);
        }

        res.json(fileDetails);
    } catch (error) {
        console.error("Error fetching file details:", error);
        res.status(500).json({ success: false, message: "Server error while fetching file details." });
    }
});

// 🔹 Get details for a specific file (Ensure it's below `/userfiles/:username`)
router.get("/details/:username/:filename", (req, res) => {
    const { username, filename } = req.params;
    const fileDetails = fileService.getFileDetails(username, filename);

    if (!fileDetails) {
        return res.status(404).json({ message: "File not found." });
    }

    res.json(fileDetails);
});



module.exports = router;