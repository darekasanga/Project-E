// POST { prompt: string } → { imageBase64 }
export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).end();
    const { prompt = "" } = await readJSON(req);
    if (!prompt) return res.status(400).json({ error: "prompt required" });

    const r = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt,
        size: "1024x1024",
        response_format: "b64_json"
      })
    });

    const text = await r.text();
    if (!r.ok) return res.status(500).json({ error: text });
    const data = JSON.parse(text);
    res.status(200).json({ imageBase64: data.data?.[0]?.b64_json || "" });
  } catch (e) { res.status(500).json({ error: e.message }); }
}
async function readJSON(req){ const chunks=[]; for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks).toString("utf8") || "{}"; return JSON.parse(raw); }
