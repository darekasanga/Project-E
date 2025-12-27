(() => {
  let lightbox;

  function ensureLightbox() {
    if (lightbox) return lightbox;
    const wrap = document.createElement("div");
    wrap.className = "image-lightbox";
    wrap.innerHTML = `
      <div class="backdrop" aria-hidden="true"></div>
      <img alt="拡大画像" loading="lazy">
      <div class="hint">タップで閉じる / Esc</div>
    `;
    document.body.appendChild(wrap);
    const img = wrap.querySelector("img");
    const close = () => wrap.classList.remove("visible");
    wrap.addEventListener("click", close);
    window.addEventListener("keydown", (event) => event.key === "Escape" && close());
    lightbox = { wrap, img, open: (src, alt = "") => {
      img.src = src;
      img.alt = alt;
      wrap.classList.add("visible");
    } };
    return lightbox;
  }

  function attachToImage(img) {
    if (!img || img.dataset?.lightboxBound === "true") return;
    img.dataset.lightboxBound = "true";
    img.style.cursor = "zoom-in";
    const alt = img.getAttribute("alt") || "画像を拡大";
    const open = () => ensureLightbox().open(img.src, alt);
    img.addEventListener("click", open);
    img.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open();
      }
    });
    img.setAttribute("role", "button");
    img.setAttribute("tabindex", "0");
    img.setAttribute("aria-label", `${alt} を拡大表示`);
  }

  function enhanceImages(scope = document) {
    const images = scope.querySelectorAll("img");
    images.forEach(attachToImage);
  }

  window.Lightbox = { enhanceImages };
  document.addEventListener("DOMContentLoaded", () => enhanceImages());
})();
