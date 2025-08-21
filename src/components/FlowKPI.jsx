import React, { useEffect, useMemo, useState } from "react";

/** ---------- Industry-standard power flow data ---------- */
const makeEdges = () => {
  const pvGeneration = 180 + Math.random() * 120;  // 180–300 kW
  const gensetOutput  = 60 + Math.random() * 90;   // 60–150 kW
  const loadDemand    = 280 + Math.random() * 160; // 280–440 kW

  const pvToLoad = Math.min(pvGeneration, loadDemand);
  const remainingLoadAfterPV = Math.max(0, loadDemand - pvToLoad);
  const gensetToLoad = Math.min(gensetOutput, remainingLoadAfterPV);
  const remainingLoadAfterGenset = Math.max(0, remainingLoadAfterPV - gensetToLoad);
  const surplusPV = Math.max(0, pvGeneration - pvToLoad);

  const flows = [
    { from: "PV",     to: "LOAD", kW: pvToLoad },
    { from: "GENSET", to: "LOAD", kW: gensetToLoad },
  ];
  if (remainingLoadAfterGenset > 0) flows.push({ from: "GRID", to: "LOAD", kW: remainingLoadAfterGenset });
  else if (surplusPV > 0)           flows.push({ from: "PV",   to: "GRID", kW: surplusPV });

  return flows;
};

const makeNodes = () => {
  const pvGen    = 180 + Math.random() * 120;
  const gensetGen= 60 + Math.random() * 90;
  const loadDem  = 280 + Math.random() * 160;

  const pvToLoad = Math.min(pvGen, loadDem);
  const remainingAfterPV = Math.max(0, loadDem - pvToLoad);
  const gensetToLoad = Math.min(gensetGen, remainingAfterPV);
  const remainingAfterGenset = Math.max(0, remainingAfterPV - gensetToLoad);
  const surplusPV = Math.max(0, pvGen - pvToLoad);

  let gridStatus = "Balanced";
  let gridValue  = 0;
  if (remainingAfterGenset > 0) { gridStatus = "Import"; gridValue = remainingAfterGenset; }
  else if (surplusPV > 0)       { gridStatus = "Export"; gridValue = surplusPV; }

  return {
    PV:     { kW: pvGen },
    GENSET: { kW: gensetGen },
    LOAD:   { kW: loadDem },
    GRID:   { kW: gridValue, status: gridStatus },
  };
};

/** ---------- Layout ---------- */
const POS = {
  GENSET: { x: 60,  y: 60 },
  LOAD:   { x: 520, y: 60 },
  PV:     { x: 60,  y: 360 },
  GRID:   { x: 520, y: 360 },
};
const SIZE   = { w: 140, h: 100 };
const CENTER = { x: 340, y: 260 };

// Junction right in front of LOAD (tweak as you like)
const LOAD_CENTER = { x: POS.LOAD.x + SIZE.w / 2, y: POS.LOAD.y + SIZE.h / 2 };
const JUNCTION    = { x: POS.LOAD.x - 30, y: LOAD_CENTER.y };

/** ---------- Helpers ---------- */
const fmt = (v) => `${Math.round(v)} kW`;

function centerOf(name) {
  return {
    x: POS[name].x + SIZE.w / 2,
    y: POS[name].y + SIZE.h / 2,
  };
}

// Curved path FROM a source center TO the junction, with slight offset so curves don’t overlap
function pathToJunction(from, offsetY = 0) {
  const s = centerOf(from);
  const cx = CENTER.x;
  const cy = CENTER.y + offsetY; // fan the curves a bit
  const jx = JUNCTION.x;
  const jy = JUNCTION.y;
  return `M ${s.x} ${s.y} Q ${cx} ${cy} ${jx} ${jy}`;
}

// Short straight path from junction INTO the middle of LOAD
function pathJunctionToLoad() {
  return `M ${JUNCTION.x} ${JUNCTION.y} L ${LOAD_CENTER.x} ${LOAD_CENTER.y}`;
}

// Curved path between two nodes (for PV -> GRID export)
function curvedPath(from, to) {
  const s = centerOf(from);
  const t = centerOf(to);
  return `M ${s.x} ${s.y} Q ${CENTER.x} ${CENTER.y} ${t.x} ${t.y}`;
}

