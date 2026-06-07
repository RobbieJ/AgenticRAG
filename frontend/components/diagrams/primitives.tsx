"use client";

import { motion } from "framer-motion";

export interface NodeProps {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  sub?: string;
  fill?: string;
  highlight: string[];
}

function activity(id: string, highlight: string[]) {
  const active = highlight.includes(id);
  const dimmed = highlight.length > 0 && !active;
  return { active, opacity: dimmed ? 0.35 : 1 };
}

export function FlowBox({
  id,
  x,
  y,
  w,
  h,
  label,
  sub,
  fill = "#ffffff",
  highlight,
  rounded = 10,
}: NodeProps & { rounded?: number }) {
  const { active, opacity } = activity(id, highlight);
  const lines = label.split("\n");
  return (
    <motion.g
      animate={{ opacity }}
      transition={{ duration: 0.3 }}
      style={{ transformOrigin: `${x + w / 2}px ${y + h / 2}px` }}
    >
      <motion.rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={rounded}
        fill={active ? "#fff7ed" : fill}
        stroke={active ? "#ea580c" : "#1e293b"}
        animate={{ strokeWidth: active ? 3.5 : 1.5 }}
        transition={{ duration: 0.25 }}
        style={active ? { filter: "drop-shadow(0 0 10px rgba(234,88,12,0.45))" } : undefined}
      />
      <text
        x={x + w / 2}
        y={y + h / 2 - (sub ? 6 : 0) - (lines.length - 1) * 8}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={14}
        fontWeight={600}
        fill="#0f172a"
      >
        {lines.map((ln, i) => (
          <tspan key={i} x={x + w / 2} dy={i === 0 ? 0 : 16}>
            {ln}
          </tspan>
        ))}
      </text>
      {sub && (
        <text
          x={x + w / 2}
          y={y + h / 2 + 14}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={11}
          fill="#475569"
        >
          {sub}
        </text>
      )}
    </motion.g>
  );
}

export function FlowDiamond({ id, x, y, w, h, label, fill = "#fef9c3", highlight }: NodeProps) {
  const { active, opacity } = activity(id, highlight);
  const cx = x + w / 2;
  const cy = y + h / 2;
  const pts = `${cx},${y} ${x + w},${cy} ${cx},${y + h} ${x},${cy}`;
  const lines = label.split("\n");
  return (
    <motion.g animate={{ opacity }} transition={{ duration: 0.3 }}>
      <motion.polygon
        points={pts}
        fill={active ? "#fde68a" : fill}
        stroke={active ? "#ea580c" : "#1e293b"}
        animate={{ strokeWidth: active ? 3.5 : 1.5 }}
        style={active ? { filter: "drop-shadow(0 0 10px rgba(234,88,12,0.45))" } : undefined}
      />
      <text x={cx} y={cy - (lines.length - 1) * 8} textAnchor="middle" dominantBaseline="middle" fontSize={12} fontWeight={600} fill="#0f172a">
        {lines.map((ln, i) => (
          <tspan key={i} x={cx} dy={i === 0 ? 0 : 15}>
            {ln}
          </tspan>
        ))}
      </text>
    </motion.g>
  );
}

export function Arrow({
  x1,
  y1,
  x2,
  y2,
  color = "#6741d9",
  label,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color?: string;
  label?: string;
}) {
  const midx = (x1 + x2) / 2;
  const midy = (y1 + y2) / 2;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={2} markerEnd="url(#arrowhead)" />
      {label && (
        <text x={midx + 8} y={midy - 4} fontSize={11} fill={color} fontWeight={600}>
          {label}
        </text>
      )}
    </g>
  );
}

export function ArrowDefs() {
  return (
    <defs>
      <marker id="arrowhead" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">
        <polygon points="0 0, 8 3, 0 6" fill="#6741d9" />
      </marker>
    </defs>
  );
}

export function DiagramFrame({
  viewBox,
  children,
}: {
  viewBox: string;
  children: React.ReactNode;
}) {
  return (
    <svg viewBox={viewBox} className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
      <ArrowDefs />
      {children}
    </svg>
  );
}
