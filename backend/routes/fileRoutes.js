const express = require("express");
const multer = require("multer");
const fs = require("fs");
const fileService = require("../services/fileService");
const authService = require("../services/authService"); // For hashing

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

router.delete("/delete/:username/:filename", async (req, res) => {
    const { username, filename } = req.params;
    try {
        // Make sure fileService.deleteFile is implemented
        const result = await fileService.deleteFile(username, filename);
        res.json(result);
    } catch (error) {
        console.error("File deletion error:", error);
        res.status(500).json({ success: false, message: "Server error while deleting file." });
    }
});

router.get("/download/:username/:filename", async (req, res) => {
    const { username, filename } = req.params;
    const filePath = fileService.getFile(username, filename);

    if (!filePath) {
        return res.status(404).json({ message: "File not found." });
    }

    try {
        const storedHash = await fileService.getStoredFileHash(username, filename);
        if (!storedHash) {
            return res.status(404).json({ message: "File hash not found in database." });
        }

        const fileBuffer = fs.readFileSync(filePath);
        const computedHash = authService.generateSHA256(fileBuffer);

        // Compare hashes
        if (storedHash !== computedHash) {
            console.error(`File integrity check failed for ${filename}!`);
            return res.status(400).json({
                success: false,
                message: "File integrity check failed. The file may have been tampered with."
            });
        }

        res.download(filePath, filename, (err) => {
            if (err) {
                console.error("Error downloading file:", err);
                res.status(500).json({ message: "Error downloading file." });
            }
        });

    } catch (error) {
        console.error("Error verifying file integrity:", error);
        res.status(500).json({ message: "Server error while verifying file integrity." });
    }
});



// Get all files for a user (Ensure it's placed above `/details/:username/:filename`)
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

// Get details for a specific file
router.get("/details/:username/:filename", (req, res) => {
    const { username, filename } = req.params;
    const fileDetails = fileService.getFileDetails(username, filename);

    if (!fileDetails) {
        return res.status(404).json({ message: "File not found." });
    }

    res.json(fileDetails);
});

router.get("/get-filename/:username/:file_hash", async (req, res) => {
    const { username, file_hash } = req.params;
    
    try {
        const filename = await fileService.getFileNameByHash(username, file_hash);

        if (!filename) {
            return res.status(404).json({ message: "File not found." });
        }

        res.json({ filename });
    } catch (error) {
        console.error("Error fetching filename:", error);
        res.status(500).json({ message: "Server error while fetching filename." });
    }
});

router.get("/get-file-hash/:username/:filename", async (req, res) => {
    const { username, filename } = req.params;

    try {
        const fileHash = await fileService.getFileHash(username, filename);

        if (!fileHash) {
            return res.status(404).json({ message: "File hash not found." });
        }

        res.json({ file_hash: fileHash });
    } catch (error) {
        console.error("Error fetching file hash:", error);
        res.status(500).json({ message: "Server error while fetching file hash." });
    }
});



module.exports = router;