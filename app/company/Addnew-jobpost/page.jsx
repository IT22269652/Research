'use client';

import React, { useState, useRef } from 'react';
import CompanySidebar from '../../components/CompanySidebar';

export default function AddNewJobPost() {
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', jobTitle);
    formData.append('description', jobDescription);
    if (file) formData.append('file', file);

    console.log('Form Data:', formData);
    alert('Job post submitted! (Check console for details)');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex">
      {/* Reusable Sidebar */}
      <CompanySidebar />

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 flex justify-center items-start">
        <form
          onSubmit={handleSubmit}
          className="bg-gradient-to-br from-slate-800/70 via-purple-900/60 to-slate-800/70 backdrop-blur-lg border border-purple-500/40 p-10 rounded-3xl w-full max-w-xl shadow-lg shadow-purple-900/50 space-y-6 transition-transform transform hover:scale-[1.02]"
        >
          <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Add New Job Post
          </h1>

          <div className="space-y-2">
            <label className="block text-gray-300 font-medium">Job Title</label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              required
              className="w-full p-3 rounded-xl bg-slate-700 border border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-400 text-white placeholder-gray-400 transition"
              placeholder="Enter job title"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-gray-300 font-medium">Job Description (Text)</label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              required
              className="w-full p-3 rounded-xl bg-slate-700 border border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-400 text-white placeholder-gray-400 transition"
              rows={5}
              placeholder="Enter job description"
            />
          </div>

          {/* Drag and Drop Section */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current.click()}
            className={`w-full p-6 rounded-xl border-2 border-dashed ${
              dragOver ? 'border-pink-400' : 'border-purple-500/50'
            } bg-slate-700 cursor-pointer text-center transition`}
          >
            {file ? (
              <p className="text-gray-300 italic">{file.name}</p>
            ) : (
              <p className="text-gray-400">
                Drag & drop a file here, or click to select (PDF or Image)
              </p>
            )}
            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf,image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-full font-bold text-white bg-gradient-to-r from-purple-500 to-pink-500 shadow-md shadow-pink-500/40 hover:shadow-lg hover:scale-105 transition-transform duration-200"
          >
            Submit Job Post
          </button>
        </form>
      </main>
    </div>
  );
}
