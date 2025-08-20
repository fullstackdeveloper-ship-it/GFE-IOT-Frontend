import React, { useEffect, useMemo, useState } from "react";

/** ---------- Industry-standard power flow data ---------- */
const makeEdges = () => {
  // Realistic power generation and consumption
  const pvGeneration = 180 + Math.random() * 120;  // PV output (180-300kW)
  const gensetOutput = 60 + Math.random() * 90;    // Genset output (60-150kW)
  const loadDemand = 280 + Math.random() * 160;    // Load demand (280-440kW)
  
  // Calculate power flows based on industry logic
  const pvToLoad = Math.min(pvGeneration, loadDemand);
  const remainingLoadAfterPV = Math.max(0, loadDemand - pvToLoad);
  const gensetToLoad = Math.min(gensetOutput, remainingLoadAfterPV);
  const remainingLoadAfterGenset = Math.max(0, remainingLoadAfterPV - gensetToLoad);
  const surplusPV = Math.max(0, pvGeneration - pvToLoad);
  
  const flows = [
    { from: "PV", to: "LOAD", kW: pvToLoad },
    { from: "GENSET", to: "LOAD", kW: gensetToLoad }
  ];
  
  // Grid flow logic: import shortage or export surplus
  if (remainingLoadAfterGenset > 0) {
    // Need to import from grid
    flows.push({ from: "GRID", to: "LOAD", kW: remainingLoadAfterGenset });
  } else if (surplusPV > 0) {
    // Export surplus PV to grid
    flows.push({ from: "PV", to: "GRID", kW: surplusPV });
  }
  
  return flows;
};

const makeNodes = () => {
  const pvGen = 180 + Math.random() * 120;
  const gensetGen = 60 + Math.random() * 90;
  const loadDem = 280 + Math.random() * 160;
  
  // Calculate grid flow for display
  const pvToLoad = Math.min(pvGen, loadDem);
  const remainingAfterPV = Math.max(0, loadDem - pvToLoad);
  const gensetToLoad = Math.min(gensetGen, remainingAfterPV);
  const remainingAfterGenset = Math.max(0, remainingAfterPV - gensetToLoad);
  const surplusPV = Math.max(0, pvGen - pvToLoad);
  
  let gridStatus = "Balanced";
  let gridValue = 0;
  
  if (remainingAfterGenset > 0) {
    gridStatus = "Import";
    gridValue = remainingAfterGenset;
  } else if (surplusPV > 0) {
    gridStatus = "Export";
    gridValue = surplusPV;
  }
  
  return {
    PV: { kW: pvGen },
    GENSET: { kW: gensetGen },
    LOAD: { kW: loadDem },
    GRID: { kW: gridValue, status: gridStatus }
  };
};

/** ---------- Layout ---------- */
const POS = {
  GENSET: { x: 60,  y: 60 },    // top-left (genset container)
  LOAD:   { x: 520, y: 60 },    // top-right (C&I building)
  PV:     { x: 60,  y: 360 },   // bottom-left (solar)
  GRID:   { x: 520, y: 360 },   // bottom-right (transmission tower)
};
const SIZE = { w: 140, h: 100 };           // bigger like the mock
const CENTER = { x: 340, y: 260 };         // convergence point

/** ---------- Helpers ---------- */
function makePath(from, to) {
  const sx = POS[from].x + SIZE.w / 2;
  const sy = POS[from].y + SIZE.h / 2;
  const tx = POS[to].x + SIZE.w / 2;
  const ty = POS[to].y + SIZE.h / 2;
  const cx = CENTER.x;
  const cy = CENTER.y;
  
  // If going TO LOAD, all sources meet at center point first, then go to LOAD
  if (to === "LOAD") {
    return `M ${sx} ${sy} L ${cx} ${cy} L ${tx} ${ty}`;
  }
  // For other flows (like PV to GRID export), use the original curved path
  return `M ${sx} ${sy} Q ${cx} ${cy} ${tx} ${ty}`;
}
const strokeFor = (kW) => Math.max(2.5, Math.min(kW / 45, 9));
const speedFor  = (kW) => Math.max(0.8, 3.2 - (kW / 220)); // higher kW -> faster
const fmt = (v) => `${Math.round(v)} kW`;

