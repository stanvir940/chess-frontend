// api.js
import axios from "axios";
const API_BASE = "http://127.0.0.1:8001";

export async function sendMove(fen, uciMove, depth = 2) {
  const payload = { fen, move: uciMove, depth };
  const res = await axios.post(`${API_BASE}/move`, payload);
  return res.data;
}
