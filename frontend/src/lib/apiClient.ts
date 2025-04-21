// API base URL - adjust this to your backend URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
console.log('Using API base URL:', API_BASE_URL);

// Helper function for making API requests
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  // Default headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };

  // Get auth token from Supabase session
  let token = null;
  if (typeof window !== 'undefined') {
    // Try localStorage first
    token = localStorage.getItem('authToken');

    // If not in localStorage, try cookies
    if (!token) {
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'authToken') {
          token = value;
          console.log('Retrieved auth token from cookie');
          break;
        }
      }
    }

    // If we still don't have a token, try to get it directly from Supabase
    if (!token && window.localStorage.getItem('supabase.auth.token')) {
      try {
        const supabaseAuthData = JSON.parse(window.localStorage.getItem('supabase.auth.token') || '{}');
        if (supabaseAuthData?.currentSession?.access_token) {
          token = supabaseAuthData.currentSession.access_token;
          console.log('Retrieved auth token directly from Supabase storage');
          // Save it to our standard location for future use
          localStorage.setItem('authToken', token);
        }
      } catch (e) {
        console.error('Error parsing Supabase auth data:', e);
      }
    }
  }

  // Include token in headers if available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('Using auth token:', token.substring(0, 10) + '...');
  } else {
    console.warn('No auth token available for API request to:', endpoint);
    // For debugging purposes, log the localStorage contents (without sensitive data)
    if (typeof window !== 'undefined') {
      console.log('LocalStorage keys:', Object.keys(localStorage));
    }
  }

  // Log the complete request details for debugging
  console.log(`API Request: ${options.method || 'GET'} ${url}`, { headers });

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

    // Check if the response is empty but valid (like an empty array)
    const responseText = await response.text();
    console.log('Response body:', responseText);

    // Handle empty or minimal responses
    if (!responseText || responseText.trim() === '') {
      console.log('Empty response received, returning empty object');
      return {};
    }

    if (responseText === '[]') {
      console.log('Empty array response received, returning empty array');
      return [];
    }

    if (responseText === '{}') {
      console.log('Empty object response received, returning empty object');
      return {};
    }

    // Parse the JSON response
    try {
      const jsonData = JSON.parse(responseText);
      console.log('Parsed JSON data:', jsonData);
      return jsonData;
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
      throw new Error(`Failed to parse API response: ${responseText}`);
    }

    // Handle HTTP errors
    if (!response.ok) {
      const errorMessage = `HTTP error: ${response.status} ${response.statusText}`;
      console.error('API error response status:', response.status);
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('Request details:', { url, endpoint, options });
    throw new Error(`API request failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Items API
const getItems = async (filters: Record<string, string> = {}) => {
  const queryParams = new URLSearchParams(filters).toString();
  return fetchAPI(`/items?${queryParams}`);
};

const getItemById = async (id: string) => {
  return fetchAPI(`/items/${id}`);
};

const createItem = async (itemData: unknown) => {
  return fetchAPI('/items', {
    method: 'POST',
    body: JSON.stringify(itemData),
  });
};

const submitItem = async (formData: FormData, itemType: 'found' | 'lost' = 'found') => {
  // For file uploads, we need to use a different approach
  try {
    console.log(`Submitting ${itemType} item to API_BASE_URL:`, API_BASE_URL);

    // Get the token for authentication
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    const headers: HeadersInit = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Log the request details for debugging
    // Remove any trailing slashes from API_BASE_URL to avoid Flask redirect issues
    const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    // Use different endpoints for found and lost items
    const submitUrl = itemType === 'lost' ? `${baseUrl}/items/lost` : `${baseUrl}/items`;
    console.log('Submitting to URL:', submitUrl);
    console.log('With headers:', headers);
    console.log('Form data keys:', [...formData.keys()]);

    // Make the request with specific CORS settings
    const response = await fetch(submitUrl, {
      method: 'POST',
      headers,
      body: formData,
      mode: 'cors',
      credentials: 'same-origin', // Changed from 'include' to 'same-origin'
    });

    // Log response details for debugging
    console.log('Response status:', response.status);
    if (response.headers) {
      try {
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      } catch (e) {
        console.log('Could not log response headers:', e);
      }
    }

    // Check if the response is empty but valid
    const responseText = await response.text();
    console.log('Response body:', responseText);

    // Handle empty response
    if (!responseText || responseText.trim() === '') {
      console.log('Empty response received, returning empty object');
      return {};
    }

    // Parse the JSON response
    try {
      const jsonData = JSON.parse(responseText);
      console.log('Parsed JSON data:', jsonData);
      return jsonData;
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
      throw new Error(`Failed to parse API response: ${responseText}`);
    }
  } catch (error) {
    console.error('Error submitting item:', error);
    // Provide more detailed error information
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Network error: Could not connect to the server. Please check if the backend server is running and accessible.');
    }
    throw new Error(`Failed to submit item: ${error instanceof Error ? error.message : String(error)}`);
  }
};

const updateItem = async (id: string, itemData: unknown) => {
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

const createClaim = async (claimData: unknown) => {
  return fetchAPI('/claims', {
    method: 'POST',
    body: JSON.stringify(claimData),
  });
};

const updateClaim = async (id: string, claimData: unknown) => {
  return fetchAPI(`/claims/${id}`, {
    method: 'PUT',
    body: JSON.stringify(claimData),
  });
};

// User Items API
const getUserItems = async () => {
  return fetchAPI('/items/my-items');
};

// User Claims API
const getUserClaims = async () => {
  try {
    // Try the /users/claims endpoint first (which returns {claims: [...]})
    return await fetchAPI('/users/claims');
  } catch (error) {
    console.warn('Error fetching from /users/claims, trying fallback endpoint', error);
    try {
      // Fallback to /users/me/claims endpoint (which returns [])
      return await fetchAPI('/users/me/claims');
    } catch (fallbackError) {
      console.error('Both claim endpoints failed', fallbackError);
      // Return an empty array as a safe fallback
      return [];
    }
  }
};

// Auth API
const login = async (credentials: { email: string; password: string }) => {
  return fetchAPI('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
};

const register = async (userData: unknown) => {
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

const updateProfile = async (profileData: unknown) => {
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

// Messages API
const getConversations = async () => {
  return fetchAPI('/messages/conversations');
};

const getConversationMessages = async (receiverId: string, itemId?: string) => {
  const queryParams = itemId ? `?item_id=${itemId}` : '';
  return fetchAPI(`/messages/conversations/${receiverId}${queryParams}`);
};

const sendMessage = async (messageData: { receiver_id: string; content: string; item_id?: string }) => {
  return fetchAPI('/messages/send', {
    method: 'POST',
    body: JSON.stringify(messageData),
  });
};

const markMessageAsRead = async (messageId: string) => {
  return fetchAPI(`/messages/${messageId}/read`, {
    method: 'POST',
  });
};

const getUnreadMessageCount = async () => {
  return fetchAPI('/messages/unread-count');
};

// Test CORS
const testCORS = async () => {
  try {
    // Try direct fetch first to see if CORS is working
    console.log('Making direct fetch request to CORS test endpoint');
    const directResponse = await fetch('http://localhost:5001/api/items/test-cors', {
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
  getConversations,
  getConversationMessages,
  sendMessage,
  markMessageAsRead,
  getUnreadMessageCount,
  testCORS
};