/** ---------- Clean flow stream with yellow chevrons ---------- */
function ArrowStream({ id, d, kW, colorId }) {
  const thickness = Math.max(3, Math.min(kW / 60, 8));
  const speed = 4 + Math.max(0, 200 - Math.min(kW, 200)) / 60; // ~4–7s per pass (slow)
  const arrows = 3; // 2-3 yellow chevrons like the mock
  const lineColor = '#cbd5e1';    // slate-300
  const chevronColor = '#fbbf24'; // amber-400

  return (
    <g>
      {/* Simple gray base line */}
      <path
        d={d}
        fill="none"
        stroke={lineColor}
        strokeWidth={thickness}
        strokeLinecap="round"
        opacity="0.6"
      />

      {/* Small yellow chevrons moving slowly */}
      {Array.from({ length: arrows }).map((_, i) => (
        <g key={i}>
          <polygon
            points="-10,-6 0,0 -10,6"
            fill={chevronColor}
            stroke="#fff"
            strokeWidth="0.6"
          >
            <animateMotion
              dur={`${speed}s`}
              begin={`${(i * speed) / arrows}s`}
              repeatCount="indefinite"
              rotate="auto"
              path={d}
            />
          </polygon>
        </g>
      ))}
    </g>
  );
}

/** ---------- Professional label badge above each image ---------- */
function NodeBadge({ name, value, node }) {
  const cx = POS[name].x + SIZE.w / 2;
  const topY = POS[name].y - 30; // positioned well above circular plates
  const isGrid = name === "GRID";
  const w = isGrid ? 160 : 150; // More width for clear display
  const h = 36;
  const rx = 18;
  
  // Dynamic color based on value for visual hierarchy
  const getValueColor = (val, nodeName) => {
    if (nodeName === "GRID" && node?.status) {
      if (node.status === "Import") return "#ef4444"; // red for import
      if (node.status === "Export") return "#10b981"; // green for export
      return "#6b7280"; // gray for balanced
    }
    if (val > 300) return "#10b981"; // green for high values
    if (val > 200) return "#3b82f6"; // blue for medium values
    return "#f59e0b"; // amber for lower values
  };
  
  // Format display text for GRID
  const getDisplayText = () => {
    if (isGrid && node?.status) {
      if (node.status === "Balanced") return "Balanced";
      return `${node.status} ${fmt(value)}`;
    }
    return fmt(value);
  };
  
  return (
    <g>
      {/* Premium shadow background */}
      <rect
        x={cx - w / 2 + 2}
        y={topY - h + 2}
        width={w}
        height={h}
        rx={rx}
        fill="#000000"
        fillOpacity="0.08"
      />
      
      {/* Main badge with gradient background */}
      <rect
        x={cx - w / 2}
        y={topY - h}
        width={w}
        height={h}
        rx={rx}
        fill="#FFFFFF"
        stroke="url(#badgeGradient)"
        strokeWidth="2"
        style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,.1))" }}
      />
      
      {/* Component name */}
      <text
        x={cx}
        y={topY - h / 2 - 4}
        textAnchor="middle"
        fontFamily="Inter, ui-sans-serif, system-ui"
        fontSize="12"
        fontWeight="600"
        fill="#6b7280"
        letterSpacing="0.4px"
      >
        {name}
      </text>
      
      {/* Dynamic value with color coding and special GRID formatting */}
      <text
        x={cx}
        y={topY - h / 2 + 12}
        textAnchor="middle"
        fontFamily="Inter, ui-sans-serif, system-ui"
        fontSize={isGrid ? "13" : "14"}
        fontWeight="700"
        fill={getValueColor(value, name)}
      >
        {getDisplayText()}
      </text>
      
      {/* Gradient definition for badge border */}
      <defs>
        <linearGradient id="badgeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#198c1a" stopOpacity="0.4" />
          <stop offset="50%" stopColor="#0097b2" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#198c1a" stopOpacity="0.4" />
        </linearGradient>
      </defs>
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

  const flows = useMemo(() => ([
    { id: "pv-load",     from: "PV",     to: "LOAD"   },
    { id: "genset-load", from: "GENSET", to: "LOAD"   },
    { id: "pv-grid",     from: "PV",     to: "GRID"   },
    { id: "grid-load",   from: "GRID",   to: "LOAD"   },
  ].map(f => ({ ...f, d: makePath(f.from, f.to) }))), []);

  const flowsWithKw = flows.map(f => {
    const match = edges.find(e => e.from === f.from && e.to === f.to);
    return { ...f, kW: match ? match.kW : 0 };
  }).filter(f => f.kW > 5); // Only show flows with meaningful power (>5kW)

  return (
    <div className="h-full flex flex-col rounded-2xl shadow-xl border border-green-200/40 p-1 overflow-hidden" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 10px 25px -5px rgba(25, 140, 26, 0.15), 0 0 0 1px rgba(25, 140, 26, 0.05)" }}>
      
      {/* Compact Header */}
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold bg-gradient-to-r from-[#198c1a] via-[#10b981] to-[#0097b2] bg-clip-text text-transparent">Power Flow Visualization</h3>
            <div className="h-0.5 w-20 bg-gradient-to-r from-[#198c1a] to-[#0097b2] rounded-full mt-1"></div>
          </div>
        </div>
      </div>
      
      {/* Flexible SVG Container */}
      <div className="flex-grow flex items-center justify-center overflow-hidden min-h-0" style={{ backgroundColor: "#FFFFFF" }}>
        <svg viewBox="0 0 720 560" className="w-full h-full max-h-full" style={{ display: "block", backgroundColor: "#FFFFFF" }}>
        {/* Perfect white background matching the container */}
        <rect x="0" y="0" width="720" height="560" fill="#FFFFFF" />
        
        {/* Faint square grid pattern background */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="0.5" opacity="0.12"/>
          </pattern>
        </defs>
        <rect x="0" y="0" width="720" height="560" fill="url(#grid)" />
        
        {/* Professional filter definitions */}
        <defs>
          <filter id="professionalGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          <filter id="imageGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur"/>
            <feFlood result="color" floodColor="#198c1a" floodOpacity="0.1"/>
            <feComposite in="color" in2="blur" operator="in" result="shadow"/>
            <feMerge>
              <feMergeNode in="shadow"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>



        {/* Flow streams */}
        {flowsWithKw.map((f, i) => (
          <ArrowStream
            key={f.id}
            id={f.id}
            d={f.d}
            kW={f.kW}
            colorId="none"
          />
        ))}

        {/* Node labels (real-time values) */}
        <NodeBadge name="PV"     value={nodes.PV.kW} node={nodes.PV} />
        <NodeBadge name="GRID"   value={nodes.GRID.kW} node={nodes.GRID} />
        <NodeBadge name="GENSET" value={nodes.GENSET.kW} node={nodes.GENSET} />
        <NodeBadge name="LOAD"   value={nodes.LOAD.kW} node={nodes.LOAD} />

        {/* 3D Oval Device Plates with Soft Depth */}
        <defs>
          {/* 3D Oval Gradient */}
          <radialGradient id="oval3D" cx="35%" cy="35%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1"/>
            <stop offset="30%" stopColor="#f8fafc" stopOpacity="1"/>
            <stop offset="70%" stopColor="#e2e8f0" stopOpacity="1"/>
            <stop offset="100%" stopColor="#cbd5e1" stopOpacity="1"/>
          </radialGradient>
          
          {/* Soft 3D Border */}
          <linearGradient id="ovalBorder" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.7"/>
            <stop offset="50%" stopColor="#64748b" stopOpacity="0.5"/>
            <stop offset="100%" stopColor="#475569" stopOpacity="0.7"/>
          </linearGradient>
          
          {/* Enhanced 3D Shadow Filter */}
          <filter id="soft3DShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="blur"/>
            <feOffset dx="3" dy="4" result="offsetBlur"/>
            <feFlood floodColor="#000000" floodOpacity="0.2"/>
            <feComposite in2="offsetBlur" operator="in"/>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          {/* Oval Clipping Paths */}
          <clipPath id="ovalClipGENSET">
            <ellipse cx={POS.GENSET.x + SIZE.w/2} cy={POS.GENSET.y + SIZE.h/2} rx={SIZE.w/2 + 5} ry={SIZE.h/2 + 5}/>
          </clipPath>
          <clipPath id="ovalClipLOAD">
            <ellipse cx={POS.LOAD.x + SIZE.w/2} cy={POS.LOAD.y + SIZE.h/2} rx={SIZE.w/2 + 5} ry={SIZE.h/2 + 5}/>
          </clipPath>
          <clipPath id="ovalClipPV">
            <ellipse cx={POS.PV.x + SIZE.w/2} cy={POS.PV.y + SIZE.h/2} rx={SIZE.w/2 + 5} ry={SIZE.h/2 + 5}/>
          </clipPath>
          <clipPath id="ovalClipGRID">
            <ellipse cx={POS.GRID.x + SIZE.w/2} cy={POS.GRID.y + SIZE.h/2} rx={SIZE.w/2 + 5} ry={SIZE.h/2 + 5}/>
          </clipPath>
        </defs>

        {/* Soft Shadow Layers for 3D Depth - Made Transparent */}
        <ellipse cx={POS.GENSET.x + SIZE.w/2 + 4} cy={POS.GENSET.y + SIZE.h/2 + 5} rx={SIZE.w/2 + 10} ry={SIZE.h/2 + 8} fill="transparent"/>
        <ellipse cx={POS.LOAD.x + SIZE.w/2 + 4} cy={POS.LOAD.y + SIZE.h/2 + 5} rx={SIZE.w/2 + 10} ry={SIZE.h/2 + 8} fill="transparent"/>
        <ellipse cx={POS.PV.x + SIZE.w/2 + 4} cy={POS.PV.y + SIZE.h/2 + 5} rx={SIZE.w/2 + 10} ry={SIZE.h/2 + 8} fill="transparent"/>
        <ellipse cx={POS.GRID.x + SIZE.w/2 + 4} cy={POS.GRID.y + SIZE.h/2 + 5} rx={SIZE.w/2 + 10} ry={SIZE.h/2 + 8} fill="transparent"/>

        {/* Main 3D Oval Backplates - Bigger Size, No Fill, Stroke Only */}
        <ellipse cx={POS.GENSET.x + SIZE.w/2} cy={POS.GENSET.y + SIZE.h/2} rx={SIZE.w/2 + 20} ry={SIZE.h/2 + 15} fill="none" stroke="url(#ovalBorder)" strokeWidth="3" filter="url(#soft3DShadow)"/>
        <ellipse cx={POS.LOAD.x + SIZE.w/2} cy={POS.LOAD.y + SIZE.h/2} rx={SIZE.w/2 + 20} ry={SIZE.h/2 + 15} fill="none" stroke="url(#ovalBorder)" strokeWidth="3" filter="url(#soft3DShadow)"/>
        <ellipse cx={POS.PV.x + SIZE.w/2} cy={POS.PV.y + SIZE.h/2} rx={SIZE.w/2 + 20} ry={SIZE.h/2 + 15} fill="none" stroke="url(#ovalBorder)" strokeWidth="3" filter="url(#soft3DShadow)"/>
        <ellipse cx={POS.GRID.x + SIZE.w/2} cy={POS.GRID.y + SIZE.h/2} rx={SIZE.w/2 + 20} ry={SIZE.h/2 + 15} fill="none" stroke="url(#ovalBorder)" strokeWidth="3" filter="url(#soft3DShadow)"/>

        {/* Soft Top Highlights for 3D Effect - Bigger Size */}
        <ellipse cx={POS.GENSET.x + SIZE.w/2} cy={POS.GENSET.y + SIZE.h/2 - 8} rx={SIZE.w/2 + 15} ry={SIZE.h/2 + 10} fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2"/>
        <ellipse cx={POS.LOAD.x + SIZE.w/2} cy={POS.LOAD.y + SIZE.h/2 - 8} rx={SIZE.w/2 + 15} ry={SIZE.h/2 + 10} fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2"/>
        <ellipse cx={POS.PV.x + SIZE.w/2} cy={POS.PV.y + SIZE.h/2 - 8} rx={SIZE.w/2 + 15} ry={SIZE.h/2 + 10} fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2"/>
        <ellipse cx={POS.GRID.x + SIZE.w/2} cy={POS.GRID.y + SIZE.h/2 - 8} rx={SIZE.w/2 + 15} ry={SIZE.h/2 + 10} fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2"/>

        {/* Large PNG Icons Extending Outside Oval Boundaries */}
        <image
          href="/kpi-images/genset.png"
          x={POS.GENSET.x - 20}
          y={POS.GENSET.y - 20}
          width={SIZE.w + 40}
          height={SIZE.h + 40}
          preserveAspectRatio="xMidYMid meet"
          filter="url(#imageGlow)"
        />
        <image
          href="/kpi-images/load.png"
          x={POS.LOAD.x - 20}
          y={POS.LOAD.y - 20}
          width={SIZE.w + 40}
          height={SIZE.h + 40}
          preserveAspectRatio="xMidYMid meet"
          filter="url(#imageGlow)"
        />
        <image
          href="/kpi-images/PV 2.png"
          x={POS.PV.x - 20}
          y={POS.PV.y - 20}
          width={SIZE.w + 40}
          height={SIZE.h + 40}
          preserveAspectRatio="xMidYMid meet"
          filter="url(#imageGlow)"
        />
        <image
          href="/kpi-images/Grid.png"
          x={POS.GRID.x - 20}
          y={POS.GRID.y - 20}
          width={SIZE.w + 40}
          height={SIZE.h + 40}
          preserveAspectRatio="xMidYMid meet"
          filter="url(#imageGlow)"
        />
      </svg>
      </div>
    </div>
  );
}
