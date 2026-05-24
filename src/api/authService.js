import api from "./client";

export const loginRequest = async (email, password) => {
  const response = await api.post("/Auth/login", {
    email,
    password,
  });

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

export const forgotPassword = async (email) => {
  const response = await api.post("/Auth/forgot-password", {
    email,
  });

  return response.data;
};

export const resetPassword = async (
  email,
  code,
  newPassword,
  confirmNewPassword,
) => {
  const response = await api.post("/Auth/reset-password", {
    email,
    code,
    newPassword,
    confirmNewPassword,
  });

  return response.data;
};
