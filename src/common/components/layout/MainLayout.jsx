import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex flex-col h-screen bg-zinc-100 font-sans text-black overflow-hidden p-1 gap-1">
      {/* Top Navbar (Full Width) */}
      <div className="shrink-0 w-full rounded-xl border border-zinc-200 bg-white/80 backdrop-blur-xl shadow-sm overflow-hidden z-30">
        <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen} />
      </div>
      
      {/* Bottom Area: Sidebar + Main Content */}
      <div className="flex flex-1 min-h-0 overflow-hidden gap-1 relative">
        {isSidebarOpen && <Sidebar />}
        <main className="flex-1 min-w-0 overflow-auto bg-white rounded-xl border border-zinc-200 shadow-sm relative flex flex-col">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
