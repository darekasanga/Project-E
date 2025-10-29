// Describe an uploaded sketch using OpenAI vision
export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).end();
    const { imageBase64 } = await parseJSON(req); // data URL or bare base64

    const body = {
      model: "gpt-4o-mini",
      messages: [{
        role: "user",
        content: [
          { type: "text", text: "Describe this sketch briefly and clearly." },
          {
            type: "image_url",
            image_url: { url: imageBase64.startsWith("data:")
              ? imageBase64
              : `data:image/png;base64,${imageBase64}` }
          }
        ]
      }]
    };

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
    if (!r.ok) {
      const err = await r.text();
      return res.status(500).json({ error: "OpenAI error", detail: err });
    }
    const data = await r.json();
    const text = data.choices?.[0]?.message?.content ?? "";
    res.status(200).json({ caption: text.trim() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

async function parseJSON(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}
