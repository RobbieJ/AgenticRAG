"use client";

import { DiagramViewerProps } from "@/lib/types";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function DiagramViewer({
  diagramType,
  highlightedElements = [],
  isAnimating = false,
}: DiagramViewerProps) {
  const [diagramContent, setDiagramContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDiagram = async () => {
      try {
        const fileMap: Record<string, string> = {
          "what-is-ai": "/diagrams/what-is-agentic-ai.json",
          "rag-comparison": "/diagrams/rag-comparison.json",
          "agentic-loop": "/diagrams/agentic-rag-loop.json",
        };

        const response = await fetch(fileMap[diagramType] || "/diagrams/what-is-agentic-ai.json");
        const data = await response.json();
        setDiagramContent(data);
      } catch (error) {
        console.error("Failed to load diagram:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDiagram();
  }, [diagramType]);

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-96 bg-gray-100 rounded-lg">
        <p className="text-gray-600">Loading diagram...</p>
      </div>
    );
  }

  if (!diagramContent) {
    return (
      <div className="flex items-center justify-center w-full h-96 bg-gray-100 rounded-lg">
        <p className="text-gray-600">Failed to load diagram</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full bg-white rounded-lg border-2 border-gray-200 overflow-auto"
      style={{ minHeight: "400px", maxHeight: "600px" }}
    >
      {/* Render Excalidraw diagram using SVG */}
      <svg
        viewBox="0 0 1400 950"
        className="w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Text title */}
        {diagramContent.elements
          ?.filter((el: any) => el.type === "text" && el.fontSize && el.fontSize > 30)
          .map((el: any) => (
            <text
              key={el.id}
              x={el.x || 0}
              y={(el.y || 0) + 30}
              fontSize={el.fontSize || 20}
              textAnchor="start"
              fill={el.strokeColor || "#000"}
            >
              {el.text}
            </text>
          ))}

        {/* Rectangles (boxes) */}
        {diagramContent.elements
          ?.filter((el: any) => el.type === "rectangle")
          .map((el: any) => {
            const isHighlighted = highlightedElements.includes(el.id);
            return (
              <motion.g
                key={el.id}
                animate={{
                  opacity: highlightedElements.length === 0 || isHighlighted ? 1 : 0.3,
                }}
                transition={{ duration: 0.3 }}
              >
                <rect
                  x={el.x || 0}
                  y={el.y || 0}
                  width={el.width || 100}
                  height={el.height || 100}
                  fill={isHighlighted ? "#ffeb3b" : el.backgroundColor || "#fff"}
                  stroke={el.strokeColor || "#000"}
                  strokeWidth={isHighlighted ? 3 : el.strokeWidth || 2}
                  rx={el.roundness?.type === 3 ? 8 : 0}
                />
                <text
                  x={(el.x || 0) + (el.width || 100) / 2}
                  y={(el.y || 0) + (el.height || 100) / 2 + 5}
                  textAnchor="middle"
                  fontSize="14"
                  fontWeight="bold"
                  fill="#000"
                >
                  {el.text}
                </text>
              </motion.g>
            );
          })}

        {/* Diamonds */}
        {diagramContent.elements
          ?.filter((el: any) => el.type === "diamond")
          .map((el: any) => {
            const isHighlighted = highlightedElements.includes(el.id);
            const cx = (el.x || 0) + (el.width || 100) / 2;
            const cy = (el.y || 0) + (el.height || 100) / 2;
            const w = (el.width || 100) / 2;
            const h = (el.height || 100) / 2;

            return (
              <motion.g
                key={el.id}
                animate={{
                  opacity: highlightedElements.length === 0 || isHighlighted ? 1 : 0.3,
                }}
                transition={{ duration: 0.3 }}
              >
                <polygon
                  points={`${cx},${cy - h} ${cx + w},${cy} ${cx},${cy + h} ${cx - w},${cy}`}
                  fill={isHighlighted ? "#ffeb3b" : el.backgroundColor || "#fff"}
                  stroke={el.strokeColor || "#000"}
                  strokeWidth={isHighlighted ? 3 : el.strokeWidth || 2}
                />
                <text
                  x={cx}
                  y={cy + 5}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="bold"
                  fill="#000"
                >
                  {el.text}
                </text>
              </motion.g>
            );
          })}

        {/* Arrows */}
        {diagramContent.elements
          ?.filter((el: any) => el.type === "arrow")
          .map((el: any) => {
            const x1 = el.x || 0;
            const y1 = el.y || 0;
            const x2 = x1 + (el.width || 0);
            const y2 = y1 + (el.height || 0);

            return (
              <motion.line
                key={el.id}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={el.strokeColor || "#666"}
                strokeWidth={el.strokeWidth || 2}
                markerEnd="url(#arrowhead)"
                animate={{
                  opacity: highlightedElements.length === 0 ? 1 : 0.5,
                }}
                transition={{ duration: 0.3 }}
              />
            );
          })}

        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#666" />
          </marker>
        </defs>
      </svg>

      {/* Loading overlay during animation */}
      {isAnimating && (
        <div className="absolute inset-0 bg-blue-100 opacity-10 pointer-events-none" />
      )}
    </motion.div>
  );
}
