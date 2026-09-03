import { Outlet } from "react-router-dom";
import AuthBrandPanel from "./AuthBrandPanel";

export default function AuthLayout() {
  return (
    <div className="h-dvh max-h-dvh w-full flex bg-bg text-ink font-sans overflow-hidden">
      <AuthBrandPanel />
      <Outlet />
    </div>
  );
}
