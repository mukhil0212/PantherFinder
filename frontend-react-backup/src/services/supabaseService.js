import supabase from '../utils/supabaseClient';

// Items API
export const itemsApi = {
  getItems: async (params = {}) => {
    let query = supabase.from('items').select('*');
    
    // Apply filters if provided
    if (params.category) {
      query = query.eq('category', params.category);
    }
    
    if (params.status) {
      query = query.eq('status', params.status);
    }
    
    if (params.location_id) {
      query = query.eq('location_id', params.location_id);
    }
    
    if (params.user_id) {
      query = query.eq('user_id', params.user_id);
    }
    
    // Apply search if provided
    if (params.search) {
      query = query.or(`name.ilike.%${params.search}%,description.ilike.%${params.search}%`);
    }
    
    // Apply pagination
    if (params.limit) {
      query = query.limit(params.limit);
    }
    
    if (params.offset) {
      query = query.range(params.offset, params.offset + (params.limit || 10) - 1);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    return data;
  },
  
  getItem: async (itemId) => {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('id', itemId)
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  },
  
  createItem: async (itemData) => {
    const { data, error } = await supabase
      .from('items')
      .insert([itemData])
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  },
  
  updateItem: async (itemId, itemData) => {
    const { data, error } = await supabase
      .from('items')
      .update(itemData)
      .eq('id', itemId)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  },
  
  deleteItem: async (itemId) => {
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', itemId);
    
    if (error) {
      throw error;
    }
    
    return { success: true };
  },
  
  uploadImage: async (file, path) => {
    const filename = `${Date.now()}-${file.name}`;
    const fullPath = `${path}/${filename}`;
    
    const { data, error } = await supabase.storage
      .from('item-images')
      .upload(fullPath, file);
    
    if (error) {
      throw error;
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('item-images')
      .getPublicUrl(fullPath);
    
    return urlData.publicUrl;
  }
};

// Claims API
export const claimsApi = {
  getClaims: async (params = {}) => {
    let query = supabase.from('claims').select('*');
    
    // Apply filters if provided
    if (params.status) {
      query = query.eq('status', params.status);
    }
    
    if (params.item_id) {
      query = query.eq('item_id', params.item_id);
    }
    
    if (params.user_id) {
      query = query.eq('user_id', params.user_id);
    }
    
    // Apply pagination
    if (params.limit) {
      query = query.limit(params.limit);
    }
    
    if (params.offset) {
      query = query.range(params.offset, params.offset + (params.limit || 10) - 1);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    return data;
  },
  
  getClaim: async (claimId) => {
    const { data, error } = await supabase
      .from('claims')
      .select('*')
      .eq('id', claimId)
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  },
  
  createClaim: async (claimData) => {
    const { data, error } = await supabase
      .from('claims')
      .insert([claimData])
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  },
  
  updateClaim: async (claimId, claimData) => {
    const { data, error } = await supabase
      .from('claims')
      .update(claimData)
      .eq('id', claimId)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  },
  
  deleteClaim: async (claimId) => {
    const { error } = await supabase
      .from('claims')
      .delete()
      .eq('id', claimId);
    
    if (error) {
      throw error;
    }
    
    return { success: true };
  }
};

// Locations API
export const locationsApi = {
  getLocations: async (params = {}) => {
    let query = supabase.from('locations').select('*');
    
    // Apply filters if provided
    if (params.name) {
      query = query.ilike('name', `%${params.name}%`);
    }
    
    // Apply pagination
    if (params.limit) {
      query = query.limit(params.limit);
    }
    
    if (params.offset) {
      query = query.range(params.offset, params.offset + (params.limit || 10) - 1);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    return data;
  },
  
  getLocation: async (locationId) => {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('id', locationId)
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  },
  
  createLocation: async (locationData) => {
    const { data, error } = await supabase
      .from('locations')
      .insert([locationData])
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  },
  
  updateLocation: async (locationId, locationData) => {
    const { data, error } = await supabase
      .from('locations')
      .update(locationData)
      .eq('id', locationId)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  },
  
  deleteLocation: async (locationId) => {
    const { error } = await supabase
      .from('locations')
      .delete()
      .eq('id', locationId);
    
    if (error) {
      throw error;
    }
    
    return { success: true };
  }
};

// Users API
export const usersApi = {
  getUsers: async (params = {}) => {
    let query = supabase.from('profiles').select('*');
    
    // Apply filters if provided
    if (params.role) {
      query = query.eq('role', params.role);
    }
    
    if (params.search) {
      query = query.or(`name.ilike.%${params.search}%,email.ilike.%${params.search}%`);
    }
    
    // Apply pagination
    if (params.limit) {
      query = query.limit(params.limit);
    }
    
    if (params.offset) {
      query = query.range(params.offset, params.offset + (params.limit || 10) - 1);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    return data;
  },
  
  getUser: async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  },
  
  updateUser: async (userId, userData) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(userData)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  },
  
  deleteUser: async (userId) => {
    // This should be handled with caution and might require admin privileges
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);
    
    if (error) {
      throw error;
    }
    
    return { success: true };
  }
};

// Notifications API
export const notificationsApi = {
  getNotifications: async (params = {}) => {
    let query = supabase.from('notifications').select('*');
    
    // Apply filters if provided
    if (params.user_id) {
      query = query.eq('user_id', params.user_id);
    }
    
    if (params.read !== undefined) {
      query = query.eq('read', params.read);
    }
    
    // Apply sorting
    query = query.order('created_at', { ascending: false });
    
    // Apply pagination
    if (params.limit) {
      query = query.limit(params.limit);
    }
    
    if (params.offset) {
      query = query.range(params.offset, params.offset + (params.limit || 10) - 1);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    return data;
  },
  
  getNotification: async (notificationId) => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', notificationId)
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  },
  
  markAsRead: async (notificationId) => {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  },
  
  markAllAsRead: async (userId) => {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false)
      .select();
    
    if (error) {
      throw error;
    }
    
    return data;
  },
  
  createNotification: async (notificationData) => {
    const { data, error } = await supabase
      .from('notifications')
      .insert([notificationData])
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  },
  
  deleteNotification: async (notificationId) => {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);
    
    if (error) {
      throw error;
    }
    
    return { success: true };
  }
};

export default {
  itemsApi,
  claimsApi,
  locationsApi,
  usersApi,
  notificationsApi
};
