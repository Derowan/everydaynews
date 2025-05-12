const proxyUrl = 'https://everydaynews.onrender.com';
const newsContainer = document.getElementById('news-container');
const categorySelect = document.getElementById('category');

async function fetchNews() {
    const category = categorySelect.value;
    const url = `${proxyUrl}/news?category=${category}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.articles && data.articles.length > 0) {
            displayNews(data.articles);
        } else if (data.error) {
            newsContainer.innerHTML = `<p>Errore API: ${data.error}</p>`;
        } else {
            newsContainer.innerHTML = '<p>Nessuna notizia trovata per questa categoria.</p>';
        }
    } catch {
        newsContainer.innerHTML = '<p>Errore durante il caricamento delle notizie. Riprova più tardi.</p>';
    }
}

function displayNews(articles) {
    newsContainer.innerHTML = '';
    articles.forEach(article => {
        const preview = article.description
            ? article.description.substring(0, 150) + '...'
            : 'Anteprima non disponibile';
        const newsCard = document.createElement('div');
        newsCard.classList.add('news-item');
        newsCard.innerHTML = `
            <h2><a href="${article.url}" target="_blank" rel="noopener">${article.title}</a></h2>
            <p>${preview}</p>
        `;
        newsContainer.appendChild(newsCard);
    });
}

window.addEventListener('DOMContentLoaded', fetchNews);
categorySelect.addEventListener('change', fetchNews);
