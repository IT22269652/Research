'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Download, Eye, Plus, X, Sparkles, Loader2, User, Mail, Phone, MapPin, Briefcase, GraduationCap, Code, Award, Github, ExternalLink, FileText } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';

import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';


export default function ResumeBuilderCreate() {
  const [activeTab, setActiveTab] = useState('form');
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  
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
    experience: [],
    education: [],
    projects: [],
    certifications: []
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
  const [githubUsername, setGithubUsername] = useState('');
  const [isFetchingGithub, setIsFetchingGithub] = useState(false);
  const [githubProjects, setGithubProjects] = useState([]);

const downloadPDF = async () => {
  setIsGenerating(true);

  try {
    const element = document.getElementById('resume-pdf-content');
    if (!element) return toast.error('Preview not ready!');

    const html2canvas = (await import('html2canvas-pro')).default;
    const { jsPDF } = await import('jspdf');

    // Capture full content with high quality
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      allowTaint: true,
      width: element.scrollWidth,
      height: element.scrollHeight,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');

    const pdfWidth = pdf.internal.pageSize.getWidth();   // 210mm
    const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

    const imgWidth = canvas.width / 2;   // scale 2 නිසා
    const imgHeight = canvas.height / 2;

    const ratio = pdfWidth / imgWidth;
    const scaledHeight = imgHeight * ratio;

    let positionY = 0;

    // Multi-page support (content එක වැඩි නම්)
    while (positionY < scaledHeight) {
      if (positionY > 0) pdf.addPage();

      pdf.addImage(
        imgData,
        'PNG',
        0,                    // x
        -positionY,           // y (negative to scroll down)
        pdfWidth,             // width
        scaledHeight          // full height
      );

      positionY += pdfHeight;
    }

    pdf.save(`${formData.personalInfo.fullName || 'My_Resume'}_A4.pdf`);
    toast.success('PDF downloaded — Perfect A4 size!');

  } catch (err) {
    console.error(err);
    toast.error('Failed to generate PDF');
  } finally {
    setIsGenerating(false);
  }
};

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  // Topic descriptions mapping
  const getTopicDescription = (topic) => {
    const topicDescriptions = {
      // Web Development
      'web': 'Web application development',
      'website': 'Website development project',
      'frontend': 'Frontend development application',
      'backend': 'Backend service or API',
      'fullstack': 'Full-stack web application',
      'spa': 'Single Page Application',
      'pwa': 'Progressive Web Application',
      
      // Mobile Development
      'mobile': 'Mobile application development',
      'android': 'Android mobile application',
      'ios': 'iOS mobile application',
      'react-native': 'React Native mobile app',
      'flutter': 'Flutter mobile application',
      
      // Frameworks & Libraries
      'react': 'React.js application',
      'vue': 'Vue.js application',
      'angular': 'Angular application',
      'nodejs': 'Node.js application',
      'express': 'Express.js web server',
      'django': 'Django web application',
      'flask': 'Flask web application',
      'spring': 'Spring Boot application',
      'laravel': 'Laravel PHP application',
      
      // Databases
      'database': 'Database management system',
      'mysql': 'MySQL database application',
      'postgresql': 'PostgreSQL database application',
      'mongodb': 'MongoDB database application',
      'redis': 'Redis cache application',
      
      // DevOps & Cloud
      'docker': 'Docker containerized application',
      'kubernetes': 'Kubernetes orchestration',
      'aws': 'Amazon Web Services application',
      'azure': 'Microsoft Azure application',
      'gcp': 'Google Cloud Platform application',
      'devops': 'DevOps automation tool',
      'ci-cd': 'Continuous Integration/Deployment',
      
      // AI & Machine Learning
      'ai': 'Artificial Intelligence application',
      'machine-learning': 'Machine Learning project',
      'deep-learning': 'Deep Learning model',
      'nlp': 'Natural Language Processing',
      'computer-vision': 'Computer Vision application',
      'tensorflow': 'TensorFlow ML model',
      'pytorch': 'PyTorch ML model',
      
      // Data Science
      'data-science': 'Data Science project',
      'analytics': 'Data analytics application',
      'visualization': 'Data visualization tool',
      'jupyter': 'Jupyter notebook project',
      'pandas': 'Pandas data processing',
      'numpy': 'NumPy numerical computing',
      
      // Security
      'security': 'Security application',
      'authentication': 'Authentication system',
      'authorization': 'Authorization system',
      'encryption': 'Encryption tool',
      'blockchain': 'Blockchain application',
      'cryptocurrency': 'Cryptocurrency project',
      
      // Tools & Utilities
      'cli': 'Command Line Interface tool',
      'api': 'REST API service',
      'graphql': 'GraphQL API',
      'microservice': 'Microservice architecture',
      'library': 'Software library',
      'framework': 'Software framework',
      'tool': 'Development tool',
      'utility': 'Utility application',
      
      // Game Development
      'game': 'Game development project',
      'unity': 'Unity game engine project',
      'unreal': 'Unreal Engine project',
      '2d': '2D game development',
      '3d': '3D game development',
      
      // Other Categories
      'education': 'Educational application',
      'e-learning': 'E-learning platform',
      'social': 'Social media application',
      'ecommerce': 'E-commerce application',
      'fintech': 'Financial technology application',
      'healthcare': 'Healthcare application',
      'iot': 'Internet of Things project',
      'arduino': 'Arduino project',
      'raspberry-pi': 'Raspberry Pi project'
    };
    
    return topicDescriptions[topic.toLowerCase()] || `${topic} application`;
  };

useEffect(() => {
  // Create new resume → force clean state
  setFormData({
    personalInfo: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      linkedin: "",
      github: "",
      website: ""
    },
    summary: "",
    skills: "",
    experience: [],
    education: [],
    projects: [],
    certifications: []
  });

  setSelectedTemplate("modern");

}, []);


  const fetchGithubProjects = async () => {
    if (!githubUsername.trim()) {
      alert('Please enter a GitHub username');
      return;
    }

    setIsFetchingGithub(true);
    try {
      const response = await fetch(`https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=10`);
      
      if (!response.ok) {
        throw new Error('GitHub user not found or API error');
      }

      const repos = await response.json();
      
      // Fetch detailed information for each repository
      const projects = await Promise.all(repos.map(async (repo) => {
        let detailedDescription = repo.description || 'No description available';
        let technologies = [];
        let features = [];
        let topicDescriptions = [];

        try {
          // Fetch README content
          const readmeResponse = await fetch(`https://api.github.com/repos/${repo.full_name}/readme`);
          if (readmeResponse.ok) {
            const readmeData = await readmeResponse.json();
            const readmeContent = atob(readmeData.content);
            
            // Extract key information from README
            const lines = readmeContent.split('\n');
            let descriptionFound = false;
            
            for (let i = 0; i < Math.min(lines.length, 50); i++) {
              const line = lines[i].trim();
              
              // Look for description patterns
              if (!descriptionFound && (line.startsWith('#') || line.startsWith('##')) && line.length > 10) {
                const nextLine = lines[i + 1]?.trim();
                if (nextLine && !nextLine.startsWith('#') && !nextLine.startsWith('[') && nextLine.length > 20) {
                  detailedDescription = nextLine;
                  descriptionFound = true;
                }
              }
              
              // Look for technologies/tech stack
              if (line.toLowerCase().includes('tech') || line.toLowerCase().includes('stack') || line.toLowerCase().includes('built with')) {
                const techLine = lines[i + 1]?.trim();
                if (techLine) {
                  technologies.push(techLine.replace(/[-\*]/g, '').trim());
                }
              }
              
              // Look for features
              if (line.toLowerCase().includes('feature') || line.toLowerCase().includes('functionality')) {
                for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
                  const featureLine = lines[j]?.trim();
                  if (featureLine && (featureLine.startsWith('-') || featureLine.startsWith('*')) && featureLine.length > 10) {
                    features.push(featureLine.replace(/[-\*]/g, '').trim());
                  }
                }
              }
            }
          }
        } catch (readmeError) {
          console.log('Could not fetch README for', repo.name);
        }

        // Generate topic-based descriptions
        if (repo.topics && repo.topics.length > 0) {
          topicDescriptions = repo.topics.slice(0, 3).map(topic => getTopicDescription(topic));
        }

        // Create enhanced description
        let enhancedDescription = detailedDescription;
        
        if (topicDescriptions.length > 0) {
          enhancedDescription += `\n\nProject Type: ${topicDescriptions.join(', ')}`;
        }
        
        if (technologies.length > 0) {
          enhancedDescription += `\n\nTechnologies: ${technologies.slice(0, 3).join(', ')}`;
        }
        
        if (features.length > 0) {
          enhancedDescription += `\n\nKey Features: ${features.slice(0, 2).join(', ')}`;
        }

        return {
          title: repo.name,
          company: repo.full_name,
          location: repo.language || 'Various',
          startDate: new Date(repo.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
          endDate: repo.updated_at ? new Date(repo.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : 'Present',
          current: !repo.archived,
          description: enhancedDescription,
          url: repo.html_url,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          language: repo.language,
          topics: repo.topics || [],
          topicDescriptions: topicDescriptions,
          size: repo.size,
          watchers: repo.watchers_count
        };
      }));

      setGithubProjects(projects);
      
      // Auto-add GitHub projects to the projects section
      setFormData(prev => ({
        ...prev,
        projects: [...prev.projects, ...projects]
      }));

      alert(`Successfully fetched ${projects.length} GitHub projects with detailed descriptions!`);
    } catch (error) {
      console.error('GitHub API Error:', error);
      alert('Failed to fetch GitHub projects. Please check the username and try again.');
    } finally {
      setIsFetchingGithub(false);
    }
  };

  const handleArrayChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: value
    }));
  };

 const addEntry = () => {
  // Edit mode: currentEntry.index is set
  if (currentEntry.index !== undefined) {
    setFormData(prev => {
      const updated = [...prev[currentEntry.type]];
      updated[currentEntry.index] = {
        ...currentEntry,
        index: undefined
      };
      return { ...prev, [currentEntry.type]: updated };
    });
  } else {
    // Add new entry
    setFormData(prev => ({
      ...prev,
      [currentEntry.type]: [...prev[currentEntry.type], currentEntry]
    }));
  }

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
};


  const removeEntry = (section, index) => {
    setFormData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
  };

  const generateResume = () => {
    setIsGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      setIsGenerating(false);
      setActiveTab('preview');
    }, 2000);
  };

