const proxyUrl = 'https://everydaynews.onrender.com';
const newsContainer = document.getElementById('news-container');
// Rimosso sourceFilterContainer e filtro fonti
const paginationContainer = document.getElementById('pagination') || createPaginationContainer();
let currentArticles = [];
let currentPage = 1;
const articlesPerPage = 30;

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

function createPaginationContainer() {
  const container = document.createElement('div');
  container.id = 'pagination';
  container.style.margin = '10px 20px';
  container.style.textAlign = 'center';
  container.style.gap = '5px';
  newsContainer.parentNode.appendChild(container);
  return container;
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
  // Rimosso reset filtro fonti
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
  renderPage(currentArticles);
  updatePagination(currentArticles);
}

async function fetchNewsFromAPI(url) {
  try {
    const data = await (await fetch(url)).json();
    const all = (data.articles || []).map(a => ({ ...a, category: a.category || 'general', source: { name: a.source?.name || 'Fonte sconosciuta' } }));
    currentArticles = Array.from(new Map(all.map(a => [a.url, a])).values());
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
