import React, { useState, useEffect } from 'react';
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
  Area,
  AreaChart,
  defs
} from 'recharts';

/**
 * Builds 24-hour rolling window data with realistic power flow patterns
 * @returns {Array} Array of 24 hourly data points from now back to 23 hours ago
 */
const buildData = () => {
  const data = [];
  const now = new Date();
  
  for (let i = 23; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - (i * 60 * 60 * 1000)); // i hours ago
    const hour = timestamp.getHours();
    
    // Format label as "HH:mm, dd MMM"
    const label = timestamp.toLocaleString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: 'short'
    });
    
    // PV Generation: Bell curve around midday (0-300kW)
    const pvPeak = 280 + Math.random() * 40; // 280-320kW peak
    let pv = 0;
    if (hour >= 6 && hour <= 18) {
      // Solar generation hours (6AM - 6PM)
      const solarHour = hour - 12; // Center around noon
      const bellCurve = Math.exp(-(solarHour * solarHour) / 18); // Gaussian curve
      pv = pvPeak * bellCurve * (0.85 + Math.random() * 0.3); // Add some randomness
      pv = Math.max(0, Math.min(pv, 300)); // Clamp to 0-300
    }
    
    // LOAD: Daily consumption pattern (250-450kW)
    const baseLoad = 280;
    const peakLoad = 420;
    let load;
    
    if (hour >= 7 && hour <= 22) {
      // Daytime higher consumption
      const dayFactor = 0.7 + 0.3 * Math.sin(((hour - 7) / 15) * Math.PI);
      load = baseLoad + (peakLoad - baseLoad) * dayFactor;
    } else {
      // Nighttime lower consumption
      load = baseLoad + Math.random() * 50;
    }
    load += (Math.random() - 0.5) * 40; // Random variation ±20kW
    load = Math.max(250, Math.min(load, 450)); // Clamp to range
    
    // GENSET: Backup generation with random bursts (0-150kW)
    let genset = 0;
    const needsBackup = Math.random() < 0.3; // 30% chance of backup generation
    if (needsBackup) {
      genset = 50 + Math.random() * 100; // 50-150kW when running
    } else {
      genset = Math.random() * 20; // Low idle/maintenance load
    }
    
    // Ensure some periods where genset is truly off
    if (pv > load * 0.8 && Math.random() < 0.6) {
      genset = 0; // Turn off genset when plenty of solar
    }
    
    // GRID: Balance equation (Import positive, Export negative)
    const grid = load - (pv + genset);
    
    data.push({
      ts: timestamp,
      label,
      pv: Math.round(pv * 10) / 10, // Round to 1 decimal
      genset: Math.round(genset * 10) / 10,
      load: Math.round(load * 10) / 10,
      grid: Math.round(grid * 10) / 10
    });
  }
  
  return data;
};

/**
 * Stunning custom tooltip component with premium design
 */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const fullDateTime = data.ts.toLocaleString('en-GB', {
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    
    return (
      <div className="bg-white/98 backdrop-blur-xl border border-green-200/60 rounded-xl shadow-xl shadow-[#198c1a]/15 p-4 min-w-[240px] max-w-[280px]" 
           style={{ 
             background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.95) 100%)',
             boxShadow: '0 12px 25px -8px rgba(25, 140, 26, 0.2), 0 0 0 1px rgba(25, 140, 26, 0.08)',
             position: 'relative',
             zIndex: 1000
           }}>
        {/* Compact Header */}
        <div className="mb-3 pb-2 border-b border-green-200/30">
          <p className="font-bold text-sm bg-gradient-to-r from-[#198c1a] to-[#0097b2] bg-clip-text text-transparent">
            Power Analysis
          </p>
          <p className="text-xs text-gray-600 font-medium">{fullDateTime}</p>
        </div>
        
        {/* Compact Power values */}
        <div className="space-y-2">
          {payload.map((entry) => {
            let displayValue = `${Math.abs(entry.value)} kW`;
            let seriesName = entry.name;
            let valueColor = entry.color;
            
            // Clean handling without icons
            if (entry.dataKey === 'pv') {
              seriesName = 'Solar';
            } else if (entry.dataKey === 'genset') {
              seriesName = 'Generator';
            } else if (entry.dataKey === 'load') {
              seriesName = 'Load';
            } else if (entry.dataKey === 'grid') {
              const isImport = entry.value >= 0;
              seriesName = isImport ? 'Grid' : 'Export';
              valueColor = isImport ? '#ef4444' : '#10b981';
            }
            
            return (
              <div key={entry.dataKey} className="flex items-center justify-between p-2 rounded-lg bg-gray-50/50 border border-gray-200/30">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }}></div>
                  <span className="font-medium text-sm text-gray-800">{seriesName}</span>
                </div>
                <span className="font-bold text-sm" style={{ color: valueColor }}>
                  {displayValue}
                </span>
              </div>
            );
          })}
        </div>
        
        {/* Compact Footer */}
        <div className="mt-3 pt-2 border-t border-green-200/30">
          <div className="h-0.5 w-full bg-gradient-to-r from-[#198c1a] to-[#0097b2] rounded-full opacity-60"></div>
        </div>
      </div>
    );
  }
  return null;
};

