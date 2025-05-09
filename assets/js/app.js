// Impostazioni per l'API di notizie
const newsAPIKey = '9f5d0982b695411dbbe262f3878227ea'; // La tua API key
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

        // Log della risposta per vedere cosa sta restituendo
        console.log(data);

        if (data.articles && data.articles.length > 0) {
            displayNews(data.articles);
        } else {
            newsContainer.innerHTML = '<tr><td colspan="4">No news found for this category.</td></tr>';
        }
    } catch (error) {
        console.error('Error fetching the news:', error);
        newsContainer.innerHTML = '<tr><td colspan="4">Error loading news. Please try again later.</td></tr>';
    }
}


// Funzione per mostrare le notizie nella tabella
function displayNews(articles) {
    let newsHTML = '';
    
    articles.forEach(article => {
        const preview = article.description ? article.description.substring(0, 150) + '...' : 'No preview available'; // Limita l'anteprima a 150 caratteri

        newsHTML += `
            <tr>
                <td><a href="${article.url}" target="_blank">${article.title}</a></td>
                <td><a href="${article.url}" target="_blank">${article.url}</a></td>
                <td>${preview}</td>
                <td>${article.category ? article.category : 'N/A'}</td>
            </tr>
        `;
    });

    // Inserisci l'HTML delle notizie nella tabella
    newsContainer.innerHTML = newsHTML;
}

// Carica le notizie quando la pagina viene caricata
window.onload = fetchNews;
}
