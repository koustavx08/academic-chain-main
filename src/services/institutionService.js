import fetch from 'isomorphic-fetch';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const customFetch = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

const institutionService = {
  async registerInstitution(address, registeredBy) {
    return customFetch(`${API_URL}/institutions`, {
      method: 'POST',
      body: JSON.stringify({ address, registeredBy }),
    });
  },

  async getInstitutions() {
    return customFetch(`${API_URL}/institutions`);
  },

  async removeInstitution(address) {
    return customFetch(`${API_URL}/institutions/${address}`, {
      method: 'DELETE',
    });
  },
};

export { institutionService }; 