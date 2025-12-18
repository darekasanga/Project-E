import fs from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "api", "articles-data.json");
const seedArticles = [
  {
    title: "スクロールスナップで魅せるiPad特集",
    body: "iPadOSのオーバースクロールに合わせた柔らかなカードUI。モバイルファーストの編集フローを紹介。",
    tags: ["iPad", "UI", "ScrollSnap"],
    image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "LINE配信テンプレート付き記事運用",
    body: "配信用のOGPとLINEシェアURLをワンクリック生成。チャット経由での下書きアップロードにも対応。",
    tags: ["LINE", "OGP", "Automation"],
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "ChatGPT→ブログ 直貼りワークフロー",
    body: "ChatGPTで生成した文章をそのままペースト。カバー画像とタグを加えて即公開。",
    tags: ["ChatGPT", "Workflow", "Creator"],
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80",
  },
];

function readSeedPayload() {
  try {
    return JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  } catch (err) {
    return { articles: seedArticles };
  }
}

const defaultPayload = readSeedPayload();

function readArticles() {
  try {
    const raw = fs.readFileSync(DATA_PATH, "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    if (Array.isArray(parsed.articles)) return parsed.articles;
  } catch (err) {
    // fall through to defaults
  }
  return defaultPayload.articles || [];
}

async function readJSON(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const text = Buffer.concat(chunks).toString("utf8") || "{}";
  return JSON.parse(text);
}

function persistArticles(articles) {
  fs.writeFileSync(
    DATA_PATH,
    JSON.stringify({ articles }, null, 2),
    "utf8"
  );
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    const articles = readArticles();
    return res.status(200).json({ articles });
  }

  if (req.method === "POST") {
    try {
      const payload = await readJSON(req);
      const nextArticles = Array.isArray(payload.articles) ? payload.articles : [];
      if (!nextArticles.length) {
        return res.status(400).json({ error: "articles array required" });
      }
      persistArticles(nextArticles);
      return res.status(200).json({ ok: true, count: nextArticles.length });
    } catch (err) {
      return res.status(400).json({ error: "invalid payload" });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end();
}
