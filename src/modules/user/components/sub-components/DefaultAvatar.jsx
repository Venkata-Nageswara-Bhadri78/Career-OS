import defaultAvatar from "../../assets/default-avatar.svg";

export default function DefaultAvatar({ className = "h-full w-full" }) {
  return (
    <img
      src={defaultAvatar}
      alt=""
      className={`${className} object-cover`}
      draggable="false"
    />
  );
}
