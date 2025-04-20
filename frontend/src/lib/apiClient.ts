// API base URL - adjust this to your backend URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Flag to determine if we should use the backend API or not
const USE_BACKEND_API = false; // Set to false to disable backend API calls and use mock data

// Helper function for making API requests
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  // If we're not using the backend API, return mock data
  if (!USE_BACKEND_API) {
    console.log(`Backend API disabled, would have fetched: ${endpoint}`);
    return getMockResponse(endpoint, options);
  }

  const url = `${API_BASE_URL}${endpoint}`;

  // Default headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Include auth token if available
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    console.log(`Fetching ${url} with method ${options.method || 'GET'}`);

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
      mode: 'cors',
    });

    console.log(`Response status: ${response.status}`);

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

      // If backend is unavailable, return mock data instead of throwing
      if (response.status === 404 || response.status === 500 || response.status === 502 || response.status === 503) {
        console.warn('Backend unavailable, using mock data');
        return getMockResponse(endpoint, options);
      }

      throw new Error(errorMessage);
    }

    // Parse JSON response
    const data = await response.json();
    console.log('API response data:', data);
    return data;
  } catch (error) {
    console.error('Fetch error:', error);

    // If fetch fails completely (e.g., network error), return mock data
    console.warn('Fetch failed, using mock data');
    return getMockResponse(endpoint, options);
  }
}

// Function to generate mock responses when backend is unavailable
function getMockResponse(endpoint: string, options: RequestInit = {}) {
  const method = options.method || 'GET';

  // Mock user data
  const mockUser = {
    id: 'mock-user-id',
    name: 'Mock User',
    email: 'mock@example.com',
    phone_number: '123-456-7890',
    role: 'user',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // Handle different endpoints
  if (endpoint === '/api/auth/me' || endpoint === '/api/auth/profile') {
    return mockUser;
  }

  if (endpoint === '/api/auth/login' && method === 'POST') {
    return {
      message: 'Login successful',
      user: mockUser,
      access_token: 'mock-access-token'
    };
  }

  if (endpoint === '/api/auth/register' && method === 'POST') {
    return {
      message: 'User registered successfully',
      user: mockUser,
      access_token: 'mock-access-token'
    };
  }

  if (endpoint === '/api/users/profile') {
    return mockUser;
  }

  if (endpoint.startsWith('/api/items')) {
    return {
      items: [
        {
          id: 'mock-item-1',
          name: 'Mock Item 1',
          category: 'Electronics',
          location: 'Library',
          date_found: new Date().toISOString(),
          description: 'A mock item for testing',
          status: 'found',
          user_found_id: 'mock-user-id'
        }
      ],
      total: 1,
      pages: 1,
      current_page: 1
    };
  }

  if (endpoint.startsWith('/api/notifications')) {
    return {
      notifications: [
        {
          id: 'mock-notification-1',
          title: 'New Item Found',
          message: 'Someone found an item that matches your lost item description.',
          created_at: new Date().toISOString(),
          read: false,
          type: 'item_found',
          related_id: 'mock-item-1'
        }
      ],
      total: 1,
      pages: 1,
      current_page: 1,
      unread_count: 1
    };
  }

  if (endpoint === '/api/users/items') {
    return {
      items: [
        {
          id: 'mock-user-item-1',
          name: 'My Lost Laptop',
          category: 'Electronics',
          location: 'Library',
          date_found: new Date().toISOString(),
          description: 'My personal laptop that I submitted',
          status: 'found',
          user_found_id: 'mock-user-id'
        }
      ],
      total: 1
    };
  }

  if (endpoint === '/api/users/claims') {
    return {
      claims: [
        {
          id: 'mock-claim-1',
          item_id: 'mock-item-1',
          item_name: 'MacBook Pro',
          date_claimed: new Date().toISOString(),
          status: 'pending',
          item_category: 'Electronics',
          item_location: 'Library'
        }
      ],
      total: 1
    };
  }

  // Default response
  return { message: 'Mock response for ' + endpoint };
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
  return fetchAPI('/api/users/profile');
};

export const updateProfile = async (profileData: any) => {
  return fetchAPI('/api/users/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
};

export const changePassword = async (passwordData: { current_password: string; new_password: string }) => {
  return fetchAPI('/api/users/password', {
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
