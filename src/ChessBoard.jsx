// src/ChessBoard.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";

const ChessBoard = ({ position, onDrop }) => {
  const [game, setGame] = useState(new Chess());
  const [boardPosition, setBoardPosition] = useState("start");
  const [moveSquares, setMoveSquares] = useState({});
  const [optionSquares, setOptionSquares] = useState({});

  useEffect(() => {
    if (position !== "start") {
      game.load(position);
      setBoardPosition(position);
    }
  }, [position]);

  // Handle move
  const onPieceDrop = async (sourceSquare, targetSquare) => {
    const move = game.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    });

    if (move === null) return false;

    setBoardPosition(game.fen());

    // Send move to backend for engine response
    await onDrop(sourceSquare, targetSquare, move.piece);

    return true;
  };

  // Highlight possible moves
  const getMoveOptions = useCallback(
    (square) => {
      const moves = game.moves({
        square,
        verbose: true,
      });

      if (moves.length === 0) return;

      const newSquares = {};
      moves.forEach((move) => {
        newSquares[move.to] = {
          background:
            game.get(move.to) &&
            game.get(move.to).color !== game.get(square).color
              ? "radial-gradient(circle, rgba(255,0,0,.6) 36%, transparent 40%)"
              : "radial-gradient(circle, rgba(0,0,255,.4) 36%, transparent 40%)",
          borderRadius: "50%",
        };
      });

      newSquares[square] = {
        background: "rgba(255,255,0,0.4)",
      };

      setOptionSquares(newSquares);
    },
    [game]
  );

  return (
    <div className="shadow-lg rounded-2xl border border-gray-300 bg-white">
      <Chessboard
        position={boardPosition}
        onPieceDrop={onPieceDrop}
        boardWidth={500}
        arePiecesDraggable={!game.isGameOver()}
        animationDuration={300}
        boardOrientation="white"
        customBoardStyle={{
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
        }}
        customSquareStyles={{
          ...moveSquares,
          ...optionSquares,
        }}
        onMouseOverSquare={(square) => getMoveOptions(square)}
        onMouseOutSquare={() => setOptionSquares({})}
      />
    </div>
  );
};

export default ChessBoard;
