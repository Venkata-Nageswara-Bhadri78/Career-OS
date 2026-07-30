import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authApi from "../../api/authApi";
import Spinner from "../loaders/Spinner";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    setError(null); // clear error when user types
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await authApi.login({ email: formData.email, password: formData.password });
      // On success, you'd navigate to the main app dashboard.
      // Assuming "/" handles auth redirect properly, or going to a protected route:
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Invalid credentials or login failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm p-6 rounded-2xl bg-white/60 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Welcome Back</h2>
        <p className="text-sm text-zinc-500 mt-1">Please enter your details to sign in.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl">
            {error}
          </div>
        )}

        <div className="flex flex-col">
          <label htmlFor="email" className="text-xs font-medium text-zinc-600 mb-1.5 ml-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
            className="px-3.5 py-2.5 text-sm rounded-xl bg-zinc-200/50 border-2 border-transparent hover:bg-zinc-200/80 focus:bg-white focus:border-black/20 outline-none transition-all placeholder:text-zinc-400 text-black"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="password" className="text-xs font-medium text-zinc-600 mb-1.5 ml-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
            className="px-3.5 py-2.5 text-sm rounded-xl bg-zinc-200/50 border-2 border-transparent hover:bg-zinc-200/80 focus:bg-white focus:border-black/20 outline-none transition-all placeholder:text-zinc-400 text-black"
          />
        </div>

        {/* Remember Me & Forgot Password Row */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input 
              type="checkbox" 
              className="w-4 h-4 rounded-sm accent-black bg-zinc-200/50 border-transparent cursor-pointer"
            />
            <span className="text-xs font-medium text-zinc-600 select-none">Remember me</span>
          </label>

          <Link to="/forgot-password" className="text-xs font-medium text-zinc-500 hover:text-black transition-colors">
            Forgot Password?
          </Link>
        </div>

        {/* Action button */}
        <button 
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2.5 mt-4 rounded-xl bg-black text-white font-semibold text-sm shadow-sm hover:bg-zinc-800 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? <Spinner /> : "Log In"}
        </button>

        <div className="text-center text-xs text-zinc-500 mt-5">
          Don't have an account? 
          <Link to="/register" className="font-semibold text-black ml-1.5 hover:underline transition-all">
            Sign up
          </Link>
        </div>
      </form>
    </div>
  );
}

export default Login;