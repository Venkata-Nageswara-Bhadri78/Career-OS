export default function UserProfileSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col p-6 max-w-7xl mx-auto w-full gap-6 animate-pulse">
      <div className="h-40 bg-zinc-200 rounded-2xl w-full"></div>
      <div className="flex gap-8">
        <div className="w-1/4 hidden md:block space-y-4">
            <div className="h-8 bg-zinc-200 rounded w-full"></div>
            <div className="h-8 bg-zinc-200 rounded w-5/6"></div>
            <div className="h-8 bg-zinc-200 rounded w-full"></div>
        </div>
        <div className="flex-1 space-y-8">
          <div className="h-32 bg-zinc-200 rounded-2xl w-full"></div>
          <div className="h-64 bg-zinc-200 rounded-2xl w-full"></div>
        </div>
      </div>
    </div>
  );
}
