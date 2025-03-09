/**
 * fileRoutes.js
 *
 * This module defines the API endpoints for file management.
 * It allows users to upload, delete, download, and retrieve file details.
 * 
 * Security considerations:
 * - The upload API currently lacks authentication, allowing unauthorized uploads.
 * - Downloading files directly can overload the API.
 * - File management should include access control to prevent misuse.
 */

const express = require("express");
const multer = require("multer");
const fileService = require("../services/fileService");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * Uploads a file for a given user.
 * 
 * @route POST /upload/:username
 * @param {string} username - The username of the file owner.
 * @param {file} file - The file being uploaded (multipart/form-data).
 * @returns {object} - JSON response indicating success or failure.
 */
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

/**
 * Deletes a file for a given user.
 * 
 * @route DELETE /delete/:username/:filename
 * @param {string} username - The username of the file owner.
 * @param {string} filename - The name of the file to delete.
 * @returns {object} - JSON response indicating success or failure.
 */
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

/**
 * Downloads a file for a given user.
 * 
 * @route GET /download/:username/:filename
 * @param {string} username - The username of the file owner.
 * @param {string} filename - The name of the file to download.
 * @returns {file} - Sends the requested file if found.
 */
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

/**
 * Retrieves a list of all files belonging to a user.
 * 
 * @route GET /userfiles/:username
 * @param {string} username - The username whose files should be listed.
 * @returns {object} - JSON response containing file details or an error message.
 */
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

/**
 * Retrieves details of a specific file for a user.
 * 
 * @route GET /details/:username/:filename
 * @param {string} username - The username of the file owner.
 * @param {string} filename - The name of the file to retrieve details for.
 * @returns {object} - JSON response containing file metadata or an error message.
 */
router.get("/details/:username/:filename", (req, res) => {
    const { username, filename } = req.params;
    const fileDetails = fileService.getFileDetails(username, filename);

    if (!fileDetails) {
        return res.status(404).json({ message: "File not found." });
    }

    res.json(fileDetails);
});



module.exports = router;