// lib/hf.ts
export async function generateAI(prompt: string) {
  const HF_TOKEN = process.env.NEXT_PUBLIC_HF_TOKEN;
  if (!HF_TOKEN) throw new Error("Missing Hugging Face API token");


  const modelUrl = "https://router.huggingface.co/models/cutycat2000/MeowGPT-2";

  const res = await fetch(modelUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${HF_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: { max_new_tokens: 200 },
    }),
  });

  const text = await res.text();

  if (!res.ok) {
    console.error("HF API error:", text);
    throw new Error(`HF API failed: ${text}`);
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    console.error("HF returned non-JSON:", text);
    throw new Error(`HF API returned invalid JSON: ${text}`);
  }


  return data?.[0]?.generated_text || "";
}
