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
const authService = require("./authService");


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

    // Generate SHA-256 hash of the file
    const file_hash = authService.generateSHA256(file.buffer);

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
    // Get the user ID first
    const userId = await userModel.getId(username);
    if (!userId) {
        return { success: false, message: `User '${username}' does not exist.` };
    }

    // Build the file path in the storage directory
    const filePath = path.join(STORAGE_PATH, username, filename);
    if (!fs.existsSync(filePath)) {
        return { success: false, message: "File not found in storage." };
    }

    // Try to remove the file from the file system
    try {
        fs.unlinkSync(filePath);
    } catch (error) {
        console.error("Error deleting file from storage:", error);
        return { success: false, message: "Error deleting file from storage." };
    }

    // Now remove the file record from the database.
    // Make sure fileModel.deleteFile is implemented to remove a file record for a given user.
    try {
        const dbResult = await fileModel.deleteFile(userId, filename);
        return dbResult;
    } catch (error) {
        console.error("Error deleting file record from database:", error);
        return { success: false, message: "Error deleting file record from database." };
    }
}

/**
 * Retrieves details of a specific file for a given user.
 * Fetches metadata from the database and verifies file integrity.
 *
 * @param {string} username - The username of the file owner.
 * @param {string} filename - The name of the file to retrieve details for.
 * @returns {Promise<object|null>} - File metadata including size, creation date, and hash, or null if not found.
 */
async function getSingleFileDetails(username, filename) {
    const userId = await userModel.getId(username);
    if (!userId) {
        return null;
    }

    // Fetch single file metadata from DB
    const fileList = await fileModel.getFilesByUserId(userId);
    const fileRecord = fileList.find(file => file.file_name === filename);

    if (!fileRecord) {
        return null;
    }

    // Generate file path
    const filePath = path.join(STORAGE_PATH, username, filename);

    if (!fs.existsSync(filePath)) {
        return null; // File missing
    }

    // Read file content and compute hash **exactly as getFileDetails() does**
    const fileContent = fs.readFileSync(filePath);
    const fileHash = authService.generateSHA256(fileContent);

    return {
        filename: filename,
        size: fs.statSync(filePath).size, // Ensure file size is also consistent
        createdAt: fs.statSync(filePath).birthtime, // File creation time
        hash: fileHash // Use freshly computed hash
    };
}


async function getFileDetails(username) {
    const userId = await userModel.getId(username);
    if (!userId) {
        return { success: false, message: `User '${username}' does not exist.` };
    }

    // Get all file names from DB
    const fileList = await fileModel.getFilesByUserId(userId);
    if (!fileList || fileList.length === 0) {
        return { success: true, files: [] }; 
    }

    // Get file details from local storage
    const fileDetails = fileList.map(file => {
        const filePath = path.join(STORAGE_PATH, username, file.file_name);

        if (!fs.existsSync(filePath)) {
            return null; // File missing from storage
        }

        // Read file content and generate hash
        const fileContent = fs.readFileSync(filePath);
        const fileHash = authService.generateSHA256(fileContent);

        const stats = fs.statSync(filePath);
        return {
            filename: file.file_name,
            size: stats.size, // File size in bytes
            createdAt: stats.birthtime, // File creation time
            hash: fileHash
        };
    }).filter(file => file !== null); // Remove missing files

    return { success: true, files: fileDetails };
}

/**
 * Retrieves the stored hash of a file from the database.
 * This is used to compare with the dynamically computed hash for integrity verification.
 *
 * @param {string} username - The username of the file owner.
 * @param {string} filename - The name of the file.
 * @returns {Promise<string|null>} - The stored hash if found, otherwise null.
 */
async function getStoredFileHash(username, filename) {
    const userId = await userModel.getId(username);
    if (!userId) {
        return null;
    }

    // Fetch the stored hash from the database
    const storedHash = await fileModel.getFileHash(userId, filename);
    if (!storedHash) {
        return null; // File not found in DB
    }

    return storedHash;
}


function getFile(username, filename) {
    const filePath = path.join(STORAGE_PATH, username, filename);

    if (!fs.existsSync(filePath)) {
        return null; // File does not exist
    }

    return filePath;
}

/**
 * Retrieves the filename associated with a given file hash for a specific user.
 * 
 * @param {number} user_id - The user ID associated with the file.
 * @param {string} file_hash - The hash of the file.
 * @returns {Promise<string|null>} - The filename if found, otherwise null.
 */
async function getFileNameByHash(user_id, file_hash) {
    return fileModel.getFileNameByHash(user_id, file_hash);
}

/**
 * Retrieves the hash of a specific file for a given user.
 * Fetches the hash from the database based on the filename.
 *
 * @param {string} username - The username of the file owner.
 * @param {string} filename - The name of the file.
 * @returns {Promise<string>} - The file hash.
 * @throws {Error} - Throws an error if the user does not exist.
 */
async function getFileHash(username, filename) {
    const user_id = await userModel.getId(username);

    if (!user_id) {
        throw new Error("User not found"); // Handle case where user doesn't exist
    }

    return fileModel.getFileHash(user_id, filename);
}

module.exports = { saveFile, deleteFile, getFileDetails, getFile, getSingleFileDetails, getStoredFileHash, getFileNameByHash, getFileHash };