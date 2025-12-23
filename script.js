/**
 * 个人主页脚本：
 * - 主题切换（跟随系统 / 本地记忆）
 * - 平滑滚动 + 导航高亮
 * - 返回顶部
 * - 项目卡片渲染
 * - 复制邮箱
 */

const PROJECTS = [
  {
    title: "项目 A",
    badge: "开源",
    description:
      "一句话说明这个项目解决了什么问题、带来了什么价值。建议包含可量化结果（例如：性能提升 35%）。",
    tags: ["TypeScript", "React", "Vite"],
    links: {
      demo: "https://example.com",
      code: "https://github.com/yourname/project-a"
    }
  },
  {
    title: "项目 B",
    badge: "产品",
    description:
      "一句话说明你的贡献：你负责了哪些模块/设计/架构，以及最终效果（例如：DAU +20%）。",
    tags: ["Next.js", "Node.js", "PostgreSQL"],
    links: {
      demo: "https://example.com",
      code: "https://github.com/yourname/project-b"
    }
  },
  {
    title: "项目 C",
    badge: "工具",
    description:
      "一句话说明它如何被使用（团队/场景）、以及你特别骄傲的点（可维护性/可靠性/体验）。",
    tags: ["Design System", "a11y", "Perf"],
    links: {
      demo: "https://example.com",
      code: "https://github.com/yourname/project-c"
    }
  }
];

function $(selector) {
  return document.querySelector(selector);
}

function getSystemTheme() {
  return window.matchMedia?.("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

function applyTheme(pref) {
  const effective = pref === "system" ? getSystemTheme() : pref;
  if (effective === "light") document.documentElement.dataset.theme = "light";
  else document.documentElement.dataset.theme = "dark";
}

function initTheme() {
  const saved = localStorage.getItem("theme"); // light | dark | system | null
  const pref =
    saved === "light" || saved === "dark" || saved === "system" ? saved : "system";
  applyTheme(pref);

  const mq = window.matchMedia?.("(prefers-color-scheme: light)");
  mq?.addEventListener?.("change", () => {
    const pref = localStorage.getItem("theme");
    if (!pref || pref === "system") applyTheme("system");
  });

  const toggle = $("#themeToggle");
  toggle?.addEventListener("click", () => {
    const cur = localStorage.getItem("theme") ?? "system";
    // 循环：system -> dark -> light -> system
    const next = cur === "system" ? "dark" : cur === "dark" ? "light" : "system";
    localStorage.setItem("theme", next);
    applyTheme(next);
    updateThemeIcon();
  });

  updateThemeIcon();
}

function updateThemeIcon() {
  const el = $("#themeToggle .icon");
  if (!el) return;
  const pref = localStorage.getItem("theme") ?? "system";
  const effective = pref === "system" ? getSystemTheme() : pref;
  el.textContent = effective === "light" ? "☀" : "☾";
}

function initYear() {
  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());
}

function initBackToTop() {
  const btn = $("#backToTop");
  if (!btn) return;

  const update = () => {
    const y = window.scrollY || document.documentElement.scrollTop || 0;
    btn.style.opacity = y > 500 ? "1" : "0";
    btn.style.pointerEvents = y > 500 ? "auto" : "none";
  };
  update();
  window.addEventListener("scroll", update, { passive: true });
  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function initSmoothAnchors() {
  const headerH = 72; // 与 CSS 的 --header-h 对齐
  document.addEventListener("click", (e) => {
    const a = e.target?.closest?.('a[href^="#"]');
    if (!a) return;

    const href = a.getAttribute("href");
    if (!href || href === "#") return;

    const id = href.slice(1);
    const target = document.getElementById(id);
    if (!target) return;

    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - headerH - 10;
    window.scrollTo({ top, behavior: "smooth" });
    history.pushState(null, "", href);
  });
}

function initNavHighlight() {
  const links = Array.from(document.querySelectorAll('.nav a[href^="#"]'));
  if (links.length === 0) return;

  const map = new Map();
  for (const a of links) {
    const href = a.getAttribute("href");
    if (!href) continue;
    const id = href.slice(1);
    const sec = document.getElementById(id);
    if (sec) map.set(sec, a);
  }

  const clear = () => {
    for (const a of links) a.removeAttribute("aria-current");
  };

  const obs = new IntersectionObserver(
    (entries) => {
      // 选出最“靠近顶部”的可见 section
      const visible = entries
        .filter((x) => x.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (!visible) return;

      clear();
      const a = map.get(visible.target);
      a?.setAttribute("aria-current", "page");
    },
    {
      root: null,
      // sticky header + 少量容错
      rootMargin: "-76px 0px -70% 0px",
      threshold: [0.05, 0.15, 0.3]
    }
  );

  for (const sec of map.keys()) obs.observe(sec);
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderProjects() {
  const grid = $("#projectGrid");
  if (!grid) return;
  grid.innerHTML = "";

  for (const p of PROJECTS) {
    const tags = (p.tags ?? [])
      .map((t) => `<span class="tag">${escapeHtml(t)}</span>`)
      .join("");

    const demo = p.links?.demo
      ? `<a href="${escapeHtml(p.links.demo)}" target="_blank" rel="noreferrer">演示</a>`
      : "";
    const code = p.links?.code
      ? `<a href="${escapeHtml(p.links.code)}" target="_blank" rel="noreferrer">代码</a>`
      : "";

    const badge = p.badge ? `<span class="pill">${escapeHtml(p.badge)}</span>` : "";

    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <div class="project-title-row">
        <h3 class="project-title">${escapeHtml(p.title)}</h3>
        ${badge}
      </div>
      <p class="project-desc">${escapeHtml(p.description)}</p>
      <div class="tag-row" aria-label="技术栈">
        ${tags}
      </div>
      <div class="project-links" aria-label="项目链接">
        ${demo}
        ${code}
      </div>
    `;

    grid.appendChild(card);
  }
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // 兜底：旧浏览器或不安全上下文
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      document.body.removeChild(ta);
      return false;
    }
  }
}

function initCopyEmail() {
  const btn = $("#copyEmailBtn");
  const link = $("#emailLink");
  const status = $("#copyStatus");
  if (!btn || !link) return;

  btn.addEventListener("click", async () => {
    const email = link.textContent?.trim() || "you@example.com";
    const ok = await copyText(email);
    if (status) status.textContent = ok ? "已复制到剪贴板" : "复制失败，请手动复制";
    btn.textContent = ok ? "已复制" : "复制邮箱";
    window.setTimeout(() => {
      btn.textContent = "复制邮箱";
      if (status) status.textContent = "";
    }, 1800);
  });
}

function init() {
  initTheme();
  initYear();
  initBackToTop();
  initSmoothAnchors();
  initNavHighlight();
  renderProjects();
  initCopyEmail();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

