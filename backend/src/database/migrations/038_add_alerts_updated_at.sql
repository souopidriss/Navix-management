-- Migration 038: Add updated_at to alerts table
-- The BaseRepository.create() method automatically adds updated_at,
-- so alerts table needs this column to be consistent.

ALTER TABLE alerts ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;
