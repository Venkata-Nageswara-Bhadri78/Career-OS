import { useCallback, useMemo, useState } from "react";
import { CommunityListSlotContext } from "../../hooks/communityListContext";

const EMPTY_SLOT = {
  communities: [],
  status: "idle",
  isLoading: false,
  error: "",
  currentCommunityId: null,
  selectCommunity: () => {},
  retry: () => {},
  refresh: () => {},
  activate: () => {},
};

export default function CommunityListSlotProvider({ children }) {
  const [slot, setSlotState] = useState(EMPTY_SLOT);

  const setSlot = useCallback((next) => {
    setSlotState((prev) => ({ ...EMPTY_SLOT, ...prev, ...next }));
  }, []);

  const value = useMemo(() => ({ slot, setSlot }), [slot, setSlot]);

  return <CommunityListSlotContext.Provider value={value}>{children}</CommunityListSlotContext.Provider>;
}
