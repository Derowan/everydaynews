import express from 'express'
import fetch from 'node-fetch'
import cors from 'cors'

const app = express()
app.use(cors())

// Chiavi API
const NEWS_API_KEY = '9f5d0982b695411dbbe262f3878227ea'  // NewsAPI Key
const GNEWS_API_KEY = 'c3674db69f99957229145b7656d1b845'  // GNews API Key

const PORT = process.env.PORT || 3000

// Endpoint per NewsAPI
app.get('/news', async (req, res) => {
  const category = req.query.category || 'general'; // Categoria predefinita: general
  const url = `https://newsapi.org/v2/top-headlines?country=us&category=${category}&apiKey=${NEWS_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Errore dal server proxy (NewsAPI)' });
  }
});

// Endpoint per GNews API
app.get('/gnews', async (req, res) => {
  const category = req.query.category || 'general'; // Categoria predefinita: general
  const url = `https://gnews.io/api/v4/top-headlines?lang=it&country=IT&category=${category}&token=${GNEWS_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Errore dal server proxy (GNews)' });
  }
});

// Avvio del server
app.listen(PORT, () => {
  console.log(`Server avviato su http://localhost:${PORT}`);
});
