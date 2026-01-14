import api from './api';

export interface User {
  _id: string;
  email: string;
  name?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

// Description: Get all users (admin only)
// Endpoint: GET /api/users
// Request: {}
// Response: { users: Array<User> }
export const getUsers = async () => {
  try {
    const response = await api.get('/api/users');
    return response.data.users;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { error?: string } }; message?: string };
    throw new Error(err?.response?.data?.error || err?.message || 'An error occurred');
  }
};

// Description: Get user by ID (admin only)
// Endpoint: GET /api/users/:id
// Request: {}
// Response: { user: User }
export const getUserById = async (id: string) => {
  try {
    const response = await api.get(`/api/users/${id}`);
    return response.data.user;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { error?: string } }; message?: string };
    throw new Error(err?.response?.data?.error || err?.message || 'An error occurred');
  }
};

// Description: Create new user (admin only)
// Endpoint: POST /api/users
// Request: { email: string, password: string, name?: string, role?: string }
// Response: { user: User }
export const createUser = async (userData: { email: string; password: string; name?: string; role?: string }) => {
  try {
    const response = await api.post('/api/users', userData);
    return response.data.user;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { error?: string } }; message?: string };
    throw new Error(err?.response?.data?.error || err?.message || 'An error occurred');
  }
};

// Description: Update user (admin only)
// Endpoint: PUT /api/users/:id
// Request: { email?: string, name?: string, role?: string, password?: string }
// Response: { user: User }
export const updateUser = async (id: string, updates: { email?: string; name?: string; role?: string; password?: string }) => {
  try {
    const response = await api.put(`/api/users/${id}`, updates);
    return response.data.user;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { error?: string } }; message?: string };
    throw new Error(err?.response?.data?.error || err?.message || 'An error occurred');
  }
};

// Description: Delete user (admin only)
// Endpoint: DELETE /api/users/:id
// Request: {}
// Response: { success: boolean }
export const deleteUser = async (id: string) => {
  try {
    const response = await api.delete(`/api/users/${id}`);
    return response.data.success;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { error?: string } }; message?: string };
    throw new Error(err?.response?.data?.error || err?.message || 'An error occurred');
  }
};
