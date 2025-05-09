USE energyauditdb;

-- Create power readings table
CREATE TABLE IF NOT EXISTS power_readings (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  timestamp TIMESTAMP NOT NULL,
  power_usage DECIMAL(10, 2) NOT NULL,
  voltage DECIMAL(6, 2) NOT NULL,
  current DECIMAL(6, 2) NOT NULL,
  power_factor DECIMAL(4, 2) NOT NULL,
  frequency DECIMAL(4, 2) NOT NULL,
  temperature DECIMAL(4, 1) NOT NULL,
  humidity DECIMAL(4, 1) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add sample data for testing
INSERT INTO power_readings (timestamp, power_usage, voltage, current, power_factor, frequency, temperature, humidity)
VALUES 
  (DATE_SUB(NOW(), INTERVAL 1 HOUR), 45.5, 220.5, 0.21, 0.92, 60.1, 24.5, 55.0),
  (DATE_SUB(NOW(), INTERVAL 50 MINUTE), 48.2, 221.0, 0.22, 0.91, 60.0, 24.8, 54.5),
  (DATE_SUB(NOW(), INTERVAL 40 MINUTE), 52.1, 219.8, 0.24, 0.90, 59.9, 25.0, 54.0),
  (DATE_SUB(NOW(), INTERVAL 30 MINUTE), 55.8, 220.2, 0.25, 0.89, 60.0, 25.2, 53.5),
  (DATE_SUB(NOW(), INTERVAL 20 MINUTE), 58.4, 220.5, 0.26, 0.88, 60.1, 25.5, 53.0),
  (DATE_SUB(NOW(), INTERVAL 10 MINUTE), 54.2, 220.0, 0.25, 0.89, 60.0, 25.3, 53.2),
  (NOW(), 51.5, 220.3, 0.23, 0.90, 60.0, 25.0, 53.5); 