// 📦 Импорт всех модулей
import { recalculate, applyGlobalMarkup } from "./modules/pricing.js";
import { renderSynonymEditor } from "./modules/editor.js";
import { loadData, handleFile, synonyms } from "./modules/dataLoader.js";
import { toggleEditMode } from "./modules/editMode.js";
import { saveToServer } from "./modules/server.js";


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
  console.log("⏳ DOMContentLoaded: Начало выполнения...");
  console.log("⏳ DOMContentLoaded: Подключаем обработчики...");

  const fileInput = document.getElementById("fileInput");
  if (!fileInput) {
    console.error("❌ Элемент fileInput не найден!");
    return;
  }

  
  fileInput.addEventListener("change", (event) => {
  console.log("📥 Событие change: Файл выбран!");
  console.log("🔍 event.target:", event.target);
  handleFile(event);
  });

  loadData();
  renderSynonymEditor();

  const editBtn = document.getElementById("editToggleBtn");
  if (editBtn) {
    //ЗАКОМЕНТИРОВАНО ВРЕМЕНО
    //editBtn.addEventListener("click", toggleEditMode);
  }
});



//Этот код ничего не делает с данными, он только выводит сообщения в консоль с задержкой — например, чтобы можно было представить, будто "что-то происходит" перед завершением операции.
/*console.log("🟡 ДОБАВЛЕНИЕ МАТЕРИАЛА: запускаем setTimeout");

setTimeout(() => {
  console.log("✅ Добавление завершено. Обновляем данные и убираем блок.");
}, 2000);
*/


//Этот код если случается автоматическая перезагрузка страницы прежде тебя спросит "Перезагрузить?""
/*window.addEventListener("beforeunload", function (e) {
  const confirmMessage = "🔁 Страница пытается обновиться. Проверь действия!";
  console.warn(confirmMessage);
  e.preventDefault();
  e.returnValue = confirmMessage;
  return confirmMessage;
});*/


