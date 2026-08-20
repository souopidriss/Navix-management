-- Add missing roles from frontend (8 roles)
INSERT IGNORE INTO roles (id, name, code, display_name, description, is_system) VALUES
  ('R00000000000000000000001', 'company_owner', 'COMPANY_OWNER', 'Propriétaire d''entreprise', 'Gère son entreprise, facturation et abonnements', TRUE),
  ('R00000000000000000000002', 'company_admin', 'COMPANY_ADMIN', 'Administrateur', 'Administre l''entreprise au quotidien', TRUE),
  ('R00000000000000000000003', 'fleet_manager', 'FLEET_MANAGER', 'Gestionnaire de flotte', 'Pilote la flotte : véhicules, chauffeurs, affectations', TRUE),
  ('R00000000000000000000004', 'dispatcher', 'DISPATCHER', 'Répartiteur', 'Organise les trajets et les affectations', TRUE),
  ('R00000000000000000000005', 'mechanic', 'MECHANIC', 'Mécanicien', 'Gère les entretiens et la maintenance', TRUE),
  ('R00000000000000000000006', 'accountant', 'ACCOUNTANT', 'Comptable', 'Gère la facturation et la comptabilité', TRUE),
  ('R00000000000000000000007', 'viewer', 'VIEWER', 'Lecteur', 'Consultation en lecture seule', TRUE),
  ('R00000000000000000000008', 'client_individual', 'CLIENT_INDIVIDUAL', 'Client Particulier', 'Espace client particulier', TRUE);

-- Add permissions aligned with frontend format (module.action)
INSERT IGNORE INTO permissions (id, name, code, module, action) VALUES
  ('P00000000000000000000001', 'dashboard.read', 'dashboard.read', 'dashboard', 'read'),
  ('P00000000000000000000002', 'vehicles.read', 'vehicles.read', 'vehicles', 'read'),
  ('P00000000000000000000003', 'vehicles.create', 'vehicles.create', 'vehicles', 'create'),
  ('P00000000000000000000004', 'vehicles.update', 'vehicles.update', 'vehicles', 'update'),
  ('P00000000000000000000005', 'vehicles.delete', 'vehicles.delete', 'vehicles', 'delete'),
  ('P00000000000000000000006', 'drivers.read', 'drivers.read', 'drivers', 'read'),
  ('P00000000000000000000007', 'drivers.create', 'drivers.create', 'drivers', 'create'),
  ('P00000000000000000000008', 'drivers.update', 'drivers.update', 'drivers', 'update'),
  ('P00000000000000000000009', 'drivers.delete', 'drivers.delete', 'drivers', 'delete'),
  ('P00000000000000000000010', 'assignments.read', 'assignments.read', 'assignments', 'read'),
  ('P00000000000000000000011', 'assignments.create', 'assignments.create', 'assignments', 'create'),
  ('P00000000000000000000012', 'assignments.update', 'assignments.update', 'assignments', 'update'),
  ('P00000000000000000000013', 'assignments.delete', 'assignments.delete', 'assignments', 'delete'),
  ('P00000000000000000000014', 'trips.read', 'trips.read', 'trips', 'read'),
  ('P00000000000000000000015', 'trips.create', 'trips.create', 'trips', 'create'),
  ('P00000000000000000000016', 'trips.update', 'trips.update', 'trips', 'update'),
  ('P00000000000000000000017', 'trips.delete', 'trips.delete', 'trips', 'delete'),
  ('P00000000000000000000018', 'fuel.read', 'fuel.read', 'fuel', 'read'),
  ('P00000000000000000000019', 'fuel.create', 'fuel.create', 'fuel', 'create'),
  ('P00000000000000000000020', 'fuel.update', 'fuel.update', 'fuel', 'update'),
  ('P00000000000000000000021', 'fuel.delete', 'fuel.delete', 'fuel', 'delete'),
  ('P00000000000000000000022', 'maintenance.read', 'maintenance.read', 'maintenance', 'read'),
  ('P00000000000000000000023', 'maintenance.create', 'maintenance.create', 'maintenance', 'create'),
  ('P00000000000000000000024', 'maintenance.update', 'maintenance.update', 'maintenance', 'update'),
  ('P00000000000000000000025', 'maintenance.delete', 'maintenance.delete', 'maintenance', 'delete'),
  ('P00000000000000000000026', 'partners.read', 'partners.read', 'partners', 'read'),
  ('P00000000000000000000027', 'partners.create', 'partners.create', 'partners', 'create'),
  ('P00000000000000000000028', 'partners.update', 'partners.update', 'partners', 'update'),
  ('P00000000000000000000029', 'partners.delete', 'partners.delete', 'partners', 'delete'),
  ('P00000000000000000000030', 'files.read', 'files.read', 'files', 'read'),
  ('P00000000000000000000031', 'files.create', 'files.create', 'files', 'create'),
  ('P00000000000000000000032', 'files.update', 'files.update', 'files', 'update'),
  ('P00000000000000000000033', 'files.delete', 'files.delete', 'files', 'delete'),
  ('P00000000000000000000034', 'files.download', 'files.download', 'files', 'download'),
  ('P00000000000000000000035', 'notifications.read', 'notifications.read', 'notifications', 'read'),
  ('P00000000000000000000036', 'notifications.view', 'notifications.view', 'notifications', 'view'),
  ('P00000000000000000000037', 'notifications.manage', 'notifications.manage', 'notifications', 'manage'),
  ('P00000000000000000000038', 'users.view', 'users.view', 'users', 'view'),
  ('P00000000000000000000039', 'users.create', 'users.create', 'users', 'create'),
  ('P00000000000000000000040', 'users.update', 'users.update', 'users', 'update'),
  ('P00000000000000000000041', 'users.delete', 'users.delete', 'users', 'delete'),
  ('P00000000000000000000042', 'users.manage', 'users.manage', 'users', 'manage'),
  ('P00000000000000000000043', 'settings.view', 'settings.view', 'settings', 'view'),
  ('P00000000000000000000044', 'settings.manage', 'settings.manage', 'settings', 'manage'),
  ('P00000000000000000000045', 'reports:view', 'reports:view', 'reports', 'view'),
  ('P00000000000000000000046', 'reports:export', 'reports:export', 'reports', 'export'),
  ('P00000000000000000000047', 'audit.view', 'audit.view', 'audit', 'view'),
  ('P00000000000000000000048', 'companies.manage', 'companies.manage', 'companies', 'manage'),
  ('P00000000000000000000049', 'billing.manage', 'billing.manage', 'billing', 'manage'),
  ('P00000000000000000000050', 'subscriptions.manage', 'subscriptions.manage', 'subscriptions', 'manage'),
  ('P00000000000000000000051', 'calendar.read', 'calendar.read', 'calendar', 'read'),
  ('P00000000000000000000052', 'support.read', 'support.read', 'support', 'read'),
  ('P00000000000000000000053', 'support.create', 'support.create', 'support', 'create'),
  ('P00000000000000000000054', 'incidents.read', 'incidents.read', 'incidents', 'read'),
  ('P00000000000000000000055', 'incidents.create', 'incidents.create', 'incidents', 'create'),
  ('P00000000000000000000056', 'agencies.manage', 'agencies.manage', 'agencies', 'manage'),
  ('P00000000000000000000057', 'roles.view', 'roles.view', 'roles', 'view'),
  ('P00000000000000000000058', 'roles.manage', 'roles.manage', 'roles', 'manage'),
  ('P00000000000000000000059', 'permissions.view', 'permissions.view', 'permissions', 'view'),
  ('P00000000000000000000060', 'invoices.read', 'invoices.read', 'invoices', 'read'),
  ('P00000000000000000000061', 'contracts.read', 'contracts.read', 'contracts', 'read'),
  ('P00000000000000000000062', 'finance.read', 'finance.read', 'finance', 'read'),
  ('P00000000000000000000063', 'finance.manage', 'finance.manage', 'finance', 'manage');

