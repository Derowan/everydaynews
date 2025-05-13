const proxyUrl = 'https://everydaynews.onrender.com';
const newsContainer = document.getElementById('news-container');
const categorySelect = document.getElementById('category');

async function fetchNews() {
    const category = categorySelect.value;
    const url = `${proxyUrl}/news?category=${category}`;
    try {
        const response = await fetch(url);
        const data = await response.json();

        // Pulisce il contenitore
        newsContainer.innerHTML = '';

        // Itera sugli articoli
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
