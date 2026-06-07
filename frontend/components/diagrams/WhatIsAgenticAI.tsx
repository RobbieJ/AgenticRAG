"use client";

import { DiagramFrame, FlowBox } from "./primitives";

export function WhatIsAgenticAI({ highlight }: { highlight: string[] }) {
  return (
    <DiagramFrame viewBox="0 0 760 580">
      {/* dashed links from the agent to each capability */}
      <g stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="5 5">
        <line x1={300} y1={235} x2={150} y2={95} />
        <line x1={460} y1={235} x2={610} y2={95} />
        <line x1={300} y1={290} x2={150} y2={335} />
        <line x1={460} y1={290} x2={610} y2={335} />
      </g>

      <FlowBox id="planning" x={60} y={60} w={180} h={70} label="Planning" sub="decompose the goal" fill="#a5d8ff" highlight={highlight} />
      <FlowBox id="tooluse" x={520} y={60} w={180} h={70} label="Tool Use" sub="APIs · search · code" fill="#b2f2bb" highlight={highlight} />
      <FlowBox id="memory" x={60} y={300} w={180} h={70} label="Memory" sub="remembers past steps" fill="#ffec99" highlight={highlight} />
      <FlowBox id="reflection" x={520} y={300} w={180} h={70} label="Reflection" sub="critiques & retries" fill="#ffc9c9" highlight={highlight} />

      <FlowBox id="agent" x={290} y={190} w={180} h={110} label={"LLM AGENT\n(the reasoner)"} fill="#d0bfff" highlight={highlight} />

      {/* autonomy / the agentic loop */}
      <FlowBox id="autonomy" x={40} y={430} w={680} h={120} label="" fill="#f8fafc" highlight={highlight} rounded={14} />
      <text x={400} y={452} textAnchor="middle" fontSize={13} fontWeight={700} fill="#6741d9">
        Autonomy — the agentic loop (repeat until confident)
      </text>

      <FlowBox id="plan" x={70} y={470} w={120} h={50} label="PLAN" fill="#e9ecef" highlight={highlight} />
      <FlowBox id="act" x={240} y={470} w={120} h={50} label="ACT" fill="#e9ecef" highlight={highlight} />
      <FlowBox id="observe" x={410} y={470} w={120} h={50} label="OBSERVE" fill="#e9ecef" highlight={highlight} />
      <FlowBox id="reflect" x={580} y={470} w={120} h={50} label="REFLECT" fill="#e9ecef" highlight={highlight} />

      <g stroke="#6741d9" strokeWidth={2} markerEnd="url(#arrowhead)">
        <line x1={190} y1={495} x2={235} y2={495} />
        <line x1={360} y1={495} x2={405} y2={495} />
        <line x1={530} y1={495} x2={575} y2={495} />
      </g>
      {/* loop back reflect -> plan */}
      <path d="M 640 520 L 640 540 L 130 540 L 130 520" fill="none" stroke="#6741d9" strokeWidth={2} markerEnd="url(#arrowhead)" />
    </DiagramFrame>
  );
}
