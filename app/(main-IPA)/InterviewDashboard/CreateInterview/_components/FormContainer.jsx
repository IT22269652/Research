
import React from 'react';

export default function FormContainer({ onHandleInputChanges }) {
  return (
    <div className="max-w-2xl mx-auto bg-slate-900/40 border border-white/10 rounded-2xl p-6">
      <p className="text-gray-300 mb-4">Simple placeholder form (add fields as needed):</p>
      <div className="grid grid-cols-1 gap-3">
        <input
          type="text"
          placeholder="Interview Title"
          onChange={(e) => onHandleInputChanges('title', e.target.value)}
          className="rounded-2xl bg-slate-800 border border-white/10 px-4 py-2 text-white"
        />
        <input
          type="text"
          placeholder="Candidate Name"
          onChange={(e) => onHandleInputChanges('candidate', e.target.value)}
          className="rounded-2xl bg-slate-800 border border-white/10 px-4 py-2 text-white"
        />
        <button
          onClick={() => alert('This is a placeholder — implement steps as needed')}
          className="mt-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-2xl"
        >
          Next
        </button>
      </div>
    </div>
  );
}
"use client"
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import React, { useEffect, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { InterviewType } from '@/services/Constants'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

function FormContainer({onHandleInputChanges, handleSubmit}) {
  const [interviewType, setInterviewType] = useState([]);

  useEffect(() => {
    onHandleInputChanges('type', interviewType)
  }, [interviewType])

  const toggleType = (title) => {
    setInterviewType(prev => {
      if (prev.includes(title)) {
        return prev.filter(t => t !== title);
      } else {
        return [...prev, title];
      }
    });
  };

  return (
    <div className='px-10 mt-8'>
      <div className='p-10 bg-slate-800/40 backdrop-blur-sm rounded-2xl shadow-2xl max-w-4xl mx-auto border border-slate-700/50'>
        <div>
          <h2 className='text-base font-semibold mb-3 text-gray-200'>Job Position</h2>
          <Select onValueChange={(value) => onHandleInputChanges('jobPosition', value)}>
            <SelectTrigger className="w-full mt-2 h-12 bg-slate-900/50 border-slate-600/50 text-gray-100 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20">
              <SelectValue placeholder="Select a job position" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700/50 backdrop-blur-lg max-h-[300px]">
              <SelectItem value="Data Science" className="text-gray-100 hover:bg-purple-600/20 focus:bg-purple-600/20">Data Science</SelectItem>
              <SelectItem value="Full Stack Developer" className="text-gray-100 hover:bg-purple-600/20 focus:bg-purple-600/20">Full Stack Developer</SelectItem>
              <SelectItem value="Frontend Developer" className="text-gray-100 hover:bg-purple-600/20 focus:bg-purple-600/20">Frontend Developer</SelectItem>
              <SelectItem value="Backend Developer" className="text-gray-100 hover:bg-purple-600/20 focus:bg-purple-600/20">Backend Developer</SelectItem>
              <SelectItem value="UX/UI Designer" className="text-gray-100 hover:bg-purple-600/20 focus:bg-purple-600/20">UX/UI Designer</SelectItem>
              <SelectItem value="Cyber Security" className="text-gray-100 hover:bg-purple-600/20 focus:bg-purple-600/20">Cyber Security</SelectItem>
              <SelectItem value="Networking" className="text-gray-100 hover:bg-purple-600/20 focus:bg-purple-600/20">Networking</SelectItem>
              <SelectItem value="Computer Science" className="text-gray-100 hover:bg-purple-600/20 focus:bg-purple-600/20">Computer Science</SelectItem>
              <SelectItem value="Interactive Media" className="text-gray-100 hover:bg-purple-600/20 focus:bg-purple-600/20">Interactive Media</SelectItem>
              <SelectItem value="Information System Engineering" className="text-gray-100 hover:bg-purple-600/20 focus:bg-purple-600/20">Information System Engineering</SelectItem>
              <SelectItem value="AI Engineering" className="text-gray-100 hover:bg-purple-600/20 focus:bg-purple-600/20">AI Engineering</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='mt-8'>
          <h2 className='text-base font-semibold mb-3 text-gray-200'>Job Description</h2>
          <Textarea 
            placeholder='Enter details job description' 
            className='h-[200px] mt-2 resize-none bg-slate-900/50 border-slate-600/50 text-gray-100 placeholder:text-gray-500 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20'
            onChange={(event) => onHandleInputChanges('jobDescription', event.target.value)} 
          />
        </div>  

       <div className='mt-8'>
  <h2 className='text-base font-semibold mb-3 text-gray-200'>
    Question Count
  </h2>
  <Select onValueChange={(value) => onHandleInputChanges('questionCount', Number(value))}>
    <SelectTrigger className="w-full mt-2 h-12 bg-slate-900/50 border-slate-600/50">
      <SelectValue placeholder="Select question count" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="10">10 Questions</SelectItem>
      <SelectItem value="15">15 Questions</SelectItem>
      <SelectItem value="20">20 Questions</SelectItem>
    </SelectContent>
  </Select>
</div>


        <div className='mt-8'>
          <h2 className='text-base font-semibold mb-3 text-gray-200'>Interview Type</h2>
          <div className='flex gap-3 flex-wrap mt-4'>
            {InterviewType.map((type, index) => (
              <div 
                key={index} 
                onClick={() => toggleType(type.title)}
                className={`flex items-center cursor-pointer gap-2 py-3 px-6 border rounded-xl transition-all duration-300 ${
                  interviewType.includes(type.title) 
                    ? 'bg-purple-600/20 text-purple-300 border-purple-500/50 shadow-lg shadow-purple-500/20 scale-105' 
                    : 'bg-slate-900/50 border-slate-600/50 text-gray-300 hover:border-purple-500/30 hover:bg-slate-800/50 hover:text-gray-100'
                }`}
              >
                <type.icon className='h-5 w-5'/>
                <span className='text-sm font-medium'>{type.title}</span>
              </div>
            ))}
          </div>
        </div> 
        
        <div className='mt-10 flex justify-end'>
          <Button onClick={handleSubmit}>
              Generate Question <ArrowRight />
          </Button>

        </div> 
      </div>
    </div>
  )
}

export default FormContainer
