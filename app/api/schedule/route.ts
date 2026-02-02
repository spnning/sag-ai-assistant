import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { userInput } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const promptText = `
      You are a daily schedule planner.
      The user will give you a sentence describing their day.
      Convert it into a schedule.

      RULES:
      - Use 1-hour, or 1-hour and 30-minutes time blocks
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
    console.error("Gemini Error Context:", err);

    // 1. Handle Overloaded (503)
    const isOverloaded = 
      err.status === 503 || 
      err.message?.toLowerCase().includes("overloaded") ||
      err.message?.toLowerCase().includes("service unavailable");

    if (isOverloaded) {
      return NextResponse.json(
        { error: "This model is overloaded, try again in a few seconds!" }, 
        { status: 503 }
      );
    }

    // 2. Handle Rate Limiting (429) - Extract exact retry time
    if (err.status === 429) {
      // Look through the 'errorDetails' for the 'RetryInfo' object
      const retryInfo = err.errorDetails?.find(
        (detail: any) => detail['@type'] === 'type.googleapis.com/google.rpc.RetryInfo'
      );

      // Extract the delay (e.g., "33s") or fallback to "a few seconds"
      const waitTime = retryInfo?.retryDelay || "a few seconds";

      return NextResponse.json(
        { error: `Quota exhausted. Please try again in ${waitTime}.` }, 
        { status: 429 }
      );
    }

    // 3. Generic fallback
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." }, 
      { status: 500 }
    );
  }
}