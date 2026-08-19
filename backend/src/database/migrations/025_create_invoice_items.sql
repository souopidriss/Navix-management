CREATE TABLE IF NOT EXISTS invoice_items (
  id CHAR(26) PRIMARY KEY,
  invoice_id CHAR(26) NOT NULL,
  description VARCHAR(500) NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(15, 2) NOT NULL DEFAULT 0,
  amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  item_kind ENUM('subscription_renewal','setup','usage','addon','credit_note') NOT NULL DEFAULT 'usage',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ii_invoice_id (invoice_id),
  INDEX idx_ii_item_kind (item_kind),
  CONSTRAINT fk_ii_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
