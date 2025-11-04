import {apiClient} from '@/lib/api-client';
import {
  ApiResponse,
  UserResponse,
  UpdateUserRequest,
  UpdateUserProfileRequest,
  UserProfileResponse,
  PageResponse,
} from '@/types/api.types';

export const userApi = {
  getCurrentUser: async (): Promise<ApiResponse<UserResponse>> => {
    const response = await apiClient.get('/api/users/me');
    return response.data;
  },

  getUserById: async (id: string): Promise<ApiResponse<UserResponse>> => {
    const response = await apiClient.get(`/api/users/${id}`);
    return response.data;
  },

  getUserByUsername: async (username: string): Promise<ApiResponse<UserResponse>> => {
    const response = await apiClient.get(`/api/users/username/${username}`);
    return response.data;
  },

  getAllUsers: async (
    page = 0,
    size = 20,
    sortBy = 'createdAt',
    sortDirection = 'DESC'
  ): Promise<ApiResponse<PageResponse<UserResponse>>> => {
    const response = await apiClient.get('/api/users', {
      params: { page, size, sortBy, sortDirection },
    });
    return response.data;
  },

  updateUser: async (id: string, data: UpdateUserRequest): Promise<ApiResponse<UserResponse>> => {
    const response = await apiClient.put(`/api/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/api/users/${id}`);
    return response.data;
  },

  // User Profile APIs
  getProfile: async (userId: string): Promise<ApiResponse<UserProfileResponse>> => {
    const response = await apiClient.get(`/api/users/${userId}/profile`);
    return response.data;
  },

  getCurrentUserProfile: async (userId: string): Promise<ApiResponse<UserProfileResponse>> => {
    const response = await apiClient.get(`/api/users/${userId}/profile/me`);
    return response.data;
  },

  updateProfile: async (
    userId: string,
    data: UpdateUserProfileRequest
  ): Promise<ApiResponse<UserProfileResponse>> => {
    const response = await apiClient.put(`/api/users/${userId}/profile`, data);
    return response.data;
  },
};