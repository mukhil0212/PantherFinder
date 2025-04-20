import axios from 'axios';

// Items API
export const itemsApi = {
  getItems: async (params) => {
    const response = await axios.get('/api/items', { params });
    return response.data;
  },
  
  getItem: async (itemId) => {
    const response = await axios.get(`/api/items/${itemId}`);
    return response.data;
  },
  
  createItem: async (itemData) => {
    // Use FormData for file uploads
    const formData = new FormData();
    
    // Append all fields to FormData
    Object.keys(itemData).forEach(key => {
      if (key === 'image' && itemData[key]) {
        formData.append('image', itemData[key]);
      } else if (itemData[key] !== undefined && itemData[key] !== null) {
        formData.append(key, itemData[key]);
      }
    });
    
    const response = await axios.post('/api/items', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  },
  
  updateItem: async (itemId, itemData) => {
    // Use FormData for file uploads
    const formData = new FormData();
    
    // Append all fields to FormData
    Object.keys(itemData).forEach(key => {
      if (key === 'image' && itemData[key]) {
        formData.append('image', itemData[key]);
      } else if (itemData[key] !== undefined && itemData[key] !== null) {
        formData.append(key, itemData[key]);
      }
    });
    
    const response = await axios.put(`/api/items/${itemId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  },
  
  deleteItem: async (itemId) => {
    const response = await axios.delete(`/api/items/${itemId}`);
    return response.data;
  },
  
  getCategories: async () => {
    const response = await axios.get('/api/items/categories');
    return response.data;
  }
};

// Claims API
export const claimsApi = {
  getClaims: async (params) => {
    const response = await axios.get('/api/claims', { params });
    return response.data;
  },
  
  getClaim: async (claimId) => {
    const response = await axios.get(`/api/claims/${claimId}`);
    return response.data;
  },
  
  createClaim: async (claimData) => {
    const response = await axios.post('/api/claims', claimData);
    return response.data;
  },
  
  updateClaim: async (claimId, claimData) => {
    const response = await axios.put(`/api/claims/${claimId}`, claimData);
    return response.data;
  },
  
  deleteClaim: async (claimId) => {
    const response = await axios.delete(`/api/claims/${claimId}`);
    return response.data;
  }
};

// Locations API
export const locationsApi = {
  getLocations: async (params) => {
    const response = await axios.get('/api/locations', { params });
    return response.data;
  },
  
  getLocation: async (locationId) => {
    const response = await axios.get(`/api/locations/${locationId}`);
    return response.data;
  },
  
  createLocation: async (locationData) => {
    const response = await axios.post('/api/locations', locationData);
    return response.data;
  },
  
  updateLocation: async (locationId, locationData) => {
    const response = await axios.put(`/api/locations/${locationId}`, locationData);
    return response.data;
  },
  
  deleteLocation: async (locationId) => {
    const response = await axios.delete(`/api/locations/${locationId}`);
    return response.data;
  },
  
  getNearestLocation: async (coords) => {
    const response = await axios.get('/api/locations/nearest', { params: coords });
    return response.data;
  }
};

// Users API
export const usersApi = {
  getUsers: async (params) => {
    const response = await axios.get('/api/users', { params });
    return response.data;
  },
  
  getUser: async (userId) => {
    const response = await axios.get(`/api/users/${userId}`);
    return response.data;
  },
  
  updateUser: async (userId, userData) => {
    const response = await axios.put(`/api/users/${userId}`, userData);
    return response.data;
  },
  
  deleteUser: async (userId) => {
    const response = await axios.delete(`/api/users/${userId}`);
    return response.data;
  },
  
  getUserFoundItems: async (userId, params) => {
    const response = await axios.get(`/api/users/${userId}/items/found`, { params });
    return response.data;
  },
  
  getUserClaimedItems: async (userId, params) => {
    const response = await axios.get(`/api/users/${userId}/items/claimed`, { params });
    return response.data;
  },
  
  getUserClaims: async (userId, params) => {
    const response = await axios.get(`/api/users/${userId}/claims`, { params });
    return response.data;
  }
};

// Notifications API
export const notificationsApi = {
  getNotifications: async (params) => {
    const response = await axios.get('/api/notifications', { params });
    return response.data;
  },
  
  getNotification: async (notificationId) => {
    const response = await axios.get(`/api/notifications/${notificationId}`);
    return response.data;
  },
  
  markAsRead: async (notificationId) => {
    const response = await axios.put(`/api/notifications/${notificationId}/mark-read`, {});
    return response.data;
  },
  
  markAllAsRead: async () => {
    const response = await axios.put('/api/notifications/mark-all-read', {});
    return response.data;
  },
  
  deleteNotification: async (notificationId) => {
    const response = await axios.delete(`/api/notifications/${notificationId}`);
    return response.data;
  }
};