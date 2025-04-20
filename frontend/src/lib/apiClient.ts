// API base URL - adjust this to your backend URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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

  try {
    console.log(`Fetching ${url} with method ${options.method || 'GET'}`);
    console.log('Making request to:', url, 'with headers:', headers);

    const response = await fetch(url, {
      ...options,
      headers,
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
        errorMessage = errorData.message || errorMessage;
      } catch {
        console.error('Could not parse error response as JSON');
      }
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    console.error('Request details:', { url, endpoint, options });
    throw new Error(`API request failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Items API
const getItems = async (filters = {}) => {
  const queryParams = new URLSearchParams(filters as Record<string, string>).toString();
  return fetchAPI(`/items?${queryParams}`);
};

const getItemById = async (id: string) => {
  return fetchAPI(`/items/${id}`);
};

const createItem = async (itemData: any) => {
  return fetchAPI('/items', {
    method: 'POST',
    body: JSON.stringify(itemData),
  });
};

const submitItem = async (formData: FormData) => {
  // For file uploads, we need to use a different approach
  const url = `${API_BASE_URL}/items`;

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
      mode: 'cors',
    });

    if (!response.ok) {
      let errorMessage = `HTTP error: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        console.error('Could not parse error response as JSON');
      }
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    console.error('Error submitting item:', error);
    throw error;
  }
};

const updateItem = async (id: string, itemData: any) => {
  return fetchAPI(`/items/${id}`, {
    method: 'PUT',
    body: JSON.stringify(itemData),
  });
};

const deleteItem = async (id: string) => {
  return fetchAPI(`/items/${id}`, {
    method: 'DELETE',
  });
};

// Claims API
const getClaims = async () => {
  return fetchAPI('/claims');
};

const getClaimById = async (id: string) => {
  return fetchAPI(`/claims/${id}`);
};

const createClaim = async (claimData: any) => {
  return fetchAPI('/claims', {
    method: 'POST',
    body: JSON.stringify(claimData),
  });
};

const updateClaim = async (id: string, claimData: any) => {
  return fetchAPI(`/claims/${id}`, {
    method: 'PUT',
    body: JSON.stringify(claimData),
  });
};

// User Items API
const getUserItems = async () => {
  return fetchAPI('/users/items');
};

// User Claims API
const getUserClaims = async () => {
  return fetchAPI('/users/claims');
};

// Auth API
const login = async (credentials: { email: string; password: string }) => {
  return fetchAPI('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
};

const register = async (userData: any) => {
  return fetchAPI('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

const logout = async () => {
  return fetchAPI('/auth/logout', {
    method: 'POST',
  });
};

const getCurrentUser = async () => {
  return fetchAPI('/auth/me');
};

// Profile API
const getProfile = async () => {
  return fetchAPI('/users/profile');
};

const updateProfile = async (profileData: any) => {
  return fetchAPI('/users/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
};

const changePassword = async (passwordData: { current_password: string; new_password: string }) => {
  return fetchAPI('/users/change-password', {
    method: 'POST',
    body: JSON.stringify(passwordData),
  });
};

// Notifications API
const getNotifications = async () => {
  return fetchAPI('/notifications');
};

const markNotificationAsRead = async (id: string) => {
  return fetchAPI(`/notifications/${id}/read`, {
    method: 'POST',
  });
};

// Test CORS
const testCORS = async () => {
  try {
    // Try direct fetch first to see if CORS is working
    console.log('Making direct fetch request to CORS test endpoint');
    const directResponse = await fetch('http://localhost:5000/api/items/test-cors', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
    });

    console.log('Direct fetch response:', directResponse);
    if (directResponse.ok) {
      return await directResponse.json();
    } else {
      throw new Error(`Direct fetch failed with status: ${directResponse.status}`);
    }
  } catch (directErr) {
    console.error('Direct fetch error:', directErr);
    // Fall back to using fetchAPI
    console.log('Falling back to fetchAPI');
    return fetchAPI('/items/test-cors');
  }
};

// Export API functions
export {
  getItems,
  getItemById,
  createItem,
  submitItem,
  updateItem,
  deleteItem,
  getClaims,
  getClaimById,
  createClaim,
  updateClaim,
  getUserItems,
  getUserClaims,
  login,
  register,
  logout,
  getCurrentUser,
  getProfile,
  updateProfile,
  changePassword,
  getNotifications,
  markNotificationAsRead,
  testCORS
};
