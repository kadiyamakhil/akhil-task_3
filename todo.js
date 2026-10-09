const STORAGE_KEY = "thiranex-task3-todos";

let todos = loadTodos();
let currentFilter = "all";

const form = document.querySelector("#todo-form");
const input = document.querySelector("#todo-input");
const list = document.querySelector("#todo-list");
const emptyState = document.querySelector("#empty-state");
const remainingCount = document.querySelector("#remaining-count");
const totalCount = document.querySelector("#total-count");
const clearCompleted = document.querySelector("#clear-completed");
const clearAll = document.querySelector("#clear-all");
const filters = document.querySelector(".filters");

function loadTodos() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function createTodo(text) {
  return {
    id: Date.now() + Math.random(),
    text: text.trim(),
    completed: false
  };
}

function filteredTodos() {
  if (currentFilter === "active") return todos.filter(todo => !todo.completed);
  if (currentFilter === "completed") return todos.filter(todo => todo.completed);
  return todos;
}

function render() {
  list.innerHTML = "";

  const visible = filteredTodos();

  visible.forEach(todo => {
    const li = document.createElement("li");
    li.className = `todo-item ${todo.completed ? "completed" : ""}`;
    li.dataset.id = todo.id;

    li.innerHTML = `
      <input class="check" type="checkbox"
             aria-label="Mark task completed"
             ${todo.completed ? "checked" : ""}>
      <span class="todo-text"></span>
      <div class="item-actions">
        <button type="button" class="edit" aria-label="Edit task">Edit</button>
        <button type="button" class="delete" aria-label="Delete task">Delete</button>
      </div>
    `;

    li.querySelector(".todo-text").textContent = todo.text;
    list.appendChild(li);
  });

  const active = todos.filter(todo => !todo.completed).length;
  remainingCount.textContent = active;
  totalCount.textContent = `${todos.length} ${todos.length === 1 ? "task" : "tasks"}`;

  emptyState.classList.toggle("hidden", visible.length !== 0);
  document.querySelectorAll(".filter").forEach(button => {
    button.classList.toggle("active", button.dataset.filter === currentFilter);
  });
}

form.addEventListener("submit", event => {
  event.preventDefault();

  const text = input.value.trim();
  if (!text) return;

  todos.unshift(createTodo(text));
  saveTodos();
  render();

  input.value = "";
  input.focus();
});

filters.addEventListener("click", event => {
  const button = event.target.closest(".filter");
  if (!button) return;

  currentFilter = button.dataset.filter;
  render();
});

list.addEventListener("change", event => {
  if (!event.target.classList.contains("check")) return;

  const item = event.target.closest(".todo-item");
  const todo = todos.find(t => String(t.id) === item.dataset.id);

  if (todo) {
    todo.completed = event.target.checked;
    saveTodos();
    render();
  }
});

list.addEventListener("click", event => {
  const item = event.target.closest(".todo-item");
  if (!item) return;

  const id = item.dataset.id;
  const todo = todos.find(t => String(t.id) === id);

  if (event.target.closest(".delete")) {
    todos = todos.filter(t => String(t.id) !== id);
    saveTodos();
    render();
    return;
  }

  if (event.target.closest(".edit")) {
    startEdit(item, todo);
  }

  if (event.target.closest(".save-edit")) {
    finishEdit(item, todo);
  }

  if (event.target.closest(".cancel-edit")) {
    render();
  }
});

function startEdit(item, todo) {
  if (!todo) return;

  const text = item.querySelector(".todo-text");
  const actions = item.querySelector(".item-actions");

  const editInput = document.createElement("input");
  editInput.className = "edit-input";
  editInput.value = todo.text;
  editInput.maxLength = 120;
  editInput.setAttribute("aria-label", "Edit task");

  text.replaceWith(editInput);

  actions.innerHTML = `
    <button type="button" class="save-edit">Save</button>
    <button type="button" class="cancel-edit">Cancel</button>
  `;

  editInput.focus();
  editInput.select();

  editInput.addEventListener("keydown", event => {
    if (event.key === "Enter") finishEdit(item, todo);
    if (event.key === "Escape") render();
  });
}

function finishEdit(item, todo) {
  if (!todo) return;

  const editInput = item.querySelector(".edit-input");
  const newText = editInput?.value.trim();

  if (!newText) {
    editInput?.focus();
    return;
  }

  todo.text = newText;
  saveTodos();
  render();
}

clearCompleted.addEventListener("click", () => {
  todos = todos.filter(todo => !todo.completed);
  saveTodos();
  render();
});

clearAll.addEventListener("click", () => {
  if (todos.length === 0) return;

  const confirmed = confirm("Delete all tasks?");
  if (!confirmed) return;

  todos = [];
  saveTodos();
  render();
});

render();
