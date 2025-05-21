const proxyUrl = 'https://everydaynews.onrender.com';
const newsContainer = document.getElementById('news-container');
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

// --- NUOVO: Creo e inserisco il filtro fonti dinamico sotto il logo ---
const logoLink = document.getElementById('logo-link');
const sourceFilterContainer = document.createElement('div');
sourceFilterContainer.id = 'source-filter-container';

// Modifica: display flex e stile per allineare label e select affiancati
sourceFilterContainer.style.display = 'none';
sourceFilterContainer.style.alignItems = 'center';
sourceFilterContainer.style.gap = '8px';
sourceFilterContainer.style.margin = '10px 20px';
sourceFilterContainer.style.fontSize = '0.9em';
sourceFilterContainer.style.fontWeight = 'bold';
sourceFilterContainer.style.color = '#0f172a';

sourceFilterContainer.innerHTML = `
   <label for="source-select" style="color: white;">Fonti:</label>
  <select id="source-select" style="padding: 5px 10px; border-radius: 5px; border: 1px solid #94a3b8; font-size: 0.9em; min-width: 150px; ">
    <option value="all">Tutte</option>
  </select>
`;

// Inserisco subito sotto il logo (logoLink è <a>, quindi inserisco dopo il suo genitore)
logoLink.parentNode.insertAdjacentElement('afterend', sourceFilterContainer);

const sourceSelect = document.getElementById('source-select');

const internationalCategories = ['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology'];
const italianCategories = ['general', 'business', 'entertainment', 'health', 'science', 'sports', 'technology', 'politics'];

// Funzione per ottenere fonti uniche dagli articoli correnti
function getUniqueSources(articles) {
  const sourcesSet = new Set();
  articles.forEach(article => {
    if (article.source && article.source.name) {
      sourcesSet.add(article.source.name);
    }
  });
  return Array.from(sourcesSet).sort();
}

// Popolo il filtro fonti in base agli articoli caricati
function populateSourceFilter(articles) {
  const sources = getUniqueSources(articles);
  sourceSelect.innerHTML = '<option value="all">Tutte</option>';
  sources.forEach(src => {
    const option = document.createElement('option');
    option.value = src;
    option.textContent = src;
    sourceSelect.appendChild(option);
  });
}

// Mostro o nascondo filtro fonti
function toggleSourceFilter(show) {
  sourceFilterContainer.style.display = show ? 'flex' : 'none';
}

// Evento cambio filtro: filtro articoli per fonte selezionata
sourceSelect.addEventListener('change', () => {
  const selectedSource = sourceSelect.value;
  if (selectedSource === 'all') {
    renderPage(currentArticles);
  } else {
    const filtered = currentArticles.filter(a => a.source?.name === selectedSource);
    renderPage(filtered);
  }
});

// Gestione click sulle voci di sottomenu (categorie)
document.querySelectorAll('.submenu li').forEach(item => {
  item.addEventListener('click', () => {
    const welcomeImage = document.getElementById('welcome-image');
    if (welcomeImage) welcomeImage.style.display = 'none';
    currentPage = 1;
    fetchNews(item.dataset.category, item.dataset.type);
    toggleSourceFilter(true); // mostro filtro quando apro voce menù
  });
});

// Dropdown menu show/hide
document.querySelectorAll('.dropdown').forEach(dropdown => {
  let timeout;
  dropdown.addEventListener('mouseenter', () => {
    clearTimeout(timeout);
    dropdown.querySelector('.submenu').style.display = 'block';
  });
  dropdown.addEventListener('mouseleave', () => {
    timeout = setTimeout(() => dropdown.querySelector('.submenu').style.display = 'none', 500);
  });
});

// Click sul logo: reset pagina, nascondo filtro
logoLink.addEventListener('click', e => {
  e.preventDefault();
  newsContainer.innerHTML = '';
  paginationContainer.innerHTML = '';
  toggleSourceFilter(false);
  const welcomeImage = document.getElementById('welcome-image');
  if (welcomeImage) welcomeImage.style.display = 'block';
});

