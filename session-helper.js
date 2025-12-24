(function () {
  const STORAGE_KEY = "portal_user_sessions_v1";
  const FALLBACK = { currentUser: null, users: {} };

  function safeParse(raw) {
    if (!raw) return { ...FALLBACK };
    try {
      const parsed = JSON.parse(raw);
      return {
        currentUser: parsed.currentUser || null,
        users: parsed.users || {},
      };
    } catch {
      return { ...FALLBACK };
    }
  }

  function loadSession() {
    return safeParse(localStorage.getItem(STORAGE_KEY));
  }

  function saveSession(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* no-op */
    }
  }

  function setCurrentUser(name) {
    const trimmed = (name || "").trim();
    if (!trimmed) return null;
    const data = loadSession();
    data.currentUser = trimmed;
    data.users[trimmed] = data.users[trimmed] || {};
    data.users[trimmed].lastVisitedAt = Date.now();
    saveSession(data);
    return trimmed;
  }

  function clearCurrentUser() {
    const data = loadSession();
    data.currentUser = null;
    saveSession(data);
  }

  function rememberPage(path, title) {
    const data = loadSession();
    if (!data.currentUser) return;
    const targetPath =
      path ||
      (typeof location !== "undefined"
        ? location.pathname + location.search + location.hash
        : "/");
    const entry = data.users[data.currentUser] || {};
    entry.lastPath = targetPath;
    entry.lastTitle = title || (typeof document !== "undefined" ? document.title : "");
    entry.lastVisitedAt = Date.now();
    data.users[data.currentUser] = entry;
    saveSession(data);
  }

  function getCurrentUser() {
    const data = loadSession();
    return data.currentUser || null;
  }

  function getUserInfo(name) {
    const data = loadSession();
    const entry = data.users?.[name];
    if (!entry) return null;
    return { name, ...entry };
  }

  function getAllUsers() {
    const data = loadSession();
    return Object.entries(data.users || {})
      .map(([name, info]) => ({ name, ...info }))
      .sort((a, b) => (b.lastVisitedAt || 0) - (a.lastVisitedAt || 0));
  }

  window.PortalSession = {
    load: loadSession,
    setCurrentUser,
    clearCurrentUser,
    rememberPage,
    getCurrentUser,
    getUserInfo,
    getAllUsers,
  };
})();
