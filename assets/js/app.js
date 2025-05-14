const proxyUrl = 'https://everydaynews.onrender.com';
const newsContainer = document.getElementById('news-container');

// Categorie supportate da NewsAPI (internazionale)
const internationalCategories = ['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology'];

// Categorie supportate da GNews (italiane)
const italianCategories = ['general', 'business', 'entertainment', 'health', 'science', 'sports', 'technology', 'politics'];

// Eventi click sulle voci del sottomenu
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

// Funzione per caricare le notizie italiane con GNews (fino a 30 notizie)
async function fetchItalianNews(category) {
  const gNewsAPIKey = 'c3674db69f99957229145b7656d1b845';
  let allArticles = [];
  let page = 1;
  const pageSize = 30;
  let totalArticles = 0;

  while (totalArticles < 30) {
    const gNewsUrl = `https://gnews.io/api/v4/top-headlines?lang=it&country=it&topic=${category}&token=${gNewsAPIKey}&pageSize=${pageSize}&page=${page}`;

    try {
      const response = await fetch(gNewsUrl);
      const data = await response.json();

      if (data.articles && data.articles.length > 0) {
        allArticles = [...allArticles, ...data.articles];
        totalArticles = allArticles.length;
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

  // Raggruppa e ordina per fonte
  const groupedArticles = groupAndSortBySource(allArticles);

  // Visualizza le notizie
  displayNews(groupedArticles, 'italian');
}

// Funzione per le notizie internazionali via NewsAPI
async function fetchNewsFromAPI(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    displayNews(data, 'international');
  } catch (error) {
    newsContainer.innerHTML = '<p>Errore durante il caricamento delle notizie internazionali.</p>';
    console.error(error);
  }
}

// Funzione per raggruppare le notizie per fonte e ordinarle alfabeticamente
function groupAndSortBySource(articles) {
  const grouped = {};

  // Raggruppa le notizie per fonte
  articles.forEach(article => {
    const source = article.source ? article.source.name : 'Fonte sconosciuta';
    if (!grouped[source]) {
      grouped[source] = [];
    }
    grouped[source].push(article);
  });

  // Ordina i gruppi per fonte
  const sortedSources = Object.keys(grouped).sort();

  // Restituisci le notizie raggruppate e ordinate
  const sortedGroupedArticles = sortedSources.map(source => {
    return {
      source: source,
      articles: grouped[source]
    };
  });

  return sortedGroupedArticles;
}

// Funzione per mostrare le notizie raggruppate per fonte
function displayNews(groupedArticles, type) {
  newsContainer.innerHTML = '';

  if (groupedArticles && groupedArticles.length > 0) {
    groupedArticles.forEach(group => {
      const sourceHeader = document.createElement('div');
      sourceHeader.className = 'source-header';
      sourceHeader.innerHTML = `<h3>Fonte: ${group.source}</h3>`;
      newsContainer.appendChild(sourceHeader);

      group.articles.forEach(article => {
        const newsItem = document.createElement('div');
        newsItem.className = 'news-item';

        const publishedDate = new Date(article.publishedAt).toLocaleDateString('it-IT');
        const category = article.category || 'Generale'; // Categoria di default

        // Aggiungi categoria e fonte se esistono
        const source = article.source ? article.source.name : 'Fonte sconosciuta';

        // Se le notizie sono internazionali, non mostrare la categoria
        if (type === 'international') {
          newsItem.innerHTML = `
            <div class="news-date">${publishedDate}</div>
            <h2>${article.title}</h2>
            <p>${article.description || 'Nessuna descrizione disponibile.'}</p>
            <a href="${article.url}" target="_blank">Leggi di più</a>
            <div class="news-source">Fonte: ${source}</div>
          `;
        } else {
          // Mostra la categoria solo per le notizie italiane
          newsItem.innerHTML = `
            <div class="news-category">${category}</div>
            <div class="news-date">${publishedDate}</div>
            <h2>${article.title}</h2>
            <p>${article.description || 'Nessuna descrizione disponibile.'}</p>
            <a href="${article.url}" target="_blank">Leggi di più</a>
            <div class="news-source">Fonte: ${source}</div>
          `;
        }

        newsContainer.appendChild(newsItem);
      });
    });
  } else {
    newsContainer.innerHTML = '<p>Nessuna notizia trovata.</p>';
  }
}

// Gestione apertura/chiusura del menu a discesa
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
