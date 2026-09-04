import { useMemo } from "react";
import { ShellSessionContext } from "./shellSessionContext";

export default function ShellSessionProvider({ value, children }) {
  const session = useMemo(
    () => ({
      user: value?.user ?? null,
      signOut: value?.signOut ?? (async () => {}),
      signOutAll: value?.signOutAll ?? (async () => {}),
    }),
    [value]
  );

  return <ShellSessionContext.Provider value={session}>{children}</ShellSessionContext.Provider>;
}
