// src/api/adminApi.js

import axios from "axios";

// Get pending users
export const getPendingUsers = async () => {
  const token = localStorage.getItem("token");
  const response = await axios.get("http://localhost:5000/api/admin/pending-users", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data; // returns array of users
};
