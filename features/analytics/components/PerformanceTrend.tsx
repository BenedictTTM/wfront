// features/analytics/components/PerformanceTrend.tsx

import React, { useState } from "react";
import { TrendingUp, TrendingDown, Minus, HelpCircle, Activity, Calendar } from "lucide-react";
import type { PerformanceTrend, PerformanceTrendPoint } from "../types";

interface PerformanceTrendProps {
  trend: PerformanceTrend;
}

/** Formats ISO date string "YYYY-MM-DD" into a concise "MMM d" (e.g., "Sep 8") */
function formatDateLabel(dateStr: string): string {
  try {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const monthIndex = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const date = new Date(Date.UTC(year, monthIndex, day));
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
    }
  } catch {
    // Fallback
  }
  return dateStr.slice(5); // "MM-DD"
}

export function PerformanceTrendCard({ trend }: PerformanceTrendProps) {
  const { history = [], trendDirection, percentageChange, insight, period = "14d" } = trend;
  const [activePointIndex, setActivePointIndex] = useState<number | null>(null);

  // Direction badge styling
  const getDirectionBadge = () => {
    switch (trendDirection) {
      case "IMPROVING":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-black bg-secondary text-text-primary border-2 border-border px-3 py-1 rounded-full uppercase tracking-wider shadow-[0_1px_0_#141827]">
            <TrendingUp className="w-3.5 h-3.5 stroke-[2.5]" />
            Improving {percentageChange !== null && `(+${percentageChange}%)`}
          </span>
        );
      case "NEEDS_FOCUS":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-black bg-[#FADBD8] text-text-primary border-2 border-border px-3 py-1 rounded-full uppercase tracking-wider shadow-[0_1px_0_#141827]">
            <TrendingDown className="w-3.5 h-3.5 stroke-[2.5]" />
            Needs Attention {percentageChange !== null && `(${percentageChange}%)`}
          </span>
        );
      case "STEADY":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-black bg-bg-secondary text-text-primary border-2 border-border px-3 py-1 rounded-full uppercase tracking-wider shadow-[0_1px_0_#141827]">
            <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
            Steady
          </span>
        );
      case "NOT_ENOUGH_DATA":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-black bg-surface-muted text-text-secondary border-2 border-border px-3 py-1 rounded-full uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5 stroke-[2]" />
            Building Trend
          </span>
        );
    }
  };

  const periodLabel =
    period === "7d"
      ? "Last 7 Days"
      : period === "30d"
      ? "Last 30 Days"
      : period === "all"
      ? "All Time"
      : "14-Day Trajectory";

  // SVG Chart Dimensions
  const svgWidth = 600;
  const svgHeight = 220;
  const padLeft = 45;
  const padRight = 20;
  const padTop = 25;
  const padBottom = 40;

  const usableWidth = svgWidth - padLeft - padRight;
  const usableHeight = svgHeight - padTop - padBottom;

  // Coordinate mapping for accuracy (0 - 100%)
  const getY = (score: number) => {
    const clamped = Math.max(0, Math.min(100, score));
    return padTop + (1 - clamped / 100) * usableHeight;
  };

  const getX = (index: number, total: number) => {
    if (total <= 1) return padLeft + usableWidth / 2;
    return padLeft + (index / (total - 1)) * usableWidth;
  };

  // Build SVG Path for line & area
  const points = history.map((p, idx) => ({
    ...p,
    x: getX(idx, history.length),
    y: getY(p.averageScore),
  }));

  const linePathD =
    points.length >= 2
      ? points.reduce((acc, pt, i) => `${acc} ${i === 0 ? "M" : "L"} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`, "")
      : "";

  const areaPathD =
    points.length >= 2
      ? `${linePathD} L ${points[points.length - 1].x.toFixed(1)} ${(padTop + usableHeight).toFixed(1)} L ${points[0].x.toFixed(1)} ${(padTop + usableHeight).toFixed(1)} Z`
      : "";

  // Reference guideline scores
  const guidelines = [
    { label: "100%", value: 100 },
    { label: "75%", value: 75 },
    { label: "50%", value: 50 },
  ];

  // Smart label downsampling for X-axis if many points
  const shouldShowLabel = (idx: number, total: number) => {
    if (total <= 7) return true;
    if (total <= 14) return idx % 2 === 0 || idx === total - 1;
    return idx === 0 || idx === Math.floor(total / 2) || idx === total - 1;
  };

  const activePoint = activePointIndex !== null ? points[activePointIndex] : null;

  return (
    <div className="p-5 sm:p-6 bg-surface border-2 border-border rounded-2xl shadow-[0_3px_0_#141827] flex flex-col gap-4">
      {/* ── Trajectory Status & Insight ── */}
      <div className="flex flex-col gap-2 border-b-2 border-border pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <h3 className="text-sm font-black text-text-primary">
              Accuracy Over Time
            </h3>
            <span className="text-[11px] font-bold text-text-secondary">
              {periodLabel}
            </span>
          </div>
          <div>{getDirectionBadge()}</div>
        </div>
        {insight && (
          <p className="text-xs font-bold text-text-secondary leading-relaxed pt-0.5">
            {insight}
          </p>
        )}
      </div>

      {/* ── 1. NO DATA (0 Data Points) ── */}
      {history.length === 0 && (
        <div className="py-10 text-center flex flex-col items-center justify-center gap-2 bg-bg-secondary/50 rounded-xl border-2 border-dashed border-border/40 p-4">
          <div className="w-10 h-10 rounded-full bg-surface border-2 border-border flex items-center justify-center text-text-secondary">
            <Calendar className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-black uppercase text-text-primary tracking-wider">
            No Historical Trend Data
          </h3>
          <p className="text-xs font-bold text-text-secondary max-w-sm">
            Keep practicing to see your progress over time.
          </p>
        </div>
      )}

      {/* ── 2. SINGLE DATA POINT (1 Data Point) ── */}
      {history.length === 1 && (
        <div className="py-6 px-4 bg-bg-secondary rounded-xl border-2 border-border flex flex-col items-center text-center gap-3">
          <div className="flex items-center gap-2 text-xs font-black text-text-secondary uppercase tracking-wider">
            <Calendar className="w-4 h-4 text-text-secondary" />
            <span>Session Date: {formatDateLabel(history[0].date)}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-text-primary">
              {Math.round(history[0].averageScore)}%
            </span>
            <span className="text-xs font-extrabold text-text-secondary">
              accuracy across {history[0].quizzesTaken} quiz{history[0].quizzesTaken > 1 ? "zes" : ""}
            </span>
          </div>
          <p className="text-xs font-bold text-text-secondary max-w-md">
            Recorded 1 study day. Complete quizzes on another day to see your learning trajectory over time.
          </p>
        </div>
      )}

      {/* ── 3. VISUAL CHART (2+ Data Points) ── */}
      {history.length >= 2 && (
        <div className="flex flex-col gap-2 pt-1">
          {/* Active Hover / Focus Callout */}
          <div className="min-h-[28px] flex items-center justify-between text-xs font-bold text-text-secondary px-1">
            {activePoint ? (
              <div className="flex items-center gap-2 text-text-primary bg-bg-secondary px-2.5 py-1 rounded-lg border-2 border-border text-xs shadow-[0_1px_0_#141827]">
                <span className="font-extrabold">{formatDateLabel(activePoint.date)}:</span>
                <span className="font-black text-text-primary bg-primary/40 px-1.5 py-0.5 rounded border border-border text-[11px]">
                  {Math.round(activePoint.averageScore)}% Accuracy
                </span>
                <span className="text-[11px] font-bold text-text-secondary">
                  ({activePoint.quizzesTaken} quiz{activePoint.quizzesTaken > 1 ? "zes" : ""})
                </span>
              </div>
            ) : (
              <span className="text-[11px] font-bold text-text-secondary">
                Tap data points to inspect accuracy
              </span>
            )}
            <span className="text-[10px] font-bold text-text-secondary hidden sm:inline">
              Target: &ge;75% • Passing: &ge;50%
            </span>
          </div>

          {/* SVG Line Chart */}
          <div className="w-full overflow-hidden">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto max-h-[240px] select-none"
              role="img"
              aria-label={`Performance trend chart showing accuracy over time. Direction: ${trendDirection}.`}
            >
              <title>Accuracy Over Time</title>
              <desc>{insight}</desc>

              {/* Benchmark Reference Guidelines */}
              {guidelines.map((g) => {
                const y = getY(g.value);
                return (
                  <g key={g.value}>
                    <line
                      x1={padLeft}
                      y1={y}
                      x2={svgWidth - padRight}
                      y2={y}
                      stroke="#141827"
                      strokeOpacity="0.12"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                    <text
                      x={padLeft - 6}
                      y={y + 3.5}
                      textAnchor="end"
                      className="fill-text-secondary font-black"
                      fontSize="9"
                    >
                      {g.label}
                    </text>
                  </g>
                );
              })}

              {/* Flat Subtle Area Fill (No Gradients) */}
              {areaPathD && (
                <path d={areaPathD} fill="#F8F5EF" />
              )}

              {/* Primary Trend Line */}
              {linePathD && (
                <path
                  d={linePathD}
                  fill="none"
                  stroke="#141827"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Data Points & Interactive Tap Targets */}
              {points.map((p, idx) => {
                const isActive = activePointIndex === idx;
                const isPassing = p.averageScore >= 50;

                return (
                  <g
                    key={p.date}
                    tabIndex={0}
                    role="button"
                    aria-label={`${formatDateLabel(p.date)}: ${Math.round(p.averageScore)}% accuracy, ${p.quizzesTaken} quizzes`}
                    onMouseEnter={() => setActivePointIndex(idx)}
                    onMouseLeave={() => setActivePointIndex(null)}
                    onFocus={() => setActivePointIndex(idx)}
                    onBlur={() => setActivePointIndex(null)}
                    className="cursor-pointer outline-none"
                  >
                    {/* Invisible tap target for mobile touch friendliness */}
                    <circle cx={p.x} cy={p.y} r={14} fill="transparent" />

                    {/* Data Node Circle - Clean and Handcrafted */}
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isActive ? 5.5 : 4}
                      fill={isActive ? "#F6D86B" : isPassing ? "#FFFFFF" : "#F8F5EF"}
                      stroke="#141827"
                      strokeWidth={isActive ? "2.5" : "2"}
                    />

                    {/* Value label directly above point when points are few */}
                    {points.length <= 8 && (
                      <text
                        x={p.x}
                        y={p.y - 8}
                        textAnchor="middle"
                        fontSize="9"
                        className="font-black fill-text-primary"
                      >
                        {Math.round(p.averageScore)}%
                      </text>
                    )}

                    {/* X-Axis Date Label */}
                    {shouldShowLabel(idx, points.length) && (
                      <text
                        x={p.x}
                        y={padTop + usableHeight + 18}
                        textAnchor="middle"
                        fontSize="9.5"
                        className="fill-text-secondary font-bold"
                      >
                        {formatDateLabel(p.date)}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Accessible Screen-Reader Table Alternative */}
          <div className="sr-only">
            <table>
              <caption>Performance Trend Accuracy History</caption>
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">Accuracy</th>
                  <th scope="col">Quizzes Taken</th>
                </tr>
              </thead>
              <tbody>
                {history.map((pt) => (
                  <tr key={pt.date}>
                    <td>{pt.date}</td>
                    <td>{pt.averageScore}%</td>
                    <td>{pt.quizzesTaken}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
