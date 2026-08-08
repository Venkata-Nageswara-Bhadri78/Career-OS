import authApi from "../../../AuthService/api/authApi";

export default function JobNavbar({ onOpenAddModal, search, onSearchChange }) {
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
