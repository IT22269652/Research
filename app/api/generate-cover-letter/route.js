import { GoogleGenerativeAI } from "@google/generative-ai";
import connectDB from "@/lib/mongodb";
import CoverLetter from "@/lib/models/CoverLetter";

export async function POST(req) {
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
    
    // ✅ FIX: Use the model found in your list
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash" 
    });

    const result = await model.generateContent(prompt);
    const aiContent = result.response.text().replace(/```html|```/gi, "").trim();

    await connectDB();
    const newLetter = await CoverLetter.create({
      personalInfo: body.personalInfo,
      jobInfo: body.jobInfo,
      coverLetter: aiContent,
    });

    return Response.json({ id: newLetter._id.toString() });

  } catch (error) {
    console.error("Gemini API error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}