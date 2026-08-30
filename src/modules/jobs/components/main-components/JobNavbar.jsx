import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authApi from "../../../AuthService/api/authApi";

export default function JobNavbar({ onOpenAddModal, search, onSearchChange }) {
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
    <header className="sticky top-0 z-30 w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-black flex items-center justify-center text-white font-bold text-sm shadow-xs">
            C
          </div>
          <div>
            <span className="font-bold text-sm text-zinc-900 tracking-tight block leading-tight">Career OS</span>
            <span className="text-[10px] text-zinc-400 font-medium">Job Management</span>
          </div>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-3">
          <div className="relative w-48 sm:w-64">
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search jobs, skills, companies..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-zinc-100/90 border border-transparent focus:border-zinc-300 focus:bg-white focus:outline-none transition-all placeholder:text-zinc-400 text-zinc-900"
            />
            <svg
              className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <button
            type="button"
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-black text-white hover:bg-zinc-800 active:scale-[0.98] transition-all shadow-xs shrink-0"
          >
            <span className="text-sm leading-none">+</span>
            <span>Add Job</span>
          </button>

          {/* User Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              title="User Profile"
              className="p-1.5 rounded-xl border border-zinc-200 text-zinc-500 hover:text-black hover:bg-zinc-100 transition-colors focus:outline-none"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      </div>
    </header>
  );
}
