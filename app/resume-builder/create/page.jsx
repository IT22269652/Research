'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Download, Eye, Plus, X, Sparkles, Loader2, User, Mail, Phone, MapPin, Briefcase, GraduationCap, Code, Award, Github, ExternalLink, FileText } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';

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
  // Auto-load last saved resume
  const saved = localStorage.getItem('resume_data_v1');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      setFormData(parsed.formData);
      setSelectedTemplate(parsed.selectedTemplate || 'modern');
      console.log('Resume loaded from localStorage');
    } catch (e) {
      console.log('No valid saved resume found');
    }
  }
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
    if (currentEntry.title && currentEntry.company) {
      const newEntry = { ...currentEntry };
      setFormData(prev => ({
        ...prev,
        [currentEntry.type]: [...prev[currentEntry.type], newEntry]
      }));
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
    }
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
  setIsSaving(true);
  try {
    const response = await fetch('/api/resume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ formData, selectedTemplate }),
    });

    const result = await response.json();

    if (result.success) {
      toast.success(result.message);
    } else {
      toast.info(result.message || 'Saved locally only.');
    }
  } catch (error) {
    console.error('Save failed:', error);
    toast.info('Saved locally only.');
  } finally {
    setIsSaving(false);
  }
};
  const downloadPDF = async () => {
    setIsGenerating(true);
    try {
      // Create a completely isolated PDF using jsPDF directly
      const jsPDF = (await import('jspdf')).default;
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const { personalInfo, summary, skills, experience, education, projects, certifications } = formData;
      
      // Set font
      pdf.setFont('helvetica');
      
      // Header
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text(personalInfo.fullName || 'Your Name', 105, 30, { align: 'center' });
      
      // Contact info
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      let contactY = 40;
      const contactInfo = [];
      if (personalInfo.email) contactInfo.push(`Email: ${personalInfo.email}`);
      if (personalInfo.phone) contactInfo.push(`Phone: ${personalInfo.phone}`);
      if (personalInfo.address) contactInfo.push(`Address: ${personalInfo.address}`);
      if (personalInfo.linkedin) contactInfo.push(`LinkedIn: ${personalInfo.linkedin}`);
      if (personalInfo.github) contactInfo.push(`GitHub: ${personalInfo.github}`);
      if (personalInfo.website) contactInfo.push(`Website: ${personalInfo.website}`);
      
      const contactText = contactInfo.join(' | ');
      const contactLines = pdf.splitTextToSize(contactText, 190);
      pdf.text(contactLines, 105, contactY, { align: 'center' });
      
      let currentY = contactY + (contactLines.length * 5) + 10;
      
      // Professional Summary
      if (summary) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        const summaryTitle = selectedTemplate === 'classic' ? 'PROFESSIONAL SUMMARY' : 
                            selectedTemplate === 'creative' ? '✨ About Me' : 'Professional Summary';
        pdf.text(summaryTitle, 20, currentY);
        currentY += 10;
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        const summaryLines = pdf.splitTextToSize(summary, 170);
        pdf.text(summaryLines, 20, currentY);
        currentY += (summaryLines.length * 5) + 10;
      }
      
      // Skills
      if (skills) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        const skillsTitle = selectedTemplate === 'classic' ? 'TECHNICAL SKILLS' : 
                           selectedTemplate === 'creative' ? '🛠️ Skills & Expertise' : 'Skills';
        pdf.text(skillsTitle, 20, currentY);
        currentY += 10;
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        const skillsLines = pdf.splitTextToSize(skills, 170);
        pdf.text(skillsLines, 20, currentY);
        currentY += (skillsLines.length * 5) + 10;
      }
      
      // Work Experience
      if (experience.length > 0) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        const experienceTitle = selectedTemplate === 'classic' ? 'PROFESSIONAL EXPERIENCE' : 
                               selectedTemplate === 'creative' ? '💼 Work Experience' : 'Work Experience';
        pdf.text(experienceTitle, 20, currentY);
        currentY += 10;
        
        experience.forEach(exp => {
          if (currentY > 270) {
            pdf.addPage();
            currentY = 20;
          }
          
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.text(exp.title, 20, currentY);
          
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          pdf.text(exp.company, 20, currentY + 5);
          pdf.text(`${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}`, 150, currentY + 5);
          
          if (exp.location) {
            pdf.text(`Location: ${exp.location}`, 20, currentY + 10);
            currentY += 5;
          }
          
          currentY += 15;
          
          if (exp.description) {
            const descLines = pdf.splitTextToSize(exp.description, 170);
            pdf.text(descLines, 20, currentY);
            currentY += (descLines.length * 5) + 10;
          }
        });
      }
      
      // Education
      if (education.length > 0) {
        if (currentY > 250) {
          pdf.addPage();
          currentY = 20;
        }
        
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        const educationTitle = selectedTemplate === 'classic' ? 'EDUCATION' : 
                              selectedTemplate === 'creative' ? '🎓 Education' : 'Education';
        pdf.text(educationTitle, 20, currentY);
        currentY += 10;
        
        education.forEach(edu => {
          if (currentY > 270) {
            pdf.addPage();
            currentY = 20;
          }
          
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.text(edu.title, 20, currentY);
          
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          pdf.text(edu.company, 20, currentY + 5);
          pdf.text(`${edu.startDate} - ${edu.current ? 'Present' : edu.endDate}`, 150, currentY + 5);
          
          if (edu.location) {
            pdf.text(`Location: ${edu.location}`, 20, currentY + 10);
            currentY += 5;
          }
          
          currentY += 15;
          
          if (edu.description) {
            const descLines = pdf.splitTextToSize(edu.description, 170);
            pdf.text(descLines, 20, currentY);
            currentY += (descLines.length * 5) + 10;
          }
        });
      }
      
      // Projects
      if (projects.length > 0) {
        if (currentY > 250) {
          pdf.addPage();
          currentY = 20;
        }
        
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        const projectsTitle = selectedTemplate === 'classic' ? 'PROJECTS' : 
                             selectedTemplate === 'creative' ? '🚀 Projects' : 'Projects';
        pdf.text(projectsTitle, 20, currentY);
        currentY += 10;
        
        projects.forEach(proj => {
          if (currentY > 270) {
            pdf.addPage();
            currentY = 20;
          }
          
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.text(proj.title, 20, currentY);
          
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          pdf.text(proj.company, 20, currentY + 5);
          pdf.text(`${proj.startDate} - ${proj.current ? 'Present' : proj.endDate}`, 150, currentY + 5);
          
          if (proj.location) {
            pdf.text(`Location: ${proj.location}`, 20, currentY + 10);
            currentY += 5;
          }
          
          if (proj.url) {
            pdf.text(`Link: ${proj.url}`, 20, currentY + 10);
            currentY += 5;
          }
          
          if (proj.stars && proj.stars > 0) {
            pdf.text(`Stars: ${proj.stars} | Forks: ${proj.forks}`, 20, currentY + 10);
            currentY += 5;
          }
          
          currentY += 15;
          
          if (proj.description) {
            const descLines = pdf.splitTextToSize(proj.description, 170);
            pdf.text(descLines, 20, currentY);
            currentY += (descLines.length * 5) + 10;
          }
        });
      }
      
      // Certifications
      if (certifications.length > 0) {
        if (currentY > 250) {
          pdf.addPage();
          currentY = 20;
        }
        
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        const certificationsTitle = selectedTemplate === 'classic' ? 'CERTIFICATIONS' : 
                                   selectedTemplate === 'creative' ? '🏆 Certifications' : 'Certifications';
        pdf.text(certificationsTitle, 20, currentY);
        currentY += 10;
        
        certifications.forEach(cert => {
          if (currentY > 270) {
            pdf.addPage();
            currentY = 20;
          }
          
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.text(cert.title, 20, currentY);
          
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          pdf.text(cert.company, 20, currentY + 5);
          pdf.text(`${cert.startDate} - ${cert.current ? 'Present' : cert.endDate}`, 150, currentY + 5);
          
          if (cert.location) {
            pdf.text(`Location: ${cert.location}`, 20, currentY + 10);
            currentY += 5;
          }
          
          currentY += 15;
          
          if (cert.description) {
            const descLines = pdf.splitTextToSize(cert.description, 170);
            pdf.text(descLines, 20, currentY);
            currentY += (descLines.length * 5) + 10;
          }
        });
      }
      
      // Save the PDF
      pdf.save(`${formData.personalInfo.fullName || 'resume'}_resume.pdf`);
      
      alert('PDF downloaded successfully!');
    } catch (error) {
      console.error('PDF generation error:', error);
      
      // Fallback: Download as text file
      try {
        const markdownContent = generateMarkdown();
        const blob = new Blob([markdownContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${formData.personalInfo.fullName || 'resume'}_resume.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        alert('PDF generation failed. Downloaded as text file instead.');
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
        alert('Failed to generate PDF. Please try again.');
      }
    } finally {
      setIsGenerating(false);
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
            <button
              onClick={saveResume}
              disabled={isSaving}
              className="flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-full hover:bg-white/20 transition disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={downloadPDF}
              disabled={isGenerating}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full hover:shadow-lg transition disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
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

          {/* Template Selector */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-4 text-center">Choose CV Template</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              <div 
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  selectedTemplate === 'modern' 
                    ? 'border-purple-500 bg-purple-500/20' 
                    : 'border-white/20 hover:border-white/40 bg-white/5'
                }`}
                onClick={() => setSelectedTemplate('modern')}
              >
                <div className="text-center">
                  <div className="w-16 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded mx-auto mb-2"></div>
                  <h4 className="font-semibold text-white">Modern</h4>
                  <p className="text-sm text-gray-300">Clean & Professional</p>
                </div>
              </div>
              
              <div 
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  selectedTemplate === 'classic' 
                    ? 'border-purple-500 bg-purple-500/20' 
                    : 'border-white/20 hover:border-white/40 bg-white/5'
                }`}
                onClick={() => setSelectedTemplate('classic')}
              >
                <div className="text-center">
                  <div className="w-16 h-20 bg-gradient-to-br from-gray-700 to-gray-900 rounded mx-auto mb-2"></div>
                  <h4 className="font-semibold text-white">Classic</h4>
                  <p className="text-sm text-gray-300">Traditional & Formal</p>
                </div>
              </div>
              
              <div 
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  selectedTemplate === 'creative' 
                    ? 'border-purple-500 bg-purple-500/20' 
                    : 'border-white/20 hover:border-white/40 bg-white/5'
                }`}
                onClick={() => setSelectedTemplate('creative')}
              >
                <div className="text-center">
                  <div className="w-16 h-20 bg-gradient-to-br from-pink-500 to-orange-500 rounded mx-auto mb-2"></div>
                  <h4 className="font-semibold text-white">Creative</h4>
                  <p className="text-sm text-gray-300">Colorful & Unique</p>
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
                          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-2xl hover:shadow-lg transition disabled:opacity-50 flex items-center gap-2"
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
                        setCurrentEntry({ ...currentEntry, type: 'projects' });
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
                          <button
                            onClick={() => removeEntry('projects', index)}
                            className="text-red-400 hover:text-red-300 transition"
                          >
                            <X className="w-4 h-4" />
                          </button>
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
            <div className="space-y-6">
              {/* PDF Download Button */}
              <div className="flex justify-center">
                <button
                  onClick={downloadPDF}
                  disabled={isGenerating}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-2xl hover:shadow-lg transition disabled:opacity-50 flex items-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating PDF...
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5" />
                      Download PDF
                    </>
                  )}
                </button>
              </div>

              {/* Resume Preview */}
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
                <div id="resume-pdf-content" className="bg-white text-black rounded-2xl p-8 min-h-[800px] pdf-safe">
                  {generateProfessionalCV()}
                </div>
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
