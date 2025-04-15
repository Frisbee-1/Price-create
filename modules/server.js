// 📦 modules/server.js — используется на клиенте (в браузере)

// Отвечает за отправку данных на сервер из интерфейса
export function saveToServer(materials, synonyms, prices, markupMap) {
  console.log("📤 Отправляем на сервер:", {
    materials,
    synonyms,
    prices,
    markupMap,
  });

  // 🔍 Отладка: проверим, что materials не пустой перед отправкой
  console.log("📎 materials перед fetch:", materials);

  fetch("http://localhost:3001/api/data", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ materials, synonyms, prices, markupMap }),
  })
    .then((res) => res.json())
    .then(() => console.log("✅ Данные сохранены на сервере"))
    .catch((err) => console.error("❌ Ошибка сохранения:", err));
}
