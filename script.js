const header = document.querySelector("[data-header]");
const menuButton = document.querySelector(".menu-button");
const nav = document.querySelector(".site-nav");
const navLinks = [...document.querySelectorAll('.site-nav a[href^="#"]')];

const updateHeader = () => header?.classList.toggle("scrolled", window.scrollY > 12);
updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

menuButton?.addEventListener("click", () => {
  const open = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!open));
  nav.classList.toggle("open", !open);
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuButton?.setAttribute("aria-expanded", "false");
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("is-visible")),
  { threshold: 0.12 }
);
document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => link.classList.toggle("active", link.hash === `#${entry.target.id}`));
    });
  },
  { rootMargin: "-25% 0px -65%", threshold: 0 }
);
document.querySelectorAll("main section[id]").forEach((section) => sectionObserver.observe(section));

const cells = [...document.querySelectorAll(".matrix-cell")];
const inspectorTitle = document.querySelector("[data-inspector-title]");
const inspectorDetail = document.querySelector("[data-inspector-detail]");

cells.forEach((cell) => {
  cell.addEventListener("click", () => {
    cells.forEach((candidate) => candidate.classList.remove("active"));
    cell.classList.add("active");
    inspectorTitle.textContent = cell.dataset.title;
    inspectorDetail.textContent = cell.dataset.detail;
  });
});

const copyButton = document.querySelector("[data-copy]");
copyButton?.addEventListener("click", async () => {
  const citation = document.querySelector("#bibtex")?.textContent ?? "";
  const label = copyButton.querySelector("[data-copy-label]");
  try {
    await navigator.clipboard.writeText(citation);
    label.textContent = "Copied";
  } catch {
    const range = document.createRange();
    range.selectNodeContents(document.querySelector("#bibtex"));
    window.getSelection()?.removeAllRanges();
    window.getSelection()?.addRange(range);
    label.textContent = "Selected";
  }
  window.setTimeout(() => { label.textContent = "Copy BibTeX"; }, 1800);
});

const papers = Array.isArray(window.PAPER_LIBRARY) ? window.PAPER_LIBRARY : [];
const libraryForm = document.querySelector("[data-library-form]");
const paperGrid = document.querySelector("[data-paper-grid]");
const paperSearch = document.querySelector("[data-paper-search]");
const resultCount = document.querySelector("[data-result-count]");
const visibleCount = document.querySelector("[data-visible-count]");
const totalPapers = document.querySelector("[data-total-papers]");
const filterDescription = document.querySelector("[data-filter-description]");
const loadMoreButton = document.querySelector("[data-load-more]");
const emptyState = document.querySelector("[data-library-empty]");
const sortSelect = document.querySelector("[data-sort]");
const filterSelects = [...document.querySelectorAll("[data-filter]")];
const levelShortcuts = [...document.querySelectorAll("[data-level]")];
const pageSize = 12;
let visibleLimit = pageSize;

const optionOrder = {
  capability: ["Plausible", "Controllable", "Actionable", "Cross-cutting"],
  loop: ["Data Loop", "Reward and Critic Loop", "Policy Loop", "Model-Self Loop"],
};

const fieldLists = {
  capability: "capabilities",
  progression: "progressions",
  loop: "loops",
  domain: "domains",
};

const appendOptions = (select) => {
  const field = select.dataset.filter;
  const values = [...new Set(papers.flatMap((paper) => paper[fieldLists[field]] || []).filter(Boolean))];
  const ordered = optionOrder[field]
    ? optionOrder[field].filter((value) => values.includes(value))
    : values.sort((a, b) => a.localeCompare(b));
  ordered.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.append(option);
  });
};

filterSelects.forEach(appendOptions);
if (totalPapers) totalPapers.textContent = String(papers.length);

const element = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

const shortAuthors = (authors) => {
  const list = authors.split(";").map((author) => author.trim()).filter(Boolean);
  if (list.length <= 3) return list.join(", ");
  return `${list.slice(0, 3).join(", ")} +${list.length - 3}`;
};

