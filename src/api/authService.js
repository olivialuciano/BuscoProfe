import api from "./client";

export const loginRequest = async (credentials) => {
  const response = await api.post("/Auth/login", credentials);
  return response.data;
};

export const startRegistration = async (payload) => {
  const response = await api.post("/Auth/start-registration", payload);
  return response.data;
};

export const verifyEmailCode = async (email, code) => {
  const response = await api.post("/Auth/verify-email-code", {
    email,
    code,
  });

  return response.data;
};

export const resendEmailVerificationCode = async (email) => {
  const response = await api.post("/Auth/resend-email-verification-code", {
    email,
  });

  return response.data;
};
