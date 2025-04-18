(function () {
  function waitForGameState(callback) {
    const interval = setInterval(() => {
      const gameState = JSON.parse(localStorage.getItem("gameState"));
      if (gameState) {
        clearInterval(interval);
        callback(gameState);
      }
    }, 200);
  }

  waitForGameState((gameState) => {
    const bestScore = parseInt(localStorage.getItem("bestScore")) || 0;
    const gridSize = gameState.grid.size;

    const style = document.createElement("style");
    style.textContent = `
.editor-modal { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: scale(.95); } to { opacity: 1; transform: scale(1); } }
.back-arrow { background: none; border: none; font-size: 20px; color: #1A73E8; cursor: pointer; padding: 0; line-height: 1; }
.editor-transition { transition: all 0.3s ease; }
.custom-button { padding: 10px 20px; font-size: 16px; background: #1A73E8; color: #fff; border: none; border-radius: 3px; cursor: pointer; transition: background 0.2s; }
.custom-button:hover { background: #1558b0; }
.editor-icon { position: fixed; bottom: 960px; right: 400px; background: #1A73E8; color: #fff; font-size: 24px; padding: 10px; border-radius: 50%; cursor: pointer; z-index: 9998; }
    `;
    document.head.appendChild(style);

    const editor = document.createElement("div");
    editor.classList.add("editor-modal");
    editor.style.position = "fixed";
    editor.style.top = "20px";
    editor.style.left = "20px";
    editor.style.zIndex = "99999";
    editor.style.width = "420px";
    editor.style.height = "520px";
    editor.style.background = "white";
    editor.style.border = "1px solid black";
    editor.style.boxShadow = "0 0 10px rgba(0,0,0,0.3)";
    editor.style.borderRadius = "6px";
    editor.style.display = "flex";
    editor.style.flexDirection = "column";
    editor.style.overflow = "hidden";

    const header = document.createElement("div");
    header.style.cursor = "grab";
    header.style.padding = "10px 20px";
    header.style.background = "#f0f0f0";
    header.style.borderBottom = "1px solid #ccc";
    header.style.userSelect = "none";
    header.style.display = "flex";
    header.style.alignItems = "center";
    header.style.gap = "8px";
    header.style.height = "48px";

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

    const content = document.createElement("div");
    content.style.flex = "1";
    content.style.overflowY = "auto";
    content.style.padding = "10px";

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

    mainMenu.appendChild(scoreLabel);
    mainMenu.appendChild(scoreInput);
    mainMenu.appendChild(bestLabel);
    mainMenu.appendChild(bestScoreInput);
    mainMenu.appendChild(tileEditBtn);
    content.appendChild(mainMenu);

    const tileEditor = document.createElement("div");
    tileEditor.style.display = "none";
    tileEditor.classList.add("editor-transition");

    const tileGrid = document.createElement("div");
    tileGrid.style.display = "grid";
    tileGrid.style.gridTemplateColumns = `repeat(${gridSize}, 60px)`;
    tileGrid.style.gridGap = "5px";
    tileGrid.style.marginBottom = "10px";

    const inputs = [];
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const cell = gameState.grid.cells[x][y];
        const value = cell ? cell.value : "";
        const tile = document.createElement("div");
        tile.contentEditable = true;
        tile.style.width = "60px";
        tile.style.height = "60px";
        tile.style.lineHeight = "60px";
        tile.style.textAlign = "center";
        tile.style.fontSize = "20px";
        tile.style.borderRadius = "6px";
        tile.style.border = "1px solid #ccc";
        tile.style.background = value ? "#eee4da" : "#ccc";
        tile.style.color = "#333";
        tile.textContent = value;
        tile.addEventListener("input", () => {
          const newVal = parseInt(tile.textContent);
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
      inputs.forEach((i) => {
        i.tile.textContent = "";
        i.tile.style.background = "#ccc";
      });
    };
    resetBtn.classList.add("custom-button");

    tileEditor.appendChild(tileGrid);
    tileEditor.appendChild(resetBtn);
    content.appendChild(tileEditor);

    const footer = document.createElement("div");
    footer.style.borderTop = "1px solid #ccc";
    footer.style.padding = "10px";
    footer.style.background = "#fff";
    footer.style.display = "flex";
    footer.style.justifyContent = "space-between";

    const saveBtn = document.createElement("button");
    saveBtn.textContent = "保存してリロード";
    saveBtn.onclick = () => {
      const newCells = [];
      for (let x = 0; x < gridSize; x++) {
        newCells[x] = [];
        for (let y = 0; y < gridSize; y++) {
          const tileData = inputs.find((i) => i.x === x && i.y === y);
          const val = parseInt(tileData.tile.textContent);
          newCells[x][y] = isNaN(val)
            ? null
            : { position: { x, y }, value: val };
        }
      }
      const newState = {
        ...gameState,
        grid: { ...gameState.grid, cells: newCells },
        score: parseInt(scoreInput.value) || 0,
      };
      localStorage.setItem("gameState", JSON.stringify(newState));
      localStorage.setItem("bestScore", bestScoreInput.value || "0");
      location.reload();
    };
    saveBtn.classList.add("custom-button");

    const closeBtn = document.createElement("button");
    closeBtn.textContent = "閉じる";
    closeBtn.onclick = () => {
      editor.style.display = "none";
      editorIcon.style.display = "inline-block"; // アイコンを表示
    };
    closeBtn.classList.add("custom-button");

    footer.appendChild(closeBtn);
    footer.appendChild(saveBtn);
    editor.appendChild(content);
    editor.appendChild(footer);
    document.body.appendChild(editor);

    // アイコン
    const editorIcon = document.createElement("div");
    editorIcon.classList.add("editor-icon");
    editorIcon.textContent = "⚙️";
    editorIcon.style.boxShadow = "0 5px 10px rgba(0,0,0,0.4)";
    editorIcon.onclick = () => {
      editor.style.display = "flex";
      editorIcon.style.display = "none"; // アイコンを非表示にする
    };
    document.body.appendChild(editorIcon);

    function switchToEditor() {
      mainMenu.style.opacity = "0";
      setTimeout(() => {
        mainMenu.style.display = "none";
        tileEditor.style.display = "block";
        setTimeout(() => (tileEditor.style.opacity = "1"), 10);
      }, 200);
      backBtn.style.display = "inline-block";
      title.textContent = "タイル編集";
    }

    function switchToMain() {
      tileEditor.style.opacity = "0";
      setTimeout(() => {
        tileEditor.style.display = "none";
        mainMenu.style.display = "block";
        setTimeout(() => (mainMenu.style.opacity = "1"), 10);
      }, 200);
      backBtn.style.display = "none";
      title.textContent = "編集メニュー（ドラッグ移動可）";
    }

    // モバイル向け移動処理
    let startX = 0,
      startY = 0,
      origX = 0,
      origY = 0;
    header.addEventListener("touchstart", (e) => {
      const t = e.touches[0];
      startX = t.clientX;
      startY = t.clientY;
      origX = editor.offsetLeft;
      origY = editor.offsetTop;
    });

    header.addEventListener("touchmove", (e) => {
      const t = e.touches[0];
      const deltaX = t.clientX - startX;
      const deltaY = t.clientY - startY;

      editor.style.left = `${origX + deltaX}px`;
      editor.style.top = `${origY + deltaY}px`;
    });

    header.addEventListener("touchend", (e) => {
      origX = editor.offsetLeft;
      origY = editor.offsetTop;
    });

    // デスクトップ向け移動処理
    header.addEventListener("mousedown", (e) => {
      e.preventDefault();
      startX = e.clientX;
      startY = e.clientY;
      origX = editor.offsetLeft;
      origY = editor.offsetTop;

      const onMouseMove = (e) => {
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        editor.style.left = `${origX + deltaX}px`;
        editor.style.top = `${origY + deltaY}px`;
      };

      const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    });
  });
})();
