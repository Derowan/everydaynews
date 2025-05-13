const proxyUrl = 'https://everydaynews.onrender.com';
const newsContainer = document.getElementById('news-container');

// Quando clicchi su una voce del sottomenù
document.querySelectorAll('.submenu li').forEach(item => {
  item.addEventListener('click', () => {
    const category = item.dataset.category;
    const type = item.dataset.type;
    fetchNews(category, type);
  });
});

async function fetchNews(category, type) {
  if (type === 'italian') {
    fetchItalianNews(category);  // Usa GNews per le notizie italiane
  } else if (type === 'international') {
    let url = `${proxyUrl}/news?language=en&category=${category}`;
    fetchNewsFromAPI(url);  // Usa NewsAPI per le notizie internazionali
  }
}

// Funzione per caricare le notizie italiane con GNews
async function fetchItalianNews(category) {
  const gNewsAPIKey = 'c3674db69f99957229145b7656d1b845';  // Sostituisci con la tua chiave API GNews
  const gNewsUrl = `https://gnews.io/api/v4/top-headlines?lang=it&country=IT&category=${category}&token=${gNewsAPIKey}`;

  try {
    const response = await fetch(gNewsUrl);
    const data = await response.json();
    displayNews(data);
  } catch (error) {
    newsContainer.innerHTML = '<p>Errore durante il caricamento delle notizie italiane.</p>';
    console.error(error);
  }
}

// Funzione per caricare le notizie internazionali da NewsAPI tramite il proxy
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

// Funzione per visualizzare le notizie
function displayNews(data) {
  newsContainer.innerHTML = '';  // Pulisce il contenitore delle notizie

  if (data.articles && data.articles.length > 0) {
    data.articles.forEach(article => {
      const newsItem = document.createElement('div');
      newsItem.className = 'news-item';

      const publishedDate = new Date(article.publishedAt).toLocaleDateString('it-IT');

      newsItem.innerHTML = `
        <div class="news-date">${publishedDate}</div>
        <h2>${article.title}</h2>
        <p>${article.description || 'Nessuna descrizione disponibile.'}</p>
        <a href="${article.url}" target="_blank">Leggi di più</a>
      `;
      newsContainer.appendChild(newsItem);
    });
  } else {
    newsContainer.innerHTML = '<p>Nessuna notizia trovata.</p>';
  }
}

// Gestione menu a tendina con ritardo di chiusura
document.querySelectorAll('.dropdown').forEach(dropdown => {
  let timeout;

  dropdown.addEventListener('mouseenter', () => {
    clearTimeout(timeout);
    dropdown.querySelector('.submenu').style.display = 'block';
  });

  dropdown.addEventListener('mouseleave', () => {
    timeout = setTimeout(() => {
      dropdown.querySelector('.submenu').style.display = 'none';
    }, 500); // Resta visibile per 0.5 secondi dopo che il mouse esce
  });
});
