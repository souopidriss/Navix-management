CREATE TABLE IF NOT EXISTS support_tickets (
  id CHAR(26) PRIMARY KEY,
  company_id CHAR(26) NOT NULL,
  user_id CHAR(26) NOT NULL,
  ticket_number VARCHAR(50) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  description TEXT,
  priority ENUM('low','normal','high','urgent') NOT NULL DEFAULT 'normal',
  status ENUM('open','in_progress','waiting','resolved','closed') NOT NULL DEFAULT 'open',
  category VARCHAR(100),
  assigned_to CHAR(26),
  closed_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_support_tickets_number_company (company_id, ticket_number),
  INDEX idx_support_tickets_company_id (company_id),
  INDEX idx_support_tickets_user_id (user_id),
  INDEX idx_support_tickets_status (status),
  INDEX idx_support_tickets_priority (priority),
  INDEX idx_support_tickets_created_at (created_at),
  CONSTRAINT fk_st_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  CONSTRAINT fk_st_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_st_assigned FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS support_messages (
  id CHAR(26) PRIMARY KEY,
  ticket_id CHAR(26) NOT NULL,
  user_id CHAR(26) NOT NULL,
  message TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_support_messages_ticket_id (ticket_id),
  INDEX idx_support_messages_user_id (user_id),
  INDEX idx_support_messages_created_at (created_at),
  CONSTRAINT fk_sm_ticket FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE,
  CONSTRAINT fk_sm_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
