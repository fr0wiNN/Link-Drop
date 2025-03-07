const express = require("express");
const userModel = require("../models/userModel");
const authService = require("../services/authService");
const rateLimit = require("express-rate-limit");

const router = express.Router();

// Configure the rate limit
const registerLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 3,             // Limit each IP to 3 requests per windowMs
    message: {
        message: "Too many accounts created from this IP, please try again later."
    }
});

// ========================
//       ROUTES
// ========================

// Apply registerLimiter to the register route
router.post("/register", registerLimiter, async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    try {
        await userModel.createUser(username, password);
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        if (error.message === "Username already taken") {
            return res
                .status(409)
                .json({ message: "Username is already taken. Please choose another." });
        }
        console.error(error);
        res.status(500).json({ message: "Error registering user" });
    }
});

router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    try {
        const user = await userModel.getUserByUsername(username);
        if (!user) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        // Compare hashed password
        const isMatch = await authService.comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        res.json({ message: "Login successful", user: { username: user.username } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error logging in user" });
    }
});

module.exports = router;
