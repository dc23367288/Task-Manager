// Ralph’s Ultra To‑Do QUEEN script.js 👑

let tasks = [], archivedTasks = [], lastDeleted = null, ralphMood = 50;

// ----------------- LOAD & SAVE -----------------
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
  localStorage.setItem('archived', JSON.stringify(archivedTasks));
}
function loadTasks() {
  tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
  archivedTasks = JSON.parse(localStorage.getItem('archived') || '[]');
  renderTasks();
}
loadTasks();

// ----------------- ADD TASK -----------------
function addTask(){
  let text = document.getElementById('taskInput').value;
  let priority = document.getElementById('priorityInput').value;
  let deadline = document.getElementById('deadlineInput').value;
  let tag = document.getElementById('tagInput').value;
  let desc = document.getElementById('descInput').value;
  let recurring = document.getElementById('recurringInput').checked;

  tasks.push({ text, completed:false, priority, deadline, tag, pinned:false, desc, recurring });
  saveTasks(); renderTasks();
}

// ----------------- RENDER TASKS -----------------
function renderTasks(){
  let list = document.getElementById('taskList');
  list.innerHTML = '';

  let search = document.getElementById('searchInput').value.toLowerCase();
  let selectedTags = Array.from(document.getElementById('tagFilter').selectedOptions).map(o=>o.value);

  tasks.forEach((t, i) => {
    if(search && !t.text.toLowerCase().includes(search)) return;
    if(selectedTags.length && !selectedTags.includes(t.tag)) return;

    let li = document.createElement('li');
    li.textContent = t.text + (t.completed ? " ✅" : "");
    li.onclick = () => toggleTask(i);
    li.ondblclick = () => editTask(i);
    list.appendChild(li);
  });

  document.getElementById('statTotal').textContent = tasks.length;
  document.getElementById('statDone').textContent = tasks.filter(t=>t.completed).length;
  document.getElementById('statActive').textContent = tasks.filter(t=>!t.completed).length;
  updateProgress();
}

// ----------------- TOGGLE TASK -----------------
function toggleTask(i){
  tasks[i].completed = !tasks[i].completed;
  lastDeleted = tasks[i];
  ralphMood += tasks[i].completed ? 5 : -5;
  updateRalph();
  saveTasks(); renderTasks();
}

// ----------------- EDIT TASK -----------------
let editIndex = null;
function editTask(i){
  editIndex = i;
  document.getElementById('editInput').value = tasks[i].text;
  document.getElementById('editModal').style.display='block';
}
function saveEdit(){
  tasks[editIndex].text = document.getElementById('editInput').value;
  closeModal();
  saveTasks(); renderTasks();
}
function closeModal(){
  document.getElementById('editModal').style.display='none';
}

// ----------------- DELETE / ARCHIVE -----------------
function archiveCompleted(){
  let done = tasks.filter(t=>t.completed);
  archivedTasks.push(...done);
  tasks = tasks.filter(t=>!t.completed);
  saveTasks(); renderTasks();
}
function toggleArchive(){
  let el = document.getElementById('archiveList');
  el.style.display = el.style.display==='none' ? 'block' : 'none';
  renderArchive();
}
function renderArchive(){
  let el = document.getElementById('archiveList');
  el.innerHTML = '';
  archivedTasks.forEach(t => {
    let li = document.createElement('li');
    li.textContent = t.text + " (archived)";
    el.appendChild(li);
  });
}

// ----------------- UNDO -----------------
function undoDelete(){
  if(lastDeleted) tasks.push(lastDeleted);
  lastDeleted = null;
  saveTasks(); renderTasks();
}

// ----------------- EXPORT / IMPORT -----------------
function exportTasks(){
  let data = JSON.stringify(tasks);
  let blob = new Blob([data],{type:"application/json"});
  let a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = "tasks.json";
  a.click();
}
function importTasks(){
  let file = document.getElementById('importFile').files[0];
  let reader = new FileReader();
  reader.onload = ()=>{ tasks = JSON.parse(reader.result); saveTasks(); renderTasks(); }
  reader.readAsText(file);
}

// ----------------- THEMES -----------------
function setTheme(theme){
  document.body.className = 'theme-'+theme;
  localStorage.setItem('theme', theme);
}
if(localStorage.getItem('theme')) setTheme(localStorage.getItem('theme'));

// ----------------- RALPH MOOD -----------------
function updateRalph(){
  document.getElementById('title').textContent = ralphMood>60 ? "🐶😄 Ralph" : "🐶😐 Ralph";
}

// ----------------- AI CHAT -----------------
async function askAI(){
  let q = document.getElementById('aiInput').value;
  const res = await fetch("https://api.openai.com/v1/chat/completions",{
    method:"POST",
    headers: { "Content-Type":"application/json","Authorization":"Bearer YOUR_OPENAI_KEY"},
    body: JSON.stringify({ model:"gpt-4o-mini", messages:[{role:"user",content:q}] })
  });
  let data = await res.json();
  document.getElementById('aiResponse').textContent = data.choices[0].message.content;
}

// ----------------- SORT -----------------
function sortTasks(by){
  tasks.sort((a,b)=>{
    if(by==='priority') return a.priority.localeCompare(b.priority);
    if(by==='deadline') return new Date(a.deadline)-new Date(b.deadline);
  });
  renderTasks();
}

// ----------------- PROGRESS BAR -----------------
function updateProgress(){
  let done = tasks.filter(t=>t.completed).length;
  let total = tasks.length;
  let percent = total ? (done/total)*100 : 0;
  document.getElementById('progressBar').style.width=percent+'%';
}

// ----------------- CLEAR COMPLETED -----------------
function clearCompleted(){
  tasks = tasks.filter(t=>!t.completed);
  saveTasks(); renderTasks();
}

// ----------------- INIT -----------------
renderTasks();
