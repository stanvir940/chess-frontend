import React, { useEffect, useMemo, useState } from "react";
import { getLegalMoves } from "./api";

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

const PIECE_UNICODE = {
  p: "♟",
  r: "♜",
  n: "♞",
  b: "♝",
  q: "♛",
  k: "♚",
  P: "♙",
  R: "♖",
  N: "♘",
  B: "♗",
  Q: "♕",
  K: "♔",
};

function fenToMap(fen) {
  if (!fen || fen === "start") fen = START_FEN;
  const part = fen.split(" ")[0];
  const rows = part.split("/");
  const map = {};
  for (let rank = 8; rank >= 1; rank--) {
    const row = rows[8 - rank];
    let fileIndex = 0;
    for (const ch of row) {
      if (/\d/.test(ch)) {
        fileIndex += parseInt(ch, 10);
      } else {
        const file = String.fromCharCode("a".charCodeAt(0) + fileIndex);
        const square = `${file}${rank}`;
        map[square] = ch;
        fileIndex += 1;
      }
    }
  }
  return map;
}

const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
const ranks = [8, 7, 6, 5, 4, 3, 2, 1];

const START_COUNTS = {
  P: 8,
  N: 2,
  B: 2,
  R: 2,
  Q: 1,
  K: 1,
  p: 8,
  n: 2,
  b: 2,
  r: 2,
  q: 1,
  k: 1,
};

function computeCaptured(fen) {
  const map = fenToMap(fen);
  const present = {};
  for (const ch of Object.keys(START_COUNTS)) present[ch] = 0;
  Object.values(map).forEach((p) => {
    if (present[p] !== undefined) present[p] += 1;
  });
  const whiteTaken = [];
  const blackTaken = [];
  for (const [piece, startCount] of Object.entries(START_COUNTS)) {
    const presentCount = present[piece] || 0;
    const missing = startCount - presentCount;
    if (missing > 0) {
      const isWhitePiece = piece === piece.toUpperCase();
      const unicode = PIECE_UNICODE[piece];
      for (let i = 0; i < missing; i++) {
        if (isWhitePiece) blackTaken.push(unicode);
        else whiteTaken.push(unicode);
      }
    }
  }
  return { whiteTaken, blackTaken };
}

