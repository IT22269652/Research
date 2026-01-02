"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FileText, ArrowLeft, Search, Filter, Calendar, Briefcase, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AllInterviewPage() {
  const router = useRouter();
  const [interviews, setInterviews] = useState([]);
  const [filteredInterviews, setFilteredInterviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllInterviews();
  }, []);

  useEffect(() => {
    filterInterviews();
  }, [searchTerm, filterType, interviews]);

  const fetchAllInterviews = async () => {
    try {
      const res = await fetch('/api/interview');
      const data = await res.json();
      if (data.success) {
        setInterviews(data.interviews || []);
        setFilteredInterviews(data.interviews || []);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterInterviews = () => {
    let filtered = [...interviews];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(interview => 
        interview.jobPosition?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interview.jobDescription?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (filterType !== "all") {
      filtered = filtered.filter(interview => 
        interview.interviewType?.includes(filterType)
      );
    }

    setFilteredInterviews(filtered);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this interview?")) return;

    try {
      const res = await fetch(`/api/interview/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        fetchAllInterviews();
      }
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  const getStatusBadge = (interview) => {
    const daysSinceCreated = Math.floor((new Date() - new Date(interview.createdAt)) / (1000 * 60 * 60 * 24));
    
    if (daysSinceCreated === 0) {
      return <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-400">New</span>;
    } else if (daysSinceCreated < 7) {
      return <span className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-400">Recent</span>;
    } else {
      return <span className="px-2 py-1 text-xs rounded-full bg-gray-500/20 text-gray-400">Archived</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading interviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-5 mb-8">
          <ArrowLeft 
            onClick={() => router.back()} 
            className='cursor-pointer text-gray-300 hover:text-white transition-colors' 
          />
          <h1 className="text-3xl font-bold text-gray-100">All Interviews</h1>
          <span className="px-3 py-1 bg-purple-600/20 text-purple-400 rounded-full text-sm">
            {filteredInterviews.length} total
          </span>
        </div>

        {/* Filters */}
        <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 mb-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
              <Input 
                placeholder="Search by job position or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-900/50 border-slate-600 text-gray-100"
              />
            </div>
            <div className="w-64">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="bg-slate-900/50 border-slate-600 text-gray-100">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Technical">Technical</SelectItem>
                  <SelectItem value="Behavioral">Behavioral</SelectItem>
                  <SelectItem value="Experience">Experience</SelectItem>
                  <SelectItem value="Problem Solving">Problem Solving</SelectItem>
                  <SelectItem value="Leadership">Leadership</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Interview List */}
        {filteredInterviews.length === 0 ? (
          <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-12 border border-slate-700/50 text-center">
            <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-300 mb-2">
              {searchTerm || filterType !== "all" ? "No interviews match your filters" : "No Interviews Yet"}
            </h2>
            <p className="text-gray-400 mb-6">
              {searchTerm || filterType !== "all" ? "Try adjusting your search criteria" : "Create your first interview to get started"}
            </p>
            {!searchTerm && filterType === "all" && (
              <Button 
                onClick={() => router.push('/InterviewDashboard/CreateInterview')}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Create Interview
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredInterviews.map((interview) => (
              <div 
                key={interview._id}
                className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-purple-500/30 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Briefcase className="w-5 h-5 text-purple-400" />
                      <h3 className="text-xl font-semibold text-gray-200">{interview.jobPosition}</h3>
                      {getStatusBadge(interview)}
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">{interview.jobDescription}</p>
                    
                    <div className="flex items-center gap-4 text-sm flex-wrap">
                      <div className="flex items-center gap-1 text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(interview.createdAt).toLocaleDateString()}</span>
                      </div>
                      <span className="text-gray-500">
                        {interview.questionCount} questions
                      </span>
                      {interview.interviewType && interview.interviewType.length > 0 && (
                        <div className="flex gap-2">
                          {interview.interviewType.map((type, idx) => (
                            <span key={idx} className="px-2 py-1 bg-purple-600/20 text-purple-400 rounded-md text-xs">
                              {type}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => router.push(`/InterviewDashboard/Results/${interview._id}`)}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(interview._id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}