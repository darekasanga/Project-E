(() => {
  const storageKey = "emperor_articles";
  const settingsKey = "emperor_article_settings";
  const officialLineAccountId = "@projecte_official";
  const baseArticles = [
    {
      title: "iPadスクロール特集 — 公式LINEで読む",
      body: "黒背景とオーバースクロールを活かしたカードレイアウト。公式LINEアカウントへの配信リンクを同梱。",
      tags: ["iPad", "Scroll", "LINE公式"],
      image: "https://images.unsplash.com/photo-1472289065668-ce650ac443d2?auto=format&fit=crop&w=1200&q=80",
    },
    {
      title: "ChatGPTから即公開",
      body: "チャットで生成した原稿をそのまま貼り付け。タグとカバーを足すだけで読者向けカードを生成します。",
      tags: ["ChatGPT", "Workflow"],
      image: "https://images.unsplash.com/photo-1507138451611-3001135909a5?auto=format&fit=crop&w=1200&q=80",
    },
    {
      title: "LINEシェアリンクをワンクリック",
      body: "公式LINEアカウントと連動した共有ボタンを自動生成。外部ブラウザでも快適に閲覧できるOGP調整済み。",
      tags: ["LINE", "Share", "OGP"],
      image: "https://images.unsplash.com/photo-1508766206392-8bd5cf550d1b?auto=format&fit=crop&w=1200&q=80",
    }
  ];

  function parseSaved() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      return Array.isArray(saved) ? saved : null;
    } catch (err) {
      console.warn("Failed to parse saved articles", err);
      return null;
    }
  }

  function loadArticles() {
    return parseSaved() ?? baseArticles;
  }

  function normalizeSettings(raw) {
    const articles = loadArticles();
    const limit = articles.length;
    const heroId = Number.isInteger(raw?.heroId) && raw.heroId >= 0 && raw.heroId < limit
      ? raw.heroId
      : (limit ? 0 : null);
    const featuredId = Number.isInteger(raw?.featuredId) && raw.featuredId >= 0 && raw.featuredId < limit
      ? raw.featuredId
      : (limit ? 0 : null);
    const footerIds = Array.isArray(raw?.footerIds)
      ? [...new Set(raw.footerIds.filter((idx) => Number.isInteger(idx) && idx >= 0 && idx < limit))]
      : [];
    return { heroId, featuredId, footerIds };
  }

  function loadSettings() {
    const saved = localStorage.getItem(settingsKey);
    if (!saved) return normalizeSettings({});
    try {
      const parsed = JSON.parse(saved);
      return normalizeSettings(parsed);
    } catch (err) {
      console.warn("Failed to parse article settings", err);
      return normalizeSettings({});
    }
  }

  function saveArticles(list) {
    localStorage.setItem(storageKey, JSON.stringify(list));
  }

  function saveSettings(next) {
    const normalized = normalizeSettings(next);
    localStorage.setItem(settingsKey, JSON.stringify(normalized));
    return normalized;
  }

  function upsertArticle(article, idx) {
    const list = loadArticles();
    if (Number.isInteger(idx) && idx >= 0 && idx < list.length) {
      list[idx] = article;
    } else {
      list.unshift(article);
    }
    saveArticles(list);
    return list;
  }

  function deleteArticle(idx) {
    const list = loadArticles();
    if (Number.isInteger(idx) && idx >= 0 && idx < list.length) {
      list.splice(idx, 1);
      saveArticles(list);
    }
    return list;
  }

  function findArticle(idx) {
    const list = loadArticles();
    const safeIdx = Number.isInteger(idx) && idx >= 0 && idx < list.length ? idx : 0;
    return { article: list[safeIdx], list, idx: safeIdx };
  }

  function getHeroArticle() {
    const settings = loadSettings();
    if (!Number.isInteger(settings.heroId)) return { article: null, idx: null, settings };
    const { article, idx } = findArticle(settings.heroId);
    return { article, idx, settings };
  }

  function getFeaturedArticle() {
    const settings = loadSettings();
    if (!Number.isInteger(settings.featuredId)) return { article: null, idx: null, settings };
    const { article, idx } = findArticle(settings.featuredId);
    return { article, idx, settings };
  }

  function getFooterArticles() {
    const settings = loadSettings();
    const articles = loadArticles();
    const pinned = settings.footerIds
      .map((idx) => ({ idx, article: articles[idx] }))
      .filter((item) => item.article);
    return { list: pinned, settings };
  }

  function buildOfficialLineShare(url) {
    return `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}&accountId=${encodeURIComponent(officialLineAccountId)}`;
  }

  window.BlogData = {
    storageKey,
    settingsKey,
    officialLineAccountId,
    baseArticles,
    loadArticles,
    saveArticles,
    loadSettings,
    saveSettings,
    upsertArticle,
    deleteArticle,
    findArticle,
    getHeroArticle,
    getFeaturedArticle,
    getFooterArticles,
    buildOfficialLineShare,
  };
})();
