"use client";

import React, { useState } from "react";
import { Mail, Lock, Brain, LogIn, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!loginForm.email) newErrors.email = "Email is required";
    else if (!validateEmail(loginForm.email))
      newErrors.email = "Invalid email address";

    if (!loginForm.password) newErrors.password = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });

      const data = await response.json();

      if (response.ok) {
        // Store session
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        alert(`Login Successful! Welcome ${data.user.name}`);

        // *** CHANGED: Redirect to HOME Page ***
        window.location.href = "/";
      } else {
        alert(data.error || "Login failed");
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("Server connection failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <nav className="fixed w-full bg-slate-900/80 backdrop-blur-lg z-50 border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => (window.location.href = "/")}
            >
              <Brain className="w-8 h-8 text-purple-400" />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                AI Career Guide
              </span>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-4 flex items-center justify-center min-h-screen">
        <div className="max-w-md w-full">
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 sm:p-12">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
                <LogIn className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                Welcome Back
              </h1>
              <p className="text-gray-300 text-sm">
                Login to access your account
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={loginForm.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className={`w-full rounded-2xl bg-slate-900/60 border ${
                      errors.email ? "border-red-500" : "border-white/10"
                    } pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/60`}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-400 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={loginForm.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full rounded-2xl bg-slate-900/60 border ${
                      errors.password ? "border-red-500" : "border-white/10"
                    } pl-12 pr-12 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/60`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              <button
                onClick={handleSubmit}
                className="w-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3.5 font-semibold text-white shadow-lg shadow-purple-700/20 hover:shadow-purple-600/30 transition mt-2"
              >
                Login
              </button>

              <div className="text-center text-sm text-gray-400">
                Don't have an account?{" "}
                <a
                  href="/auth/signup"
                  className="text-purple-400 hover:text-purple-300 font-semibold transition"
                >
                  Sign Up
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
