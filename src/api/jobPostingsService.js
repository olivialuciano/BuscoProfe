import api from "./client";

export async function getPublicJobPostings() {
  const { data } = await api.get("/jobpostings");
  return data;
}

export async function getAllJobPostings() {
  const { data } = await api.get("/jobpostings");
  return data;
}

export async function getInstitutionJobPostings(institutionUserId) {
  const { data } = await api.get(
    `/jobpostings/institution/${institutionUserId}`,
  );
  return data;
}

export async function getJobPostingById(id) {
  const { data } = await api.get(`/jobpostings/${id}`);
  return data;
}

export async function createJobPosting(payload) {
  const { data } = await api.post("/jobpostings", payload);
  return data;
}

export async function activateJobPosting(id) {
  const { data } = await api.put(`/jobpostings/${id}/activate`);
  return data;
}

export async function inactivateJobPosting(id) {
  const { data } = await api.put(`/jobpostings/${id}/inactivate`);
  return data;
}

export async function closeJobPosting(id) {
  const { data } = await api.put(`/jobpostings/${id}/close`);
  return data;
}

export async function deleteJobPostingLogical(id) {
  const { data } = await api.put(`/jobpostings/${id}/delete`);
  return data;
}
