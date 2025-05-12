const proxyUrl = 'https://everydaynews.onrender.com';
const newsContainer = document.getElementById('news-container');
const categorySelect = document.getElementById('category');

async function fetchNews() {
    const category = categorySelect.value;
    const url = `${proxyUrl}/news?category=${category}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        newsContainer.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
    } catch {
        newsContainer.innerHTML = '<p>Errore durante il caricamento delle notizie.</p>';
    }
}

window.addEventListener('DOMContentLoaded', fetchNews);
categorySelect.addEventListener('change', fetchNews);

window.addEventListener('DOMContentLoaded', fetchNews);
categorySelect.addEventListener('change', fetchNews);
