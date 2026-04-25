import api from "./client";

export async function registerUser(payload) {
  const { data } = await api.post("/users", payload);
  return data;
}

export async function getMyUser(userId) {
  const { data } = await api.get(`/users/${userId}`);
  return data;
}

export async function updateUser(userId, payload) {
  const { data } = await api.put(`/users/${userId}`, payload);
  return data;
}

export async function getAllUsers() {
  const { data } = await api.get("/users");
  return data;
}

export async function activateInstitution(userId) {
  const { data } = await api.put(`/users/${userId}/activate-institution`);
  return data;
}

export async function rejectInstitution(userId) {
  const { data } = await api.put(`/users/${userId}/reject-institution`);
  return data;
}

export async function activateUser(userId) {
  const { data } = await api.put(`/users/${userId}/activate`);
  return data;
}

export async function inactivateUser(userId) {
  const { data } = await api.put(`/users/${userId}/inactivate`);
  return data;
}

export async function getAllInstitutions() {
  const { data } = await api.get("/users/institutions");
  return data;
}

export async function getProfessorPublicProfile(id) {
  const { data } = await api.get(`/users/professors/${Number(id)}`);
  return data;
}

export async function getAllProfessors() {
  const { data } = await api.get("/users/professors");
  return data;
}
