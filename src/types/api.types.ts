// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T | null;
  timestamp: string;
}

// Error Response
export interface ErrorResponse {
  code: string;
  message: string;
  details?: ErrorDetail[];
  timestamp: string;
  path?: string;
  traceId?: string;
}

export interface ErrorDetail {
  field: string;
  message: string;
  rejectedValue?: any;
}

// Auth DTOs
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  id: string;
  username: string;
  email: string;
  needsVerification: boolean;
  message: string;
}

export interface LoginRequest {
  account: string; // username or email
  password: string;
  deviceId?: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: UserInfo;
}

export interface UserInfo {
  id: string;
  username: string;
  email: string;
  roles: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
  deviceId?: string;
}

export interface ResendOtpRequest {
  email: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// User DTOs
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface UserProfileResponse {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: Gender;
  bio?: string;
  avatarUrl?: string;
  address?: Address;
}

export interface UserResponse {
  id: string;
  accountId: string;
  username: string;
  email: string;
  status: UserStatus;
  profile?: UserProfileResponse;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserRequest {
  email?: string;
}

export interface UpdateUserProfileRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: Gender;
  bio?: string;
  avatarUrl?: string;
  address?: Address;
}

// Pagination
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}