"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Save, Download, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Loader2, ArrowLeft } from "lucide-react";
import { getCoverLetter, saveCoverLetter } from "@/actions/cover-letter";

export default function EditCoverLetterPage({ params }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [letterData, setLetterData] = useState(null);
  const [contentHtml, setContentHtml] = useState("");
  
  const editorRef = useRef(null);

  // 1. Data Load කිරීම
  useEffect(() => {
    async function fetchLetter() {
      const resolvedParams = await params; 
      const id = resolvedParams?.id;

      if (!id) return;

      try {
        const data = await getCoverLetter(id);
        if (data) {
          setLetterData(data);
          setContentHtml(data.content);
          
          if (editorRef.current) {
            editorRef.current.innerHTML = data.content;
          }
        } else {
          alert("Cover letter not found!");
          router.push("/resume-builder/cover-letter");
        }
      } catch (err) {
        console.error("Failed to load letter", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLetter();
  }, [params, router]);

  // 2. Formatting Function
  const formatDoc = (cmd) => {
    document.execCommand(cmd, false, null);
    if (editorRef.current) {
        editorRef.current.focus();
    }
  };

  // 3. Save Function
  const handleSave = async () => {
    if (!letterData || !editorRef.current) return;
    
    const currentContent = editorRef.current.innerHTML;
    setSaving(true);

    try {
      const result = await saveCoverLetter(letterData.id, currentContent);
      
      if (result.success) {
        alert("Saved Successfully!");
        router.push("/resume-builder/cover-letter"); 
      } else {
        alert("Save failed: " + (result.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error saving:", error);
      alert("An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  // 4. Download Function (අලුතෙන් එකතු කළ කොටස)
  const handleDownloadPDF = async () => {
    if (!editorRef.current) return;

    try {
      // html2pdf library එක dynamic import කරනවා
      const html2pdf = (await import("html2pdf.js")).default;
      const element = editorRef.current;
      
      const opt = {
        margin:       [15, 15, 15, 15], // mm
        filename:     `${letterData.jobTitle.replace(/\s+/g, '_')}_Cover_Letter.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true }, // High Quality Print
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error("PDF generation failed", err);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#2e0249]">
        <Loader2 className="w-10 h-10 text-white animate-spin" />
      </div>
    );
  }

  if (!letterData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      
      {/* --- Title Area --- */}
      <div className="max-w-5xl mx-auto mb-6 text-center relative">
        <button 
            onClick={() => router.back()}
            className="absolute left-0 top-1 text-white/70 hover:text-white flex items-center gap-2"
        >
            <ArrowLeft size={20} /> Back
        </button>
        <h1 className="text-3xl font-bold text-white">
          {letterData.jobTitle} at {letterData.companyName}
        </h1>
      </div>

      {/* --- Editor Container --- */}
      <div className="max-w-4xl mx-auto bg-white rounded-t-xl rounded-b-xl shadow-2xl overflow-hidden">
        
        {/* --- Toolbar Area --- */}
        <div className="bg-[#d946ef] p-3 flex flex-col md:flex-row justify-between items-center gap-3">
            
            {/* Left: Formatting Buttons */}
            <div className="flex gap-2 bg-white/20 p-1 rounded-lg backdrop-blur-sm">
                <button onClick={() => formatDoc('bold')} className="p-2 text-white hover:bg-white/30 rounded transition" title="Bold"><Bold size={18} /></button>
                <button onClick={() => formatDoc('italic')} className="p-2 text-white hover:bg-white/30 rounded transition" title="Italic"><Italic size={18} /></button>
                <button onClick={() => formatDoc('underline')} className="p-2 text-white hover:bg-white/30 rounded transition" title="Underline"><Underline size={18} /></button>
                <div className="w-[1px] bg-white/30 mx-1"></div>
                <button onClick={() => formatDoc('justifyLeft')} className="p-2 text-white hover:bg-white/30 rounded transition" title="Align Left"><AlignLeft size={18} /></button>
                <button onClick={() => formatDoc('justifyCenter')} className="p-2 text-white hover:bg-white/30 rounded transition" title="Align Center"><AlignCenter size={18} /></button>
                <button onClick={() => formatDoc('justifyRight')} className="p-2 text-white hover:bg-white/30 rounded transition" title="Align Right"><AlignRight size={18} /></button>
            </div>

            {/* Right: Action Buttons (Download & Save) */}
            <div className="flex gap-3">
                
                {/* 1. Download Button */}
                <button
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-2 bg-purple-900 hover:bg-purple-800 text-white px-4 py-2 rounded-lg font-bold shadow-md transition border border-white/20"
                >
                    <Download size={18} />
                    <span className="hidden sm:inline">Download PDF</span>
                </button>

                {/* 2. Save Button */}
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-white text-purple-700 hover:bg-gray-100 px-4 py-2 rounded-lg font-bold shadow-md transition disabled:opacity-70"
                >
                    {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </div>

        {/* --- Editable Paper Area --- */}
        <div className="p-12 min-h-[800px] bg-white cursor-text">
            <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning={true}
                className="outline-none text-gray-800 text-[16px] leading-relaxed font-serif whitespace-pre-wrap"
                style={{ minHeight: '600px' }}
                dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
        </div>

      </div>
    </div>
  );
}