-- Create database if not exists
DROP DATABASE IF EXISTS energy_audit_db;
CREATE DATABASE energy_audit_db;
USE energy_audit_db;

-- Users table
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  role ENUM('ADMIN', 'MANAGER', 'USER') NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Findings table
CREATE TABLE findings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  severity ENUM('Low', 'Medium', 'High') NOT NULL,
  status ENUM('Open', 'In Progress', 'Closed') NOT NULL DEFAULT 'Open',
  created_by INT,
  assigned_to INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (assigned_to) REFERENCES users(id)
);

-- Attachments table
CREATE TABLE attachments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  finding_id INT NOT NULL,
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size INT NOT NULL,
  uploaded_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (finding_id) REFERENCES findings(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- Comments table
CREATE TABLE comments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  finding_id INT NOT NULL,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (finding_id) REFERENCES findings(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Notifications table
CREATE TABLE notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  finding_id INT NOT NULL,
  type ENUM('ASSIGNED', 'UPDATED', 'COMMENTED', 'CLOSED') NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (finding_id) REFERENCES findings(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_findings_status ON findings(status);
CREATE INDEX idx_findings_severity ON findings(severity);
CREATE INDEX idx_findings_created_by ON findings(created_by);
CREATE INDEX idx_findings_assigned_to ON findings(assigned_to);
CREATE INDEX idx_attachments_finding_id ON attachments(finding_id);
CREATE INDEX idx_comments_finding_id ON comments(finding_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_finding_id ON notifications(finding_id);

-- Create sample findings
INSERT INTO findings (title, description, severity, status)
VALUES 
  ('High Energy Consumption', 'HVAC system showing inefficient energy usage patterns', 'High', 'Open'),
  ('Lighting Issues', 'Outdated lighting fixtures in Building B', 'Medium', 'In Progress'),
  ('Equipment Maintenance', 'Regular maintenance schedule needed for power systems', 'Low', 'Open'); 