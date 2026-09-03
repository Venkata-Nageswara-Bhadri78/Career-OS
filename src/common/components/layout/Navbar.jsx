import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AUTH_PATHS } from "../../../modules/auth/config/authConfig";
import { useAuth } from "../../../modules/auth/hooks/useAuth";

export default function Navbar({ onToggleSidebar }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

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
      await signOut();
    } finally {
      navigate(AUTH_PATHS.LOGIN, { replace: true });
    }
  };

  const displayName = user?.fullName || user?.username || "Account";

  return (
    <header className="w-full h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-transparent">
      <div className="flex items-center gap-3">
        {onToggleSidebar ? (
          <button
            type="button"
            onClick={onToggleSidebar}
            title="Toggle Sidebar"
            className="p-2 -ml-2 rounded-xl border border-transparent text-zinc-500 hover:text-ink hover:bg-zinc-100 transition-colors focus:outline-none shrink-0"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        ) : null}
        <div className="h-8 w-8 bg-ink flex items-center justify-center text-white font-bold text-sm shrink-0">C</div>
        <div className="ml-1">
          <span className="font-bold text-sm text-ink tracking-tight block leading-tight">Career OS</span>
          <span className="text-[10px] text-muted font-medium">Job Management</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            title={displayName}
            aria-haspopup="menu"
            aria-expanded={isDropdownOpen}
            className="flex items-center gap-2 p-2 rounded-xl border border-line text-zinc-500 hover:text-ink hover:bg-zinc-100 transition-colors focus:outline-none"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span className="hidden sm:block text-xs font-semibold text-ink max-w-[140px] truncate">{displayName}</span>
          </button>

          {isDropdownOpen ? (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-line rounded-xl shadow-lg py-1 z-50" role="menu">
              <button
                type="button"
                onClick={() => {
                  setIsDropdownOpen(false);
                  navigate("/profile");
                }}
                className="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 hover:text-ink transition-colors"
              >
                User Profile
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsDropdownOpen(false);
                  navigate(AUTH_PATHS.SETTINGS);
                }}
                className="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 hover:text-ink transition-colors"
              >
                Settings
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsDropdownOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-red-50 transition-colors"
              >
                Logout
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
