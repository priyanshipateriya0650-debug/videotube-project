import axiosInstance from './axiosInstance';

/**
 * Authentication and User API Services.
 * Matches confirmed backend routes under /api/v1/users.
 */

// Register a new user with avatar & cover image uploads
export const registerUser = async (formData) => {
  const response = await axiosInstance.post('/users/register', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Log in an existing user
export const loginUser = async ({ username, email, password }) => {
  const payload = {};
  if (username) payload.username = username;
  if (email) payload.email = email;
  payload.password = password;

  const response = await axiosInstance.post('/users/login', payload);
  return response.data;
};

// Log out the current user
export const logoutUser = async () => {
  const response = await axiosInstance.post('/users/logout');
  return response.data;
};

// Get current authenticated user details
export const getCurrentUser = async () => {
  const response = await axiosInstance.get('/users/current-user');
  return response.data;
};

// Refresh access token
export const refreshAccessToken = async () => {
  const response = await axiosInstance.post('/users/refresh-token');
  return response.data;
};

// Change password
export const changePassword = async ({ oldPassword, newPassword }) => {
  const response = await axiosInstance.post('/users/change-password', {
    oldPassword,
    newPassword,
  });
  return response.data;
};

// Update account name and email
export const updateAccountDetails = async ({ fullName, email }) => {
  const response = await axiosInstance.patch('/users/update-account', {
    fullName,
    email,
  });
  return response.data;
};

// Update avatar image
export const updateUserAvatar = async (formData) => {
  const response = await axiosInstance.patch('/users/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Update cover image
export const updateUserCoverImage = async (formData) => {
  const response = await axiosInstance.patch('/users/cover-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Fetch public channel profile by username
export const getChannelProfile = async (username) => {
  const response = await axiosInstance.get(`/users/c/${username}`);
  return response.data;
};

// Fetch authenticated user's watch history
export const getWatchHistory = async () => {
  const response = await axiosInstance.get('/users/history');
  return response.data;
};

