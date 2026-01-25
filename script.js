/* eslint-disable no-use-before-define */
// This file uses static leaderboard data; update as needed.

const UPDATE_DATE = "2026-01-22";

const ORG_META = {
  "Google DeepMind": { short: "G", bg: "#1a73e8", fg: "#ffffff" },
  OpenAI: { short: "O", bg: "#0f172a", fg: "#ffffff", logo: "gpt.png" },
  Alibaba: { short: "A", bg: "#f97316", fg: "#ffffff", logo: "qwen.png" },
  xAI: { short: "x", bg: "#111827", fg: "#ffffff", logo: "grok.png" },
  Anthropic: { short: "An", bg: "#7c3aed", fg: "#ffffff", logo: "claude.png" },
  ByteDance: { short: "BD", bg: "#ef4444", fg: "#ffffff", logo: "doubao.png" },
  Google: { short: "G", bg: "#1a73e8", fg: "#ffffff", logo: "gemini.jpg" },
};

const RAW_RESULTS = [
  { model: "gemini-2.5-pro", org: "Google", score: 8.1, opensource: false },
  {
    model: "gemini-2.5-pro 2.5",
    org: "Google",
    score: 16,
    opensource: false,
    withSearch: true,
  },
  { model: "gemini-3-pro", org: "Google", score: 12.5, opensource: false , withSearch: false},
  {
    model: "gemini-3-pro",
    org: "Google",
    score: 27.0,
    opensource: false,
    withSearch: true,
  },
  { model: "gpt-5", org: "OpenAI", score: 5.6, opensource: false },
  { model: "gpt-5 with search", org: "OpenAI", score: 11.5, opensource: false },
  { model: "gpt-4o-2024-08-06", org: "OpenAI", score: 2.8, opensource: false },
  { model: "Qwen3-VL-32B-Instruct", org: "Alibaba", score: 0.3, opensource: true },
  { model: "grok-4-1-fast-non-reasoning", org: "xAI", score: 1.9, opensource: false },
  {
    model: "grok-4-1-fast-non-reasoning",
    org: "xAI",
    score: 1.9,
    opensource: false,
    withSearch: true,
  },
  { model: "claude-4.5-opus", org: "Anthropic", score: 4.0, opensource: false },
  { model: "doubao-seed-1-6-vision-250815", org: "ByteDance", score: 2.4, opensource: false , withSearch: false},
  { model: "doubao-seed-1-8-251228", org: "ByteDance", score: 2.5, opensource: false , withSearch: false},
  { model: "doubao-seed-1-8-251228", org: "ByteDance", score: 13, opensource: false , withSearch: true},
];

const LEADERBOARD_RESULTS = RAW_RESULTS.map((row) => ({
  ...row,
  track: "Overall",
  setting: row.withSearch ? "Search API enabled" : "No search API",
  date: UPDATE_DATE,
}));

const state = {
  q: "",
  track: "all",
  setting: "all",
  opensourceOnly: false,
  sortKey: "score",
  sortDir: "desc", // "asc" | "desc"
};

function uniq(values) {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
}

function byKey(key) {
  return (row) => row[key];
}

function normalize(s) {
  return String(s ?? "").toLowerCase().trim();
}

function matchesQuery(row, q) {
  if (!q) return true;
  const haystack = normalize(
    `${row.model} ${row.org} ${row.track} ${row.setting}`,
  );
  return haystack.includes(normalize(q));
}

function matchesFilter(value, selected) {
  return selected === "all" ? true : value === selected;
}

function sortRows(rows, key, dir) {
  const mul = dir === "asc" ? 1 : -1;
  const copy = [...rows];
  copy.sort((a, b) => {
    const va = a[key];
    const vb = b[key];
    if (key === "score") return mul * (Number(va) - Number(vb));
    if (key === "date") return mul * (String(va).localeCompare(String(vb)));
    return mul * String(va).localeCompare(String(vb));
  });
  return copy;
}

