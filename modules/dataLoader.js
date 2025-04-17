// 🔧 dataLoader.js
// Этот модуль загружает данные с сервера и отрисовывает таблицу

import { showUnmatched, createMaterialRow, recalculate } from "./pricing.js";
import { normalizeName } from "./utils.js";
import { renderSynonymEditor } from "./editor.js";
import { saveToServer } from "./server.js";

// Инициализация данных
export let synonyms = {};
export let markupMap = {};
export let materials = [];

// ========================
// 1. ОСНОВНЫЕ ФУНКЦИИ
// ========================

function updateMaterialsFromDOM() {
  materials = Array.from(document.querySelectorAll("#priceTable tbody tr"))
    .filter((tr) => tr.dataset.name)
    .map((tr) => ({
      name: tr.dataset.name,
      isGroup: tr.dataset.group === "true",
    }));
}

function updateMarkupMapFromDOM() {
  markupMap = {};
  document
    .querySelectorAll("#priceTable tbody tr:not([data-group='true'])")
    .forEach((tr) => {
      const name = tr.dataset.name;
      const markup = parseFloat(tr.querySelector(".markup")?.value);
      if (name && !isNaN(markup)) {
        markupMap[name] = markup;
      }
    });
}

function updatePricesFromDOM() {
  const prices = {};
  document
    .querySelectorAll("#priceTable tbody tr:not([data-group='true'])")
    .forEach((tr) => {
      const name = tr.dataset.name;
      const price = parseFloat(tr.querySelector(".price-in")?.textContent);
      if (name && !isNaN(price)) {
        prices[name] = price;
      }
    });
  return prices;
}

// ========================
// 2. ЗАГРУЗКА ДАННЫХ
// ========================

export function loadData() {
  console.log("🔄 Загрузка данных с сервера");

  return fetch("http://localhost:3001/api/data")
    .then((res) => {
      if (!res.ok) throw new Error(`Ошибка HTTP: ${res.status}`);
      return res.json();
    })
    .then((data) => {
      console.log("📥 Данные получены:", data);

      // Обработка и удаление дубликатов
      const uniqueMaterials = [];
      const seenNames = new Set();

      data.materials.forEach((item) => {
        const normName = normalizeName(item.name);
        if (!seenNames.has(normName)) {
          seenNames.add(normName);
          uniqueMaterials.push(item);
        }
      });

      // Обновление данных
      materials = uniqueMaterials;
      synonyms = data.synonyms || {};
      markupMap = data.markupMap || {};

      // Отрисовка таблицы
      const tableBody = document.querySelector("#priceTable tbody");
      if (tableBody) {
        tableBody.innerHTML = "";
        materials.forEach((item) => {
          const enrichedItem = {
            ...item,
            priceIn: data.prices?.[item.name] || 0,
            markup: data.markupMap?.[item.name] || 0,
          };
          createMaterialRow(enrichedItem);
        });
      }

      return data;
    })
    .catch((err) => {
      console.error("❌ Ошибка загрузки:", err);
      throw err;
    });
}

// ========================
// 3. ОБРАБОТКА EXCEL
// ========================

