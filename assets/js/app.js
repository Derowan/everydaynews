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
  let url = `${proxyUrl}/news?category=${category}`;

  if (type === 'italian') {
    url += `&country=it`; // 🔁 RIMOSSO language=it
  } else if (type === 'international') {
    url += `&language=en`; // ✅ Mantieni lingua inglese per le internazionali
  }

  try {
    const response = await fetch(url);
    const data = await response.json();

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
  } catch (error) {
    newsContainer.innerHTML = '<p>Errore durante il caricamento delle notizie.</p>';
    console.error(error);
  }
}

// Gestione menu a tendina con ritardo chiusura
document.querySelectorAll('.dropdown').forEach(dropdown => {
  let timeout;

  dropdown.addEventListener('mouseenter', () => {
    clearTimeout(timeout);
    dropdown.querySelector('.submenu').style.display = 'block';
  });

  dropdown.addEventListener('mouseleave', () => {
    timeout = setTimeout(() => {
      dropdown.querySelector('.submenu').style.display = 'none';
    }, 500); // resta visibile per 0.5 secondi dopo che il mouse esce
  });
});
