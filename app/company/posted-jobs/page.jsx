'use client';

import React, { useEffect, useState } from 'react';
import CompanySidebar from '../../components/CompanySidebar'; // Adjust path
import { Briefcase, FileText, Calendar, Trash2 } from 'lucide-react';

export default function PostedJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch jobs when the component loads
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch('/api/jobs');
        const data = await res.json();
        if (data.success) {
          setJobs(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex">
      {/* Sidebar */}
      <CompanySidebar />

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Posted Jobs
            </h1>
            <a href="/company/add-job" className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm transition">
              + Post New Job
            </a>
          </div>

          {loading ? (
            <div className="text-center py-20 text-gray-400">Loading jobs...</div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-20 bg-slate-800/50 rounded-3xl border border-white/10">
              <Briefcase className="w-16 h-16 mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400 text-lg">No jobs posted yet.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {jobs.map((job) => (
                <div
                  key={job._id}
                  className="bg-slate-800/60 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-lg hover:border-purple-500/30 transition-all group"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-bold text-white mb-2">{job.title}</h2>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                        {job.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                        </div>
                        {job.fileName && (
                          <div className="flex items-center gap-1 text-purple-400">
                            <FileText className="w-4 h-4" />
                            <a href={job.fileData} download={job.fileName} className="hover:underline">
                              Download Attachment
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <button className="text-gray-500 hover:text-red-400 p-2 rounded-full hover:bg-white/5 transition">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}