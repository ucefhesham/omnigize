"use client";

import React, { useState, useRef, useEffect } from "react";

interface InteractiveChartProps {
  data: number[];
  height?: number;
  color?: string;
  label?: string;
}

export function InteractiveChart({ data, height = 100, color = "#0df2f2", label = "Leads" }: InteractiveChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  // Normalize data for SVG coordinates (0-400 x 0-100)
  const maxValue = Math.max(...data, 10);
  const points = data.map((val, i) => ({
    x: (i / (data.length - 1)) * 400,
    y: 100 - (val / maxValue) * 80 - 10, // Leave padding
  }));

  const pathD = points.reduce((acc, p, i) => {
    if (i === 0) return `M${p.x},${p.y}`;
    // Use quadratic curves for smooth aesthetic
    const prev = points[i - 1];
    const cx = (prev.x + p.x) / 2;
    return `${acc} Q${cx},${prev.y} ${p.x},${p.y}`;
  }, "");

  const areaD = `${pathD} L400,100 L0,100 Z`;

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const svgX = (x / rect.width) * 400;
    
    // Find closest data point
    const closestIndex = Math.round((svgX / 400) * (data.length - 1));
    if (closestIndex >= 0 && closestIndex < data.length) {
      setHoverIndex(closestIndex);
      setTooltipPos({ x, y: e.clientY - rect.top });
    }
  };

  return (
    <div className="relative w-full group/chart" onMouseLeave={() => setHoverIndex(null)}>
      <svg
        ref={svgRef}
        viewBox="0 0 400 100"
        preserveAspectRatio="none"
        className="w-full h-40 overflow-visible cursor-crosshair transition-transform duration-700 group-hover/chart:scale-[1.01]"
        onMouseMove={handleMouseMove}
      >
        <defs>
          <linearGradient id="gradient-interactive" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.15" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Fill Area */}
        <path d={areaD} fill="url(#gradient-interactive)" className="transition-all duration-300" />

        {/* Line Path */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glow)"
          className="animate-draw shrink-0"
          style={{
            strokeDasharray: 1000,
            strokeDashoffset: 0,
          }}
        />

        {/* Hover Indicator */}
        {hoverIndex !== null && (
          <>
            <line
              x1={points[hoverIndex].x}
              y1="0"
              x2={points[hoverIndex].x}
              y2="100"
              stroke={color}
              strokeWidth="1"
              strokeDasharray="4 4"
              className="opacity-30"
            />
            <circle
              cx={points[hoverIndex].x}
              cy={points[hoverIndex].y}
              r="6"
              fill={color}
              className="animate-ping opacity-20"
            />
            <circle
              cx={points[hoverIndex].x}
              cy={points[hoverIndex].y}
              r="3"
              fill={color}
              className="ring-4 ring-white"
            />
          </>
        )}
      </svg>

      {/* Modern Tooltip */}
      {hoverIndex !== null && (
        <div
          className="absolute z-50 pointer-events-none bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase shadow-2xl transition-all duration-200 animate-in fade-in zoom-in-95"
          style={{
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y - 45}px`,
            transform: 'translateX(-50%)',
          }}
        >
          {label}: {data[hoverIndex]}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
        </div>
      )}

      <style jsx>{`
        @keyframes draw {
          from { stroke-dashoffset: 1000; }
          to { stroke-dashoffset: 0; }
        }
        .animate-draw {
          animation: draw 2s cubic-bezier(0.6, 0.05, 0.01, 0.9) forwards;
        }
      `}</style>
    </div>
  );
}