function computeView(rows) {
  let out = rows.filter((r) => matchesQuery(r, state.q));
  out = out.filter((r) => matchesFilter(r.track, state.track));
  out = out.filter((r) => matchesFilter(r.setting, state.setting));
  if (state.opensourceOnly) out = out.filter((r) => r.opensource);
  out = sortRows(out, state.sortKey, state.sortDir);
  return out;
}

function fillSelect(selectEl, values) {
  const existing = Array.from(selectEl.querySelectorAll("option")).map(
    (o) => o.value,
  );
  values.forEach((v) => {
    if (existing.includes(v)) return;
    const opt = document.createElement("option");
    opt.value = v;
    opt.textContent = v;
    selectEl.appendChild(opt);
  });
}

function setSortedHeader(tableEl, sortKey, sortDir) {
  tableEl.querySelectorAll("thead th").forEach((th) => {
    const key = th.getAttribute("data-key");
    if (!key) return;
    th.classList.toggle("is-sorted", key === sortKey);
    if (key === sortKey) {
      th.setAttribute("aria-sort", sortDir === "asc" ? "ascending" : "descending");
      const indicator = th.querySelector(".sort-indicator");
      if (indicator) indicator.textContent = sortDir === "asc" ? "↑" : "↓";
    } else {
      th.removeAttribute("aria-sort");
      const indicator = th.querySelector(".sort-indicator");
      if (indicator) indicator.textContent = "";
    }
  });
}

const RANK_MEDALS = ["🥇", "🥈", "🥉"];

function renderTableBody(tbodyEl, rows) {
  tbodyEl.innerHTML = "";
  rows.forEach((r, idx) => {
    const tr = document.createElement("tr");
    const rank = idx + 1;
    const rankDisplay = rank <= 3 ? RANK_MEDALS[rank - 1] : String(rank);

    tr.appendChild(td(rankDisplay));
    tr.appendChild(tdStrong(r.model));
    tr.appendChild(tdOrg(r.org));
    // tr.appendChild(tdBadge(r.track));
    tr.appendChild(td(r.setting));
    tr.appendChild(tdScore(r.score));
    tr.appendChild(td(r.date));

    tbodyEl.appendChild(tr);
  });
}

function td(text) {
  const el = document.createElement("td");
  el.textContent = text;
  return el;
}

function tdStrong(text) {
  const el = document.createElement("td");
  const strong = document.createElement("strong");
  strong.textContent = text;
  el.appendChild(strong);
  return el;
}

function tdScore(score) {
  const el = document.createElement("td");
  el.className = "col-score";
  el.textContent = `${Number(score).toFixed(1)}%`;
  return el;
}

function tdBadge(text) {
  const el = document.createElement("td");
  const badge = document.createElement("span");
  badge.className = "badge";
  badge.textContent = text;
  el.appendChild(badge);
  return el;
}

function tdOrg(org) {
  const el = document.createElement("td");
  const wrap = document.createElement("div");
  wrap.className = "org-cell";

  const meta = ORG_META[org] || {};

  // Add logo image if available
  if (meta.logo) {
    const logoImg = document.createElement("img");
    logoImg.className = "org-logo";
    logoImg.src = `./assets/${meta.logo}`;
    logoImg.alt = `${org} logo`;
    logoImg.setAttribute("aria-hidden", "true");
    wrap.appendChild(logoImg);
  } else {
    // Fallback to text logo
    const logo = document.createElement("span");
    logo.className = "org-logo";
    logo.textContent = meta.short || org.slice(0, 2);
    if (meta.bg) logo.style.setProperty("--logo-bg", meta.bg);
    if (meta.fg) logo.style.setProperty("--logo-fg", meta.fg);
    logo.setAttribute("aria-hidden", "true");
    wrap.appendChild(logo);
  }

  const name = document.createElement("span");
  name.className = "org-name";
  name.textContent = org;

  wrap.appendChild(name);
  el.appendChild(wrap);
  return el;
}

