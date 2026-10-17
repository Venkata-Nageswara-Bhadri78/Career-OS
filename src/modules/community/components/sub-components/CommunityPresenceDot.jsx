export default function CommunityPresenceDot({ status }) {
  if (status !== "online" && status !== "offline") return null;
  const online = status === "online";
  return (
    <span
      className={`absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border border-white ${online ? "bg-emerald-600" : "bg-zinc-400"}`}
      aria-label={online ? "Online" : "Offline"}
    />
  );
}
