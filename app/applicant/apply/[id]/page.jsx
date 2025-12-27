'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Building2, MapPin, Briefcase, DollarSign, Clock, 
  Calendar, UploadCloud, FileText, CheckCircle2, ArrowLeft, Loader2, AlertCircle
} from 'lucide-react';

export default function ApplyForJob() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // --- NEW: State to store ML Analysis Result ---
  const [analysisResult, setAnalysisResult] = useState(null);

  // Form State
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [cvFile, setCvFile] = useState(null);
  const fileInputRef = useRef(null);

  // 1. Fetch Job Details
  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const res = await fetch(`/api/jobs/${params.id}`);
        const data = await res.json();
        if (data.success) {
          setJob(data.data);
        }
      } catch (error) {
        console.error("Error fetching job:", error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) fetchJobDetails();
  }, [params.id]);

  // 2. Handle File Selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCvFile(e.target.files[0]);
    }
  };

  // 3. Submit Application & Trigger ML Model
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cvFile) return alert("Please upload your CV");
    
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("jobId", job._id);
    formData.append("jobTitle", job.jobTitle);
    formData.append("companyName", job.companyName);
    formData.append("applicantName", applicantName);
    formData.append("applicantEmail", applicantEmail);
    formData.append("cv", cvFile);
    
    // --- IMPORTANT: Send required skills for the Python Model to compare ---
    formData.append("requiredSkills", job.requiredSkills || ""); 

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        body: formData
      });
      
      const data = await res.json();

      if (res.ok) {
        // Instead of redirecting, show the analysis result
        setAnalysisResult(data.missingSkills || []); 
      } else {
        alert("Failed to submit application.");
      }
    } catch (error) {
      console.error(error);
      alert("Error submitting application.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- 4. Render Loading State ---
  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center text-white">
      <Loader2 className="w-10 h-10 animate-spin text-purple-400" />
    </div>
  );

  // --- 5. Render Error State ---
  if (!job) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center text-white">
      Job not found
    </div>
  );

  // --- 6. Render ML Analysis Result (Report Card) ---
  if (analysisResult !== null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6 text-white">
        <div className="bg-slate-800/80 backdrop-blur-xl p-8 rounded-3xl max-w-lg w-full border border-white/10 shadow-2xl animate-in zoom-in-95 duration-300">
          
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
              <CheckCircle2 className="w-10 h-10 text-green-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Application Sent!</h2>
            <p className="text-gray-300">Your CV has been successfully submitted to {job.companyName}.</p>
          </div>

          <div className="bg-slate-900/60 p-6 rounded-2xl border border-white/10 mb-8">
            <h3 className="font-semibold mb-4 flex items-center gap-2 text-lg">
              <span className="text-purple-400">AI Skill Analysis</span>
            </h3>
            
            {analysisResult.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-green-400 font-medium text-lg">Perfect Match!</p>
                <p className="text-sm text-gray-400">Your CV contains all the required skills mentioned in the job description.</p>
              </div>
            ) : (
              <div>
                <div className="flex items-start gap-2 mb-3 text-amber-300 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">
                    Our AI noticed your CV might be missing the following keywords. Consider adding them if you have these skills!
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-4">
                  {analysisResult.map((skill, i) => (
                    <span key={i} className="px-3 py-1.5 bg-red-500/10 text-red-300 border border-red-500/20 rounded-lg text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={() => router.push('/applicant/jobs')}
            className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg hover:shadow-purple-500/30 hover:scale-[1.02] transition-all"
          >
            Back to Job Board
          </button>
        </div>
      </div>
    );
  }

  // --- 7. Render Main Application Form ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        
        <button onClick={() => router.back()} className="flex items-center text-gray-300 hover:text-white mb-6 transition group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Jobs
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: Job Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-800/60 backdrop-blur-md p-8 rounded-3xl border border-white/10 shadow-xl">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{job.jobTitle}</h1>
                  <div className="flex items-center gap-2 text-purple-300 font-medium">
                    <Building2 className="w-5 h-5" /> {job.companyName}
                  </div>
                </div>
                {job.postingDate && (
                  <span className="bg-white/10 text-gray-300 px-3 py-1 rounded-full text-xs border border-white/10">
                    Posted: {new Date(job.postingDate).toLocaleDateString()}
                  </span>
                )}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-3 mb-8">
                <span className="bg-blue-500/20 text-blue-200 border border-blue-500/30 px-3 py-1 rounded-lg text-sm flex items-center gap-1.5"><MapPin className="w-4 h-4"/>{job.workLocation}</span>
                <span className="bg-purple-500/20 text-purple-200 border border-purple-500/30 px-3 py-1 rounded-lg text-sm flex items-center gap-1.5"><Briefcase className="w-4 h-4"/>{job.employmentType}</span>
                <span className="bg-green-500/20 text-green-200 border border-green-500/30 px-3 py-1 rounded-lg text-sm flex items-center gap-1.5"><DollarSign className="w-4 h-4"/>{job.salaryRange || 'Competitive'}</span>
              </div>

              {/* Description */}
              <div className="prose prose-invert max-w-none text-gray-300">
                <h3 className="text-xl font-semibold text-white mb-3 border-b border-white/10 pb-2">Job Description</h3>
                <p className="whitespace-pre-wrap leading-relaxed">{job.jobDescription}</p>
                
                <h3 className="text-xl font-semibold text-white mt-8 mb-3 border-b border-white/10 pb-2">Requirements</h3>
                <p className="whitespace-pre-wrap leading-relaxed">{job.requiredQualifications}</p>
              </div>
            </div>
          </div>

          {/* RIGHT: Application Form */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/80 backdrop-blur-lg border border-purple-500/30 p-6 rounded-3xl sticky top-6 shadow-2xl">
              <h2 className="text-xl font-bold mb-1 text-white">Apply Now</h2>
              <p className="text-sm text-gray-400 mb-6">Send your application to {job.companyName}</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm text-gray-300 mb-1 block">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-3 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition text-white placeholder-gray-500"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-300 mb-1 block">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={applicantEmail}
                    onChange={(e) => setApplicantEmail(e.target.value)}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-3 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition text-white placeholder-gray-500"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-300 mb-1 block">Upload CV (PDF)</label>
                  <div 
                    onClick={() => fileInputRef.current.click()}
                    className="border-2 border-dashed border-white/20 bg-slate-900/30 rounded-xl p-6 text-center cursor-pointer hover:border-purple-500/50 hover:bg-purple-500/5 transition group"
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept=".pdf" 
                      onChange={handleFileChange}
                    />
                    {cvFile ? (
                      <div className="text-purple-300 flex flex-col items-center animate-in fade-in zoom-in duration-200">
                        <FileText className="w-8 h-8 mb-2" />
                        <span className="text-sm font-medium break-all">{cvFile.name}</span>
                        <span className="text-xs text-purple-400 mt-1">Click to change</span>
                      </div>
                    ) : (
                      <div className="text-gray-400 group-hover:text-gray-200 flex flex-col items-center transition-colors">
                        <UploadCloud className="w-8 h-8 mb-2" />
                        <span className="text-sm">Click to upload CV</span>
                      </div>
                    )}
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                >
                  {isSubmitting ? (
                    <><Loader2 className="animate-spin w-5 h-5" /> Analyzing CV...</>
                  ) : (
                    <>Submit Application <CheckCircle2 className="w-5 h-5" /></>
                  )}
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}