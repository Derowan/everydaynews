const proxyUrl = 'https://everydaynews.onrender.com';
const newsContainer = document.getElementById('news-container');
const sourceFilterContainer = document.getElementById('source-filter') || createSourceFilterContainer();
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

function createSourceFilterContainer() {
  const container = document.createElement('div');
  container.id = 'source-filter';
  container.style.margin = '10px 20px';
  container.style.fontWeight = 'bold';
  container.style.color = '#0f172a';
  container.style.display = 'none'; // Nascondi inizialmente
  container.style.alignItems = 'center';
  container.style.gap = '10px';
  container.innerHTML = `
    <label for="source-select">Filtra per fonte:</label>
    <select id="source-select" style="padding:5px 10px; border-radius:5px; border:1px solid #94a3b8; font-size:0.9em;">
      <option value="all">Tutte</option>
    </select>
  `;
  newsContainer.parentNode.insertBefore(container, newsContainer);
  // Aggiungo qui una sola volta l'event listener per il filtro fonti
  document.getElementById('source-select').addEventListener('change', () => filterBySource());
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
  const sources = [...new Set(articles.map(a => a.source?.name || 'Fonte sconosciuta'))];
  if (sources.length <= 1) {
    sourceFilterContainer.style.display = 'none';
    return;
  }
  sourceFilterContainer.style.display = 'flex';
  select.innerHTML = '<option value="all">Tutte</option>' + sources.map(s => `<option value="${s}">${s}</option>`).join('');
  // Non aggiungere qui l'event listener (già aggiunto una volta nella creazione)
  select.value = 'all'; // Reset filtro a "Tutte"
}

function filterBySource() {
  const selectedSource = document.getElementById('source-select').value;
  const filteredArticles = selectedSource === 'all'
    ? currentArticles
    : currentArticles.filter(a => (a.source?.name || 'Fonte sconosciuta') === selectedSource);
  currentPage = 1;
  renderPage(filteredArticles);
  updatePagination(filteredArticles);
}

const internationalCategories = ['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology'];
const italianCategories = ['general', 'business', 'entertainment', 'health', 'science', 'sports', 'technology', 'politics'];

// Nascondi la welcome image quando clicchi su un link del menu (escluso il logo)
document.querySelectorAll('.submenu li').forEach(item => {
  item.addEventListener('click', () => {
    const welcomeImage = document.getElementById('welcome-image');
    if (welcomeImage) welcomeImage.style.display = 'none';

    const category = item.dataset.category;
    const type = item.dataset.type;
    fetchNews(category, type);
  });
});

// Gestione apertura/chiusura menù a discesa con mouse
document.querySelectorAll('.dropdown').forEach(dropdown => {
  let timeout;

  dropdown.addEventListener('mouseenter', () => {
    clearTimeout(timeout);
    dropdown.querySelector('.submenu').style.display = 'block';
  });

  dropdown.addEventListener('mouseleave', () => {
    timeout = setTimeout(() => {
      dropdown.querySelector('.submenu').style.display = 'none';
    }, 500);
  });
});

// Click sul logo: reset contenuti e filtri
document.getElementById('logo-link').addEventListener('click', (e) => {
  e.preventDefault();
  newsContainer.innerHTML = '';
  paginationContainer.innerHTML = '';
  if (sourceFilterContainer) {
    const select = document.getElementById('source-select');
    if (select) select.value = 'all';
    sourceFilterContainer.style.display = 'none'; // Nascondi filtro
  }
  // Mostra di nuovo la welcome image quando clicchi sul logo
  const welcomeImage = document.getElementById('welcome-image');
  if (welcomeImage) {
    welcomeImage.style.display = 'block';
  }
});

async function fetchNews(category, type) {
  if (type === 'italian') {
    await fetchItalianNews(category);
  } else if (type === 'international') {
    const url = `${proxyUrl}/news?language=en&category=${category}`;
    await fetchNewsFromAPI(url);
  }
}

