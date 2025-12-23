import mongoose from "mongoose";

const JobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    // We will store the file as a Base64 string for simplicity in this demo.
    // In a real production app, you would upload this to AWS S3 or similar.
    fileData: {
      type: String, // Base64 string of the file
    },
    fileName: {
      type: String,
    },
    fileType: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Job = mongoose.models.Job || mongoose.model("Job", JobSchema);

export default Job;