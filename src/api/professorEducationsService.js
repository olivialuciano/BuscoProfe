import api from "./client";

export async function getProfessorEducations(userId) {
  const { data } = await api.get(`/professoreducations/user/${userId}`);
  return data;
}

export async function createProfessorEducation(payload) {
  const { data } = await api.post("/professoreducations", payload);
  return data;
}

export async function deleteProfessorEducation(id) {
  const { data } = await api.delete(`/professoreducations/${id}`);
  return data;
}
