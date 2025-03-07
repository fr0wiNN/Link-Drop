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



// TODO
// Functions to implement:

// get file details to improve UI 
// getFileDetails(username:str):{filename, date, size, ...}

// return file for person trying to download it 
// getFile():

// TODO 
// Unsecure version:
// Exposed API channels with no tunnel encryption nor authorisation
// Potentially malicious file content - scripts with auto execution
// Huge files would go thru this API, clogging up the connection and server storage  

// Secure version:
// Secure frontend-backend connection with user authorisation and encrypted communication
// Scanning the file for any malicious content/format/size - refuse connection.
// Report/log the traffic on this service

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

    // 🔥 Read file content and compute hash **exactly as getFileDetails() does**
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

async function getFileNameByHash(user_id, file_hash) {
    return fileModel.getFileNameByHash(user_id, file_hash);
}

async function getFileHash(username, filename){
    return fileModel.getFileHash(userModel.getId(username), filename);
}

module.exports = { saveFile, deleteFile, getFileDetails, getFile, getSingleFileDetails, getStoredFileHash, getFileNameByHash, getFileHash };