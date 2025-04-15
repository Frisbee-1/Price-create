// 🔧 dataLoader.js
// Этот модуль загружает данные с сервера и отрисовывает таблицу

import { showUnmatched } from "./pricing.js";
import { normalizeName } from "./utils.js";
import { createMaterialRow } from "./pricing.js";
import { renderSynonymEditor } from "./editor.js";
import { recalculate } from "./pricing.js";
import { saveToServer } from "./server.js";

export let synonyms = {};
export let markupMap = {}; // 💰 карта наценок по наименованиям
export let materials = [];

console.log("✅ saveToServer импортирован успешно");

function updateMaterialsFromDOM() {
  materials = [];
  document.querySelectorAll("#priceTable tbody tr").forEach((tr) => {
    const name = tr.dataset.name;
    const isGroup = tr.dataset.group === "true";
    if (name) {
      materials.push({ name, isGroup });
    }
  });
  console.log("🧠 Обновлённый materials из DOM:", materials);
}

function updateMarkupMapFromDOM() {
  markupMap = {};
  document.querySelectorAll("#priceTable tbody tr").forEach((tr) => {
    const name = tr.dataset.name;
    const isGroup = tr.dataset.group === "true";
    if (!isGroup) {
      const markup = parseFloat(tr.querySelector(".markup")?.value);
      if (!isNaN(markup)) {
        markupMap[name] = markup;
      }
    }
  });
}

// 📄 Собираем цены из DOM
function updatePricesFromDOM() {
  const prices = {};
  document.querySelectorAll("#priceTable tbody tr").forEach((tr) => {
    const name = tr.dataset.name;
    const isGroup = tr.dataset.group === "true";
    if (!isGroup) {
      const price = parseFloat(tr.querySelector(".price-in").textContent);
      if (!isNaN(price)) {
        prices[name] = price;
      }
    }
  });
  return prices;
}

export function handleUnmatchedMaterial(name, container) {
  const div = document.createElement("div");
  div.className = "unmatched-row";

  const text = document.createElement("span");
  text.textContent = name + " — не найден";
  div.appendChild(text);

  const addBtn = document.createElement("button");
  addBtn.textContent = "Добавить в таблицу";
  addBtn.onclick = () => {
    const newItem = { name, isGroup: false };
    materials.push(newItem);
    createMaterialRow(newItem);
    updateMarkupMapFromDOM();
    const prices = updatePricesFromDOM();
    console.log("📦 Перед сохранением, содержимое materials:", materials);
    saveToServer(materials, synonyms, prices, markupMap);
    renderSynonymEditor();
    div.remove();
  };
  div.appendChild(addBtn);

  const copyBtn = document.createElement("button");
  copyBtn.textContent = "Копировать";
  copyBtn.onclick = () => {
    navigator.clipboard
      .writeText(name)
      .then(() => alert("Скопировано: " + name));
  };
  div.appendChild(copyBtn);

  const removeBtn = document.createElement("button");
  removeBtn.textContent = "✕";
  removeBtn.onclick = () => div.remove();
  div.appendChild(removeBtn);

  container.appendChild(div);
}

