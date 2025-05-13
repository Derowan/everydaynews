const proxyUrl = 'https://everydaynews.onrender.com';  // URL del tuo proxy su Render
const newsContainer = document.getElementById('news-container');

// Quando clicchi su una voce del sottomenù
document.querySelectorAll('.submenu li').forEach(item => {
  item.addEventListener('click', () => {
    const category = item.dataset.category;
    const type = item.closest('.dropdown').id.includes('italy') ? 'italian' : 'international'; 
    fetchNews(category, type);  // Chiama la funzione per caricare le notizie
  });
});

// Gestione della visibilità del sottomenù e aria-expanded
document.querySelectorAll('.dropdown button').forEach(button => {
  button.addEventListener('click', () => {
    const submenu = button.nextElementSibling;
    const isExpanded = button.getAttribute('aria-expanded') === 'true';

    button.setAttribute('aria-expanded', !isExpanded);
    submenu.style.display = isExpanded ? 'none' : 'block';
  });
});

async function fetchNews(category, type) {
  if (type === 'italian') {
    fetchItalianNews(category);  // Usa GNews per le notizie italiane
  } else if (type === 'international') {
    let url = `${proxyUrl}/news?language=en&category=${category}`;  // Chiamata al proxy per notizie internazionali
    fetchNewsFromAPI(url);  // Usa NewsAPI per le notizie internazionali tramite il proxy
  }
}

// Funzione per caricare le notizie italiane con GNews
async function fetchItalianNews(category) {
  const gNewsAPIKey = 'c3674db69f99957229145b7656d1b845';  // Sostituisci con la tua chiave API GNews
  const gNewsUrl = `https://gnews.io/api/v4/top-headlines?lang=it&country=IT&category=${category}&token=${gNewsAPIKey}`;

  try {
    const response = await fetch(gNewsUrl);
    const data = await response.json();
    displayNews(data);  // Mostra le notizie
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
    displayNews(data);  // Mostra le notizie
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
