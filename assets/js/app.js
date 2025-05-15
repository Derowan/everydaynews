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
  container.innerHTML = '<label for="source-select">Filtra per fonte:</label> <select id="source-select"><option value="all">Tutte</option></select>';
  newsContainer.parentNode.insertBefore(container, newsContainer);
  document.getElementById('source-select').addEventListener('change', () => filterBySource());
  return container;
}

function createPaginationContainer() {
  const container = document.createElement('div');
  container.id = 'pagination';
  newsContainer.parentNode.appendChild(container);
  return container;
}

function updateSourceFilter(articles) {
  const select = document.getElementById('source-select');
  const sources = [...new Set(articles.map(a => a.source?.name || 'Fonte sconosciuta'))];
  select.innerHTML = '<option value="all">Tutte</option>' + sources.map(s => `<option value="${s}">${s}</option>`).join('');
  select.value = 'all'; // Reset filtro a "Tutte"
}

function filterBySource() {
  const selectedSource = document.getElementById('source-select').value;
  const filteredArticles = selectedSource === 'all' ? currentArticles : currentArticles.filter(a => (a.source?.name || 'Fonte sconosciuta') === selectedSource);
  currentPage = 1;
  renderPage(filteredArticles);
  updatePagination(filteredArticles);
}

const internationalCategories = ['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology'];
const italianCategories = ['general', 'business', 'entertainment', 'health', 'science', 'sports', 'technology', 'politics'];

document.querySelectorAll('.submenu li').forEach(item => {
  item.addEventListener('click', () => {
    const category = item.dataset.category;
    const type = item.dataset.type;
    fetchNews(category, type);
  });
});

async function fetchNews(category, type) {
  if (type === 'italian') {
    fetchItalianNews(category);
  } else if (type === 'international') {
    const url = `${proxyUrl}/news?language=en&category=${category}`;
    fetchNewsFromAPI(url);
  }
}

async function fetchItalianNews(category) {
  const gNewsAPIKey = 'c3674db69f99957229145b7656d1b845';
  let allArticles = [];
  let page = 1;
  const pageSize = 100;
  let maxPages = 10;

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

    const publishedDate = new Date(article.publishedAt).toLocaleDateString('it-IT');
    const rawCategory = article.category || 'general';
    const category = italianCategoryLabels[rawCategory] || 'Generale';
    const source = article.source ? article.source.name : 'Fonte sconosciuta';

    newsItem.innerHTML = `
      <div class="news-category">${category}</div>
      <div class="news-date">${publishedDate}</div>
      <h2>${article.title}</h2>
      <p>${article.description || 'Nessuna descrizione disponibile.'}</p>
      <a href="${article.url}" target="_blank">Leggi di più</a>
      <div class="news-source">Fonte: ${source}</div>
    `;

    newsContainer.appendChild(newsItem);
  });
}

function updatePagination(articles) {
  paginationContainer.innerHTML = '';
  const totalPages = Math.ceil(articles.length / articlesPerPage);

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.className = i === currentPage ? 'active' : '';
    btn.addEventListener('click', () => {
      currentPage = i;
      renderPage(articles);
    });
    paginationContainer.appendChild(btn);
  }
}

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
document.getElementById('logo-link').addEventListener('click', (e) => {
  e.preventDefault();
  newsContainer.innerHTML = '';
  if (paginationContainer) paginationContainer.innerHTML = '';
  if (sourceFilterContainer) {
    const select = document.getElementById('source-select');
    if (select) select.value = 'all';
  }
});
