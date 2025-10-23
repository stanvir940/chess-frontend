// src/api.js
import axios from "axios";

const API_URL = "http://localhost:8001"; // Backend API URL

export const sendMove = async (fen, move) => {
  try {
    const response = await axios.post(`${API_URL}/move`, { fen, move });
    return response.data;
  } catch (error) {
    console.error("Error sending move:", error);
    return { error: "Failed to make move" };
  }
};
