import api from "./client";

export async function getSports() {
  const { data } = await api.get("/sports");
  return data;
}
