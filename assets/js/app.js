const proxyUrl = 'https://everydaynews.onrender.com';
const newsContainer = document.getElementById('news-container');
const categorySelect = document.getElementById('category');
const filtersDiv = document.getElementById('filters');
const internationalNewsBtn = document.getElementById('international-news-btn');
const italianNewsBtn = document.getElementById('italian-news-btn');

let currentNewsType = ''; // 'international' or 'italian'

// Funzione per popolare il menù a discesa
function populateCategoryMenu() {
    categorySelect.innerHTML = ''; // Pulisce le categorie esistenti

    let categories = [];
    if (currentNewsType === 'international') {
        // Categorie internazionali
        categories = [
            { value: 'general', label: 'Generale' },
            { value: 'business', label: 'Business' },
            { value: 'entertainment', label: 'Intrattenimento' },
            { value: 'health', label: 'Salute' },
            { value: 'science', label: 'Scienza' },
            { value: 'sports', label: 'Sport' },
            { value: 'technology', label: 'Tecnologia' }
        ];
    } else if (currentNewsType === 'italian') {
        // Categorie italiane
        categories = [
            { value: 'politics', label: 'Politica' },
            { value: 'business', label: 'Business' },
            { value: 'entertainment', label: 'Intrattenimento' },
            { value: 'health', label: 'Salute' },
            { value: 'science', label: 'Scienza' },
            { value: 'sports', label: 'Sport' },
            { value: 'technology', label: 'Tecnologia' }
        ];
    }

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.value;
        option.textContent = category.label;
        categorySelect.appendChild(option);
    });
}

// Funzione per caricare le notizie
async function fetchNews() {
    const category = categorySelect.value;
    let url = `${proxyUrl}/news?category=${category}`;

    // Aggiunge il filtro per le notizie italiane se la selezione riguarda l'Italia
    if (currentNewsType === 'italian') {
        // Per notizie italiane
        url = `${proxyUrl}/news?category=${category}&country=it&language=it`;
    } else if (currentNewsType === 'international') {
        // Per notizie internazionali
        url = `${proxyUrl}/news?category=${category}&language=en`;  // In inglese per le notizie internazionali
    }

    try {
        const response = await fetch(url);
        const data = await response.json();
        newsContainer.innerHTML = ''; // Pulisce le notizie precedenti

        // Verifica se ci sono articoli
        if (data.articles && data.articles.length > 0) {
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
        } else {
            newsContainer.innerHTML = '<p>Non ci sono articoli disponibili per questa categoria.</p>';
        }
    } catch (error) {
        newsContainer.innerHTML = '<p>Errore durante il caricamento delle notizie.</p>';
        console.error('Errore fetch:', error);
    }
}

// Eventi per la selezione delle notizie
internationalNewsBtn.addEventListener('click', () => {
    currentNewsType = 'international';
    filtersDiv.style.display = 'block';  // Mostra il filtro
    populateCategoryMenu();  // Popola il menù a discesa con le categorie internazionali
});

italianNewsBtn.addEventListener('click', () => {
    currentNewsType = 'italian';
    filtersDiv.style.display = 'block';  // Mostra il filtro
    populateCategoryMenu();  // Popola il menù a discesa con le categorie italiane
});

// Carica notizie iniziali
window.addEventListener('DOMContentLoaded', () => {
    filtersDiv.style.display = 'none';  // Nasconde inizialmente il filtro
});