/**
 * Format X-axis ticks to show short time
 */
const formatXAxisTick = (tickItem) => {
  const date = new Date(tickItem);
  return date.toLocaleString('en-GB', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * PowerFlowLast24h Chart Component
 */
const PowerFlowLast24h = () => {
  const [data, setData] = useState([]);
  const [nightAreas, setNightAreas] = useState([]);
  
  useEffect(() => {
    const generateData = () => {
      const chartData = buildData();
      setData(chartData);
      
      // Calculate night time reference areas (20:00 - 06:00)
      const areas = [];
      let nightStart = null;
      
      chartData.forEach((point, index) => {
        const hour = point.ts.getHours();
        const isNight = hour >= 20 || hour < 6;
        
        if (isNight && nightStart === null) {
          nightStart = index;
        } else if (!isNight && nightStart !== null) {
          areas.push({
            x1: chartData[nightStart].ts.getTime(),
            x2: index > 0 ? chartData[index - 1].ts.getTime() : chartData[nightStart].ts.getTime()
          });
          nightStart = null;
        }
      });
      
      // Handle case where night continues to end of data
      if (nightStart !== null) {
        areas.push({
          x1: chartData[nightStart].ts.getTime(),
          x2: chartData[chartData.length - 1].ts.getTime()
        });
      }
      
      setNightAreas(areas);
    };
    
    generateData();
    
    // Update data every 5 minutes for live rolling window
    const interval = setInterval(generateData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  
  if (data.length === 0) {
    return (
      <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl shadow-[#198c1a]/5 border border-[#198c1a]/15 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full bg-white/98 backdrop-blur-xl rounded-2xl shadow-xl border border-green-200/40 p-3 flex flex-col overflow-hidden" 
         style={{ 
           background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.95) 100%)',
           boxShadow: '0 10px 25px -5px rgba(25, 140, 26, 0.15), 0 0 0 1px rgba(25, 140, 26, 0.05)'
         }}>
      
      {/* Compact Header */}
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold bg-gradient-to-r from-[#198c1a] via-[#10b981] to-[#0097b2] bg-clip-text text-transparent">
              Power Flow Line Graph
            </h3>
            <div className="h-0.5 w-20 bg-gradient-to-r from-[#198c1a] to-[#0097b2] rounded-full mt-1"></div>
          </div>
        </div>
      </div>
      
      {/* Full Chart Container */}
      <div className="flex-grow bg-white/40 backdrop-blur-sm rounded-xl border border-white/20 shadow-inner p-1 min-h-0"
           style={{ 
             background: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(248,250,252,0.5) 100%)',
             boxShadow: 'inset 0 2px 4px rgba(25, 140, 26, 0.05)'
           }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 5, left: 20, bottom: 15 }}
          >
            {/* Stunning night time shading with gradient */}
            {nightAreas.map((area, index) => (
              <ReferenceArea
                key={index}
                x1={area.x1}
                x2={area.x2}
                fill="url(#nightGradient)"
                fillOpacity={0.3}
              />
            ))}
            
            {/* Zero line reference */}
            <ReferenceLine 
              y={0} 
              stroke="#94a3b8" 
              strokeDasharray="2 2" 
              strokeOpacity={0.6}
              strokeWidth={1}
            />
            
            {/* Premium grid with subtle gradients */}
            <CartesianGrid 
              strokeDasharray="4 4" 
              stroke="url(#gridGradient)" 
              opacity={0.3}
              vertical={true} 
              horizontal={true}
            />
            
            {/* Enhanced Axes */}
            <XAxis
              dataKey="ts"
              type="number"
              scale="time"
              domain={['dataMin', 'dataMax']}
              tickFormatter={formatXAxisTick}
              tick={{ 
                fontSize: 13, 
                fill: '#4b5563', 
                fontWeight: '600' 
              }}
              axisLine={{ stroke: '#9ca3af', strokeWidth: 2 }}
              tickLine={{ stroke: '#9ca3af', strokeWidth: 2 }}
              interval="preserveStartEnd"
              minTickGap={60}
            />
            <YAxis
              label={{ 
                value: 'Power (kW)', 
                angle: -90, 
                position: 'insideLeft',
                style: { 
                  textAnchor: 'middle', 
                  fill: '#374151', 
                  fontSize: '16px', 
                  fontWeight: '700' 
                }
              }}
              tick={{ 
                fontSize: 13, 
                fill: '#4b5563', 
                fontWeight: '600' 
              }}
              axisLine={{ stroke: '#9ca3af', strokeWidth: 2 }}
              tickLine={{ stroke: '#9ca3af', strokeWidth: 2 }}
              domain={['dataMin - 50', 'dataMax + 50']}
            />
            
            {/* Gradient Definitions */}
            <defs>
              <linearGradient id="nightGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1e293b" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#475569" stopOpacity="0.1" />
              </linearGradient>
              
              <linearGradient id="gridGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#198c1a" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#0097b2" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.3" />
              </linearGradient>
              
              <linearGradient id="pvGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.8" />
              </linearGradient>
              
              <linearGradient id="loadGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
              </linearGradient>
              
              <linearGradient id="gensetGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#f87171" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0.8" />
              </linearGradient>
              
              <linearGradient id="gridPowerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#34d399" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
              </linearGradient>
            </defs>
            
            {/* Enhanced Power Lines with gradients and effects */}
            <Line
              type="monotone"
              dataKey="pv"
              stroke="url(#pvGradient)"
              strokeWidth={4}
              dot={{ fill: '#f59e0b', strokeWidth: 2, r: 0 }}
              activeDot={{ r: 6, fill: '#f59e0b', stroke: '#ffffff', strokeWidth: 3 }}
              name="Solar"
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="load"
              stroke="url(#loadGradient)"
              strokeWidth={4}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 0 }}
              activeDot={{ r: 6, fill: '#3b82f6', stroke: '#ffffff', strokeWidth: 3 }}
              name="Load"
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="genset"
              stroke="url(#gensetGradient)"
              strokeWidth={4}
              dot={{ fill: '#ef4444', strokeWidth: 2, r: 0 }}
              activeDot={{ r: 6, fill: '#ef4444', stroke: '#ffffff', strokeWidth: 3 }}
              name="Generator"
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="grid"
              stroke="url(#gridPowerGradient)"
              strokeWidth={4}
              strokeDasharray="10 5"
              dot={{ fill: '#10b981', strokeWidth: 2, r: 0 }}
              activeDot={{ r: 6, fill: '#10b981', stroke: '#ffffff', strokeWidth: 3 }}
              name="Grid"
              connectNulls={false}
            />
            
            {/* Interactive Elements */}
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{
                paddingTop: '0px',
                fontSize: '12px',
                fontWeight: '600'
              }}
              iconType="line"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      

    </div>
  );
};

export default PowerFlowLast24h;
