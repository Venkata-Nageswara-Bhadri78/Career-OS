import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authApi from "../../api/authApi";
import Spinner from "../loaders/Spinner";

function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      await authApi.register({
        username: formData.username,
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password
      });
      // Backend requires email verification via OTP, so redirect to verify email
      navigate("/verify-email", { state: { email: formData.email } });
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm p-6 rounded-2xl bg-white/60 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <div className="mb-5">
        <h2 className="text-2xl font-bold tracking-tight">Create Account</h2>
        <p className="text-sm text-zinc-500 mt-1">Join us today to get started.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl">
            {error}
          </div>
        )}

        <div className="flex flex-col">
          <label htmlFor="username" className="text-xs font-medium text-zinc-600 mb-1 ml-1">
            Username
          </label>
          <input
            id="username"
            type="text"
            name="username"
            placeholder="Enter username"
            value={formData.username}
            onChange={handleChange}
            required
            className="px-3.5 py-2 text-sm rounded-xl bg-zinc-200/50 border-2 border-transparent hover:bg-zinc-200/80 focus:bg-white focus:border-black/20 outline-none transition-all placeholder:text-zinc-400 text-black"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="fullName" className="text-xs font-medium text-zinc-600 mb-1 ml-1">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            name="fullName"
            placeholder="Enter full name"
            value={formData.fullName}
            onChange={handleChange}
            required
            className="px-3.5 py-2 text-sm rounded-xl bg-zinc-200/50 border-2 border-transparent hover:bg-zinc-200/80 focus:bg-white focus:border-black/20 outline-none transition-all placeholder:text-zinc-400 text-black"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="email" className="text-xs font-medium text-zinc-600 mb-1 ml-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="Enter email"
            value={formData.email}
            onChange={handleChange}
            required
            className="px-3.5 py-2 text-sm rounded-xl bg-zinc-200/50 border-2 border-transparent hover:bg-zinc-200/80 focus:bg-white focus:border-black/20 outline-none transition-all placeholder:text-zinc-400 text-black"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="password" className="text-xs font-medium text-zinc-600 mb-1 ml-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            name="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={handleChange}
            required
            className="px-3.5 py-2 text-sm rounded-xl bg-zinc-200/50 border-2 border-transparent hover:bg-zinc-200/80 focus:bg-white focus:border-black/20 outline-none transition-all placeholder:text-zinc-400 text-black"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="confirmPassword" className="text-xs font-medium text-zinc-600 mb-1 ml-1">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            name="confirmPassword"
            placeholder="Confirm password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="px-3.5 py-2 text-sm rounded-xl bg-zinc-200/50 border-2 border-transparent hover:bg-zinc-200/80 focus:bg-white focus:border-black/20 outline-none transition-all placeholder:text-zinc-400 text-black"
          />
        </div>

        <button 
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2.5 mt-2 rounded-xl bg-black text-white font-semibold text-sm shadow-sm hover:bg-zinc-800 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? <Spinner /> : "Sign Up"}
        </button>

        <div className="text-center text-xs text-zinc-500 mt-4">
          Already have an account? 
          <Link to="/login" className="font-semibold text-black ml-1.5 hover:underline transition-all">
            Log in
          </Link>
        </div>
      </form>
    </div>
  );
}

export default SignUp;