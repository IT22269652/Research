'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Download, Sparkles, Plus, Github, X, Loader2, User, Code } from 'lucide-react';
import Link from 'next/link';
import { toast, Toaster } from 'react-hot-toast';
import html2canvas from 'html2canvas-pro';  
import { jsPDF } from 'jspdf';

export default function ResumeBuilderEdit() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [activeTab, setActiveTab] = useState('form');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGithubImport, setShowGithubImport] = useState(false);
const [githubUsername, setGithubUsername] = useState('');
const [isFetchingGithub, setIsFetchingGithub] = useState(false);

  const [formData, setFormData] = useState({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      address: '',
      linkedin: '',
      github: '',
      website: ''
    },
    summary: '',
    skills: '',
    technicalSkills: '',
    experience: [],
    education: [],
    projects: [],
    certifications: [],
    references: []
  });

  const [currentEntry, setCurrentEntry] = useState({
    type: 'experience',
    title: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: ''
  });

  const [showEntryForm, setShowEntryForm] = useState(false);

useEffect(() => {
  if (!id) return;

  const loadResume = async () => {
    try {
      setIsLoading(true);

      const res = await fetch(`/api/resume?id=${id}&t=${Date.now()}`, {
        method: 'GET',
        cache: 'no-store'
      });

      if (!res.ok) {
        throw new Error('Resume not found');
      }

      const data = await res.json();
      console.log('Loaded data:', data); // ← මේක දාලා බලන්න console එකේ

      setFormData({
        personalInfo: {
          fullName: data.personalInfo?.fullName || '',
          email: data.personalInfo?.email || '',
          phone: data.personalInfo?.phone || '',
          address: data.personalInfo?.address || '',
          linkedin: data.personalInfo?.linkedin || '',
          github: data.personalInfo?.github || '',
          website: data.personalInfo?.website || ''
        },
        summary: data.summary || '',
        skills: data.skills || '',
        technicalSkills: data.technicalSkills || '',
        experience: Array.isArray(data.experience) ? data.experience : [],
        education: Array.isArray(data.education) ? data.education : [],
        projects: Array.isArray(data.projects) ? data.projects : [],
        certifications: Array.isArray(data.certifications) ? data.certifications : [],
        references: Array.isArray(data.references) ? data.references : []
      });

      setSelectedTemplate(data.selectedTemplate || 'modern');

      toast.success('Resume loaded successfully!');
    } catch (err) {
      console.error('Load error:', err);
      toast.error('Failed to load resume');
      router.push('/resume-builder/saved');
    } finally {
      setIsLoading(false);
    }
  };

  loadResume();
}, [id, router]);

