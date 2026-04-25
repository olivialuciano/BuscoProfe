export function getApiErrorMessage(error, fallback = "Ocurrió un error.") {
  const responseData = error?.response?.data;

  if (typeof responseData === "string" && responseData.trim() !== "") {
    return responseData.trim();
  }

  if (
    responseData &&
    typeof responseData.message === "string" &&
    responseData.message.trim() !== ""
  ) {
    return responseData.message.trim();
  }

  if (
    responseData &&
    typeof responseData.title === "string" &&
    responseData.title.trim() !== ""
  ) {
    return responseData.title.trim();
  }

  if (responseData?.errors && typeof responseData.errors === "object") {
    const messages = Object.values(responseData.errors).flat().filter(Boolean);

    if (messages.length) {
      return messages.join(" ");
    }
  }

  if (typeof error?.message === "string" && error.message.trim() !== "") {
    return error.message.trim();
  }

  return fallback;
}
