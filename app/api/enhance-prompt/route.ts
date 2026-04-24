import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { rawText, themeType, themeSummary } = await req.json();

    if (!rawText?.trim()) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
    }

    const systemPrompt = `You are a prompt engineer specializing in AI image generation for custom bobblehead figurines.

A customer is ordering a ${themeType || "custom"} bobblehead${themeSummary ? ` (${themeSummary})` : ""}. They have written a short note describing additional customizations they want.

Your job: Expand their request into a precise, vivid image generation instruction that will be appended to the main prompt. 

Rules:
- Keep it under 150 words
- Be specific and visual (colors, materials, textures, positions)
- Do NOT invent things the user didn't ask for
- Do NOT repeat the main theme/outfit (that's already in the main prompt)
- Focus only on what they asked for
- Write as direct instructions to the image model (e.g. "The base is covered in bright green grass...")
- Output ONLY the expanded instruction text, no preamble, no explanation`;

    const userMessage = `Customer's request: "${rawText}"

Expand this into a precise image generation instruction:`;

    const visionUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    const res = await fetch(visionUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ parts: [{ text: userMessage }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 600,
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[Enhance Prompt] Gemini error:", errText);
      return NextResponse.json({ error: "AI enhancement failed" }, { status: 500 });
    }

    const data = await res.json();
    const enhancedText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!enhancedText) {
      return NextResponse.json({ error: "No enhanced text returned" }, { status: 500 });
    }

    // Reject truncated responses — a proper sentence ends with . ! or ?
    const lastChar = enhancedText[enhancedText.length - 1];
    const isTruncated = !['.',  '!', '?', '"', "'"].includes(lastChar);
    if (isTruncated) {
      console.warn(`[Enhance Prompt] Response appears truncated (ends with '${lastChar}'): ${enhancedText.slice(-40)}`);
      return NextResponse.json({ error: "Enhancement was cut off — your original text was kept." }, { status: 500 });
    }

    return NextResponse.json({ enhancedText });
  } catch (error: any) {
    console.error("[Enhance Prompt] Error:", error);
    return NextResponse.json({ error: error.message || "Enhancement failed" }, { status: 500 });
  }
}
