import api from "./client";

export async function getProfessorExperiences(userId) {
  const { data } = await api.get(`/professorexperiences/user/${userId}`);
  return data;
}

export async function createProfessorExperience(payload) {
  const { data } = await api.post("/professorexperiences", payload);
  return data;
}

export async function deleteProfessorExperience(id) {
  const { data } = await api.delete(`/professorexperiences/${id}`);
  return data;
}
