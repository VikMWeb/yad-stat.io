// ---- Авторизація ----
function checkCode() {
    const correctCode = "7739";
    const input = document.getElementById("codeInput").value;
    const error = document.getElementById("errorMsg");
    const loginBox = document.getElementById("loginBox");
    const beep = document.getElementById("beepSound");

    if (input === correctCode) {
        // Доступ дозволено – позначаємо в localStorage
        localStorage.setItem("yadStatAccess", "ok");
        window.location.href = "home.html";
    } else {
        error.style.display = "block";

        if (beep) {
            beep.currentTime = 0;
            beep.play();
        }

        if (loginBox) {
            loginBox.style.animation = "shake 0.4s";
            setTimeout(() => loginBox.style.animation = "", 400);
        }
    }
}

function toggleCode() {
    const input = document.getElementById("codeInput");
    if (!input) return;
    input.type = (input.type === "password") ? "text" : "password";
}


// ---- Логіка таблиці ----

document.addEventListener("DOMContentLoaded", () => {
    const table = document.getElementById("productsTable");
    if (table) {
        initTablePage();
    }
});

function initTablePage() {
    // Перевірка доступу (якщо зайшли напряму на home.html)
    const access = localStorage.getItem("yadStatAccess");
    if (access !== "ok") {
        window.location.href = "index.html";
        return;
    }

    loadTableFromStorage();
    recalcAll();

    const tbody = document.getElementById("productsBody");
    if (tbody) {
        // Будь-яка зміна в інпутах → перерахунок + збереження
        tbody.addEventListener("input", (e) => {
            if (e.target.tagName === "INPUT") {
                recalcAll();
                saveTableToStorage();
            }
        });
    }
}

function createRow(item) {
    const tr = document.createElement("tr");

    // Назва
    let tdName = document.createElement("td");
    let nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.className = "name-input";
    nameInput.value = item.name || "";
    tdName.appendChild(nameInput);
    tr.appendChild(tdName);

    // Склад
    let tdStock = document.createElement("td");
    let stockInput = document.createElement("input");
    stockInput.type = "number";
    stockInput.min = "0";
    stockInput.className = "stock-input";
    stockInput.value = item.stock != null ? item.stock : "";
    tdStock.appendChild(stockInput);
    tr.appendChild(tdStock);

    // Продано + дні
    const soldArr = item.sold || [];
    const totalSoldInputs = 8; // 13 неділя + 7 днів тижня

    for (let i = 0; i < totalSoldInputs; i++) {
        let td = document.createElement("td");
        let input = document.createElement("input");
        input.type = "number";
        input.min = "0";
        input.className = "sold-input";
        input.value = soldArr[i] != null ? soldArr[i] : "";
        td.appendChild(input);
        tr.appendChild(td);
    }

    // Залишок
    let tdRem = document.createElement("td");
    tdRem.className = "remaining-cell";
    tr.appendChild(tdRem);

    // Відсоток
    let tdPerc = document.createElement("td");
    tdPerc.className = "percent-cell";
    tr.appendChild(tdPerc);

    return tr;
}

function getTableData() {
    const rows = document.querySelectorAll("#productsBody tr");
    let data = [];

    rows.forEach(row => {
        const nameInput = row.querySelector(".name-input");
        const stockInput = row.querySelector(".stock-input");
        const soldInputs = row.querySelectorAll(".sold-input");

        const name = nameInput ? nameInput.value.trim() : "";
        const stock = stockInput ? Number(stockInput.value) || 0 : 0;
        const sold = Array.from(soldInputs).map(inp => Number(inp.value) || 0);

        data.push({ name, stock, sold });
    });

    return data;
}

function saveTableToStorage() {
    const table = document.getElementById("productsTable");
    if (!table) return;
    const data = getTableData();
    localStorage.setItem("yadStatTable", JSON.stringify(data));
}

