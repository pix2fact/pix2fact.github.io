/* eslint-disable no-use-before-define */
// This file uses static leaderboard data; update as needed.

const METRIC_KEYS = ["c1", "c2", "c3", "c4", "avg"];

const LEADERBOARD_GROUPS = [
  {
    id: "open",
    label: "Open-weights models",
    className: "group-open",
    rows: [
      {
        model: "Qwen3.6-27B",
        logo: "qwen.png",
        opensource: true,
        c1: 4.7,
        c2: 16.8,
        c3: 4.9,
        c4: 26.2,
        avg: 13.2,
        heat: { c1: 0, c2: 2, c3: 0, c4: 4, avg: 2 },
      },
      {
        model: "GLM-4.6V",
        logo: "zhipu.png",
        opensource: true,
        c1: 2.9,
        c2: 11.4,
        c3: 6.6,
        c4: 23.9,
        avg: 11.2,
        heat: { c1: 0, c2: 1, c3: 1, c4: 3, avg: 1 },
      },
      {
        model: "Gemma4-31B",
        logo: "gemma-color.png",
        opensource: true,
        c1: 2.8,
        c2: 8.2,
        c3: 6.2,
        c4: 19.6,
        avg: 9.2,
        heat: { c1: 0, c2: 1, c3: 1, c4: 3, avg: 1 },
      },
    ],
  },
  {
    id: "closed",
    label: "Closed-weights models",
    className: "group-closed",
    rows: [
      {
        model: "gemini-3.1-pro",
        logo: "gemini.jpg",
        opensource: false,
        c1: 18.4,
        c2: 42.4,
        c3: 21.0,
        c4: 51.7,
        avg: 33.4,
        heat: { c1: 3, c2: 6, c3: 3, c4: 7, avg: 5 },
      },
      {
        model: "gemini-2.5-pro",
        logo: "gemini.jpg",
        opensource: false,
        c1: 14.6,
        c2: 29.1,
        c3: 18.6,
        c4: 39.0,
        avg: 25.3,
        heat: { c1: 2, c2: 4, c3: 3, c4: 6, avg: 4 },
      },
      {
        model: "GPT-5.4",
        logo: "gpt.png",
        opensource: false,
        c1: 8.5,
        c2: 17.9,
        c3: 14.5,
        c4: 32.9,
        avg: 18.5,
        heat: { c1: 1, c2: 2, c3: 2, c4: 5, avg: 3 },
      },
      {
        model: "Grok-4.20",
        logo: "grok.png",
        opensource: false,
        c1: 4.4,
        c2: 22.3,
        c3: 7.3,
        c4: 38.8,
        avg: 18.2,
        heat: { c1: 0, c2: 3, c3: 1, c4: 6, avg: 2 },
      },
      {
        model: "Claude-Opus-4.7",
        logo: "claude.png",
        opensource: false,
        note: "*",
        c1: 13.3,
        c2: null,
        c3: 16.3,
        c4: null,
        avg: 14.8,
        heat: { c1: 2, c2: 0, c3: 2, c4: 0, avg: 2 },
      },
      {
        model: "Doubao-2.0",
        logo: "doubao.png",
        opensource: false,
        c1: 8.0,
        c2: 8.6,
        c3: 12.5,
        c4: 15.1,
        avg: 11.1,
        heat: { c1: 1, c2: 1, c3: 2, c4: 2, avg: 1 },
      },
      {
        model: "Doubao-1.8",
        logo: "doubao.png",
        opensource: false,
        c1: 7.2,
        c2: 10.6,
        c3: 8.4,
        c4: 17.2,
        avg: 10.9,
        heat: { c1: 1, c2: 1, c3: 1, c4: 2, avg: 1 },
      },
    ],
  },
];

const LEADERBOARD_ROWS = LEADERBOARD_GROUPS.flatMap((group) =>
  group.rows.map((row) => ({ ...row, group: group.id, groupLabel: group.label })),
);

const BEST_BY_METRIC = METRIC_KEYS.reduce((acc, key) => {
  const values = LEADERBOARD_ROWS.map((row) => row[key]).filter((value) => value != null);
  acc[key] = Math.max(...values);
  return acc;
}, {});

const state = {
  q: "",
  opensourceOnly: false,
  sortKey: "avg",
  sortDir: "desc",
};

function normalize(s) {
  return String(s ?? "").toLowerCase().trim();
}

