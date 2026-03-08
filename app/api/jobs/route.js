import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb.js"; // Ensure this matches your file name (db.js or mongodb.js)
import Job from "@/models/Job";

// --- FIX: Disable Caching ---
// This ensures that when you add a new job, the list updates immediately
export const dynamic = 'force-dynamic';

// --- GET: Fetch all jobs ---
export async function GET() {
  try {
    await connectDB();
    
    // Sort by createdAt: -1 (Newest first)
    const jobs = await Job.find({}).sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, data: jobs });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// --- POST: Create a new job ---
export async function POST(request) {
  try {
    const data = await request.formData();
    
    // Extracting fields manually to ensure clean data
    const jobData = {
      jobTitle: data.get("jobTitle"),
      companyName: data.get("companyName"),
      companyWebsite: data.get("companyWebsite"),
      jobDescription: data.get("jobDescription"),
      requiredQualifications: data.get("requiredQualifications"),
      requiredSkills: data.get("requiredSkills"),
      experienceLevel: data.get("experienceLevel"),
      employmentType: data.get("employmentType"),
      workLocation: data.get("workLocation"),
      salaryRange: data.get("salaryRange"),
      workingHours: data.get("workingHours"),
      closingDate: data.get("closingDate"),
    };

    const file = data.get("file");
    
    // File Processing (Convert to Base64)
    if (file && typeof file !== "string") {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      jobData.fileData = `data:${file.type};base64,${buffer.toString("base64")}`;
      jobData.fileName = file.name;
      jobData.fileType = file.type;
    }

    await connectDB();
    const newJob = await Job.create(jobData);

    return NextResponse.json({ success: true, data: newJob }, { status: 201 });
  } catch (error) {
    console.error("Job Creation Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}