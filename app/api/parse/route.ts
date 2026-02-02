import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { userInput } = await req.json();
    console.log("DEBUG: userInput received:", userInput);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
    });

    const promptText = `
You extract structured tasks from user text.

Return ONLY valid JSON.
No markdown.
No explanations.
No backticks.

The JSON must match this TypeScript type exactly:

ParseResponse = {
  items: {
    title: string;
    type: "fixed" | "flex";
    start?: string;        // HH:MM 24-hour, only for fixed
    end?: string;          // HH:MM 24-hour, only for fixed
    durationMin?: number;  // minutes, only for flex
    notes?: string;
  }[];
}

Rules:
- Use 24-hour time
- Fixed items MUST have start AND end
- Flex items MUST have durationMin
- Do NOT invent times for flex items
- If duration is unclear, estimate reasonably (60–120 min)

User input:
"${userInput}"
`;

    const result = await model.generateContent(promptText);
    const response = await result.response.text();
    console.log("DEBUG: raw AI response:", response);

    // ----------------- PARSE STUB -----------------
    let parsed;
    try {
      parsed = JSON.parse(response);
      console.log("DEBUG: parsed AI output:", parsed);
    } catch (err) {
      console.error("DEBUG: AI returned invalid JSON:", err);
      return NextResponse.json(
        { error: "AI returned invalid JSON", raw: response },
        { status: 500 }
      );
    }
    // ------------------------------------------------

    // Return the parsed object directly to the frontend for now
    return NextResponse.json(parsed);

  } catch (err: any) {
    console.error("Gemini Error Context:", err);

    // 1. Overloaded
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

    // 2. Rate limiting
    if (err.status === 429) {
      const retryInfo = err.errorDetails?.find(
        (detail: any) =>
          detail["@type"] === "type.googleapis.com/google.rpc.RetryInfo"
      );

      const waitTime = retryInfo?.retryDelay || "a few seconds";

      return NextResponse.json(
        { error: `Quota exhausted. Please try again in ${waitTime}.` },
        { status: 429 }
      );
    }

    // 3. Fallback
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}