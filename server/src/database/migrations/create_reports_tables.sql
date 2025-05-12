-- Reports related tables for the Energy Audit Platform

-- Reports table - stores metadata about generated reports
CREATE TABLE IF NOT EXISTS reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type ENUM('energy_audit', 'lighting', 'hvac', 'equipment', 'power_factor', 'harmonic', 'schedule_of_loads', 'custom') NOT NULL,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_template BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT FALSE,
  version INT DEFAULT 1,
  status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Report content table - stores the actual content/components of the report
CREATE TABLE IF NOT EXISTS report_contents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  report_id INT NOT NULL,
  content_type ENUM('text', 'chart', 'table', 'image', 'section_header', 'page_break', 'toc', 'custom') NOT NULL,
  content JSON NOT NULL, -- Stores the actual content data in JSON format
  order_index INT NOT NULL, -- For ordering components within the report
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
);

-- Report metadata table - stores additional metadata about the report
CREATE TABLE IF NOT EXISTS report_metadata (
  id INT AUTO_INCREMENT PRIMARY KEY,
  report_id INT NOT NULL,
  client_name VARCHAR(255),
  facility_name VARCHAR(255),
  audit_date DATE,
  auditor_name VARCHAR(255),
  company_logo VARCHAR(255), -- Path to the company logo file
  executive_summary TEXT,
  cover_image VARCHAR(255), -- Path to the cover image
  include_appendices BOOLEAN DEFAULT TRUE,
  include_toc BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
);

-- Report sharing table - manages sharing of reports between users
CREATE TABLE IF NOT EXISTS report_sharing (
  id INT AUTO_INCREMENT PRIMARY KEY,
  report_id INT NOT NULL,
  user_id INT NOT NULL, -- User the report is shared with
  permission ENUM('view', 'edit', 'admin') NOT NULL DEFAULT 'view',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INT NOT NULL, -- User who shared the report
  FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Report templates table - links to standard report templates
CREATE TABLE IF NOT EXISTS report_templates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail VARCHAR(255), -- Path to template thumbnail image
  report_type ENUM('energy_audit', 'lighting', 'hvac', 'equipment', 'power_factor', 'harmonic', 'schedule_of_loads', 'custom') NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Create indexes for better performance
CREATE INDEX idx_reports_created_by ON reports(created_by);
CREATE INDEX idx_reports_type ON reports(type);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_report_contents_report_id ON report_contents(report_id);
CREATE INDEX idx_report_metadata_report_id ON report_metadata(report_id);
CREATE INDEX idx_report_sharing_report_id ON report_sharing(report_id);
CREATE INDEX idx_report_sharing_user_id ON report_sharing(user_id);
CREATE INDEX idx_report_templates_report_type ON report_templates(report_type); 