export function loadData() {
  console.log("📦 Загружаем данные с сервера...");
  fetch("http://localhost:3001/api/data")
    .then((res) => res.json())
    .then((data) => {
      console.log("📥 Ответ с сервера:", data);
      console.log("📦 materials из сервера:", data.materials);
      if (data.materials) {
        console.log("📎 data.materials из ответа сервера:", data.materials);
        materials = data.materials;
        console.log("📌 Присваиваем materials:", materials);
        const tableBody = document
          .getElementById("priceTable")
          ?.querySelector("tbody");
        if (!tableBody) {
          console.error("Таблица priceTable не найдена!");
          return;
        }
        tableBody.innerHTML = "";
        console.log("🔁 Отрисовываем строки:", materials);
        console.log("🌀 Проверка materials перед отрисовкой:", materials);
        console.log(
          "🔍 Кол-во строк materials для отрисовки:",
          materials.length
        );

        materials.forEach((item) => {
          if (typeof item === "string") {
            item = { name: item, isGroup: false };
          }
          if (data.prices && data.prices[item.name]) {
            item.priceIn = data.prices[item.name];
          }
          if (data.markupMap && data.markupMap[item.name]) {
            item.markup = data.markupMap[item.name];
          }
          console.log("📦 Перед вызовом createMaterialRow", item);
          createMaterialRow(item);
          console.log("✅ После createMaterialRow:", item);
        });
      }

      if (data.synonyms) synonyms = data.synonyms;
      if (data.markupMap) markupMap = data.markupMap;

      for (const name in markupMap) {
        const row = Array.from(
          document.querySelectorAll("#priceTable tbody tr")
        ).find((tr) => normalizeName(tr.dataset.name) === normalizeName(name));
        if (row) {
          const input = row.querySelector(".markup");
          if (input) {
            input.value = markupMap[name];
          }
        }
      }

      if (data.prices) {
        for (const name in data.prices) {
          const row = Array.from(
            document.querySelectorAll("#priceTable tbody tr")
          ).find(
            (tr) => normalizeName(tr.dataset.name) === normalizeName(name)
          );
          if (row) {
            row.querySelector(".price-in").textContent = data.prices[name];
            const input = row.querySelector(".markup");
            if (input) {
              const priceIn = parseFloat(data.prices[name]);
              const markup = parseFloat(input.value);
              const priceOut = priceIn + (priceIn * markup) / 100;
              const markupRub = priceOut - priceIn;
              row.querySelector(".price-out").textContent = !isNaN(priceOut)
                ? priceOut.toFixed(2)
                : "N/A";
              row.querySelector(".markup-rub").textContent = !isNaN(markupRub)
                ? markupRub.toFixed(2)
                : "N/A";
            }
          }
        }
      }

      console.log("📊 Цены из базы:", data.prices);
      console.log("📘 Синонимы из базы:", data.synonyms);
      console.log("📦 Материалы:", materials);
      renderSynonymEditor();
    })
    .catch((err) => {
      console.error("Ошибка при загрузке данных:", err);
    });
}

export function handleFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet);

    const unmatched = [];
    const pricesFromFile = {};

    json.forEach((row) => {
      const rawName = row["Наименование"];
      const rawPrice = parseFloat(
        row["Цена вход"] || row["Цена при с/в с завода, руб. за 1м2"]
      );

      if (!rawName || isNaN(rawPrice)) return;

      const normalizedName = normalizeName(rawName);
      let matched = false;

      materials.forEach((item) => {
        if (!item.isGroup) {
          const original = item.name;
          const normalizedOriginal = normalizeName(original);
          if (
            normalizedName === normalizedOriginal ||
            normalizeName(synonyms[normalizedName]) === normalizedOriginal
          ) {
            pricesFromFile[original] = rawPrice;
            matched = true;
          }
        }
      });

      if (!matched) {
        unmatched.push(rawName);
      }
    });

    document.querySelectorAll("#priceTable tbody tr").forEach((tr) => {
      const name = tr.dataset.name;
      if (pricesFromFile[name]) {
        tr.querySelector(".price-in").textContent = pricesFromFile[name];
        recalculate(tr.querySelector(".markup"));
      }
    });

    const list = document.getElementById("unmatchedList");
    if (!list) {
      console.error("Список unmatchedList не найден!");
      return;
    }
    list.innerHTML = "";

    unmatched.forEach((name) => {
      handleUnmatchedMaterial(name, list);
    });
    updateMaterialsFromDOM(); // 🧠 Обновляем materials перед сохранением
    console.log("📦 Перед сохранением, содержимое materials:", materials);
    saveToServer(materials, synonyms, pricesFromFile, markupMap);
  };

  reader.readAsArrayBuffer(file);
}

// 🎯 Сохраняем изменения наценки при её ручном вводе

// 🔁 Обработка ручного ввода наценки и сохранение всех данных
document.addEventListener("input", (e) => {
  if (e.target.classList.contains("markup")) {
    updateMarkupMapFromDOM();
    const prices = updatePricesFromDOM();
    console.log("📦 Перед сохранением, содержимое materials:", materials);
    saveToServer(materials, synonyms, prices, markupMap);
  }
});