export function handleFile(event) {
  console.log("📥 handleFile вызван, файл:", event?.target?.files?.[0]);
  if (!event?.target?.files?.[0]) {
    console.error("❌ Файл не выбран");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {

    try {
      // Парсинг Excel
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const json = XLSX.utils.sheet_to_json(
        workbook.Sheets[workbook.SheetNames[0]]
      );
      console.log("✅ Файл Excel прочитан:", json);

      // Фильтрация новых материалов
      const existingNames = materials.map((m) => normalizeName(m.name));
      window.tempExcelData = json.filter((row) => {
        try {
          const rowName = normalizeName(
            row["Наименование"] || row["Item Name"]
          );
          const exists = existingNames.includes(rowName); // 💥 ВОТ ЭТО НУЖНО ДОБАВИТЬ

          console.log("🔍 Сравнение:", {
            исходное: row["Наименование"] || row["Item Name"],
            нормализованное: rowName,
            ужеЕсть: exists,
          });

          return rowName && !exists;
        } catch (error) {
          console.error("❌ Ошибка в filter:", error, "→ строка:", row);
          return false;
        }
      });
console.log("🧩 Строки из Excel (tempExcelData):", window.tempExcelData);
      // Отображение несоответствий
      const unmatchedList = document.getElementById("unmatchedList");
      if (unmatchedList) {
        unmatchedList.innerHTML = "";
        window.tempExcelData.forEach((row) => {
          console.log("🔍 Ключи строки из Excel:", Object.keys(row)); // 👈 вставь сюда
          const name = row["Наименование"] || row["Item Name"];// Если в колонку добавляем другое наименование, то его нужно прописать тут
          console.log("🎯 Добавляем в unmatchedList:", name);
          handleUnmatchedMaterial(name, unmatchedList);
        });

      }
    } catch (error) {
      console.error("❌ Ошибка обработки файла:", error);
      alert("Ошибка загрузки файла. Проверьте формат.");
    }
  };
  reader.readAsArrayBuffer(event.target.files[0]);
}

// ========================
// 4. НЕЗАГРУЖЕННЫЕ ЦЕНЫ
// ========================

export function handleUnmatchedMaterial(name, container) {
  // 🎯 Создаём обёртку для строки unmatched материала
  const div = document.createElement("div"); // <div class="unmatched-row">
  div.className = "unmatched-row";

  // 🏷️ Название материала
  const span = document.createElement("span");
  span.textContent = name;

  // ➕ Кнопка "Добавить"
  const addBtn = document.createElement("button");
  addBtn.type = "button"; // чтобы не срабатывал submit
  addBtn.className = "add-btn";
  addBtn.textContent = "Добавить";

  // 📋 Кнопка "Копировать"
  const copyBtn = document.createElement("button");
  copyBtn.type = "button";
  copyBtn.className = "copy-btn";
  copyBtn.textContent = "Копировать";

  // ❌ Кнопка "Удалить"
  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.className = "remove-btn";
  removeBtn.innerHTML = "✕";

  // 📎 Вставляем кнопки и текст в строку
  div.append(span, addBtn, copyBtn, removeBtn);

  // 🔘 Обработка кнопки "Добавить"
  addBtn.addEventListener("click", (e) => {
    console.log("👆 Кнопка ДОБАВИТЬ нажата"); // ✅ должна появиться только один раз

    e.preventDefault(); // блокируем стандартное поведение
    e.stopPropagation(); // останавливаем всплытие
    e.stopImmediatePropagation(); // полностью блокируем внешние обработчики

    setTimeout(async () => {
      try {
        console.log("🟡 ДОБАВЛЕНИЕ МАТЕРИАЛА: запускаем setTimeout");

        // 🔍 Ищем соответствующий элемент из Excel
        const excelItem = window.tempExcelData?.find(
          (item) => normalizeName(item["Наименование"]) === normalizeName(name)
        );

        // 🧱 Формируем новый объект материала
        const newItem = {
          name: name, // Название
          isGroup: false, // Это обычный материал
          priceIn: excelItem ? parseFloat(excelItem["Цена вход"]) : 0, // Цена вход
        };

        materials.push(newItem); // ➕ Добавляем в общий массив
        createMaterialRow(newItem); // 🧱 Отрисовываем строку в таблицу
        await updateAndSave(); // 💾 Сохраняем в базе данных - когда закоментировал эту строку, после кнопки добавить страница перестала перезагружаться
        div.remove(); // 🧹 Удаляем строку из unmatched - из загружаемого файла сразу после нажатия кнопки Добавить

        console.log(
          "✅ Добавление завершено. Обновляем данные и убираем блок."
        );
      } catch (err) {
        console.error(
          "❌ Ошибка внутри setTimeout при добавлении материала:",
          err
        );
      }
    }, 0);

    return false; // ещё одна защита от submit
  });

  // 📋 Обработка кнопки "Копировать"
  copyBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(name); // Копируем имя в буфер
  });

  // ❌ Обработка кнопки "Удалить"
  removeBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    div.remove(); // Удаляем строку из интерфейса
  });

  // 📥 Добавляем эту строку в контейнер unmatched
  container.appendChild(div);
}

// ========================
// 5. СОХРАНЕНИЕ ДАННЫХ
// ========================

function updateAndSave() {
  console.log("🛠 updateAndSave вызван");
  updateMaterialsFromDOM();
  updateMarkupMapFromDOM();
  const prices = updatePricesFromDOM();
  console.log("➡️ updateAndSave: вызывает saveToServer");
  saveToServer(materials, synonyms, prices, markupMap)
    .then(() => {
      console.log("✅ updateAndSave: saveToServer завершился успешно");
    })
    .catch((error) => {
      console.error(
        "❌ updateAndSave: saveToServer завершился с ошибкой:",
        error
      );
    });
  console.log("➡️ updateAndSave: завершение");
}

// ========================
// 6. ИНИЦИАЛИЗАЦИЯ
// ========================

// Делаем функции глобально доступными
window.loadData = loadData;
window.handleFile = handleFile;

// Автосохранение при изменении наценки
document
  .getElementById("tableBody") // ✨
  .addEventListener("input", (e) => {
    // ✨
    if (e.target.classList.contains("markup")) {
      recalculate(e.target); // пересчитываем цифры
      updateAndSave(); // сохраняем на сервер
    }
  });

console.log("✅ dataLoader.js загружен");

export { updateAndSave };
