// test-gemini.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
// If you are using Node 22 flag, you don't strictly need dotenv here, but it's fine to keep
require('dotenv').config(); 

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    // ✅ Change this line to use the correct model:
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); 
    
    console.log("Testing connection with gemini-1.5-flash...");
    const result = await model.generateContent("Hello");
    console.log("Success! Response:", result.response.text());
  } catch (error) {
    console.error("Error:", error.message);
  }
}

listModels();