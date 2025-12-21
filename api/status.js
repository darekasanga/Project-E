export default async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json({ ok: true });
  }

  res.setHeader("Allow", ["GET"]);
  return res.status(405).end();
}
