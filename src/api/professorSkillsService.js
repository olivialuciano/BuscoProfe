import api from "./client";

export async function getProfessorSkills(userId) {
  const { data } = await api.get(`/professorskills/user/${userId}`);
  return data;
}

export async function createProfessorSkill(payload) {
  const { data } = await api.post("/professorskills", payload);
  return data;
}

export async function deleteProfessorSkill(id) {
  const { data } = await api.delete(`/professorskills/${id}`);
  return data;
}
