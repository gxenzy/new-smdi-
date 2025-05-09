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