// Generate an image from a text prompt
export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).end();
    const { prompt } = await parseJSON(req);

    const r = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt,
        size: "1024x1024"
      })
    });
    if (!r.ok) {
      const err = await r.text();
      return res.status(500).json({ error: "OpenAI error", detail: err });
    }
    const data = await r.json();
    // return base64 png
    const b64 = data.data?.[0]?.b64_json;
    res.status(200).json({ imageBase64: b64 });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

async function parseJSON(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}