function matchesQuery(row, q) {
  if (!q) return true;
  return normalize(row.model).includes(normalize(q));
}

function sortRows(rows, key, dir) {
  const mul = dir === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    const va = a[key];
    const vb = b[key];
    if (key === "model") return mul * String(va).localeCompare(String(vb));
    if (va == null && vb == null) return 0;
    if (va == null) return 1;
    if (vb == null) return -1;
    return mul * (Number(va) - Number(vb));
  });
}

function computeView() {
  const groups = LEADERBOARD_GROUPS.filter((group) => {
    if (!state.opensourceOnly) return true;
    return group.id === "open";
  });

  return groups.flatMap((group) => {
    let rows = group.rows.filter((row) => matchesQuery(row, state.q));
    rows = sortRows(rows, state.sortKey, state.sortDir);
    return rows.length ? [{ type: "group", ...group }, ...rows.map((row) => ({ type: "row", ...row }))] : [];
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

function renderTableBody(tbodyEl, entries) {
  tbodyEl.innerHTML = "";

  entries.forEach((entry) => {
    if (entry.type === "group") {
      const tr = document.createElement("tr");
      tr.className = `group-row ${entry.className}`;
      const td = document.createElement("td");
      td.colSpan = 6;
      td.textContent = entry.label;
      tr.appendChild(td);
      tbodyEl.appendChild(tr);
      return;
    }

    const tr = document.createElement("tr");
    tr.appendChild(tdModel(entry));
    METRIC_KEYS.forEach((key) => {
      tr.appendChild(tdMetric(entry, key));
    });
    tbodyEl.appendChild(tr);
  });
}

function tdModel(row) {
  const el = document.createElement("td");
  el.className = "col-model";
  const wrap = document.createElement("div");
  wrap.className = "model-cell";

  const logo = document.createElement("img");
  logo.className = "model-logo";
  logo.src = `./assets/${row.logo}`;
  logo.alt = "";
  logo.setAttribute("aria-hidden", "true");
  wrap.appendChild(logo);

  const name = document.createElement("span");
  name.className = "model-name";
  name.textContent = row.model;
  wrap.appendChild(name);

  if (row.note) {
    const note = document.createElement("sup");
    note.className = "model-note";
    note.textContent = row.note;
    name.appendChild(note);
  }

  el.appendChild(wrap);
  return el;
}

function tdMetric(row, key) {
  const el = document.createElement("td");
  el.className = "col-metric";
  const value = row[key];
  const heat = row.heat?.[key] ?? 0;
  el.classList.add(`heat-${heat}`);

  if (value == null) {
    el.classList.add("metric-na");
    el.textContent = "N/A";
    return el;
  }

  el.textContent = `${Number(value).toFixed(1)}`;
  if (Number(value) === BEST_BY_METRIC[key]) {
    el.classList.add("metric-best");
  }
  return el;
}

function sync() {
  const entries = computeView();
  const modelCount = entries.filter((entry) => entry.type === "row").length;
  renderTableBody(dom.tbody, entries);
  dom.resultCount.textContent = `${modelCount} model${modelCount === 1 ? "" : "s"}`;
  setSortedHeader(dom.table, state.sortKey, state.sortDir);
}

function reset() {
  state.q = "";
  state.opensourceOnly = false;
  state.sortKey = "avg";
  state.sortDir = "desc";

  dom.q.value = "";
  dom.opensource.checked = false;
  sync();
}

const dom = {};

function init() {
  dom.q = document.getElementById("q");
  dom.opensource = document.getElementById("opensource");
  dom.table = document.getElementById("leaderboardTable");
  dom.tbody = document.getElementById("leaderboardBody");
  dom.resultCount = document.getElementById("resultCount");
  dom.resetBtn = document.getElementById("resetBtn");

  dom.q.addEventListener("input", () => {
    state.q = dom.q.value;
    sync();
  });
  dom.opensource.addEventListener("change", () => {
    state.opensourceOnly = dom.opensource.checked;
    sync();
  });
  dom.resetBtn.addEventListener("click", reset);

  dom.table.querySelectorAll("thead th[data-key]").forEach((th) => {
    const key = th.getAttribute("data-key");
    if (!key) return;
    th.addEventListener("click", () => {
      if (state.sortKey === key) {
        state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
      } else {
        state.sortKey = key;
        state.sortDir = key === "model" ? "asc" : "desc";
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

