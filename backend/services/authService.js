/**
 * authService.js
 *
 * This module is responsible for managing authentication and security-related functions.
 * It provides utilities for hashing passwords, validating filenames, and generating SHA-256 hashes.
 *
 * Security considerations:
 * - Prevents directory traversal attacks by restricting filename inputs.
 * - Uses bcrypt for password hashing to ensure secure storage.
 * - Implements SHA-256 hashing for file integrity verification.
 */

const crypto = require("crypto");
const bcrypt = require("bcrypt");

class authService {
    
    /**
     * Generates a SHA-256 hash of the provided buffer.
     * Used for file integrity verification and fingerprinting.
     *
     * @param {Buffer} buffer - The data to hash.
     * @returns {string} - The hex-encoded SHA-256 hash.
     */
    static generateSHA256(buffer) {
        return crypto
            .createHash('sha256')
            .update(buffer)
            .digest('hex');
    }

    /**
     * Validates filename format. Prevent from the usage of "../" by rejecting files with slashes inside of them.
     * 
     * @param {string} filename - The name of the file
     * @returns {boolean} if the filename format is correct
     */
    static validateFilename(filename) {
        // If it's not a string or is empty, reject
        if (typeof filename !== "string" || filename.trim().length === 0) {
            return false;
        }

        // Reject if there's any slash or backslash
        if (filename.includes('/') || filename.includes('\\')) {
            return false;
        }

        return true;
    }

    /**
     * Hashes a password using bcrypt for secure storage.
     * 
     * @param {string} password - The plain-text password to hash.
     * @returns {Promise<string>} - The hashed password.
     */
    static async hashPassword(password) {
        const saltRounds = 10; // Number of salt rounds (higher = more secure but slower)
        return await bcrypt.hash(password, saltRounds);
    }

    /**
     * Compares a plain-text password with a hashed password to verify authentication.
     * 
     * @param {string} password - The plain-text password.
     * @param {string} hashedPassword - The previously hashed password.
     * @returns {Promise<boolean>} - True if the passwords match, otherwise false.
     */
    static async comparePassword(password, hashedPassword) {
        return await bcrypt.compare(password, hashedPassword);
    }
}

module.exports = authService;