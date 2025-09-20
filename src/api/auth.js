// src/api/auth.js
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const login = async (email, password) => {
  const res = await axios.post(`${BASE_URL}/api/auth/login`, { email, password });
  return res.data; 
};

export const register = async (name, email, password) => {
  const res = await axios.post(`${BASE_URL}/api/auth/register`, { name, email, password });
  return res.data;
};

export const getCurrentUser = async (token) => {
  const res = await axios.get(`${BASE_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
