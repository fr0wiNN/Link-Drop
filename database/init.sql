CREATE DATABASE link_drop;
USE link_drop;

-- Users Table
CREATE TABLE `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(100) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL
);

-- Files Table (Tracking Files Uploaded by Users)
CREATE TABLE `files` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL, -- Foreign key to `users.id`
    `file_name` VARCHAR(255) NOT NULL,
    `file_hash` VARCHAR(64) NOT NULL, -- SHA-256 hash (64 chars)
    `upload_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Auto-set upload time
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- Insert file for Alice:
---------------------------------------------------------------
-- INSERT INTO files (user_id, file_name, file_hash, file_size) 
-- VALUES (1, "test.txt", "3a4b9f...e8c2");


-- Retrieve Files for Alice
-------------------------------------------------------------
-- SELECT u.username, f.file_name, f.file_size, f.upload_time 
-- FROM files f 
-- JOIN users u ON f.user_id = u.id 
-- WHERE u.username = "Alice";