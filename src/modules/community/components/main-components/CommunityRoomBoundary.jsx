import { Component } from "react";
import { Link } from "react-router-dom";
import { APP_PATHS } from "../../../../common/config/appPaths";
import CommunityStatusPanel from "../sub-components/CommunityStatusPanel";

export default class CommunityRoomBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    console.warn("community room render failed");
  }

  render() {
    if (this.state.failed) {
      return (
        <CommunityStatusPanel title="Community" message="This room could not be shown." alert>
          <Link
            to={APP_PATHS.COMMUNITY}
            className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-ink px-4 text-sm font-semibold text-white"
          >
            Back to Jobs Community
          </Link>
        </CommunityStatusPanel>
      );
    }
    return this.props.children;
  }
}
