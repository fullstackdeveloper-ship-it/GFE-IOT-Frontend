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
import { io } from "socket.io-client";

/* -------------------------- API Data Fetching -------------------------- */
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const fetchPowerFlowData = async (hours = 1) => {
  try {
    const response = await fetch(`${API_BASE_URL}/power-flow/history?hours=${hours}`);
    const result = await response.json();
    
    if (result.success && result.data) {
      return result.data.map(item => ({
        ts: new Date(item.time),
        pv: item.solar,
        genset: item.genset,
        load: item.load,
        grid: item.grid,
        batchId: item.batchId
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching power flow data:', error);
    return [];
  }
};

/* ----------------------------- Professional Tooltip ----------------------------- */
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  
  // Format time with seconds for 5-second precision
  const dt = d.ts.toLocaleString("en-GB", {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    day: "2-digit",
    month: "short",
  });

  const rows = [
    { key: "pv", label: "Solar Generation", color: "#f59e0b", icon: "☀️" },
    { key: "load", label: "Load Demand", color: "#3b82f6", icon: "⚡" },
    { key: "genset", label: "Generator Output", color: "#ef4444", icon: "🔧" },
    {
      key: "grid",
      label: d.grid >= 0 ? "Grid Import" : "Grid Export",
      color: d.grid >= 0 ? "#06b6d4" : "#10b981",
      icon: d.grid >= 0 ? "📥" : "📤"
    },
  ];

  return (
    <div
      className="rounded-xl border border-gray-200 shadow-2xl"
      style={{
        background: "rgba(255, 255, 255, 0.98)",
        backdropFilter: "blur(10px)",
        minWidth: 280,
        maxWidth: 320,
        padding: "12px 16px",
        boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
      }}
    >
      {/* Header */}
      <div
        style={{
          marginBottom: 8,
          paddingBottom: 8,
          borderBottom: "2px solid #e5e7eb",
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 3 }}>
          Power Flow Analysis
        </div>
        <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 500 }}>{dt}</div>
        <div style={{ fontSize: 10, color: "#9ca3af" }}>Batch: {d.batchId}</div>
      </div>

      {/* Series values with icons */}
      <div style={{ display: "grid", gap: 6 }}>
        {rows.map((r) => (
          <div
            key={r.key}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "8px 10px",
              borderRadius: 8,
              background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
              border: "1px solid #e2e8f0",
              transition: "all 0.2s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 14 }}>{r.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{r.label}</span>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: r.color }}>
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
  const [socket, setSocket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedHours, setSelectedHours] = useState(1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(API_BASE_URL);
    setSocket(newSocket);

    // Fetch initial data
    const loadInitialData = async () => {
      setIsLoading(true);
      const initialData = await fetchPowerFlowData(selectedHours);
      setData(initialData);
      
      // Calculate night areas
      const a = [];
      let start = null;
      initialData.forEach((p, i) => {
        const h = p.ts.getHours();
        const night = h >= 20 || h < 6;
        if (night && start === null) start = i;
        if (!night && start !== null) {
          a.push({ x1: initialData[start].ts.getTime(), x2: initialData[i - 1].ts.getTime() });
          start = null;
        }
      });
      if (start !== null) a.push({ x1: initialData[start].ts.getTime(), x2: initialData[initialData.length - 1].ts.getTime() });
      setNightAreas(a);
      setIsLoading(false);
    };

    loadInitialData();

    // Real-time updates every 5 seconds
    const interval = setInterval(async () => {
      const updatedData = await fetchPowerFlowData(selectedHours);
      setData(updatedData);
    }, 5000);

    return () => {
      clearInterval(interval);
      if (newSocket) newSocket.disconnect();
    };
  }, [selectedHours]);

  // Handle time range change
  const handleTimeRangeChange = async (hours) => {
    setSelectedHours(hours);
    setIsDropdownOpen(false);
    setIsLoading(true);
    const newData = await fetchPowerFlowData(hours);
    setData(newData);
    setIsLoading(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest('.dropdown-container')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  if (isLoading || !data.length) {
    return (
      <div className="h-full rounded-2xl border border-gray-200 p-4 flex flex-col overflow-hidden bg-white">
        <div className="flex-shrink-0 mb-3">
          <h3 className="text-xl font-bold mb-1 bg-gradient-to-r from-[#0097b2] to-[#198c1a] bg-clip-text text-transparent">
            Power Flow Analysis
          </h3>
          <div className="h-1 w-24 bg-gradient-to-r from-[#0097b2] to-[#198c1a] rounded-full"></div>
        </div>
        <div className="flex-grow rounded-xl border border-gray-200 p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0097b2] mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading Power Flow Data...</p>
            <p className="text-sm text-gray-500 mt-2">Fetching 24-hour historical data</p>
          </div>
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
          <h3 className="text-xl font-bold mb-1 bg-gradient-to-r from-[#0097b2] to-[#198c1a] bg-clip-text text-transparent">
            Power Flow Analysis
          </h3>
          <div className="h-1 w-24 bg-gradient-to-r from-[#0097b2] to-[#198c1a] rounded-full"></div>
        </div>
        
        {/* Time Range Dropdown */}
        <div className="flex items-center gap-3">
          <div className="relative dropdown-container">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-sm font-medium text-gray-700 hover:border-[#0097b2] focus:outline-none focus:ring-2 focus:ring-[#0097b2] focus:ring-opacity-50"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Last {selectedHours} {selectedHours === 1 ? 'Hour' : 'Hours'}</span>
              <svg className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
                <div className="py-1">
                  {[1, 2, 3, 4, 6, 8, 12, 18, 24].map((hours) => (
                    <button
                      key={hours}
                      onClick={() => handleTimeRangeChange(hours)}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors duration-150 flex items-center justify-between ${
                        selectedHours === hours ? 'bg-[#0097b2] text-white hover:bg-[#0088a3]' : 'text-gray-700'
                      }`}
                    >
                      <span>Last {hours} {hours === 1 ? 'Hour' : 'Hours'}</span>
                      {selectedHours === hours && (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-600 font-medium">Live Data</span>
            </div>
      
          </div>
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
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 4, fill: "#f59e0b", stroke: "#fff", strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="load"
              name="Load Demand"
              stroke="url(#loadGradient)"
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 4, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="genset"
              name="Generator Output"
              stroke="url(#gensetGradient)"
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 4, fill: "#ef4444", stroke: "#fff", strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="grid"
              name="Grid Exchange"
              stroke="url(#gridPowerGradient)"
              strokeWidth={1.5}
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
