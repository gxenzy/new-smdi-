-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS energyauditdb;

-- Use the database
USE energyauditdb;

-- Create user if it doesn't exist and grant privileges
-- CREATE USER IF NOT EXISTS 'smdi'@'localhost' IDENTIFIED BY 'SMD1SQLADM1N';
-- GRANT ALL PRIVILEGES ON energyauditdb.* TO 'smdi'@'localhost';
-- FLUSH PRIVILEGES;

-- You can add your table creation scripts here
-- Example:
-- CREATE TABLE users (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     username VARCHAR(255) NOT NULL,
--     password VARCHAR(255) NOT NULL
-- );
