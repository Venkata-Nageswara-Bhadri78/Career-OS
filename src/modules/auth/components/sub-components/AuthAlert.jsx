export default function AuthAlert({ tone = "danger", children }) {
  if (!children) return null;
  const styles =
    tone === "success"
      ? "border-success/20 bg-success/8 text-success"
      : "border-danger/20 bg-danger/8 text-danger";

  return (
    <div role={tone === "success" ? "status" : "alert"} className={`rounded-lg border px-3 py-2 text-xs leading-5 ${styles}`}>
      {children}
    </div>
  );
}
