import { useContext } from "react";
import { ShellSessionContext } from "./shellSessionContext";

export function useShellSession() {
  const context = useContext(ShellSessionContext);
  if (!context) {
    throw new Error("useShellSession must be used within ShellSessionProvider.");
  }
  return context;
}
