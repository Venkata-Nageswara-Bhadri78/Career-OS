import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { MOBILE_MEDIA_QUERY } from "../../config/shellConfig";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import "../../styles/shell.css";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function MainLayout() {
  const isMobile = useMediaQuery(MOBILE_MEDIA_QUERY);
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => !window.matchMedia(MOBILE_MEDIA_QUERY).matches);
  const [viewportIsMobile, setViewportIsMobile] = useState(isMobile);
  const [seenPath, setSeenPath] = useState(location.pathname);

  if (viewportIsMobile !== isMobile) {
    setViewportIsMobile(isMobile);
    setIsSidebarOpen(!isMobile);
  }

  if (seenPath !== location.pathname) {
    setSeenPath(location.pathname);
    if (isMobile) setIsSidebarOpen(false);
  }

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="career-shell flex flex-col h-screen bg-field font-sans text-ink overflow-hidden p-1 gap-1">
      <div className="shrink-0 w-full rounded-xl border border-line bg-white/90 backdrop-blur-xl shadow-sm overflow-hidden z-30">
        <Navbar
          onToggleSidebar={() => setIsSidebarOpen((open) => !open)}
          isSidebarOpen={isSidebarOpen}
        />
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden gap-1 relative">
        {isMobile ? (
          <button
            type="button"
            aria-label="Close sidebar"
            tabIndex={isSidebarOpen ? 0 : -1}
            className={`shell-sidebar-backdrop ${isSidebarOpen ? "is-visible" : ""}`}
            onClick={closeSidebar}
          />
        ) : null}
        <Sidebar open={isSidebarOpen} onClose={closeSidebar} />
        <main className="flex-1 min-w-0 overflow-auto bg-white rounded-xl border border-line shadow-sm relative flex flex-col">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
