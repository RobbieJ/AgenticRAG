"use client";

import { Arrow, DiagramFrame, FlowBox, FlowDiamond } from "./primitives";

export function RagComparison({ highlight }: { highlight: string[] }) {
  return (
    <DiagramFrame viewBox="0 0 860 700">
      <line x1={430} y1={30} x2={430} y2={680} stroke="#cbd5e1" strokeWidth={2} strokeDasharray="6 6" />
      <text x={215} y={40} textAnchor="middle" fontSize={20} fontWeight={700} fill="#1e293b">CLASSIC RAG</text>
      <text x={645} y={40} textAnchor="middle" fontSize={20} fontWeight={700} fill="#6741d9">AGENTIC RAG</text>

      {/* Classic column */}
      <FlowBox id="c_query" x={85} y={70} w={260} h={46} label="User query" fill="#a5d8ff" highlight={highlight} />
      <FlowBox id="c_embed" x={85} y={150} w={260} h={46} label="Embed query → vector" fill="#e9ecef" highlight={highlight} />
      <FlowBox id="c_search" x={85} y={230} w={260} h={46} label="Vector search (runs ONCE)" fill="#e9ecef" highlight={highlight} />
      <FlowBox id="c_chunks" x={85} y={310} w={260} h={46} label="Top-k chunks returned" fill="#e9ecef" highlight={highlight} />
      <FlowBox id="c_generate" x={85} y={390} w={260} h={46} label="LLM generates answer" fill="#a5d8ff" highlight={highlight} />
      <FlowBox id="c_answer" x={85} y={470} w={260} h={46} label="Answer" fill="#b2f2bb" highlight={highlight} />
      <g>
        <Arrow x1={215} y1={116} x2={215} y2={150} color="#1971c2" />
        <Arrow x1={215} y1={196} x2={215} y2={230} color="#1971c2" />
        <Arrow x1={215} y1={276} x2={215} y2={310} color="#1971c2" />
        <Arrow x1={215} y1={356} x2={215} y2={390} color="#1971c2" />
        <Arrow x1={215} y1={436} x2={215} y2={470} color="#1971c2" />
      </g>
      <text x={215} y={560} textAnchor="middle" fontSize={11} fill="#e03131">Retrieves once — no retry if it misses.</text>

      {/* Agentic column */}
      <FlowBox id="a_query" x={500} y={70} w={280} h={46} label="User query" fill="#ffffff" highlight={highlight} />
      <FlowBox id="a_plan" x={500} y={150} w={280} h={46} label="AGENT plans the approach" fill="#d0bfff" highlight={highlight} />
      <FlowBox id="a_retrieve" x={500} y={230} w={280} h={46} label="Retrieve" fill="#e9ecef" highlight={highlight} />
      <FlowDiamond id="a_decision" x={555} y={300} w={170} h={90} label={"Enough\nevidence?"} highlight={highlight} />
      <FlowBox id="a_generate" x={500} y={410} w={280} h={46} label="Synthesise + verify" fill="#96f2d7" highlight={highlight} />
      <FlowBox id="a_answer" x={500} y={490} w={280} h={46} label="Answer + citations" fill="#b2f2bb" highlight={highlight} />
      <FlowBox id="a_tools" x={500} y={570} w={280} h={50} label="Tools: vector · web · SQL · APIs" fill="#ffd8a8" highlight={highlight} />

      <g>
        <Arrow x1={640} y1={116} x2={640} y2={150} />
        <Arrow x1={640} y1={196} x2={640} y2={230} />
        <Arrow x1={640} y1={276} x2={640} y2={300} />
        <Arrow x1={640} y1={390} x2={640} y2={410} label="yes" />
        <Arrow x1={640} y1={456} x2={640} y2={490} />
      </g>
      {/* decision no -> loop back to plan */}
      <path d="M 725 345 L 815 345 L 815 173 L 780 173" fill="none" stroke="#e03131" strokeWidth={2} markerEnd="url(#arrowhead)" />
      <text x={822} y={300} fontSize={11} fill="#e03131">no ↑ refine</text>
    </DiagramFrame>
  );
}