const fetchGithubProjects = async () => {
  if (!githubUsername.trim()) {
    toast.error('GitHub username එක දාන්න!');
    return;
  }

  setIsFetchingGithub(true);

  fetch(`https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=15`)
    .then(res => {
      if (!res.ok) throw new Error('cannot find user');
      return res.json();
    })
    .then(repos => {
      const newProjects = repos.map(repo => ({
        title: repo.name.replace(/-/g, ' ').replace(/_/g, ' '),
        company: repo.full_name,
        description: repo.description || 'No description available',
        url: repo.html_url,
        language: repo.language || '',
        startDate: new Date(repo.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
        endDate: 'Present',
        current: true
      }));

      // Add to existing projects
      setFormData(prev => ({
        ...prev,
        projects: [...prev.projects, ...newProjects]
      }));

      toast.success(`${newProjects.length} projects GitHub එකෙන් ගත්තා!`);
      setShowGithubImport(false);
      setGithubUsername('');
    })
    .catch(err => {
      toast.error(err.message || 'GitHub fetch කරන්න බැරිවුණා');
    })
    .finally(() => {
      setIsFetchingGithub(false);
    });
};

  const saveResume = async () => {
    if (!formData.personalInfo.fullName?.trim()) {
      toast.error('Full Name is required!');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/resume', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          personalInfo: formData.personalInfo,
          summary: formData.summary,
          skills: formData.skills,
          technicalSkills: formData.technicalSkills, // Save Technical Skills
          experience: formData.experience,
          education: formData.education,
          projects: formData.projects,
          certifications: formData.certifications,
          references: formData.references,           // Save References
          selectedTemplate
        })
      });

      if (res.ok) {
        toast.success('Resume updated successfully!');
        document.title = `${formData.personalInfo.fullName.trim()} - Resume Builder`;
      } else {
        toast.error('Update failed');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePersonalInfoChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value }
    }));
  };

  const addEntry = () => {
  if (!currentEntry.title?.trim() || !currentEntry.company?.trim()) {
    toast.error('Title and Company/University required');
    return;
  }

  setFormData(prev => {
    const updated = { ...prev };

    // EDIT MODE
    if (currentEntry.index !== undefined) {
      const list = [...updated[currentEntry.type]];
      list[currentEntry.index] = { ...currentEntry };
      updated[currentEntry.type] = list;
    }
    // ADD MODE
    else {
      updated[currentEntry.type] = [...updated[currentEntry.type], { ...currentEntry }];
    }

    return updated;
  });

  // Reset form
  setCurrentEntry({
    type: currentEntry.type,
    title: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: ''
  });

  setShowEntryForm(false);
  toast.success(currentEntry.index !== undefined ? "Updated!" : "Added!");
};


  const removeEntry = (section, index) => {
    setFormData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-purple-400 mx-auto mb-6" />
          <p className="text-2xl text-white font-medium">Loading your resume...</p>
        </div>
      </div>
    );
  }

  const generateResume = () => {
  setIsGenerating(true);
  
  setTimeout(() => {
    setIsGenerating(false);
    toast.custom((t) => (
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-2xl shadow-2xl">
        <div className="flex items-center gap-3">
          <Sparkles className="w-8 h-8" />
          <div>
            <p className="font-bold text-lg">AI Feature Coming Soon!</p>
            <p className="text-sm opacity-90">We're training the AI to write perfect resumes</p>
          </div>
        </div>
      </div>
    ), { duration: 6000 });
  }, 2000);
};

  const downloadPDF = async () => {
  setIsGenerating(true);

  try {
    const element = document.getElementById('resume-pdf-content');
    if (!element) {
      toast.error('Preview not ready!');
      return;
    }

    import('html2canvas-pro').then(async (html2canvas) => {
      try {
        const canvas = await html2canvas.default(element, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
          allowTaint: true,
          width: element.scrollWidth,
          height: element.scrollHeight,
        });

        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = await import('jspdf');
        const pdf = new jsPDF('p', 'mm', 'a4');

        const pdfWidth = pdf.internal.pageSize.getWidth();    // 210mm
        const pdfHeight = pdf.internal.pageSize.getHeight();   // 297mm

        const imgWidth = canvas.width / 2;
        const imgHeight = canvas.height / 2;

      
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const finalWidth = imgWidth * ratio;
        const finalHeight = imgHeight * ratio;

        
        const margin = 15;
        const x = margin;
        const y = margin;
        const availableWidth = pdfWidth - (2 * margin);
        const availableHeight = pdfHeight - (2 * margin);

        const scaledWidth = imgWidth * (availableWidth / imgWidth);
        const scaledHeight = imgHeight * (availableHeight / imgHeight);
        const finalRatio = Math.min(scaledWidth / imgWidth, scaledHeight / imgHeight);

        const width = imgWidth * finalRatio;
        const height = imgHeight * finalRatio;

        
        let positionY = 0;
        let pageCount = 0;

        while (positionY < imgHeight) {
          if (pageCount > 0) pdf.addPage();

          pdf.addImage(
            imgData,
            'PNG',
            x,
            y - (positionY * finalRatio),
            width,
            height
          );

          positionY += availableHeight / finalRatio;
          pageCount++;
        }

        pdf.save(`${formData.personalInfo.fullName || 'Resume'}_A4_Print_Ready.pdf`);
        toast.success('PDF downloaded — Perfect for printing!');

      } catch (err) {
        console.error(err);
        toast.error('PDF generation failed');
      }
    });
  } catch (err) {
    toast.error('Failed to load PDF generator');
  } finally {
    setIsGenerating(false);
  }
};

