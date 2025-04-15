// 🔧 editor.js
// Этот модуль отвечает за отрисовку и редактирование блока "Редактор синонимов".
// Позволяет:
// - редактировать основное название материала,
// - добавлять и удалять синонимы,
// - сохранять изменения в базу,
// - обновлять интерфейс при изменениях.

import { materials, synonyms } from "./dataLoader.js";
import { saveToServer } from "./server.js";

export function renderSynonymEditor() {
  const list = document.getElementById("synonymList");
  if (!list) return;
  list.innerHTML = "";

  const materialNames = materials.filter((m) => !m.isGroup).map((m) => m.name);

  materialNames.forEach((baseName, index) => {
    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.alignItems = "center";
    row.style.marginBottom = "5px";
    row.style.flexWrap = "wrap";

    const baseInput = document.createElement("input");
    baseInput.type = "text";
    baseInput.value = baseName;
    baseInput.style.marginRight = "10px";
    baseInput.onchange = () => {
      const newVal = baseInput.value.trim();
      if (newVal && newVal !== baseName) {
        materials[index].name = newVal;
        for (const key in synonyms) {
          if (synonyms[key] === baseName) synonyms[key] = newVal;
        }
        renderSynonymEditor();
        saveToServer();
      }
    };
    row.appendChild(baseInput);

    const matchedSynonyms = Object.entries(synonyms).filter(
      ([key, val]) => val === baseName
    );

    matchedSynonyms.forEach(([synonym]) => {
      const arrow = document.createElement("span");
      arrow.textContent = "→";
      arrow.style.margin = "0 5px";

      const synonymInput = document.createElement("input");
      synonymInput.type = "text";
      synonymInput.value = synonym;
      synonymInput.onchange = () => {
        const newSyn = synonymInput.value.trim();
        if (newSyn && newSyn !== synonym) {
          synonyms[newSyn] = baseName;
          delete synonyms[synonym];
          renderSynonymEditor();
          saveToServer();
        }
      };

      const removeBtn = document.createElement("button");
      removeBtn.textContent = "✕";
      removeBtn.onclick = () => {
        delete synonyms[synonym];
        renderSynonymEditor();
        saveToServer();
      };

      row.appendChild(arrow);
      row.appendChild(synonymInput);
      row.appendChild(removeBtn);
    });

    const plus = document.createElement("button");
    plus.textContent = "+";
    plus.style.marginLeft = "10px";
    plus.onclick = () => {
      const newSyn = prompt("Введите новый синоним для: " + baseName);
      if (newSyn) {
        synonyms[newSyn.trim()] = baseName;
        renderSynonymEditor();
        saveToServer();
      }
    };

    row.appendChild(plus);
    list.appendChild(row);
  });
}
