(() => {
  const storageKey = "emperor_articles";
  const settingsKey = "emperor_article_settings";
  const copyKey = "emperor_article_copy";
  const copyExtrasKey = "emperor_article_copy_extras";
  const pageLinksKey = "emperor_page_links";
  const commentsKey = "emperor_article_comments_v1";
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
    const buildSelection = (rawList, maxItems) => {
      if (!limit) return [];
      const normalized = [];
      (Array.isArray(rawList) ? rawList : []).forEach((idx) => {
        if (!Number.isInteger(idx) || idx < 0 || idx >= limit) return;
        if (normalized.includes(idx)) return;
        if (normalized.length >= maxItems) return;
        normalized.push(idx);
      });
      if (normalized.length) return normalized;
      const fallbackCount = Math.min(maxItems, limit);
      return Array.from({ length: fallbackCount }, (_, i) => i);
    };
    const heroId = Number.isInteger(raw?.heroId) && raw.heroId >= 0 && raw.heroId < limit
      ? raw.heroId
      : (limit ? 0 : null);
    const featuredId = Number.isInteger(raw?.featuredId) && raw.featuredId >= 0 && raw.featuredId < limit
      ? raw.featuredId
      : (limit ? 0 : null);
    const footerIds = Array.isArray(raw?.footerIds)
      ? [...new Set(raw.footerIds.filter((idx) => Number.isInteger(idx) && idx >= 0 && idx < limit))]
      : [];
    const homeLatestIds = buildSelection(raw?.homeLatestIds, 4);
    const homeFeaturedIds = buildSelection(raw?.homeFeaturedIds, 4);
    return { heroId, featuredId, footerIds, homeLatestIds, homeFeaturedIds };
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

  const defaultCopy = {
    heroTitle: "幅に合わせて表情を変える一覧ビュー",
    heroBody: "スマホでは縦にカードを並べ、タブレットはサムネイル横並び、PCではサイドバー付きの2カラムで統計とタグクラウドを固定。見やすさを保ちながら情報量を増やしました。",
    listTitle: "最新の投稿",
    listSubtitle: "ローカル保存された記事を時系列順に一覧表示します。",
    pinnedTitle: "固定記事",
    pinnedSubtitle: "管理ページで選択された記事を表示",
    tagTitle: "タグクラウド",
    tagSubtitle: "使用頻度順に表示",
  };

  const defaultPageLinks = [
    {
      id: "draw",
      title: "🎨 Draw Board",
      description: "新しいダークテーマとレスポンシブボタンで描画ツールも刷新。指でもマウスでも快適です。",
      url: "/draw.html",
    },
    {
      id: "admin",
      title: "🗂️ 管理ビュー",
      description: "ログイン後のナビゲーション、認証エラー表示を更新し、リダイレクト導線も整理しました。",
      url: "/admin.html",
    },
    {
      id: "blog-list",
      title: "📑 Blog (一覧)",
      description: "スマホ1カラム、タブレット2カラム、PC2カラム＋サイドバー。新しい統計ウィジェット付き。",
      url: "/blog-list.html",
    },
    {
      id: "blog-edit",
      title: "✏️ Blog 編集",
      description: "フォームとリストを整理し、編集状態やタグ表示を強調。保存後のフィードバックも改善。",
      url: "/blog-edit.html",
    },
    {
      id: "chat-toc",
      title: "💬 Chat TOC Maker",
      description: "チャットの目次生成ツールを新レイアウトに刷新。レスポンシブでシンプルな入力に。",
      url: "/chat-toc.html",
    },
    {
      id: "article",
      title: "📰 記事ビュー",
      description: "個別記事ページは本文とタグ、共有ボタンを再配置。読みやすさを優先した新デザインです。",
      url: "/blog-article.html",
    },
  ];

  function loadCopy() {
    const saved = localStorage.getItem(copyKey);
    if (!saved) return { ...defaultCopy };
    try {
      const parsed = JSON.parse(saved);
      return { ...defaultCopy, ...(parsed && typeof parsed === "object" ? parsed : {}) };
    } catch (err) {
      console.warn("Failed to parse article copy", err);
      return { ...defaultCopy };
    }
  }

  function saveCopy(next) {
    const copy = next && typeof next === "object" ? next : {};
    const normalized = { ...defaultCopy, ...copy };
    localStorage.setItem(copyKey, JSON.stringify(normalized));
    return normalized;
  }

  function normalizePageLinks(list) {
    const source = Array.isArray(list) ? list : [];
    const normalized = source
      .map((item, index) => {
        const fallbackId = item?.id || `link-${index}`;
        if (!item?.title || !item?.url) return null;
        return {
          id: String(fallbackId),
          title: String(item.title),
          description: item.description ? String(item.description) : "",
          url: String(item.url),
        };
      })
      .filter(Boolean);
    if (!Array.isArray(list)) return [...defaultPageLinks];
    return normalized;
  }

  function loadPageLinks() {
    const saved = localStorage.getItem(pageLinksKey);
    if (!saved) return [...defaultPageLinks];
    try {
      const parsed = JSON.parse(saved);
      return normalizePageLinks(parsed);
    } catch (err) {
      console.warn("Failed to parse page links", err);
      return [...defaultPageLinks];
    }
  }

  function savePageLinks(list) {
    const normalized = normalizePageLinks(list);
    localStorage.setItem(pageLinksKey, JSON.stringify(normalized));
    return normalized;
  }

  function loadCommentsMap() {
    try {
      const saved = JSON.parse(localStorage.getItem(commentsKey));
      return saved && typeof saved === "object" ? saved : {};
    } catch (err) {
      console.warn("Failed to parse comments", err);
      return {};
    }
  }

  function loadComments(articleId) {
    const map = loadCommentsMap();
    return Array.isArray(map?.[articleId]) ? map[articleId] : [];
  }

  function addComment(articleId, payload) {
    if (!articleId && articleId !== 0) return loadComments(articleId);
    const map = loadCommentsMap();
    const list = Array.isArray(map[articleId]) ? map[articleId] : [];
    const newComment = {
      id: crypto.randomUUID?.() ?? `c-${Date.now()}`,
      author: payload?.author?.trim() || "名無しさん",
      body: payload?.body?.trim() || "",
      createdAt: Date.now(),
    };
    if (!newComment.body) return list;
    const next = [newComment, ...list].slice(0, 100);
    map[articleId] = next;
    localStorage.setItem(commentsKey, JSON.stringify(map));
    return next;
  }

  function loadCopyExtras() {
    const saved = localStorage.getItem(copyExtrasKey);
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed.filter((item) => item?.id && item?.text) : [];
    } catch (err) {
      console.warn("Failed to parse extra copy", err);
      return [];
    }
  }

  function saveCopyExtras(list) {
    const normalized = Array.isArray(list)
      ? list
          .map((item) => ({ id: item?.id ?? crypto.randomUUID?.() ?? String(Date.now()), text: item?.text ?? "" }))
          .filter((item) => item.text.trim().length)
      : [];
    localStorage.setItem(copyExtrasKey, JSON.stringify(normalized));
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

  function getHomeLatestArticles() {
    const settings = loadSettings();
    const articles = loadArticles();
    const list = settings.homeLatestIds
      .map((idx) => ({ idx, article: articles[idx] }))
      .filter((item) => item.article);
    return { list, settings };
  }

  function getHomeFeaturedArticles() {
    const settings = loadSettings();
    const articles = loadArticles();
    const list = settings.homeFeaturedIds
      .map((idx) => ({ idx, article: articles[idx] }))
      .filter((item) => item.article);
    return { list, settings };
  }

  function buildOfficialLineShare(url) {
    return `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}&accountId=${encodeURIComponent(officialLineAccountId)}`;
  }

  window.BlogData = {
    storageKey,
    settingsKey,
    copyKey,
    copyExtrasKey,
    pageLinksKey,
    commentsKey,
    officialLineAccountId,
    baseArticles,
    defaultCopy,
    defaultPageLinks,
    loadArticles,
    saveArticles,
    loadSettings,
    saveSettings,
    loadCopy,
    saveCopy,
    loadCopyExtras,
    saveCopyExtras,
    loadPageLinks,
    savePageLinks,
    upsertArticle,
    deleteArticle,
    findArticle,
    getHeroArticle,
    getFeaturedArticle,
    getFooterArticles,
    getHomeLatestArticles,
    getHomeFeaturedArticles,
    buildOfficialLineShare,
    loadComments,
    addComment,
  };
})();
