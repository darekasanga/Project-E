(() => {
  const storageKey = "emperor_articles";
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

  function saveArticles(list) {
    localStorage.setItem(storageKey, JSON.stringify(list));
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

  function buildOfficialLineShare(url) {
    return `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}&accountId=${encodeURIComponent(officialLineAccountId)}`;
  }

  window.BlogData = {
    storageKey,
    officialLineAccountId,
    baseArticles,
    loadArticles,
    saveArticles,
    upsertArticle,
    deleteArticle,
    findArticle,
    buildOfficialLineShare,
  };
})();
