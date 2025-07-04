let deletedTasks = [];
let currentFilter = 'all';
let tasks = [];
let archivedTasks = [];
let editIndex = null;

function archiveCompleted() {
  const remaining = [];
  tasks.forEach(t => {
    if (t.completed) archivedTasks.push(t);
    else remaining.push(t);
  });
  tasks = remaining;
  saveTasks();
  renderTasks();
}

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
function togglePin(index) {
  tasks[index].pinned = !tasks[index].pinned;
  saveTasks();
  renderTasks();
}
// Add task
function addTask() {
  const text = document.getElementById('taskInput').value.trim();
  const priority = document.getElementById('priorityInput').value;
  const deadline = document.getElementById('deadlineInput').value;
  const tag = document.getElementById('tagInput').value;
  tasks.push({ text, completed: false, priority, deadline, tag, pinned: false });
  tasks.push({ text, completed: false, priority, deadline, tag });

  if (text !== "") {
    tasks.push({ text, completed: false, priority, deadline });
    document.getElementById('taskInput').value = "";
    saveTasks();
    renderTasks();
  }
}
function showUndoButton() {
  document.getElementById('undoBtn').style.display = "inline-block";
  // hide after 5s
  setTimeout(() => {
    document.getElementById('undoBtn').style.display = "none";
  }, 5000);
}
function undoDelete() {
  if (deletedTasks.length > 0) {
    const restored = deletedTasks.pop();
    tasks.push(restored);
    saveTasks();
    renderTasks();
  }
  document.getElementById('undoBtn').style.display = "none";
}

// Toggle complete
function toggleTask(index) {
  tasks[index].completed = !tasks[index].completed;
  saveTasks();
  renderTasks();
}

function deleteTask(index) {
  deletedTasks.push(tasks[index]); // save deleted
  tasks.splice(index, 1);
  saveTasks();
  renderTasks();
  showUndoButton();
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
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  if (searchTerm && !task.text.toLowerCase().includes(searchTerm)) return;
  list.innerHTML = "";
  tasks.forEach((task, index) => {
  if (
    currentFilter === 'active' && task.completed ||
    currentFilter === 'completed' && !task.completed
  ) return;
    const li = document.createElement('li');
    li.className = task.completed ? "completed" : "";
    li.draggable = true;
    li.ondragstart = (e) => e.dataTransfer.setData('text/plain', index);
    li.ondragover = (e) => e.preventDefault();
    li.ondrop = (e) => {
    e.preventDefault();
    const fromIndex = e.dataTransfer.getData('text/plain');
    moveTask(fromIndex, index);
    };
    li.textContent = task.text;
    const textDiv = document.createElement('div');
    textDiv.innerHTML = `<strong>${task.text}</strong><br>
    <small>Priority: ${task.priority} | Due: ${task.deadline || 'N/A'} | Tag: ${task.tag}</small>`;
    textDiv.innerHTML = `<strong>${task.text}</strong><br>
    <small>Priority: ${task.priority} | Due: ${task.deadline || 'N/A'}</small>`;
    li.appendChild(textDiv); 
    li.ondragstart = (e) => {
    e.dataTransfer.setData('text/plain', index);
    li.classList.add('dragging');
};
    li.ondragend = () => {
    li.classList.remove('dragging');
};

   const doneBtn = document.createElement('button');
    doneBtn.textContent = task.completed ? "↩️ Undo" : "✅ Done";
    doneBtn.className = "done-btn";
    doneBtn.onclick = (e) => {
    e.stopPropagation();
    toggleTask(index);
};
    const editBtn = document.createElement('button');
    editBtn.textContent = "✏️ Edit";
    editBtn.className = "edit-btn";
    editBtn.onclick = (e) => {
    e.stopPropagation();
    editTask(index);
};
    li.appendChild(editBtn);

    li.appendChild(doneBtn);

function saveEdit() {
  const newText = document.getElementById('editInput').value.trim();
  if (newText) {
    tasks[editIndex].text = newText;
    saveTasks();
    renderTasks();
    closeModal();
  }
}

function closeModal() {
  document.getElementById('editModal').style.display = "none";
}

}
function moveTask(from, to) {
  from = parseInt(from);
  to = parseInt(to);
  if (from === to) return;

  const task = tasks.splice(from, 1)[0];
  tasks.splice(to, 0, task);
  saveTasks();
  renderTasks();
}

    const delBtn = document.createElement('button');
    delBtn.textContent = "✖";
    delBtn.className = "delete-btn";
    delBtn.onclick = (e) => {
      e.stopPropagation();
      deleteTask(index);
    };

    li.appendChild(delBtn);
    list.appendChild(li);
    const now = new Date();
    const dueDate = task.deadline ? new Date(task.deadline) : null;
    const timeDiff = dueDate ? (dueDate - now) / (1000*60*60*24) : null;
    if (dueDate && timeDiff <= 1 && timeDiff >= 0 && !task.completed) {
    li.classList.add('due-soon');
}

    updateProgress();
    function updateProgress() {
  if (tasks.length === 0) {
    document.getElementById('progressBar').style.width = "0%";
    return;
  }
    const done = tasks.filter(t => t.completed).length;
  const percent = (done / tasks.length) * 100;
  document.getElementById('progressBar').style.width = percent + "%";
  document.getElementById('statTotal').textContent = tasks.length;

}
  });
  document.getElementById('statTotal').textContent = tasks.length;
    const done = tasks.filter(t => t.completed).length;
    document.getElementById('statDone').textContent = done;
    document.getElementById('statActive').textContent = tasks.length - done;
}
function sortTasks(type) {
  if (type === 'priority') {
    const order = { high: 1, medium: 2, low: 3 };
    tasks.sort((a,b) => order[a.priority] - order[b.priority]);
  } else if (type === 'deadline') {
    tasks.sort((a,b) => {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline) - new Date(b.deadline);
    });
  }
  saveTasks();
  renderTasks();
}
const pinBtn = document.createElement('button');
pinBtn.textContent = task.pinned ? "📌 Unpin" : "📌 Pin";
pinBtn.className = "pin-btn";
pinBtn.onclick = (e) => {
  e.stopPropagation();
  togglePin(index);
};
li.appendChild(pinBtn);

function exportTasks() {
  const data = JSON.stringify(tasks, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = "tasks.json";
  a.click();

  URL.revokeObjectURL(url);
}

function importTasks(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (Array.isArray(imported)) {
        tasks = imported;
        saveTasks();
        renderTasks();
      } else {
        alert("Invalid file format!");
      }
    } catch (err) {
      alert("Failed to load file!");
    }
  };
  reader.readAsText(file);
}
   tasks
  .slice() // copy to avoid mutating
  .sort((a,b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))
  .forEach((task, index) => {
});
loadTasks();
