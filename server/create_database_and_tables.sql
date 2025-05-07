CREATE DATABASE IF NOT EXISTS smdidb;

USE smdidb;

CREATE TABLE IF NOT EXISTS MonitoringDevice (
    deviceId VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    type ENUM('meter', 'sensor', 'analyzer') NOT NULL,
    status ENUM('active', 'inactive', 'maintenance') DEFAULT 'active',
    lastCalibration DATETIME
);

CREATE TABLE IF NOT EXISTS EnergyReading (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timestamp DATETIME NOT NULL,
    consumption FLOAT NOT NULL,
    voltage FLOAT NOT NULL,
    current FLOAT NOT NULL,
    powerFactor FLOAT NOT NULL,
    location VARCHAR(255) NOT NULL,
    deviceId VARCHAR(255),
    FOREIGN KEY (deviceId) REFERENCES MonitoringDevice(deviceId)
);
