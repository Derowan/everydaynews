const proxyUrl = 'https://everydaynews.onrender.com';
const newsContainer = document.getElementById('news-container');
const categorySelect = document.getElementById('category');

async function fetchNews() {
    const category = categorySelect.value;
    let url = `${proxyUrl}/news?category=${category}`;

    // Se la categoria riguarda le notizie italiane, aggiungi il parametro 'country=it'
    if (category.startsWith('it-')) {
        const itCategory = category.split('-')[1];  // Rimuove 'it-' per ottenere la categoria specifica
        url = `${proxyUrl}/news?category=${itCategory}&country=it`;
    } 
    // Se la categoria è generale, ottieni le notizie globali
    else if (category === 'general') {
        url = `${proxyUrl}/news?category=general`;
    }

    try {
        const response = await fetch(url);
        const data = await response.json();

        // Pulisce il contenitore delle notizie
        newsContainer.innerHTML = '';

        // Itera sugli articoli e li aggiunge al contenitore
        data.articles.forEach(article => {
            const newsItem = document.createElement('div');
            newsItem.className = 'news-item';

            const publishedDate = new Date(article.publishedAt).toLocaleDateString('it-IT', {
                year: 'numeric', month: 'long', day: 'numeric'
            });

            newsItem.innerHTML = `
                <div class="news-date">${publishedDate}</div>
                <h2>${article.title}</h2>
                <p>${article.description || 'Nessuna descrizione disponibile.'}</p>
                <a href="${article.url}" target="_blank">Leggi di più</a>
            `;

            newsContainer.appendChild(newsItem);
        });

    } catch (error) {
        newsContainer.innerHTML = '<p>Errore durante il caricamento delle notizie.</p>';
        console.error('Errore fetch:', error);
    }
}

window.addEventListener('DOMContentLoaded', fetchNews);
categorySelect.addEventListener('change', fetchNews);
