// Impostazioni per l'API di notizie
const newsAPIKey = '9f5d0982b695411dbbe262f3878227ea'; // Sostituisci con la tua chiave API di NewsAPI
const newsAPIUrl = 'https://newsapi.org/v2/top-headlines?country=us&apiKey=' + newsAPIKey;
const newsContainer = document.getElementById('news-container');
const categorySelect = document.getElementById('category'); // Selettore della categoria

// Funzione per ottenere e visualizzare le notizie
async function fetchNews() {
    const category = categorySelect.value;  // Ottieni la categoria selezionata
    const url = `${newsAPIUrl}&category=${category}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.articles && data.articles.length > 0) {
            displayNews(data.articles);
        } else {
            newsContainer.innerHTML = '<p>No news found for this category.</p>';
        }
    } catch (error) {
        console.error('Error fetching the news:', error);
        newsContainer.innerHTML = '<p>Error loading news. Please try again later.</p>';
    }
}

// Funzione per mostrare le notizie sul sito
function displayNews(articles) {
    let newsHTML = '';
    
    articles.forEach(article => {
        newsHTML += `
            <div class="news-article">
                <h2><a href="${article.url}" target="_blank">${article.title}</a></h2>
                <p>${article.description}</p>
                <small>Source: ${article.source.name}</small>
            </div>
        `;
    });

    // Inserisci l'HTML delle notizie nel container
    newsContainer.innerHTML = newsHTML;
}

// Carica le notizie quando la pagina viene caricata
window.onload = fetchNews;
Cosa è stato cambiato?
Filtri di Categoria: Ora il sito ha un menu a tendina (select) che permette all'utente di scegliere la categoria delle notizie. Ogni volta che viene selezionata una nuova categoria e si clicca sul bottone "Carica Notizie", l'app carica le notizie per quella categoria specifica.

Chiamata API con Categoria: La funzione fetchNews ora include la categoria selezionata nella richiesta API (category=${category}). Questo permetterà di ottenere solo le notizie per quella categoria (ad esempio, solo notizie sportive, di salute, etc.).

Passo 4: Migliorare lo stile (CSS)
Ora, possiamo migliorare l'aspetto delle notizie. Aggiungiamo qualche stile di base nel file style.css:

Esempio di style.css:
css
Copia
Modifica
body {
    font-family: Arial, sans-serif;
    background-color: #f4f4f9;
    color: #333;
    padding: 20px;
}

h1 {
    text-align: center;
}

#filters {
    text-align: center;
    margin-bottom: 20px;
}

#category {
    padding: 10px;
    font-size: 16px;
}

button {
    padding: 10px 15px;
    font-size: 16px;
    cursor: pointer;
}

#news-container {
    margin-top: 20px;
}

.news-article {
    background-color: white;
    padding: 15px;
    margin-bottom: 20px;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.news-article h2 {
    font-size: 18px;
    color: #007bff;
}

.news-article h2 a {
    text-decoration: none;
    color: inherit;
}

.news-article p {
    font-size: 14px;
    color: #555;
}

.news-article small {
    display: block;
    margin-top: 10px;
    font-size: 12px;
    color: #999;
}