const saveResume = async () => {
  if (!formData.personalInfo?.fullName?.trim()) {
    toast.error('Please enter your full name!');
    return;
  }

  setIsSaving(true);

  try {
    const res = await fetch('/api/resume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personalInfo: formData.personalInfo,
        summary: formData.summary,
        skills: formData.skills,
        experience: formData.experience,
        education: formData.education,
        projects: formData.projects,
        certifications: formData.certifications,
        selectedTemplate
      }),
    });

    if (res.ok) {
      const saved = await res.json();
      toast.success('Resume saved successfully!', { duration: 4000 });

      window.history.replaceState(null, '', `/resume-builder/edit/${saved._id}`);

      document.title = `${formData.personalInfo.fullName.trim()} - Resume Builder`;
    } else {
      throw new Error();
    }
  } catch (err) {
    toast.error('Save failed — please try again');
  } finally {
    setIsSaving(false);
  }
};


  const generateMarkdown = () => {
    const { personalInfo, summary, skills, experience, education, projects, certifications } = formData;
    
    let markdown = `# ${personalInfo.fullName}\n\n`;
    
    // Contact Info
    markdown += `📧 ${personalInfo.email} | 📱 ${personalInfo.phone}\n`;
    if (personalInfo.address) markdown += `📍 ${personalInfo.address}\n`;
    if (personalInfo.linkedin) markdown += `💼 [LinkedIn](${personalInfo.linkedin})\n`;
    if (personalInfo.github) markdown += `🔗 [GitHub](${personalInfo.github})\n`;
    if (personalInfo.website) markdown += `🌐 [Website](${personalInfo.website})\n`;
    markdown += '\n---\n\n';

    // Summary
    if (summary) {
      markdown += `## Professional Summary\n\n${summary}\n\n`;
    }

    // Skills
    if (skills) {
      markdown += `## Skills\n\n${skills}\n\n`;
    }

    // Experience
    if (experience.length > 0) {
      markdown += `## Work Experience\n\n`;
      experience.forEach(exp => {
        markdown += `### ${exp.title} - ${exp.company}\n`;
        markdown += `*${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}*\n`;
        if (exp.location) markdown += `📍 ${exp.location}\n`;
        markdown += `\n${exp.description}\n\n`;
      });
    }

    // Education
    if (education.length > 0) {
      markdown += `## Education\n\n`;
      education.forEach(edu => {
        markdown += `### ${edu.title} - ${edu.company}\n`;
        markdown += `*${edu.startDate} - ${edu.current ? 'Present' : edu.endDate}*\n`;
        if (edu.location) markdown += `📍 ${edu.location}\n`;
        markdown += `\n${edu.description}\n\n`;
      });
    }

    // Projects
    if (projects.length > 0) {
      markdown += `## Projects\n\n`;
      projects.forEach(proj => {
        markdown += `### ${proj.title}\n`;
        markdown += `*${proj.startDate} - ${proj.current ? 'Present' : proj.endDate}*\n`;
        if (proj.location) markdown += `📍 ${proj.location}\n`;
        if (proj.url) markdown += `🔗 [View Project](${proj.url})\n`;
        if (proj.stars && proj.stars > 0) markdown += `⭐ ${proj.stars} stars | 🍴 ${proj.forks} forks\n`;
        markdown += `\n${proj.description}\n\n`;
      });
    }

    // Certifications
    if (certifications.length > 0) {
      markdown += `## Certifications\n\n`;
      certifications.forEach(cert => {
        markdown += `### ${cert.title} - ${cert.company}\n`;
        markdown += `*${cert.startDate} - ${cert.current ? 'Present' : cert.endDate}*\n`;
        if (cert.location) markdown += `📍 ${cert.location}\n`;
        markdown += `\n${cert.description}\n\n`;
      });
    }

    return markdown;
  };

  const generateProfessionalCV = () => {
    const { personalInfo, summary, skills, experience, education, projects, certifications } = formData;
    
    switch(selectedTemplate) {
      case 'modern':
        return (
          <div className="cv-template cv-modern">
            {/* Header */}
            <div className="cv-header">
              <h1 className="cv-name">{personalInfo.fullName || 'Your Name'}</h1>
              <div className="cv-contact">
                {personalInfo.email && <span>📧 {personalInfo.email}</span>}
                {personalInfo.phone && <span>📱 {personalInfo.phone}</span>}
                {personalInfo.address && <span>📍 {personalInfo.address}</span>}
                {personalInfo.linkedin && <span>💼 LinkedIn</span>}
                {personalInfo.github && <span>🔗 GitHub</span>}
                {personalInfo.website && <span>🌐 Website</span>}
              </div>
            </div>

            {/* Professional Summary */}
            {summary && (
              <div className="cv-section">
                <h2 className="cv-section-title">Professional Summary</h2>
                <p className="cv-summary">{summary}</p>
              </div>
            )}

            {/* Skills */}
            {skills && (
              <div className="cv-section">
                <h2 className="cv-section-title">Skills</h2>
                <p className="cv-skills">{skills}</p>
              </div>
            )}

            {/* Work Experience */}
            {experience.length > 0 && (
              <div className="cv-section">
                <h2 className="cv-section-title">Work Experience</h2>
                {experience.map((exp, index) => (
                  <div key={index} className="cv-item">
                    <div className="cv-item-header">
                      <h3 className="cv-item-title">{exp.title}</h3>
                      <span className="cv-item-company">{exp.company}</span>
                      <span className="cv-item-date">
                        {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                      </span>
                    </div>
                    {exp.location && <div className="cv-item-location">📍 {exp.location}</div>}
                    <div className="cv-item-description">{exp.description}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Education */}
            {education.length > 0 && (
              <div className="cv-section">
                <h2 className="cv-section-title">Education</h2>
                {education.map((edu, index) => (
                  <div key={index} className="cv-item">
                    <div className="cv-item-header">
                      <h3 className="cv-item-title">{edu.title}</h3>
                      <span className="cv-item-company">{edu.company}</span>
                      <span className="cv-item-date">
                        {edu.startDate} - {edu.current ? 'Present' : edu.endDate}
                      </span>
                    </div>
                    {edu.location && <div className="cv-item-location">📍 {edu.location}</div>}
                    <div className="cv-item-description">{edu.description}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Projects */}
            {projects.length > 0 && (
              <div className="cv-section">
                <h2 className="cv-section-title">Projects</h2>
                {projects.map((proj, index) => (
                  <div key={index} className="cv-item">
                    <div className="cv-item-header">
                      <h3 className="cv-item-title">{proj.title}</h3>
                      <span className="cv-item-company">{proj.company}</span>
                      <span className="cv-item-date">
                        {proj.startDate} - {proj.current ? 'Present' : proj.endDate}
                      </span>
                    </div>
                    {proj.location && <div className="cv-item-location">📍 {proj.location}</div>}
                    {proj.url && <div className="cv-item-link">🔗 <a href={proj.url} target="_blank" rel="noopener noreferrer">View Project</a></div>}
                    {proj.stars && proj.stars > 0 && (
                      <div className="cv-item-stats">⭐ {proj.stars} stars | 🍴 {proj.forks} forks</div>
                    )}
                    <div className="cv-item-description">{proj.description}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Certifications */}
            {certifications.length > 0 && (
              <div className="cv-section">
                <h2 className="cv-section-title">Certifications</h2>
                {certifications.map((cert, index) => (
                  <div key={index} className="cv-item">
                    <div className="cv-item-header">
                      <h3 className="cv-item-title">{cert.title}</h3>
                      <span className="cv-item-company">{cert.company}</span>
                      <span className="cv-item-date">
                        {cert.startDate} - {cert.current ? 'Present' : cert.endDate}
                      </span>
                    </div>
                    {cert.location && <div className="cv-item-location">📍 {cert.location}</div>}
                    <div className="cv-item-description">{cert.description}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'classic':
        return (
          <div className="cv-template cv-classic">
            {/* Header */}
            <div className="cv-header">
              <h1 className="cv-name">{personalInfo.fullName || 'Your Name'}</h1>
              <div className="cv-contact">
                {personalInfo.email && <span>{personalInfo.email}</span>}
                {personalInfo.phone && <span>{personalInfo.phone}</span>}
                {personalInfo.address && <span>{personalInfo.address}</span>}
                {personalInfo.linkedin && <span>LinkedIn: {personalInfo.linkedin}</span>}
                {personalInfo.github && <span>GitHub: {personalInfo.github}</span>}
                {personalInfo.website && <span>Website: {personalInfo.website}</span>}
              </div>
            </div>

            {/* Professional Summary */}
            {summary && (
              <div className="cv-section">
                <h2 className="cv-section-title">PROFESSIONAL SUMMARY</h2>
                <p className="cv-summary">{summary}</p>
              </div>
            )}

            {/* Skills */}
            {skills && (
              <div className="cv-section">
                <h2 className="cv-section-title">TECHNICAL SKILLS</h2>
                <p className="cv-skills">{skills}</p>
              </div>
            )}

            {/* Work Experience */}
            {experience.length > 0 && (
              <div className="cv-section">
                <h2 className="cv-section-title">PROFESSIONAL EXPERIENCE</h2>
                {experience.map((exp, index) => (
                  <div key={index} className="cv-item">
                    <div className="cv-item-header">
                      <h3 className="cv-item-title">{exp.title}</h3>
                      <span className="cv-item-company">{exp.company}</span>
                      <span className="cv-item-date">
                        {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                      </span>
                    </div>
                    {exp.location && <div className="cv-item-location">{exp.location}</div>}
                    <div className="cv-item-description">{exp.description}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Education */}
            {education.length > 0 && (
              <div className="cv-section">
                <h2 className="cv-section-title">EDUCATION</h2>
                {education.map((edu, index) => (
                  <div key={index} className="cv-item">
                    <div className="cv-item-header">
                      <h3 className="cv-item-title">{edu.title}</h3>
                      <span className="cv-item-company">{edu.company}</span>
                      <span className="cv-item-date">
                        {edu.startDate} - {edu.current ? 'Present' : edu.endDate}
                      </span>
                    </div>
                    {edu.location && <div className="cv-item-location">{edu.location}</div>}
                    <div className="cv-item-description">{edu.description}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Projects */}
            {projects.length > 0 && (
              <div className="cv-section">
                <h2 className="cv-section-title">PROJECTS</h2>
                {projects.map((proj, index) => (
                  <div key={index} className="cv-item">
                    <div className="cv-item-header">
                      <h3 className="cv-item-title">{proj.title}</h3>
                      <span className="cv-item-company">{proj.company}</span>
                      <span className="cv-item-date">
                        {proj.startDate} - {proj.current ? 'Present' : proj.endDate}
                      </span>
                    </div>
                    {proj.location && <div className="cv-item-location">{proj.location}</div>}
                    {proj.url && <div className="cv-item-link">Project Link: {proj.url}</div>}
                    {proj.stars && proj.stars > 0 && (
                      <div className="cv-item-stats">GitHub Stars: {proj.stars} | Forks: {proj.forks}</div>
                    )}
                    <div className="cv-item-description">{proj.description}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Certifications */}
            {certifications.length > 0 && (
              <div className="cv-section">
                <h2 className="cv-section-title">CERTIFICATIONS</h2>
                {certifications.map((cert, index) => (
                  <div key={index} className="cv-item">
                    <div className="cv-item-header">
                      <h3 className="cv-item-title">{cert.title}</h3>
                      <span className="cv-item-company">{cert.company}</span>
                      <span className="cv-item-date">
                        {cert.startDate} - {cert.current ? 'Present' : cert.endDate}
                      </span>
                    </div>
                    {cert.location && <div className="cv-item-location">{cert.location}</div>}
                    <div className="cv-item-description">{cert.description}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'creative':
        return (
          <div className="cv-template cv-creative">
            {/* Header */}
            <div className="cv-header">
              <h1 className="cv-name">{personalInfo.fullName || 'Your Name'}</h1>
              <div className="cv-contact">
                {personalInfo.email && <span>✉️ {personalInfo.email}</span>}
                {personalInfo.phone && <span>📞 {personalInfo.phone}</span>}
                {personalInfo.address && <span>🏠 {personalInfo.address}</span>}
                {personalInfo.linkedin && <span>💼 {personalInfo.linkedin}</span>}
                {personalInfo.github && <span>⚡ {personalInfo.github}</span>}
                {personalInfo.website && <span>🌐 {personalInfo.website}</span>}
              </div>
            </div>

            {/* Professional Summary */}
            {summary && (
              <div className="cv-section">
                <h2 className="cv-section-title">✨ About Me</h2>
                <p className="cv-summary">{summary}</p>
              </div>
            )}

            {/* Skills */}
            {skills && (
              <div className="cv-section">
                <h2 className="cv-section-title">🛠️ Skills & Expertise</h2>
                <p className="cv-skills">{skills}</p>
              </div>
            )}

            {/* Work Experience */}
            {experience.length > 0 && (
              <div className="cv-section">
                <h2 className="cv-section-title">💼 Work Experience</h2>
                {experience.map((exp, index) => (
                  <div key={index} className="cv-item">
                    <div className="cv-item-header">
                      <h3 className="cv-item-title">{exp.title}</h3>
                      <span className="cv-item-company">{exp.company}</span>
                      <span className="cv-item-date">
                        {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                      </span>
                    </div>
                    {exp.location && <div className="cv-item-location">📍 {exp.location}</div>}
                    <div className="cv-item-description">{exp.description}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Education */}
            {education.length > 0 && (
              <div className="cv-section">
                <h2 className="cv-section-title">🎓 Education</h2>
                {education.map((edu, index) => (
                  <div key={index} className="cv-item">
                    <div className="cv-item-header">
                      <h3 className="cv-item-title">{edu.title}</h3>
                      <span className="cv-item-company">{edu.company}</span>
                      <span className="cv-item-date">
                        {edu.startDate} - {edu.current ? 'Present' : edu.endDate}
                      </span>
                    </div>
                    {edu.location && <div className="cv-item-location">📍 {edu.location}</div>}
                    <div className="cv-item-description">{edu.description}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Projects */}
            {projects.length > 0 && (
              <div className="cv-section">
                <h2 className="cv-section-title">🚀 Projects</h2>
                {projects.map((proj, index) => (
                  <div key={index} className="cv-item">
                    <div className="cv-item-header">
                      <h3 className="cv-item-title">{proj.title}</h3>
                      <span className="cv-item-company">{proj.company}</span>
                      <span className="cv-item-date">
                        {proj.startDate} - {proj.current ? 'Present' : proj.endDate}
                      </span>
                    </div>
                    {proj.location && <div className="cv-item-location">📍 {proj.location}</div>}
                    {proj.url && <div className="cv-item-link">🔗 <a href={proj.url} target="_blank" rel="noopener noreferrer">View Project</a></div>}
                    {proj.stars && proj.stars > 0 && (
                      <div className="cv-item-stats">⭐ {proj.stars} stars | 🍴 {proj.forks} forks</div>
                    )}
                    <div className="cv-item-description">{proj.description}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Certifications */}
            {certifications.length > 0 && (
              <div className="cv-section">
                <h2 className="cv-section-title">🏆 Certifications</h2>
                {certifications.map((cert, index) => (
                  <div key={index} className="cv-item">
                    <div className="cv-item-header">
                      <h3 className="cv-item-title">{cert.title}</h3>
                      <span className="cv-item-company">{cert.company}</span>
                      <span className="cv-item-date">
                        {cert.startDate} - {cert.current ? 'Present' : cert.endDate}
                      </span>
                    </div>
                    {cert.location && <div className="cv-item-location">📍 {cert.location}</div>}
                    <div className="cv-item-description">{cert.description}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );


      default:
        return null;
    }
  };

  const generateProfessionalCVHTML = () => {
    const { personalInfo, summary, skills, experience, education, projects, certifications } = formData;
    
    let html = '';
    
    // Header
    html += '<div class="cv-header">';
    html += `<h1 class="cv-name">${personalInfo.fullName || 'Your Name'}</h1>`;
    html += '<div class="cv-contact">';
    if (personalInfo.email) html += `<span>📧 ${personalInfo.email}</span>`;
    if (personalInfo.phone) html += `<span>📱 ${personalInfo.phone}</span>`;
    if (personalInfo.address) html += `<span>📍 ${personalInfo.address}</span>`;
    if (personalInfo.linkedin) html += '<span>💼 LinkedIn</span>';
    if (personalInfo.github) html += '<span>🔗 GitHub</span>';
    if (personalInfo.website) html += '<span>🌐 Website</span>';
    html += '</div></div>';

    // Professional Summary
    if (summary) {
      html += '<div class="cv-section">';
      html += '<h2 class="cv-section-title">Professional Summary</h2>';
      html += `<p class="cv-summary">${summary}</p>`;
      html += '</div>';
    }

    // Skills
    if (skills) {
      html += '<div class="cv-section">';
      html += '<h2 class="cv-section-title">Skills</h2>';
      html += `<p class="cv-skills">${skills}</p>`;
      html += '</div>';
    }

    // Work Experience
    if (experience.length > 0) {
      html += '<div class="cv-section">';
      html += '<h2 class="cv-section-title">Work Experience</h2>';
      experience.forEach(exp => {
        html += '<div class="cv-item">';
        html += '<div class="cv-item-header">';
        html += `<h3 class="cv-item-title">${exp.title}</h3>`;
        html += `<span class="cv-item-company">${exp.company}</span>`;
        html += `<span class="cv-item-date">${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}</span>`;
        html += '</div>';
        if (exp.location) html += `<div class="cv-item-location">📍 ${exp.location}</div>`;
        html += `<div class="cv-item-description">${exp.description}</div>`;
        html += '</div>';
      });
      html += '</div>';
    }

    // Education
    if (education.length > 0) {
      html += '<div class="cv-section">';
      html += '<h2 class="cv-section-title">Education</h2>';
      education.forEach(edu => {
        html += '<div class="cv-item">';
        html += '<div class="cv-item-header">';
        html += `<h3 class="cv-item-title">${edu.title}</h3>`;
        html += `<span class="cv-item-company">${edu.company}</span>`;
        html += `<span class="cv-item-date">${edu.startDate} - ${edu.current ? 'Present' : edu.endDate}</span>`;
        html += '</div>';
        if (edu.location) html += `<div class="cv-item-location">📍 ${edu.location}</div>`;
        html += `<div class="cv-item-description">${edu.description}</div>`;
        html += '</div>';
      });
      html += '</div>';
    }

    // Projects
    if (projects.length > 0) {
      html += '<div class="cv-section">';
      html += '<h2 class="cv-section-title">Projects</h2>';
      projects.forEach(proj => {
        html += '<div class="cv-item">';
        html += '<div class="cv-item-header">';
        html += `<h3 class="cv-item-title">${proj.title}</h3>`;
        html += `<span class="cv-item-company">${proj.company}</span>`;
        html += `<span class="cv-item-date">${proj.startDate} - ${proj.current ? 'Present' : proj.endDate}</span>`;
        html += '</div>';
        if (proj.location) html += `<div class="cv-item-location">📍 ${proj.location}</div>`;
        if (proj.url) html += `<div class="cv-item-link">🔗 <a href="${proj.url}">View Project</a></div>`;
        if (proj.stars && proj.stars > 0) html += `<div class="cv-item-stats">⭐ ${proj.stars} stars | 🍴 ${proj.forks} forks</div>`;
        html += `<div class="cv-item-description">${proj.description}</div>`;
        html += '</div>';
      });
      html += '</div>';
    }

    // Certifications
    if (certifications.length > 0) {
      html += '<div class="cv-section">';
      html += '<h2 class="cv-section-title">Certifications</h2>';
      certifications.forEach(cert => {
        html += '<div class="cv-item">';
        html += '<div class="cv-item-header">';
        html += `<h3 class="cv-item-title">${cert.title}</h3>`;
        html += `<span class="cv-item-company">${cert.company}</span>`;
        html += `<span class="cv-item-date">${cert.startDate} - ${cert.current ? 'Present' : cert.endDate}</span>`;
        html += '</div>';
        if (cert.location) html += `<div class="cv-item-location">📍 ${cert.location}</div>`;
        html += `<div class="cv-item-description">${cert.description}</div>`;
        html += '</div>';
      });
      html += '</div>';
    }

    return html;
  };

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
            <Link href="/resume-builder/saved" className="flex items-center gap-2 text-purple-300 hover:text-white">
  <FileText className="w-5 h-5" />
  My Saved Resumes
</Link>
            <button
  onClick={saveResume}
  disabled={isSaving}
  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl hover:shadow-xl hover:shadow-purple-500/30 transition disabled:opacity-70"
>
  {isSaving ? (
    <>
      <Loader2 className="w-5 h-5 animate-spin" />
      Saving...
    </>
  ) : (
    <>
      <Save className="w-5 h-5" />
      Save Resume
    </>
  )}
</button>
<button
  onClick={downloadPDF}
  disabled={isGenerating}
  className={`flex items-center gap-2 text-white px-6 py-3 rounded-full hover:shadow-xl transition disabled:opacity-50 font-medium
    ${selectedTemplate === 'modern' 
      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-blue-500/30' 
      : selectedTemplate === 'classic' 
      ? 'bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black shadow-gray-700/40' 
      : 'bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 shadow-pink-500/40'
    }`}
>
  {isGenerating ? (
    <>
      <Loader2 className="w-5 h-5 animate-spin" />
      Generating PDF...
    </>
  ) : (
    <>
      <Download className="w-5 h-5" />
      Download PDF
    </>
  )}
</button>
          </div>
        </div>
      </div>

      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={12}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e1b4b',
            color: '#fff',
            borderRadius: '12px',
            padding: '16px 24px',
            fontSize: '16px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          },
          success: {
            icon: 'Saved',
            style: { background: '#10b981' },
          },
        }}
      />

      <section className="px-4 sm:px-6 lg:px-8 pt-10 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
              Resume <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">Builder</span>
            </h1>
            <p className="mt-4 text-lg text-gray-300">
              Create your professional resume with AI assistance
            </p>
          </div>

  {/* Template Selector - Professional Look */}
<div className="mb-10">
  <h3 className="text-2xl font-bold text-white mb-6 text-center">Choose Your CV Template</h3>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">

    {/* MODERN - Clean & Professional */}
    <div 
      className={`group p-8 border-4 rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${
        selectedTemplate === 'modern' 
          ? 'border-blue-500 bg-blue-500/10 shadow-2xl shadow-blue-500/20' 
          : 'border-white/30 bg-white/5 hover:border-blue-400 hover:bg-blue-500/5'
      }`}
      onClick={() => setSelectedTemplate('modern')}
    >
      <div className="text-center">
        <div className="w-20 h-28 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl mx-auto mb-4 shadow-lg"></div>
        <h4 className="text-xl font-bold text-white mb-2">Modern</h4>
        <p className="text-sm text-gray-300">Clean, Professional & ATS Friendly</p>
        {selectedTemplate === 'modern' && (
          <span className="inline-block mt-3 px-4 py-1 bg-blue-500 text-white text-xs rounded-full animate-pulse">
            Selected
          </span>
        )}
      </div>
    </div>

    {/* CLASSIC - Traditional */}
    <div 
      className={`group p-8 border-4 rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${
        selectedTemplate === 'classic' 
          ? 'border-gray-400 bg-gray-400/10 shadow-2xl shadow-gray-400/20' 
          : 'border-white/30 bg-white/5 hover:border-gray-300 hover:bg-gray-400/5'
      }`}
      onClick={() => setSelectedTemplate('classic')}
    >
      <div className="text-center">
        <div className="w-20 h-28 bg-gradient-to-br from-gray-800 to-black rounded-xl mx-auto mb-4 shadow-lg"></div>
        <h4 className="text-xl font-bold text-white mb-2">Classic</h4>
        <p className="text-sm text-gray-300">Formal & Traditional Style</p>
        {selectedTemplate === 'classic' && (
          <span className="inline-block mt-3 px-4 py-1 bg-gray-600 text-white text-xs rounded-full animate-pulse">
            Selected
          </span>
        )}
      </div>
    </div>

    {/* CREATIVE - Modern Creative (but white PDF) */}
    <div 
      className={`group p-8 border-4 rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${
        selectedTemplate === 'creative' 
          ? 'border-pink-500 bg-pink-500/10 shadow-2xl shadow-pink-500/20' 
          : 'border-white/30 bg-white/5 hover:border-pink-400 hover:bg-pink-500/5'
      }`}
      onClick={() => setSelectedTemplate('creative')}
    >
      <div className="text-center">
        <div className="w-20 h-28 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 rounded-xl mx-auto mb-4 shadow-lg"></div>
        <h4 className="text-xl font-bold text-white mb-2">Creative</h4>
        <p className="text-sm text-gray-300">Colorful UI • White PDF</p>
        {selectedTemplate === 'creative' && (
          <span className="inline-block mt-3 px-4 py-1 bg-pink-500 text-white text-xs rounded-full animate-pulse">
            Selected
          </span>
        )}
      </div>
    </div>

  </div>
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
                 onClick={() => {
    setIsGenerating(false);
    setActiveTab('preview');
  }}
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
                    Personal Information
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
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">LinkedIn</label>
                      <input
                        type="url"
                        value={formData.personalInfo.linkedin}
                        onChange={(e) => handleInputChange('personalInfo', 'linkedin', e.target.value)}
                        className="w-full rounded-2xl bg-slate-900/60 border border-white/10 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/60"
                        placeholder="https://linkedin.com/in/yourprofile"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">GitHub</label>
                      <input
                        type="url"
                        value={formData.personalInfo.github}
                        onChange={(e) => handleInputChange('personalInfo', 'github', e.target.value)}
                        className="w-full rounded-2xl bg-slate-900/60 border border-white/10 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/60"
                        placeholder="https://github.com/yourusername"
                      />
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Professional Summary</h3>
                  <textarea
                    value={formData.summary}
                    onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                    className="w-full rounded-2xl bg-slate-900/60 border border-white/10 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/60 h-32 resize-none"
                    placeholder="Write a compelling professional summary..."
                  />
                </div>

                {/* Skills */}
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Skills</h3>
                  <textarea
                    value={formData.skills}
                    onChange={(e) => setFormData(prev => ({ ...prev, skills: e.target.value }))}
                    className="w-full rounded-2xl bg-slate-900/60 border border-white/10 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/60 h-32 resize-none"
                    placeholder="List your key skills..."
                  />
                </div>

                {/* GitHub Integration */}
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <Github className="w-5 h-5" />
                    GitHub Projects Integration
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4">
                      <p className="text-gray-300 text-sm mb-4">
                        Enter your GitHub username to automatically fetch and add your repositories as projects to your resume.
                      </p>
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={githubUsername}
                          onChange={(e) => setGithubUsername(e.target.value)}
                          className="flex-1 rounded-2xl bg-slate-800 border border-white/10 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/60"
                          placeholder="Enter GitHub username (e.g., octocat)"
                        />
                        <button
                          onClick={fetchGithubProjects}
                          disabled={isFetchingGithub || !githubUsername.trim()}
                          className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 hover:shadow-xl transition"
                        >
                          {isFetchingGithub ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Fetching...
                            </>
                          ) : (
                            <>
                              <Github className="w-4 h-4" />
                              Fetch Projects
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    
                    {githubProjects.length > 0 && (
                      <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4">
                        <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          Fetched Projects ({githubProjects.length})
                        </h4>
                        <div className="space-y-3 max-h-60 overflow-y-auto">
                          {githubProjects.map((project, index) => (
                            <div key={index} className="bg-slate-800/50 rounded-xl p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-white font-medium text-sm">{project.title}</span>
                                    {project.language && (
                                      <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">
                                        {project.language}
                                      </span>
                                    )}
                                    {project.topics && project.topics.length > 0 && (
                                      <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                                        {project.topics[0]}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-gray-300 text-xs mb-2">
                                    {project.description.split('\n')[0]}
                                  </div>
                                  {project.description.includes('Project Type:') && (
                                    <div className="text-blue-300 text-xs mb-1 font-medium">
                                      📋 {project.description.split('Project Type:')[1]?.split('\n')[0]}
                                    </div>
                                  )}
                                  {project.description.includes('Technologies:') && (
                                    <div className="text-gray-400 text-xs mb-1">
                                      🔧 {project.description.split('Technologies:')[1]?.split('\n')[0]}
                                    </div>
                                  )}
                                  {project.description.includes('Key Features:') && (
                                    <div className="text-gray-400 text-xs mb-2">
                                      ⭐ {project.description.split('Key Features:')[1]?.split('\n')[0]}
                                    </div>
                                  )}
                                </div>
                                <a
                                  href={project.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-purple-400 hover:text-purple-300 transition ml-2"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  ⭐ {project.stars}
                                </span>
                                <span className="flex items-center gap-1">
                                  🍴 {project.forks}
                                </span>
                                <span className="flex items-center gap-1">
                                  👀 {project.watchers}
                                </span>
                                <span className="flex items-center gap-1">
                                  📅 {project.startDate}
                                </span>
                                <span className="flex items-center gap-1">
                                  📦 {Math.round(project.size / 1024)}KB
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Experience */}
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                      <Briefcase className="w-5 h-5" />
                      Work Experience
                    </h3>
                    <button
                      onClick={() => {
                        setCurrentEntry({ ...currentEntry, type: 'experience' });
                        setShowEntryForm(true);
                      }}
                      className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full hover:shadow-lg transition"
                    >
                      <Plus className="w-4 h-4" />
                      Add Experience
                    </button>
                  </div>
                  <div className="space-y-4">
                    {formData.experience.map((exp, index) => (
                      <div key={index} className="bg-slate-900/60 border border-white/10 rounded-2xl p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-white font-semibold">{exp.title}</h4>
                            <p className="text-gray-300 text-sm">{exp.company}</p>
                            <p className="text-gray-400 text-xs">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</p>
                          </div>
                          <button
                            onClick={() => removeEntry('experience', index)}
                            className="text-red-400 hover:text-red-300 transition"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Education */}
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                      <GraduationCap className="w-5 h-5" />
                      Education
                    </h3>
                    <button
                      onClick={() => {
                        setCurrentEntry({ ...currentEntry, type: 'education' });
                        setShowEntryForm(true);
                      }}
                      className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full hover:shadow-lg transition"
                    >
                      <Plus className="w-4 h-4" />
                      Add Education
                    </button>
                  </div>
                  <div className="space-y-4">
                    {formData.education.map((edu, index) => (
                      <div key={index} className="bg-slate-900/60 border border-white/10 rounded-2xl p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-white font-semibold">{edu.title}</h4>
                            <p className="text-gray-300 text-sm">{edu.company}</p>
                            <p className="text-gray-400 text-xs">{edu.startDate} - {edu.current ? 'Present' : edu.endDate}</p>
                          </div>
                          <button
                            onClick={() => removeEntry('education', index)}
                            className="text-red-400 hover:text-red-300 transition"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Projects */}
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                      <Code className="w-5 h-5" />
                      Projects
                    </h3>
                    <button
                     onClick={() => {
  setCurrentEntry({
    type: "projects",
    title: "",
    company: "",
    location: "",
    startDate: "",
    endDate: "",
    current: false,
    description: "",
    index: undefined
  });
  setShowEntryForm(true);
}}
                      className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full hover:shadow-lg transition"
                    >
                      <Plus className="w-4 h-4" />
                      Add Project
                    </button>
                  </div>
                  <div className="space-y-4">
                    {formData.projects.map((proj, index) => (
                      <div key={index} className="bg-slate-900/60 border border-white/10 rounded-2xl p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-white font-semibold">{proj.title}</h4>
                            <p className="text-gray-300 text-sm">{proj.company}</p>
                            <p className="text-gray-400 text-xs">{proj.startDate} - {proj.current ? 'Present' : proj.endDate}</p>
                          </div>
                          
                          <div className="flex items-center gap-3">
  <button
    onClick={() => {
      setCurrentEntry({ ...proj, index, type: "projects" });
      setShowEntryForm(true);
    }}
    className="text-blue-400 hover:text-blue-300 transition"
  >
    Edit
  </button>

  <button
    onClick={() => removeEntry('projects', index)}
    className="text-red-400 hover:text-red-300 transition"
  >
    <X className="w-4 h-4" />
  </button>
</div>

                        </div>
                      </div>
                    ))}
                  </div>
                </div>
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
  <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-4xl mx-auto">
    {/* Clean & Single Download Button */}
    <div className="flex justify-center mb-8">
      <button
        onClick={downloadPDF}
        disabled={isGenerating}
        className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-white font-semibold hover:shadow-2xl transition disabled:opacity-50 shadow-lg
          ${selectedTemplate === 'modern'
            ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
            : selectedTemplate === 'classic'
            ? 'bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-gray-950'
            : 'bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600'
          }`}
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin" />
            Generating PDF...
          </>
        ) : (
          <>
            <Download className="w-6 h-6" />
            Download PDF
          </>
        )}
      </button>
    </div>

    {/* Only ONE Resume Preview – Clean & Perfect */}
    
        <div 
  id="resume-pdf-content"
  className="bg-white mx-auto shadow-2xl rounded-2xl overflow-hidden"
  style={{
    width: '210mm',           // A4 width
    minHeight: '297mm',        // A4 height
    padding: '18mm 15mm',      // Top 18mm, sides 15mm → කිසිම කැපීමක් නැහැ
    boxSizing: 'border-box',
    background: 'white',
    margin: '20px auto',
    fontSize: '11pt',          // Print-friendly font size
    lineHeight: '1.5',
  }}
>
  {generateProfessionalCV()}
</div>
  </div>
)}

          {/* Entry Form Modal */}
          {showEntryForm && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 w-full max-w-2xl">
                <h3 className="text-xl font-semibold text-white mb-4">Add {currentEntry.type}</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Title</label>
                      <input
                        type="text"
                        value={currentEntry.title}
                        onChange={(e) => setCurrentEntry(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full rounded-2xl bg-slate-800 border border-white/10 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/60"
                        placeholder="Job Title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Company</label>
                      <input
                        type="text"
                        value={currentEntry.company}
                        onChange={(e) => setCurrentEntry(prev => ({ ...prev, company: e.target.value }))}
                        className="w-full rounded-2xl bg-slate-800 border border-white/10 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/60"
                        placeholder="Company Name"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Location</label>
                    <input
                      type="text"
                      value={currentEntry.location}
                      onChange={(e) => setCurrentEntry(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full rounded-2xl bg-slate-800 border border-white/10 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/60"
                      placeholder="City, Country"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Start Date</label>
                      <input
                        type="month"
                        value={currentEntry.startDate}
                        onChange={(e) => setCurrentEntry(prev => ({ ...prev, startDate: e.target.value }))}
                        className="w-full rounded-2xl bg-slate-800 border border-white/10 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/60"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">End Date</label>
                      <input
                        type="month"
                        value={currentEntry.endDate}
                        onChange={(e) => setCurrentEntry(prev => ({ ...prev, endDate: e.target.value }))}
                        disabled={currentEntry.current}
                        className="w-full rounded-2xl bg-slate-800 border border-white/10 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/60 disabled:opacity-50"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="current"
                      checked={currentEntry.current}
                      onChange={(e) => setCurrentEntry(prev => ({ ...prev, current: e.target.checked }))}
                      className="rounded"
                    />
                    <label htmlFor="current" className="text-sm text-gray-300">Currently working here</label>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Description</label>
                    <textarea
                      value={currentEntry.description}
                      onChange={(e) => setCurrentEntry(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full rounded-2xl bg-slate-800 border border-white/10 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/60 h-32 resize-none"
                      placeholder="Describe your role and achievements..."
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowEntryForm(false)}
                    className="px-6 py-3 bg-white/10 text-white rounded-2xl hover:bg-white/20 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addEntry}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl hover:shadow-lg transition"
                  >
                    Add Entry
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    
    </div>
    
  );
}
