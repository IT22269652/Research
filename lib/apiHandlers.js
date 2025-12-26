import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import PDFParser from "pdf2json";
import connectDB from "@/lib/mongodb";
import CoverLetter from "@/lib/models/CoverLetter";
import Resume from "@/lib/models/Resume";

// Reusable model fallback utility
async function generateWithFallback(genAIInstance, prompt) {
  const modelsToTry = [
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-2.0-flash"
  ];

  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      const model = genAIInstance.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      if (!text || text.trim().length === 0) {
        throw new Error("Empty response from model");
      }

      return text;
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(`All AI models failed. Last error: ${lastError?.message || 'Unknown'}`);
}

// --- Handlers ---
export async function handleCheckResumePOST(req) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY_ATS);

    const formData = await req.formData();
    const file = formData.get("file");
    const jobDescription = formData.get("jobDescription");
    const manualText = formData.get("resumeText");

    let resumeText = "";

    if (file && typeof file !== "string") {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      if (file.type === "application/pdf") {
        try {
          const parser = new PDFParser(null, 1);
          resumeText = await new Promise((resolve, reject) => {
            parser.on("pdfParser_dataError", (errData) => reject(errData.parserError));
            parser.on("pdfParser_dataReady", () => {
              resolve(parser.getRawTextContent());
            });
            parser.parseBuffer(buffer);
          });
        } catch (pdfError) {
          console.error("PDF Parsing Error:", pdfError);
          return NextResponse.json({ 
            error: "Failed to parse PDF. Please try a different file or text." 
          }, { status: 500 });
        }
      } else {
        resumeText = buffer.toString("utf-8");
      }
    } else if (manualText) {
      resumeText = manualText;
    }

    if (!resumeText || resumeText.trim().length === 0) {
      return NextResponse.json({ error: "Resume text is empty." }, { status: 400 });
    }

    const prompt = `
      Act as an expert ATS (Applicant Tracking System) Scanner.
      Analyze the following resume text against the job description.

      RESUME TEXT:
      ${resumeText.slice(0, 30000)} 

      JOB DESCRIPTION:
      ${jobDescription || "General Software Engineering"}

      INSTRUCTIONS:
      Return ONLY a VALID JSON object. Do not use Markdown blocks (no ${'```'}).
      JSON Format:
      {
        "atsScore": (number 0-100),
        "grammarScore": (number 0-100),
        "keywordMatch": (number 0-100),
        "strengths": ["point 1", "point 2", "point 3"],
        "improvements": ["point 1", "point 2", "point 3"],
        "suggestions": ["point 1", "point 2", "point 3"]
      }
    `;

    const text = await generateWithFallback(genAI, prompt);
    const cleanedText = text.replace(/```json|```/g, "").trim();

    let jsonResponse;
    try {
      jsonResponse = JSON.parse(cleanedText);
    } catch (e) {
      console.error("JSON Error:", text);
      return NextResponse.json({ error: "AI Response was not valid JSON." }, { status: 500 });
    }

    return NextResponse.json(jsonResponse);

  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ error: `Analysis Error: ${error.message}` }, { status: 500 });
  }
}

export async function handleGenerateCoverLetterPOST(req) {
  try {
    const body = await req.json();

    const prompt = `
    Write a professional, ATS-friendly cover letter in clean HTML format.
    Use only <p>, <strong>, <br> tags.
    
    Candidate: ${body.personalInfo.fullName}
    Job Title: ${body.jobInfo.jobTitle}
    Company: ${body.jobInfo.companyName}
    Hiring Manager: ${body.jobInfo.hiringManager || "Hiring Manager"}
    
    Job Description:
    ${body.jobInfo.jobDescription}
    
    Keep it under 300 words. Be enthusiastic and tailored.
    Return ONLY the HTML content.
    `;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const aiContent = result.response.text().replace(/```html|```/gi, "").trim();

    await connectDB();
    const newLetter = await CoverLetter.create({
      personalInfo: body.personalInfo,
      jobInfo: body.jobInfo,
      coverLetter: aiContent,
    });

    return NextResponse.json({ id: newLetter._id.toString() });

  } catch (error) {
    console.error("Gemini API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function handleGenerateSummaryPOST(req) {
  try {
    const { userInput, skills, jobTitle, experience } = await req.json();

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Groq API Key Missing" }, { status: 500 });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile", 
        messages: [
          {
            role: "system",
            content: "You are an expert professional resume writer. Your summaries are highly impactful, professional, and optimized for Applicant Tracking Systems (ATS)."
          },
          {
            role: "user",
            content: `Write a professional resume summary for a ${jobTitle || 'Professional'}.
                      
                      Details:
                      - Keywords/Experience: ${userInput}
                      - Key Skills: ${skills}
                      - Career History: ${experience}

                      Requirements:
                      - Word Count: Strictly between 40 to 50 words.
                      - Format: One cohesive paragraph.
                      - Content: Highlight achievements and technical expertise professionally.
                      - Note: Do NOT include any introductory text, start directly with the summary.`
          }
        ],
        temperature: 0.6, 
        max_tokens: 150,
      }),
    });

    let data;
    try {
      data = await response.json();
    } catch (parseErr) {
      const text = await response.text().catch(() => null);
      console.error("Groq non-JSON response:", text || parseErr);
      return NextResponse.json({ error: `Upstream Groq returned non-JSON response: ${text ? text.slice(0,200) : String(parseErr)}` }, { status: 502 });
    }

    if (!response.ok) {
      console.error("Groq Error Response:", data);
      return NextResponse.json({ error: data.error?.message || "AI Error" }, { status: response.status });
    }

    const aiText = data.choices[0]?.message?.content?.trim();
    const cleanText = aiText.replace(/^"|"$/g, '');

    return NextResponse.json({ summary: cleanText });

  } catch (error) {
    console.error("Groq Route Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function handleResumeGET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const resume = await Resume.findById(id).lean();
      if (!resume) {
        return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
      }
      return NextResponse.json(resume);
    }

    const resumes = await Resume.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json(resumes);
  } catch (error) {
    console.error('GET /api/resume error:', error);
    return NextResponse.json(
      { error: 'Failed to load resumes', details: error.message },
      { status: 500 }
    );
  }
}

export async function handleResumePOST(request) {
  try {
    await connectDB();
    const body = await request.json();

    const resume = await Resume.create({
      personalInfo: body.formData?.personalInfo || body.personalInfo || {},
      summary: body.formData?.summary || body.summary || '',
      skills: body.formData?.skills || body.skills || '',
      technicalSkills: body.formData?.technicalSkills || body.technicalSkills || '',
      experience: body.formData?.experience || body.experience || [],
      education: body.formData?.education || body.education || [],
      projects: body.formData?.projects || body.projects || [],
      certifications: body.formData?.certifications || body.certifications || [],
      references: body.formData?.references || body.references || [],
      selectedTemplate: body.selectedTemplate || 'modern',
    });

    return NextResponse.json(resume, { status: 201 });
  } catch (error) {
    console.error('POST /api/resume error:', error);
    return NextResponse.json(
      { error: 'Save failed', message: error.message },
      { status: 500 }
    );
  }
}

export async function handleResumePUT(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    const updateData = {
      personalInfo: body.personalInfo || body.formData?.personalInfo || {},
      summary: body.summary || body.formData?.summary || '',
      skills: body.skills || body.formData?.skills || '',
      technicalSkills: body.technicalSkills || body.formData?.technicalSkills || '',
      experience: body.experience || body.formData?.experience || [],
      education: body.education || body.formData?.education || [],
      projects: body.projects || body.formData?.projects || [],
      certifications: body.certifications || body.formData?.certifications || [],
      references: body.references || body.formData?.references || [],
      selectedTemplate: body.selectedTemplate || body.formData?.selectedTemplate || 'modern',
    };

    const updated = await Resume.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('PUT /api/resume error:', error);
    return NextResponse.json(
      { error: 'Update failed', message: error.message },
      { status: 500 }
    );
  }
}

export async function handleResumeDELETE(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    const deleted = await Resume.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Resume deleted successfully!' });
  } catch (error) {
    console.error('DELETE /api/resume error:', error);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}