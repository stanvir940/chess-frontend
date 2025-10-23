// src/Chessboard.jsx
import React from "react";
import { Chessboard } from "react-chessboard";

const ChessBoard = ({ position, onDrop }) => {
  return (
    <div className="flex justify-center items-center mt-10">
      <Chessboard position={position} onPieceDrop={onDrop} />
    </div>
  );
};

export default ChessBoard;
