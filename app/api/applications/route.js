import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb"; // or "@/lib/db" depending on your file name
import mongoose from "mongoose";

// Define Schema inside the route to avoid "OverwriteModelError" in dev mode
const ApplicationSchema = new mongoose.Schema({
  jobId: String,
  jobTitle: String,
  companyName: String,
  applicantName: String,
  applicantEmail: String,
  cvData: String,
  cvName: String,
  missingSkills: [String], // Field to store AI results
  appliedAt: { type: Date, default: Date.now }
});

// Use existing model or create new one
const Application = mongoose.models.Application || mongoose.model("Application", ApplicationSchema);

export async function POST(request) {
  try {
    const data = await request.formData();
    const file = data.get("cv");
    const requiredSkills = data.get("requiredSkills");

    if (!file) return NextResponse.json({ success: false, error: "No CV uploaded" }, { status: 400 });

    // --- 1. Python ML Connection ---
    let missingSkillsList = [];
    
    try {
      const pythonFormData = new FormData();
      pythonFormData.append('cv', file);
      pythonFormData.append('required_skills', requiredSkills || "");

      // POINTING TO PORT 5001 (Match your running Python server)
      const pythonRes = await fetch('http://127.0.0.1:5001/predict', {
        method: 'POST',
        body: pythonFormData
      });

      if (pythonRes.ok) {
        const mlResult = await pythonRes.json();
        if (mlResult.success) {
          missingSkillsList = mlResult.missing_skills;
        }
      } else {
        console.warn("⚠️ Python Server responded with error:", await pythonRes.text());
      }
    } catch (mlError) {
      console.error("⚠️ Could not connect to Python Model on Port 5001:", mlError.message);
      // We do NOT throw error here. We continue saving the application even if AI fails.
    }

    // --- 2. Process File for MongoDB (Base64) ---
    let cvData = null;
    if (file && typeof file !== "string") {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      cvData = `data:${file.type};base64,${buffer.toString("base64")}`;
    }

    // --- 3. Save to Database ---
    await connectDB();
    
    await Application.create({
      jobId: data.get("jobId"),
      jobTitle: data.get("jobTitle"),
      companyName: data.get("companyName"),
      applicantName: data.get("applicantName"),
      applicantEmail: data.get("applicantEmail"),
      cvName: file.name,
      cvData: cvData,
      missingSkills: missingSkillsList
    });

    return NextResponse.json({ 
      success: true, 
      message: "Application Submitted",
      missingSkills: missingSkillsList 
    }, { status: 201 });

  } catch (error) {
    console.error("❌ Server Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}