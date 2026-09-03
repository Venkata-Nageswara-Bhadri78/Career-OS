import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AUTH_PATHS } from "../../../modules/auth/config/authConfig";
import { useAuth } from "../../../modules/auth/hooks/useAuth";
import ChatSidebar from "../../../modules/chat-assistant/components/main-components/ChatSidebar";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [chatHistoryOpen, setChatHistoryOpen] = useState(false);

  const match = location.pathname.match(/\/jobs\/(\d+)\/interact/);
  const currentJobId = match ? parseInt(match[1], 10) : null;

  const handleLogout = async () => {
    try {
      await signOut();
    } finally {
      navigate(AUTH_PATHS.LOGIN, { replace: true });
    }
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: DashboardIcon },
    { name: "AI Assistant", path: "/ai", icon: AIIcon },
  ];

  return (
    <aside className="w-56 flex flex-col bg-white border border-zinc-200 rounded-xl shadow-sm z-20 h-full overflow-hidden shrink-0 relative group">
      {/* Navigation */}
      <nav className="flex-1 overflow-hidden p-2 flex flex-col gap-1">
        <div>
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-1 ${
                  isActive
                    ? "bg-zinc-100 text-black shadow-sm"
                    : "text-zinc-500 hover:text-black hover:bg-zinc-50"
                }`}
              >
                <item.icon className={`h-4 w-4 ${isActive ? "text-black" : "text-zinc-400"}`} />
                {item.name}
              </Link>
            );
          })}

          <button
            onClick={() => setChatHistoryOpen(!chatHistoryOpen)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              chatHistoryOpen || location.pathname.includes("/interact")
                ? "bg-zinc-100 text-black shadow-sm"
                : "text-zinc-500 hover:text-black hover:bg-zinc-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <ChatIcon className={`h-4 w-4 ${chatHistoryOpen || location.pathname.includes("/interact") ? "text-black" : "text-zinc-400"}`} />
              Chat History
            </div>
            <svg 
              className={`h-4 w-4 transition-transform ${chatHistoryOpen ? "rotate-180" : ""}`} 
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Expandable Chat History Section */}
        {chatHistoryOpen && (
          <div className="flex-1 overflow-y-auto mt-2 -mx-2 px-2">
            <ChatSidebar 
              currentJobId={currentJobId}
              onSelectJob={(jobId) => navigate(`/jobs/${jobId}/interact`)}
              onChatDeleted={(jobId) => {
                if (currentJobId === jobId) {
                  navigate('/dashboard');
                }
              }}
            />
          </div>
        )}
      </nav>

      {/* Footer / Logout */}
      <div className="p-2 border-t border-zinc-200/80 space-y-0.5 shrink-0">
        <button
          type="button"
          onClick={() => navigate(AUTH_PATHS.SETTINGS)}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium text-zinc-500 hover:text-black hover:bg-zinc-50 transition-all"
        >
          <SettingsIcon className="h-3.5 w-3.5 text-zinc-400" />
          Settings
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-all"
        >
          <LogoutIcon className="h-3.5 w-3.5" />
          Logout
        </button>
      </div>
    </aside>
  );
}

function DashboardIcon(props) {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}

function AIIcon(props) {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

function ChatIcon(props) {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    </svg>
  );
}

function SettingsIcon(props) {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function LogoutIcon(props) {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}
