const proxyUrl = 'https://everydaynews.onrender.com';
const newsContainer = document.getElementById('news-container');

// Quando clicchi su una voce del sottomenù
document.querySelectorAll('.submenu li').forEach(item => {
  item.addEventListener('click', () => {
    const categoryRaw = item.dataset.category;
    const type = item.closest('.dropdown').id.includes('italy') ? 'italian' : 'international';
    const category = categoryRaw.replace('-it', ''); // rimuove il suffisso -it per GNews
    fetchNews(category, type);
  });
});

async function fetchNews(category, type) {
  if (type === 'italian') {
    fetchItalianNews(category);
  } else if (type === 'international') {
    let url = `${proxyUrl}/news?language=en&category=${category}`;
    fetchNewsFromAPI(url);
  }
}

// GNews API per le notizie italiane
async function fetchItalianNews(category) {
  const gNewsAPIKey = 'c3674db69f99957229145b7656d1b845';  // Inserisci la tua chiave
  const gNewsUrl = `https://gnews.io/api/v4/top-headlines?lang=it&country=it&category=${category}&token=${gNewsAPIKey}`;

  try {
    const response = await fetch(gNewsUrl);
    const data = await response.json();
    displayNews(data);
  } catch (error) {
    newsContainer.innerHTML = '<p>Errore durante il caricamento delle notizie italiane.</p>';
    console.error(error);
  }
}

// NewsAPI tramite proxy per notizie internazionali
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

// Gestione apertura/chiusura menu dropdown al passaggio del mouse
document.querySelectorAll('.dropdown').forEach(dropdown => {
  let timeout;

  dropdown.addEventListener('mouseenter', () => {
    clearTimeout(timeout);
    dropdown.querySelector('.submenu').style.display = 'block';
  });

  dropdown.addEventListener('mouseleave', () => {
    timeout = setTimeout(() => {
      dropdown.querySelector('.submenu').style.display = 'none';
    }, 500); // chiude dopo mezzo secondo
  });
});
