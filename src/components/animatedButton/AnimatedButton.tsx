"use client";

import { useState } from "react";

export default function AnimatedButton() {
  const [isHovered, setIsHovered] = useState(false);
  const [clicks, setClicks] = useState(0);

  return (
    <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-50 to-purple-50">
      <button
        className="px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:scale-110 hover:shadow-2xl active:scale-95"
        style={{
          transform: isHovered ? "scale(1.1) rotate(2deg)" : "scale(1)",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setClicks(clicks + 1)}
      >
        {clicks === 0 ? "Click Me!" : `Clicked ${clicks} times`}
      </button>
    </div>
  );
}
