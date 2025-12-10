// app/resume-builder/cover-letter/create/page.jsx
"use client";

import { useState } from "react";
import { Loader2, Sparkles, User, Building } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CoverLetterCreatePage() {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);

  const [formData, setFormData] = useState({
    personalInfo: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
    },
    jobInfo: {
      companyName: "",
      jobTitle: "",
      hiringManager: "",
      jobDescription: "",
    },
  });

  // Input handlers
  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [name]: value }
    }));
  };

  const handleJobChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      jobInfo: { ...prev.jobInfo, [name]: value }
    }));
  };

  const handleGenerate = async () => {
  // Validation
  if (!formData.personalInfo.fullName.trim()) return alert("Full Name required!");
  if (!formData.jobInfo.companyName.trim()) return alert("Company Name required!");
  if (!formData.jobInfo.jobTitle.trim()) return alert("Job Title required!");
  if (formData.jobInfo.jobDescription.trim().length < 50) return alert("Job Description too short!");

  setGenerating(true);

  try {
    const res = await fetch("/api/generate-cover-letter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("API Error:", errorText);
      throw new Error("Server error: " + res.status);
    }

    const data = await res.json();

    if (data.id) {
      router.push(`/resume-builder/cover-letter/edit/${data.id}`);
    }
  } catch (err) {
    console.error("Generation failed:", err);
    alert("Generation failed. Please check the API route path.");
  } finally {
    setGenerating(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-5xl font-bold text-white text-center mb-12">Generate New Cover Letter</h1>

        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-10">
          {/* Personal Info */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <User className="w-8 h-8" /> Your Information
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <input
                type="text"
                name="fullName"
                value={formData.personalInfo.fullName}
                onChange={handlePersonalChange}
                placeholder="Full Name *"
                className="px-6 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 transition"
              />
              <input
                type="email"
                name="email"
                value={formData.personalInfo.email}
                onChange={handlePersonalChange}
                placeholder="Email"
                className="px-6 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 transition"
              />
              <input
                type="tel"
                name="phone"
                value={formData.personalInfo.phone}
                onChange={handlePersonalChange}
                placeholder="Phone"
                className="px-6 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 transition"
              />
              <input
                type="text"
                name="address"
                value={formData.personalInfo.address}
                onChange={handlePersonalChange}
                placeholder="Address (Optional)"
                className="px-6 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 transition"
              />
            </div>
          </div>

          {/* Job Info */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Building className="w-8 h-8" /> Job Details
            </h2>
            <div className="space-y-6">
              <input
                type="text"
                name="companyName"
                value={formData.jobInfo.companyName}
                onChange={handleJobChange}
                placeholder="Company Name *"
                className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 transition"
              />
              <input
                type="text"
                name="jobTitle"
                value={formData.jobInfo.jobTitle}
                onChange={handleJobChange}
                placeholder="Job Title *"
                className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 transition"
              />
              <input
                type="text"
                name="hiringManager"
                value={formData.jobInfo.hiringManager}
                onChange={handleJobChange}
                placeholder="Hiring Manager (Optional)"
                className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 transition"
              />
              <textarea
                name="jobDescription"
                value={formData.jobInfo.jobDescription}
                onChange={handleJobChange}
                placeholder="Paste the full Job Description here... *"
                rows={8}
                className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 transition resize-none font-mono text-sm"
              />
            </div>
          </div>

          {/* Generate Button */}
          <div className="text-center pt-8">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-2xl px-24 py-8 rounded-full shadow-2xl flex items-center gap-6 mx-auto disabled:opacity-70 transition-all hover:scale-105"
            >
              {generating ? (
                <>
                  <Loader2 className="w-12 h-12 animate-spin" />
                  Generating Your Cover Letter...
                </>
              ) : (
                <>
                  <Sparkles className="w-12 h-12" />
                  Generate Cover Letter
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}