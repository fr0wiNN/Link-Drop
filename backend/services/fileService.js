/**
 * fileService.js
 *
 * This module handles file storage and retrieval operations for user files.
 * It ensures files are stored securely in a structured directory, maintains metadata in a database,
 * and provides functionality to retrieve and delete files.
 */

const fs = require("fs");
const path = require("path");
const fileModel = require("../models/fileModel");
const userModel = require("../models/userModel");

const STORAGE_PATH = path.join(__dirname, "../storage/user_data")

// Ensure storage directory exists
if (!fs.existsSync(STORAGE_PATH)) {
    fs.mkdirSync(STORAGE_PATH, { recursive: true });
}

/**
 * Saves a file for a given user.
 *
 * @param {string} username - The username of the owner of the file.
 * @param {object} file - The file object containing `originalname` and `buffer`.
 * @returns {Promise<object>} - A result object indicating success or failure.
 */
async function saveFile(username, file) {
    const userFolder = path.join(STORAGE_PATH, username);
    
    // Get the user ID
    const userId = await userModel.getId(username);
    if (!userId) {
        return { success: false, message: `User '${username}' does not exist! Cannot save file.` };
    }

    // Ensure user folder exists
    if (!fs.existsSync(userFolder)) {
        fs.mkdirSync(userFolder, { recursive: true });
    }

    // Save file locally
    const filePath = path.join(userFolder, file.originalname);
    fs.writeFileSync(filePath, file.buffer);

    // Generate hash (TODO: Implement real hashing)
    const file_hash = "e0d123e5f316bef78bfdf5a008837577";

    // Try to save file metadata in the database
    const result = await fileModel.addFile(userId, file.originalname, file_hash);

    return result;
}

/**
 * Deletes a file belonging to a user.
 *
 * @param {string} username - The username of the file owner.
 * @param {string} filename - The name of the file to be deleted.
 * @returns {Promise<object>} - A result object indicating success or failure.
 */
async function deleteFile(username, filename) {
    
    const userId = await userModel.getId(username);
    if (!userId) {
        return { success: false, message: `User '${username}' does not exist.` };
    }

    // Build the file path in the storage directory
    const filePath = path.join(STORAGE_PATH, username, filename);
    if (!fs.existsSync(filePath)) {
        return { success: false, message: "File not found in storage." };
    }

    try {
        fs.unlinkSync(filePath);
    } catch (error) {
        console.error("Error deleting file from storage:", error);
        return { success: false, message: "Error deleting file from storage." };
    }

    try {
        const dbResult = await fileModel.deleteFile(userId, filename);
        return dbResult;
    } catch (error) {
        console.error("Error deleting file record from database:", error);
        return { success: false, message: "Error deleting file record from database." };
    }
}

/**
 * Retrieves file details for a user.
 *
 * @param {string} username - The username of the file owner.
 * @returns {Promise<object>} - A result object containing a list of file details, or an error message.
 */
async function getFileDetails(username) {
    const userId = await userModel.getId(username);
    if (!userId) {
        return { success: false, message: `User '${username}' does not exist.` };
    }

    // Get all file names from DB
    const fileList = await fileModel.getFilesByUserId(userId);
    if (!fileList || fileList.length === 0) {
        return { success: true, files: [] }; // ✅ Return an empty list instead of 404
    }

    // Get file details from local storage
    const fileDetails = fileList.map(file => {
        const filePath = path.join(STORAGE_PATH, username, file.file_name);

        if (!fs.existsSync(filePath)) {
            return null; // File missing from storage
        }

        const stats = fs.statSync(filePath);
        return {
            filename: file.file_name,
            size: stats.size, // File size in bytes
            createdAt: stats.birthtime, // File creation time
            hash: "caba24f8a70cc24277bffcc27aa952723fbf369f315b9657eebf7c7e42b7a1f9"
        };
    }).filter(file => file !== null); // Remove missing files

    return { success: true, files: fileDetails };
}

/**
 * Retrieves a file path for a given user and filename.
 *
 * @param {string} username - The username of the file owner.
 * @param {string} filename - The name of the file to retrieve.
 * @returns {string|null} - The file path if the file exists, otherwise null.
 */
function getFile(username, filename) {
    const filePath = path.join(STORAGE_PATH, username, filename);

    if (!fs.existsSync(filePath)) {
        return null; // File does not exist
    }

    return filePath;
}


module.exports = { saveFile, deleteFile, getFileDetails, getFile };