const generateProfessionalCV = () => {
  const { personalInfo, summary, skills, experience, education, projects } = formData;

  // ============= MODERN TEMPLATE - Create page එකේ 100% SAME =============
  if (selectedTemplate === 'modern') {
    return (
      <div className="cv-template cv-modern bg-white" style={{ padding: '20mm', fontFamily: 'Arial, sans-serif' }}>
        {/* Header */}
        <div className="cv-header text-center mb-12 pb-8 border-b-4 border-blue-600">
          <h1 className="cv-name text-5xl font-bold text-gray-900 mb-8">
            {personalInfo.fullName || 'Your Name'}
          </h1>
          <div className="cv-contact flex flex-wrap justify-center gap-x-10 gap-y-3 text-lg text-gray-700">
            {personalInfo.email && <span>Email: {personalInfo.email}</span>}
            {personalInfo.phone && <span>Phone: {personalInfo.phone}</span>}
            {personalInfo.address && <span>Location: {personalInfo.address}</span>}
            {personalInfo.linkedin && (
  <a 
    href={personalInfo.linkedin.startsWith('http') ? personalInfo.linkedin : `https://${personalInfo.linkedin}`}
    target="_blank" 
    rel="noopener noreferrer"
    className="text-blue-600 hover:underline font-medium"
  >
    LinkedIn: {personalInfo.linkedin.replace(/^https?:\/\//, '').replace(/\/+$/, '')}
  </a>
)}

{personalInfo.github && (
  <a 
    href={personalInfo.github.startsWith('http') ? personalInfo.github : `https://${personalInfo.github}`}
    target="_blank" 
    rel="noopener noreferrer"
    className="text-gray-800 hover:underline font-medium"
  >
    GitHub: {personalInfo.github.replace(/^https?:\/\//, '').replace(/\/+$/, '')}
  </a>
)}
          </div>
        </div>

        {/* Blue Line */}
        <div className="w-full h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-12"></div>

        {/* Professional Summary */}
        {summary && (
          <div className="cv-section mb-12">
            <h2 className="cv-section-title text-3xl font-bold text-blue-700 mb-6 border-b-4 border-blue-600 inline-block pb-2">
              PROFESSIONAL SUMMARY
            </h2>
            <p className="cv-summary text-gray-700 text-lg leading-relaxed">{summary}</p>
          </div>
        )}

        {/* Skills */}
        {skills && (
          <div className="cv-section mb-12">
            <h2 className="cv-section-title text-3xl font-bold text-blue-700 mb-6 border-b-4 border-blue-600 inline-block pb-2">
              SKILLS
            </h2>
            <p className="cv-skills text-gray-700 text-lg">{skills}</p>
          </div>
        )}

        {/* PREVIEW: Technical Skills */}
          {technicalSkills && (
            <div className="cv-section mb-12">
              <h2 className="cv-section-title text-3xl font-bold text-blue-700 mb-6 border-b-4 border-blue-600 inline-block pb-2">TECHNICAL SKILLS</h2>
              <p className="text-gray-700 text-lg">{technicalSkills}</p>
            </div>
          )}

        {/* Work Experience */}
        {experience.length > 0 && (
          <div className="cv-section mb-12">
            <h2 className="cv-section-title text-3xl font-bold text-blue-700 mb-8 border-b-4 border-blue-600 inline-block pb-2">
              WORK EXPERIENCE
            </h2>
            {experience.map((exp, i) => (
              <div key={i} className="cv-item mb-10 pl-10 border-l-4 border-blue-500">
                <h3 className="cv-item-title text-2xl font-bold text-gray-900">{exp.title}</h3>
                <p className="cv-item-company text-xl text-blue-600 font-semibold mt-2">{exp.company}</p>
                <p className="text-gray-600 italic mt-1">
                  {exp.startDate} – {exp.current ? 'Present' : exp.endDate} • {exp.location || 'Remote'}
                </p>
                <p className="cv-item-description mt-4 text-gray-700 leading-relaxed">{exp.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div className="cv-section mb-12">
            <h2 className="cv-section-title text-3xl font-bold text-blue-700 mb-8 border-b-4 border-blue-600 inline-block pb-2">
              EDUCATION
            </h2>
            {education.map((edu, i) => (
              <div key={i} className="cv-item mb-10 pl-10 border-l-4 border-blue-500">
                <h3 className="cv-item-title text-2xl font-bold text-gray-900">{edu.title}</h3>
                <p className="cv-item-company text-xl text-blue-600 font-semibold mt-2">{edu.company}</p>
                <p className="text-gray-600 italic mt-1">
                  {edu.startDate} – {edu.current ? 'Present' : edu.endDate}
                </p>
                <p className="cv-item-description mt-4 text-gray-700">{edu.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div className="cv-section">
            <h2 className="cv-section-title text-3xl font-bold text-blue-700 mb-8 border-b-4 border-blue-600 inline-block pb-2">
              PROJECTS
            </h2>
            {projects.map((proj, i) => (
              <div key={i} className="cv-item mb-10 pl-10 border-l-4 border-purple-500">
                <h3 className="cv-item-title text-2xl font-bold text-gray-900">{proj.title}</h3>
                {proj.url && (
                  <a href={proj.url} target="_blank" rel="noopener noreferrer"
                     className="text-purple-600 hover:underline font-medium text-lg block mt-2">
                    View Project
                  </a>
                )}
                <p className="text-gray-600 italic mt-2">
                  {proj.startDate} – {proj.current ? 'Present' : proj.endDate || 'Present'}
                </p>
                <p className="cv-item-description mt-4 text-gray-700 leading-relaxed">
                  {proj.description || 'No description available'}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* PREVIEW: References */}
          {references.length > 0 && (
            <div className="cv-section mb-12">
              <h2 className="cv-section-title text-3xl font-bold text-blue-700 mb-8 border-b-4 border-blue-600 inline-block pb-2">REFERENCES</h2>
              <div className="grid grid-cols-2 gap-6">
                {references.map((ref, i) => (
                   <ReferenceItem key={i} refData={ref} />
                ))}
              </div>
            </div>
          )}
      </div>
    );
  }

  // ============= CLASSIC TEMPLATE =============
  if (selectedTemplate === 'classic') {
    return (
      <div className="cv-template cv-classic bg-white" style={{ padding: '20mm', fontFamily: 'Arial, sans-serif' }}>
        <div className="cv-header text-center border-b-4 border-black pb-8 mb-12">
          <h1 className="cv-name text-5xl font-bold text-black mb-6">
            {personalInfo.fullName || 'Your Name'}
          </h1>
          <div className="cv-contact text-lg space-y-2">
            {personalInfo.email && <div>{personalInfo.email}</div>}
            {personalInfo.phone && <div>{personalInfo.phone}</div>}
            {personalInfo.address && <div>{personalInfo.address}</div>}
            {personalInfo.linkedin && <div>LinkedIn: {personalInfo.linkedin.replace(/^https?:\/\//, '')}</div>}
            {personalInfo.github && <div>GitHub: {personalInfo.github.replace(/^https?:\/\//, '')}</div>}
          </div>
        </div>

        {summary && (
          <div className="cv-section mb-10">
            <h2 className="cv-section-title bg-black text-white inline-block px-8 py-3 text-2xl font-bold mb-4">
              PROFESSIONAL SUMMARY
            </h2>
            <p className="text-gray-700 leading-relaxed">{summary}</p>
          </div>
        )}

        {skills && (
          <div className="cv-section mb-10">
            <h2 className="cv-section-title bg-black text-white inline-block px-8 py-3 text-2xl font-bold mb-4">
              TECHNICAL SKILLS
            </h2>
            <p className="text-gray-700">{skills}</p>
          </div>
        )}

        {/* PREVIEW: Technical Skills */}
          {technicalSkills && (
            <div className="cv-section mb-12">
              <h2 className="cv-section-title text-3xl font-bold text-blue-700 mb-6 border-b-4 border-blue-600 inline-block pb-2">TECHNICAL SKILLS</h2>
              <p className="text-gray-700 text-lg">{technicalSkills}</p>
            </div>
          )}

        {experience.length > 0 && (
          <div className="cv-section mb-10">
            <h2 className="cv-section-title bg-black text-white inline-block px-8 py-3 text-2xl font-bold mb-6">
              WORK EXPERIENCE
            </h2>
            {experience.map((exp, i) => (
              <div key={i} className="mb-8 pl-8 border-l-4 border-black">
                <h3 className="text-xl font-bold text-gray-900">{exp.title}</h3>
                <p className="font-semibold text-gray-800 mt-1">{exp.company}</p>
                <p className="text-sm italic text-gray-600 mt-1">
                  {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                </p>
                <p className="mt-3 text-gray-700">{exp.description}</p>
              </div>
            ))}
          </div>
        )}

        {education.length > 0 && (
          <div className="cv-section mb-10">
            <h2 className="cv-section-title bg-black text-white inline-block px-8 py-3 text-2xl font-bold mb-6">
              EDUCATION
            </h2>
            {education.map((edu, i) => (
              <div key={i} className="mb-8 pl-8 border-l-4 border-black">
                <h3 className="text-xl font-bold text-gray-900">{edu.title}</h3>
                <p className="font-semibold text-gray-800 mt-1">{edu.company}</p>
                <p className="text-sm italic text-gray-600 mt-1">
                  {edu.startDate} – {edu.current ? 'Present' : edu.endDate}
                </p>
                <p className="mt-3 text-gray-700">{edu.description}</p>
              </div>
            ))}
          </div>
        )}

        {projects.length > 0 && (
          <div className="cv-section">
            <h2 className="cv-section-title bg-black text-white inline-block px-8 py-3 text-2xl font-bold mb-6">
              PROJECTS
            </h2>
            {projects.map((proj, i) => (
              <div key={i} className="mb-8 pl-8 border-l-4 border-black">
                <h3 className="text-xl font-bold text-gray-900">{proj.title}</h3>
                {proj.url && (
                  <a href={proj.url} target="_blank" className="text-blue-600 hover:underline block mt-2">
                    View Project
                  </a>
                )}
                <p className="text-sm italic text-gray-600 mt-1">
                  {proj.startDate} – {proj.current ? 'Present' : proj.endDate || 'Present'}
                </p>
                <p className="mt-3 text-gray-700">{proj.description || 'No description available'}</p>
              </div>
            ))}
          </div>
        )}

        {/* PREVIEW: References */}
          {references.length > 0 && (
            <div className="cv-section mb-12">
              <h2 className="cv-section-title text-3xl font-bold text-blue-700 mb-8 border-b-4 border-blue-600 inline-block pb-2">REFERENCES</h2>
              <div className="grid grid-cols-2 gap-6">
                {references.map((ref, i) => (
                   <ReferenceItem key={i} refData={ref} />
                ))}
              </div>
            </div>
          )}
      </div>
    );
  }

  // ============= CREATIVE TEMPLATE =============
  if (selectedTemplate === 'creative') {
   return (
      <div className="cv-template cv-classic bg-white" style={{ padding: '20mm', fontFamily: 'Arial, sans-serif' }}>
        <div className="cv-header text-center border-b-4 border-black pb-8 mb-12">
          <h1 className="cv-name text-5xl font-bold text-black mb-6">
            {personalInfo.fullName || 'Your Name'}
          </h1>
          <div className="cv-contact text-lg space-y-2">
            {personalInfo.email && <div>{personalInfo.email}</div>}
            {personalInfo.phone && <div>{personalInfo.phone}</div>}
            {personalInfo.address && <div>{personalInfo.address}</div>}
            {personalInfo.linkedin && <div>LinkedIn: {personalInfo.linkedin.replace(/^https?:\/\//, '')}</div>}
            {personalInfo.github && <div>GitHub: {personalInfo.github.replace(/^https?:\/\//, '')}</div>}
          </div>
        </div>

        {summary && (
          <div className="cv-section mb-10">
            <h2 className="cv-section-title bg-black text-white inline-block px-8 py-3 text-2xl font-bold mb-4">
              PROFESSIONAL SUMMARY
            </h2>
            <p className="text-gray-700 leading-relaxed">{summary}</p>
          </div>
        )}

        {skills && (
          <div className="cv-section mb-10">
            <h2 className="cv-section-title bg-black text-white inline-block px-8 py-3 text-2xl font-bold mb-4">
              TECHNICAL SKILLS
            </h2>
            <p className="text-gray-700">{skills}</p>
          </div>
        )}

        {/* PREVIEW: Technical Skills */}
          {technicalSkills && (
            <div className="cv-section mb-12">
              <h2 className="cv-section-title text-3xl font-bold text-blue-700 mb-6 border-b-4 border-blue-600 inline-block pb-2">TECHNICAL SKILLS</h2>
              <p className="text-gray-700 text-lg">{technicalSkills}</p>
            </div>
          )}

        {experience.length > 0 && (
          <div className="cv-section mb-10">
            <h2 className="cv-section-title bg-black text-white inline-block px-8 py-3 text-2xl font-bold mb-6">
              WORK EXPERIENCE
            </h2>
            {experience.map((exp, i) => (
              <div key={i} className="mb-8 pl-8 border-l-4 border-black">
                <h3 className="text-xl font-bold text-gray-900">{exp.title}</h3>
                <p className="font-semibold text-gray-800 mt-1">{exp.company}</p>
                <p className="text-sm italic text-gray-600 mt-1">
                  {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                </p>
                <p className="mt-3 text-gray-700">{exp.description}</p>
              </div>
            ))}
          </div>
        )}

        {education.length > 0 && (
          <div className="cv-section mb-10">
            <h2 className="cv-section-title bg-black text-white inline-block px-8 py-3 text-2xl font-bold mb-6">
              EDUCATION
            </h2>
            {education.map((edu, i) => (
              <div key={i} className="mb-8 pl-8 border-l-4 border-black">
                <h3 className="text-xl font-bold text-gray-900">{edu.title}</h3>
                <p className="font-semibold text-gray-800 mt-1">{edu.company}</p>
                <p className="text-sm italic text-gray-600 mt-1">
                  {edu.startDate} – {edu.current ? 'Present' : edu.endDate}
                </p>
                <p className="mt-3 text-gray-700">{edu.description}</p>
              </div>
            ))}
          </div>
        )}

        {projects.length > 0 && (
          <div className="cv-section">
            <h2 className="cv-section-title bg-black text-white inline-block px-8 py-3 text-2xl font-bold mb-6">
              PROJECTS
            </h2>
            {projects.map((proj, i) => (
              <div key={i} className="mb-8 pl-8 border-l-4 border-black">
                <h3 className="text-xl font-bold text-gray-900">{proj.title}</h3>
                {proj.url && (
                  <a href={proj.url} target="_blank" className="text-blue-600 hover:underline block mt-2">
                    View Project
                  </a>
                )}
                <p className="text-sm italic text-gray-600 mt-1">
                  {proj.startDate} – {proj.current ? 'Present' : proj.endDate || 'Present'}
                </p>
                <p className="mt-3 text-gray-700">{proj.description || 'No description available'}</p>
              </div>
            ))}
          </div>
        )}

        {/* PREVIEW: References */}
          {references.length > 0 && (
            <div className="cv-section mb-12">
              <h2 className="cv-section-title text-3xl font-bold text-blue-700 mb-8 border-b-4 border-blue-600 inline-block pb-2">REFERENCES</h2>
              <div className="grid grid-cols-2 gap-6">
                {references.map((ref, i) => (
                   <ReferenceItem key={i} refData={ref} />
                ))}
              </div>
            </div>
          )}
      </div>
    );
  }

  return null;
};

 return (
    <>
      <Toaster position="top-center" />
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
        {/* Top Bar */}
        <div className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/90 border-b border-purple-500/20">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/resume-builder/saved" className="flex items-center gap-2 text-purple-300 hover:text-white">
              <ArrowLeft /> Back to Saved
            </Link>
            <div className="flex gap-4">
              <button onClick={saveResume} disabled={isSaving} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full flex items-center gap-2 hover:shadow-xl disabled:opacity-70">
                {isSaving ? <Loader2 className="animate-spin" /> : <Save />} Update Resume
              </button>
              <button onClick={downloadPDF} disabled={isGenerating} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-full flex items-center gap-2 hover:shadow-xl disabled:opacity-70">
                {isGenerating ? <Loader2 className="animate-spin" /> : <Download />} Download PDF
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-5xl font-bold text-center text-white mb-10">
            Editing: <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {formData.personalInfo.fullName || 'Untitled'}
            </span>
          </h1>

          {/* Template Selector */}
          <div className="flex justify-center gap-6 mb-10">
            {['modern', 'classic', 'creative'].map(t => (
              <button key={t} onClick={() => setSelectedTemplate(t)} className={`px-8 py-3 rounded-2xl font-bold capitalize transition ${selectedTemplate === t ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-2xl' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`}>
                {t}
              </button>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex justify-center gap-6 mb-10">
            <button onClick={() => setActiveTab('form')} className={`px-10 py-4 rounded-2xl font-bold text-lg transition-all ${activeTab === 'form' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-2xl' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`}>
              Form Builder
            </button>
            <button onClick={() => setActiveTab('preview')} className={`px-10 py-4 rounded-2xl font-bold text-lg transition-all ${activeTab === 'preview' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-2xl' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`}>
              Preview
            </button>
          </div>

          {/* FORM TAB - FULLY FIXED */}
          {activeTab === 'form' && (
            <div className="grid lg:grid-cols-2 gap-10 max-w-7xl mx-auto">
              <div className="space-y-10">

                {/* Personal Information */}
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
                  <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(formData.personalInfo).map(([key, value]) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-purple-200 mb-2 capitalize">
                          {key === 'fullName' ? 'Full Name' : key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                        </label>
                        <input
                          type={key === 'email' ? 'email' : key === 'phone' ? 'tel' : 'text'}
                          value={value}
                          onChange={(e) => handlePersonalInfoChange(key, e.target.value)}
                          className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/60 focus:border-purple-400 transition backdrop-blur-sm"
                          placeholder={key === 'fullName' ? 'Dulaj Jayasundara' : key === 'email' ? 'dulaj@example.com' : key === 'phone' ? '+94 77 123 4567' : key === 'address' ? 'Colombo, Sri Lanka' : key === 'linkedin' ? 'https://linkedin.com/in/...' : key === 'github' ? 'https://github.com/...' : 'Website URL'}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Professional Summary */}
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
                  <h3 className="text-2xl font-bold text-white mb-6">Professional Summary</h3>
                  <textarea
                    value={formData.summary}
                    onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                    placeholder="Write a compelling summary..."
                    className="w-full px-6 py-5 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/60 focus:border-purple-400 transition h-48 resize-none backdrop-blur-sm"
                  />
                </div>

                {/* Skills */}
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
                  <h3 className="text-2xl font-bold text-white mb-6">Soft Skills</h3>
                  <textarea
                    value={formData.skills}
                    onChange={(e) => setFormData(prev => ({ ...prev, skills: e.target.value }))}
                    placeholder="e.g : Empathy, Design Skills..."
                    className="w-full px-6 py-5 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/60 focus:border-purple-400 transition h-40 resize-none backdrop-blur-sm"
                  />
                </div>

                {/* 4. UI: TECHNICAL SKILLS (Added) */}
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"> Technical Skills</h3>
                  <textarea 
                    value={formData.technicalSkills} 
                    onChange={(e) => setFormData(prev => ({ ...prev, technicalSkills: e.target.value }))} 
                    placeholder="List specific technologies (e.g : AWS, Docker, Python)..."
                    className="w-full px-6 py-5 bg-white/10 border border-white/20 rounded-2xl text-white h-40 resize-none" 
                  />
                </div>

                {/* Experience, Education, Projects, Certifications */}
                {['experience', 'education', 'projects'].map((section) => (
                  <div key={section} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
                    <div className="flex justify-between items-center mb-8">
                      <h3 className="text-2xl font-bold text-white capitalize">
                        {section === 'experience' ? 'Work Experience' : section === 'education' ? 'Education' : 'Projects'}
                      </h3>
                      <div className="flex gap-4">
                        <button
                          onClick={() => { setCurrentEntry({ ...currentEntry, type: section }); setShowEntryForm(true); }}
                          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 hover:shadow-xl transition"
                        >
                          Add {section === 'projects' ? 'Project' : section === 'education' ? 'Degree' : 'Job'}
                        </button>
                        {section === 'projects' && (
                          <button
                            onClick={() => setShowGithubImport(true)}
                            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 hover:shadow-xl transition"
                          >
                            <Github className="w-5 h-5" /> Import from GitHub
                          </button>
                        )}
                      </div>
                    </div>

                    {formData[section].length === 0 ? (
                      <p className="text-gray-400 text-center py-16 italic">No entries yet</p>
                    ) : (
                      <div className="space-y-6">
                        {formData[section].map((item, i) => (
                          <div key={i} className="bg-white/10 rounded-2xl p-6 border border-white/10 hover:border-purple-500/50 transition">

                        <div className="flex justify-between items-start">
                      <div>
      <h4 className="text-xl font-bold text-white">{item.title}</h4>
      <p className="text-purple-300 mt-1">{item.company}</p>
      <p className="text-sm text-gray-400 mt-1">
        {item.startDate} – {item.current ? 'Present' : item.endDate}
      </p>
      {item.url && (
        <a
          href={item.url}
          target="_blank"
          className="text-cyan-400 hover:underline text-sm mt-2 inline-block"
        >
          View Project
        </a>
      )}
      <p className="mt-4 text-gray-300">{item.description}</p>
    </div>

    {/* ALWAYS VISIBLE BUTTONS */}
    <div className="flex flex-col gap-2">

      <button
        onClick={() => {
          setCurrentEntry({ ...item, type: section, index: i });
          setShowEntryForm(true);
        }}
        className="text-blue-400 hover:text-blue-300 p-2 rounded-xl hover:bg-blue-500/20"
      >
        Edit
      </button>

      <button
        onClick={() => removeEntry(section, i)}
        className="text-red-400 hover:text-red-300 p-2 rounded-xl hover:bg-red-500/20"
      >
        <X className="w-6 h-6" />
      </button>
    </div>
  </div>
</div>
                        ))}


                      </div>
                    )}
                  </div>

                


                ))}

                
              </div>
              

{/* AI Assistant */}
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  AI Assistant
                </h3>
                <div className="space-y-4">
                  <button
                    onClick={generateResume}
                    disabled={isGenerating}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-2xl hover:shadow-lg transition disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 inline mr-2" />
                        Generate with AI
                      </>
                    )}
                  </button>
                  <div className="text-sm text-gray-400">
                    AI can help you:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Optimize your summary</li>
                      <li>Suggest better skills</li>
                      <li>Improve descriptions</li>
                      <li>ATS optimization</li>
                    </ul>
                  </div>
                </div>
              </div>
  </div>
)}
{activeTab === 'preview' && (
  <div className="max-w-4xl mx-auto my-10">
    <div 
  id="resume-pdf-content"
  className="bg-white mx-auto shadow-2xl rounded-3xl overflow-hidden"
  style={{
    width: '210mm',
    minHeight: '297mm',
    padding: '15mm',
    boxSizing: 'border-box',
    margin: '30px auto',
    background: 'white',
  }}
>
  {generateProfessionalCV()}
</div>
  </div>
)}
        </div>
      {/* GitHub Import Modal */}
          {showGithubImport && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900 rounded-3xl p-8 max-w-md w-full border border-white/20 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Github className="w-8 h-8" /> Import GitHub Projects
                  </h3>
                  <button onClick={() => { setShowGithubImport(false); setGithubUsername(''); }} className="text-gray-400 hover:text-white">
                    <X className="w-8 h-8" />
                  </button>
                </div>
                <input type="text" value={githubUsername} onChange={(e) => setGithubUsername(e.target.value)} placeholder="GitHub username" className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-2xl text-white mb-6" />
                <button onClick={fetchGithubProjects} disabled={isFetchingGithub} className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-5 rounded-3xl font-bold flex items-center justify-center gap-3 disabled:opacity-60">
                  {isFetchingGithub ? <Loader2 className="animate-spin" /> : <Github className="w-6 h-6" />} Import Projects
                </button>
              </div>
            </div>
          )}

        {/* Add Entry Modal */}
        {showEntryForm && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 rounded-3xl p-8 max-w-2xl w-full border border-white/20">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">
                  {currentEntry.index !== undefined ? "Edit " : "Add "}
                  Add {currentEntry.type.charAt(0).toUpperCase() + currentEntry.type.slice(1, -1)}
                </h3>
                <button onClick={() => setShowEntryForm(false)} className="text-gray-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-5">
                <input type="text" placeholder="Title / Degree" value={currentEntry.title}
                  onChange={(e) => setCurrentEntry({ ...currentEntry, title: e.target.value })}
                  className="w-full bg-slate-800/60 border border-white/10 rounded-2xl px-5 py-4 text-white" />
                <input type="text" placeholder="Company / University" value={currentEntry.company}
                  onChange={(e) => setCurrentEntry({ ...currentEntry, company: e.target.value })}
                  className="w-full bg-slate-800/60 border border-white/10 rounded-2xl px-5 py-4 text-white" />
                <input type="text" placeholder="Location" value={currentEntry.location}
                  onChange={(e) => setCurrentEntry({ ...currentEntry, location: e.target.value })}
                  className="w-full bg-slate-800/60 border border-white/10 rounded-2xl px-5 py-4 text-white" />
                <div className="flex gap-4">
                  <input type="month" value={currentEntry.startDate}
                    onChange={(e) => setCurrentEntry({ ...currentEntry, startDate: e.target.value })}
                    className="flex-1 bg-slate-800/60 border border-white/10 rounded-2xl px-5 py-4 text-white" />
                  <input type="month" value={currentEntry.endDate} disabled={currentEntry.current}
                    onChange={(e) => setCurrentEntry({ ...currentEntry, endDate: e.target.value })}
                    className="flex-1 bg-slate-800/60 border border-white/10 rounded-2xl px-5 py-4 text-white disabled:opacity-50" />
                </div>
                <label className="flex items-center gap-3 text-white">
                  <input type="checkbox" checked={currentEntry.current}
                    onChange={(e) => setCurrentEntry({ ...currentEntry, current: e.target.checked, endDate: '' })}
                    className="w-5 h-5 accent-purple-500" />
                  Currently working/studying here
                </label>
                <textarea placeholder="Description" value={currentEntry.description}
                  onChange={(e) => setCurrentEntry({ ...currentEntry, description: e.target.value })}
                  className="w-full bg-slate-800/60 border border-white/10 rounded-2xl px-5 py-4 text-white h-32 resize-none" />
              </div>

              <div className="flex gap-4 mt-8">
                <button onClick={addEntry}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-2xl font-bold hover:shadow-xl transition">
                  Add Entry
                </button>
                <button onClick={() => setShowEntryForm(false)}
                  className="flex-1 bg-white/10 text-white py-4 rounded-2xl font-bold hover:bg-white/20 transition">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}