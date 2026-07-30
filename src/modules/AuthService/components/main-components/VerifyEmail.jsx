import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import authApi from "../../api/authApi";
import Spinner from "../loaders/Spinner";

function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromState = location.state?.email || "";

  const [email, setEmail] = useState(emailFromState);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // If no email was passed via state, the user can type it in manually.
  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      await authApi.verifyEmail({ email, otp });
      setMessage("Email verified successfully! You can now log in.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.message || "Invalid or expired OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError("Please enter your email to resend OTP.");
      return;
    }
    setIsResending(true);
    setError(null);
    setMessage(null);

    try {
      await authApi.resendOtp({ email });
      setMessage("A new OTP has been sent to your email.");
    } catch (err) {
      setError(err.message || "Failed to resend OTP.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full max-w-sm p-6 rounded-2xl bg-white/60 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Verify Email</h2>
        <p className="text-sm text-zinc-500 mt-1">Enter the 6-digit code sent to your email.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl">
            {error}
          </div>
        )}
        {message && (
          <div className="p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl">
            {message}
          </div>
        )}

        <div className="flex flex-col">
          <label htmlFor="email" className="text-xs font-medium text-zinc-600 mb-1.5 ml-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(null); }}
            required
            readOnly={!!emailFromState}
            className={`px-3.5 py-2.5 text-sm rounded-xl border-2 border-transparent outline-none transition-all text-black ${
              emailFromState 
                ? "bg-zinc-100 text-zinc-500 cursor-not-allowed" 
                : "bg-zinc-200/50 hover:bg-zinc-200/80 focus:bg-white focus:border-black/20 placeholder:text-zinc-400"
            }`}
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="otp" className="text-xs font-medium text-zinc-600 mb-1.5 ml-1">
            One-Time Password (OTP)
          </label>
          <input
            id="otp"
            type="text"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => { setOtp(e.target.value); setError(null); }}
            required
            maxLength={6}
            className="px-3.5 py-2.5 text-sm tracking-widest text-center rounded-xl bg-zinc-200/50 border-2 border-transparent hover:bg-zinc-200/80 focus:bg-white focus:border-black/20 outline-none transition-all placeholder:text-zinc-400 text-black placeholder:tracking-normal"
          />
        </div>

        <button 
          type="submit"
          disabled={isLoading || isResending}
          className="w-full flex justify-center py-2.5 mt-4 rounded-xl bg-black text-white font-semibold text-sm shadow-sm hover:bg-zinc-800 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? <Spinner /> : "Verify Account"}
        </button>

        <div className="flex items-center justify-between mt-5 text-xs">
          <button 
            type="button" 
            onClick={handleResend}
            disabled={isResending || isLoading}
            className="font-semibold text-zinc-500 hover:text-black transition-colors disabled:opacity-50"
          >
            {isResending ? "Resending..." : "Resend OTP"}
          </button>
          
          <Link to="/login" className="font-semibold text-black hover:underline transition-all">
            Back to Login
          </Link>
        </div>
      </form>
    </div>
  );
}

export default VerifyEmail;
