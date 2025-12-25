import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import mongoose from "mongoose";

// Create a quick Schema for Applications
const ApplicationSchema = new mongoose.Schema({
  jobId: String,
  jobTitle: String,
  companyName: String,
  applicantName: String,
  applicantEmail: String,
  cvData: String, // Base64
  cvName: String,
  appliedAt: { type: Date, default: Date.now }
});

const Application = mongoose.models.Application || mongoose.model("Application", ApplicationSchema);

export async function POST(request) {
  try {
    const data = await request.formData();
    const file = data.get("cv");

    // Process File to Base64
    let cvData = null;
    if (file && typeof file !== "string") {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      cvData = `data:${file.type};base64,${buffer.toString("base64")}`;
    }

    await connectDB();
    
    await Application.create({
      jobId: data.get("jobId"),
      jobTitle: data.get("jobTitle"),
      companyName: data.get("companyName"),
      applicantName: data.get("applicantName"),
      applicantEmail: data.get("applicantEmail"),
      cvName: file.name,
      cvData: cvData
    });

    return NextResponse.json({ success: true, message: "Application Submitted" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}