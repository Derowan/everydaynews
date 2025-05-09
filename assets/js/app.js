// Impostazioni per l'API di notizie
const newsAPIKey = '9f5d0982b695411dbbe262f3878227ea'; // La tua API key
const newsAPIUrl = 'https://newsapi.org/v2/top-headlines?country=us&apiKey=' + newsAPIKey;
const newsContainer = document.getElementById('news-container');
const categorySelect = document.getElementById('category');

// Funzione per ottenere e visualizzare le notizie
async function fetchNews() {
    const category = categorySelect.value;
    const url = `${newsAPIUrl}&category=${category}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log(data); // Debug

        if (data.articles && data.articles.length > 0) {
            displayNews(data.articles);
        } else {
            newsContainer.innerHTML = '<p>Nessuna notizia trovata per questa categoria.</p>';
        }
    } catch (error) {
        console.error('Errore nel recupero delle notizie:', error);
        newsContainer.innerHTML = '<p>Errore durante il caricamento delle notizie. Riprova più tardi.</p>';
    }
}

// Funzione per visualizzare le notizie come card
function displayNews(articles) {
    newsContainer.innerHTML = ''; // Svuota il contenitore

    articles.forEach(article => {
        const preview = article.description ? article.description.substring(0, 150) + '...' : 'Anteprima non disponibile';

        const newsCard = document.createElement('div');
        newsCard.classList.add('news-item');

        newsCard.innerHTML = `
            <h2><a href="${article.url}" target="_blank">${article.title}</a></h2>
            <p>${preview}</p>
        `;

        newsContainer.appendChild(newsCard);
    });
}

// Carica le notizie quando la pagina viene caricata
window.onload = fetchNews;