function sync() {
  const rows = computeView(LEADERBOARD_RESULTS);
  renderTableBody(dom.tbody, rows);
  dom.resultCount.textContent = `${rows.length} result${rows.length === 1 ? "" : "s"}`;
  setSortedHeader(dom.table, state.sortKey, state.sortDir);
}

function reset() {
  state.q = "";
  state.track = "all";
  state.setting = "all";
  state.opensourceOnly = false;
  state.sortKey = "score";
  state.sortDir = "desc";

  dom.q.value = "";
  dom.track.value = "all";
  dom.setting.value = "all";
  dom.opensource.checked = false;
  sync();
}

const dom = {};

function init() {
  dom.q = document.getElementById("q");
  dom.track = document.getElementById("track");
  dom.setting = document.getElementById("setting");
  dom.opensource = document.getElementById("opensource");
  dom.table = document.getElementById("leaderboardTable");
  dom.tbody = document.getElementById("leaderboardBody");
  dom.resultCount = document.getElementById("resultCount");
  dom.resetBtn = document.getElementById("resetBtn");

  const tracks = uniq(LEADERBOARD_RESULTS.map(byKey("track")));
  const settings = uniq(LEADERBOARD_RESULTS.map(byKey("setting")));

  fillSelect(dom.track, tracks);
  fillSelect(dom.setting, settings);

  dom.q.addEventListener("input", () => {
    state.q = dom.q.value;
    sync();
  });
  dom.track.addEventListener("change", () => {
    state.track = dom.track.value;
    sync();
  });
  dom.setting.addEventListener("change", () => {
    state.setting = dom.setting.value;
    sync();
  });
  dom.opensource.addEventListener("change", () => {
    state.opensourceOnly = dom.opensource.checked;
    sync();
  });
  dom.resetBtn.addEventListener("click", reset);

  dom.table.querySelectorAll("thead th[data-key]").forEach((th) => {
    const key = th.getAttribute("data-key");
    if (!key || key === "rank") return;
    th.addEventListener("click", () => {
      if (state.sortKey === key) {
        state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
      } else {
        state.sortKey = key;
        state.sortDir = key === "score" ? "desc" : "asc";
      }
      sync();
    });
  });

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  sync();

  // Initialize magnifier for teaser images
  initMagnifiers();

  // Initialize fullscreen buttons for teaser images
  initFullscreenButtons();

  // Initialize dataset viewer
  initDatasetViewer();
}

const MAGNIFIER_ZOOM = 2.5;
const DATASET_MAGNIFIER_ZOOM = 4.0; // Higher zoom for dataset viewer
const MAGNIFIER_SIZE = 160;

function initMagnifiers() {
  const wraps = document.querySelectorAll(".magnifier-wrap");
  wraps.forEach((wrap) => {
    const img = wrap.querySelector("img[data-magnifier]");
    const lens = wrap.querySelector(".magnifier-lens");
    if (!img || !lens) return;

    // Check if this is a dataset viewer magnifier
    const isDatasetViewer = wrap.closest('.dataset-item') !== null;
    const zoom = isDatasetViewer ? DATASET_MAGNIFIER_ZOOM : MAGNIFIER_ZOOM;

    function updateLens(e) {
      const rect = wrap.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      let w = rect.width;
      let h = rect.height;
      if (w <= 0) w = 1;
      if (h <= 0) h = 1;

      const half = MAGNIFIER_SIZE / 2;
      const bgW = w * zoom;
      const bgH = h * zoom;
      const bx = x * zoom - half;
      const by = y * zoom - half;

      const src = (img.currentSrc || img.src).replace(/"/g, "%22");
      lens.style.backgroundImage = `url("${src}")`;
      lens.style.backgroundSize = `${bgW}px ${bgH}px`;
      lens.style.backgroundPosition = `${-bx}px ${-by}px`;

      const lensX = Math.max(half, Math.min(w - half, x));
      const lensY = Math.max(half, Math.min(h - half, y));
      lens.style.left = `${lensX - half}px`;
      lens.style.top = `${lensY - half}px`;
    }

    wrap.addEventListener("mousemove", updateLens);
  });
}

function initFullscreenButtons() {
  const fullscreenBtns = document.querySelectorAll(".fullscreen-btn");
  fullscreenBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent triggering magnifier
      const wrap = btn.closest(".magnifier-wrap");
      const img = wrap?.querySelector("img[data-magnifier]");
      if (img) {
        openModal(img.src);
      }
    });
  });
}

