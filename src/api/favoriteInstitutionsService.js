import api from "./client";

export async function getFavoriteInstitutionsByProfessor(professorUserId) {
  const { data } = await api.get(
    `/favoriteinstitutions/professor/${Number(professorUserId)}`,
  );
  return data;
}

export async function getFavoriteInstitutionsByInstitution(institutionUserId) {
  const { data } = await api.get(
    `/favoriteinstitutions/institution/${Number(institutionUserId)}`,
  );
  return data;
}

export async function createFavoriteInstitution(payload) {
  const body = {
    professorUserId: Number(payload.professorUserId),
    institutionUserId: Number(payload.institutionUserId),
  };

  const { data } = await api.post("/favoriteinstitutions", body);
  return data;
}

export async function deleteFavoriteInstitutionByProfessorAndInstitution(
  professorUserId,
  institutionUserId,
) {
  await api.delete(
    `/favoriteinstitutions/professor/${Number(
      professorUserId,
    )}/institution/${Number(institutionUserId)}`,
  );
}
