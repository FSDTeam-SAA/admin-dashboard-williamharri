import { axiosInstance } from "./axios-instance"

// AUTH ENDPOINTS
export const authAPI = {
  login: (data: { email: string; password: string }) => axiosInstance.post("/auth/login", data),

  requestPasswordReset: (email: string) => axiosInstance.post("/auth/forgot-password", { email }),

  verifyResetOtp: (data: { email: string; otp: string }) =>
    axiosInstance.post("/auth/verify-reset-otp", data),

  resetPassword: (data: { email: string; otp: string; password: string }) =>
    axiosInstance.post("/auth/reset-password", data),

  changePassword: (data: { oldPassword: string; newPassword: string }) =>
    axiosInstance.post("/auth/change-password", data),
}

// USER ENDPOINTS
export const userAPI = {
  getAllUsers: (page = 1, limit = 20) => axiosInstance.get(`/users?page=${page}&limit=${limit}`),

  getUserById: (id: string) => axiosInstance.get(`/users/${id}`),

  updateUserRole: (id: string, role: string) => axiosInstance.patch(`/users/${id}/role`, { role }),

  deleteUser: (id: string) => axiosInstance.delete(`/users/${id}`),
}

// STAFF ENDPOINTS
export const staffAPI = {
  getAllStaff: () => axiosInstance.get("/users/staff"),
}

// JOBS ENDPOINTS
export const jobsAPI = {
  getAllJobs: (page = 1, limit = 10) =>
    axiosInstance.get(`/jobs?page=${page}&limit=${limit}`),

  getJobById: (id: string) => axiosInstance.get(`/jobs/${id}`),

  createJob: (data: FormData) =>
    axiosInstance.post("/jobs", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  updateJob: (id: string, data: FormData) =>
    axiosInstance.patch(`/jobs/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  updateJobStatus: (id: string, status: string) =>
    axiosInstance.patch(`/jobs/${id}/status`, { status }),

  /// update latestScaffold status (application status)
  updateJobScaffoldStatus: (applicationId: string, status: string) =>
    axiosInstance.patch(`/applications/${applicationId}/status`, {
      status
    }),

  assignJob: (id: string, staffIds: string[]) =>
    axiosInstance.patch(`/jobs/${id}/assignment`, { assignedTo: staffIds }),

  deleteJob: (id: string) => axiosInstance.delete(`/jobs/${id}`),
};
