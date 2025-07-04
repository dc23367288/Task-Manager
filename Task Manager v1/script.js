let currentFilter = 'all';
let tasks = [];

function setFilter(filter) {
  currentFilter = filter;
  renderTasks();
}

// Load tasks from localStorage
function loadTasks() {
  const saved = localStorage.getItem('tasks');
  if (saved) {
    tasks = JSON.parse(saved);
  }
  renderTasks();
}

// Save to localStorage
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Add task
function addTask() {
  const text = document.getElementById('taskInput').value.trim();
  const priority = document.getElementById('priorityInput').value;
  const deadline = document.getElementById('deadlineInput').value;

  if (text !== "") {
    tasks.push({ text, completed: false, priority, deadline });
    document.getElementById('taskInput').value = "";
    saveTasks();
    renderTasks();
  }
}

// Toggle complete
function toggleTask(index) {
  tasks[index].completed = !tasks[index].completed;
  saveTasks();
  renderTasks();
}

// Delete task
function deleteTask(index) {
  tasks.splice(index, 1);
  saveTasks();
  renderTasks();
}
function toggleDarkMode() {
  document.body.classList.toggle("dark");
  // Remember choice in localStorage
  if (document.body.classList.contains("dark")) {
    localStorage.setItem("darkMode", "true");
  } else {
    localStorage.setItem("darkMode", "false");
  }
}
document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);

// Load preference on page load:
if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark");
}

// Render to HTML
function renderTasks() {
  const list = document.getElementById('taskList');
  list.innerHTML = "";
  tasks.forEach((task, index) => {
  if (
    currentFilter === 'active' && task.completed ||
    currentFilter === 'completed' && !task.completed
  ) return;
    const li = document.createElement('li');
    li.className = task.completed ? "completed" : "";
    li.textContent = task.text;
    const info = document.createElement('small');
    info.textContent = `Priority: ${task.priority} | Due: ${task.deadline || 'N/A'}`;
    li.appendChild(info);
    li.onclick = () => toggleTask(index);

    const delBtn = document.createElement('button');
    delBtn.textContent = "✖";
    delBtn.className = "delete-btn";
    delBtn.onclick = (e) => {
      e.stopPropagation();
      deleteTask(index);
    };

    li.appendChild(delBtn);
    list.appendChild(li);
  });
}
loadTasks();
