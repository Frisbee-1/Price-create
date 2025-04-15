// 📦 server.js — простой сервер для хранения данных
const express = require("express");
const fs = require("fs");
const cors = require("cors");
const app = express();
const PORT = 3001;

const DATA_FILE = "data.json";

app.use(cors());
app.use(express.json());

// 📥 Загрузка данных
app.get("/api/data", (req, res) => {
  if (fs.existsSync(DATA_FILE)) {
    const data = fs.readFileSync(DATA_FILE);
    res.json(JSON.parse(data));
  } else {
    res.json({ materials: [], prices: {}, synonyms: {}, markupMap: {} });
  }
});

// 💾 Сохранение данных
app.post("/api/data", (req, res) => {
  const { materials, prices, synonyms, markupMap } = req.body;
  const data = { materials, prices, synonyms, markupMap };
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
});
