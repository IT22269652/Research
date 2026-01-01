"use client";

import React, { useEffect, useState } from "react";
import {
  Brain,
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  LogOut,
  Loader2,
  Save,
  X,
  Edit2,
} from "lucide-react";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/auth/login";
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/profile", {
        method: "GET",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setFormData(data);
      } else {
        localStorage.removeItem("token");
        window.location.href = "/auth/login";
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setIsSaving(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:5000/api/auth/profile", {
        method: "PUT",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setProfile(updatedUser);

        // Update local storage user name if it changed
        const storedUser = JSON.parse(localStorage.getItem("user"));
        const newName =
          updatedUser.role === "applicant"
            ? updatedUser.fullName
            : updatedUser.companyName;
        localStorage.setItem(
          "user",
          JSON.stringify({ ...storedUser, name: newName })
        );

        setIsEditing(false);
        alert("Profile updated successfully!");
      } else {
        alert("Failed to update profile.");
      }
    } catch (error) {
      alert("Server error.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/auth/login";
  };

  // Helper Component for Fields
  const renderField = (
    label,
    name,
    value,
    icon,
    type = "text",
    disabled = false
  ) => (
    <div className="flex items-center gap-4 bg-black/20 p-4 rounded-xl border border-white/5 transition hover:border-white/10">
      <div className="text-gray-400">{icon}</div>
      <div className="w-full">
        <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-semibold">
          {label}
        </p>
        {isEditing && !disabled ? (
          <input
            type={type}
            name={name}
            value={formData[name] || ""}
            onChange={handleInputChange}
            className="w-full bg-slate-800/80 border border-purple-500/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition shadow-inner"
          />
        ) : (
          <p className="text-gray-200 font-medium text-lg">
            {value || "Not set"}
          </p>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      <nav className="fixed w-full bg-slate-900/80 backdrop-blur-lg z-50 border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => (window.location.href = "/")}
            >
              <Brain className="w-8 h-8 text-purple-400" />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                My Profile
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-gray-400 hover:text-red-400 transition bg-white/5 px-4 py-2 rounded-full hover:bg-white/10"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-28 pb-12 px-4 max-w-5xl mx-auto">
        <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500"></div>

          {/* Header */}
          <div className="flex flex-col md:flex-row items-center gap-8 mb-10 pb-8 border-b border-white/10">
            <div
              className={`w-32 h-32 rounded-full flex items-center justify-center shadow-2xl ring-4 ring-white/5 ${
                profile.role === "applicant"
                  ? "bg-gradient-to-br from-purple-600 to-pink-600"
                  : "bg-gradient-to-br from-cyan-600 to-blue-600"
              }`}
            >
              {profile.role === "applicant" ? (
                <User className="w-16 h-16 text-white" />
              ) : (
                <Building2 className="w-16 h-16 text-white" />
              )}
            </div>

            <div className="text-center md:text-left flex-1">
              <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
                {profile.role === "applicant"
                  ? profile.fullName
                  : profile.companyName}
              </h1>
              <span
                className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide border ${
                  profile.role === "applicant"
                    ? "bg-purple-500/10 text-purple-300 border-purple-500/20"
                    : "bg-cyan-500/10 text-cyan-300 border-cyan-500/20"
                }`}
              >
                {profile.role} Account
              </span>
            </div>

            {/* Edit Controls */}
            <div className="flex flex-col gap-3 min-w-[160px]">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl transition font-semibold flex items-center justify-center gap-2 border border-white/5 shadow-lg hover:shadow-xl"
                >
                  <Edit2 className="w-4 h-4" /> Edit Profile
                </button>
              ) : (
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl transition font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-900/20"
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setFormData(profile); // Reset changes
                    }}
                    className="bg-red-500/10 text-red-400 hover:bg-red-500/20 px-6 py-2 rounded-xl transition flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <X className="w-4 h-4" /> Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Form Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white border-l-4 border-purple-500 pl-4">
                Contact Info
              </h2>

              {renderField(
                "Email Address",
                "email",
                profile.email,
                <Mail className="w-5 h-5" />,
                "email",
                true
              )}
              {renderField(
                "Phone Number",
                "contactNumber",
                profile.contactNumber,
                <Phone className="w-5 h-5" />
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <h2
                className={`text-xl font-bold text-white border-l-4 pl-4 ${
                  profile.role === "applicant"
                    ? "border-pink-500"
                    : "border-cyan-500"
                }`}
              >
                {profile.role === "applicant"
                  ? "Personal Details"
                  : "Company Details"}
              </h2>

              {profile.role === "applicant" ? (
                <>
                  {renderField(
                    "Full Name",
                    "fullName",
                    profile.fullName,
                    <User className="w-5 h-5" />
                  )}
                  {renderField(
                    "Name with Initials",
                    "nameWithInitials",
                    profile.nameWithInitials,
                    <User className="w-5 h-5" />
                  )}

                  <div className="flex items-center gap-4 bg-black/20 p-4 rounded-xl border border-white/5 transition hover:border-white/10">
                    <div className="text-gray-400">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div className="w-full">
                      <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-semibold">
                        Birthday
                      </p>
                      {isEditing ? (
                        <input
                          type="date"
                          name="birthday"
                          value={
                            formData.birthday
                              ? new Date(formData.birthday)
                                  .toISOString()
                                  .split("T")[0]
                              : ""
                          }
                          onChange={handleInputChange}
                          className="w-full bg-slate-800/80 border border-purple-500/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition shadow-inner"
                        />
                      ) : (
                        <p className="text-gray-200 font-medium text-lg">
                          {new Date(profile.birthday).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {renderField(
                    "Company Name",
                    "companyName",
                    profile.companyName,
                    <Building2 className="w-5 h-5" />
                  )}
                  {renderField(
                    "Industry",
                    "industry",
                    profile.industry,
                    <Building2 className="w-5 h-5" />
                  )}
                  {renderField(
                    "Branch Location",
                    "branchLocation",
                    profile.branchLocation,
                    <MapPin className="w-5 h-5" />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
