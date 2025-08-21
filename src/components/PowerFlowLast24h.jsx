import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceArea,
  ReferenceLine,
} from "recharts";

/* -------------------------- Data builder (24h) -------------------------- */
const buildData = () => {
  const data = [];
  const now = new Date();

  for (let i = 23; i >= 0; i--) {
    const ts = new Date(now.getTime() - i * 60 * 60 * 1000);
    const hour = ts.getHours();

    // PV: bell-shaped daylight curve
    const pvPeak = 280 + Math.random() * 40;
    let pv = 0;
    if (hour >= 6 && hour <= 18) {
      const solarHour = hour - 12;
      const bellCurve = Math.exp(-(solarHour * solarHour) / 18);
      pv = pvPeak * bellCurve * (0.85 + Math.random() * 0.3);
      pv = Math.max(0, Math.min(pv, 300));
    }

    // Load: business-hours peak
    const baseLoad = 280;
    const peakLoad = 420;
    let load;
    if (hour >= 7 && hour <= 22) {
      const dayFactor = 0.7 + 0.3 * Math.sin(((hour - 7) / 15) * Math.PI);
      load = baseLoad + (peakLoad - baseLoad) * dayFactor;
    } else {
      load = baseLoad + Math.random() * 50;
    }
    load += (Math.random() - 0.5) * 40;
    load = Math.max(250, Math.min(load, 450));

    // Genset: occasional backup
    let genset = Math.random() < 0.3 ? 50 + Math.random() * 100 : Math.random() * 20;
    if (pv > load * 0.8 && Math.random() < 0.6) genset = 0;

    // Grid = balance (import + / export -)
    const grid = load - (pv + genset);

    data.push({
      ts,
      pv: Math.round(pv * 10) / 10,
      genset: Math.round(genset * 10) / 10,
      load: Math.round(load * 10) / 10,
      grid: Math.round(grid * 10) / 10,
    });
  }
  return data;
};

