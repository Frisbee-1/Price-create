// 🔧 utils.js
// Приводим наименование к нормальной форме

// 🔧 utils.js
// Утилита для нормализации наименований

export function normalizeName(name) {
  if (!name || typeof name !== "string") return ""; // защита от undefined/null

  return name
    .replace(/\s+/g, " ")   // заменяет несколько пробелов одним
    .replace(/\,/g, ".")    // заменяет запятые на точки
    .trim();                // убирает пробелы в начале и в конце
}

