const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const apiRequest = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const carbonAPI = {
  calculateCarbon: (data) =>
    apiRequest('/calculate-carbon', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export const packagingAPI = {
  getRecommendations: (data) =>
    apiRequest('/packaging-recommendations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export const routeAPI = {
  optimizeRoute: (data) =>
    apiRequest('/optimize-route', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export const healthAPI = {
  check: () => apiRequest('/health'),
};