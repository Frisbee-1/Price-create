// 🔧 editMode.js
// Управляет режимом редактирования: включение/выключение и визуальная подсветка
// Что он делает:
    // - Добавляет режим редактирования
    // - Управляет кнопкой "Редактировать" ↔ "Сохранить"
    // - Показывает/скрывает баннер
    // - Включает или отключает поля редактирования

let isEditing = false;

export function toggleEditMode() {
  isEditing = !isEditing;

  const button = document.getElementById("editToggleBtn");
  const body = document.body;
  const banner = document.getElementById("editBanner");

  if (isEditing) {
    body.classList.add("editing-mode");
    button.textContent = "Сохранить";
    if (banner) banner.style.display = "block";
  } else {
    body.classList.remove("editing-mode");
    button.textContent = "Редактировать";
    if (banner) banner.style.display = "none";
  }

  // Управление редактированием ячеек таблицы
  document.querySelectorAll("#priceTable td[contenteditable]").forEach((el) => {
    el.contentEditable = isEditing;
  });

  // Управление редактируемостью полей ввода (наценка, синонимы и т.п.)
  document
    .querySelectorAll("#priceTable input, #synonymList input")
    .forEach((input) => {
      input.disabled = !isEditing;
    });

  // Управление кнопкой "+" в редакторе синонимов
  document.querySelectorAll("#synonymList button").forEach((btn) => {
    btn.disabled = !isEditing;
  });

  // Управление перетаскиванием строк
  document
    .querySelectorAll("#priceTable input, #synonymList input")
    .forEach((input) => {
      row.setAttribute("draggable", isEditing);
    });

  // 🔁 Пересчёт цены при изменении глобальной наценки
  document.querySelectorAll(".markup").forEach((input) => {
    const row = input.closest("tr");
    const priceIn = parseFloat(row.querySelector(".price-in").textContent);
    const markup = parseFloat(input.value);
    const priceOut = priceIn + (priceIn * markup) / 100;
    const markupRub = priceOut - priceIn;
    row.querySelector(".price-out").textContent = priceOut.toFixed(2);
    row.querySelector(".markup-rub").textContent = markupRub.toFixed(2);
  });

  // Управление перетаскиванием строк и обработчиками drag & drop
  document.querySelectorAll("#priceTable tbody tr").forEach((row) => {
    row.setAttribute("draggable", isEditing);

    if (isEditing) {
      if (row._dragStart) row.addEventListener("dragstart", row._dragStart);
      if (row._dragOver) row.addEventListener("dragover", row._dragOver);
      if (row._dragLeave) row.addEventListener("dragleave", row._dragLeave);
      if (row._drop) row.addEventListener("drop", row._drop);
    } else {
      if (row._dragStart) row.removeEventListener("dragstart", row._dragStart);
      if (row._dragOver) row.removeEventListener("dragover", row._dragOver);
      if (row._dragLeave) row.removeEventListener("dragleave", row._dragLeave);
      if (row._drop) row.removeEventListener("drop", row._drop);
    }
  });
} 