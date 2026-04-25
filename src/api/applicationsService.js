import api from "./client";

export async function getAllApplications() {
  const { data } = await api.get("/applications");
  return data;
}

export async function getMyApplications(professorUserId) {
  const { data } = await api.get(`/applications/professor/${professorUserId}`);
  return data;
}

export async function getProfessorApplications(professorUserId) {
  const { data } = await api.get(`/applications/professor/${professorUserId}`);
  return data;
}

export async function getApplicationsByJobPosting(jobPostingId) {
  const { data } = await api.get(
    `/applications/jobposting/${Number(jobPostingId)}`,
  );
  return data;
}

export async function createApplication(payload) {
  const body = {
    jobPostingId: Number(payload.jobPostingId),
    professorUserId: Number(payload.professorUserId),
    message:
      typeof payload.message === "string" && payload.message.trim() !== ""
        ? payload.message.trim()
        : "Sin mensaje",
    cvUrl: "No adjunto CV",
  };

  const { data } = await api.post("/applications", body);
  return data;
}

export async function withdrawApplication(id) {
  const { data } = await api.put(`/applications/${id}/withdraw`);
  return data;
}

export async function acceptApplication(id) {
  const { data } = await api.put(`/applications/${id}/accept`);
  return data;
}

export async function rejectApplication(id) {
  const { data } = await api.put(`/applications/${id}/reject`);
  return data;
}

export async function getApplicationById(id) {
  const applicationId = Number(id);

  if (Number.isNaN(applicationId)) {
    throw new Error("El id de la postulación no es válido.");
  }

  const { data } = await api.get(`/applications/${applicationId}`);
  return data;
}
