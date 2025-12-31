"use client";

import React, { useState } from "react";
import {
  User,
  Building2,
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  UserCircle,
  Briefcase,
  MapPin,
  FileText,
  Brain,
  LogIn,
  UserPlus,
  Menu,
  X,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

export default function SignUp() {
  const [step, setStep] = useState("role");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const [applicantForm, setApplicantForm] = useState({
    fullName: "",
    nameWithInitials: "",
    birthday: "",
    gender: "",
    contactNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [companyForm, setCompanyForm] = useState({
    companyName: "",
    industry: "",
    registrationNumber: "",
    branchLocation: "",
    email: "",
    contactNumber: "",
    password: "",
    confirmPassword: "",
  });

  const sriLankanDistricts = [
    "Ampara",
    "Anuradhapura",
    "Badulla",
    "Batticaloa",
    "Colombo",
    "Galle",
    "Gampaha",
    "Hambantota",
    "Jaffna",
    "Kalutara",
    "Kandy",
    "Kegalle",
    "Kilinochchi",
    "Kurunegala",
    "Mannar",
    "Matale",
    "Matara",
    "Monaragala",
    "Mullaitivu",
    "Nuwara Eliya",
    "Polonnaruwa",
    "Puttalam",
    "Ratnapura",
    "Trincomalee",
    "Vavuniya",
  ];

  // --- VALIDATION HELPERS ---
  const validateAge = (birthday) => {
    const today = new Date();
    const birthDate = new Date(birthday);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      return age - 1 >= 16;
    }
    return age >= 16;
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateSriLankanPhone = (phone) =>
    /^(?:\+94|0)(?:7[0-9]|[1-9][0-9])\d{7}$/.test(phone.replace(/\s/g, ""));

  const validatePassword = (password) => password.length >= 8;

  // --- HANDLERS ---
  const handleApplicantChange = (e) => {
    const { name, value } = e.target;
    setApplicantForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleCompanyChange = (e) => {
    const { name, value } = e.target;
    setCompanyForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleGoBack = () => {
    setStep("role");
    setErrors({});
  };

  // --- SUBMIT APPLICANT (UPDATED WITH BACKEND CONNECTION) ---
  const handleApplicantSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!applicantForm.birthday) newErrors.birthday = "Birthday is required";
    else if (!validateAge(applicantForm.birthday))
      newErrors.birthday = "You must be at least 16 years old";

    if (!applicantForm.email) newErrors.email = "Email is required";
    else if (!validateEmail(applicantForm.email))
      newErrors.email = "Invalid email address";

    if (!applicantForm.contactNumber)
      newErrors.contactNumber = "Contact number is required";
    else if (!validateSriLankanPhone(applicantForm.contactNumber))
      newErrors.contactNumber = "Invalid Sri Lankan phone number";

    if (!applicantForm.password) newErrors.password = "Password is required";
    else if (!validatePassword(applicantForm.password))
      newErrors.password = "Password must be at least 8 characters";

    if (!applicantForm.confirmPassword)
      newErrors.confirmPassword = "Please confirm your password";
    else if (applicantForm.password !== applicantForm.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "applicant",
          ...applicantForm,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Registration Successful! Please Login.");
        window.location.href = "/auth/login";
      } else {
        alert(data.error || "Registration failed");
      }
    } catch (error) {
      console.error(error);
      alert("Server connection failed. Is the backend running?");
    }
  };

  // --- SUBMIT COMPANY (UPDATED WITH BACKEND CONNECTION) ---
  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!companyForm.email) newErrors.email = "Email is required";
    else if (!validateEmail(companyForm.email))
      newErrors.email = "Invalid email address";

    if (!companyForm.contactNumber)
      newErrors.contactNumber = "Contact number is required";
    else if (!validateSriLankanPhone(companyForm.contactNumber))
      newErrors.contactNumber = "Invalid Sri Lankan phone number";

    if (!companyForm.password) newErrors.password = "Password is required";
    else if (!validatePassword(companyForm.password))
      newErrors.password = "Password must be at least 8 characters";

    if (!companyForm.confirmPassword)
      newErrors.confirmPassword = "Please confirm your password";
    else if (companyForm.password !== companyForm.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "company",
          ...companyForm,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Company Registration Successful! Please Login.");
        window.location.href = "/auth/login";
      } else {
        alert(data.error || "Registration failed");
      }
    } catch (error) {
      console.error(error);
      alert("Server connection failed. Is the backend running?");
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

      <main className="pt-24 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          {step === "role" && (
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 sm:p-12">
              <div className="text-center mb-10">
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
                  Choose Your{" "}
                  <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                    Role
                  </span>
                </h1>
                <p className="text-gray-300">
                  Select how you want to join our platform
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <button
                  onClick={() => setStep("applicant")}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 p-8 hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-300"
                >
                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Applicant
                    </h3>
                    <p className="text-sm text-gray-300">
                      Looking for your dream job
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => setStep("company")}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 p-8 hover:from-cyan-500/30 hover:to-blue-500/30 transition-all duration-300"
                >
                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mx-auto mb-4">
                      <Building2 className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Company
                    </h3>
                    <p className="text-sm text-gray-300">
                      Hiring talented individuals
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {step === "applicant" && (
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 sm:p-12">
              <div className="flex items-center justify-between mb-8">
                <button
                  onClick={handleGoBack}
                  className="inline-flex items-center gap-2 text-purple-300 hover:text-purple-200 transition"
                >
                  <ArrowLeft className="w-4 h-4" />{" "}
                  <span className="text-sm">Go Back</span>
                </button>
                <div className="flex items-center gap-2 text-purple-300">
                  <User className="w-5 h-5" />{" "}
                  <span className="text-sm font-medium">Applicant</span>
                </div>
              </div>

              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  Create Your Account
                </h2>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={applicantForm.fullName}
                    onChange={handleApplicantChange}
                    placeholder="John Doe"
                    className="w-full rounded-2xl bg-slate-900/60 border border-white/10 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/60"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Name with Initials
                  </label>
                  <input
                    type="text"
                    name="nameWithInitials"
                    value={applicantForm.nameWithInitials}
                    onChange={handleApplicantChange}
                    placeholder="J.D. Doe"
                    className="w-full rounded-2xl bg-slate-900/60 border border-white/10 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/60"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Birthday
                  </label>
                  <input
                    type="date"
                    name="birthday"
                    value={applicantForm.birthday}
                    onChange={handleApplicantChange}
                    className={`w-full rounded-2xl bg-slate-900/60 border ${
                      errors.birthday ? "border-red-500" : "border-white/10"
                    } px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/60`}
                  />
                  {errors.birthday && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.birthday}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={applicantForm.gender}
                    onChange={handleApplicantChange}
                    className="w-full rounded-2xl bg-slate-900/60 border border-white/10 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/60"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={applicantForm.contactNumber}
                    onChange={handleApplicantChange}
                    placeholder="+94 77 123 4567"
                    className={`w-full rounded-2xl bg-slate-900/60 border ${
                      errors.contactNumber
                        ? "border-red-500"
                        : "border-white/10"
                    } px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/60`}
                  />
                  {errors.contactNumber && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.contactNumber}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={applicantForm.email}
                    onChange={handleApplicantChange}
                    placeholder="you@example.com"
                    className={`w-full rounded-2xl bg-slate-900/60 border ${
                      errors.email ? "border-red-500" : "border-white/10"
                    } px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/60`}
                  />
                  {errors.email && (
                    <p className="text-red-400 text-xs mt-1">{errors.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={applicantForm.password}
                      onChange={handleApplicantChange}
                      className={`w-full rounded-2xl bg-slate-900/60 border ${
                        errors.password ? "border-red-500" : "border-white/10"
                      } px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/60`}
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
                    <p className="text-red-400 text-xs mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={applicantForm.confirmPassword}
                      onChange={handleApplicantChange}
                      className={`w-full rounded-2xl bg-slate-900/60 border ${
                        errors.confirmPassword
                          ? "border-red-500"
                          : "border-white/10"
                      } px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/60`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <button
                  onClick={handleApplicantSubmit}
                  className="w-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3.5 font-semibold text-white shadow-lg shadow-purple-700/20 hover:shadow-purple-600/30 transition mt-6"
                >
                  Submit
                </button>
              </div>
            </div>
          )}

          {step === "company" && (
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 sm:p-12">
              <div className="flex items-center justify-between mb-8">
                <button
                  onClick={handleGoBack}
                  className="inline-flex items-center gap-2 text-cyan-300 hover:text-cyan-200 transition"
                >
                  <ArrowLeft className="w-4 h-4" />{" "}
                  <span className="text-sm">Go Back</span>
                </button>
                <div className="flex items-center gap-2 text-cyan-300">
                  <Building2 className="w-5 h-5" />{" "}
                  <span className="text-sm font-medium">Company</span>
                </div>
              </div>

              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  Register Your Company
                </h2>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={companyForm.companyName}
                    onChange={handleCompanyChange}
                    placeholder="Tech Corp Ltd."
                    className="w-full rounded-2xl bg-slate-900/60 border border-white/10 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/60"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Industry
                  </label>
                  <select
                    name="industry"
                    value={companyForm.industry}
                    onChange={handleCompanyChange}
                    className="w-full rounded-2xl bg-slate-900/60 border border-white/10 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/60"
                  >
                    <option value="">Select Industry</option>
                    <option value="IT">IT</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Business">Business</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Business Registration Number
                  </label>
                  <input
                    type="text"
                    name="registrationNumber"
                    value={companyForm.registrationNumber}
                    onChange={handleCompanyChange}
                    placeholder="PV 12345"
                    className="w-full rounded-2xl bg-slate-900/60 border border-white/10 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/60"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Branch Location
                  </label>
                  <select
                    name="branchLocation"
                    value={companyForm.branchLocation}
                    onChange={handleCompanyChange}
                    className="w-full rounded-2xl bg-slate-900/60 border border-white/10 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/60"
                  >
                    <option value="">Select District</option>
                    {sriLankanDistricts.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={companyForm.email}
                    onChange={handleCompanyChange}
                    placeholder="company@example.com"
                    className={`w-full rounded-2xl bg-slate-900/60 border ${
                      errors.email ? "border-red-500" : "border-white/10"
                    } px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/60`}
                  />
                  {errors.email && (
                    <p className="text-red-400 text-xs mt-1">{errors.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={companyForm.contactNumber}
                    onChange={handleCompanyChange}
                    placeholder="+94 11 234 5678"
                    className={`w-full rounded-2xl bg-slate-900/60 border ${
                      errors.contactNumber
                        ? "border-red-500"
                        : "border-white/10"
                    } px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/60`}
                  />
                  {errors.contactNumber && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.contactNumber}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Create Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={companyForm.password}
                      onChange={handleCompanyChange}
                      className={`w-full rounded-2xl bg-slate-900/60 border ${
                        errors.password ? "border-red-500" : "border-white/10"
                      } px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/60`}
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
                    <p className="text-red-400 text-xs mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={companyForm.confirmPassword}
                      onChange={handleCompanyChange}
                      className={`w-full rounded-2xl bg-slate-900/60 border ${
                        errors.confirmPassword
                          ? "border-red-500"
                          : "border-white/10"
                      } px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/60`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <button
                  onClick={handleCompanySubmit}
                  className="w-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3.5 font-semibold text-white shadow-lg shadow-cyan-700/20 hover:shadow-cyan-600/30 transition mt-6"
                >
                  Submit
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
