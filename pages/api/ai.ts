import { NextApiRequest, NextApiResponse } from "next";
import cohere from "cohere-ai"; // Direct import

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { content, type } = req.body;
  if (!content || !type) {
    return res.status(400).json({ error: "Missing content or type" });
  }

  try {
    let prompt = "";

    // Determine prompt based on the 'type' passed (summary, improve, tags)
    if (type === "summary") {
      prompt = `Summarize the following text in 2-3 sentences:\n\n${content}`;
    } else if (type === "improve") {
      prompt = `Improve the grammar and clarity of this note:\n\n${content}`;
    } else if (type === "tags") {
      prompt = `Generate relevant tags for this note:\n\n${content}`;
    } else {
      return res.status(400).json({ error: "Invalid type" });
    }

    // Use the correct method (for text generation/chat)
    const response = await cohere.generate({
      model: "xlarge",  // Make sure to use the correct available model
      prompt: prompt,   // Text prompt for completion
      max_tokens: 150,  // Control length of the response
      temperature: 0.7, // Control creativity/randomness
    });

    // Check for valid response
    const result = response.body.text;
    if (!result) return res.status(500).json({ error: "No valid response from AI" });

    res.status(200).json({ result: result.trim() });
  } catch (err) {
    console.error("AI processing error:", err);
    res.status(500).json({ error: "AI processing failed" });
  }
}
