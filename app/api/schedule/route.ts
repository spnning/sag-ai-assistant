import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the API with your key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { userInput } = await req.json();

    // Use gemini-1.5-flash for speed and low cost (perfect for hackathons)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const promptText = `
      You are a daily schedule planner.
      The user will give you a sentence describing their day.
      Convert it into a schedule.

      RULES:
      - Use 1-hour time blocks
      - Use 24-hour or AM/PM consistently
      - Output ONLY the schedule
      - Each line must be in this format: HH:MM-HH:MM Activity

      USER INPUT: "${userInput}"
    `;

    const result = await model.generateContent(promptText);
    const response = await result.response;
    const schedule = response.text();

    return NextResponse.json({ schedule });
  } catch (err: any) {
    console.error("Gemini Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}