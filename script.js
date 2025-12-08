
// ---- Авторизація ----
function checkCode() {
    const correctCode = "7739";
    const input = document.getElementById("codeInput").value;
    const error = document.getElementById("errorMsg");
    const loginBox = document.getElementById("loginBox");
    const beep = document.getElementById("beepSound");

    if (input === correctCode) {
        window.location.href = "home.html";
    } else {
        error.style.display = "block";

        beep.currentTime = 0;
        beep.play();

        loginBox.style.animation = "shake 0.4s";
        setTimeout(() => loginBox.style.animation = "", 400);
    }
}

function toggleCode() {
    const input = document.getElementById("codeInput");
    input.type = (input.type === "password") ? "text" : "password";
}


// ---- Скопіювати таблицю ----
function copyTable() {
    let table = document.getElementById("productsTable");
    let rows = table.rows;

    let output = "";

    for (let i = 0; i < rows.length; i++) {
        let cells = rows[i].cells;
        let rowText = [];

        for (let j = 0; j < cells.length; j++) {
            rowText.push(cells[j].innerText);
        }

        output += rowText.join("\t") + "\n"; 
    }

    navigator.clipboard.writeText(output).then(() => {
        const status = document.getElementById("copyStatus");
        status.style.display = "block";
        setTimeout(() => status.style.display = "none", 1500);
    });
}
