import api from "./client";

export async function getInstitutionMemberships(userId) {
  const { data } = await api.get(`/memberships/institution/${userId}`);
  return data;
}
