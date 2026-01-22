/* eslint-disable no-use-before-define */
// This file intentionally uses mock data. Replace `MOCK_RESULTS` with real leaderboard data later.

const MOCK_RESULTS = [
  {
    model: "Model Alpha",
    org: "Org One",
    track: "Overall",
    modality: "Video+Text",
    setting: "Closed",
    score: 78.4,
    date: "2026-01-10",
    opensource: false,
    links: { paper: "#", code: "#" },
  },
  {
    model: "Model Beta",
    org: "Org Two",
    track: "Overall",
    modality: "Video+Text",
    setting: "Open",
    score: 76.9,
    date: "2026-01-08",
    opensource: true,
    links: { paper: "#", code: "#" },
  },
  {
    model: "Model Gamma",
    org: "Org Three",
    track: "Temporal",
    modality: "Video",
    setting: "Closed",
    score: 74.2,
    date: "2025-12-20",
    opensource: false,
    links: { paper: "#", code: "#" },
  },
  {
    model: "Model Delta",
    org: "Org Two",
    track: "Audio",
    modality: "Video+Audio+Text",
    setting: "Open",
    score: 73.1,
    date: "2025-12-18",
    opensource: true,
    links: { paper: "#", code: "#" },
  },
  {
    model: "Model Epsilon",
    org: "Org Four",
    track: "Reasoning",
    modality: "Video+Text",
    setting: "Closed",
    score: 71.6,
    date: "2025-12-05",
    opensource: false,
    links: { paper: "#", code: "#" },
  },
];

const state = {
  q: "",
  track: "all",
  modality: "all",
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
    `${row.model} ${row.org} ${row.track} ${row.modality} ${row.setting}`,
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
  out = out.filter((r) => matchesFilter(r.modality, state.modality));
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

function renderTableBody(tbodyEl, rows) {
  tbodyEl.innerHTML = "";
  rows.forEach((r, idx) => {
    const tr = document.createElement("tr");
    const rank = idx + 1;

    tr.appendChild(td(String(rank)));
    tr.appendChild(tdStrong(r.model));
    tr.appendChild(td(r.org));
    tr.appendChild(tdBadge(r.track));
    tr.appendChild(td(r.modality));
    tr.appendChild(td(r.setting));
    tr.appendChild(tdScore(r.score));
    tr.appendChild(td(r.date));
    tr.appendChild(tdLinks(r.links));

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
  el.textContent = Number(score).toFixed(1);
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

function tdLinks(links) {
  const el = document.createElement("td");
  const wrap = document.createElement("div");
  wrap.className = "links";

  const paper = document.createElement("a");
  paper.className = "link";
  paper.href = links.paper || "#";
  paper.target = "_blank";
  paper.rel = "noreferrer";
  paper.textContent = "paper";

  const code = document.createElement("a");
  code.className = "link";
  code.href = links.code || "#";
  code.target = "_blank";
  code.rel = "noreferrer";
  code.textContent = "code";

  wrap.appendChild(paper);
  wrap.appendChild(code);
  el.appendChild(wrap);
  return el;
}

function sync() {
  const rows = computeView(MOCK_RESULTS);
  renderTableBody(dom.tbody, rows);
  dom.resultCount.textContent = `${rows.length} result${rows.length === 1 ? "" : "s"}`;
  setSortedHeader(dom.table, state.sortKey, state.sortDir);
}

function reset() {
  state.q = "";
  state.track = "all";
  state.modality = "all";
  state.setting = "all";
  state.opensourceOnly = false;
  state.sortKey = "score";
  state.sortDir = "desc";

  dom.q.value = "";
  dom.track.value = "all";
  dom.modality.value = "all";
  dom.setting.value = "all";
  dom.opensource.checked = false;
  sync();
}

const dom = {};

function init() {
  dom.q = document.getElementById("q");
  dom.track = document.getElementById("track");
  dom.modality = document.getElementById("modality");
  dom.setting = document.getElementById("setting");
  dom.opensource = document.getElementById("opensource");
  dom.table = document.getElementById("leaderboardTable");
  dom.tbody = document.getElementById("leaderboardBody");
  dom.resultCount = document.getElementById("resultCount");
  dom.resetBtn = document.getElementById("resetBtn");

  const tracks = uniq(MOCK_RESULTS.map(byKey("track")));
  const modalities = uniq(MOCK_RESULTS.map(byKey("modality")));
  const settings = uniq(MOCK_RESULTS.map(byKey("setting")));

  fillSelect(dom.track, tracks);
  fillSelect(dom.modality, modalities);
  fillSelect(dom.setting, settings);

  dom.q.addEventListener("input", () => {
    state.q = dom.q.value;
    sync();
  });
  dom.track.addEventListener("change", () => {
    state.track = dom.track.value;
    sync();
  });
  dom.modality.addEventListener("change", () => {
    state.modality = dom.modality.value;
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

  // Initialize dataset viewer
  initDatasetViewer();
}

// Dataset Viewer functionality
let datasetData = [];
const datasetState = {
  searchQuery: "",
  currentPage: 1,
  itemsPerPage: 10,
  totalPages: 1,
};

function loadDataset() {
  return fetch('./assets/data.json')
    .then(response => response.json())
    .then(data => {
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
  const img = document.createElement('img');
  img.src = item.image;
  img.alt = 'Dataset sample image';
  img.loading = 'lazy';
  img.addEventListener('click', () => openModal(item.image));
  imageDiv.appendChild(img);

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

