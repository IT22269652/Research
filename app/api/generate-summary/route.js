import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { userInput, skills, jobTitle, experience } = await req.json();

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Groq API Key Missing" }, { status: 500 });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile", 
        messages: [
          {
            role: "system",
            content: "You are an expert professional resume writer. Your summaries are highly impactful, professional, and optimized for Applicant Tracking Systems (ATS)."
          },
          {
            role: "user",
            content: `Write a professional resume summary for a ${jobTitle || 'Professional'}.
                      
                      Details:
                      - Keywords/Experience: ${userInput}
                      - Key Skills: ${skills}
                      - Career History: ${experience}

                      Requirements:
                      - Word Count: Strictly between 40 to 50 words.
                      - Format: One cohesive paragraph.
                      - Content: Highlight achievements and technical expertise professionally.
                      - Note: Do NOT include any introductory text, start directly with the summary.`
          }
        ],
        temperature: 0.6, 
        max_tokens: 150,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq Error Response:", data);
      return NextResponse.json({ error: data.error?.message || "AI Error" }, { status: response.status });
    }

    const aiText = data.choices[0]?.message?.content?.trim();
    
    
    const cleanText = aiText.replace(/^"|"$/g, '');

    return NextResponse.json({ summary: cleanText });

  } catch (error) {
    console.error("Groq Route Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}