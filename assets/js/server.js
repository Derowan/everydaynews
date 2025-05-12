const express = require('express');
const fetch = require('node-fetch'); // solo se usi Node <18
const app = express();

const API_KEY = '9f5d0982b695411dbbe262f3878227ea';
const PORT = 3000;

app.get('/news', async (req, res) => {
    const category = req.query.category || 'general';
    const url = `https://newsapi.org/v2/top-headlines?country=us&category=${category}&apiKey=${API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Errore dal server proxy' });
    }
});

app.listen(PORT, () => {
    console.log(`Server avviato su http://localhost:${PORT}`);
});
