export const sendMove = async (fen, move) => {
  try {
    const res = await fetch("http://127.0.0.1:5001/move", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fen, move }),
    });

    console.log("Response status:", res);
    if (!res.ok) throw new Error("Failed to fetch from backend");

    return await res.json();
  } catch (err) {
    console.error("API Error:", err);
    return null;
  }
};
