import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb"; // Reuse your existing DB connection
import Job from "@/models/Job";

// --- GET: Fetch all jobs ---
export async function GET() {
  try {
    await connectDB();
    const jobs = await Job.find({}).sort({ createdAt: -1 }); // Newest first
    return NextResponse.json({ success: true, data: jobs });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// --- POST: Create a new job ---
export async function POST(request) {
  try {
    const data = await request.formData();
    const title = data.get("title");
    const description = data.get("description");
    const file = data.get("file");

    let fileData = null;
    let fileName = null;
    let fileType = null;

    // Process file if it exists
    if (file && typeof file !== "string") {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Convert to Base64 to store in MongoDB (Simple solution for small files)
      fileData = `data:${file.type};base64,${buffer.toString("base64")}`;
      fileName = file.name;
      fileType = file.type;
    }

    await connectDB();
    
    const newJob = await Job.create({
      title,
      description,
      fileData,
      fileName,
      fileType,
    });

    return NextResponse.json({ success: true, data: newJob }, { status: 201 });
  } catch (error) {
    console.error("Job Creation Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}