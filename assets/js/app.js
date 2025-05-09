document.addEventListener('DOMContentLoaded', function() {
  const apiKey = 'YOUR_API_KEY'; // Sostituisci con la tua API Key da NewsAPI
  const apiUrl = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}`;

  // Funzione per recuperare le notizie
  function getNews() {
    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        const newsContainer = document.getElementById('news-container');
        newsContainer.innerHTML = ''; // Pulisce la sezione notizie
        data.articles.forEach(article => {
          // Crea un elemento per ogni notizia
          const newsItem = document.createElement('div');
          newsItem.classList.add('news-item');

          const newsTitle = document.createElement('h2');
          newsTitle.textContent = article.title;

          const newsDescription = document.createElement('p');
          newsDescription.textContent = article.description || 'Nessuna descrizione disponibile.';

          const newsLink = document.createElement('a');
          newsLink.href = article.url;
          newsLink.target = '_blank';
          newsLink.textContent = 'Leggi di più';

          // Aggiungi il contenuto al contenitore
          newsItem.appendChild(newsTitle);
          newsItem.appendChild(newsDescription);
          newsItem.appendChild(newsLink);

          // Aggiungi l'elemento al contenitore delle notizie
          newsContainer.appendChild(newsItem);
        });
      })
      .catch(error => {
        console.error('Errore durante il recupero delle notizie:', error);
      });
  }

  // Chiama la funzione per ottenere le notizie quando la pagina è caricata
  getNews();
});
