-- Create system settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS system_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(255) NOT NULL,
  setting_value TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_setting_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default settings
INSERT INTO `system_settings` (`setting_key`, `setting_value`) VALUES
  ('siteName', 'Energy Audit System'),
  ('maxUsers', '100'),
  ('sessionTimeout', '30'),
  ('backupFrequency', '24'),
  ('emailNotifications', 'true'),
  ('maintenanceMode', 'false'),
  ('emergencyMode', 'false'),
  ('debugMode', 'false'),
  ('apiUrl', 'http://localhost:8000'),
  ('allowRegistration', 'false'),
  ('registrationEnabled', 'false'),
  ('theme', 'light'),
  ('defaultRole', 'viewer'),
  ('maxLoginAttempts', '5'),
  ('passwordPolicy.minLength', '8'),
  ('passwordPolicy.requireSpecialChar', 'true'),
  ('passwordPolicy.requireNumber', 'true'),
  ('passwordPolicy.requireUppercase', 'true'),
  ('passwordPolicy.requireLowercase', 'true')
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`); 