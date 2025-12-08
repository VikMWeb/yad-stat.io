// ---------------------
// Firebase Init
// ---------------------

const firebaseConfig = {
  apiKey: "AIzaSyCckbaw_2lOTihiV5vC6GTbZAXK3xeIX_Q",
  authDomain: "yad-stat.firebaseapp.com",
  databaseURL: "https://yad-stat-default-rtdb.firebaseio.com",
  projectId: "yad-stat",
  storageBucket: "yad-stat.firebasestorage.app",
  messagingSenderId: "286654521426",
  appId: "1:286654521426:web:ee707122f21036a2587f8b",
  measurementId: "G-NE5NWC86LE"
};

// Ініціалізація
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// -------------------------------
// ЗМІННІ
// -------------------------------
let role = ""; // admin / real1 / real2
let tableData = {}; // усі товари

// -------------------------------
// ЗАВАНТАЖЕННЯ ДАНИХ З FIREBASE
// -------------------------------
function loadData(callback) {
  db.ref("products").on("value", (snapshot) => {
    tableData = snapshot.val() || {};
    if (callback) callback();
  });
}

// -------------------------------
// ЗБЕРЕЖЕННЯ ДАНИХ
// -------------------------------
function saveData() {
  db.ref("products").set(tableData);
}

// -------------------------------
// ДОДАТИ НОВИЙ ТОВАР
// -------------------------------
function addProduct(name) {
  name = name.trim();
  if (!name) return;

  tableData[name] = {
    stock: 0,
    real1: [0,0,0,0,0,0,0],
    real2: [0,0,0,0,0,0,0]
  };

  saveData();
  renderTable();
}

// -------------------------------
// ВИДАЛИТИ ТОВАР
// -------------------------------
function deleteProduct(name) {
  delete tableData[name];
  saveData();
  renderTable();
}

// -------------------------------
// ОБРОБКА ЗМІН В КОМІРКАХ
// -------------------------------
function updateValue(product, field, index, value) {

  value = Number(value) || 0;

  if (field === "stock") {
    tableData[product].stock = value;
  } else if (field === "real1") {
    tableData[product].real1[index] = value;
  } else if (field === "real2") {
    tableData[product].real2[index] = value;
  }

  saveData();
  renderTable();
}

// -------------------------------
// ОБЧИСЛЕННЯ ВІДСОТКІВ
// -------------------------------
function calcPercent(product) {
  let stock = tableData[product].stock;

  let sum1 = tableData[product].real1.reduce((a,b)=>a+b,0);
  let sum2 = tableData[product].real2.reduce((a,b)=>a+b,0);

  let total = (role === "admin") ? sum1 + sum2 :
              (role === "real1") ? sum1 : sum2;

  if (stock === 0) return "0%";

  return Math.round((total / stock) * 100) + "%";
}

// -------------------------------
// ВИВЕДЕННЯ ТАБЛИЦІ
// -------------------------------
function renderTable() {
  const container = document.getElementById("table-body");
  if (!container) return;

  container.innerHTML = "";

  Object.keys(tableData).forEach((product) => {
    let item = tableData[product];

    let row = `
      <tr>
        <td>${product}</td>

        <!-- СКЛАД (тільки адмін) -->
        ${
          role === "admin"
            ? `<td><input type="number" value="${item.stock}" onchange="updateValue('${product}','stock',0,this.value)"></td>`
            : `<td>${item.stock}</td>`
        }

        <!-- Дні тижня -->
        ${[0,1,2,3,4,5,6].map(i => {

          if (role === "admin") {
            // адмін бачить підсумки реалізаторів
            return `<td>${item.real1[i] + item.real2[i]}</td>`;
          }

          if (role === "real1") {
            return `<td><input type="number" value="${item.real1[i]}" onchange="updateValue('${product}','real1',${i},this.value)"></td>`;
          }

          if (role === "real2") {
            return `<td><input type="number" value="${item.real2[i]}" onchange="updateValue('${product}','real2',${i},this.value)"></td>`;
          }

        }).join("")}

        <!-- Відсоток -->
        <td>${calcPercent(product)}</td>

        <!-- Видалити товар -->
        ${
          role === "admin"
            ? `<td><button onclick="deleteProduct('${product}')">X</button></td>`
            : ``
        }
      </tr>
    `;

    container.innerHTML += row;
  });
}

// -------------------------------
// КНОПКА "КОПІЮВАТИ"
// -------------------------------
function copyTable() {
  let text = "";
  Object.keys(tableData).forEach(product => {
    text += product + ": ";

    if (role === "admin") {
      let total = tableData[product].real1.reduce((a,b)=>a+b,0)
               + tableData[product].real2.reduce((a,b)=>a+b,0);
      text += total;
    } else if (role === "real1") {
      text += tableData[product].real1.reduce((a,b)=>a+b,0);
    } else {
      text += tableData[product].real2.reduce((a,b)=>a+b,0);
    }

    text += "\n";
  });

  navigator.clipboard.writeText(text);
  alert("Скопійовано!");
}

// -------------------------------
// ВСТАНОВИТИ РОЛЬ
// -------------------------------
function setRole(r) {
  role = r;
  loadData(renderTable);
}
