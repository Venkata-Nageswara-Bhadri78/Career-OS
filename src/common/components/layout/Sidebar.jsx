import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { APP_PATHS } from "../../config/appPaths";
import { SHELL_NAV_ITEMS, isNavItemActive } from "../../config/shellConfig";
import { useShellSession } from "../../session/useShellSession";
import ChatHistoryPanel from "./ChatHistoryPanel";
import { useChatHistorySlot } from "./chatHistoryContext";
import { AIIcon, CloseIcon, DashboardIcon, LogoutIcon, ProfileIcon, SettingsIcon } from "./ShellIcons";

const NAV_ICONS = {
  dashboard: DashboardIcon,
  ai: AIIcon,
  profile: ProfileIcon,
};

export default function Sidebar({ open, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useShellSession();
  const history = useChatHistorySlot();
  const [busy, setBusy] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(true);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const handleLogout = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await signOut();
    } finally {
      navigate(APP_PATHS.LOGIN, { replace: true });
    }
  };

  return (
    <aside
      id="workspace-sidebar"
      className={`shell-sidebar flex flex-col bg-white border border-line rounded-xl shadow-sm z-30 h-full overflow-hidden shrink-0 ${
        open ? "is-open" : "is-closed"
      }`}
      aria-label="Workspace navigation"
      aria-hidden={!open}
      inert={!open || undefined}
    >
      <div className="shell-sidebar-inner h-full flex flex-col min-h-0">
        <div className="flex items-center justify-between px-4 h-12 shrink-0">
          <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-muted">Menu</p>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 -mr-1 rounded-lg text-muted hover:text-ink hover:bg-field transition-colors"
            aria-label="Close sidebar"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <nav className="px-2 pb-2 shrink-0" aria-label="Primary">
          {SHELL_NAV_ITEMS.map((item) => {
            const Icon = NAV_ICONS[item.icon];
            const active = isNavItemActive(item, location.pathname);
            return (
              <Link
                key={item.id}
                to={item.path}
                tabIndex={open ? 0 : -1}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors mb-0.5 ${
                  active ? "bg-field text-ink shadow-[inset_2px_0_0_var(--theme-accent)]" : "text-muted hover:text-ink hover:bg-field/70"
                }`}
              >
                {Icon ? <Icon className={`h-4 w-4 ${active ? "text-ink" : "text-muted"}`} /> : null}
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="flex-1 min-h-0 px-2 pb-2 flex flex-col">
          <ChatHistoryPanel
            chats={history.chats}
            isLoading={history.isLoading}
            error={history.error}
            currentJobId={history.currentJobId}
            deletingId={history.deletingId}
            expanded={historyOpen}
            onToggle={() => setHistoryOpen((open) => !open)}
            onSelect={history.selectChat}
            onDelete={history.deleteChat}
            onRetry={history.retry}
          />
        </div>

        <div className="mt-auto p-2 border-t border-line space-y-0.5 shrink-0">
          <Link
            to={APP_PATHS.SETTINGS}
            tabIndex={open ? 0 : -1}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium text-muted hover:text-ink hover:bg-field transition-colors"
          >
            <SettingsIcon className="h-3.5 w-3.5" />
            Settings
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            disabled={busy}
            tabIndex={open ? 0 : -1}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium text-danger hover:bg-red-50 transition-colors disabled:opacity-60"
          >
            <LogoutIcon className="h-3.5 w-3.5" />
            {busy ? "Signing out…" : "Logout"}
          </button>
        </div>
      </div>
    </aside>
  );
}
