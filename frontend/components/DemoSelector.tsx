"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Brain, GitCompare, Repeat } from "lucide-react";
import { DEMO_CONFIGS, DEMO_ORDER } from "@/lib/demo-constants";
import { DemoType } from "@/lib/types";
import { BackendStatus } from "./BackendStatus";

const META: Record<DemoType, { icon: typeof Brain; tile: string }> = {
  "what-is-ai": { icon: Brain, tile: "from-ink to-black" },
  "rag-comparison": { icon: GitCompare, tile: "from-brand-light to-brand" },
  "agentic-loop": { icon: Repeat, tile: "from-brand to-brand-deep" },
};

export function DemoSelector() {
  return (
    <div className="space-y-10">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-3xl text-center"
      >
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-black/5 bg-white/70 px-3 py-1 text-xs font-medium text-ink-muted shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" />
          Red Hat · Agentic AI
        </div>
        <h1 className="font-display text-5xl font-extrabold tracking-tight text-ink">
          Agentic RAG, made visible.
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-muted">
          Three interactive walkthroughs of RAG and Agentic AI — the flow diagrams
          animate in lockstep with live, executing code.
        </p>
      </motion.div>

      <BackendStatus />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {DEMO_ORDER.map((type, i) => {
          const config = DEMO_CONFIGS[type];
          const { icon: Icon, tile } = META[type];
          return (
            <motion.div
              key={type}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, ease: "easeOut" }}
              whileHover={{ y: -6 }}
            >
              <Link href={`/demo/${type}`}>
                <div className="group flex h-full cursor-pointer flex-col rounded-3xl bg-white p-6 shadow-card ring-1 ring-black/5 transition-shadow hover:shadow-lift">
                  <div
                    className={`mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${tile} text-white shadow-sm`}
                  >
                    <Icon size={26} strokeWidth={2} />
                  </div>
                  <h3 className="font-display text-xl font-bold tracking-tight text-ink">
                    {config.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">
                    {config.description}
                  </p>
                  <div className="mt-6 flex items-center justify-between border-t border-black/5 pt-4">
                    <span className="text-xs font-medium text-ink-muted">{config.duration}</span>
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-canvas text-ink transition group-hover:bg-brand group-hover:text-white">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
