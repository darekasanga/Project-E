// POST { imageBase64: "data:image/png;base64,..." }
export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).end();
    const { imageBase64 } = await readJSON(req);
    if (!imageBase64) return res.status(400).json({ error: "imageBase64 required" });

    const body = {
      model: "gpt-4o-mini",
      messages: [{
        role: "user",
        content: [
          { type: "text", text: "Describe this sketch briefly and clearly." },
          { type: "image_url", image_url: { url: imageBase64 } }
        ]
      }]
    };

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const text = await r.text();
    if (!r.ok) return res.status(500).json({ error: text });
    const data = JSON.parse(text);
    res.status(200).json({ caption: data.choices?.[0]?.message?.content?.trim() ?? "" });
  } catch (e) { res.status(500).json({ error: e.message }); }
}
async function readJSON(req){ const chunks=[]; for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks).toString("utf8") || "{}"; return JSON.parse(raw); }
