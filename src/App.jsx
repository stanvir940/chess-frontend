import React, { useState, useEffect, useRef } from "react";
import ChessBoard from "./ChessBoard";
import { sendMove } from "./api";
import ErrorBoundary from "./ErrorBoundary";
import Test from "./Test";

const App = () => {
  const [fen, setFen] = useState("start");
  const [gameOver, setGameOver] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [started, setStarted] = useState(false);
  const [initialMinutes, setInitialMinutes] = useState(10);
  const [whiteTime, setWhiteTime] = useState(initialMinutes * 60);
  const [blackTime, setBlackTime] = useState(initialMinutes * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [engineDepth, setEngineDepth] = useState(2);

  const timerRef = useRef(null);

  // Timer useEffect remains the same as your original
  useEffect(() => {
    if (!started || !isTimerRunning || gameOver) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }
    if (timerRef.current) return;
    timerRef.current = setInterval(() => {
      const activeIsWhite = fen.includes(" w ");
      if (activeIsWhite) {
        setWhiteTime((t) => {
          if (t <= 1) {
            setGameOver(true);
            setIsTimerRunning(false);
            return 0;
          }
          return t - 1;
        });
      } else {
        setBlackTime((t) => {
          if (t <= 1) {
            setGameOver(true);
            setIsTimerRunning(false);
            return 0;
          }
          return t - 1;
        });
      }
    }, 1000);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [started, isTimerRunning, fen, gameOver]);

  const handleDrop = async (sourceSquare, targetSquareParam) => {
    if (isThinking || !started) return false;
    const move = `${sourceSquare}${targetSquareParam}`;
    setIsThinking(true);
    try {
      const data = await sendMove(fen, move, engineDepth);
      if (data) {
        setFen(data.fen);
        setGameOver(data.game_over);
      }
      return true;
    } catch (err) {
      console.error("Move failed:", err);
      return false;
    } finally {
      setIsThinking(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-[#1f1f1f] text-white flex">
      {/* Left Sidebar - Main Navigation */}
      <div className="w-64 bg-[#2c2c2c] border-r border-[#3d3d3d] flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-[#3d3d3d]">
          <h1 className="text-2xl font-bold text-white">Chessom</h1>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-1">
          <button className="w-full text-left px-4 py-3 bg-[#3d3d3d] text-white rounded-lg font-medium flex items-center justify-between">
            <span>Play</span>
          </button>
          <button className="w-full text-left px-4 py-2 text-gray-400 hover:text-white hover:bg-[#3d3d3d] rounded-lg transition-colors">
            Puzzles
          </button>
          <button className="w-full text-left px-4 py-2 text-gray-400 hover:text-white hover:bg-[#3d3d3d] rounded-lg transition-colors">
            Learn
          </button>
          <button className="w-full text-left px-4 py-2 text-gray-400 hover:text-white hover:bg-[#3d3d3d] rounded-lg transition-colors">
            Watch
          </button>
          <button className="w-full text-left px-4 py-2 text-gray-400 hover:text-white hover:bg-[#3d3d3d] rounded-lg transition-colors">
            News
          </button>
          <button className="w-full text-left px-4 py-2 text-gray-400 hover:text-white hover:bg-[#3d3d3d] rounded-lg transition-colors">
            Social
          </button>
          <button className="w-full text-left px-4 py-2 text-gray-400 hover:text-white hover:bg-[#3d3d3d] rounded-lg transition-colors">
            More
          </button>

          <button className="w-full px-4 py-3 bg-[#4CAF50] hover:bg-[#45a045] text-white font-semibold rounded-lg transition-colors mt-4">
            Free Trial
          </button>

          <div className="border-t border-[#3d3d3d] my-4"></div>

          {/* Quick Play Sections */}
          <div className="space-y-3">
            <div className="px-4 py-3 bg-[#3d3d3d] rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Play 10 min</span>
                <span className="text-sm text-gray-400">New Game</span>
              </div>
            </div>

            <div className="px-4 py-3 bg-[#3d3d3d] rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Play 15</span>
                <span className="text-sm text-gray-400">Puzzles: 915</span>
              </div>
            </div>
          </div>

          <div className="border-t border-[#3d3d3d] my-4"></div>

          {/* Lessons Section */}
          <div className="space-y-3">
            <div className="px-4 py-3 bg-[#3d3d3d] rounded-lg">
              <div className="text-sm text-gray-400">Next Lesson</div>
              <div className="text-white font-medium">
                Key Openings: Offbeat Openings
              </div>
            </div>

            <div className="px-4 py-3 bg-[#3d3d3d] rounded-lg">
              <div className="text-sm text-gray-400">Game Review</div>
              <div className="text-white font-medium">
                Learn from your mistakes
              </div>
            </div>

            <button className="w-full px-4 py-3 bg-[#2196F3] hover:bg-[#1976D2] text-white font-semibold rounded-lg transition-colors">
              Start Lesson
            </button>
            <button className="w-full px-4 py-3 bg-[#3d3d3d] hover:bg-[#4d4d4d] text-white font-semibold rounded-lg transition-colors">
              Review vs Lejaimec1601
            </button>
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-[#3d3d3d]">
          <div className="text-sm text-gray-400 mb-2">Daily Games (0)</div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-300">Light UI</span>
            <button className="text-gray-400 hover:text-white">Collapse</button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="h-16 bg-[#2c2c2c] border-b border-[#3d3d3d] flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <span className="text-gray-400">Recommended Match</span>
            <div className="flex items-center space-x-3 bg-[#3d3d3d] px-4 py-2 rounded-lg">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                E
              </div>
              <div>
                <div className="text-white font-medium">
                  eugeniyakornyak (400)
                </div>
                <div className="text-sm text-gray-400">
                  1 / 0 / 0 • Recent Opponent
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-gray-400">Live on ChessTV</div>
            <div className="flex items-center space-x-2 bg-[#f44336] px-3 py-1 rounded">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="text-white font-medium text-sm">LIVE NOW</span>
            </div>
          </div>
        </header>

        {/* Game Area */}
        <main className="flex-1 p-8">
          {!started ? (
            // Start Screen
            <div className="flex flex-col items-center justify-center h-full">
              <div className="bg-[#2c2c2c] rounded-2xl p-8 max-w-md w-full border border-[#3d3d3d]">
                <h2 className="text-2xl font-bold text-white mb-6">
                  Create New Game
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">
                      Game Length (Minutes)
                    </label>
                    <input
                      type="number"
                      value={initialMinutes}
                      onChange={(e) =>
                        setInitialMinutes(Number(e.target.value))
                      }
                      className="w-full bg-[#3d3d3d] border border-[#4d4d4d] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#2196F3]"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 text-sm mb-2">
                      AI Strength (Depth 1-6)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="6"
                      value={engineDepth}
                      onChange={(e) => setEngineDepth(Number(e.target.value))}
                      className="w-full bg-[#3d3d3d] border border-[#4d4d4d] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#2196F3]"
                    />
                  </div>

                  <button
                    onClick={() => {
                      setWhiteTime(initialMinutes * 60);
                      setBlackTime(initialMinutes * 60);
                      setStarted(true);
                      setIsTimerRunning(true);
                    }}
                    className="w-full bg-[#2196F3] hover:bg-[#1976D2] text-white font-semibold py-3 rounded-lg transition-colors mt-4"
                  >
                    Start Game vs AI
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Game Screen
            <div className="max-w-6xl mx-auto">
              <ErrorBoundary>
                <div className="flex gap-8 items-start">
                  {/* Chess Board */}
                  <div className="bg-[#2c2c2c] p-6 rounded-2xl border border-[#3d3d3d]">
                    <ChessBoard
                      position={fen}
                      onDrop={handleDrop}
                      boardSize={560}
                    />
                  </div>

                  {/* Game Info Panel */}
                  <div className="w-80 bg-[#2c2c2c] p-6 rounded-2xl border border-[#3d3d3d]">
                    <div className="space-y-6">
                      {/* Player Clocks */}
                      <div className="space-y-4">
                        <div
                          className={`p-4 rounded-lg ${
                            fen.includes(" w ")
                              ? "bg-[#2196F3]"
                              : "bg-[#3d3d3d]"
                          }`}
                        >
                          <div className="text-sm text-gray-300">White</div>
                          <div className="text-2xl font-bold">
                            {formatTime(whiteTime)}
                          </div>
                        </div>
                        <div
                          className={`p-4 rounded-lg ${
                            fen.includes(" b ")
                              ? "bg-[#2196F3]"
                              : "bg-[#3d3d3d]"
                          }`}
                        >
                          <div className="text-sm text-gray-300">Black</div>
                          <div className="text-2xl font-bold">
                            {formatTime(blackTime)}
                          </div>
                        </div>
                      </div>

                      {/* Game Controls */}
                      <div className="space-y-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setIsTimerRunning(!isTimerRunning)}
                            className="flex-1 bg-[#3d3d3d] hover:bg-[#4d4d4d] text-white py-2 rounded transition-colors"
                          >
                            {isTimerRunning ? "Pause" : "Resume"}
                          </button>
                          <button
                            onClick={() => {
                              setWhiteTime(initialMinutes * 60);
                              setBlackTime(initialMinutes * 60);
                            }}
                            className="px-4 bg-[#3d3d3d] hover:bg-[#4d4d4d] text-white py-2 rounded transition-colors"
                          >
                            Reset
                          </button>
                        </div>

                        <div className="text-center">
                          {gameOver ? (
                            <div className="text-red-400 font-semibold">
                              Game Over
                            </div>
                          ) : (
                            <div className="text-gray-400">
                              Turn:{" "}
                              <span className="text-white font-semibold">
                                {fen.includes(" w ") ? "White" : "Black"}
                              </span>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => setStarted(false)}
                          className="w-full bg-[#4CAF50] hover:bg-[#45a045] text-white font-semibold py-2 rounded transition-colors"
                        >
                          New Game
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </ErrorBoundary>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
