import React, { useState } from "react";
import ChessBoard from "./ChessBoard";
import { sendMove } from "./api";
import ErrorBoundary from "./ErrorBoundary";

const App = () => {
  const [fen, setFen] = useState("start");
  const [gameOver, setGameOver] = useState(false);
  const [engineMove, setEngineMove] = useState(null);
  const [isThinking, setIsThinking] = useState(false);

  const handleDrop = async (sourceSquare, targetSquare) => {
    if (isThinking) return false; // Prevent spamming during engine calculation

    const move = `${sourceSquare}${targetSquare}`;
    setIsThinking(true);

    try {
      const data = await sendMove(fen, move);
      if (data) {
        setFen(data.fen);
        setGameOver(data.game_over);
        setEngineMove(data.engine_move);
      }
    } catch (err) {
      console.error("Move failed:", err);
    } finally {
      setIsThinking(false);
    }
  };

  const handleNewGame = () => {
    setFen("start");
    setGameOver(false);
    setEngineMove(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 flex flex-col justify-center items-center text-white">
      <h1 className="text-4xl font-extrabold mb-4 tracking-wide">
        ♟️ Chess AI
      </h1>

      <ErrorBoundary>
        {!gameOver ? (
          <div className="relative">
            <ChessBoard position={fen} onDrop={handleDrop} />
            {isThinking && (
              <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                <p className="text-lg text-blue-300 animate-pulse">
                  🤖 Thinking...
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xl text-red-400 mt-4">Game Over!</p>
        )}
      </ErrorBoundary>

      <div className="flex flex-col items-center mt-4">
        {engineMove && !gameOver && (
          <p className="text-gray-300 mb-2 transition-all duration-300">
            Engine played:{" "}
            <span className="font-semibold text-blue-400">{engineMove}</span>
          </p>
        )}

        <button
          onClick={handleNewGame}
          className="mt-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition-transform transform hover:scale-105"
        >
          ♻️ New Game
        </button>
      </div>
    </div>
  );
};

export default App;
