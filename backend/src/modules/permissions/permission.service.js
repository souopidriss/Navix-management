import permissionRepository from '../../repositories/PermissionRepository.js';
import { NotFoundError } from '../../errors/index.js';

export async function listPermissions(query) {
  let permissions;
  if (query.module) {
    permissions = await permissionRepository.findByModule(query.module);
  } else {
    permissions = await permissionRepository.findAll();
  }

  if (query.isSensitive === true) {
    permissions = permissions.filter((p) => {
      const sensitiveModules = ['billing', 'finance', 'subscriptions', 'settings', 'users', 'roles'];
      return sensitiveModules.includes(p.module);
    });
  }

  return permissions.map((p) => ({
    id: p.id,
    code: p.code,
    name: p.name,
    module: p.module,
    action: p.action,
    description: p.description,
    isSensitive: ['billing', 'finance', 'subscriptions', 'settings', 'users', 'roles'].includes(p.module),
  }));
}

export async function getPermissionById(id) {
  const perm = await permissionRepository.findById(id);
  if (!perm) throw new NotFoundError('Permission');
  return {
    id: perm.id,
    code: perm.code,
    name: perm.name,
    module: perm.module,
    action: perm.action,
    description: perm.description,
  };
}

export async function getModules() {
  const modules = await permissionRepository.getModules();
  return modules.map((m) => ({
    module: m.module,
    label: m.module.charAt(0).toUpperCase() + m.module.slice(1),
    count: m.count,
  }));
}

export async function getStatistics() {
  return permissionRepository.getStatistics();
}