// --- METEO ---
document.getElementById('meteo-link').addEventListener('click', e => {
  e.preventDefault();
  toggleSourceFilter(false);
  paginationContainer.innerHTML = '';
  newsContainer.innerHTML = `
    <div id="weather-form">
      <h2>Inserisci località</h2>
      <input id="city-input" type="text" placeholder="Es. Roma" autocomplete="off">
      <div id="suggestions"></div>
      <br>
      <button id="get-weather">Conferma</button>
      <div id="weather-result">
        <div id="weather-columns"></div>
      </div>
    </div>
  `;

  const cityInput = document.getElementById('city-input');
  const suggestions = document.getElementById('suggestions');

  // Funzione per ottenere suggerimenti da Nominatim
  cityInput.addEventListener('input', async () => {
    const query = cityInput.value.trim();
    if (query.length < 3) {
      suggestions.style.display = 'none';
      suggestions.innerHTML = '';
      return;
    }
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5&accept-language=it`);
      const data = await res.json();
      if (data.length === 0) {
        suggestions.style.display = 'none';
        suggestions.innerHTML = '';
        return;
      }
      suggestions.innerHTML = data.map(place => `
        <div class="suggestion-item" data-lat="${place.lat}" data-lon="${place.lon}">
          ${place.display_name}
        </div>
      `).join('');
      suggestions.style.display = 'block';

      // Click su suggerimento per riempire input e nascondere dropdown
      document.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', () => {
          cityInput.value = item.textContent;
          cityInput.dataset.lat = item.dataset.lat;
          cityInput.dataset.lon = item.dataset.lon;
          suggestions.style.display = 'none';
          suggestions.innerHTML = '';
        });
      });
    } catch {
      suggestions.style.display = 'none';
      suggestions.innerHTML = '';
    }
  });

  document.getElementById('get-weather').addEventListener('click', async () => {
    let query = cityInput.value.trim();
    if (!query) return;

    if (cityInput.dataset.lat && cityInput.dataset.lon) {
      query = `${cityInput.dataset.lat},${cityInput.dataset.lon}`;
    }

    const apiKey = '176a0ac4a4c14357908172120251705';
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(query)}&days=3&lang=it`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      const container = document.getElementById('weather-columns');
      if (data.error) {
        container.innerHTML = `<p class="error-message">${data.error.message}</p>`;
        return;
      }

      // Qui la modifica: mappiamo i giorni normalmente ma in container #weather-columns che è flex a righe
      container.innerHTML = data.forecast.forecastday.map(day => `
        <div class="weather-day">
          <h3>${day.date}</h3>
          <div>
            ${day.hour.map(h => `
              <div class="weather-hour">
                <span>${h.time.split(' ')[1]}</span>
                <span>${h.temp_c}°C</span>
                <img src="https:${h.condition.icon}" alt="${h.condition.text}">
                <span>${h.condition.text}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('');
    } catch {
      document.getElementById('weather-columns').innerHTML = '<p class="error-message">Errore nel recupero del meteo.</p>';
    }
  });
});


// fine BLOCCO METEO

async function fetchNews(category, type) {
  if (type === 'italian') {
    await fetchItalianNews(category);
  } else {
    await fetchNewsFromAPI(`${proxyUrl}/news?language=en&category=${category}`);
  }
}

