import React from "react";
import { Outlet } from "react-router-dom";
import Info from "./Info";

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex w-full bg-zinc-100 font-sans text-black">
      {/* Left 60%: Info Panel */}
      <div className="hidden md:flex w-[60%] border-r border-zinc-200">
        <Info />
      </div>

      {/* Right 40%: Auth Forms via Outlet */}
      <div className="w-full md:w-[40%] flex items-center justify-center p-4">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
