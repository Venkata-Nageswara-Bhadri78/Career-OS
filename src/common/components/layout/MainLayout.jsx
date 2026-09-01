import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function MainLayout() {
  return (
    <div className="flex h-screen bg-zinc-100 font-sans text-black overflow-hidden">
      {/* Sidebar on the left */}
      <Sidebar />
      
      {/* Main content area containing Navbar and Outlet */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
