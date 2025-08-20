import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const MainLayout = ({ children }) => {

  return (
    <div className="flex h-screen bg-white relative overflow-hidden">
      {/* Perfect gradient that merges from #0097b2 to #198c1a in the middle */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0097b2]/10 via-[#198c1a]/15 to-[#0097b2]/10 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-[#0097b2]/8 via-[#198c1a]/12 to-[#0097b2]/8 pointer-events-none"></div>
      
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden transition-all duration-300 relative min-w-0">
        <main className="flex-1 overflow-auto">
          <div className="relative z-10">
            <Header />
            <div className="p-6">
              {children}
            </div>
          </div>
        </main>
      </div>
      
      {/* Global styles for resize cursor */}
      <style jsx global>{`
        .resizing {
          cursor: col-resize !important;
          user-select: none;
        }
        
        .resizing * {
          cursor: col-resize !important;
          user-select: none;
        }
      `}</style>
    </div>
  );
};

export default MainLayout; 