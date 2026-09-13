// features/curriculum/components/journey/JourneyConnector.tsx

import React from "react";

interface JourneyConnectorProps {
  completed: boolean;
  active?: boolean;
  fromOffset?: "left" | "center" | "right";
  toOffset?: "left" | "center" | "right";
}

export function JourneyConnector({
  completed,
  active = false,
  fromOffset = "center",
  toOffset = "center",
}: JourneyConnectorProps) {
  // Mapping offsets to X percentages in a 240px container
  const getX = (offset: "left" | "center" | "right") => {
    switch (offset) {
      case "left":
        return 40;
      case "right":
        return 200;
      case "center":
      default:
        return 120;
    }
  };

  const x1 = getX(fromOffset);
  const x2 = getX(toOffset);
  const height = 48;

  // Bezier curve control points
  const d = `M ${x1} 0 C ${x1} ${height / 2}, ${x2} ${height / 2}, ${x2} ${height}`;

  return (
    <div
      className="w-full max-w-[280px] sm:max-w-[320px] mx-auto pointer-events-none flex justify-center -my-1 relative z-0"
      aria-hidden="true"
    >
      <svg
        viewBox={`0 0 240 ${height}`}
        className="w-full overflow-visible"
        style={{ height: `${height}px` }}
      >
        {/* Background shadow stroke for depth */}
        <path
          d={d}
          fill="none"
          stroke={completed || active ? "#141827" : "#E2DDD2"}
          strokeWidth="8"
          strokeLinecap="round"
          opacity={completed || active ? "0.2" : "0.5"}
          transform="translate(0, 3)"
        />

        {/* Main path stroke */}
        <path
          d={d}
          fill="none"
          stroke={completed ? "#5C6470" : active ? "#141827" : "#D8D8D8"}
          strokeWidth={completed || active ? "6" : "4"}
          strokeDasharray={completed || active ? "none" : "6 6"}
          strokeLinecap="round"
          className="transition-colors duration-300"
        />

        {/* Flowing animated accent pulse for active/completed path */}
        {completed && (
          <path
            d={d}
            fill="none"
            stroke="#C8D4CF"
            strokeWidth="3"
            strokeLinecap="round"
          />
        )}
        {active && (
          <path
            d={d}
            fill="none"
            stroke="#F6D86B"
            strokeWidth="3"
            strokeLinecap="round"
          />
        )}
      </svg>
    </div>
  );
}
