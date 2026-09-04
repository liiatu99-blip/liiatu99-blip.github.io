(() => {
  const root = document.documentElement;
  const button = document.getElementById("language-toggle");
  const content = {
    zh: {
      title: "谢纪隆 - 视觉交互设计师",
      description: "谢纪隆（Jiu）的个人作品集，聚焦视觉交互设计、数字产品体验、美术指导与前沿 AI Agent 技术实践。",
      label: "Switch to English",
    },
    en: {
      title: "Jiu - Visual Interaction Designer",
      description: "The portfolio of Jiu (Xie Jilong), featuring visual interaction design, digital product experiences, art direction, and explorations in AI agent technology.",
      label: "切换至中文",
    },
  };

  const setLanguage = (language) => {
    const lang = language === "en" ? "en" : "zh";
    root.dataset.language = lang;
    root.lang = lang === "zh" ? "zh-CN" : "en";
    document.title = content[lang].title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", content[lang].description);
    button?.setAttribute("aria-label", content[lang].label);
    button?.setAttribute("aria-pressed", String(lang === "en"));
    try { localStorage.setItem("portfolio-language", lang); } catch {}
  };

  let savedLanguage = null;
  try { savedLanguage = localStorage.getItem("portfolio-language"); } catch {}
  setLanguage(savedLanguage || (navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en"));

  button?.addEventListener("click", () => {
    setLanguage(root.dataset.language === "zh" ? "en" : "zh");
  });

  window.addEventListener("scroll", () => {
    document.getElementById("header")?.classList.toggle("is-scrolled", window.scrollY > 24);
  }, { passive: true });
})();
