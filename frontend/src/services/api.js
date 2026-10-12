const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Retrieve token from localStorage
export const getStoredToken = () => localStorage.getItem('foodrescue_token');
export const setStoredToken = (token) => localStorage.setItem('foodrescue_token', token);
export const removeStoredToken = () => localStorage.removeItem('foodrescue_token');

export const getStoredUser = () => {
  const user = localStorage.getItem('foodrescue_user');
  return user ? JSON.parse(user) : null;
};
export const setStoredUser = (user) => localStorage.setItem('foodrescue_user', JSON.stringify(user));
export const removeStoredUser = () => localStorage.removeItem('foodrescue_user');

// Generic Fetch helper
async function request(endpoint, options = {}) {
  const token = getStoredToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Handle FormData (e.g. image upload)
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Token expired or invalid
      removeStoredToken();
      removeStoredUser();
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.message || `Request failed with status ${response.status}`;
      throw new Error(message);
    }

    // Check for empty body
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.warn(`[API] Error on ${endpoint}:`, error.message);
    throw error;
  }
}

export const api = {
  // Auth
  register: (data) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  getProfile: () => request('/api/users/me'),
  updateProfile: (data) => request('/api/users/me', { method: 'PUT', body: JSON.stringify(data) }),
  changePassword: (data) => request('/api/users/me/password', { method: 'PATCH', body: JSON.stringify(data) }),

  // Donations
  getDonations: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/donations${query ? `?${query}` : ''}`);
  },
  getDonation: (id) => request(`/api/donations/${id}`),
  createDonation: (data) => request('/api/donations', { method: 'POST', body: JSON.stringify(data) }),
  editDonation: (id, data) => request(`/api/donations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  withdrawDonation: (id) => request(`/api/donations/${id}/withdraw`, { method: 'PATCH' }),
  getMyDonations: () => request('/api/donations/mine'),
  uploadImage: (id, formData) => request(`/api/donations/${id}/image`, { method: 'POST', body: formData }),

  // Reservations
  getDonationReservations: (id) => request(`/api/donations/${id}/reservations`),
  requestReservation: (donationId, data) => request(`/api/donations/${donationId}/reservations`, { method: 'POST', body: JSON.stringify(data) }),
  getMyReservations: () => request('/api/reservations/mine'),
  approveReservation: (id) => request(`/api/reservations/${id}/approve`, { method: 'PATCH' }),
  rejectReservation: (id) => request(`/api/reservations/${id}/reject`, { method: 'PATCH' }),
  cancelReservation: (id) => request(`/api/reservations/${id}/cancel`, { method: 'PATCH' }),

  // Pickups
  getAssignedPickups: () => request('/api/pickups/assigned'),
  updatePickupStatus: (id, data) => request(`/api/pickups/${id}/status`, { method: 'PATCH', body: JSON.stringify(data) }),
  assignVolunteer: (id, volunteerId) => request(`/api/pickups/${id}/assign`, { method: 'PATCH', body: JSON.stringify({ volunteerId }) }),
  confirmHandover: (id) => request(`/api/pickups/${id}/confirm`, { method: 'PATCH' }),

  // Dashboards & Impact
  getDashboardSummary: () => request('/api/dashboard/summary'),
  getImpactSummary: () => request('/api/impact/summary'),

  // Notifications
  getNotifications: () => request('/api/notifications'),
  markNotificationRead: (id) => request(`/api/notifications/${id}/read`, { method: 'PATCH' }),

  // Reports
  createReport: (data) => request('/api/reports', { method: 'POST', body: JSON.stringify(data) }),

  // Admin
  getPendingVerifications: () => request('/api/admin/verifications'),
  updateVerification: (id, data) => request(`/api/admin/verifications/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  getAdminUsers: (search) => request(`/api/admin/users${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  updateUserStatus: (id, isActive) => request(`/api/admin/users/${id}/status`, { method: 'PATCH', body: JSON.stringify({ isActive }) }),
  moderateDonation: (id) => request(`/api/admin/donations/${id}/remove`, { method: 'PATCH' }),
  getAdminReports: () => request('/api/admin/reports'),
  resolveReport: (id, resolve) => request(`/api/admin/reports/${id}`, { method: 'PATCH', body: JSON.stringify({ resolve }) }),
};
