import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Job from "@/models/Job";

// --- GET: Fetch all jobs ---
export async function GET() {
  try {
    await connectDB();
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
    
    // File Processing
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