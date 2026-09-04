export default function ChatSkeleton() {
  return (
    <div className="w-full flex-1 flex flex-col p-4 sm:p-6 space-y-6 animate-pulse" aria-busy="true" aria-live="polite">
      <div className="p-4 rounded-2xl bg-white border border-line flex items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-4 w-48 bg-field rounded-md" />
          <div className="h-3 w-32 bg-field rounded-md" />
        </div>
        <div className="h-7 w-24 bg-field rounded-xl" />
      </div>
      <div className="flex-1 rounded-2xl bg-white border border-line p-6 space-y-6">
        <div className="flex gap-3 items-start">
          <div className="h-7 w-7 rounded-xl bg-field shrink-0" />
          <div className="space-y-2 max-w-lg w-full">
            <div className="h-4 w-3/4 bg-field rounded-md" />
            <div className="h-4 w-full bg-field rounded-md" />
            <div className="h-4 w-5/6 bg-field rounded-md" />
          </div>
        </div>
        <div className="flex justify-end">
          <div className="h-10 w-64 bg-field rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
