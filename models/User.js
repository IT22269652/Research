import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: true,
      enum: ["applicant", "company"], // This ensures only these two roles can be saved
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true, // Prevents duplicate accounts
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    contactNumber: {
      type: String,
      required: true,
    },

    // --- Applicant Specific Fields ---
    fullName: { 
      type: String, 
      required: function() { return this.role === 'applicant'; } // Only required if role is applicant
    },
    nameWithInitials: { type: String },
    birthday: { type: Date },
    gender: { 
      type: String,
      enum: ["male", "female", "other"],
    },

    // --- Company Specific Fields ---
    companyName: { 
      type: String,
      required: function() { return this.role === 'company'; } // Only required if role is company
    },
    industry: { type: String },
    registrationNumber: { type: String },
    branchLocation: { type: String },
  },
  { timestamps: true } // Automatically adds 'createdAt' and 'updatedAt'
);

// This check prevents Next.js from trying to create the model multiple times
const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;