const proxyUrl = 'https://everydaynews.onrender.com';  // Proxy per NewsAPI
const newsContainer = document.getElementById('news-container');

// Quando clicchi su una voce del sottomenù
document.querySelectorAll('.submenu li').forEach(item => {
  item.addEventListener('click', () => {
    const category = item.dataset.category;
    const type = item.dataset.type;
    fetchNews(category, type);
  });
});

// Funzione per le notizie internazionali (NewsAPI)
async function fetchNews(category, type) {
  let url = `${proxyUrl}/news`; // Usando il proxy per NewsAPI

  if (type === 'italian') {
    fetchItalianNews(category);  // Usa la nuova API per le notizie italiane
  } else if (type === 'international') {
    url += `?language=en&category=${category}&apiKey=YOUR_NEWSAPI_KEY`; // Inserisci la tua API Key di NewsAPI
    fetchNewsFromAPI(url);
  }
}

// Funzione per le notizie italiane con GNews API
async function fetchItalianNews(category) {
  const gNewsAPIKey = 'YOUR_GNEWS_API_KEY';  // Sostituisci con la tua chiave API GNews
  const gNewsUrl = `https://gnews.io/api/v4/top-headlines?lang=it&country=IT&category=${category}&token=${gNewsAPIKey}`;

  try {
    const response = await fetch(gNewsUrl);
    const data = await response.json();

    console.log('Risposta GNews:', data); // Log della risposta per il debug
    displayNews(data);
  } catch (error) {
    newsContainer.innerHTML = '<p>Errore durante il caricamento delle notizie italiane.</p>';
    console.error('Errore GNews:', error);
  }
}

// Funzione per caricare le notizie da qualsiasi API (utilizzando proxy per NewsAPI)
async function fetchNewsFromAPI(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();

    console.log('Risposta NewsAPI:', data); // Log della risposta per il debug
    displayNews(data);
  } catch (error) {
    newsContainer.innerHTML = '<p>Errore durante il caricamento delle notizie internazionali.</p>';
    console.error('Errore NewsAPI:', error);
  }
}

// Funzione per visualizzare le notizie
function displayNews(data) {
  newsContainer.innerHTML = '';  // Pulisce il contenitore delle notizie

  // Verifica se ci sono articoli nella risposta
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

// Gestione del menù a tendina con ritardo di chiusura
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
