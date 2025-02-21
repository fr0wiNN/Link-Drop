const db = require("../config/db");


async function addFile(user_id, file_name, file_hash) {
    // Check if a file with the same name already exists
    const checkSql = "SELECT id FROM files WHERE user_id = ? AND file_name = ?";
    const [existingFiles] = await db.execute(checkSql, [user_id, file_name]);

    if (existingFiles.length > 0) {
        return { success: false, message: `A file named '${file_name}' already exists for this user.` };
    }

    // Insert new file entry
    const insertSql = `
        INSERT INTO files (user_id, file_name, file_hash)
        VALUES (?, ?, ?)
    `;
    await db.execute(insertSql, [user_id, file_name, file_hash]);

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

module.exports = { addFile, getFilesByUserId, deleteFile };
