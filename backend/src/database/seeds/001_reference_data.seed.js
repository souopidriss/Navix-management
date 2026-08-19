import { generateId } from '../../utils/id.js';
import bcrypt from 'bcrypt';

export default async function seed(pool) {
  // ─── VEHICLE GROUPS ─────────────────────────────────────────────
  const groups = [
    { code: 'A', name: 'motos', display_name: 'Motos', icon: 'bi-bicycle' },
    { code: 'B', name: 'vehicules_legers', display_name: 'Véhicules légers', icon: 'bi-car-front' },
    { code: 'C', name: 'utilitaires', display_name: 'Utilitaires', icon: 'bi-truck' },
    { code: 'D', name: 'camions', display_name: 'Camions', icon: 'bi-truck-front' },
    { code: 'E', name: 'engins', display_name: 'Engins', icon: 'bi-gear' },
    { code: 'F', name: 'bus', display_name: 'Bus', icon: 'bi-bus-front' },
    { code: 'G', name: 'vehicules_speciaux', display_name: 'Véhicules spéciaux', icon: 'bi-shield-check' },
  ];

  const groupIds = {};
  for (const g of groups) {
    const id = generateId();
    groupIds[g.code] = id;
    try {
      await pool.execute(
        'INSERT IGNORE INTO vehicle_groups (id, code, name, display_name, icon) VALUES (?, ?, ?, ?, ?)',
        [id, g.code, g.name, g.display_name, g.icon]
      );
    } catch (error) {
      if (error.code !== 'ER_DUP_ENTRY') throw error;
    }
  }

  // ─── VEHICLE TYPES ──────────────────────────────────────────────
  const types = [
    { group: 'A', name: 'mototaxi', display_name: 'Mototaxi' },
    { group: 'A', name: 'scooter', display_name: 'Scooter' },
    { group: 'A', name: 'moto_sport', display_name: 'Moto Sport' },
    { group: 'B', name: 'berline', display_name: 'Berline' },
    { group: 'B', name: 'citadine', display_name: 'Citadine' },
    { group: 'B', name: 'suv', display_name: 'SUV' },
    { group: 'B', name: 'break', display_name: 'Break' },
    { group: 'C', name: 'fourgon', display_name: 'Fourgon' },
    { group: 'C', name: 'pick_up', display_name: 'Pick-up' },
    { group: 'C', name: 'camionnette', display_name: 'Camionnette' },
    { group: 'D', name: 'camion', display_name: 'Camion' },
    { group: 'D', name: 'semi_remorque', display_name: 'Semi-remorque' },
    { group: 'D', name: 'porte_conteneur', display_name: 'Porte-conteneur' },
    { group: 'E', name: 'tracteur', display_name: 'Tracteur' },
    { group: 'E', name: 'bulldozer', display_name: 'Bulldozer' },
    { group: 'E', name: 'pelle_mecanique', display_name: 'Pelle mécanique' },
    { group: 'E', name: 'chargeuse', display_name: 'Chargeuse' },
    { group: 'F', name: 'minibus', display_name: 'Minibus' },
    { group: 'F', name: 'bus', display_name: 'Bus' },
    { group: 'F', name: 'autocar', display_name: 'Autocar' },
    { group: 'G', name: 'ambulance', display_name: 'Ambulance' },
    { group: 'G', name: 'police', display_name: 'Police' },
    { group: 'G', name: 'pompiers', display_name: 'Pompiers' },
    { group: 'G', name: 'grue', display_name: 'Grue' },
  ];

  for (const t of types) {
    const id = generateId();
    try {
      await pool.execute(
        'INSERT IGNORE INTO vehicle_types (id, group_id, name, display_name) VALUES (?, ?, ?, ?)',
        [id, groupIds[t.group], t.name, t.display_name]
      );
    } catch (error) {
      if (error.code !== 'ER_DUP_ENTRY') throw error;
    }
  }

  // ─── ROLES ──────────────────────────────────────────────────────
  const roles = [
    { name: 'super_admin', code: 'SUPER_ADMIN', display_name: 'Super Administrateur', description: 'Accès total à la plateforme', is_system: true },
    { name: 'client_enterprise', code: 'CLIENT_ENTERPRISE', display_name: 'Client Entreprise', description: 'Gestion de sa flotte et de ses opérations', is_system: true },
    { name: 'driver', code: 'DRIVER', display_name: 'Chauffeur', description: 'Accès au portail chauffeur', is_system: true },
    { name: 'partner', code: 'PARTNER', display_name: 'Partenaire', description: 'Accès au portail partenaire', is_system: true },
  ];

  const roleIds = {};
  for (const r of roles) {
    const id = generateId();
    roleIds[r.name] = id;
    try {
      await pool.execute(
        'INSERT IGNORE INTO roles (id, name, code, display_name, description, is_system) VALUES (?, ?, ?, ?, ?, ?)',
        [id, r.name, r.code, r.display_name, r.description, r.is_system]
      );
    } catch (error) {
      if (error.code !== 'ER_DUP_ENTRY') throw error;
    }
  }

  // ─── PERMISSIONS ────────────────────────────────────────────────
  const permissions = [
    { module: 'vehicles', action: 'view' },
    { module: 'vehicles', action: 'create' },
    { module: 'vehicles', action: 'update' },
    { module: 'vehicles', action: 'delete' },
    { module: 'drivers', action: 'view' },
    { module: 'drivers', action: 'create' },
    { module: 'drivers', action: 'update' },
    { module: 'drivers', action: 'delete' },
    { module: 'missions', action: 'view' },
    { module: 'missions', action: 'create' },
    { module: 'missions', action: 'update' },
    { module: 'missions', action: 'delete' },
    { module: 'finance', action: 'view' },
    { module: 'finance', action: 'manage' },
    { module: 'invoices', action: 'view' },
    { module: 'invoices', action: 'create' },
    { module: 'contracts', action: 'view' },
    { module: 'contracts', action: 'create' },
    { module: 'maintenance', action: 'view' },
    { module: 'maintenance', action: 'manage' },
    { module: 'fuel', action: 'view' },
    { module: 'fuel', action: 'manage' },
    { module: 'documents', action: 'view' },
    { module: 'documents', action: 'upload' },
    { module: 'notifications', action: 'view' },
    { module: 'users', action: 'view' },
    { module: 'users', action: 'manage' },
    { module: 'settings', action: 'view' },
    { module: 'settings', action: 'manage' },
    { module: 'reports', action: 'view' },
    { module: 'reports', action: 'export' },
    { module: 'audit', action: 'view' },
    { module: 'companies', action: 'view' },
    { module: 'companies', action: 'manage' },
    { module: 'partners', action: 'view' },
    { module: 'partners', action: 'manage' },
    { module: 'trips', action: 'view' },
    { module: 'trips', action: 'manage' },
    { module: 'assignments', action: 'view' },
    { module: 'assignments', action: 'manage' },
    { module: 'support', action: 'view' },
    { module: 'support', action: 'manage' },
    { module: 'subscriptions', action: 'view' },
    { module: 'subscriptions', action: 'manage' },
    { module: 'calendar', action: 'view' },
    { module: 'calendar', action: 'manage' },
  ];

  const permIds = [];
  for (const perm of permissions) {
    const id = generateId();
    const code = `${perm.module}:${perm.action}`;
    permIds.push(id);
    try {
      await pool.execute(
        'INSERT IGNORE INTO permissions (id, name, code, module, action) VALUES (?, ?, ?, ?, ?)',
        [id, code, code, perm.module, perm.action]
      );
    } catch (error) {
      if (error.code !== 'ER_DUP_ENTRY') throw error;
    }
  }

  // ─── ROLE PERMISSIONS (super_admin → all) ───────────────────────
  const superAdminId = roleIds['super_admin'];
  if (superAdminId) {
    const [allPerms] = await pool.execute('SELECT id FROM permissions');
    for (const perm of allPerms) {
      try {
        await pool.execute(
          'INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)',
          [superAdminId, perm.id]
        );
      } catch (error) {
        if (error.code !== 'ER_DUP_ENTRY') throw error;
      }
    }
  }

  // ─── SUBSCRIPTION PLANS ─────────────────────────────────────────
  const plans = [
    {
      name: 'starter', code: 'starter', display_name: 'Starter', description: 'Pour les petites flottes',
      price_monthly: 0, price_yearly: 0, max_vehicles: 5, max_drivers: 5, max_users: 3,
      max_agencies: 1, max_documents: 100, max_storage_gb: 5, max_trips_per_month: 50,
      max_fuel_records_per_month: 50, max_maintenance_records_per_month: 50, sort_order: 1,
    },
    {
      name: 'business', code: 'business', display_name: 'Business', description: 'Pour les entreprises en croissance',
      price_monthly: 75000, price_yearly: 750000, max_vehicles: 50, max_drivers: 50, max_users: 15,
      max_agencies: 5, max_documents: 1000, max_storage_gb: 50, max_trips_per_month: 500,
      max_fuel_records_per_month: 500, max_maintenance_records_per_month: 500, sort_order: 2,
    },
    {
      name: 'professional', code: 'professional', display_name: 'Professional', description: 'Pour les grandes flottes',
      price_monthly: 150000, price_yearly: 1500000, max_vehicles: 200, max_drivers: 200, max_users: 50,
      max_agencies: 20, max_documents: 5000, max_storage_gb: 200, max_trips_per_month: 2000,
      max_fuel_records_per_month: 2000, max_maintenance_records_per_month: 2000, sort_order: 3,
    },
    {
      name: 'enterprise', code: 'enterprise', display_name: 'Enterprise', description: 'Solution sur mesure',
      price_monthly: 300000, price_yearly: 3000000, max_vehicles: -1, max_drivers: -1, max_users: -1,
      max_agencies: -1, max_documents: -1, max_storage_gb: -1, max_trips_per_month: -1,
      max_fuel_records_per_month: -1, max_maintenance_records_per_month: -1, sort_order: 4,
    },
  ];

  for (const p of plans) {
    const id = generateId();
    try {
      await pool.execute(
        `INSERT IGNORE INTO subscription_plans
          (id, name, code, display_name, description, price_monthly, price_yearly,
           max_vehicles, max_drivers, max_users, max_agencies, max_documents,
           max_storage_gb, max_trips_per_month, max_fuel_records_per_month,
           max_maintenance_records_per_month, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, p.name, p.code, p.display_name, p.description, p.price_monthly, p.price_yearly,
         p.max_vehicles, p.max_drivers, p.max_users, p.max_agencies, p.max_documents,
         p.max_storage_gb, p.max_trips_per_month, p.max_fuel_records_per_month,
         p.max_maintenance_records_per_month, p.sort_order]
      );
    } catch (error) {
      if (error.code !== 'ER_DUP_ENTRY') throw error;
    }
  }

  // ─── ADMIN USER ─────────────────────────────────────────────────
  const saltRounds = 10;
  const defaultPassword = process.env.SEED_ADMIN_PASSWORD || 'admin123';
  const passwordHash = await bcrypt.hash(defaultPassword, saltRounds);

  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@navix.local';
  try {
    const [existing] = await pool.execute('SELECT id FROM users WHERE email = ? LIMIT 1', [adminEmail]);
    if (existing.length === 0) {
      const adminId = generateId();
      await pool.execute(
        `INSERT INTO users (id, email, password_hash, first_name, last_name, role, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [adminId, adminEmail, passwordHash, 'Super', 'Admin', 'super_admin', 'active']
      );
    }
  } catch (error) {
    if (error.code !== 'ER_DUP_ENTRY') throw error;
  }
}
