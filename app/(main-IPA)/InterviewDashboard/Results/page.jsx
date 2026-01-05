"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

// Component that handles the logic
function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const interviewId = searchParams.get('id');

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInterview = async () => {
      if (!interviewId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/interview/${interviewId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch interview');
        }
        
        const result = await response.json();
        console.log("Fetched interview data:", result); // Debug log
        setData(result);
        setError(null);
      } catch (err) {
        console.error("Error fetching interview:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInterview();
  }, [interviewId]);

  // Loading State
  if (loading) {
    return (
      <div>
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-300 mb-4" />
          <p className="text-white text-lg">Loading your Interview...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div>
        <div className="max-w-md w-full">
          <div className="bg-red-900/30 backdrop-blur-sm border border-red-600/20 rounded-2xl p-12 text-center">
            <h2 className="text-2xl font-bold text-white mb-3">Error Loading Interview</h2>
            <p className="text-red-200 mb-8">{error}</p>
            <Button 
              onClick={() => router.push('/InterviewDashboard/CreateInterview')}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              Create New Interview
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Questions Display - When interview data exists
  if (data && data.questions && data.questions.length > 0) {
    return (
      <div>
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button 
              onClick={() => router.push('/InterviewDashboard/CreateInterview')}
              className="text-white hover:text-purple-200 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-3xl font-bold text-white">Interview Questions</h1>
          </div>

          {/* Job Position Card */}
          <div className="bg-purple-800/40 backdrop-blur-sm border border-purple-600/30 rounded-xl p-6 mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              {data.jobPosition || "Full Stack Developer"}
            </h2>
            <p className="text-purple-200 text-sm">
              {data.jobExperience ? `${data.jobExperience} • ` : ""}
              {data.jobDesc || data.jobDescription || "Technical Interview"}
            </p>
            <div className="mt-4 flex gap-6 text-purple-300 text-sm">
              <div>
                <span className="font-semibold">Questions:</span> {data.questions.length}
              </div>
              {data.type && data.type.length > 0 && (
                <div>
                  <span className="font-semibold">Types:</span> {data.type.join(', ')}
                </div>
              )}
            </div>
          </div>

          {/* Questions Section */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-white mb-4">Questions</h3>
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            {data.questions.map((question, index) => (
              <div 
                key={index}
                className="bg-purple-800/30 backdrop-blur-sm border border-purple-600/20 rounded-lg p-6 hover:bg-purple-800/40 hover:border-purple-500/40 transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-600/50 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-base leading-relaxed">{question}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="mt-10 flex justify-center gap-4">
            <Button 
              onClick={() => router.push('/InterviewDashboard/CreateInterview')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Create Another Interview
            </Button>
            <Button 
              onClick={() => router.push('/InterviewDashboard/ScheduledInterview')}
              className="bg-white hover:bg-gray-100 text-purple-900 px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Start Interview
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Empty State - No interview ID or no data
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-8">
      <div className="max-w-md w-full">
        <div className="bg-purple-800/30 backdrop-blur-sm border border-purple-600/20 rounded-2xl p-12 text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-24 h-24 bg-purple-700/30 rounded-full flex items-center justify-center">
              <FileQuestion className="w-12 h-12 text-purple-300" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-3">No Interview Results Yet</h2>
          <p className="text-purple-200 mb-8 leading-relaxed">
            Create your first interview to see details here
          </p>
          
          <Button 
            onClick={() => router.push('/InterviewDashboard/CreateInterview')}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 rounded-lg font-medium transition-all duration-200 shadow-lg shadow-purple-500/30"
          >
            Create New Interview
          </Button>
        </div>
      </div>
    </div>
  );
}

// Main Page Component
export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-300 mb-4" />
          <div className="text-white text-lg">Loading...</div>
        </div>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}