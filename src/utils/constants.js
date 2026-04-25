export const API_BASE_URL = "http://www.buscoprofeapi.somee.com/api";

export const ROLES = {
  ADMIN: "Admin",
  INSTITUTION: "Institution",
  PROFESSOR: "Professor",
};

export const USER_ROLE_VALUES = {
  ADMIN: 0,
  INSTITUTION: 1,
  PROFESSOR: 2,
};

export function normalizeRole(role) {
  if (role === 0 || role === "0") return ROLES.ADMIN;
  if (role === 1 || role === "1") return ROLES.INSTITUTION;
  if (role === 2 || role === "2") return ROLES.PROFESSOR;

  if (
    role === ROLES.ADMIN ||
    role === ROLES.INSTITUTION ||
    role === ROLES.PROFESSOR
  ) {
    return role;
  }

  return role;
}

export const WORK_MODE_LABELS = {
  0: "Presencial",
  1: "Remoto",
  2: "Híbrido",
};

export const CONTRACT_TYPE_LABELS = {
  0: "Full Time",
  1: "Part Time",
  2: "Por hora",
  3: "Temporal",
  4: "Freelance",
};

export const AVAILABILITY_LABELS = {
  0: "Mañana",
  1: "Tarde",
  2: "Noche",
  3: "Día completo",
  4: "Flexible",
};

export const USER_ROLE_OPTIONS = [
  { value: 2, label: "Profesor/a" },
  { value: 1, label: "Institución" },
];

export const INSTITUTION_TYPE_OPTIONS = [
  { value: 0, label: "Escuela" },
  { value: 1, label: "Gimnasio" },
  { value: 2, label: "Club deportivo" },
  { value: 3, label: "Aire libre" },
  { value: 4, label: "Ligas y torneos" },
  { value: 5, label: "Discapacidad" },
  { value: 6, label: "Centro de entrenamiento" },
  { value: 7, label: "Escuelita" },
  { value: 8, label: "Fiestas y eventos" },
  { value: 9, label: "Turismo y viajes educativos" },
  { value: 10, label: "Otros" },
];
