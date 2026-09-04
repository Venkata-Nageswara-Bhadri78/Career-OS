import { useEffect, useId, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { APP_PATHS } from "../../config/appPaths";
import { SHELL_BRAND } from "../../config/shellConfig";
import { useShellSession } from "../../session/useShellSession";
import { getDisplayName, getNameInitial } from "../../utils/identity";
import { ChevronIcon, MenuIcon } from "./ShellIcons";

export default function Navbar({ onToggleSidebar, isSidebarOpen }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { user, signOut } = useShellSession();
  const menuId = useId();
  const displayName = getDisplayName(user);
  const initial = getNameInitial(user);

  useEffect(() => {
    const onPointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const go = (path) => {
    setIsMenuOpen(false);
    navigate(path);
  };

  const handleLogout = async () => {
    setIsMenuOpen(false);
    try {
      await signOut();
    } finally {
      navigate(APP_PATHS.LOGIN, { replace: true });
    }
  };

  return (
    <header className="w-full h-16 flex items-center justify-between px-3 sm:px-5 bg-transparent">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-controls="workspace-sidebar"
          aria-expanded={Boolean(isSidebarOpen)}
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          className="p-2 -ml-1 rounded-xl text-muted hover:text-ink hover:bg-field transition-colors"
        >
          <MenuIcon className="w-5 h-5" />
        </button>
        <div className="h-8 w-8 bg-ink text-white font-bold text-sm shrink-0 grid place-items-center" aria-hidden="true">
          {SHELL_BRAND.letter}
        </div>
        <div className="min-w-0">
          <span className="font-bold text-sm text-ink tracking-tight block leading-tight truncate">{SHELL_BRAND.name}</span>
          <span className="text-[10px] text-muted font-medium hidden sm:block">{SHELL_BRAND.tagline}</span>
        </div>
      </div>

      <div className="relative shrink-0" ref={menuRef}>
        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-haspopup="menu"
          aria-expanded={isMenuOpen}
          aria-controls={menuId}
          className={`flex items-center gap-2 pl-1 pr-2 py-1 rounded-full border transition-colors ${
            isMenuOpen ? "border-accent bg-field" : "border-line hover:bg-field"
          }`}
        >
          <span className="h-8 w-8 rounded-full bg-ink text-white text-sm font-semibold grid place-items-center">
            {initial}
          </span>
          <span className="hidden sm:block text-xs font-semibold text-ink max-w-[140px] truncate">{displayName}</span>
          <ChevronIcon className={`h-4 w-4 text-muted transition-transform ${isMenuOpen ? "rotate-180" : ""}`} />
        </button>

        {isMenuOpen ? (
          <div
            id={menuId}
            role="menu"
            aria-label="Account"
            className="absolute right-0 mt-2 w-48 bg-white border border-line rounded-xl shadow-lg py-1 z-50"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => go(APP_PATHS.PROFILE)}
              className="w-full text-left px-4 py-2 text-sm text-ink/80 hover:bg-field hover:text-ink transition-colors"
            >
              Profile
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => go(APP_PATHS.SETTINGS)}
              className="w-full text-left px-4 py-2 text-sm text-ink/80 hover:bg-field hover:text-ink transition-colors"
            >
              Settings
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-red-50 transition-colors"
            >
              Logout
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
