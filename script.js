// ==========================================
// PROTASK - VANILLA JAVASCRIPT TO-DO LIST
// ==========================================

// DOM Element References
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const totalCount = document.getElementById('totalCount');
const completedCount = document.getElementById('completedCount');
const emptyState = document.getElementById('emptyState');
const filterBtns = document.querySelectorAll('.filter-btn');

// State Management: Load tasks from localStorage or initialize empty array
let tasks = JSON.parse(localStorage.getItem('protasks')) || [];
let currentFilter = 'all';

// Event Listeners Initialization
document.addEventListener('DOMContentLoaded', () => {
    renderTasks();
    
    // Add task on button click
    addTaskBtn.addEventListener('click', handleAddTask);

    // Add task on pressing 'Enter' key inside input field
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleAddTask();
        }
    });

    // Filter button event listeners
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.getAttribute('data-filter');
            renderTasks();
        });
    });
});

// 1. Add Task Handler
function handleAddTask() {
    const text = taskInput.value.trim();

    // Input validation: check if empty
    if (text === '') {
        alert('Please enter a valid task!');
        taskInput.focus();
        return;
    }

    // Create new task object
    const newTask = {
        id: Date.now(), // Unique ID using timestamp
        text: text,
        completed: false
    };

    // Push to tasks array and save
    tasks.push(newTask);
    saveAndRender();

    // Clear input field and refocus
    taskInput.value = '';
    taskInput.focus();
}

// 2. Toggle Task Completion Status
function toggleTaskStatus(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            return { ...task, completed: !task.completed };
        }
        return task;
    });
    saveAndRender();
}

// 3. Edit Existing Task
function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const newText = prompt('Edit your task:', task.text);
    
    if (newText !== null) {
        const trimmedText = newText.trim();
        if (trimmedText === '') {
            alert('Task description cannot be empty!');
            return;
        }
        tasks = tasks.map(t => {
            if (t.id === id) {
                return { ...t, text: trimmedText };
            }
            return t;
        });
        saveAndRender();
    }
}

// 4. Delete Individual Task
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveAndRender();
}

// 5. Save to LocalStorage and Re-render UI
function saveAndRender() {
    localStorage.setItem('protasks', JSON.stringify(tasks));
    renderTasks();
}

// 6. Render Tasks to DOM based on Filters & State
function renderTasks() {
    // Clear current list DOM
    taskList.innerHTML = '';

    // Filter tasks based on active filter
    let filteredTasks = tasks;
    if (currentFilter === 'active') {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    }

    // Handle Empty State visibility
    if (filteredTasks.length === 0) {
        emptyState.style.display = 'block';
    } else {
        emptyState.style.display = 'none';
    }

    // Populate task items
    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;

        li.innerHTML = `
            <div class="task-content">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTaskStatus(${task.id})">
                <span class="task-text">${escapeHTML(task.text)}</span>
            </div>
            <div class="task-actions">
                <button class="action-btn edit-btn" title="Edit Task" onclick="editTask(${task.id})">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button class="action-btn delete-btn" title="Delete Task" onclick="deleteTask(${task.id})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;

        taskList.appendChild(li);
    });

    // Update Statistics Counter
    updateStats();
}

// 7. Update Total & Completed Task Counts
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;

    totalCount.textContent = total;
    completedCount.textContent = completed;
}

// Security Helper: Prevent XSS injection in user task text
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}
