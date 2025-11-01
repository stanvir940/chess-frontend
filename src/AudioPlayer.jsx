import React, { useEffect, useRef } from "react";

const AudioPlayer = ({ src, duration = 5000 }) => {
  const audioRef = useRef(null); // Reference to the audio element

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play(); // Play the audio
      // Stop the audio after the specified duration
      const timeout = setTimeout(() => {
        audioRef.current.pause();
        audioRef.current.currentTime = 0; // Reset to the start
      }, duration);

      // Cleanup timeout when component unmounts
      return () => clearTimeout(timeout);
    }
  }, [src, duration]); // Re-run if `src` or `duration` changes

  return <audio ref={audioRef} src={src} preload="auto" />;
};

export default AudioPlayer;
