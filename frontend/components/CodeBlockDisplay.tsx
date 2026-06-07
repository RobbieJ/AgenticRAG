"use client";

import { CodeBlockDisplayProps } from "@/lib/types";
import { motion } from "framer-motion";

export function CodeBlockDisplay({
  code,
  language = "python",
  title,
}: CodeBlockDisplayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-lg bg-slate-900 p-4 text-white overflow-x-auto"
    >
      {title && <div className="text-sm font-semibold text-slate-300 mb-2">{title}</div>}
      <pre className="text-sm">
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </motion.div>
  );
}
