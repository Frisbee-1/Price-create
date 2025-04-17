// 📦 server.js — простой сервер для хранения данных (Node.js)

// ========================
// 1. ИМПОРТ МОДУЛЕЙ
// ========================
const express = require("express"); // Серверный фреймворк
const fs = require("fs"); // Работа с файлами
const cors = require("cors"); // Разрешение запросов с других доменов

// ========================
// 2. НАСТРОЙКА СЕРВЕРА
// ========================
const app = express(); // Инициализируем приложение Express
const PORT = 3001; // Порт, на котором работает сервер
const DATA_FILE = "data.json"; // Путь к файлу, где хранятся данные

// ========================
// 3. MIDDLEWARE
// ========================
app.use(cors()); // Разрешаем CORS (для работы с фронтендом)
app.use(express.json()); // Поддержка JSON-запросов
app.use(express.static("public")); // Статические файлы (если нужно)

// ========================
// 4. ЗАГРУЗКА ДАННЫХ
// ========================
app.get("/api/data", (req, res) => {
  // Если файл существует — читаем его
  if (fs.existsSync(DATA_FILE)) {
    const data = fs.readFileSync(DATA_FILE); // читаем файл как строку
    res.json(JSON.parse(data)); // преобразуем в объект и отправляем
  } else {
    // Если файла нет — возвращаем структуру по умолчанию
    res.json({
      materials: [],
      prices: {},
      synonyms: {},
      markupMap: {},
    });
  }
});

// ========================
// 5. СОХРАНЕНИЕ ДАННЫХ
// ========================
app.post("/api/data", (req, res) => {
  // Извлекаем поля из тела запроса
  const { materials, prices, synonyms, markupMap } = req.body;

  // Собираем объект, который хотим сохранить
  const data = { materials, prices, synonyms, markupMap };

  // 🔍 Логируем что именно сохраняем
  console.log("📝 Сохраняем на сервере:", JSON.stringify(data, null, 2));

  // Сохраняем в файл
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

  // Отвечаем клиенту
  res.json({ status: "ok" });
});

// ========================
// 6. СТАРТ СЕРВЕРА
// ========================
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
});
