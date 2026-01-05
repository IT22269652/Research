"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { ArrowRight, ArrowLeft, Loader2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { InterviewType } from '@/services/Constants' // Ensure this path is correct
import { useToast } from "@/hooks/use-toast"

export default function CreateInterview() {
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    jobPosition: '',
    jobDescription: '',
    questionCount: 10,
    type: []
  });
  const [loading, setLoading] = useState(false);

  const onHandleInputChanges = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleType = (title) => {
    setFormData(prev => {
      const isExist = prev.type.includes(title);
      const updatedTypes = isExist 
        ? prev.type.filter(t => t !== title) 
        : [...prev.type, title];
      return { ...prev, type: updatedTypes };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // --- Validation Checks ---
    if (!formData.jobPosition) {
      toast({ title: "Error", description: "Please select a job position", variant: "destructive" });
      return;
    }
    if (!formData.jobDescription) {
      toast({ title: "Error", description: "Please enter a job description", variant: "destructive" });
      return;
    }
    if (formData.type.length === 0) {
      toast({ title: "Error", description: "Please select at least one interview type", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      // Calling Node.js Backend (Port 5000)
      const res = await fetch("http://localhost:5000/api/interview/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        toast({
          title: "Success! 🎉",
          description: "Interview questions generated successfully",
          className: "bg-green-500/20 border-green-500",
        });
        
        // --- UPDATED REDIRECT HERE ---
        // We use query params so we only need ONE Results page
        setTimeout(() => {
          router.push(`/InterviewDashboard/Results?id=${data.id}`);
        }, 500);
        
      } else {
        toast({ title: "Error", description: data.message || "Failed to generate", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error:", error);
      toast({ title: "Connection Error", description: "Could not connect to backend.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-10">
      <div className="flex items-center gap-5 justify-center relative mb-8">
        <ArrowLeft 
          onClick={() => router.back()} 
          className='cursor-pointer absolute left-0 text-gray-300 hover:text-white transition-colors' 
        />
        <h2 className="font-bold text-3xl text-gray-100">Create New Interview</h2>
      </div>

      <div className='px-10 mt-8'>
        <div className='p-10 bg-slate-800/40 backdrop-blur-sm rounded-2xl shadow-2xl max-w-4xl mx-auto border border-slate-700/50'>
          
          {/* Job Position */}
          <div>
            <h2 className='text-base font-semibold mb-3 text-gray-200'>Job Position</h2>
            <Select onValueChange={(v) => onHandleInputChanges('jobPosition', v)} value={formData.jobPosition}>
              <SelectTrigger className="w-full h-12 bg-slate-900/50 border-slate-600/50 text-gray-100">
                <SelectValue placeholder="Select a job position" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700/50 text-white">
                <SelectItem value="Full Stack Developer">Full Stack Developer</SelectItem>
                <SelectItem value="Frontend Developer">Frontend Developer</SelectItem>
                <SelectItem value="Backend Developer">Backend Developer</SelectItem>
                <SelectItem value="Data Science">Data Science</SelectItem>
                <SelectItem value="AI Engineering">AI Engineering</SelectItem>
                <SelectItem value="UX/UI Designer">UX/UI Designer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Job Description */}
          <div className='mt-8'>
            <h2 className='text-base font-semibold mb-3 text-gray-200'>Job Description</h2>
            <Textarea 
              placeholder='Paste job requirements here...' 
              className='h-[150px] bg-slate-900/50 border-slate-600/50 text-gray-100'
              value={formData.jobDescription}
              onChange={(e) => onHandleInputChanges('jobDescription', e.target.value)} 
            />
          </div>  

          {/* Question Count */}
          <div className='mt-8'>
            <h2 className='text-base font-semibold mb-3 text-gray-200'>Question Count</h2>
            <Select onValueChange={(v) => onHandleInputChanges('questionCount', Number(v))} value={String(formData.questionCount)}>
              <SelectTrigger className="w-full bg-slate-900/50 border-slate-600/50 text-white">
                <SelectValue placeholder="Select count" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 text-white">
                <SelectItem value="5">5 Questions</SelectItem>
                <SelectItem value="10">10 Questions</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Interview Types */}
          <div className='mt-8'>
            <h2 className='text-base font-semibold mb-3 text-gray-200'>Interview Type</h2>
            <div className='flex gap-3 flex-wrap mt-4'>
              {InterviewType.map((item, index) => (
                <div 
                  key={index} 
                  onClick={() => toggleType(item.title)}
                  className={`flex items-center cursor-pointer gap-2 py-3 px-6 border rounded-xl transition-all ${
                    formData.type.includes(item.title) 
                      ? 'bg-purple-600/20 text-purple-300 border-purple-500/50 scale-105 shadow-lg' 
                      : 'bg-slate-900/50 border-slate-600/50 text-gray-300 hover:bg-slate-800/50'
                  }`}
                >
                  <item.icon className='h-5 w-5'/>
                  <span className='text-sm font-medium'>{item.title}</span>
                </div>
              ))}
            </div>
          </div> 
          
          <div className='mt-10 flex justify-end'>
            <Button onClick={handleSubmit} disabled={loading} className="bg-purple-600 hover:bg-purple-700">
              {loading ? <><Loader2 className='mr-2 h-4 w-4 animate-spin'/> Generating...</> : "Generate Questions"}
            </Button>
          </div> 
        </div>
      </div>
    </div>
  )
}