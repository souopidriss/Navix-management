-- Remove permission assignments for new roles
DELETE rp FROM role_permissions rp
  INNER JOIN roles r ON rp.role_id = r.id
  WHERE r.name IN ('company_owner','company_admin','fleet_manager','dispatcher','mechanic','accountant','viewer','client_individual');

-- Remove new permissions added in this migration
DELETE FROM permissions WHERE id LIKE 'P000000000000000000000%';

-- Remove new roles
DELETE FROM roles WHERE id LIKE 'R000000000000000000000%';
