export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).end();
    const { messages = [], system = "" } = await readJSON(req);

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          ...(system ? [{ role: "system", content: system }] : []),
          ...messages
        ],
        temperature: 0.7
      })
    });

    const txt = await r.text();
    if (!r.ok) return res.status(500).json({ error: txt });
    const data = JSON.parse(txt);
    res.status(200).json({ reply: data.choices?.[0]?.message?.content ?? "" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
async function readJSON(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}
