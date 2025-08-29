import React, { useState, useEffect, useMemo } from "react";
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
import { useAppSelector } from "../hooks/redux";

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
    { key: "pv", label: "Solar Generation", color: "#f59e0b" },
    { key: "grid", label: "Grid Exchange", color: "#3b82f6" },
    { key: "genset", label: "Generator Output", color: "#10b981" },
    { key: "load", label: "Load Demand", color: "#ef4444" },
  ];

  return (
    <div
      className="rounded-2xl border-0 shadow-2xl"
      style={{
        background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)",
        backdropFilter: "blur(20px)",
        minWidth: 300,
        maxWidth: 350,
        padding: "16px 20px",
        boxShadow: "0 25px 50px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.1)",
        border: "1px solid rgba(255,255,255,0.2)",
      }}
    >
            {/* Header */}
      <div
        style={{
          marginBottom: 12,
          paddingBottom: 12,
          borderBottom: "2px solid rgba(0, 151, 178, 0.2)",
          position: "relative"
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 800, color: "#0097b2", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>
          Power Flow Analysis
        </div>
        <div style={{ fontSize: 12, color: "#374151", fontWeight: 600 }}>{dt}</div>
        <div style={{ position: "absolute", top: 0, right: 0, width: "40px", height: "2px", background: "linear-gradient(90deg, #0097b2, #198c1a)", borderRadius: "1px" }} />
      </div>

      {/* Series values - super clean */}
      <div style={{ display: "grid", gap: 8 }}>
        {rows.map((r) => (
          <div
            key={r.key}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 16px",
              borderRadius: 12,
              background: "linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(248,250,252,0.8) 100%)",
              border: "1px solid rgba(226, 232, 240, 0.6)",
              transition: "all 0.3s ease",
              position: "relative",
              overflow: "hidden",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "4px", background: r.color, borderRadius: "0 2px 2px 0" }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginLeft: "8px" }}>{r.label}</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: r.color, textShadow: "0 1px 2px rgba(0,0,0,0.1)" }}>
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
  const [isLoading, setIsLoading] = useState(true);
  // Time range options (10 minutes to 2 hours)
  const timeRangeOptions = [
    { value: 1/6, label: '10 min' },    // 10 minutes
    { value: 1/3, label: '20 min' },    // 20 minutes
    { value: 1/2, label: '30 min' },    // 30 minutes
    { value: 1, label: '1 hour' },      // 1 hour
    { value: 1.5, label: '1.5 hours' }, // 1.5 hours
    { value: 2, label: '2 hours' }      // 2 hours
  ];

  const [selectedHours, setSelectedHours] = useState(1/6); // Default: 10 minutes
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [lastProcessedBatchId, setLastProcessedBatchId] = useState(null);
  
  // Get real-time data from Redux state (same as KPI component)
  const { powerFlowData } = useAppSelector((state) => state.sensor);

  // Process real-time data and append to chart
  useEffect(() => {
    if (powerFlowData && powerFlowData.timestamp) {
      // Use timestamp as unique identifier since batchId is undefined
      const uniqueId = powerFlowData.timestamp.toString();
      
      // Check if we've already processed this timestamp
      if (lastProcessedBatchId === uniqueId) {
        return;
      }
      
      setData(prevData => {
        // Check if this is a new data point using timestamp
        const existingTimestamps = new Set(prevData.map(d => d.timestamp?.toString()));
        if (existingTimestamps.has(uniqueId)) {
          return prevData;
        }
        
        // Create new data point with proper formatting
        const newDataPoint = {
          ts: new Date(powerFlowData.timestamp || powerFlowData.time || Date.now()),
          pv: parseFloat(powerFlowData.solar) || 0,
          genset: parseFloat(powerFlowData.genset) || 0,
          load: parseFloat(powerFlowData.load) || 0,
          grid: parseFloat(powerFlowData.grid) || 0,
          batchId: uniqueId, // Use timestamp as batchId
          timestamp: powerFlowData.timestamp // Store original timestamp
        };
        
        if (prevData.length === 0) {
          setLastProcessedBatchId(uniqueId);
          return [newDataPoint];
        }
        
        // Smoothly append new data point to the end without re-rendering entire chart
        // Use functional update to prevent unnecessary re-renders
        const updatedData = [...prevData, newDataPoint];
        
        // Maintain optimal data size for smooth performance
        // For 10 minutes: show up to 120 points (every 5 seconds)
        // For 2 hours: show up to 1440 points (every 5 seconds)
        const maxPoints = Math.min(selectedHours * 720, updatedData.length);
        const finalData = updatedData.slice(-maxPoints);
        
        // Update the last processed timestamp
        setLastProcessedBatchId(uniqueId);
        
        // Return the same array reference if no change needed (prevents re-render)
        if (finalData.length === prevData.length && 
            finalData[finalData.length - 1]?.timestamp === prevData[prevData.length - 1]?.timestamp) {
          return prevData;
        }
        
        return finalData;
      });
    }
  }, [powerFlowData, selectedHours, lastProcessedBatchId]);

  useEffect(() => {
    // Fetch initial data ONLY ONCE when component mounts
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
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
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Load initial data once
    loadInitialData();
  }, []); // Only run once when component mounts

  // Handle time range change with smooth transitions
  const handleTimeRangeChange = async (hours) => {
    setSelectedHours(hours);
    setIsDropdownOpen(false);
    
    // Check if we already have enough data for the new time range
    const requiredDataPoints = hours * 720; // 720 data points per hour (5-second intervals)
    const currentDataPoints = data.length;
    
    if (currentDataPoints >= requiredDataPoints) {
      // Just recalculate night areas with existing data
      const a = [];
      let start = null;
      data.forEach((p, i) => {
        const h = p.ts.getHours();
        const night = h >= 20 || h < 6;
        if (night && start === null) start = i;
        if (!night && start !== null) {
          a.push({ x1: data[start].ts.getTime(), x2: data[i - 1].ts.getTime() });
          start = null;
        }
      });
      if (start !== null) a.push({ x1: data[start].ts.getTime(), x2: data[data.length - 1].ts.getTime() });
      setNightAreas(a);
      return;
    }
    
    // Only fetch new data if we don't have enough
    setIsLoading(true);
    
    try {
      const newData = await fetchPowerFlowData(hours);
      
      // Smooth transition by keeping some old data initially
      setData(prevData => {
        if (prevData.length > 0) {
          // Keep last few points for smooth transition
          const transitionData = [...prevData.slice(-3), ...newData];
          return transitionData;
        }
        return newData;
      });
      
      // Recalculate night areas for new time range
      const a = [];
      let start = null;
      newData.forEach((p, i) => {
        const h = p.ts.getHours();
        const night = h >= 20 || h < 6;
        if (night && start === null) start = i;
        if (!night && start !== null) {
          a.push({ x1: newData[start].ts.getTime(), x2: newData[i - 1].ts.getTime() });
          start = null;
        }
      });
      if (start !== null) a.push({ x1: newData[start].ts.getTime(), x2: newData[data.length - 1].ts.getTime() });
      setNightAreas(a);
    } catch (error) {
      console.error('Error changing time range:', error);
    } finally {
      setIsLoading(false);
    }
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
            <p className="text-sm text-gray-500 mt-2">Fetching 10-minute historical data</p>
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
              className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl shadow-sm hover:bg-white/90 transition-all duration-200"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">
                {timeRangeOptions.find(opt => opt.value === selectedHours)?.label || '10 min'}
              </span>
              <svg className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="py-1">
                  {timeRangeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleTimeRangeChange(option.value)}
                      className={`w-full px-4 py-2 text-left text-sm transition-all duration-200 flex items-center justify-between group ${
                        selectedHours === option.value 
                          ? 'bg-gradient-to-r from-[#0097b2] to-[#198c1a] text-white shadow-md' 
                          : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100'
                      }`}
                    >
                      <span className="font-medium">{option.label}</span>
                      {selectedHours === option.value ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <div className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <svg className="w-4 h-4 text-[#0097b2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Socket Status Indicator */}
          <div className="flex items-center gap-2 px-3 py-2 bg-white/60 backdrop-blur-sm rounded-lg border border-gray-200 shadow-sm">
            <div className={`w-2 h-2 rounded-full ${powerFlowData ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="text-xs text-gray-600">
              {powerFlowData ? 'Live' : 'Waiting for Data'}
            </span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-grow rounded-xl border border-gray-200 p-2 min-h-0 bg-white transition-all duration-300 ease-in-out">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            animationDuration={150}
            animationEasing="ease-out"
          >
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
              tickLine={{ stroke: "#7b7280", strokeWidth: 1 }}
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
            {/* Power Flow Lines */}
            <Line 
              type="monotone" 
              dataKey="pv" 
              name="Solar Generation"
              stroke="#f59e0b" 
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 4, fill: "#f59e0b" }}
              animationDuration={150}
              animationEasing="ease-out"
              isAnimationActive={true}
            />
            <Line 
              type="monotone" 
              dataKey="grid" 
              name="Grid Exchange"
              stroke="#3b82f6" 
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 4, fill: "#3b82f6" }}
              animationDuration={150}
              animationEasing="ease-out"
              isAnimationActive={true}
            />
            <Line 
              type="monotone" 
              dataKey="genset" 
              name="Generator Output"
              stroke="#10b981" 
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 4, fill: "#10b981" }}
              animationDuration={150}
              animationEasing="ease-out"
              isAnimationActive={true}
            />
            <Line 
              type="monotone" 
              dataKey="load" 
              name="Load Demand"
              stroke="#ef4444" 
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 4, fill: "#ef4444" }}
              animationDuration={150}
              animationEasing="ease-out"
              isAnimationActive={true}
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
