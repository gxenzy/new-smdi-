-- Standards Reference System Tables

-- Standards table
CREATE TABLE IF NOT EXISTS standards (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  code_name VARCHAR(50) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  version VARCHAR(50) NOT NULL,
  issuing_body VARCHAR(255) NOT NULL,
  effective_date DATE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Sections table (hierarchical structure)
CREATE TABLE IF NOT EXISTS standard_sections (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  standard_id INT UNSIGNED NOT NULL,
  section_number VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  parent_section_id INT UNSIGNED,
  content TEXT,
  has_tables BOOLEAN DEFAULT FALSE,
  has_figures BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (standard_id) REFERENCES standards(id),
  FOREIGN KEY (parent_section_id) REFERENCES standard_sections(id) ON DELETE SET NULL
);

-- Tables in standards
CREATE TABLE IF NOT EXISTS standard_tables (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  section_id INT UNSIGNED NOT NULL,
  table_number VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content JSON NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (section_id) REFERENCES standard_sections(id) ON DELETE CASCADE
);

-- Figures in standards
CREATE TABLE IF NOT EXISTS standard_figures (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  section_id INT UNSIGNED NOT NULL,
  figure_number VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  image_path VARCHAR(255) NOT NULL,
  caption TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (section_id) REFERENCES standard_sections(id) ON DELETE CASCADE
);

-- Keywords for search functionality
CREATE TABLE IF NOT EXISTS standard_keywords (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  keyword VARCHAR(100) NOT NULL,
  weight INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_keyword (keyword)
);

-- Many-to-many relationship between sections and keywords
CREATE TABLE IF NOT EXISTS section_keywords (
  section_id INT UNSIGNED NOT NULL,
  keyword_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (section_id, keyword_id),
  FOREIGN KEY (section_id) REFERENCES standard_sections(id) ON DELETE CASCADE,
  FOREIGN KEY (keyword_id) REFERENCES standard_keywords(id) ON DELETE CASCADE
);

-- Compliance requirements linked to sections
CREATE TABLE IF NOT EXISTS compliance_requirements (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  section_id INT UNSIGNED NOT NULL,
  requirement_type ENUM('mandatory', 'prescriptive', 'performance') NOT NULL,
  description TEXT NOT NULL,
  verification_method TEXT,
  severity ENUM('critical', 'major', 'minor') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (section_id) REFERENCES standard_sections(id) ON DELETE CASCADE
);

-- Educational resources linked to sections
CREATE TABLE IF NOT EXISTS educational_resources (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  section_id INT UNSIGNED NOT NULL,
  resource_type ENUM('video', 'article', 'case_study', 'webinar', 'guide', 'tool') NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  url VARCHAR(500) NOT NULL,
  difficulty ENUM('beginner', 'intermediate', 'advanced'),
  duration VARCHAR(50),
  tags VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (section_id) REFERENCES standard_sections(id) ON DELETE CASCADE
);

-- User bookmarks for standards sections
CREATE TABLE IF NOT EXISTS standard_bookmarks (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  section_id INT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (section_id) REFERENCES standard_sections(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_section (user_id, section_id)
);

-- User notes on standard sections
CREATE TABLE IF NOT EXISTS standard_notes (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  section_id INT UNSIGNED NOT NULL,
  note_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (section_id) REFERENCES standard_sections(id) ON DELETE CASCADE
);

-- Create standard metadata table
CREATE TABLE IF NOT EXISTS standard_metadata (
  standard_id INT UNSIGNED NOT NULL,
  `key` VARCHAR(100) NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (standard_id, `key`),
  FOREIGN KEY (standard_id) REFERENCES standards(id) ON DELETE CASCADE
);