async function fetchItalianNews(category) {
  const key = 'c3674db69f99957229145b7656d1b845';

  // Lista fonti italiane accettate da GNews API (senza spazi e minuscolo, verificare con /sources)
  const italianSources = [
    'ilsole24ore',
    'la-repubblica',
    'corriere-della-sera',
    'il-fatto-quotidiano',
    'la-stampa',
    'tgcom24',
    'rai-news',
    'ansa',
    'agi',
    'adnkronos',
    'wired',
    'reuters',
    'bloomberg',
    'milano-finanza',
    'wall-street-italia',
    'focus',
    'le-scienze',
    'national-geographic',
    'gazzetta-dello-sport',
    'corriere-dello-sport',
    'tuttosport',
    'rai-sport',
    'sky-sport',
    'engadget',
    'toms-hardware',
    'digital4',
    'tech-princess'
  ];

  // Converto array in stringa separata da virgole per query
  const sourcesQuery = italianSources.join(',');

  let all = [];
  let all = [];
const maxArticles = 300;
let page = 1;

while (all.length < maxArticles) {

    const queryPolitica = 'governo OR parlamento OR elezioni OR partito OR ministri OR ministro';

    // Costruisco URL con filtro sorgenti
    const url = category === 'politics'
      ? `https://gnews.io/api/v4/search?q=${encodeURIComponent(queryPolitica)}&lang=it&country=it&sources=${sourcesQuery}&token=${key}&pageSize=100&page=${page}`
      : `https://gnews.io/api/v4/top-headlines?lang=it&country=it&topic=${category}&sources=${sourcesQuery}&token=${key}&pageSize=100&page=${page}`;

    try {
      const data = await (await fetch(url)).json();
      if (!data.articles.length) break;
      page++;
      const mapped = data.articles.map(a => ({
        ...a,
        category,
        source: { name: a.source?.name || 'Fonte sconosciuta' },
        image: a.image || ''
      }));
      all = all.concat(mapped);
    } catch {
      break;
    }
  }
  currentArticles = Array.from(new Map(all.map(a => [a.url, a])).values());
  currentPage = 1;
  populateSourceFilter(currentArticles);
  renderPage(currentArticles);
  updatePagination(currentArticles);
}


async function fetchNewsFromAPI(url) {
  try {
    const data = await (await fetch(url)).json();
    const all = (data.articles || []).map(a => ({
      ...a,
      category: a.category || 'general',
      source: { name: a.source?.name || 'Fonte sconosciuta' }
    }));
    currentArticles = Array.from(new Map(all.map(a => [a.url, a])).values());
    currentPage = 1;
    populateSourceFilter(currentArticles);
    renderPage(currentArticles);
    updatePagination(currentArticles);
  } catch (err) {
    console.error(err);
    newsContainer.innerHTML = '<p>Errore caricamento notizie.</p>';
  }
}

function renderPage(list) {
  newsContainer.innerHTML = '';
  const start = (currentPage - 1) * articlesPerPage;
  const end = start + articlesPerPage;
  const pageArticles = list.slice(start, end);
  if (!pageArticles.length) {
    newsContainer.innerHTML = '<p>Nessuna notizia trovata.</p>';
    return;
  }
  pageArticles.forEach(a => {
    const item = document.createElement('div');
    item.className = 'news-item';
    const date = a.publishedAt ? new Date(a.publishedAt).toLocaleDateString('it-IT') : '';
    // qui uso a.image per italiane, a.urlToImage per internazionali
    const imgSrc = a.image || a.urlToImage || '';
    item.innerHTML = `
      ${imgSrc ? `<img src="${imgSrc}" class="news-image">` : ''}
      <div class="news-category">${italianCategoryLabels[a.category] || 'Generale'}</div>
      <div class="news-date">${date}</div>
      <h2 title="${a.title}">${a.title}</h2>
      <p>${a.description || ''}</p>
      <a href="${a.url}" target="_blank" rel="noopener noreferrer">Leggi di più</a>
      <div class="news-source">Fonte: ${a.source.name}</div>
    `;
    newsContainer.appendChild(item);
  });
}

function updatePagination(list) {
  paginationContainer.innerHTML = '';
  const pages = Math.ceil(list.length / articlesPerPage);
  if (pages < 2) return;
  for (let i = 1; i <= pages; i++) {
    const b = document.createElement('button');
    b.textContent = i;
    b.className = i === currentPage ? 'active' : '';
    b.addEventListener('click', () => {
      currentPage = i;
      renderPage(list);
      updatePagination(list);
    });
    paginationContainer.appendChild(b);
  }
}
