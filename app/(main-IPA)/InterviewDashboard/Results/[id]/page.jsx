"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function ResultPage() {
  const { id } = useParams(); // Gets ID from URL
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetch(`http://localhost:5000/api/interview/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setData(data);
          setLoading(false);
        })
        .catch(err => console.error("Error fetching:", err));
    }
  }, [id]);

  if (loading) return <div className="p-10 text-white">Generating your questions...</div>;

  return (
    <div className="p-10 min-h-screen bg-slate-900 text-gray-100">
      <h1 className="text-3xl font-bold mb-2 text-purple-400">Your AI Interview Guide</h1>
      <p className="text-gray-400 mb-8">Position: {data?.jobPosition}</p>
      
      <div className="grid gap-4">
        {data?.questions?.map((q, i) => (
          <div key={i} className="p-5 bg-slate-800 border border-slate-700 rounded-xl">
            <p className="text-sm text-purple-400 font-mono mb-1">Question {i + 1}</p>
            <p className="text-lg">{q}</p>
          </div>
        ))}
      </div>
    </div>
  );
}