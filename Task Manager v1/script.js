let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
let deletedTasks = [];
let archivedTasks = [];
let currentFilter = 'all';
let editIndex = null;
let archiveVisible = false;

if ("Notification" in window && Notification.permission !== "granted") {
  Notification.requestPermission();
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function renderTasks() {
  const list = document.getElementById('taskList');
  list.innerHTML = "";
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();

  tasks
    .slice()
    .sort((a,b)=> (b.pinned?1:0)-(a.pinned?1:0))
    .forEach((task, index) => {
    if (
      currentFilter === 'active' && task.completed ||
      currentFilter === 'completed' && !task.completed
    ) return;
    if (searchTerm && !task.text.toLowerCase().includes(searchTerm)) return;

    const li = document.createElement('li');
    li.className = task.completed ? "completed" : "";
    li.draggable = true;

    const now = new Date();
    const dueDate = task.deadline ? new Date(task.deadline) : null;
    const timeDiff = dueDate ? (dueDate - now) / (1000*60*60*24) : null;
    if (dueDate && timeDiff <=1 && timeDiff >=0 && !task.completed) {
      li.classList.add('due-soon');
    }
    if (dueDate && timeDiff <=0.04 && timeDiff >=0 && !task.notified) {
      task.notified = true;
      if(Notification.permission==="granted"){
        new Notification("Task due soon!", { body: task.text });
      }
    }

    li.classList.add("tag-"+task.tag);

    li.ondragstart = (e)=>{ e.dataTransfer.setData('text/plain', index); li.classList.add('dragging'); };
    li.ondragend=()=> li.classList.remove('dragging');
    li.ondragover=(e)=> e.preventDefault();
    li.ondrop=(e)=>{
      e.preventDefault();
      const from = e.dataTransfer.getData('text/plain');
      moveTask(from, index);
    };

    const textDiv=document.createElement('div');
    textDiv.innerHTML=`
      <strong>${task.text}</strong> 
      <span class="badge ${task.priority}">${task.priority}</span><br>
      <small>Due:${task.deadline||'N/A'} | Tag:${task.tag}</small>
      ${task.desc ? `<br><small>${task.desc}</small>` : ''}
    `;
    li.appendChild(textDiv);

    const doneBtn=document.createElement('button');
    doneBtn.textContent=task.completed?"↩️ Undo":"✅ Done";
    doneBtn.className="done-btn";
    doneBtn.onclick=(e)=>{e.stopPropagation();toggleTask(index);};
    li.appendChild(doneBtn);

    const editBtn=document.createElement('button');
    editBtn.textContent="✏️ Edit";
    editBtn.className="edit-btn";
    editBtn.onclick=(e)=>{e.stopPropagation();editTask(index);};
    li.appendChild(editBtn);

    const pinBtn=document.createElement('button');
    pinBtn.textContent=task.pinned?"📌 Unpin":"📌 Pin";
    pinBtn.className="pin-btn";
    pinBtn.onclick=(e)=>{e.stopPropagation();togglePin(index);};
    li.appendChild(pinBtn);

    const delBtn=document.createElement('button');
    delBtn.textContent="✖";
    delBtn.className="delete-btn";
    delBtn.onclick=(e)=>{e.stopPropagation();deleteTask(index);};
    li.appendChild(delBtn);

    list.appendChild(li);
  });

  updateProgress();
  document.getElementById('statTotal').textContent=tasks.length;
  const done=tasks.filter(t=>t.completed).length;
  document.getElementById('statDone').textContent=done;
  document.getElementById('statActive').textContent=tasks.length - done;
}

function renderArchive(){
  const list = document.getElementById('archiveList');
  list.innerHTML = "";
  archivedTasks.forEach((task, index)=>{
    const li = document.createElement('li');
    li.textContent = task.text + " ("+ task.tag +")";
    const restoreBtn = document.createElement('button');
    restoreBtn.textContent = "↩️ Restore";
    restoreBtn.className="restore-btn";
    restoreBtn.onclick = ()=> {
      tasks.push(task);
      archivedTasks.splice(index,1);
      saveTasks();
      renderArchive();
      renderTasks();
    };
    li.appendChild(restoreBtn);
    list.appendChild(li);
  });
}

function toggleArchive(){
  archiveVisible = !archiveVisible;
  document.getElementById('archiveList').style.display = archiveVisible ? "block" : "none";
  renderArchive();
}

function addTask(){
  const text=document.getElementById('taskInput').value.trim();
  const priority=document.getElementById('priorityInput').value;
  const deadline=document.getElementById('deadlineInput').value;
  const tag=document.getElementById('tagInput').value;
  const desc=document.getElementById('descInput').value.trim();
  if(text){
    tasks.push({text, completed:false, priority, deadline, tag, pinned:false, desc});
    document.getElementById('taskInput').value="";
    document.getElementById('descInput').value="";
    saveTasks(); renderTasks();
  }
}
function toggleTask(i){ tasks[i].completed=!tasks[i].completed; saveTasks(); renderTasks();}
function deleteTask(i){ deletedTasks.push(tasks[i]); tasks.splice(i,1); saveTasks(); renderTasks(); showUndoButton();}
function undoDelete(){ if(deletedTasks.length){ tasks.push(deletedTasks.pop()); saveTasks(); renderTasks();} document.getElementById('undoBtn').style.display="none";}
function showUndoButton(){document.getElementById('undoBtn').style.display="inline-block"; setTimeout(()=>document.getElementById('undoBtn').style.display="none",5000);}
function setFilter(f){currentFilter=f; renderTasks();}
function sortTasks(t){
  if(t==='priority'){const o={high:1,medium:2,low:3}; tasks.sort((a,b)=>o[a.priority]-o[b.priority]);}
  else if(t==='deadline'){tasks.sort((a,b)=>(!a.deadline?1:!b.deadline?-1:new Date(a.deadline)-new Date(b.deadline)));}
  saveTasks(); renderTasks();
}
function updateProgress(){
  if(!tasks.length){document.getElementById('progressBar').style.width="0%";return;}
  const done=tasks.filter(t=>t.completed).length;
  document.getElementById('progressBar').style.width=(done/tasks.length*100)+"%";
}
function archiveCompleted(){
  tasks=tasks.filter(t=>{if(t.completed){archivedTasks.push(t);return false;} return true;});
  saveTasks(); renderTasks();
}
function togglePin(i){tasks[i].pinned=!tasks[i].pinned; saveTasks(); renderTasks();}
function moveTask(f,t){f=parseInt(f);t=parseInt(t);if(f===t)return; const task=tasks.splice(f,1)[0]; tasks.splice(t,0,task); saveTasks(); renderTasks();}
function editTask(i){editIndex=i; document.getElementById('editInput').value=tasks[i].text; document.getElementById('editModal').style.display="flex";}
function saveEdit(){
  const newText=document.getElementById('editInput').value.trim();
  if(newText){tasks[editIndex].text=newText; saveTasks(); renderTasks(); closeModal();}
}
function closeModal(){document.getElementById('editModal').style.display="none";}
function toggleDarkMode(){
  document.body.classList.toggle("dark");
  localStorage.setItem("darkMode", document.body.classList.contains("dark"));
}
document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);
if(localStorage.getItem("darkMode")==="true")document.body.classList.add("dark");

renderTasks();
