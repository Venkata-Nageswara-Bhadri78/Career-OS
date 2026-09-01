import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import authApi from "../../api/authApi";
import Spinner from "../loaders/Spinner";

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await authApi.resetPassword({ token, newPassword: password });
      setMessage("Password reset successfully. You can now log in.");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.message || "Failed to reset password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm p-6 rounded-2xl bg-white/60 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Reset Password</h2>
        <p className="text-sm text-zinc-500 mt-1">Please enter your new password.</p>
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
          <label htmlFor="password" className="text-xs font-medium text-zinc-600 mb-1.5 ml-1">
            New Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(null); }}
            required
            className="px-3.5 py-2.5 text-sm rounded-xl bg-zinc-200/50 border-2 border-transparent hover:bg-zinc-200/80 focus:bg-white focus:border-black/20 outline-none transition-all placeholder:text-zinc-400 text-black"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="confirmPassword" className="text-xs font-medium text-zinc-600 mb-1.5 ml-1">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setError(null); }}
            required
            className="px-3.5 py-2.5 text-sm rounded-xl bg-zinc-200/50 border-2 border-transparent hover:bg-zinc-200/80 focus:bg-white focus:border-black/20 outline-none transition-all placeholder:text-zinc-400 text-black"
          />
        </div>

        <button 
          type="submit"
          disabled={isLoading || message}
          className="w-full flex justify-center py-2.5 mt-4 rounded-xl bg-black text-white font-semibold text-sm shadow-sm hover:bg-zinc-800 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? <Spinner /> : "Reset Password"}
        </button>

        <div className="text-center text-xs text-zinc-500 mt-5">
          Remember your password? 
          <Link to="/login" className="font-semibold text-black ml-1.5 hover:underline transition-all">
            Log in
          </Link>
        </div>
      </form>
    </div>
  );
}

export default ResetPassword;
