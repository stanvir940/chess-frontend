// src/App.jsx
import React, { useState, useEffect } from "react";
import ChessBoard from "./ChessBoard";
import { sendMove } from "./api"; // We'll create this API handler later
import ErrorBoundary from "./ErrorBoundary";

const App = () => {
  const [fen, setFen] = useState("start"); // Initial FEN (start position)
  const [gameOver, setGameOver] = useState(false);

  // Handle drop of a piece on the board
  const handleDrop = async (sourceSquare, targetSquare, piece) => {
    const move = `${sourceSquare}${targetSquare}`; // UCI move format

    const { fen, engine_move, game_over } = await sendMove(fen, move); // API call to backend

    setFen(fen);
    setGameOver(game_over);

    if (engine_move && !game_over) {
      // Optionally handle engine's move (apply animation or visual change)
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
      <h1 className="text-3xl font-bold mb-4">Chess Game</h1>
      <ErrorBoundary>
        {!gameOver ? (
          <ChessBoard position={fen} onDrop={handleDrop} />
        ) : (
          <p className="text-xl text-red-600">Game Over!</p>
        )}
      </ErrorBoundary>
    </div>
  );
};

export default App;
