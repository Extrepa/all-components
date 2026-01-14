import OpenAI from 'openai';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateComponentDocs(html: string, type: string, css: string) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a UI Archivist. Output JSON: { summary, complexityRating, suggestedTags, technicalNotes, markdownContent }." },
      { role: "user", content: `Analyze this ${type}:\n${html}` }
    ],
    response_format: { type: "json_object" }
  });
  return JSON.parse(completion.choices[0].message.content || '{}');
}

export async function transformToReact(html: string, type: string) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: "Convert HTML to React (TSX). Use className, close void tags. Return ONLY code." },
      { role: "user", content: `Convert this ${type}:\n${html}` }
    ]
  });
  return completion.choices[0].message.content?.replace(/```tsx?/g, '').replace(/```$/g, '').trim() || '';
}
