/* Flexlyf Trade Intelligence — GitHub Pages static news loader */
(function () {
  "use strict";

  const DATA_URL = "./data/news.json";

  const CATEGORY_LABELS = {
    all: "All Categories",
    dgft: "DGFT & FTP",
    customs: "Customs & ICEGATE",
    incentives: "Export Incentives",
    gst: "GST & Refunds",
    certification: "Certifications",
    international: "International Trade",
    commodity: "Commodity Markets"
  };

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function safeUrl(url) {
    const value = String(url || "").trim();
    if (!value) return "";
    if (/^https?:\/\//i.test(value)) return value;
    if (/^(?:\.\/|\.\.\/|\/|[A-Za-z0-9_-]+\/)/.test(value)) return value;
    return "";
  }

  function formatDate(dateString) {
    if (!dateString) return "Topic";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }).format(date);
  }

  function articleUrl(slug) {
    return "./trade-article.html?slug=" + encodeURIComponent(slug);
  }

  function renderCards(items) {
    const grid = document.getElementById("tradeNewsGrid");
    const count = document.getElementById("tradeResultsCount");
    const empty = document.getElementById("tradeNoResults");
    if (!grid) return;

    grid.innerHTML = "";

    if (!items.length) {
      grid.innerHTML = '<div class="trade-news-empty"><h3>No updates found</h3><p>Try another keyword or category.</p></div>';
    } else {
      const fragment = document.createDocumentFragment();
      items.forEach((item) => {
        const card = document.createElement("article");
        card.className = "trade-news-card" + (item.image ? " has-image" : "");
        card.dataset.category = item.category || "";
        card.dataset.title = item.title || "";
        const image = safeUrl(item.image);
        const source = item.source ? escapeHtml(item.source) : "Verified source to be checked before acting";
        const ctaLabel = item.type === "topic" ? "Open Trade Topic" : "Read Full Update";
        card.innerHTML = `
          ${image ? `<img class="trade-news-card-image" src="${escapeHtml(image)}" alt="" loading="lazy">` : ""}
          <div class="trade-news-card-top">
            <span class="trade-news-category">${escapeHtml(item.categoryLabel || CATEGORY_LABELS[item.category] || "Trade Update")}</span>
            <span class="trade-news-date">${escapeHtml(formatDate(item.date))}</span>
          </div>
          <div class="trade-news-card-body">
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.summary)}</p>
            <div class="trade-news-source">${source}</div>
            <a href="${escapeHtml(articleUrl(item.slug))}" class="trade-news-link">
              ${ctaLabel} <span>→</span>
            </a>
          </div>`;
        fragment.appendChild(card);
      });
      grid.appendChild(fragment);
    }

    if (count) {
      count.textContent = `Showing ${items.length} update${items.length === 1 ? "" : "s"}`;
    }
    if (empty) empty.style.display = "none";
  }

  function initSearch(allItems) {
    const search = document.getElementById("tradeSearch");
    const category = document.getElementById("tradeCategory");
    if (!search || !category) return;

    function apply() {
      const term = search.value.trim().toLowerCase();
      const selected = category.value;
      const filtered = allItems.filter((item) => {
        if (item.published === false) return false;
        const haystack = [item.title, item.summary, item.source, item.categoryLabel].join(" ").toLowerCase();
        const searchMatch = !term || haystack.includes(term);
        const categoryMatch = selected === "all" || item.category === selected;
        return searchMatch && categoryMatch;
      });
      renderCards(filtered);
    }

    search.addEventListener("input", apply);
    category.addEventListener("change", apply);
    apply();
  }

  function initServiceDropdown() {
    const dropdown = document.querySelector(".nav-dropdown");
    const toggle = document.querySelector(".nav-dropdown-toggle");
    if (!dropdown || !toggle || toggle.dataset.dropdownBound === "true") return;
    toggle.dataset.dropdownBound = "true";

    toggle.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      const open = dropdown.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });

    document.addEventListener("click", function (event) {
      if (!dropdown.contains(event.target)) {
        dropdown.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        dropdown.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initServiceDropdown();

    fetch(DATA_URL + "?v=" + Date.now(), { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Could not load news.json (HTTP " + response.status + ")");
        return response.json();
      })
      .then((payload) => {
        const items = Array.isArray(payload) ? payload : payload.items;
        if (!Array.isArray(items)) throw new Error("news.json must contain an items array.");
        initSearch(items);
      })
      .catch((error) => {
        const grid = document.getElementById("tradeNewsGrid");
        const count = document.getElementById("tradeResultsCount");
        if (grid) {
          grid.innerHTML = '<div class="trade-news-empty"><h3>Trade updates are temporarily unavailable</h3><p>Please refresh the page or check the data/news.json file.</p></div>';
        }
        if (count) count.textContent = "Updates unavailable";
        console.error("Flexlyf Trade Intelligence:", error);
      });
  });
})();
