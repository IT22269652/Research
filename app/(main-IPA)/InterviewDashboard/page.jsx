"use client";
import React, { useState, useEffect } from "react";
import { Video, View, Calendar, Clock, Users, ArrowRight, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function Dashboard() {
  const router = useRouter();
  const [interviewList, setInterviewList] = useState([]);
  const [scheduledInterviews, setScheduledInterviews] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchScheduledInterviews();
  }, []);

  const fetchScheduledInterviews = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/scheduled-interview');
      const data = await res.json();
      if (data.success) {
        // Get only the first 3 interviews for dashboard preview
        setScheduledInterviews(data.interviews?.slice(0, 3) || []);
      }
    } catch (error) {
      console.error("Error fetching scheduled interviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'scheduled':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen p-6">
      {/* Dashboard Title */}
      <h2 className="text-2xl font-bold text-gray-200 mb-6">Dashboard</h2>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Create New Interview */}
        <Link href={'InterviewDashboard/CreateInterview'} className="group bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-xl hover:bg-slate-800/60 hover:border-purple-500/30 transition-all duration-300 cursor-pointer">
          <div className="flex flex-col items-start">
            <div className="w-16 h-16 bg-blue-600/20 border border-blue-500/30 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600/30 group-hover:scale-110 transition-all duration-300">
              <Video className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-100 mb-2 group-hover:text-white transition-colors">
              Create New Interview
            </h3>
            <p className="text-gray-400 text-base leading-relaxed">
              Create AI Interviews and schedule them with Candidates
            </p>
          </div>
        </Link>

        {/* View All Interviews */}
        <Link href={'InterviewDashboard/ScheduledInterview'} className="group bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-xl hover:bg-slate-800/60 hover:border-purple-500/30 transition-all duration-300 cursor-pointer">
          <div className="flex flex-col items-start">
            <div className="w-16 h-16 bg-purple-600/20 border border-purple-500/30 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-600/30 group-hover:scale-110 transition-all duration-300">
              <View className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-100 mb-2 group-hover:text-white transition-colors">
              View All Interviews
            </h3>
            <p className="text-gray-400 text-base leading-relaxed">
              Schedule and previous interviews
            </p>
          </div>
        </Link>
      </div>

      {/* Scheduled Interviews Section - Only show if there are interviews */}
      {!loading && scheduledInterviews.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-200">
              Scheduled Interviews
            </h2>
            <div className="flex gap-3">
              <Link 
                href={'InterviewDashboard/CreateInterview'}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Plus className="w-4 h-4" />
                Create Interview
              </Link>
              <Link 
                href={'InterviewDashboard/ScheduledInterview'}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                See All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-xl">
            <div className="overflow-x-auto">
              {/* Table Header - Horizontal Titles */}
              <div className="grid grid-cols-6 gap-4 pb-4 border-b border-slate-700/50 mb-4 min-w-[800px]">
                <div className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                  Interview Title
                </div>
                <div className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                  Candidate Name
                </div>
                <div className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                  Email
                </div>
                <div className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                  Date
                </div>
                <div className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                  Time
                </div>
                <div className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                  Status
                </div>
              </div>

              {/* Table Body - Vertical Data */}
              <div className="space-y-3">
                {scheduledInterviews.map((interview) => (
                  <div 
                    key={interview._id}
                    className="grid grid-cols-6 gap-4 items-center bg-slate-900/50 border border-slate-700/50 rounded-lg p-4 hover:border-purple-500/30 transition-all duration-300 min-w-[800px]"
                  >
                    {/* Interview Title */}
                    <div className="text-sm text-gray-100 font-medium">
                      {interview.title}
                    </div>

                    {/* Candidate Name */}
                    <div className="text-sm text-gray-200">
                      {interview.candidateName}
                    </div>

                    {/* Email */}
                    <div className="text-xs text-gray-400 truncate">
                      {interview.candidateEmail}
                    </div>

                    {/* Date */}
                    <div className="text-sm text-gray-200">
                      {formatDate(interview.date)}
                    </div>

                    {/* Time */}
                    <div className="text-sm text-gray-200">
                      {formatTime(interview.time)}
                      <span className="text-xs text-gray-500 block">
                        {interview.duration} min
                      </span>
                    </div>

                    {/* Status */}
                    <div>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full border inline-block ${getStatusColor(interview.status)}`}>
                        {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Previously Created Interviews - Only show when no scheduled interviews */}
      {!loading && scheduledInterviews.length === 0 && (
        <>
          <h2 className="text-2xl font-bold text-gray-200 mb-6">
            Previously Created Interviews
          </h2>

          <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-12 shadow-xl flex flex-col items-center text-center">
            {interviewList?.length === 0 ? (
              <>
                <div className="w-20 h-20 bg-blue-600/20 border border-blue-500/30 rounded-2xl flex items-center justify-center mb-6">
                  <Video className="h-10 w-10 text-blue-400" />
                </div>
                <p className="text-gray-300 text-base mb-6">
                  You don't have any interview created!
                </p>
                <Link href={'InterviewDashboard/CreateInterview'} className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-xl text-base font-semibold shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-all duration-300 transform hover:scale-105">
                  + Create New Interview
                </Link>
              </>
            ) : (
              <div>{/* Map interviews here later */}</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;