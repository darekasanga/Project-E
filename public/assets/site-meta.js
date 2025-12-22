(() => {
  const version = "v1.0.0";
  const formatDate = new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const updated = new Date(document.lastModified || Date.now());
  const formatted = formatDate.format(updated);

  document.querySelectorAll('[data-site-version]').forEach((el) => {
    el.textContent = version;
  });

  document.querySelectorAll('[data-site-updated]').forEach((el) => {
    el.textContent = `最終更新 ${formatted}`;
  });
})();
