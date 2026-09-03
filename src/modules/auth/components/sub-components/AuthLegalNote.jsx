import { Link } from "react-router-dom";

export default function AuthLegalNote() {
  return (
    <p className="text-[11px] leading-4 text-muted break-words">
      By creating an account, you agree to our{" "}
      <Link to="/terms" className="font-semibold text-ink underline underline-offset-2">
        Terms
      </Link>{" "}
      and{" "}
      <Link to="/privacy" className="font-semibold text-ink underline underline-offset-2">
        Privacy Policy
      </Link>
      .
    </p>
  );
}
