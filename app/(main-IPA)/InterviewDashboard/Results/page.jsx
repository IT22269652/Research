"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, FileQuestion, Calendar, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ResultsIndexPage() {
  const router = useRouter();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      const res = await fetch('/api/interview');
      const data = await res.json();
      if (data.success) {
        setInterviews(data.interviews || []);
      }
    } catch (error) {
      console.error("Error fetching interviews:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-500" />
          <p className="text-gray-400">Loading interview results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-5 mb-8">
          <ArrowLeft 
            onClick={() => router.back()} 
            className='cursor-pointer text-gray-300 hover:text-white transition-colors' 
          />
          <h1 className="text-3xl font-bold text-gray-100">Interview Results</h1>
        </div>

        {interviews.length === 0 ? (
          <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-12 border border-slate-700/50 text-center">
            <FileQuestion className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-300 mb-2">No Interview Results Yet</h2>
            <p className="text-gray-400 mb-6">Create your first interview to see results here</p>
            <Button 
              onClick={() => router.push('/InterviewDashboard/CreateInterview')}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Create New Interview
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {interviews.map((interview) => (
              <div 
                key={interview._id}
                className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-purple-500/30 transition-all cursor-pointer"
                onClick={() => router.push(`/InterviewDashboard/Results/${interview._id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Briefcase className="w-5 h-5 text-purple-400" />
                      <h3 className="text-xl font-semibold text-gray-200">{interview.jobPosition}</h3>
                    </div>
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">{interview.jobDescription}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-500">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        {new Date(interview.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-gray-500">
                        {interview.questionCount} questions
                      </span>
                      {interview.interviewType && interview.interviewType.length > 0 && (
                        <span className="text-purple-400">
                          {interview.interviewType.join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                  <ArrowLeft className="w-5 h-5 text-gray-500 rotate-180" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}