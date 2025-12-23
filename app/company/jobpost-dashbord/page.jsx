'use client';

import React from 'react';
import { Building2, Users, FileText, Briefcase, BarChart3, Settings, LogOut } from 'lucide-react';
import { useNavigate } from "react-router-dom";

export default function CompanyDashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Sidebar */}
      <div className="flex">
        <aside className="w-72 h-screen bg-slate-900/80 backdrop-blur-lg border-r border-purple-500/20 p-6 hidden md:block">
          <div className="flex items-center space-x-2 mb-10">
            <Building2 className="w-8 h-8 text-purple-400" />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Company Panel
            </span>
          </div>

          <nav className="space-y-4">
            <a className="flex items-center space-x-3 text-gray-300 hover:text-purple-400 transition cursor-pointer">
              <BarChart3 className="w-5 h-5" />
              <span>Dashboard Overview</span>
            </a>

            <a className="flex items-center space-x-3 text-gray-300 hover:text-purple-400 transition cursor-pointer">
              <Briefcase className="w-5 h-5" />
              <span>Posted Jobs</span>
            </a>

            <a className="flex items-center space-x-3 text-gray-300 hover:text-purple-400 transition cursor-pointer">
              <Users className="w-5 h-5" />
              <span>Applicants</span>
            </a>

            <a className="flex items-center space-x-3 text-gray-300 hover:text-purple-400 transition cursor-pointer">
              <FileText className="w-5 h-5" />
              <span>Upload Job Description</span>
            </a>

            <a className="flex items-center space-x-3 text-gray-300 hover:text-purple-400 transition cursor-pointer">
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </a>

            <a className="flex items-center space-x-3 text-red-400 hover:text-red-500 transition cursor-pointer mt-10">
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </a>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Welcome to Your Company Dashboard
          </h1>

          <p className="text-gray-300 mb-10">
            Manage job postings, track applicants, and analyze hiring insights.
          </p>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-lg border border-white/10 p-6 rounded-2xl hover:bg-white/20 transition">
              <Briefcase className="w-10 h-10 text-purple-300 mb-3" />
              <div className="text-3xl font-bold">12</div>
              <div className="text-gray-300">Active Job Posts</div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg border border-white/10 p-6 rounded-2xl hover:bg-white/20 transition">
              <Users className="w-10 h-10 text-purple-300 mb-3" />
              <div className="text-3xl font-bold">248</div>
              <div className="text-gray-300">Total Applicants</div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg border border-white/10 p-6 rounded-2xl hover:bg-white/20 transition">
              <BarChart3 className="w-10 h-10 text-purple-300 mb-3" />
              <div className="text-3xl font-bold">89%</div>
              <div className="text-gray-300">Match Accuracy</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-12 bg-white/10 backdrop-blur-lg border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-4 text-purple-300">Quick Actions</h2>

            <button
              onClick={() => navigate("/post-job")}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition"
            >
              + Post New Job
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
