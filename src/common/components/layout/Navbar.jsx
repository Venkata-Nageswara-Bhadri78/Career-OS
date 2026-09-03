import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authApi from "../../../modules/auth/api/authApi";

export default function Navbar({ onToggleSidebar }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } finally {
      window.location.href = "/login";
    }
  };

  return (
    <header className="w-full h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-transparent">
      {/* Left side Brand and Sidebar Toggle */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            title="Toggle Sidebar"
            className="p-2 -ml-2 rounded-xl border border-transparent text-zinc-500 hover:text-black hover:bg-zinc-100 transition-colors focus:outline-none shrink-0"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <div className="h-8 w-8 rounded-xl bg-black flex items-center justify-center text-white font-bold text-sm shadow-xs shrink-0">
          C
        </div>
        <div className="ml-1">
          <span className="font-bold text-sm text-zinc-900 tracking-tight block leading-tight">Career OS</span>
          <span className="text-[10px] text-zinc-400 font-medium">Job Management</span>
        </div>
      </div>

      {/* Right side Actions */}
      <div className="flex items-center gap-3">
        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            title="User Profile"
            className="p-2 rounded-xl border border-zinc-200 text-zinc-500 hover:text-black hover:bg-zinc-100 transition-colors focus:outline-none"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-zinc-200 rounded-xl shadow-lg py-1 z-50">
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  navigate('/profile');
                }}
                className="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 hover:text-black transition-colors"
              >
                User Profile
              </button>
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
