// === CONFIGURAZIONI INIZIALI ===
const proxyUrl = 'https://everydaynews.onrender.com';
const newsContainer = document.getElementById('news-container');
const paginationContainer = document.getElementById('pagination') || createPaginationContainer();
let currentArticles = [];
let currentPage = 1;
const articlesPerPage = 30;
let currentSource = null;

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

// === MENU CATEGORIE ===
document.querySelectorAll('.submenu li').forEach(item => {
  item.addEventListener('click', () => {
    const category = item.dataset.category;
    const type = item.dataset.type;
    fetchNews(category, type);
  });
});

// === CREAZIONE CONTENITORI ===
function createPaginationContainer() {
  const container = document.createElement('div');
  container.id = 'pagination';
  newsContainer.parentNode.appendChild(container);
  return container;
}

// === GESTIONE MENU FONTI ===
function populateSourceMenu(sources) {
  const sourceMenu = document.getElementById('source-menu');
  sourceMenu.innerHTML = '<li data-source="all">Tutte</li>'; // Reset

  sources.forEach(source => {
    const li = document.createElement('li');
    li.textContent = source;
    li.setAttribute('data-source', source);
    sourceMenu.appendChild(li);
  });
}

document.getElementById('source-menu').addEventListener('click', (e) => {
  if (e.target.tagName === 'LI') {
    const source = e.target.getAttribute('data-source');
    currentSource = source === 'all' ? null : source;
    currentPage = 1;
    renderPage(filterArticles(currentArticles));
    updatePagination(filterArticles(currentArticles));
  }
});

function filterArticles(articles) {
  if (!currentSource || currentSource === 'all') return articles;
  return articles.filter(a => (a.source?.name || 'Fonte sconosciuta') === currentSource);
}

// === FETCH NOTIZIE ===
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
  populateSourceMenu([...new Set(allArticles.map(a => a.source?.name || 'Fonte sconosciuta'))]);
  currentPage = 1;
  renderPage(filterArticles(currentArticles));
  updatePagination(filterArticles(currentArticles));
}

async function fetchNewsFromAPI(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    currentArticles = data.articles || [];
    populateSourceMenu([...new Set(currentArticles.map(a => a.source?.name || 'Fonte sconosciuta'))]);
    currentPage = 1;
    renderPage(filterArticles(currentArticles));
    updatePagination(filterArticles(currentArticles));
  } catch (error) {
    newsContainer.innerHTML = '<p>Errore durante il caricamento delle notizie internazionali.</p>';
    console.error(error);
  }
}

// === RENDER PAGINE ===
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
      renderPage(filterArticles(currentArticles));
    });
    paginationContainer.appendChild(btn);
  }
}

// === GESTIONE MENU HOVER ===
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
