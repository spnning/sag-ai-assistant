import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userInput } = body;

    // TEMP fake response (to prove everything works)
    const schedule = `
8:00 AM - Wake up
9:00 AM - School
3:30 PM - Homework
6:00 PM - Free time
10:30 PM - Sleep
    `;

    return NextResponse.json({ schedule });
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
