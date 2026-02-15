// pages/api/ai.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { generateAI } from "../../lib/hf";


export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt, action } = req.body as { prompt: string; action: 'summary' | 'improve' | 'tags' };

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  
  let finalPrompt = "";
  if (action === "summary") {
    finalPrompt = `Summarize the following text concisely:\n\n${prompt}\n\nSummary:`;
  } else if (action === "improve") {
    finalPrompt = `Fix the grammar and improve the clarity of this text:\n\n${prompt}\n\nImproved:`;
  } else if (action === "tags") {
    finalPrompt = `List 3 unique one-word tags for this note, separated by commas:\n\n${prompt}\n\nTags:`;
  } else {

    finalPrompt = prompt;
  }

  try {
    const aiResponse = await generateAI(finalPrompt);
    return res.status(200).json({ text: aiResponse });
  } catch (error: any) {
    console.error("AI Error:", error);
    return res.status(500).json({ error: error.message });
  }
}