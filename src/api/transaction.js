// src/api/transaction.js
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const getTransactions = async (token) => {
  const res = await axios.get(`${BASE_URL}/api/transactions`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const addTransaction = async (transaction, token) => {
  const res = await axios.post(`${BASE_URL}/api/transactions`, transaction, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const deleteTransaction = async (id, token) => {
  const res = await axios.delete(`${BASE_URL}/api/transactions/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
