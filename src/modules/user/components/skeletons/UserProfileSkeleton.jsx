export default function UserProfileSkeleton() {
  return (
    <div className="user-service mx-auto w-full max-w-6xl animate-pulse space-y-5 p-4 sm:p-6 lg:p-8" aria-busy="true" aria-label="Loading profile">
      <div className="h-80 rounded-2xl border border-line bg-field/70" />
      <div className="h-44 rounded-2xl bg-field" />
      <div className="h-56 rounded-2xl bg-field" />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="h-80 rounded-2xl bg-field" />
        <div className="h-80 rounded-2xl bg-field" />
      </div>
    </div>
  );
}
