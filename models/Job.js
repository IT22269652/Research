import mongoose from "mongoose";

const JobSchema = new mongoose.Schema(
  {
    // These names must match what is in your API route exactly
    jobTitle: { type: String, required: true },
    companyName: { type: String, required: true },
    companyWebsite: { type: String },
    jobDescription: { type: String, required: true },
    requiredQualifications: { type: String, required: true },
    requiredSkills: { type: String, required: true },
    experienceLevel: { type: String, required: true },
    employmentType: { type: String, required: true },
    workLocation: { type: String, required: true },
    salaryRange: { type: String },
    workingHours: { type: String },
    postingDate: { type: Date, default: Date.now },
    closingDate: { type: Date },
    
    // File fields
    fileData: { type: String },
    fileName: { type: String },
    fileType: { type: String },
  },
  { timestamps: true }
);

// Delete the existing model from cache to force a rebuild with the new schema
// This line fixes the error you are seeing without needing a server restart every time
if (mongoose.models.Job) {
  delete mongoose.models.Job;
}

const Job = mongoose.model("Job", JobSchema);

export default Job;