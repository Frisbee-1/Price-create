// 🔧 pricing.js
// Содержит функции расчёта и отрисовки строк таблицы

import { addDragEvents } from "./drag.js";
import { renameGroup } from "./group.js";
import { materials } from "./dataLoader.js";

// ✅ Применяет глобальную наценку ко всем строкам
export function applyGlobalMarkup() {
  const globalValue = parseFloat(document.getElementById("globalMarkup").value);

  document.querySelectorAll(".markup").forEach((input) => {
    input.value = globalValue;
    recalculate(input); // пересчёт строки
  });

  updateAndSave(); // 💾 сохраняем всё разом
}

// Глобальные переменные, экспортируемые из модуля
export let synonyms = {};

// 🔁 Показываем незагруженные строки из Excel
export function showUnmatched(unmatched) {
  const list = document.getElementById("unmatchedList");
  if (!list) return;
  list.innerHTML = "";
  unmatched.forEach((name) => {
    const div = document.createElement("div");
    div.className = "unmatched-row";
    div.textContent = name + " — не найден";
    list.appendChild(div);
  });
}

// 🔢 Пересчитывает цену продажи и наценку в рублях
export function recalculate(input) {
  //console.log("➡️ recalculate вызвана", input); 
  const row = input.closest("tr");
  const priceInText = row.querySelector(".price-in").textContent;
  const priceIn = parseFloat(priceInText);
  const markupInput = row.querySelector(".markup");
  const markup = parseFloat(markupInput.value);

  if (isNaN(priceIn) || isNaN(markup)) {
    row.querySelector(".markup-rub").textContent = ""; // Очищаем, если нет данных
    row.querySelector(".price-out").textContent = ""; // Очищаем, если нет данных
    return; // 🛑 если что-то не число — выходим
  }

  const markupRubValue = (priceIn * markup) / 100;
  const priceOutValue = priceIn + markupRubValue;

  row.querySelector(".markup-rub").textContent = markupRubValue.toFixed(2);
  row.querySelector(".price-out").textContent = priceOutValue.toFixed(2);
}

// 🧱 Создаёт строку таблицы по материалу или заголовку
export function createMaterialRow(item) {
  //console.log("🔹 createMaterialRow вызвана для:", item);

  // 1. Находим tbody по ID (как в вашем HTML)
  const tableBody = document.getElementById("tableBody");
  if (!tableBody) {
    console.error("❌ tableBody (id='tableBody') не найден!");
    return;
  }

  // 2. Создаем строку
  const row = document.createElement("tr");
  row.dataset.name = item.name;
  row.dataset.group = item.isGroup;

  // 3. Заполняем HTML в зависимости от типа (группа/материал)
  if (item.isGroup) {
    row.innerHTML = `
      <td class="drag-handle">⬍</td>
      <td colspan="5"><h2 contenteditable="true" onblur="renameGroup(this)">${item.name}</h2></td>
    `;
  } else {
    row.innerHTML = `
      <td class="drag-handle">⬍</td>
      <td contenteditable="true">${item.name}</td>
      <td class="price-in">${item.priceIn ?? ""}</td>
      <td><input type="number" class="markup" value="${item.markup ?? 2}" /></td>
      <td class="markup-rub"></td>
      <td class="price-out"></td>
    `;
   
  }

  // 4. Добавляем события
  addDragEvents(row);
 tableBody.appendChild(row);

 const markupInput = row.querySelector(".markup");
 if (markupInput) {
   markupInput.addEventListener("change", () => {
     recalculate(markupInput); // пересчитать
     updateAndSave(); // 💾 сохранить
   });
   recalculate(markupInput); // первичный расчёт
 }
}

// 📤 Делаем доступным для HTML (например, для onblur в заголовке группы)
window.renameGroup = renameGroup;
