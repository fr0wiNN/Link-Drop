/**
 * userModel.js
 *
 * This module handles database operations related to user management.
 * It provides functions to create users, retrieve user details, and fetch user IDs.
 *
 * Security considerations:
 * - Passwords are currently stored in plain text (must implement hashing).
 * - No input validation or sanitization is performed.
 * - Authentication should be handled securely using hashed passwords and proper session management.
 */

const db = require("../config/db");
const authService = require("../services/authService")

/**
 * Creates a new user in the database.
 * Ensures that usernames are unique before inserting a new record.
 *
 * @param {string} username - The desired username.
 * @param {string} password - The password for the new user (must be hashed for security).
 * @returns {Promise<object>} - JSON response indicating success or failure.
 */
async function createUser(username, password) {
    // Check if username already exists
    const existingUser = await getUserByUsername(username);
    if (existingUser) {
        throw new Error("Username already taken");
    }

    password_hash = await authService.hashPassword(password);

    const sql = "INSERT INTO users (username, password) VALUES (?, ?)";
    await db.execute(sql, [username, password_hash]);
    return { message: "User created successfully" };
}

/**
 * Retrieves a user record by username.
 *
 * @param {string} username - The username to search for.
 * @returns {Promise<object|null>} - User record if found, otherwise null.
 */
async function getUserByUsername(username) {
    const sql = "SELECT * FROM users WHERE username = ?";
    const [rows] = await db.execute(sql, [username]);
    return rows.length > 0 ? rows[0] : null;
}

/**
 * Retrieves the user ID for a given username.
 *
 * @param {string} username - The username whose ID is needed.
 * @returns {Promise<number|null>} - The user ID if found, otherwise null.
 */
async function getId(username) {
    const sql = "SELECT id FROM users WHERE username = ?";
    const [rows] = await db.execute(sql, [username]);
    return rows.length > 0 ? rows[0].id : null;
}


module.exports = { createUser, getUserByUsername, getId };
