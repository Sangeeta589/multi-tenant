//src/api/api.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; // Adjust according to your backend URL

// Fetch resources from the backend
export const fetchResources = async () => {
  try {
    const response = await axios.get(`${API_URL}/resources`);
    return response.data;
  } catch (error) {
    console.error('Error fetching resources:', error);
    throw error;
  }
};

// Example other exports
/*export const login = async (email, password) => {
  return await axios.post(`${API_URL}/auth/login`, { email, password });
};*/

export const login = async (credentials) => {
  try {
    const response = await axios.post(
      `${API_URL}/auth/login`, // ✅ Ensure correct endpoint
      credentials,
      { headers: { "Content-Type": "application/json" } }
    );
    return response; // ✅ Return response to Login.js
  } catch (error) {
    console.error("Login Failed:", error.response ? error.response.data : error.message);
    throw new Error("Login failed"); // 🔴 Rethrow error to be handled in Login.js
  }
};

export const register = async (userData) => {
  return await axios.post(`${API_URL}/auth/register`, userData);
};