function loadTableFromStorage() {
    const tbody = document.getElementById("productsBody");
    if (!tbody) return;

    const saved = localStorage.getItem("yadStatTable");
    if (saved) {
        const data = JSON.parse(saved);
        tbody.innerHTML = "";
        data.forEach(item => {
            tbody.appendChild(createRow(item));
        });
    } else {
        // Якщо нічого не збережено – беремо вже наявні рядки і приводимо до єдиного формату
        const rows = Array.from(tbody.querySelectorAll("tr"));
        const initialData = rows.map(row => {
            const cells = row.querySelectorAll("td");
            // очікуємо структуру як у home.html (name, stock, sold..., rem, %)
            const name = cells[0]?.querySelector("input")?.value || "";
            const stock = Number(cells[1]?.querySelector("input")?.value) || 0;
            const soldInputs = row.querySelectorAll(".sold-input");
            const sold = Array.from(soldInputs).map(inp => Number(inp.value) || 0);
            return { name, stock, sold };
        });

        tbody.innerHTML = "";
        initialData.forEach(item => {
            tbody.appendChild(createRow(item));
        });
    }
}

// Перерахунок залишків та %
function recalcAll() {
    const rows = document.querySelectorAll("#productsBody tr");
    rows.forEach(row => {
        const stockInput = row.querySelector(".stock-input");
        const soldInputs = row.querySelectorAll(".sold-input");
        const remCell = row.querySelector(".remaining-cell");
        const percCell = row.querySelector(".percent-cell");

        const stock = stockInput ? Number(stockInput.value) || 0 : 0;
        let totalSold = 0;
        soldInputs.forEach(inp => {
            totalSold += Number(inp.value) || 0;
        });

        const remaining = stock - totalSold;
        const percent = stock > 0 ? Math.round((totalSold / stock) * 100) : 0;

        if (remCell) remCell.textContent = remaining;
        if (percCell) percCell.textContent = percent;
    });
}

// Додати новий товар
function addProduct() {
    const nameEl = document.getElementById("newName");
    const stockEl = document.getElementById("newStock");
    const tbody = document.getElementById("productsBody");

    if (!nameEl || !stockEl || !tbody) return;

    const name = nameEl.value.trim();
    const stock = Number(stockEl.value) || 0;

    if (!name) {
        alert("Введіть назву товару");
        return;
    }

    const item = {
        name,
        stock,
        sold: [0, 0, 0, 0, 0, 0, 0, 0] // 13 нд. + Пн–Нд
    };

    const row = createRow(item);
    tbody.appendChild(row);

    nameEl.value = "";
    stockEl.value = "";

    recalcAll();
    saveTableToStorage();
}


// ---- Копіювання таблиці в буфер ----
function copyTable() {
    const table = document.getElementById("productsTable");
    if (!table) return;

    let output = "";
    const rows = table.querySelectorAll("tr");

    rows.forEach(row => {
        const cells = row.querySelectorAll("th, td");
        let rowText = [];
        cells.forEach(cell => {
            const input = cell.querySelector("input");
            const text = input ? input.value : cell.textContent;
            rowText.push(text);
        });
        output += rowText.join("\t") + "\n"; // таби → добре для Excel
    });

    navigator.clipboard.writeText(output).then(() => {
        const status = document.getElementById("copyStatus");
        if (status) {
            status.style.display = "block";
            setTimeout(() => status.style.display = "none", 1500);
        }
    });
}


// ---- Експорт у CSV / Excel ----
function exportCSV() {
    const table = document.getElementById("productsTable");
    if (!table) return;

    let csv = "";
    const rows = table.querySelectorAll("tr");

    rows.forEach(row => {
        const cells = row.querySelectorAll("th, td");
        let rowData = [];
        cells.forEach(cell => {
            const input = cell.querySelector("input");
            const text = input ? input.value : cell.textContent;
            // Екрануємо лапки
            rowData.push('"' + String(text).replace(/"/g, '""') + '"');
        });
        csv += rowData.join(",") + "\n";
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "yad-stat-table.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