function ArrowStream({ d, kW }) {
  const thickness = Math.max(3, Math.min(kW / 60, 8));
  const speed = 8; // slower (higher = slower path travel)
  
  return (
    <g>
      {/* Base line */}
      <path
        d={d}
        fill="none"
        stroke="#60a5fa" // light blue base
        strokeWidth={thickness}
        strokeLinecap="round"
        opacity="0.25"
      />

      {/* Glow trail (blurred stroke behind arrow) */}
      <path
        d={d}
        fill="none"
        stroke="#3b82f6" // darker blue
        strokeWidth={thickness + 2}
        strokeLinecap="round"
        opacity="0.15"
        style={{
          filter: "url(#glow)"
        }}
      />

      {/* Single arrow head */}
      <polygon
        points="-14,-8 0,0 -14,8"
        fill="#3b82f6"
        stroke="#fff"
        strokeWidth="1"
      >
        <animateMotion
          dur={`${speed}s`}
          repeatCount="indefinite"
          rotate="auto"
          path={d}
        />
      </polygon>

      {/* Slight trailing ghost arrow for animation effect */}
      <polygon
        points="-14,-8 0,0 -14,8"
        fill="#60a5fa"
        opacity="0.4"
      >
        <animateMotion
          dur={`${speed}s`}
          begin="1s"
          repeatCount="indefinite"
          rotate="auto"
          path={d}
        />
      </polygon>
    </g>
  );
}


/** ---------- Label badge ---------- */
function NodeDetails({ name, node }) {
  const cx = POS[name].x + SIZE.w / 2;
  const topY = POS[name].y - 80; // lift above the image
  const mainKW = `${Math.round(node.kW)} kW`;

  // Example extra values (dummy for now, replace with real data)
  const extras = [];
  if (name === "LOAD") {
    extras.push({ label: "Today's Energy", value: `${(node.kW * 4).toFixed(0)} kWh` });
    extras.push({ label: "Reactive Power", value: `${(node.kW / 5).toFixed(1)} kVAr` });
  }
  if (name === "GRID") {
    extras.push({ label: "Status", value: node.status });
    extras.push({ label: "Exchange", value: `${node.kW.toFixed(1)} kW` });
  }
  if (name === "GENSET") {
    extras.push({ label: "Fuel Used", value: `${(node.kW / 10).toFixed(1)} L` });
    extras.push({ label: "Runtime", value: `${(node.kW / 15).toFixed(1)} h` });
  }
  if (name === "PV") {
    extras.push({ label: "Real Power", value: `${node.kW.toFixed(1)} kW` });
    extras.push({ label: "Irradiance", value: `${(node.kW / 3).toFixed(1)} W/m²` });
  }

  return (
    <g>
      {/* Vertical line marker */}
      <line
        x1={cx}
        y1={topY + 10}
        x2={cx}
        y2={POS[name].y - 10}
        stroke="#d1d5db"
        strokeWidth="2"
      />

      {/* Main KW value (big, centered on top) */}
      <text
        x={cx}
        y={topY}
        textAnchor="middle"
        fontFamily="Inter, sans-serif"
        fontSize="18"
        fontWeight="700"
        fill="#111827"
      >
        {mainKW}
      </text>

      {/* Extra values, aligned left/right */}
      {extras.map((e, i) => (
        <g key={i}>
          {/* Value (left side, bold) */}
          <text
            x={cx - 5} // shift left
            y={topY + 20 + i * 16}
            textAnchor="end"
            fontFamily="Inter, sans-serif"
            fontSize="12"
            fontWeight="600"
            fill="#111827"
          >
            {e.value}
          </text>

          {/* Label (right side, lighter color) */}
          <text
            x={cx + 5} // shift right
            y={topY + 20 + i * 16}
            textAnchor="start"
            fontFamily="Inter, sans-serif"
            fontSize="12"
            fill="#6b7280"
          >
            {e.label}
          </text>
        </g>
      ))}
    </g>
  );
}



