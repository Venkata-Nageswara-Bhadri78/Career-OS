import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function MainLayout() {
  return (
    <div className="flex h-screen bg-zinc-100 font-sans text-black overflow-hidden p-4 gap-4">
      {/* Sidebar on the left as an independent card */}
      <Sidebar />
      
      {/* Right side containing independent Navbar and Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden gap-4">
        <div className="shrink-0 w-full rounded-2xl border border-zinc-200 bg-white/80 backdrop-blur-xl shadow-sm overflow-hidden z-30">
          <Navbar />
        </div>
        <main className="flex-1 min-w-0 overflow-auto bg-white rounded-2xl border border-zinc-200 shadow-sm relative flex flex-col">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
