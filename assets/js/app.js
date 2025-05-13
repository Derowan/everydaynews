const proxyUrl = 'https://everydaynews.onrender.com';
const newsContainer = document.getElementById('news-container');

// Assegna evento clic a ogni voce del sottomenù
document.querySelectorAll('.submenu li').forEach(item => {
  item.addEventListener('click', () => {
    const category = item.dataset.category;
    const type = item.closest('.dropdown').id === 'italy-dropdown' ? 'italian' : 'international';
    fetchNews(category, type);
  });
});

// Carica le notizie in base al tipo
async function fetchNews(category, type) {
  if (type === 'italian') {
    fetchItalianNews(category);
  } else if (type === 'international') {
    const url = `${proxyUrl}/news?language=en&category=${category}`;
    fetchNewsFromAPI(url);
  }
}

// Carica le notizie italiane da GNews
async function fetchItalianNews(category) {
  const gNewsAPIKey = 'c3674db69f99957229145b7656d1b845'; // Inserisci la tua chiave GNews
  const cleanCategory = category.replace('-it', '');
  const gNewsUrl = `https://gnews.io/api/v4/top-headlines?lang=it&country=it&category=${cleanCategory}&token=${gNewsAPIKey}`;

  try {
    const response = await fetch(gNewsUrl);
    const data = await response.json();
    displayNews(data);
  } catch (error) {
    newsContainer.innerHTML = '<p>Errore durante il caricamento delle notizie italiane.</p>';
    console.error(error);
  }
}

// Carica le notizie internazionali tramite il proxy
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

// Mostra le notizie
function displayNews(data) {
  newsContainer.innerHTML = '';

  if (data.articles && data.articles.length > 0) {
    data.articles.forEach(article => {
      const newsItem = document.createElement('div');
      newsItem.className = 'news-item';

      const publishedDate = article.publishedAt
        ? new Date(article.publishedAt).toLocaleDateString('it-IT')
        : 'Data sconosciuta';

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

// Gestione menu a tendina (hover: apre, mouse leave: chiude)
document.querySelectorAll('.dropdown').forEach(dropdown => {
  let timeout;

  dropdown.addEventListener('mouseenter', () => {
    clearTimeout(timeout);
    dropdown.querySelector('.submenu').style.display = 'block';
  });

  dropdown.addEventListener('mouseleave', () => {
    timeout = setTimeout(() => {
      dropdown.querySelector('.submenu').style.display = 'none';
    }, 500); // si chiude dopo 0.5 secondi dall'uscita del mouse
  });
});
