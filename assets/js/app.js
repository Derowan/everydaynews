const proxyUrl = 'https://everydaynews.onrender.com';
const newsContainer = document.getElementById('news-container');
const sourceFilterContainer = document.getElementById('source-filter') || createSourceFilterContainer();
const paginationContainer = document.getElementById('pagination') || createPaginationContainer();
let currentArticles = [];
let currentPage = 1;
const articlesPerPage = 30;
// Keep filteredArticles state inside filterBySource, no global

const italianCategoryLabels = {
  general: 'Generale',
  business: 'Economia',
  entertainment: 'Intrattenimento',
  health: 'Salute',
  science: 'Scienza',
  sports: 'Sport',
  technology: 'Tecnologia',
  politics: 'Politica'
};

function createSourceFilterContainer() {
  const container = document.createElement('div');
  container.id = 'source-filter';
  container.style.margin = '10px 20px';
  container.style.fontWeight = 'bold';
  container.style.color = '#0f172a';
  container.style.display = 'none';
  container.style.alignItems = 'center';
  container.style.gap = '10px';
  container.innerHTML = `
    <label for="source-select">Filtra per fonte:</label>
    <select id="source-select" style="padding:5px 10px; border-radius:5px; border:1px solid #94a3b8; font-size:0.9em;">
      <option value="all">Tutte</option>
    </select>
  `;
  newsContainer.parentNode.insertBefore(container, newsContainer);
  document.getElementById('source-select').addEventListener('change', filterBySource);
  return container;
}

function createPaginationContainer() {
  const container = document.createElement('div');
  container.id = 'pagination';
  container.style.margin = '10px 20px';
  container.style.textAlign = 'center';
  container.style.gap = '5px';
  newsContainer.parentNode.appendChild(container);
  return container;
}

function updateSourceFilter(articles) {
  const select = document.getElementById('source-select');
  const sources = [...new Set(articles.map(a => (a.source?.name || 'Fonte sconosciuta').trim()))];
  if (sources.length <= 1) {
    sourceFilterContainer.style.display = 'none';
    return;
  }
  sourceFilterContainer.style.display = 'flex';
  select.innerHTML = '<option value="all">Tutte</option>' + sources
    .map(s => `<option value="${encodeURIComponent(s)}">${s}</option>`)
    .join('');
  select.value = 'all';
}

function filterBySource() {
  const encoded = document.getElementById('source-select').value;
  const selected = decodeURIComponent(encoded);
  const list = selected === 'all' ? currentArticles : currentArticles.filter(a => (a.source?.name || 'Fonte sconosciuta').trim() === selected);
  currentPage = 1;
  renderPage(list);
  updatePagination(list);
}

const internationalCategories = ['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology'];
const italianCategories = ['general', 'business', 'entertainment', 'health', 'science', 'sports', 'technology', 'politics'];

document.querySelectorAll('.submenu li').forEach(item => {
  item.addEventListener('click', () => {
    const welcomeImage = document.getElementById('welcome-image');
    if (welcomeImage) welcomeImage.style.display = 'none';
    fetchNews(item.dataset.category, item.dataset.type);
  });
});

document.querySelectorAll('.dropdown').forEach(dropdown => {
  let timeout;
  dropdown.addEventListener('mouseenter', () => { clearTimeout(timeout); dropdown.querySelector('.submenu').style.display = 'block'; });
  dropdown.addEventListener('mouseleave', () => {
    timeout = setTimeout(() => dropdown.querySelector('.submenu').style.display = 'none', 500);
  });
});

document.getElementById('logo-link').addEventListener('click', e => {
  e.preventDefault();
  newsContainer.innerHTML = '';
  paginationContainer.innerHTML = '';
  document.getElementById('source-select').value = 'all';
  sourceFilterContainer.style.display = 'none';
  const welcomeImage = document.getElementById('welcome-image');
  if (welcomeImage) welcomeImage.style.display = 'block';
});

async function fetchNews(category, type) {
  if (type === 'italian') {
    await fetchItalianNews(category);
  } else {
    await fetchNewsFromAPI(`${proxyUrl}/news?language=en&category=${category}`);
  }
}

async function fetchItalianNews(category) {
  const key = 'c3674db69f99957229145b7656d1b845';
  let all = [];
  for (let page = 1; page <= 10; page++) {
    const url = `https://gnews.io/api/v4/top-headlines?lang=it&country=it&topic=${category}&token=${key}&pageSize=100&page=${page}`;
    try {
      const data = await (await fetch(url)).json();
      if (!data.articles.length) break;
      const mapped = data.articles.map(a => ({ ...a, category, source: { name: a.source?.name || 'Fonte sconosciuta' } }));
      all = all.concat(mapped);
    } catch { break; }
  }
  currentArticles = Array.from(new Map(all.map(a => [a.url, a])).values());
  updateSourceFilter(currentArticles);
  renderPage(currentArticles);
  updatePagination(currentArticles);
}

async function fetchNewsFromAPI(url) {
  try {
    const data = await (await fetch(url)).json();
    const all = (data.articles || []).map(a => ({ ...a, category: a.category || 'general', source: { name: a.source?.name || 'Fonte sconosciuta' } }));
    currentArticles = Array.from(new Map(all.map(a => [a.url, a])).values());
    updateSourceFilter(currentArticles);
    renderPage(currentArticles);
    updatePagination(currentArticles);
  } catch (err) { console.error(err); newsContainer.innerHTML = '<p>Errore caricamento notizie.</p>'; }
}

function renderPage(list) {
  newsContainer.innerHTML = '';
  const start = (currentPage-1)*articlesPerPage, end = start+articlesPerPage;
  const pageArticles = list.slice(start, end);
  if (!pageArticles.length) return newsContainer.innerHTML = '<p>Nessuna notizia trovata.</p>';
  pageArticles.forEach(a => {
    const item = document.createElement('div'); item.className='news-item';
    const date = a.publishedAt ? new Date(a.publishedAt).toLocaleDateString('it-IT') : '';
    item.innerHTML = `
      ${a.urlToImage ? `<img src="${a.urlToImage}" class="news-image">` : ''}
      <div class="news-category">${italianCategoryLabels[a.category]||'Generale'}</div>
      <div class="news-date">${date}</div>
      <h2 title="${a.title}">${a.title}</h2>
      <p>${a.description||''}</p>
      <a href="${a.url}" target="_blank">Leggi di più</a>
      <div class="news-source">Fonte: ${a.source.name}</div>
    `;
    newsContainer.appendChild(item);
  });
}

function updatePagination(list) {
  paginationContainer.innerHTML = '';
  const pages = Math.ceil(list.length/articlesPerPage);
  if (pages<2) return;
  for (let i=1;i<=pages;i++) {
    const b=document.createElement('button'); b.textContent=i;
    b.className = i===currentPage?'active':'';
    b.addEventListener('click',()=>{ currentPage=i; renderPage(list); updatePagination(list); });
    paginationContainer.appendChild(b);
  }
}