/** ---------- Component ---------- */
export default function FlowKPI() {
  const [edges, setEdges] = useState(makeEdges());
  const [nodes, setNodes] = useState(makeNodes());

  useEffect(() => {
    const t = setInterval(() => {
      setEdges(makeEdges());
      setNodes(makeNodes());
    }, 2000);
    return () => clearInterval(t);
  }, []);

  // Split edges by destination
  const toLoadEdges = useMemo(() => edges.filter(e => e.to === "LOAD" && e.kW > 5), [edges]);
  const otherEdges  = useMemo(() => edges.filter(e => !(e.to === "LOAD") && e.kW > 5), [edges]);

  // Smooth fan offsets for curves into the junction (top -> 0, next -> ±12, etc.)
  const fanOffsets = useMemo(() => {
    const n = toLoadEdges.length;
    const step = 16;
    const start = -((n - 1) * step) / 2;
    return Array.from({ length: n }, (_, i) => start + i * step);
  }, [toLoadEdges.length]);

  // Total kW going into LOAD = thickness of the single final arrow
  const totalIntoLoad = useMemo(
    () => toLoadEdges.reduce((sum, e) => sum + e.kW, 0),
    [toLoadEdges]
  );

  // Paths
  const intoJunctionPaths = useMemo(
    () => toLoadEdges.map((e, i) => ({ id: `${e.from}-to-j`, d: pathToJunction(e.from, fanOffsets[i]), kW: e.kW })),
    [toLoadEdges, fanOffsets]
  );

  const finalIntoLoadPath = useMemo(
    () => ({ id: "junction-to-load", d: pathJunctionToLoad(), kW: totalIntoLoad }),
    [totalIntoLoad]
  );

  const otherPaths = useMemo(() => {
    // currently only PV->GRID case
    return otherEdges.map(e => ({
      id: `${e.from}-${e.to}`,
      d: curvedPath(e.from, e.to),
      kW: e.kW
    }));
  }, [otherEdges]);

  return (
    <div className="h-full flex flex-col rounded-2xl shadow-xl border border-green-200/40 p-1 overflow-hidden" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 10px 25px -5px rgba(25, 140, 26, 0.15), 0 0 0 1px rgba(25, 140, 26, 0.05)" }}>
      {/* Header */}
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold bg-gradient-to-r from-[#198c1a] via-[#10b981] to-[#0097b2] bg-clip-text text-transparent">
              Power Flow Visualization
            </h3>
            <div className="h-0.5 w-20 bg-gradient-to-r from-[#198c1a] to-[#0097b2] rounded-full mt-1" />
          </div>
        </div>
      </div>

      {/* SVG */}
      {/* SVG */}
<div className="flex-grow flex items-center justify-center overflow-hidden min-h-0" style={{ backgroundColor: "#FFFFFF" }}>
  <svg
    viewBox="0 0 720 650"   // increased height from 560 → 600 (adds padding at bottom & top)
    className="w-full h-full max-h-full"
    width="100%" height="100%"
    style={{ display: "block", backgroundColor: "#FFFFFF" }}
  >
    {/* Translate everything down by 30px */}
    <g transform="translate(0,80)">
      {/* Grid (optional) */}
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="0.5" opacity="0.12" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="720" height="560" fill="url(#grid)" />

      {/* --- rest of your flows, badges, and icons go here --- */}
      {otherPaths.map(p => (
        <ArrowStream key={p.id} d={p.d} kW={p.kW} />
      ))}
      {intoJunctionPaths.map(p => (
        <ArrowStream key={p.id} d={p.d} kW={p.kW} />
      ))}
      <ArrowStream d={finalIntoLoadPath.d} kW={finalIntoLoadPath.kW} />

      <NodeDetails name="PV" node={nodes.PV} />
      <NodeDetails name="GRID" node={nodes.GRID} />
      <NodeDetails name="GENSET" node={nodes.GENSET} />
      <NodeDetails name="LOAD" node={nodes.LOAD} />


      <image
        href="/kpi-images/updated/genset.png"
        x={POS.GENSET.x - 40}
        y={POS.GENSET.y - 40}
        width={SIZE.w + 80}
        height={SIZE.h + 80}
        preserveAspectRatio="xMidYMid meet"
        filter="url(#imageGlow)"
      />
      <image
        href="/kpi-images/updated/load.png"
          x={418}
          y={-20}
        width={SIZE.w + 35}
        height={SIZE.h + 80}
        preserveAspectRatio="xMidYMid meet"
        filter="url(#imageGlow)"
      />
      <image
        href="/kpi-images/updated/solar.png"
        x={POS.PV.x - 40}
        y={POS.PV.y - 40}
        width={SIZE.w + 80}
        height={SIZE.h + 80}
        preserveAspectRatio="xMidYMid meet"
        filter="url(#imageGlow)"
      />
      <image
        href="/kpi-images/updated/grid.png"
        x={POS.GRID.x - 40}
        y={POS.GRID.y - 40}
        width={SIZE.w + 80}
        height={SIZE.h + 80}
        preserveAspectRatio="xMidYMid meet"
        filter="url(#imageGlow)"
      />
    </g>
  </svg>
</div>

    </div>
  );
}
