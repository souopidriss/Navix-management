CREATE TABLE file_types (
  id CHAR(26) PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  extensions JSON NOT NULL,
  mime_types JSON,
  max_size INT UNSIGNED NOT NULL DEFAULT 10485760,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_file_type_title (title)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE files (
  id CHAR(26) PRIMARY KEY,
  company_id CHAR(26) NOT NULL,
  file_type_id CHAR(26) NOT NULL,
  file_number VARCHAR(20),
  name VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  path VARCHAR(500) NOT NULL,
  directory VARCHAR(500),
  extension VARCHAR(10) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size BIGINT UNSIGNED NOT NULL DEFAULT 0,
  width INT UNSIGNED,
  height INT UNSIGNED,
  thumbnail VARCHAR(500),
  url VARCHAR(500),
  description TEXT,
  is_public TINYINT(1) DEFAULT 0,
  visibility ENUM('public', 'private', 'restricted') DEFAULT 'private',
  uploaded_by VARCHAR(255),
  association_type VARCHAR(50),
  association_id CHAR(26),
  category VARCHAR(100),
  version INT UNSIGNED DEFAULT 1,
  deleted_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_files_company (company_id),
  INDEX idx_files_file_type (file_type_id),
  INDEX idx_files_association (association_type, association_id),
  INDEX idx_files_visibility (visibility),
  INDEX idx_files_created (created_at),
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (file_type_id) REFERENCES file_types(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE file_counters (
  company_id CHAR(26) PRIMARY KEY,
  current_number INT UNSIGNED DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
