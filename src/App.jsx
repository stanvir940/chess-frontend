// App.js
import React, { useState, useEffect, useRef } from "react";
import { Chessboard } from "react-chessboard";
import { sendMove } from "./api";
import Chess from "chess.js"; // optional, but we'll use a tiny local chess to manage moves client-side
import "./App.css";

// If you don't want to install chess.js, you can still use FEN only.
// But installing chess.js helps client-side validation and animation.
// Install: npm install chess.js
// NOTE: using chess.js purely for UI convenience; backend validates moves.

function App() {
  const [fen, setFen] = useState("start"); // 'start' is accepted by react-chessboard
  const chessRef = useRef(null);

  // create a local chess instance to convert from square moves to uci
  useEffect(() => {
    // dynamic import of chess.js for client-side convenience
    async function init() {
      const { Chess } = await import("chess.js");
      chessRef.current = new Chess();
      setFen(chessRef.current.fen());
    }
    init();
  }, []);

  const onDrop = async (sourceSquare, targetSquare, piece) => {
    // e.g. sourceSquare = 'e2', targetSquare = 'e4'
    if (!chessRef.current) return false;

    // local attempt to move (this checks move legality quickly on client)
    const moveObj = chessRef.current.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    });
    if (moveObj === null) {
      // illegal locally
      return false;
    }

    // update UI optimistically
    setFen(chessRef.current.fen());

    // Send to backend: we send previous fen & uci of player's move.
    // But chessRef already updated fen; we need previous fen. We'll reconstruct:
    // easiest: set up to send move uci and previous fen by reversing the move locally then sending.
    // So better approach: compute uci from moveObj and previous fen kept separately.
    // For simplicity, re-create previous position by undoing last move:
    const playerUci =
      moveObj.from + moveObj.to + (moveObj.promotion ? moveObj.promotion : "");
    // Undo local move to obtain previous FEN
    chessRef.current.undo();
    const prevFen = chessRef.current.fen();

    try {
      const data = await sendMove(prevFen, playerUci, 2); // depth 2
      if (!data.ok) {
        alert("Server rejected move: " + (data.error || "unknown"));
        return false;
      }

      // apply player's move locally (again)
      chessRef.current.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q",
      });

      // apply engine move if provided
      if (data.engine_move) {
        // engine_move is UCI like e7e5 or e2e8q
        const eng = data.engine_move;
        const from = eng.slice(0, 2);
        const to = eng.slice(2, 4);
        const promotion = eng.length === 5 ? eng[4] : undefined;
        chessRef.current.move({ from, to, promotion });
      }

      setFen(chessRef.current.fen());
      if (data.game_over) {
        alert("Game over: " + (data.outcome || "result"));
      }
      return true;
    } catch (err) {
      console.error(err);
      alert("Error contacting server.");
      return false;
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: "20px auto" }}>
      <h2 style={{ textAlign: "center" }}>My Chess (Your Engine)</h2>
      <Chessboard
        position={fen === "start" ? "start" : fen}
        onPieceDrop={(sourceSquare, targetSquare, piece) =>
          onDrop(sourceSquare, targetSquare, piece)
        }
        boardWidth={560}
      />
      <p style={{ textAlign: "center" }}>
        Drag and drop to move. Engine depth = 2 (change in code).
      </p>
    </div>
  );
}

export default App;
