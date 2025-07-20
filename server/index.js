import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

const dataFile = path.join(__dirname, 'games.json')
if (!fs.existsSync(dataFile)) {
  fs.writeFileSync(dataFile, '[]', 'utf-8')
}

let games = JSON.parse(fs.readFileSync(dataFile, 'utf-8'))

app.get('/games', (req, res) => {
  res.json(games)
})

app.post('/games', (req, res) => {
  const game = req.body
  games.unshift(game)
  fs.writeFileSync(dataFile, JSON.stringify(games, null, 2))
  res.json({ success: true })
})

app.delete('/games/:timestamp', (req, res) => {
  const ts = Number(req.params.timestamp)
  games = games.filter((g) => g.timestamp !== ts)
  fs.writeFileSync(dataFile, JSON.stringify(games, null, 2))
  res.json({ success: true })
})

app.listen(PORT, () => {
  console.log(`Central server listening on port ${PORT}`)
})
