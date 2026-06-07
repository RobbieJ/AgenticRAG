"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Brain, Zap, BarChart3 } from "lucide-react";

const demos = [
  {
    id: "what-is-ai",
    title: "What is Agentic AI?",
    description:
      "Understand the key components of agentic AI systems and how the PLAN→ACT→OBSERVE→REFLECT loop works.",
    icon: Brain,
    color: "from-purple-500 to-purple-600",
    duration: "~2-3 minutes",
  },
  {
    id: "rag-comparison",
    title: "Classic RAG vs Agentic RAG",
    description:
      "See the differences between traditional RAG and agentic RAG side-by-side. Understand why agentic RAG is more powerful.",
    icon: BarChart3,
    color: "from-blue-500 to-blue-600",
    duration: "~1-2 minutes",
  },
  {
    id: "agentic-loop",
    title: "Agentic RAG Reasoning Loop",
    description:
      "Watch the agentic RAG system execute in real-time. Enter a query and see it plan, retrieve, evaluate, generate, and refine.",
    icon: Zap,
    color: "from-green-500 to-green-600",
    duration: "Variable",
  },
];

export function DemoSelector() {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Choose a Demo</h2>
        <p className="text-xl text-gray-600">
          Explore interactive demonstrations of RAG and Agentic AI concepts
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {demos.map((demo, index) => {
          const Icon = demo.icon;
          return (
            <motion.div
              key={demo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
            >
              <Link href={`/demo/${demo.id}`}>
                <div className="h-full rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow cursor-pointer bg-white">
                  <div
                    className={`bg-gradient-to-r ${demo.color} p-8 text-white flex items-center justify-center min-h-32`}
                  >
                    <Icon size={56} />
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{demo.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{demo.description}</p>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <span className="text-xs text-gray-500 font-semibold">
                        ⏱️ {demo.duration}
                      </span>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="bg-blue-50 rounded-xl p-8 border-2 border-blue-200"
      >
        <h3 className="font-bold text-blue-900 mb-3">💡 About These Demos</h3>
        <p className="text-blue-800 text-sm leading-relaxed">
          These interactive demonstrations show how Agentic AI systems work in practice.
          Watch real-time execution with visual flow diagrams and code blocks. Perfect for
          presentations and understanding the concepts behind modern AI systems.
        </p>
      </motion.div>
    </div>
  );
}
