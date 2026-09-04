import { Route } from "react-router-dom";
import { APP_PATHS } from "../config/appPaths";
import LandingPage from "../pages/LandingPage";
import PrivacyPage from "../pages/PrivacyPage";
import SettingsPage from "../pages/SettingsPage";
import TermsPage from "../pages/TermsPage";

export function CommonPublicRoutes({ landingElement }) {
  return [
    <Route key="landing" path={APP_PATHS.LANDING} element={landingElement ?? <LandingPage />} />,
    <Route key="terms" path={APP_PATHS.TERMS} element={<TermsPage />} />,
    <Route key="privacy" path={APP_PATHS.PRIVACY} element={<PrivacyPage />} />,
  ];
}

export function CommonProtectedRoutes() {
  return <Route key="settings" path={APP_PATHS.SETTINGS} element={<SettingsPage />} />;
}
