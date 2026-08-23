import { api } from "./client";

export const authApi = {
  signup: (payload) => api.post("/auth/signup", payload),
  verifyOtp: (payload) => api.post("/auth/verify-otp", payload),
  resendOtp: (payload) => api.post("/auth/resend-otp", payload),
  login: (payload) => api.post("/auth/login", payload),
  forgotPassword: (payload) => api.post("/auth/forgot-password", payload),
  resetPassword: (payload) => api.post("/auth/reset-password", payload),
};

export const exerciseApi = {
  list: (muscle) => api.get("/exercises", { params: muscle ? { muscle } : {} }),
  get: (id) => api.get(`/exercises/${id}`),
};

export const recommendApi = {
  recommend: (payload) => api.post("/recommend", payload),
};

export const dashboardApi = {
  summary: () => api.get("/dashboard/summary"),
  updateProfile: (payload) => api.patch("/dashboard/profile", payload),
};

export const chatApi = {
  send: (message) => api.post("/chat", { message }),
};

export const adminApi = {
  listUsers: () => api.get("/admin/users"),
  updateUserRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }),
  updateUserStatus: (id, is_active) => api.patch(`/admin/users/${id}/status`, { is_active }),
  createExercise: (payload) => api.post("/admin/exercises", payload),
  updateExercise: (id, payload) => api.patch(`/admin/exercises/${id}`, payload),
  deleteExercise: (id) => api.delete(`/admin/exercises/${id}`),
  regenerateExercise: (id) => api.post(`/admin/exercises/${id}/regenerate`),
  chatLog: (userId) => api.get(`/admin/chat-logs/${userId}`),
  insights: () => api.get("/admin/insights"),
};
