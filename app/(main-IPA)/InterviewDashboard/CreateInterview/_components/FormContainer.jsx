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

function FormContainer({onHandleInputChanges}) {
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
          <Input 
            placeholder="e.g. Full Stack Developer" 
            className='mt-2 h-12 bg-slate-900/50 border-slate-600/50 text-gray-100 placeholder:text-gray-500 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20'
            onChange={(event) => onHandleInputChanges('jobPosition', event.target.value)}
          />
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
          <h2 className='text-base font-semibold mb-3 text-gray-200'>Interview Duration</h2>
          <Select onValueChange={(value) => onHandleInputChanges('duration', value)}>
            <SelectTrigger className="w-full mt-2 h-12 bg-slate-900/50 border-slate-600/50 text-gray-100 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20">
              <SelectValue placeholder="15 Min" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700/50 backdrop-blur-lg">
              <SelectItem value="5 Min" className="text-gray-100 hover:bg-purple-600/20 focus:bg-purple-600/20">5 Min</SelectItem>
              <SelectItem value="15 Min" className="text-gray-100 hover:bg-purple-600/20 focus:bg-purple-600/20">15 Min</SelectItem>
              <SelectItem value="30 Min" className="text-gray-100 hover:bg-purple-600/20 focus:bg-purple-600/20">30 Min</SelectItem>
              <SelectItem value="45 Min" className="text-gray-100 hover:bg-purple-600/20 focus:bg-purple-600/20">45 Min</SelectItem>
              <SelectItem value="60 Min" className="text-gray-100 hover:bg-purple-600/20 focus:bg-purple-600/20">60 Min</SelectItem>
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
          <Button className='px-8 h-12 gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-all duration-300 transform hover:scale-105 rounded-xl font-semibold'>
            Generate Question <ArrowRight className='h-4 w-4' /> 
          </Button>
        </div> 
      </div>
    </div>
  )
}

export default FormContainer