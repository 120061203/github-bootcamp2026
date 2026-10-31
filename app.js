// 待辦清單的資料存放在 localStorage,key 為 "todos"
const STORAGE_KEY = "todos";
// 深色模式偏好存放在 localStorage,key 為 "theme"
const THEME_KEY = "theme";
// 篩選條件存放在 localStorage,key 為 "filter"
const FILTER_KEY = "filter";

const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
const emptyState = document.getElementById("empty-state");
const remainingCount = document.getElementById("remaining-count");
const themeToggle = document.getElementById("theme-toggle");
const filterBar = document.getElementById("filter-bar");

// 從 localStorage 讀出待辦清單,格式錯誤或不存在時回傳空陣列
function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveTodos(todos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

let todos = loadTodos();
let currentFilter = loadFilter();

function loadFilter() {
  try {
    const saved = localStorage.getItem(FILTER_KEY);
    return saved === "all" || saved === "active" || saved === "completed"
      ? saved
      : "all";
  } catch {
    return "all";
  }
}

function saveFilter(filter) {
  localStorage.setItem(FILTER_KEY, filter);
}

// 套用深色模式:優先用使用者手動存的設定,沒有就跟隨系統設定
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeToggle.textContent =
    theme === "dark" ? "☀️ 淺色模式" : "🌙 深色模式";
}

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "dark" || saved === "light") {
    applyTheme(saved);
    return;
  }
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(prefersDark ? "dark" : "light");
}

function toggleTheme() {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
}

// 依目前篩選條件 (全部/未完成/已完成) 回傳要顯示的項目
function getFilteredTodos() {
  if (currentFilter === "active") return todos.filter((todo) => !todo.completed);
  if (currentFilter === "completed") return todos.filter((todo) => todo.completed);
  return todos;
}

function setFilter(filter) {
  if (filter !== "all" && filter !== "active" && filter !== "completed") {
    filter = "all";
  }

  currentFilter = filter;
  saveFilter(filter);

  [...filterBar.children].forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.filter === filter);
  });
  render();
}

function getEmptyMessage() {
  if (todos.length === 0) {
    return "還沒有任何待辦事項,新增一個吧!";
  }

  if (currentFilter === "active") {
    return "太棒了! 沒有未完成的事項。";
  }

  if (currentFilter === "completed") {
    return "目前沒有已完成的事項。資料還在，只是被當前篩選條件過濾掉了。";
  }

  return "目前沒有符合這個篩選條件的事項。";
}

function render() {
  list.innerHTML = "";

  const visibleTodos = getFilteredTodos();
  emptyState.hidden = visibleTodos.length !== 0;
  emptyState.textContent = getEmptyMessage();

  visibleTodos.forEach((todo) => {
    const item = document.createElement("li");
    item.className = "todo-item" + (todo.completed ? " completed" : "");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.completed;
    checkbox.addEventListener("change", () => toggleTodo(todo.id));

    const text = document.createElement("span");
    text.className = "todo-text";
    text.textContent = todo.text;

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "刪除";
    deleteBtn.addEventListener("click", () => deleteTodo(todo.id));

    item.append(checkbox, text, deleteBtn);
    list.appendChild(item);
  });

  const remaining = todos.filter((todo) => !todo.completed).length;
  remainingCount.textContent = remaining;
}

function addTodo(text) {
  const trimmed = text.trim();
  if (!trimmed) return; // 空白內容不新增

  todos.push({
    id: Date.now().toString(),
    text: trimmed,
    completed: false,
  });

  saveTodos(todos);
  render();
}

function toggleTodo(id) {
  todos = todos.map((todo) =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  );
  saveTodos(todos);
  render();
}

function deleteTodo(id) {
  todos = todos.filter((todo) => todo.id !== id);
  saveTodos(todos);
  render();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  addTodo(input.value);
  input.value = "";
  input.focus();
});

themeToggle.addEventListener("click", toggleTheme);

filterBar.addEventListener("click", (event) => {
  const filter = event.target.dataset.filter;
  if (filter) setFilter(filter);
});

initTheme();
setFilter(currentFilter);
