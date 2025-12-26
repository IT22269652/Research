import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import PDFParser from "pdf2json"; 

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY_ATS);

// --- SMART MODEL SELECTOR ---
// Updated for December 2025: Use current Gemini 2.5+ models
async function generateWithFallback(prompt) {
  // Priority order: fastest/cheapest first, then more capable
  const modelsToTry = [
    "gemini-2.5-flash",     // Fastest, most cost-efficient (recommended default)
    "gemini-2.5-pro",       // Higher capability for complex analysis
    "gemini-2.0-flash"      // Fallback older stable model (if needed)
  ];
  
  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`Attempting AI analysis with model: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      if (!text || text.trim().length === 0) {
        throw new Error("Empty response from model");
      }
      
      return text; // Success — return immediately
    } catch (error) {
      console.warn(`Failed with ${modelName}:`, error.message);
      lastError = error;
    }
  }

  // All models failed
  throw new Error(`All AI models failed. Last error: ${lastError?.message || 'Unknown'}`);
}

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const jobDescription = formData.get("jobDescription");
    const manualText = formData.get("resumeText");
    
    let resumeText = "";

    // --- 1. PDF Parsing Logic (pdf2json) ---
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

    // --- 2. Gemini AI Logic with Fallback ---
    const prompt = `
      Act as an expert ATS (Applicant Tracking System) Scanner.
      Analyze the following resume text against the job description.

      RESUME TEXT:
      ${resumeText.slice(0, 30000)} 

      JOB DESCRIPTION:
      ${jobDescription || "General Software Engineering"}

      INSTRUCTIONS:
      Return ONLY a VALID JSON object. Do not use Markdown blocks (no \`\`\`).
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

   
    const text = await generateWithFallback(prompt);
    
    // Clean Markdown
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