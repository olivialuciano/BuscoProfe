import api from "./client";

export async function getProfessorCertifications(userId) {
  const { data } = await api.get(`/professorcertifications/user/${userId}`);
  return data;
}

export async function createProfessorCertification(payload) {
  const { data } = await api.post("/professorcertifications", payload);
  return data;
}

export async function deleteProfessorCertification(id) {
  const { data } = await api.delete(`/professorcertifications/${id}`);
  return data;
}
