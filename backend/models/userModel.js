const db = require("../config/db");

async function createUser(username, password) {
    // Check if username already exists
    const existingUser = await getUserByUsername(username);
    if (existingUser) {
        throw new Error("Username already taken");
    }

    const sql = "INSERT INTO users (username, password) VALUES (?, ?)";
    await db.execute(sql, [username, password]);
    return { message: "User created successfully" };
}

async function getUserByUsername(username) {
    const sql = "SELECT * FROM users WHERE username = ?";
    const [rows] = await db.execute(sql, [username]);
    return rows.length > 0 ? rows[0] : null;
}

async function getId(username) {
    const sql = "SELECT id FROM users WHERE username = ?";
    const [rows] = await db.execute(sql, [username]);
    return rows.length > 0 ? rows[0].id : null;
}


module.exports = { createUser, getUserByUsername, getId };
