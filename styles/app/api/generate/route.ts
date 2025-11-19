import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, age, gender, weight, height, goal, location, diet } = body;

    const systemPrompt = `
Act as an elite fitness coach. Create a JSON plan for ${name}, ${gender}, ${age} yrs, ${weight}kg, ${height}cm.
Goal: ${goal}. Location: ${location}. Diet: ${diet}.

Requirements:
1. Create a 3-day workout split.
2. Create a full day meal plan.
3. For every exercise and meal, provide a short "visual_prompt" field describing it for an image generator.

Return STRICT JSON using the structure:
{
  "user_profile": { "summary": "..." },
  "workout": [ ... ],
  "diet": { "meals": [ ... ] },
  "motivation": "..."
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a JSON-only fitness API. Return ONLY JSON." },
        { role: "user", content: systemPrompt }
      ],
      max_tokens: 800,
    });

    const text = completion.choices?.[0]?.message?.content ?? "{}";
    let plan;
    try {
      plan = JSON.parse(text);
    } catch {
      // try to salvage a JSON substring
      const jsonStart = text.indexOf("{");
      const jsonEnd = text.lastIndexOf("}");
      const jsonText = jsonStart >= 0 && jsonEnd >= 0 ? text.slice(jsonStart, jsonEnd + 1) : "{}";
      try {
        plan = JSON.parse(jsonText);
      } catch {
        plan = { error: "Failed to parse AI output", raw: text };
      }
    }

    return NextResponse.json(plan);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Failed to generate plan" }, { status: 500 });
  }
}
