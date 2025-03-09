/**
 * userRoutes.js
 *
 * This module defines API endpoints for user management.
 * It provides functionality for user registration and authentication.
 *
 * Security considerations:
 * - No rate limiting is currently implemented for registration.
 * - Passwords are stored in plain text (needs hashing).
 * - Authentication should use secure session management or JWTs.
 */

const express = require("express");
const userModel = require("../models/userModel");

const router = express.Router();

/**
 * Registers a new user.
 * 
 * @route POST /register
 * @param {string} username - The desired username.
 * @param {string} password - The password for the new account.
 * @returns {object} - JSON response indicating success or failure.
 */
router.post("/register", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    try {
        await userModel.createUser(username, password);
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        if (error.message === "Username already taken") {
            return res.status(409).json({ message: "Username is already taken. Please choose another." });
        }
        console.error(error);
        res.status(500).json({ message: "Error registering user" });
    }
});

/**
 * Logs in a user.
 * 
 * @route POST /login
 * @param {string} username - The username of the account.
 * @param {string} password - The corresponding password.
 * @returns {object} - JSON response indicating success or failure.
 */
router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    try {
        const user = await userModel.getUserByUsername(username);
        if (!user || user.password !== password) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        res.json({ message: "Login successful", user: { username: user.username } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error logging in user" });
    }
});

module.exports = router;
