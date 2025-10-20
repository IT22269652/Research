'use client';

import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Download, Save, Loader2, PenTool, FileText, Target, User, Building, Briefcase } from 'lucide-react';
import Link from 'next/link';

export default function CoverLetterGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('form');
  
  const [formData, setFormData] = useState({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      address: ''
    },
    jobInfo: {
      companyName: '',
      jobTitle: '',
      jobDescription: '',
      hiringManager: '',
      companyAddress: ''
    },
    content: {
      opening: '',
      body: '',
      closing: ''
    },
    coverLetter: ''
  });

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const generateCoverLetter = async () => {
    setIsGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      const generatedLetter = `Dear ${formData.jobInfo.hiringManager || 'Hiring Manager'},

I am writing to express my strong interest in the ${formData.jobInfo.jobTitle} position at ${formData.jobInfo.companyName}. With my background in [relevant field] and passion for [relevant area], I am excited about the opportunity to contribute to your team.

${formData.content.opening || 'Your opening paragraph will be generated here based on your input.'}

${formData.content.body || 'The body paragraphs will highlight your relevant experience and skills.'}

${formData.content.closing || 'Your closing paragraph will express enthusiasm and next steps.'}

Thank you for considering my application. I look forward to the opportunity to discuss how my skills and experience can contribute to ${formData.jobInfo.companyName}.

Sincerely,
${formData.personalInfo.fullName}`;

      setFormData(prev => ({
        ...prev,
        coverLetter: generatedLetter
      }));
      setIsGenerating(false);
      setActiveTab('preview');
    }, 3000);
  };

  const saveCoverLetter = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert('Cover letter saved successfully!');
    }, 1000);
  };

  const downloadPDF = () => {
    alert('PDF download started!');
  };

  const templates = [
    {
      id: 'professional',
      name: 'Professional',
      description: 'Clean and formal style',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'creative',
      name: 'Creative',
      description: 'Modern and innovative approach',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'executive',
      name: 'Executive',
      description: 'Senior-level positioning',
      color: 'from-green-500 to-emerald-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      {/* Top bar */}
      <div className="sticky top-0 z-30 backdrop-blur-xl bg-slate-900/60 border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link href="/resume-builder" className="inline-flex items-center text-purple-300 hover:text-purple-200 transition">
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="text-sm">Back to Resume Builder</span>
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={saveCoverLetter}
              disabled={isSaving}
              className="flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-full hover:bg-white/20 transition disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={downloadPDF}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full hover:shadow-lg transition"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </div>
        </div>
      </div>

      <section className="px-4 sm:px-6 lg:px-8 pt-10 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
              Cover Letter <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">Generator</span>
            </h1>
            <p className="mt-4 text-lg text-gray-300">
              Create personalized cover letters tailored to specific job applications
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-1">
              <button
                onClick={() => setActiveTab('form')}
                className={`px-6 py-3 rounded-xl transition ${
                  activeTab === 'form' 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Form Builder
              </button>
              <button
                onClick={() => setActiveTab('templates')}
                className={`px-6 py-3 rounded-xl transition ${
                  activeTab === 'templates' 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Templates
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-6 py-3 rounded-xl transition ${
                  activeTab === 'preview' 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Preview
              </button>
            </div>
          </div>

          {/* Content */}
          {activeTab === 'form' && (
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Form */}
              <div className="space-y-6">
                {/* Personal Information */}
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Your Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={formData.personalInfo.fullName}
                        onChange={(e) => handleInputChange('personalInfo', 'fullName', e.target.value)}
                        className="w-full rounded-2xl bg-slate-900/60 border border-white/10 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/60"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Email</label>
                      <input
                        type="email"
                        value={formData.personalInfo.email}
                        onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
                        className="w-full rounded-2xl bg-slate-900/60 border border-white/10 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/60"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={formData.personalInfo.phone}
                        onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
                        className="w-full rounded-2xl bg-slate-900/60 border border-white/10 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/60"
                        placeholder="+94 77 123 4567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Address</label>
                      <input
                        type="text"
                        value={formData.personalInfo.address}
                        onChange={(e) => handleInputChange('personalInfo', 'address', e.target.value)}
                        className="w-full rounded-2xl bg-slate-900/60 border border-white/10 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/60"
                        placeholder="Colombo, Sri Lanka"
                      />
                    </div>
                  </div>
                </div>

                {/* Job Information */}
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    Job Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Company Name</label>
                      <input
                        type="text"
                        value={formData.jobInfo.companyName}
                        onChange={(e) => handleInputChange('jobInfo', 'companyName', e.target.value)}
                        className="w-full rounded-2xl bg-slate-900/60 border border-white/10 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/60"
                        placeholder="Tech Company Ltd"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Job Title</label>
                      <input
                        type="text"
                        value={formData.jobInfo.jobTitle}
                        onChange={(e) => handleInputChange('jobInfo', 'jobTitle', e.target.value)}
                        className="w-full rounded-2xl bg-slate-900/60 border border-white/10 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/60"
                        placeholder="Software Developer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Hiring Manager Name</label>
                      <input
                        type="text"
                        value={formData.jobInfo.hiringManager}
                        onChange={(e) => handleInputChange('jobInfo', 'hiringManager', e.target.value)}
                        className="w-full rounded-2xl bg-slate-900/60 border border-white/10 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/60"
                        placeholder="Sarah Johnson"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Job Description</label>
                      <textarea
                        value={formData.jobInfo.jobDescription}
                        onChange={(e) => handleInputChange('jobInfo', 'jobDescription', e.target.value)}
                        className="w-full rounded-2xl bg-slate-900/60 border border-white/10 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/60 h-32 resize-none"
                        placeholder="Paste the job description here..."
                      />
                    </div>
                  </div>
                </div>

                {/* Content Sections */}
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <PenTool className="w-5 h-5" />
                    Content Guidelines
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Opening Paragraph</label>
                      <textarea
                        value={formData.content.opening}
                        onChange={(e) => handleInputChange('content', 'opening', e.target.value)}
                        className="w-full rounded-2xl bg-slate-900/60 border border-white/10 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/60 h-24 resize-none"
                        placeholder="Key points for opening paragraph..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Body Paragraphs</label>
                      <textarea
                        value={formData.content.body}
                        onChange={(e) => handleInputChange('content', 'body', e.target.value)}
                        className="w-full rounded-2xl bg-slate-900/60 border border-white/10 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/60 h-32 resize-none"
                        placeholder="Main achievements and relevant experience..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Closing Paragraph</label>
                      <textarea
                        value={formData.content.closing}
                        onChange={(e) => handleInputChange('content', 'closing', e.target.value)}
                        className="w-full rounded-2xl bg-slate-900/60 border border-white/10 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/60 h-24 resize-none"
                        placeholder="Closing thoughts and next steps..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Generator */}
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  AI Generator
                </h3>
                <div className="space-y-4">
                  <button
                    onClick={generateCoverLetter}
                    disabled={isGenerating}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-4 rounded-2xl hover:shadow-lg transition disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 inline mr-2 animate-spin" />
                        Generating Cover Letter...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 inline mr-2" />
                        Generate Cover Letter
                      </>
                    )}
                  </button>
                  
                  <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4">
                    <h4 className="text-white font-semibold mb-2">AI Features:</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• Job-specific content generation</li>
                      <li>• Keyword optimization</li>
                      <li>• Professional tone adjustment</li>
                      <li>• ATS-friendly formatting</li>
                      <li>• Industry-specific language</li>
                    </ul>
                  </div>

                  <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4">
                    <h4 className="text-white font-semibold mb-2">Tips for Better Results:</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• Include specific job requirements</li>
                      <li>• Mention relevant achievements</li>
                      <li>• Use industry keywords</li>
                      <li>• Keep it concise and focused</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-4">Choose a Template</h2>
                <p className="text-gray-300">Select a template that matches your industry and style</p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="group bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105 cursor-pointer"
                  >
                    <div className={`w-16 h-16 bg-gradient-to-r ${template.color} rounded-2xl flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform`}>
                      <FileText className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{template.name}</h3>
                    <p className="text-gray-400 mb-4">{template.description}</p>
                    <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-2xl hover:shadow-lg transition">
                      Use Template
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
              <div className="bg-white text-black rounded-2xl p-8 min-h-[600px]">
                <div className="prose prose-lg max-w-none">
                  <pre className="whitespace-pre-wrap font-serif text-sm leading-relaxed">
                    {formData.coverLetter || 'Generate a cover letter to see the preview here...'}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