-- Assign permissions to roles
-- company_owner: full company access
INSERT IGNORE INTO role_permissions (role_id, permission_id)
  SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'company_owner'
  AND p.code IN ('dashboard.read','vehicles.read','vehicles.create','vehicles.update','vehicles.delete',
    'drivers.read','drivers.create','drivers.update','drivers.delete',
    'assignments.read','assignments.create','assignments.update','assignments.delete',
    'trips.read','trips.create','trips.update','trips.delete',
    'fuel.read','fuel.create','fuel.update','fuel.delete',
    'maintenance.read','maintenance.create','maintenance.update','maintenance.delete',
    'partners.read','partners.create','partners.update','partners.delete',
    'files.read','files.create','files.update','files.delete','files.download',
    'notifications.read','notifications:view','notifications.manage',
    'users:view','users.create','users.update','users.delete','users:manage',
    'settings:view','settings:manage',
    'reports:view','reports:export',
    'audit:view',
    'companies:manage','agencies:manage',
    'billing.manage','subscriptions:manage',
    'roles.view','roles.manage','permissions.view',
    'invoices.read','contracts.read','finance.read','finance.manage');

-- company_admin: similar but no billing/subscriptions
INSERT IGNORE INTO role_permissions (role_id, permission_id)
  SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'company_admin'
  AND p.code IN ('dashboard.read','vehicles.read','vehicles.create','vehicles.update','vehicles.delete',
    'drivers.read','drivers.create','drivers.update','drivers.delete',
    'assignments.read','assignments.create','assignments.update','assignments.delete',
    'trips.read','trips.create','trips.update','trips.delete',
    'fuel.read','fuel.create','fuel.update','fuel.delete',
    'maintenance.read','maintenance.create','maintenance.update','maintenance.delete',
    'partners.read','partners.create','partners.update','partners.delete',
    'files.read','files.create','files.update','files.delete','files.download',
    'notifications.read','notifications:view','notifications.manage',
    'users:view','users.create','users.update','users.delete','users:manage',
    'settings:view','settings:manage',
    'reports:view','reports:export',
    'audit:view',
    'agencies:manage',
    'roles.view','roles.manage','permissions.view',
    'invoices.read','contracts.read','finance.read');

