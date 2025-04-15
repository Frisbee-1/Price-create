// 🔧 group.js
// Модуль для работы с заголовками групп материалов

import { saveToServer } from "./server.js";
import { materials, synonyms } from "./dataLoader.js";

//import { saveToServer } from "./server.js"; // предположим, эта функция будет экспортирована оттуда

export function renameGroup(el) {
  const row = el.closest("tr");
  const index = [...document.getElementById("tableBody").children].indexOf(row);
  materials[index].name = el.textContent.trim();
  saveToServer(materials, synonyms, {}); // мы пока не меняем цены, поэтому prices — пустой
}
