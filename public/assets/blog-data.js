(() => {
  const storageKey = "emperor_articles";
  const backupKey = "emperor_articles_backup_v1";
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

  function safeParse(key) {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch (err) {
      console.warn(`Failed to parse storage for ${key}`, err);
      return null;
    }
  }

  function persistBackup(snapshot) {
    try {
      localStorage.setItem(backupKey, JSON.stringify(snapshot));
    } catch (err) {
      console.warn("Failed to persist backup snapshot", err);
    }
  }

  function readBackup() {
    const parsed = safeParse(backupKey);
    if (!parsed) return null;
    if (Array.isArray(parsed)) return { articles: parsed };
    const articles = Array.isArray(parsed.articles) ? parsed.articles : null;
    const settings = parsed.settings && typeof parsed.settings === "object" ? parsed.settings : null;
    const copy = parsed.copy && typeof parsed.copy === "object" ? parsed.copy : null;
    const copyExtras = Array.isArray(parsed.copyExtras) ? parsed.copyExtras : null;
    const pageLinks = Array.isArray(parsed.pageLinks) ? parsed.pageLinks : null;
    const comments = parsed.comments && typeof parsed.comments === "object" ? parsed.comments : null;
    return { articles, settings, copy, copyExtras, pageLinks, comments };
  }

  function parseSaved() {
    const parsed = safeParse(storageKey);
    if (Array.isArray(parsed)) return parsed;
    const backup = readBackup();
    if (Array.isArray(backup?.articles)) return backup.articles;
    return null;
  }

  function loadArticles() {
    const list = parseSaved() ?? baseArticles;
    if (!safeParse(backupKey)) {
      persistBackup({ version: 1, exportedAt: Date.now(), articles: list });
    }
    return list;
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
    const homeFeaturedIds = buildSelection(raw?.homeFeaturedIds ?? raw?.featureSliderIds, 6);
    const cardHeight = Number.isInteger(raw?.cardHeight)
      ? Math.min(800, Math.max(240, raw.cardHeight))
      : 380;
    return { heroId, featuredId, footerIds, homeLatestIds, homeFeaturedIds, cardHeight };
  }

  function loadSettings() {
    const saved = localStorage.getItem(settingsKey);
    if (!saved) return normalizeSettings(readBackup()?.settings ?? {});
    try {
      const parsed = JSON.parse(saved);
      return normalizeSettings(parsed);
    } catch (err) {
      console.warn("Failed to parse article settings", err);
      return normalizeSettings(readBackup()?.settings ?? {});
    }
  }

  function saveArticles(list) {
    const normalized = Array.isArray(list) ? list : [];
    localStorage.setItem(storageKey, JSON.stringify(normalized));
    try {
      exportState({ articles: normalized });
    } catch (err) {
      console.warn("Failed to update backup snapshot", err);
    }
    return normalized;
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
    const saved = safeParse(copyKey);
    if (!saved) return { ...defaultCopy, ...(readBackup()?.copy ?? {}) };
    if (typeof saved === "object") return { ...defaultCopy, ...saved };
    console.warn("Copy data malformed, falling back to defaults");
    return { ...defaultCopy, ...(readBackup()?.copy ?? {}) };
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
    const saved = safeParse(pageLinksKey);
    if (saved) return normalizePageLinks(saved);
    const backup = readBackup();
    if (backup?.pageLinks) return normalizePageLinks(backup.pageLinks);
    return [...defaultPageLinks];
  }

  function savePageLinks(list) {
    const normalized = normalizePageLinks(list);
    localStorage.setItem(pageLinksKey, JSON.stringify(normalized));
    return normalized;
  }

  function loadCommentsMap() {
    const parsed = safeParse(commentsKey);
    if (parsed && typeof parsed === "object") return parsed;
    const backup = readBackup();
    return backup?.comments && typeof backup.comments === "object" ? backup.comments : {};
  }

  function saveCommentsMap(map) {
    const normalized = map && typeof map === "object" ? map : {};
    localStorage.setItem(commentsKey, JSON.stringify(normalized));
    return normalized;
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
    saveCommentsMap(map);
    return next;
  }

  function loadCopyExtras() {
    const saved = safeParse(copyExtrasKey);
    if (Array.isArray(saved)) return saved.filter((item) => item?.id && item?.text);
    const backup = readBackup();
    if (Array.isArray(backup?.copyExtras)) return backup.copyExtras.filter((item) => item?.id && item?.text);
    return [];
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

  function exportState(overrides = {}) {
    const snapshot = {
      version: 1,
      exportedAt: Date.now(),
      articles: overrides.articles ?? loadArticles(),
      settings: overrides.settings ?? loadSettings(),
      copy: overrides.copy ?? loadCopy(),
      copyExtras: overrides.copyExtras ?? loadCopyExtras(),
      pageLinks: overrides.pageLinks ?? loadPageLinks(),
      comments: overrides.comments ?? loadCommentsMap(),
    };
    persistBackup(snapshot);
    return snapshot;
  }

  function importState(raw) {
    if (!raw || typeof raw !== "object") throw new Error("復元データが不正です。");
    const articles = Array.isArray(raw.articles) ? raw.articles : [];
    const settings = normalizeSettings(raw.settings ?? {});
    const copy = raw.copy && typeof raw.copy === "object" ? { ...defaultCopy, ...raw.copy } : { ...defaultCopy };
    const copyExtras = Array.isArray(raw.copyExtras) ? raw.copyExtras
      .map((item) => ({ id: item?.id ?? crypto.randomUUID?.() ?? `copy-${Date.now()}`, text: item?.text ?? "" }))
      .filter((item) => item.text.trim().length) : [];
    const pageLinks = normalizePageLinks(raw.pageLinks);
    const comments = raw.comments && typeof raw.comments === "object" ? raw.comments : {};

    saveArticles(articles);
    saveSettings(settings);
    saveCopy(copy);
    saveCopyExtras(copyExtras);
    savePageLinks(pageLinks);
    saveCommentsMap(comments);
    exportState({ articles, settings, copy, copyExtras, pageLinks, comments, importedAt: Date.now() });

    return { articles, settings, copy, copyExtras, pageLinks, comments };
  }

  function buildOfficialLineShare(url) {
    return `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}&accountId=${encodeURIComponent(officialLineAccountId)}`;
  }

  window.BlogData = {
    storageKey,
    backupKey,
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
    exportState,
    importState,
  };
})();
