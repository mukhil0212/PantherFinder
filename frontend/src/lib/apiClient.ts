// API base URL - adjust this to your backend URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Always use the real backend API

// Helper function for making API requests
async function fetchAPI(endpoint: string, options: RequestInit = {}) {

  const url = `${API_BASE_URL}${endpoint}`;

  // Default headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };

  // Include auth token if available
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('Using auth token:', token.substring(0, 10) + '...');
  } else {
    console.warn('No auth token available for API request');
  }

  // CORS headers are set by the server, not the client

  try {
    console.log(`Fetching ${url} with method ${options.method || 'GET'}`);

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
      mode: 'cors',
      cache: 'no-cache',
    });

    // Log response details for debugging
    console.log('Response status:', response.status);
    console.log('Response headers:', [...response.headers.entries()]);

    // Handle HTTP errors
    if (!response.ok) {
      let errorMessage = `HTTP error: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        console.error('API error response:', errorData);
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (jsonError) {
        console.error('Failed to parse error response as JSON:', jsonError);
      }

      // Log detailed error information
      console.error(`API Error (${response.status}): ${errorMessage}`);
      console.error('Request details:', { endpoint, method: options.method || 'GET' });

      // For authentication errors, clear the token
      if (response.status === 401) {
        localStorage.removeItem('authToken');
        console.warn('Authentication token cleared due to 401 response');
      }

      throw new Error(errorMessage);
    }

    // Parse JSON response
    const data = await response.json();
    console.log('API response data:', data);
    return data;
  } catch (error: unknown) {
    console.error('Fetch error:', error);
    console.error('Request details:', { url, endpoint, method: options.method || 'GET' });

    // Propagate the error with more context
    if (error instanceof Error) {
      throw new Error(`API request failed: ${error.message}`);
    } else {
      throw new Error(`API request failed: ${String(error)}`);
    }
  }
}

// Items API
export const getItems = async (filters = {}) => {
  const queryParams = new URLSearchParams(filters as Record<string, string>).toString();
  return fetchAPI(`/api/items?${queryParams}`);
};

export const getItemById = async (id: string) => {
  return fetchAPI(`/api/items/${id}`);
};

export const createItem = async (itemData: any) => {
  return fetchAPI('/api/items', {
    method: 'POST',
    body: JSON.stringify(itemData),
  });
};

export const submitItem = async (formData: FormData) => {
  // For file uploads, we need to use a different approach
  const url = `${API_BASE_URL}/api/items`;

  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    const headers: HeadersInit = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
      credentials: 'include',
      mode: 'cors',
    });

    if (!response.ok) {
      let errorMessage = `HTTP error: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (jsonError) {
        console.error('Failed to parse error response as JSON:', jsonError);
      }
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    console.error('Error submitting item:', error);
    throw error;
  }
};

export const updateItem = async (id: string, itemData: any) => {
  return fetchAPI(`/api/items/${id}`, {
    method: 'PUT',
    body: JSON.stringify(itemData),
  });
};

export const deleteItem = async (id: string) => {
  return fetchAPI(`/api/items/${id}`, {
    method: 'DELETE',
  });
};

// Claims API
export const getClaims = async () => {
  return fetchAPI('/api/claims');
};

export const getClaimById = async (id: string) => {
  return fetchAPI(`/api/claims/${id}`);
};

export const createClaim = async (claimData: any) => {
  return fetchAPI('/api/claims', {
    method: 'POST',
    body: JSON.stringify(claimData),
  });
};

export const updateClaim = async (id: string, claimData: any) => {
  return fetchAPI(`/api/claims/${id}`, {
    method: 'PUT',
    body: JSON.stringify(claimData),
  });
};

// User Items API
export const getUserItems = async () => {
  return fetchAPI('/api/users/items');
};

// User Claims API
export const getUserClaims = async () => {
  return fetchAPI('/api/users/claims');
};

// Auth API
export const login = async (credentials: { email: string; password: string }) => {
  return fetchAPI('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
};

export const register = async (userData: any) => {
  return fetchAPI('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

export const logout = async () => {
  localStorage.removeItem('authToken');
  return { success: true };
};

export const getCurrentUser = async () => {
  return fetchAPI('/api/auth/me');
};

// Profile API
export const getProfile = async () => {
  return fetchAPI('/api/auth/profile');
};

export const updateProfile = async (profileData: any) => {
  return fetchAPI('/api/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
};

export const changePassword = async (passwordData: { current_password: string; new_password: string }) => {
  return fetchAPI('/api/auth/change-password', {
    method: 'PUT',
    body: JSON.stringify(passwordData),
  });
};

// Notifications API
export const getNotifications = async () => {
  return fetchAPI('/api/notifications');
};

export const markNotificationAsRead = async (id: string) => {
  return fetchAPI(`/api/notifications/${id}/mark-read`, {
    method: 'PUT',
  });
};
