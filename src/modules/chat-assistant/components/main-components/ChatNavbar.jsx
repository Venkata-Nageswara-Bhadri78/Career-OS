import { useNavigate } from "react-router-dom";
import authApi from "../../../AuthService/api/authApi";

export default function ChatNavbar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } finally {
      window.location.href = "/login";
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div 
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity"
        >
          <div className="h-8 w-8 rounded-xl bg-black flex items-center justify-center text-white font-bold text-sm shadow-xs">
            C
          </div>
          <div>
            <span className="font-bold text-sm text-zinc-900 tracking-tight block leading-tight">Career OS</span>
            <span className="text-[10px] text-zinc-400 font-medium">Workspace</span>
          </div>
        </div>

        {/* Global Navigation & Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 hover:text-black transition-all shadow-xs"
          >
            <svg className="h-3.5 w-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Jobs Dashboard</span>
          </button>

          <div className="h-4 w-px bg-zinc-200 hidden sm:block" />

          {/* User Sign Out */}
          <button
            type="button"
            onClick={handleLogout}
            title="Sign Out"
            className="p-1.5 rounded-xl border border-zinc-200 text-zinc-500 hover:text-black hover:bg-zinc-100 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
