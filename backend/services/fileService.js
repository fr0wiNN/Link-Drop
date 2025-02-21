const fs = require("fs");
const path = require("path");
const fileModel = require("../models/fileModel");
const userModel = require("../models/userModel");


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

    // Generate hash (TODO: Implement real hashing)
    const file_hash = "e0d123e5f316bef78bfdf5a008837577";

    // Try to save file metadata in the database
    const result = await fileModel.addFile(userId, file.originalname, file_hash);

    return result;
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

async function getFileDetails(username) {
    const userId = await userModel.getId(username);
    if (!userId) {
        return { success: false, message: `User '${username}' does not exist.` };
    }

    // 🔹 Get all file names from DB
    const fileList = await fileModel.getFilesByUserId(userId);
    if (!fileList || fileList.length === 0) {
        return { success: true, files: [] }; // ✅ Return an empty list instead of 404
    }

    // 🔹 Get file details from local storage
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


function getFile(username, filename) {
    const filePath = path.join(STORAGE_PATH, username, filename);

    if (!fs.existsSync(filePath)) {
        return null; // File does not exist
    }

    return filePath;
}


module.exports = { saveFile, getFileDetails, getFile };