/* ----------------------------- Compact Tooltip ----------------------------- */
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  const dt = d.ts.toLocaleString("en-GB", {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const rows = [
    { key: "pv", label: "Solar Generation", color: "#f59e0b" },
    { key: "load", label: "Load Demand", color: "#3b82f6" },
    { key: "genset", label: "Generator Output", color: "#ef4444" },
    {
      key: "grid",
      label: d.grid >= 0 ? "Grid Import" : "Grid Export",
      color: d.grid >= 0 ? "#06b6d4" : "#10b981",
    },
  ];

  return (
    <div
      className="rounded-lg border border-gray-200 shadow-lg"
      style={{
        background: "#fff",
        minWidth: 200,
        maxWidth: 240,
        padding: "8px 10px",
        boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
      }}
    >
      {/* Header */}
      <div
        style={{
          marginBottom: 6,
          paddingBottom: 4,
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 600, color: "#111827", marginBottom: 2 }}>
          Power Analysis
        </div>
        <div style={{ fontSize: 10, color: "#6b7280" }}>{dt}</div>
      </div>

      {/* Series values (simple, clean) */}
      <div style={{ display: "grid", gap: 4 }}>
        {rows.map((r) => (
          <div
            key={r.key}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "4px 6px",
              borderRadius: 4,
              background: "#f9fafb",
              border: "1px solid #e5e7eb",
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 600, color: "#374151" }}>{r.label}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: r.color }}>
              {Math.abs(d[r.key]).toFixed(1)} kW
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ------------------------------- Helpers ------------------------------- */
const formatXAxisTick = (tickValue) =>
  new Date(tickValue).toLocaleString("en-GB", { hour: "2-digit", minute: "2-digit" });

/* ------------------------------ Main Chart ------------------------------ */
const PowerFlowLast24h = () => {
  const [data, setData] = useState([]);
  const [nightAreas, setNightAreas] = useState([]);

  useEffect(() => {
    const generate = () => {
      const d = buildData();
      setData(d);

      // Night shading (20:00–06:00)
      const a = [];
      let start = null;
      d.forEach((p, i) => {
        const h = p.ts.getHours();
        const night = h >= 20 || h < 6;
        if (night && start === null) start = i;
        if (!night && start !== null) {
          a.push({ x1: d[start].ts.getTime(), x2: d[i - 1].ts.getTime() });
          start = null;
        }
      });
      if (start !== null) a.push({ x1: d[start].ts.getTime(), x2: d[d.length - 1].ts.getTime() });
      setNightAreas(a);
    };

    generate();
    const t = setInterval(generate, 5 * 60 * 1000);
    return () => clearInterval(t);
  }, []);

  if (!data.length) {
    return (
      <div className="bg-white rounded-xl shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/3" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-full rounded-2xl border border-gray-200 p-4 flex flex-col overflow-hidden bg-white"
      style={{ boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)" }}
    >
      {/* Header */}
      <div className="flex-shrink-0 mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold mb-1 bg-gradient-to-r from-[#0097b2] to-[#198c1a] bg-clip-text text-transparent">
            Power Flow Analysis
          </h3>
          <div className="h-1 w-24 bg-gradient-to-r from-[#0097b2] to-[#198c1a] rounded-full"></div>
        </div>

      </div>

      {/* Chart */}
      <div className="flex-grow rounded-xl border border-gray-200 p-2 min-h-0 bg-white">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 10, left: 24, bottom: 16 }}>
            {/* Night shading */}
            {nightAreas.map((ar, i) => (
              <ReferenceArea key={i} x1={ar.x1} x2={ar.x2} fill="#e5e7eb" fillOpacity={0.35} />
            ))}

            {/* Zero line */}
            <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" strokeWidth={1.2} />

            {/* Grid */}
            <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />

            {/* Axes */}
            <XAxis
              dataKey="ts"
              type="number"
              scale="time"
              domain={["dataMin", "dataMax"]}
              tickFormatter={formatXAxisTick}
              tick={{ fontSize: 11, fill: "#374151", fontWeight: 600 }}
              axisLine={{ stroke: "#6b7280", strokeWidth: 1 }}
              tickLine={{ stroke: "#6b7280", strokeWidth: 1 }}
              interval="preserveStartEnd"
              minTickGap={40}
            />
            <YAxis
              label={{
                value: "Power (kW)",
                angle: -90,
                position: "insideLeft",
                style: { textAnchor: "middle", fill: "#374151", fontSize: 12, fontWeight: 700 },
              }}
              tick={{ fontSize: 11, fill: "#374151", fontWeight: 600 }}
              axisLine={{ stroke: "#6b7280", strokeWidth: 1 }}
              tickLine={{ stroke: "#6b7280", strokeWidth: 1 }}
              domain={["dataMin - 50", "dataMax + 50"]}
            />

            {/* Lines */}
            <defs>
              <linearGradient id="pvGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#d97706" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
              <linearGradient id="loadGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2563eb" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#2563eb" />
              </linearGradient>
              <linearGradient id="gensetGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#dc2626" />
                <stop offset="50%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#dc2626" />
              </linearGradient>
              <linearGradient id="gridPowerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0891b2" />
                <stop offset="50%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#0891b2" />
              </linearGradient>
            </defs>

            <Line
              type="monotone"
              dataKey="pv"
              name="Solar Generation"
              stroke="url(#pvGradient)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#f59e0b", stroke: "#fff", strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="load"
              name="Load Demand"
              stroke="url(#loadGradient)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="genset"
              name="Generator Output"
              stroke="url(#gensetGradient)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#ef4444", stroke: "#fff", strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="grid"
              name="Grid Exchange"
              stroke="url(#gridPowerGradient)"
              strokeWidth={2}
              strokeDasharray="8 4"
              dot={false}
              activeDot={{ r: 4, fill: "#06b6d4", stroke: "#fff", strokeWidth: 2 }}
            />

            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: 6, fontSize: 11, fontWeight: 600 }}
              iconType="line"
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PowerFlowLast24h;
