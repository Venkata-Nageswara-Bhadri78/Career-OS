export default function CustomPromptsSkeleton() {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      aria-busy="true"
      aria-live="polite"
    >
      {Array.from({ length: 6 }, (_, index) => (
        <div
          key={index}
          className="min-h-[220px] rounded-2xl border border-line bg-white p-5 animate-pulse"
        >
          <div className="h-5 w-2/3 rounded-md bg-field" />
          <div className="mt-2 h-3 w-24 rounded-md bg-field" />
          <div className="mt-5 space-y-2">
            <div className="h-4 w-full rounded-md bg-field" />
            <div className="h-4 w-11/12 rounded-md bg-field" />
            <div className="h-4 w-4/5 rounded-md bg-field" />
          </div>
          <div className="mt-8 flex gap-2">
            <div className="h-8 w-20 rounded-full bg-field" />
            <div className="h-8 w-20 rounded-full bg-field" />
          </div>
        </div>
      ))}
    </div>
  );
}