const createPaperCard = (paper, index) => {
  const card = element("article", "paper-card");
  card.dataset.capability = paper.capability;

  const top = element("div", "paper-topline");
  top.append(element("span", "paper-index", String(index + 1).padStart(3, "0")));
  top.append(element("span", "paper-level", paper.capability || "Unclassified"));

  const title = element("h3");
  const titleLink = element("a", "", paper.title);
  titleLink.href = paper.absUrl;
  titleLink.target = "_blank";
  titleLink.rel = "noreferrer";
  titleLink.setAttribute("aria-label", `${paper.title}, open paper`);
  title.append(titleLink);

  const authors = element("p", "paper-authors", shortAuthors(paper.authors));
  authors.title = paper.authors.replaceAll(";", ",");

  const direction = element("p", "paper-direction");
  direction.append(element("strong", "", "Body classification"));
  direction.append(document.createTextNode(paper.progressions.length ? paper.progressions.join(" · ") : paper.citedIn.join(" · ")));

  const tags = element("div", "paper-tags");
  [...paper.loops, ...paper.domains].forEach((tag) => tags.append(element("span", "", tag)));

  const footer = element("div", "paper-footer");
  const identifier = paper.arxivId ? `arXiv:${paper.arxivId}` : paper.key;
  footer.append(element("span", "paper-meta", `${paper.year} · ${identifier}`));
  const links = element("div", "paper-links");
  const usesSearchFallback = paper.absUrl.includes("scholar.google.com");
  const abstractLink = element("a", "", usesSearchFallback ? "Find ↗" : "Paper ↗");
  abstractLink.href = paper.absUrl;
  abstractLink.target = "_blank";
  abstractLink.rel = "noreferrer";
  links.append(abstractLink);
  if (paper.pdfUrl) {
    const pdfLink = element("a", "", "PDF ↗");
    pdfLink.href = paper.pdfUrl;
    pdfLink.target = "_blank";
    pdfLink.rel = "noreferrer";
    links.append(pdfLink);
  }
  footer.append(links);

  card.append(top, title, authors, direction, tags, footer);
  return card;
};

const getFilters = () => Object.fromEntries(filterSelects.map((select) => [select.dataset.filter, select.value]));

const getFilteredPapers = () => {
  const query = paperSearch.value.trim().toLocaleLowerCase();
  const filters = getFilters();
  const filtered = papers.filter((paper) => {
    const searchable = [paper.title, paper.authors, paper.venue, paper.key, ...paper.capabilities, ...paper.progressions, ...paper.loops, ...paper.domains, ...paper.citedIn]
      .join(" ")
      .toLocaleLowerCase();
    const matchesQuery = !query || searchable.includes(query);
    const matchesFilters = Object.entries(filters).every(([field, value]) => !value || paper[fieldLists[field]].includes(value));
    return matchesQuery && matchesFilters;
  });

  const sort = sortSelect.value;
  return filtered.sort((a, b) => {
    if (sort === "oldest") return Number(a.year) - Number(b.year) || a.title.localeCompare(b.title);
    if (sort === "title") return a.title.localeCompare(b.title);
    return Number(b.year) - Number(a.year) || a.title.localeCompare(b.title);
  });
};

const syncLevelShortcuts = () => {
  const capability = document.querySelector('[data-filter="capability"]').value;
  levelShortcuts.forEach((button) => button.classList.toggle("active", button.dataset.level === capability));
};

const renderLibrary = () => {
  if (!paperGrid || !paperSearch || !sortSelect) return;
  const filtered = getFilteredPapers();
  const visible = filtered.slice(0, visibleLimit);
  paperGrid.replaceChildren(...visible.map(createPaperCard));

  resultCount.textContent = String(filtered.length);
  visibleCount.textContent = String(visible.length);
  emptyState.hidden = filtered.length !== 0;
  loadMoreButton.hidden = visible.length >= filtered.length;

  const filters = Object.values(getFilters()).filter(Boolean);
  filterDescription.textContent = filters.length ? filters.join(" · ") : "All body classifications";
  syncLevelShortcuts();
};

const updateLibrary = () => {
  visibleLimit = pageSize;
  renderLibrary();
};

paperSearch?.addEventListener("input", updateLibrary);
filterSelects.forEach((select) => select.addEventListener("change", updateLibrary));
sortSelect?.addEventListener("change", updateLibrary);

levelShortcuts.forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelector('[data-filter="capability"]').value = button.dataset.level;
    updateLibrary();
  });
});

libraryForm?.addEventListener("reset", () => window.setTimeout(updateLibrary));
document.querySelector("[data-empty-reset]")?.addEventListener("click", () => {
  libraryForm.reset();
  window.setTimeout(updateLibrary);
});

loadMoreButton?.addEventListener("click", () => {
  visibleLimit += pageSize;
  renderLibrary();
});

document.addEventListener("keydown", (event) => {
  const isTyping = ["INPUT", "SELECT", "TEXTAREA"].includes(document.activeElement?.tagName);
  if (event.key === "/" && !isTyping) {
    event.preventDefault();
    paperSearch?.focus();
  }
  if (event.key === "Escape" && document.activeElement === paperSearch && paperSearch.value) {
    paperSearch.value = "";
    updateLibrary();
  }
});

renderLibrary();
