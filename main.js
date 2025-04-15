// 📦 Импорт всех модулей
import {
  recalculate,
  applyGlobalMarkup,
} from "./modules/pricing.js";
import { renderSynonymEditor } from "./modules/editor.js";
import {
  loadData,
  handleFile,
  synonyms,
} from "./modules/dataLoader.js";
import { toggleEditMode } from "./modules/editMode.js";
import { saveToServer } from "./modules/server.js"; // ✅ импортируем функцию сохранения

let dragSrcEl = null;

function normalizeName(name) {
  return name.replace(/\s+/g, " ").replace(/,/g, ".").trim();
}

function addDragEvents(row) {
  row.setAttribute("draggable", "true");
  row.addEventListener("dragstart", handleDragStart);
  row.addEventListener("dragover", handleDragOver);
  row.addEventListener("dragleave", handleDragLeave);
  row.addEventListener("drop", handleDrop);
}

function handleDragStart(e) {
  dragSrcEl = this;
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/html", this.innerHTML);
}

function handleDragOver(e) {
  if (e.preventDefault) e.preventDefault();
  this.classList.add("drag-over");
  return false;
}

function handleDragLeave() {
  this.classList.remove("drag-over");
}

function handleDrop(e) {
  if (e.stopPropagation) e.stopPropagation();
  if (dragSrcEl !== this) {
    const draggedIndex = [
      ...document.getElementById("tableBody").children,
    ].indexOf(dragSrcEl);
    const targetIndex = [
      ...document.getElementById("tableBody").children,
    ].indexOf(this);
    const tableBody = document.getElementById("tableBody");
    tableBody.insertBefore(
      dragSrcEl,
      targetIndex > draggedIndex ? this.nextSibling : this
    );

    // обновляем порядок материалов и сохраняем
    const newOrder = [...tableBody.querySelectorAll("tr")].map((tr) => ({
      name: tr.dataset.name,
      isGroup: tr.dataset.group === "true",
    }));
    saveToServer(newOrder, synonyms, {});
  }
  this.classList.remove("drag-over");
  return false;
}

// 📤 Делаем функции доступными для HTML (onclick)
window.recalculate = recalculate;
window.applyGlobalMarkup = applyGlobalMarkup;

import("./modules/editor.js").then((mod) => {
  window.addSynonymField = mod.addSynonymField;
});

// 🔁 Когда DOM загружен — запускаем загрузку данных
document.addEventListener("DOMContentLoaded", () => {
  console.log("📦 Запускаем loadData из main.js...");
  document.getElementById("fileInput").addEventListener("change", handleFile);
  loadData();
  renderSynonymEditor();

  const editBtn = document.getElementById("editToggleBtn");
  if (editBtn) {
    editBtn.addEventListener("click", toggleEditMode);
  }
});
