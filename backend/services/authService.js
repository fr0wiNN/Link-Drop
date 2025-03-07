//**
// This service should be responsible for managing the authorisation and validation processes
// 
// Prevent broken access control thru static checks oif a given string
// Manage the malicious spam of account registrations by attacker web scipting
// 
//  */

const crypto = require("crypto");
const bcrypt = require("bcrypt");

class authService {
    
    /**
     * Generates a SHA-256 hash of the provided buffer
     * @param {Buffer} buffer - The data to hash
     * @returns {string} The hex-encoded hash
     */
    static generateSHA256(buffer) {
        return crypto
            .createHash('sha256')
            .update(buffer)
            .digest('hex');
    }

    /**
     * Validates filename format. Prevent from the usage of "../" by rejecting files with slashes inside of them.
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

    static async hashPassword(password) {
        const saltRounds = 10; // Number of salt rounds (higher = more secure but slower)
        return await bcrypt.hash(password, saltRounds);
    }

    static async comparePassword(password, hashedPassword) {
        return await bcrypt.compare(password, hashedPassword);
    }
}

module.exports = authService;