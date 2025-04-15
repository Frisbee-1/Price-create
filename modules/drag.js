// 🔧 drag.js
// Функции перетаскивания строк таблицы

export function addDragEvents(row) {
  row.setAttribute("draggable", "true");

  row.addEventListener("dragstart", (e) => {
    row.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", row.innerHTML);
  });

  row.addEventListener("dragover", (e) => {
    e.preventDefault();
    row.classList.add("drag-over");
  });

  row.addEventListener("dragleave", () => {
    row.classList.remove("drag-over");
  });

  row.addEventListener("drop", (e) => {
    e.preventDefault();
    row.classList.remove("drag-over");
    const dragging = document.querySelector(".dragging");
    if (dragging && dragging !== row) {
      const tableBody = row.parentElement;
      tableBody.insertBefore(dragging, row);
      dragging.classList.remove("dragging");
    }
  });

  row.addEventListener("dragend", () => {
    row.classList.remove("dragging");
  });
}
