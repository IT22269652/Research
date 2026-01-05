const mongoose = require("mongoose");

const mockInterviewSchema = new mongoose.Schema({
    jsonMockResp: { type: Array, required: true }, // Stores the list of questions
    jobPosition: { type: String, required: true },
    jobDesc: { type: String, required: true },
    jobExperience: { type: String, required: true }, // We store question count here usually
    createdBy: { type: String, required: true }, // Default user
    createdAt: { type: String, required: true },
    mockId: { type: String, required: false }
});

module.exports = mongoose.model("MockInterview", mockInterviewSchema);