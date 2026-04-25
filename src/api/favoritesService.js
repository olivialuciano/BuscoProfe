import api from "./client";

export async function getFavoriteJobPostings(userId) {
  const { data } = await api.get(`/favoritejobpostings/professor/${userId}`);
  return data;
}
