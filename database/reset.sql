-- Drop the database if it exists
DROP DATABASE IF EXISTS link_drop;

-- Create a new database
CREATE DATABASE link_drop;
USE link_drop;

-- Create Users Table
CREATE TABLE `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(100) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL
);

-- Create Files Table
CREATE TABLE `files` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `file_name` VARCHAR(255) NOT NULL,
    `file_hash` VARCHAR(64) NOT NULL,
    `upload_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

INSERT INTO `users` (`username`, `password`) VALUES

('alice', 'alice123'),
('bob', 'bob123');
