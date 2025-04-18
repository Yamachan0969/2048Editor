(function () {
  const gameState = JSON.parse(localStorage.getItem("gameState"));
  const bestScore = parseInt(localStorage.getItem("bestScore"), 10) || 0;

  if (!gameState) {
    alert("gameState が見つかりません");
    return;
  }

  const gridSize = gameState.grid.size;

  // CSSスタイル追加
  const style = document.createElement("style");
  style.textContent = `
    .editor-modal { animation: fadeIn 0.3s ease-out }
    @keyframes fadeIn {
      from { opacity: 0; transform: scale(.95) }
      to { opacity: 1; transform: scale(1) }
    }
    .back-arrow {
      background: none; border: none; font-size: 20px; color: #1A73E8;
      cursor: pointer; padding: 0; line-height: 1;
    }
    .editor-transition { transition: all 0.3s ease }
    .custom-button {
      padding: 10px 20px; font-size: 16px; background: #1A73E8;
      color: #fff; border: none; border-radius: 3px; cursor: pointer;
      transition: background 0.2s;
    }
    .custom-button:hover { background: #1558b0 }
  `;
  document.head.appendChild(style);

  const editor = document.createElement("div");
  editor.classList.add("editor-modal");
  Object.assign(editor.style, {
    position: "fixed", top: "20px", left: "20px", zIndex: "9999",
    width: "420px", height: "520px", background: "white",
    border: "1px solid black", boxShadow: "0 0 10px rgba(0,0,0,0.3)",
    borderRadius: "6px", display: "flex", flexDirection: "column", overflow: "hidden"
  });

  // ヘッダー
  const header = document.createElement("div");
  Object.assign(header.style, {
    cursor: "grab", padding: "10px 20px", background: "#f0f0f0",
    borderBottom: "1px solid #ccc", userSelect: "none",
    display: "flex", alignItems: "center", gap: "8px", height: "48px"
  });

  const backBtn = document.createElement("button");
  backBtn.innerHTML = "←";
  backBtn.className = "back-arrow";
  backBtn.style.display = "none";
  backBtn.onclick = () => switchToMain();

  const title = document.createElement("strong");
  title.textContent = "編集メニュー（ドラッグ移動可）";

  header.appendChild(backBtn);
  header.appendChild(title);
  editor.appendChild(header);

  // コンテンツ領域
  const content = document.createElement("div");
  Object.assign(content.style, {
    flex: "1", overflowY: "auto", padding: "10px"
  });

  const mainMenu = document.createElement("div");
  mainMenu.classList.add("editor-transition");

  const scoreLabel = document.createElement("div");
  scoreLabel.textContent = "スコア";
  const scoreInput = document.createElement("input");
  scoreInput.type = "number";
  scoreInput.value = gameState.score;
  scoreInput.style.width = "100%";

  const bestLabel = document.createElement("div");
  bestLabel.textContent = "ベストスコア";
  const bestScoreInput = document.createElement("input");
  bestScoreInput.type = "number";
  bestScoreInput.value = bestScore;
  bestScoreInput.style.width = "100%";

  const tileEditBtn = document.createElement("button");
  tileEditBtn.textContent = "タイルを編集";
  tileEditBtn.style.marginTop = "10px";
  tileEditBtn.style.width = "100%";
  tileEditBtn.onclick = () => switchToEditor();
  tileEditBtn.classList.add("custom-button");

  mainMenu.append(scoreLabel, scoreInput, bestLabel, bestScoreInput, tileEditBtn);
  content.appendChild(mainMenu);

  // タイル編集画面
  const tileEditor = document.createElement("div");
  tileEditor.style.display = "none";
  tileEditor.classList.add("editor-transition");

  const tileGrid = document.createElement("div");
  tileGrid.style.display = "grid";
  tileGrid.style.gridTemplateColumns = `repeat(${gridSize},60px)`;
  tileGrid.style.gridGap = "5px";
  tileGrid.style.marginBottom = "10px";

  const inputs = [];

  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const cell = gameState.grid.cells[x][y];
      const value = cell ? cell.value : "";
      const tile = document.createElement("div");
      Object.assign(tile.style, {
        width: "60px", height: "60px", lineHeight: "60px",
        textAlign: "center", fontSize: "20px", borderRadius: "6px",
        border: "1px solid #ccc", background: value ? "#eee4da" : "#ccc",
        color: "#333"
      });
      tile.contentEditable = true;
      tile.textContent = value;

      tile.addEventListener("input", () => {
        const newVal = parseInt(tile.textContent, 10);
        tile.style.background = isNaN(newVal) ? "#ccc" : "#eee4da";
      });

      tileGrid.appendChild(tile);
      inputs.push({ x, y, tile });
    }
  }

  const resetBtn = document.createElement("button");
  resetBtn.textContent = "全タイルをリセット";
  resetBtn.style.width = "100%";
  resetBtn.onclick = () => {
    inputs.forEach(i => {
      i.tile.textContent = "";
      i.tile.style.background = "#ccc";
    });
  };
  resetBtn.classList.add("custom-button");

  tileEditor.append(tileGrid, resetBtn);
  content.appendChild(tileEditor);

  // フッター
  const footer = document.createElement("div");
  Object.assign(footer.style, {
    borderTop: "1px solid #ccc", padding: "10px", background: "#fff",
    display: "flex", justifyContent: "space-between"
  });

  const saveBtn = document.createElement("button");
  saveBtn.textContent = "保存してリロード";
  saveBtn.classList.add("custom-button");
  saveBtn.onclick = () => {
    const newCells = [];

    for (let x = 0; x < gridSize; x++) {
      newCells[x] = [];
      for (let y = 0; y < gridSize; y++) {
        const tileData = inputs.find(i => i.x === x && i.y === y);
        const val = parseInt(tileData.tile.textContent, 10);
        newCells[x][y] = isNaN(val) ? null : { position: { x, y }, value: val };
      }
    }

    const newState = {
      ...gameState,
      grid: { ...gameState.grid, cells: newCells },
      score: parseInt(scoreInput.value, 10) || 0,
    };

    localStorage.setItem("gameState", JSON.stringify(newState));
    localStorage.setItem("bestScore", bestScoreInput.value || "0");
    location.reload();
  };

  const closeBtn = document.createElement("button");
  closeBtn.textContent = "閉じる";
  closeBtn.classList.add("custom-button");
  closeBtn.onclick = () => {
    editor.parentNode.removeChild(editor);
  };

  footer.append(closeBtn, saveBtn);
  editor.append(content, footer);
  document.body.appendChild(editor);

  // モード切替関数
  function switchToEditor() {
    mainMenu.style.opacity = "0";
    setTimeout(() => {
      mainMenu.style.display = "none";
      tileEditor.style.display = "block";
      setTimeout(() => tileEditor.style.opacity = "1", 10);
    }, 200);
    backBtn.style.display = "inline-block";
    title.textContent = "タイル編集";
  }

  function switchToMain() {
    tileEditor.style.opacity = "0";
    setTimeout(() => {
      tileEditor.style.display = "none";
      mainMenu.style.display = "block";
      setTimeout(() => mainMenu.style.opacity = "1", 10);
    }, 200);
    backBtn.style.display = "none";
    title.textContent = "編集メニュー（ドラッグ移動可）";
  }

  // モバイル用ドラッグ処理
  let startX = 0, startY = 0, origX = 0, origY = 0;
  header.addEventListener("touchstart", (e) => {
    const t = e.touches[0];
    startX = t.clientX;
    startY = t.clientY;
    origX = editor.offsetLeft;
    origY = editor.offsetTop;
  });

  header.addEventListener("touchmove", (e) => {
    const t = e.touches[0];
    editor.style.left = `${origX + (t.clientX - startX)}px`;
    editor.style.top = `${origY + (t.clientY - startY)}px`;
  });
})();