-- fleet_manager
INSERT IGNORE INTO role_permissions (role_id, permission_id)
  SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'fleet_manager'
  AND p.code IN ('dashboard.read','vehicles.read','vehicles.create','vehicles.update','vehicles.delete',
    'drivers.read','drivers.create','drivers.update','drivers.delete',
    'assignments.read','assignments.create','assignments.update',
    'trips.read','trips.create','trips.update',
    'fuel.read','fuel.create','fuel.update','fuel.delete',
    'maintenance.read','maintenance.create','maintenance.update','maintenance.delete',
    'partners.read',
    'files.read','files.create','files.update','files.delete','files.download',
    'notifications.read','notifications:view','notifications.manage',
    'reports:view','reports:export');

-- dispatcher
INSERT IGNORE INTO role_permissions (role_id, permission_id)
  SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'dispatcher'
  AND p.code IN ('dashboard.read','vehicles.read','drivers.read',
    'assignments.read','assignments.create','assignments.update',
    'trips.read','trips.create','trips.update',
    'partners.read',
    'notifications.read','notifications:view','notifications.manage',
    'reports:view');

-- driver
INSERT IGNORE INTO role_permissions (role_id, permission_id)
  SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'driver'
  AND p.code IN ('dashboard.read','vehicles.read',
    'trips.read','trips.update',
    'fuel.read','maintenance.read',
    'incidents.read','incidents.create',
    'files.read','files.download',
    'notifications.read','notifications:view','notifications.manage',
    'reports:view');

-- mechanic
INSERT IGNORE INTO role_permissions (role_id, permission_id)
  SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'mechanic'
  AND p.code IN ('dashboard.read','vehicles.read',
    'maintenance.read','maintenance.create','maintenance.update','maintenance.delete',
    'partners.read',
    'notifications.read','notifications:view','notifications.manage',
    'reports:view');

-- accountant
INSERT IGNORE INTO role_permissions (role_id, permission_id)
  SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'accountant'
  AND p.code IN ('dashboard.read','vehicles.read','drivers.read',
    'trips.read','fuel.read',
    'billing.manage',
    'notifications.read','notifications:view','notifications.manage',
    'reports:view','reports:export',
    'finance.read','invoices.read');

-- viewer
INSERT IGNORE INTO role_permissions (role_id, permission_id)
  SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'viewer'
  AND p.code IN ('dashboard.read','vehicles.read','drivers.read',
    'assignments.read','trips.read',
    'fuel.read','maintenance.read',
    'partners.read',
    'files.read','files.download',
    'notifications.read','notifications:view',
    'reports:view');

-- client_enterprise
INSERT IGNORE INTO role_permissions (role_id, permission_id)
  SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'client_enterprise'
  AND p.code IN ('dashboard.read',
    'vehicles.read','vehicles.create','vehicles.update','vehicles.delete',
    'drivers.read','drivers.create','drivers.update','drivers.delete',
    'assignments.read','assignments.create','assignments.update','assignments.delete',
    'trips.read','trips.create','trips.update','trips.delete',
    'maintenance.read','maintenance.create','maintenance.update','maintenance.delete',
    'fuel.read','fuel.create','fuel.update','fuel.delete',
    'files.read','files.create','files.update','files.delete',
    'invoices.read',
    'notifications.read','notifications:view','notifications.manage',
    'reports:view',
    'finance.read','finance.create');

-- client_individual
INSERT IGNORE INTO role_permissions (role_id, permission_id)
  SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'client_individual'
  AND p.code IN ('dashboard.read',
    'trips.read',
    'files.read',
    'invoices.read',
    'notifications.read','notifications:view','notifications.manage');

-- partner
INSERT IGNORE INTO role_permissions (role_id, permission_id)
  SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'partner'
  AND p.code IN ('dashboard.read',
    'vehicles.read','vehicles.create','vehicles.update','vehicles.delete',
    'trips.read','trips.create','trips.update','trips.delete',
    'drivers.read',
    'files.read','files.create','files.update','files.delete',
    'finance.read','finance.create',
    'contracts.read',
    'support.read','support.create',
    'notifications.read','notifications:view',
    'reports:view');
