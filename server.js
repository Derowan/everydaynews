import express from 'express'
import fetch from 'node-fetch'
import cors from 'cors'

const app = express()
app.use(cors())

const API_KEY = '9f5d0982b695411dbbe262f3878227ea'
const PORT = process.env.PORT || 3000

app.get('/news', async (req, res) => {
  const category = req.query.category || 'general'
  const url = `https://newsapi.org/v2/top-headlines?country=us&category=${category}&apiKey=${API_KEY}`
  try {
    const response = await fetch(url)
    const data = await response.json()
    res.json(data)
  } catch {
    res.status(500).json({ error: 'Errore dal server proxy' })
  }
})

app.listen(PORT, () => {
  console.log(`Server avviato su http://localhost:${PORT}`)
})
