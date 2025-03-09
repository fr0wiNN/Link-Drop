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


async function addFile(user_id, file_name, file_hash) {
    // Check if a file with the same name already exists
    const checkSql = "SELECT id FROM files WHERE user_id = ? AND file_name = ?";
    const [existingFiles] = await db.execute(checkSql, [user_id, file_name]);

    if (existingFiles.length > 0) {
        return { success: false, message: `A file named '${file_name}' already exists for this user.` };
    }

    const insertSqlFixed = `
        INSERT INTO files (user_id, file_name, file_hash)
        VALUES (?, ?, ?)
    `;
    await db.execute(insertSqlFixed, [user_id, file_name, file_hash]);

    return { success: true, message: "File added successfully" };
}


async function getFilesByUserId(user_id) {
    const sql = "SELECT file_name FROM files WHERE user_id = ?";
    const [rows] = await db.execute(sql, [user_id]);
    return rows;
}


async function deleteFile(user_id, file_name) {
    const sql = "DELETE FROM files WHERE user_id = ? AND file_name = ?";
    await db.execute(sql, [user_id, file_name]);
    return { message: "File deleted successfully" };
}

async function getFileHash(user_id, file_name) {
    const sql = "SELECT file_hash FROM files WHERE user_id = ? AND file_name = ?";
    const [rows] = await db.execute(sql, [user_id, file_name]);

    if (rows.length === 0) {
        return null; // File not found in DB
    }
    return rows[0].file_hash;
}

async function getFileNameByHash(username, file_hash) {
    const sql = "SELECT file_name FROM files WHERE user_id = (SELECT id FROM users WHERE username = ?) AND file_hash = ?";
    const [rows] = await db.execute(sql, [username, file_hash]);

    if (rows.length === 0) {
        return null; // File not found
    }
    return rows[0].file_name;
}

module.exports = { addFile, getFilesByUserId, deleteFile, getFileHash, getFileNameByHash };