// Dataset Viewer functionality
let datasetData = [];
const datasetState = {
  searchQuery: "",
  currentPage: 1,
  itemsPerPage: 5,
  totalPages: 1,
};

function loadDataset() {
  return fetch('./assets/pix2fact_0125.json')
    .then(response => response.json())
    .then(data => {
      console.log("load data:", data);
      datasetData = data;
      datasetState.totalPages = Math.ceil(datasetData.length / datasetState.itemsPerPage);
      return datasetData;
    })
    .catch(error => {
      console.error('Error loading dataset:', error);
      return [];
    });
}

function filterDatasetItems(items, query) {
  if (!query) return items;

  const normalizedQuery = normalize(query);
  return items.filter(item => {
    const questionText = normalize(item.qustion || item.question || '');
    return questionText.includes(normalizedQuery);
  });
}

function getPaginatedItems(items, page, itemsPerPage) {
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return items.slice(startIndex, endIndex);
}

function renderDatasetItem(item) {
  const itemDiv = document.createElement('div');
  itemDiv.className = 'dataset-item';

  const imageDiv = document.createElement('div');
  imageDiv.className = 'dataset-image';
  
  // Create magnifier wrap container
  const magnifierWrap = document.createElement('div');
  magnifierWrap.className = 'magnifier-wrap';
  
  const img = document.createElement('img');
  img.src = item.image;
  img.alt = 'Dataset sample image';
  img.loading = 'lazy';
  img.setAttribute('data-magnifier', '');
  img.className = 'dataset-image-img';
  
  // Create magnifier lens
  const magnifierLens = document.createElement('div');
  magnifierLens.className = 'magnifier-lens';
  magnifierLens.setAttribute('aria-hidden', 'true');
  
  // Create fullscreen button
  const fullscreenBtn = document.createElement('button');
  fullscreenBtn.className = 'fullscreen-btn';
  fullscreenBtn.setAttribute('aria-label', 'View fullscreen');
  fullscreenBtn.setAttribute('title', 'View fullscreen');
  fullscreenBtn.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
    </svg>
  `;
  fullscreenBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openModal(item.image);
  });
  
  magnifierWrap.appendChild(img);
  magnifierWrap.appendChild(magnifierLens);
  magnifierWrap.appendChild(fullscreenBtn);
  imageDiv.appendChild(magnifierWrap);

  const contentDiv = document.createElement('div');
  contentDiv.className = 'dataset-content';

  const questionDiv = document.createElement('div');
  questionDiv.className = 'dataset-question';
  const questionLabel = document.createElement('strong');
  questionLabel.textContent = 'Question: ';
  questionDiv.appendChild(questionLabel);
  questionDiv.appendChild(document.createTextNode(item.qustion || item.question));

  const answerDiv = document.createElement('div');
  answerDiv.className = 'dataset-answer';
  const answerLabel = document.createElement('strong');
  answerLabel.textContent = 'Answer: ';
  answerDiv.appendChild(answerLabel);
  answerDiv.appendChild(document.createTextNode(item.answer));

  contentDiv.appendChild(questionDiv);
  contentDiv.appendChild(answerDiv);

  itemDiv.appendChild(imageDiv);
  itemDiv.appendChild(contentDiv);

  return itemDiv;
}

function renderDatasetItems(items) {
  const container = dom.datasetContainer;
  container.innerHTML = '';

  if (items.length === 0) {
    const noResults = document.createElement('div');
    noResults.className = 'no-results';
    noResults.textContent = 'No items found matching your search.';
    container.appendChild(noResults);
    return;
  }

  items.forEach(item => {
    const itemElement = renderDatasetItem(item);
    container.appendChild(itemElement);
  });
  
  // Re-initialize magnifiers for newly rendered items
  initMagnifiers();
}

function updateDatasetPagination() {
  const filteredItems = filterDatasetItems(datasetData, datasetState.searchQuery);
  const totalItems = filteredItems.length;
  datasetState.totalPages = Math.ceil(totalItems / datasetState.itemsPerPage);

  // Ensure current page is valid
  if (datasetState.currentPage > datasetState.totalPages) {
    datasetState.currentPage = datasetState.totalPages || 1;
  }
  if (datasetState.currentPage < 1) {
    datasetState.currentPage = 1;
  }

  // Update pagination controls
  dom.datasetCount.textContent = `Showing ${totalItems} item${totalItems === 1 ? '' : 's'}`;
  dom.pageInfo.textContent = `Page ${datasetState.currentPage} of ${datasetState.totalPages}`;

  dom.prevPage.disabled = datasetState.currentPage <= 1;
  dom.nextPage.disabled = datasetState.currentPage >= datasetState.totalPages;

  // Render current page items
  const paginatedItems = getPaginatedItems(filteredItems, datasetState.currentPage, datasetState.itemsPerPage);
  renderDatasetItems(paginatedItems);
}

// Modal functionality
function openModal(imageSrc) {
  const modal = document.getElementById('imageModal');
  const modalImage = document.getElementById('modalImage');
  modalImage.src = imageSrc;
  modal.classList.add('active');
  document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeModal() {
  const modal = document.getElementById('imageModal');
  modal.classList.remove('active');
  document.body.style.overflow = ''; // Restore scrolling
}

function initDatasetViewer() {
  // Get DOM elements
  dom.datasetSearch = document.getElementById('dataset-search');
  dom.itemsPerPage = document.getElementById('items-per-page');
  dom.datasetCount = document.getElementById('dataset-count');
  dom.prevPage = document.getElementById('prev-page');
  dom.nextPage = document.getElementById('next-page');
  dom.pageInfo = document.getElementById('page-info');
  dom.datasetContainer = document.getElementById('dataset-container');

  // Modal elements
  dom.imageModal = document.getElementById('imageModal');
  dom.modalClose = document.getElementById('modalClose');

  // Load dataset and initialize
  loadDataset().then(() => {
    updateDatasetPagination();

    // Add event listeners
    dom.datasetSearch.addEventListener('input', () => {
      datasetState.searchQuery = dom.datasetSearch.value;
      datasetState.currentPage = 1; // Reset to first page on search
      updateDatasetPagination();
    });

    dom.itemsPerPage.addEventListener('change', () => {
      datasetState.itemsPerPage = parseInt(dom.itemsPerPage.value);
      datasetState.currentPage = 1; // Reset to first page
      updateDatasetPagination();
    });

    dom.prevPage.addEventListener('click', () => {
      if (datasetState.currentPage > 1) {
        datasetState.currentPage--;
        updateDatasetPagination();
      }
    });

    dom.nextPage.addEventListener('click', () => {
      if (datasetState.currentPage < datasetState.totalPages) {
        datasetState.currentPage++;
        updateDatasetPagination();
      }
    });

    // Modal event listeners
    dom.modalClose.addEventListener('click', closeModal);
    dom.imageModal.addEventListener('click', (e) => {
      if (e.target === dom.imageModal) {
        closeModal();
      }
    });

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && dom.imageModal.classList.contains('active')) {
        closeModal();
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", init);

