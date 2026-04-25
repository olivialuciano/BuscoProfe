import { ROLES, normalizeRole } from "./constants";

export function isAdmin(user) {
  return normalizeRole(user?.role) === ROLES.ADMIN;
}

export function isInstitution(user) {
  return normalizeRole(user?.role) === ROLES.INSTITUTION;
}

export function isProfessor(user) {
  return normalizeRole(user?.role) === ROLES.PROFESSOR;
}

export function canAccessRole(user, allowedRoles = []) {
  return allowedRoles.includes(normalizeRole(user?.role));
}
