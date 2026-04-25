import api from "./client";

export async function getFavoriteJobPostingsByProfessor(professorUserId) {
  const { data } = await api.get(
    `/favoritejobpostings/professor/${Number(professorUserId)}`,
  );
  return data;
}

export async function createFavoriteJobPosting(payload) {
  const body = {
    professorUserId: Number(payload.professorUserId),
    jobPostingId: Number(payload.jobPostingId),
  };

  const { data } = await api.post("/favoritejobpostings", body);
  return data;
}

export async function deleteFavoriteJobPostingByProfessorAndJobPosting(
  professorUserId,
  jobPostingId,
) {
  await api.delete(
    `/favoritejobpostings/professor/${Number(
      professorUserId,
    )}/jobposting/${Number(jobPostingId)}`,
  );
}
