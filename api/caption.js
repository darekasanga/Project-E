// POST { imageBase64: "data:image/png;base64,...." } → { caption: string }
export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).end();
    const { imageBase64 } = await readJSON(req);

    // Validate/normalize to proper data URL
    let url = (imageBase64 || "").trim();
    if (!url) return res.status(400).json({ error: "imageBase64 required" });
    if (!url.startsWith("data:image/")) {
      // assume raw base64 PNG was sent; prefix it
      url = `data:image/png;base64,${url}`;
    }
    // minimal pattern check to avoid “string did not match expected pattern”
    if (!/^data:image\/(png|jpeg|jpg);base64,/.test(url)) {
      return res.status(400).json({ error: "imageBase64 must be a PNG/JPEG data URL" });
    }

    // Use Responses API with input_image (more tolerant than legacy chat vision)
    const payload = {
      model: "gpt-4o-mini",
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: "Describe this sketch briefly and clearly." },
            { type: "input_image", image_url: url }
          ]
        }
      ]
    };

    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const text = await r.text();
    if (!r.ok) return res.status(500).json({ error: text });
    const data = JSON.parse(text);

    // Extract the first text output from the Responses API
    const outputs = data.output || data.choices || data.content || [];
    let caption = "";

    // Robust parse across possible shapes
    if (Array.isArray(outputs)) {
      // e.g., data.output[0].content[0].text
      const first = outputs[0];
      if (first?.content?.[0]?.text) caption = first.content[0].text;
      else if (first?.message?.content) caption = first.message.content;
    }
    if (!caption && data?.output_text) caption = data.output_text; // convenience field if present

    res.status(200).json({ caption: (caption || "").trim() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

async function readJSON(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks).toString("utf8") || "{}";
  return JSON.parse(raw);
}
