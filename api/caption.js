// POST { imageBase64: "data:image/png;base64,..." } → { caption }
export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).end();
    const { imageBase64 } = await readJSON(req);
    if (!imageBase64) return res.status(400).json({ error: "imageBase64 required" });

    let url = imageBase64.trim();
    if (!url.startsWith("data:image/")) url = `data:image/png;base64,${url}`;

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

    const txt = await r.text();
    if (!r.ok) return res.status(500).json({ error: txt });
    const data = JSON.parse(txt);

    const caption = data.output_text || 
      data.output?.[0]?.content?.[0]?.text ||
      data.output?.[0]?.message?.content || "";

    res.status(200).json({ caption: caption.trim() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
async function readJSON(req){const chunks=[];for await(const c of req)chunks.push(c);
  return JSON.parse(Buffer.concat(chunks).toString("utf8")||"{}");}
