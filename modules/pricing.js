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
    input.dispatchEvent(new Event("change")); // запустить пересчёт
  });
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
  const row = input.closest("tr");
  const priceInText = row.querySelector(".price-in").textContent;
  const priceIn = parseFloat(priceInText);
  const markup = parseFloat(input.value);

  if (isNaN(priceIn) || isNaN(markup)) return; // 🛑 если что-то не число — выходим

  const priceOut = priceIn + (priceIn * markup) / 100;
  const markupRub = priceOut - priceIn;
  row.querySelector(".price-out").textContent = priceOut.toFixed(2);
  row.querySelector(".markup-rub").textContent = markupRub.toFixed(2);
}

// 🧱 Создаёт строку таблицы по материалу или заголовку
export function createMaterialRow(item) {
  try {
    console.log("🧱 Добавляем строку:", item); // 🪵 лог для отладки
    console.log("📌 Значение item.priceIn:", item.priceIn);
    console.log("📌 Значение item.markup:", item.markup);

    const tableBody = document.getElementById("tableBody");
    if (!tableBody) {
      console.error("❌ tableBody не найден");
      return;
    }

    const row = document.createElement("tr");
    row.dataset.name = item.name;
    row.dataset.group = item.isGroup;

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
        <td><input type="number" class="markup" value="${
          item.markup !== undefined ? item.markup : 2
        }" /></td>
        <td class="markup-rub"></td>
        <td class="price-out"></td>
      `;
    }

    addDragEvents(row);
    tableBody.appendChild(row);

    // ✅ Пересчитать цену сразу после вставки, если это не заголовок
    if (!item.isGroup) {
      const input = row.querySelector(".markup");
      if (input) recalculate(input);
    }
  } catch (err) {
    console.error("❌ Ошибка в createMaterialRow:", err);
  }
}

// 📤 Делаем доступным для HTML (например, для onblur в заголовке группы)
window.renameGroup = renameGroup;
