/**
 * fileModel.js
 *
 * This module handles database operations related to file management.
 * It provides functions to add, retrieve, and delete file records associated with users.
 *
 * Security considerations:
 * - The current implementation includes an unsafe SQL query (`insertSqlWeak`), which is vulnerable to SQL injection.
 * - Always use parameterized queries (`execute`) instead of direct query string concatenation.
 */

const db = require("../config/db");

/**
 * Adds a file record to the database.
 * Ensures that duplicate file names are not allowed for the same user.
 *
 * @param {number} user_id - The ID of the user owning the file.
 * @param {string} file_name - The name of the file.
 * @param {string} file_hash - The hash of the file (for integrity verification).
 * @returns {Promise<object>} - JSON response indicating success or failure.
 */
async function addFile(user_id, file_name, file_hash) {

    // Check if a file with the same name already exists
    const checkSql = "SELECT id FROM files WHERE user_id = ? AND file_name = ?";
    const [existingFiles] = await db.execute(checkSql, [user_id, file_name]);

    if (existingFiles.length > 0) {
        return { success: false, message: `A file named '${file_name}' already exists for this user.` };
    }

    // Weak version, prone to injection
    const insertSqlWeak = `INSERT INTO files (user_id, file_name, file_hash) VALUES (${user_id}, '${file_name}', '${file_hash}');`;
    await db.query(insertSqlWeak);

    return { success: true, message: "File added successfully" };
}

/**
 * Retrieves all file names associated with a given user.
 *
 * @param {number} user_id - The ID of the user whose files should be listed.
 * @returns {Promise<Array>} - A list of file names belonging to the user.
 */
async function getFilesByUserId(user_id) {
    const sql = "SELECT file_name FROM files WHERE user_id = ?";
    const [rows] = await db.execute(sql, [user_id]);
    return rows;
}

/**
 * Deletes a file record from the database.
 *
 * @param {number} user_id - The ID of the user owning the file.
 * @param {string} file_name - The name of the file to delete.
 * @returns {Promise<object>} - JSON response indicating success.
 */
async function deleteFile(user_id, file_name) {
    const sql = "DELETE FROM files WHERE user_id = ? AND file_name = ?";
    await db.execute(sql, [user_id, file_name]);
    return { message: "File deleted successfully" };
}

module.exports = { addFile, getFilesByUserId, deleteFile };