export default function ChessBoard({
  position = "start",
  onDrop,
  boardSize = 960,
}) {
  const pieceMap = useMemo(() => fenToMap(position), [position]);
  const [selected, setSelected] = useState(null);
  const [localMap, setLocalMap] = useState(pieceMap);
  const [moving, setMoving] = useState(false);

  // allowed moves map: targetSquare -> [uciMoves...]
  const [allowedMap, setAllowedMap] = useState({});

  // keep local map synced when parent position changes
  useEffect(() => {
    setLocalMap(pieceMap);
    setSelected(null);
    setMoving(false);
    setAllowedMap({});
  }, [position]); // eslint-disable-line

  const squareColor = (fileIdx, rankIdx) =>
    (fileIdx + rankIdx) % 2 === 0 ? "#f0d9b5" : "#b58863";

  const handleSquareClick = async (sq) => {
    if (moving) return;

    const piece = localMap[sq];
    if (!selected) {
      if (!piece) return;
      setSelected(sq);
      try {
        const data = await getLegalMoves(position, sq);
        const map = {};
        (data.moves || []).forEach((m) => {
          const target = m.slice(2, 4);
          if (!map[target]) map[target] = [];
          map[target].push(m);
        });
        if (Object.keys(map).length === 0) {
          setSelected(null);
          setAllowedMap({});
          return;
        }
        setAllowedMap(map);
      } catch (err) {
        console.error("Failed to get legal moves:", err);
        setSelected(null);
        setAllowedMap({});
      }
      return;
    }

    if (selected === sq) {
      setSelected(null);
      setAllowedMap({});
      return;
    }

    const allowedTargets = Object.keys(allowedMap);
    if (!allowedTargets.includes(sq)) {
      return;
    }

    const uciList = allowedMap[sq] || [];
    let chosen = uciList.find((m) => m.length === 5 && m.endsWith("q"));
    if (!chosen) chosen = uciList[0];

    const moveParam = chosen.slice(2);
    const from = selected;
    const toParam = moveParam;
    const toSquare = toParam.slice(0, 2);

    const movingPiece = localMap[from];
    const prevFrom = localMap[from];
    const prevTo = localMap[toSquare];

    setLocalMap((m) => {
      const copy = { ...m };
      delete copy[from];
      if (movingPiece) copy[toSquare] = movingPiece;
      return copy;
    });
    setSelected(null);
    setAllowedMap({});

    try {
      const res = onDrop ? onDrop(from, toParam) : undefined;
      if (res && typeof res.then === "function") {
        setMoving(true);
        const awaited = await res;
        setMoving(false);
        if (awaited === false) {
          setLocalMap((m) => {
            const copy = { ...m };
            if (prevFrom) copy[from] = prevFrom;
            if (prevTo) copy[toSquare] = prevTo;
            else delete copy[toSquare];
            return copy;
          });
        }
      } else if (res === false) {
        setLocalMap((m) => {
          const copy = { ...m };
          if (prevFrom) copy[from] = prevFrom;
          if (prevTo) copy[toSquare] = prevTo;
          else delete copy[toSquare];
          return copy;
        });
      }
    } catch (err) {
      setLocalMap((m) => {
        const copy = { ...m };
        if (prevFrom) copy[from] = prevFrom;
        if (prevTo) copy[toSquare] = prevTo;
        else delete copy[toSquare];
        return copy;
      });
      setMoving(false);
      console.error("onDrop error:", err);
    }
  };

  const { whiteTaken, blackTaken } = computeCaptured(position);

  return (
    <div className="flex items-start gap-6 w-full max-w-[1000px]">
      {/* Board */}
      <div
        role="grid"
        aria-label="Chess board"
        style={{
          width: boardSize,
          height: boardSize,
          minWidth: boardSize,
          minHeight: boardSize,
          flex: "0 0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(8, 1fr)",
          gridTemplateRows: "repeat(8, 1fr)",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 8px 30px rgba(0,0,0,0.7)",
          userSelect: "none",
          background: "#222",
        }}
      >
        {ranks.map((rank, rankIdx) =>
          files.map((file, fileIdx) => {
            const sq = `${file}${rank}`;
            const piece = localMap[sq];
            const isSelected = selected === sq;
            const allowed = allowedMap[sq];
            return (
              <button
                key={sq}
                onClick={() => handleSquareClick(sq)}
                title={sq}
                aria-label={sq + (piece ? ` ${piece}` : "")}
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 42,
                  background: squareColor(fileIdx, rankIdx),
                  border: isSelected
                    ? "3px solid #4f46e5"
                    : allowed
                    ? "3px dashed #10b981"
                    : "1px solid rgba(0,0,0,0.06)",
                  padding: 0,
                  cursor: allowed || piece || selected ? "pointer" : "default",
                }}
              >
                {piece ? (
                  <span
                    className="text-black"
                    style={{ transform: "translateY(-2px)", fontSize: 40 }}
                  >
                    {PIECE_UNICODE[piece] || piece}
                  </span>
                ) : null}
              </button>
            );
          })
        )}
      </div>

      {/* Side UI */}
      <div style={{ minWidth: 220, color: "#fff" }}>
        <div style={{ marginBottom: 12 }}>
          <strong
            style={{ fontSize: 18, color: "black" }}
            className=" text-black"
          >
            Controls
          </strong>
        </div>

        <div style={{ fontSize: 14, color: "#cbd5e1" }}>
          <p>Click a piece to select, legal squares are highlighted.</p>
          <p style={{ marginTop: 8 }}>
            Selected:{" "}
            <span style={{ color: "#60a5fa" }}>
              {selected ? selected : "—"}
            </span>
          </p>
          {moving && <p style={{ color: "#93c5fd" }}>Processing move…</p>}

          <div style={{ marginTop: 12 }}>
            <div style={{ marginBottom: 6 }}>
              <strong style={{ fontSize: 13 }}>Captured</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 12, color: "#9ca3af" }}>White lost</div>
                <div style={{ fontSize: 20 }}>
                  {blackTaken.join(" ") || "—"}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, color: "#9ca3af" }}>Black lost</div>
                <div style={{ fontSize: 20 }}>
                  {whiteTaken.join(" ") || "—"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
