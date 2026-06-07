"use client";

import { Arrow, DiagramFrame, FlowBox, FlowDiamond } from "./primitives";

export function AgenticLoop({ highlight }: { highlight: string[] }) {
  return (
    <DiagramFrame viewBox="0 0 820 720">
      {/* main column */}
      <FlowBox id="query" x={290} y={30} w={260} h={48} label="User query" fill="#ffffff" highlight={highlight} />
      <FlowBox id="plan" x={290} y={110} w={260} h={56} label={"PLAN\ndecompose the question"} fill="#d0bfff" highlight={highlight} />
      <FlowBox id="retrieve" x={290} y={200} w={260} h={56} label={"RETRIEVE\nquery a source"} fill="#a5d8ff" highlight={highlight} />
      <FlowDiamond id="evaluate" x={285} y={290} w={270} h={130} label={"EVALUATE\nrelevant & enough\nevidence?"} highlight={highlight} />
      <FlowBox id="generate" x={290} y={460} w={260} h={56} label={"GENERATE\nsynthesise answer"} fill="#d0bfff" highlight={highlight} />
      <FlowBox id="verify" x={290} y={550} w={260} h={46} label="Verify against evidence" fill="#96f2d7" highlight={highlight} />
      <FlowBox id="answer" x={290} y={624} w={260} h={56} label="Answer + citations" fill="#b2f2bb" highlight={highlight} />

      {/* refine (loop back) */}
      <FlowBox id="refine" x={40} y={320} w={210} h={90} label={"REFINE\nrewrite query · change\nsource · decompose more"} fill="#ffc9c9" highlight={highlight} />

      {/* side panels */}
      <FlowBox id="tools" x={610} y={190} w={190} h={110} label={"Tools\nvector · web\nSQL · APIs"} fill="#ffd8a8" highlight={highlight} />
      <FlowBox id="memory" x={610} y={350} w={190} h={90} label={"Memory\ntracks steps tried"} fill="#e9ecef" highlight={highlight} />

      {/* arrows */}
      <g>
        <Arrow x1={420} y1={78} x2={420} y2={110} />
        <Arrow x1={420} y1={166} x2={420} y2={200} />
        <Arrow x1={420} y1={256} x2={420} y2={290} />
        <Arrow x1={420} y1={420} x2={420} y2={460} color="#2f9e44" label="yes" />
        <Arrow x1={420} y1={516} x2={420} y2={550} color="#2f9e44" />
        <Arrow x1={420} y1={596} x2={420} y2={624} color="#2f9e44" />
      </g>
      {/* evaluate no -> refine -> plan */}
      <path d="M 285 355 L 250 365" fill="none" stroke="#e03131" strokeWidth={2} markerEnd="url(#arrowhead)" />
      <text x={255} y={345} fontSize={11} fill="#e03131">no</text>
      <path d="M 145 320 L 145 138 L 290 138" fill="none" stroke="#e03131" strokeWidth={2} markerEnd="url(#arrowhead)" />
      <text x={150} y={250} fontSize={11} fill="#e03131">loop back</text>
    </DiagramFrame>
  );
}
