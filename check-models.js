// check-models.js
// This script asks Google: "What models can I use?"
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("❌ No API Key found in environment variables!");
  process.exit(1);
}

async function listModels() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  
  console.log("🔍 Checking available models...");
  
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      console.error("❌ Google Error:", data.error.message);
      return;
    }

    if (!data.models) {
      console.log("⚠️ No models found. Your project might need the API enabled.");
      return;
    }

    console.log("\n✅ AVAILABLE MODELS FOR YOUR KEY:");
    console.log("---------------------------------");
    const validModels = data.models
      .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent"))
      .map(m => m.name.replace("models/", ""));
      
    validModels.forEach(name => console.log(`• "${name}"`));
    console.log("---------------------------------");
    
    if (validModels.length > 0) {
      console.log(`\n👉 SUGGESTION: Change your code to use: "${validModels[0]}"`);
    }

  } catch (error) {
    console.error("❌ Script Error:", error.message);
  }
}

listModels();