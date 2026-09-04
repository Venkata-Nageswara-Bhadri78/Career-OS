import { registerSessionBridge } from "../../../common/api/sessionBridge";
import { isAuthPublicEndpoint } from "./authEndpoints";
import { endSession, refreshSession } from "./authSession";
import { getAuthorizationHeader } from "./tokenStorage";

registerSessionBridge({
  getAuthorizationHeader,
  refreshSession,
  endSession,
  isPublicEndpoint: isAuthPublicEndpoint,
});
