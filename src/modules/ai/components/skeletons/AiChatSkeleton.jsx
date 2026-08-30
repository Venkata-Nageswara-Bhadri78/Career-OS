export default function AiChatSkeleton() {
  return (
    <div className="w-full flex-1 flex flex-col p-4 sm:p-6 space-y-6 animate-pulse">
      {/* Job Context Skeleton */}
      <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-xs flex items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-4 w-48 bg-zinc-200 rounded-md" />
          <div className="h-3 w-32 bg-zinc-100 rounded-md" />
        </div>
        <div className="h-7 w-24 bg-zinc-200 rounded-xl" />
      </div>

      {/* Messages Skeleton */}
      <div className="flex-1 rounded-2xl bg-white border border-zinc-200 shadow-xs p-6 space-y-6">
        {/* Assistant Bubble */}
        <div className="flex gap-3 items-start">
          <div className="h-7 w-7 rounded-xl bg-zinc-200 shrink-0" />
          <div className="space-y-2 max-w-lg w-full">
            <div className="h-4 w-3/4 bg-zinc-200 rounded-md" />
            <div className="h-4 w-full bg-zinc-100 rounded-md" />
            <div className="h-4 w-5/6 bg-zinc-100 rounded-md" />
          </div>
        </div>

        {/* User Bubble */}
        <div className="flex justify-end">
          <div className="h-10 w-64 bg-zinc-300 rounded-2xl rounded-br-xs" />
        </div>

        {/* Assistant Response Bubble */}
        <div className="flex gap-3 items-start">
          <div className="h-7 w-7 rounded-xl bg-zinc-200 shrink-0" />
          <div className="space-y-2 max-w-xl w-full">
            <div className="h-4 w-2/3 bg-zinc-200 rounded-md" />
            <div className="h-4 w-full bg-zinc-100 rounded-md" />
            <div className="h-4 w-4/5 bg-zinc-100 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
