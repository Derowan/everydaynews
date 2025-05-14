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

// Funzione per caricare le notizie italiane con GNews
async function fetchItalianNews(category) {
  const gNewsAPIKey = 'c3674db69f99957229145b7656d1b845';
  const gNewsUrl = `https://gnews.io/api/v4/top-headlines?lang=it&country=it&topic=${category}&token=${gNewsAPIKey}&pageSize=30`; // Ottieni 30 notizie

  try {
    const response = await fetch(gNewsUrl);
    const data = await response.json();
    displayNews(data);
  } catch (error) {
    newsContainer.innerHTML = '<p>Errore durante il caricamento delle notizie italiane.</p>';
    console.error(error);
  }
}

// Funzione per le notizie internazionali via NewsAPI
async function fetchNewsFromAPI(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    displayNews(data);
  } catch (error) {
    newsContainer.innerHTML = '<p>Errore durante il caricamento delle notizie internazionali.</p>';
    console.error(error);
  }
}

// Funzione per mostrare le notizie
function displayNews(data) {
  newsContainer.innerHTML = '';

  if (data.articles && data.articles.length > 0) {
    data.articles.forEach(article => {
      const newsItem = document.createElement('div');
      newsItem.className = 'news-item';

      const publishedDate = new Date(article.publishedAt).toLocaleDateString('it-IT');
      const category = article.category || 'Generale'; // Categoria di default

      // Aggiungi categoria e fonte se esistono
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
