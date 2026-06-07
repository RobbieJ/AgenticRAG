"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Brain, GitCompare, Repeat } from "lucide-react";
import { DEMO_CONFIGS, DEMO_ORDER } from "@/lib/demo-constants";
import { DemoType } from "@/lib/types";
import { BackendStatus } from "./BackendStatus";

const META: Record<DemoType, { icon: typeof Brain; gradient: string }> = {
  "what-is-ai": { icon: Brain, gradient: "from-purple-500 to-violet-600" },
  "rag-comparison": { icon: GitCompare, gradient: "from-sky-500 to-blue-600" },
  "agentic-loop": { icon: Repeat, gradient: "from-emerald-500 to-green-600" },
};

export function DemoSelector() {
  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h2 className="text-4xl font-bold text-gray-900">Choose a demo</h2>
        <p className="mt-3 text-lg text-gray-600">
          Three interactive walkthroughs of RAG and Agentic AI — diagrams animate in
          lockstep with live, executing code.
        </p>
      </motion.div>

      <BackendStatus />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {DEMO_ORDER.map((type, i) => {
          const config = DEMO_CONFIGS[type];
          const { icon: Icon, gradient } = META[type];
          return (
            <motion.div
              key={type}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -6 }}
            >
              <Link href={`/demo/${type}`}>
                <div className="flex h-full cursor-pointer flex-col overflow-hidden rounded-xl bg-white shadow-lg transition hover:shadow-2xl">
                  <div className={`flex min-h-28 items-center justify-center bg-gradient-to-r ${gradient} text-white`}>
                    <Icon size={52} />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-lg font-bold text-gray-900">{config.title}</h3>
                    <p className="mt-2 flex-1 text-sm text-gray-600">{config.description}</p>
                    <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                      <span className="text-xs font-medium text-gray-500">{config.duration}</span>
                      <ArrowRight className="h-5 w-5 text-gray-400" />
                    </div>
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