async function fetchItalianNews(category) {
  const gNewsAPIKey = 'c3674db69f99957229145b7656d1b845';
  let allArticles = [];
  let page = 1;
  const pageSize = 100;
  const maxPages = 10;

  while (page <= maxPages) {
    const gNewsUrl = `https://gnews.io/api/v4/top-headlines?lang=it&country=it&topic=${category}&token=${gNewsAPIKey}&pageSize=${pageSize}&page=${page}`;
    try {
      const response = await fetch(gNewsUrl);
      const data = await response.json();

      if (data.articles && data.articles.length > 0) {
        const articlesWithCategory = data.articles.map(article => ({
          ...article,
          category: category
        }));

        allArticles = [...allArticles, ...articlesWithCategory];
        page++;
      } else {
        break;
      }
    } catch (error) {
      newsContainer.innerHTML = '<p>Errore durante il caricamento delle notizie italiane.</p>';
      console.error(error);
      break;
    }
  }

  currentArticles = allArticles;
  updateSourceFilter(currentArticles);
  currentPage = 1;
  renderPage(currentArticles);
  updatePagination(currentArticles);
}

async function fetchNewsFromAPI(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    currentArticles = data.articles || [];
    currentArticles = currentArticles.map(a => ({ ...a, category: a.category || 'general' }));
    updateSourceFilter(currentArticles);
    currentPage = 1;
    renderPage(currentArticles);
    updatePagination(currentArticles);
  } catch (error) {
    newsContainer.innerHTML = '<p>Errore durante il caricamento delle notizie internazionali.</p>';
    console.error(error);
  }
}

function renderPage(articles) {
  newsContainer.innerHTML = '';
  const start = (currentPage - 1) * articlesPerPage;
  const end = start + articlesPerPage;
  const paginatedArticles = articles.slice(start, end);

  if (paginatedArticles.length === 0) {
    newsContainer.innerHTML = '<p>Nessuna notizia trovata.</p>';
    return;
  }

  paginatedArticles.forEach(article => {
    const newsItem = document.createElement('div');
    newsItem.className = 'news-item';

    const publishedDate = article.publishedAt
      ? new Date(article.publishedAt).toLocaleDateString('it-IT')
      : '';
    const rawCategory = article.category || 'general';
    const category = italianCategoryLabels[rawCategory] || 'Generale';
    const source = article.source ? article.source.name : 'Fonte sconosciuta';

    const imageUrl = article.urlToImage || article.image || '';

    newsItem.innerHTML = `
      ${imageUrl ? `<img src="${imageUrl}" alt="Immagine articolo" class="news-image">` : ''}
      <div class="news-category">${category}</div>
      <div class="news-date">${publishedDate}</div>
      <h2 title="${article.title}">${article.title}</h2>
      <p>${article.description || 'Nessuna descrizione disponibile.'}</p>
      <a href="${article.url}" target="_blank" rel="noopener noreferrer">Leggi di più</a>
      <div class="news-source">Fonte: ${source}</div>
    `;

    newsContainer.appendChild(newsItem);
  });
}

function updatePagination(articles) {
  paginationContainer.innerHTML = '';
  const totalPages = Math.ceil(articles.length / articlesPerPage);

  if (totalPages <= 1) return;

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.className = i === currentPage ? 'active' : '';
    btn.style.margin = '0






ChatGPT ha detto:
3px';
btn.style.padding = '5px 10px';
btn.style.cursor = 'pointer';
btn.addEventListener('click', () => {
currentPage = i;
renderPage(articles);
updatePagination(articles);
window.scrollTo({ top: 0, behavior: 'smooth' });
});
paginationContainer.appendChild(btn);
}
}

// Click sul logo: reset contenuti e filtri
document.getElementById('logo-link').addEventListener('click', (e) => {
e.preventDefault();
newsContainer.innerHTML = '';
paginationContainer.innerHTML = '';
if (sourceFilterContainer) {
const select = document.getElementById('source-select');
if (select) select.value = 'all';
sourceFilterContainer.style.display = 'none';
}
});
