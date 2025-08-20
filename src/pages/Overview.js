// src/pages/Overview.jsx
import React from 'react';
import FlowKPI from '../components/FlowKPI.jsx';
import PowerFlowLast24h from '../components/PowerFlowLast24h.jsx';

const Overview = () => {
  return (
    <div className="min-h-screen bg-white p-6">
      {/* 40% / 60% split; equal heights */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 items-stretch">
        {/* 40% */}
        <div className="lg:col-span-4">
          <div className="h-[520px] rounded-xl border border-[#198c1a]/15 shadow-xl shadow-[#198c1a]/5 bg-white p-4 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-hidden">
              <FlowKPI />
            </div>
          </div>
        </div>

        {/* 60% */}
        <div className="lg:col-span-6">
          <div className="h-[520px] rounded-xl border border-[#198c1a]/15 shadow-xl shadow-[#198c1a]/5 bg-white p-4 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-hidden">
              {/* If your chart uses Recharts, ensure ResponsiveContainer height=100% inside */}
              <PowerFlowLast24h />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
