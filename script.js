document.addEventListener('DOMContentLoaded', () => {
    // --- ESTADO DA APLICAÇÃO ---
    let tasks = JSON.parse(localStorage.getItem('bacanudo_tasks')) || [];
    let currentFilter = 'all';
    let currentSort = 'created';
    let editingTaskId = null;

    // --- ELEMENTOS DO DOM ---
    const taskForm = document.getElementById('taskForm');
    const taskInput = document.getElementById('taskInput');
    const taskDeadline = document.getElementById('taskDeadline');
    const taskList = document.getElementById('taskList');
    const emptyState = document.getElementById('emptyState');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const sortSelect = document.getElementById('sortSelect');
    const counterText = document.getElementById('counterText');
    const clearCompletedBtn = document.getElementById('clearCompletedBtn');
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const toastContainer = document.getElementById('toastContainer');

    // --- TEMAS (Escuro/Claro) ---
    const savedTheme = localStorage.getItem('bacanudo_theme') || 
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    
    setTheme(savedTheme);

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    });

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('bacanudo_theme', theme);
        themeToggleBtn.innerHTML = theme === 'dark' 
            ? '<i class="fa-solid fa-sun"></i>' 
            : '<i class="fa-solid fa-moon"></i>';
    }

    // --- INICIALIZAÇÃO ---
    renderTasks();

    // --- EVENTOS ---
    taskForm.addEventListener('submit', handleAddTask);
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            renderTasks();
        });
    });

    sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        renderTasks();
    });

    clearCompletedBtn.addEventListener('click', () => {
        const count = tasks.filter(t => t.completed).length;
        tasks = tasks.filter(t => !t.completed);
        saveTasks();
        renderTasks();
        showToast(`${count} tarefa(s) concluída(s) removida(s).`, 'success');
    });

    // --- AÇÕES DE TAREFAS ---
    function handleAddTask(e) {
        e.preventDefault();
        const text = taskInput.value.trim();
        const deadline = taskDeadline.value;

        if (!text) {
            showToast('Digite uma descrição para a tarefa.', 'danger');
            return;
        }

        const newTask = {
            id: Date.now().toString(),
            text,
            deadline: deadline || null,
            completed: false,
            createdAt: new Date().toISOString()
        };

        tasks.unshift(newTask);
        saveTasks();
        renderTasks();

        taskInput.value = '';
        taskDeadline.value = '';
        taskInput.focus();
        showToast('Tarefa adicionada com sucesso!', 'success');
    }

    window.toggleTask = function(id) {
        tasks = tasks.map(task => {
            if (task.id === id) {
                const nextState = !task.completed;
                showToast(nextState ? 'Tarefa concluída!' : 'Tarefa reaberta.', 'info');
                return { ...task, completed: nextState };
            }
            return task;
        });
        saveTasks();
        renderTasks();
    };

    window.deleteTask = function(id) {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        renderTasks();
        showToast('Tarefa removida.', 'danger');
    };

    window.enableEdit = function(id) {
        editingTaskId = id;
        renderTasks();
    };

    window.cancelEdit = function() {
        editingTaskId = null;
        renderTasks();
    };

    window.saveEdit = function(id) {
        const textInput = document.getElementById(`edit-text-${id}`);
        const dateInput = document.getElementById(`edit-date-${id}`);

        if (!textInput) return;

        const newText = textInput.value.trim();
        const newDeadline = dateInput ? dateInput.value : null;

        if (!newText) {
            showToast('O texto da tarefa não pode ser vazio.', 'danger');
            return;
        }

        tasks = tasks.map(t => {
            if (t.id === id) {
                return { ...t, text: newText, deadline: newDeadline };
            }
            return t;
        });

        editingTaskId = null;
        saveTasks();
        renderTasks();
        showToast('Tarefa atualizada!', 'success');
    };

    // --- RENDERIZAÇÃO ---
    function renderTasks() {
        // 1. Filtrar
        let filteredTasks = tasks.filter(task => {
            if (currentFilter === 'pending') return !task.completed;
            if (currentFilter === 'completed') return task.completed;
            return true;
        });

        // 2. Ordenar
        filteredTasks.sort((a, b) => {
            if (currentSort === 'deadline') {
                if (!a.deadline) return 1;
                if (!b.deadline) return -1;
                return new Date(a.deadline) - new Date(b.deadline);
            } else {
                return new Date(b.createdAt) - new Date(a.createdAt);
            }
        });

        // 3. Montar DOM
        taskList.innerHTML = '';

        if (filteredTasks.length === 0) {
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.add('hidden');
            filteredTasks.forEach(task => {
                const li = document.createElement('li');
                li.className = `task-item ${task.completed ? 'completed' : ''}`;
                
                const isEditing = task.id === editingTaskId;

                if (isEditing) {
                    li.innerHTML = `
                        <div class="task-left" style="width: 100%;">
                            <div style="flex: 1;">
                                <input type="text" id="edit-text-${task.id}" class="edit-input-text" value="${escapeHtml(task.text)}">
                                <input type="datetime-local" id="edit-date-${task.id}" class="edit-input-date" value="${task.deadline || ''}">
                            </div>
                        </div>
                        <div class="task-actions">
                            <button class="action-btn" onclick="saveEdit('${task.id}')" title="Salvar"><i class="fa-solid fa-check" style="color: var(--success-color);"></i></button>
                            <button class="action-btn" onclick="cancelEdit()" title="Cancelar"><i class="fa-solid fa-xmark"></i></button>
                        </div>
                    `;
                } else {
                    const badgeInfo = getDeadlineBadge(task.deadline, task.completed);

                    li.innerHTML = `
                        <div class="task-left">
                            <input type="checkbox" class="custom-checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask('${task.id}')">
                            <div class="task-content">
                                <span class="task-text">${escapeHtml(task.text)}</span>
                                <div class="task-meta">
                                    ${badgeInfo ? `<span class="badge ${badgeInfo.class}"><i class="${badgeInfo.icon}"></i> ${badgeInfo.text}</span>` : ''}
                                </div>
                            </div>
                        </div>
                        <div class="task-actions">
                            <button class="action-btn" onclick="enableEdit('${task.id}')" title="Editar"><i class="fa-regular fa-pen-to-square"></i></button>
                            <button class="action-btn delete-btn" onclick="deleteTask('${task.id}')" title="Excluir"><i class="fa-regular fa-trash-can"></i></button>
                        </div>
                    `;
                }

                taskList.appendChild(li);
            });
        }

        updateCounters();
    }

    function updateCounters() {
        const total = tasks.length;
        const pending = tasks.filter(t => !t.completed).length;
        const completed = total - pending;

        counterText.textContent = `${pending} restante(s) de ${total} tarefa(s)`;

        if (completed > 0) {
            clearCompletedBtn.classList.remove('hidden');
        } else {
            clearCompletedBtn.classList.add('hidden');
        }
    }

    // --- HELPER DE DATAS ---
    function getDeadlineBadge(deadlineStr, isCompleted) {
        if (!deadlineStr) return null;

        if (isCompleted) {
            return { class: 'badge-done', icon: 'fa-solid fa-check', text: 'Concluído' };
        }

        const now = new Date();
        const deadline = new Date(deadlineStr);
        
        const isToday = now.toDateString() === deadline.toDateString();
        
        const formattedDate = deadline.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        const formattedTime = deadline.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const dateDisplay = `${formattedDate} às ${formattedTime}`;

        if (deadline < now) {
            return { class: 'badge-expired', icon: 'fa-solid fa-triangle-exclamation', text: `Atrasada (${dateDisplay})` };
        } else if (isToday) {
            return { class: 'badge-today', icon: 'fa-regular fa-clock', text: `Hoje às ${formattedTime}` };
        } else {
            return { class: 'badge-upcoming', icon: 'fa-regular fa-calendar-days', text: dateDisplay };
        }
    }

    // --- UTILITÁRIOS ---
    function saveTasks() {
        localStorage.setItem('bacanudo_tasks', JSON.stringify(tasks));
    }

    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let icon = 'fa-circle-info';
        if (type === 'success') icon = 'fa-circle-check';
        if (type === 'danger') icon = 'fa-circle-exclamation';

        toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${escapeHtml(message)}</span>`;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    function escapeHtml(str) {
        return str.replace(/[&<>"']/g, function(m) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            }[m];
        });
    }
});