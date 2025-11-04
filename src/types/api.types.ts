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
  refresh_token: string | null;
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

// User DTOs
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

// FIXED: Match với backend structure
export interface UserProfileResponse {
  id?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;          // Changed from phoneNumber
  dateOfBirth?: string;    // LocalDate from backend -> string
  gender?: Gender;
  bio?: string;
  avatarUrl?: string;
  address?: string;        // Changed from nested object to string
  city?: string;
  country?: string;
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

// FIXED: Match với backend structure
export interface UpdateUserProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;          // Changed from phoneNumber
  dateOfBirth?: string;    // LocalDate string format
  gender?: Gender;
  bio?: string;
  avatarUrl?: string;
  address?: string;        // Changed from nested object to string
  city?: string;
  country?: string;
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