'use strict';

// TaskFlow: dados, interface, filtros e persistência local.
const STORAGE_KEY = 'taskflow-tasks-v1';

const sampleTasks = [
  {
    id: 'sample-1',
    title: 'Organizar a semana',
    description: 'Definir prioridades e separar os horários de estudo.',
    priority: 'alta',
    deadline: dateOffset(1),
    status: 'todo',
    createdAt: new Date().toISOString()
  },
  {
    id: 'sample-2',
    title: 'Revisar conteúdo de matemática',
    description: 'Resolver exercícios e revisar as anotações.',
    priority: 'media',
    deadline: dateOffset(3),
    status: 'progress',
    createdAt: new Date().toISOString()
  },
  {
    id: 'sample-3',
    title: 'Atualizar o material',
    description: 'Organizar os arquivos e documentos da disciplina.',
    priority: 'baixa',
    deadline: dateOffset(-1),
    status: 'done',
    createdAt: new Date().toISOString()
  }
];

let tasks = loadTasks();
let toastTimer;

const elements = {
  modal: document.getElementById('task-modal'),
  form: document.getElementById('task-form'),
  id: document.getElementById('task-id'),
  title: document.getElementById('task-title'),
  description: document.getElementById('task-description'),
  priority: document.getElementById('task-priority'),
  deadline: document.getElementById('task-deadline'),
  status: document.getElementById('task-status'),
  modalTitle: document.getElementById('modal-title'),
  saveButton: document.getElementById('save-task'),
  search: document.getElementById('search-input'),
  priorityFilter: document.getElementById('priority-filter'),
  statusFilter: document.getElementById('status-filter'),
  toast: document.getElementById('toast')
};

function dateOffset(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function loadTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === null) {
      // Os exemplos são carregados apenas na primeira abertura.
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleTasks));
      return [...sampleTasks];
    }
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Não foi possível carregar as tarefas:', error);
    return [];
  }
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error('Não foi possível salvar as tarefas:', error);
    showToast('Não foi possível salvar os dados neste navegador.');
  }
}

function createId() {
  if (window.crypto && typeof window.crypto.randomUUID === 'function') {
    return window.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function escapeHTML(value = '') {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

function formatDate(dateString) {
  if (!dateString) return 'Sem prazo';
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');
}

function isOverdue(dateString, status) {
  return Boolean(dateString && status !== 'done' && dateString < dateOffset(0));
}

function getFilteredTasks() {
  const searchTerm = elements.search.value.trim().toLocaleLowerCase('pt-BR');
  const priority = elements.priorityFilter.value;
  const status = elements.statusFilter.value;

  return tasks.filter(task => {
    const matchesTitle = task.title.toLocaleLowerCase('pt-BR').includes(searchTerm);
    const matchesPriority = priority === 'all' || task.priority === priority;
    const matchesStatus = status === 'all' || task.status === status;
    return matchesTitle && matchesPriority && matchesStatus;
  });
}

function renderStats() {
  document.getElementById('total-count').textContent = tasks.length;
  document.getElementById('todo-count').textContent = tasks.filter(task => task.status === 'todo').length;
  document.getElementById('progress-count').textContent = tasks.filter(task => task.status === 'progress').length;
  document.getElementById('done-count').textContent = tasks.filter(task => task.status === 'done').length;
}

function renderTask(task) {
  const priorityLabels = { alta: 'Alta', media: 'Média', baixa: 'Baixa' };
  const statusLabels = { todo: 'A fazer', progress: 'Em andamento', done: 'Concluída' };
  const overdue = isOverdue(task.deadline, task.status);
  const description = task.description
    ? `<p class="task-description">${escapeHTML(task.description)}</p>` : '';

  return `
    <article class="task-card" data-id="${escapeHTML(task.id)}" draggable="true" title="Você pode arrastar este cartão para outra coluna">
      <h4>${escapeHTML(task.title)}</h4>
      ${description}
      <div class="task-meta">
        <span class="priority ${task.priority}">${priorityLabels[task.priority] || 'Média'}</span>
        <span class="deadline ${overdue ? 'overdue' : ''}">${overdue ? 'Atrasada · ' : ''}${formatDate(task.deadline)}</span>
      </div>
      <div class="task-actions">
        <select class="status-select" data-action="status" aria-label="Mover tarefa: ${escapeHTML(task.title)}">
          ${Object.entries(statusLabels).map(([value, label]) =>
            `<option value="${value}" ${task.status === value ? 'selected' : ''}>${label}</option>`
          ).join('')}
        </select>
        <div class="action-buttons">
          <button type="button" data-action="edit" aria-label="Editar tarefa">Editar</button>
          <button type="button" data-action="delete" aria-label="Excluir tarefa">Excluir</button>
        </div>
      </div>
    </article>`;
}

function renderBoard() {
  const filteredTasks = getFilteredTasks();
  const columns = [
    { status: 'todo', list: 'todo-list', count: 'todo-column-count' },
    { status: 'progress', list: 'progress-list', count: 'progress-column-count' },
    { status: 'done', list: 'done-list', count: 'done-column-count' }
  ];

  columns.forEach(column => {
    const columnTasks = filteredTasks.filter(task => task.status === column.status);
    document.getElementById(column.list).innerHTML = columnTasks.length
      ? columnTasks.map(renderTask).join('')
      : '<div class="empty-state">Nenhuma tarefa por aqui.<br>Adicione uma nova atividade.</div>';
    document.getElementById(column.count).textContent = columnTasks.length;
  });

  document.getElementById('visible-count').textContent =
    `${filteredTasks.length} ${filteredTasks.length === 1 ? 'tarefa' : 'tarefas'}`;
}

function render() {
  renderStats();
  renderBoard();
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => elements.toast.classList.remove('show'), 2500);
}

function openModal(task = null, defaultStatus = 'todo') {
  elements.form.reset();
  elements.id.value = task ? task.id : '';
  elements.title.value = task ? task.title : '';
  elements.description.value = task ? task.description : '';
  elements.priority.value = task ? task.priority : 'media';
  elements.deadline.value = task ? task.deadline : '';
  elements.status.value = task ? task.status : defaultStatus;
  elements.modalTitle.textContent = task ? 'Editar tarefa' : 'Nova tarefa';
  elements.saveButton.textContent = task ? 'Salvar alterações' : 'Salvar tarefa';
  elements.modal.hidden = false;
  document.body.style.overflow = 'hidden';
  elements.title.focus();
}

function closeModal() {
  elements.modal.hidden = true;
  document.body.style.overflow = '';
}

function handleFormSubmit(event) {
  event.preventDefault();
  const title = elements.title.value.trim();

  if (!title) {
    elements.title.focus();
    showToast('Informe um título para a tarefa.');
    return;
  }

  const existingId = elements.id.value;
  const taskData = {
    id: existingId || createId(),
    title,
    description: elements.description.value.trim(),
    priority: elements.priority.value,
    deadline: elements.deadline.value,
    status: elements.status.value,
    createdAt: existingId
      ? (tasks.find(task => task.id === existingId)?.createdAt || new Date().toISOString())
      : new Date().toISOString()
  };

  if (existingId) {
    tasks = tasks.map(task => task.id === existingId ? taskData : task);
    showToast('Tarefa atualizada com sucesso.');
  } else {
    tasks.unshift(taskData);
    showToast('Tarefa cadastrada com sucesso.');
  }

  saveTasks();
  render();
  closeModal();
}

function handleBoardAction(event) {
  const card = event.target.closest('.task-card');
  if (!card) return;

  const task = tasks.find(item => item.id === card.dataset.id);
  if (!task) return;

  const action = event.target.dataset.action;
  if (action === 'edit') {
    openModal(task);
  } else if (action === 'delete') {
    const confirmed = window.confirm(`Deseja excluir a tarefa "${task.title}"?`);
    if (!confirmed) return;
    tasks = tasks.filter(item => item.id !== task.id);
    saveTasks();
    render();
    showToast('Tarefa excluída.');
  }
}

function handleStatusChange(event) {
  if (!event.target.matches('[data-action="status"]')) return;
  const card = event.target.closest('.task-card');
  const task = tasks.find(item => item.id === card?.dataset.id);
  if (!task) return;
  task.status = event.target.value;
  saveTasks();
  render();
  showToast('Status atualizado.');
}

let draggedTaskId = null;

function handleDragStart(event) {
  const card = event.target.closest('.task-card');
  if (!card) return;
  draggedTaskId = card.dataset.id;
  card.classList.add('dragging');
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', draggedTaskId);
  }
}

function handleDragEnd(event) {
  const card = event.target.closest('.task-card');
  if (card) card.classList.remove('dragging');
  document.querySelectorAll('.kanban-column').forEach(column => column.classList.remove('drag-over'));
  draggedTaskId = null;
}

function handleDragOver(event) {
  const column = event.target.closest('.kanban-column');
  if (!column || !draggedTaskId) return;
  event.preventDefault();
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
  column.classList.add('drag-over');
}

function handleDragLeave(event) {
  const column = event.target.closest('.kanban-column');
  if (column && !column.contains(event.relatedTarget)) {
    column.classList.remove('drag-over');
  }
}

function handleDrop(event) {
  const column = event.target.closest('.kanban-column');
  if (!column) return;
  event.preventDefault();
  column.classList.remove('drag-over');

  const transferredId = event.dataTransfer?.getData('text/plain');
  const taskId = draggedTaskId || transferredId;
  const newStatus = column.dataset.status;
  const task = tasks.find(item => item.id === taskId);

  if (!task || !newStatus || task.status === newStatus) {
    draggedTaskId = null;
    return;
  }

  task.status = newStatus;
  saveTasks();
  render();
  showToast('Tarefa movida para "' + ({
    todo: 'A fazer',
    progress: 'Em andamento',
    done: 'Concluídas'
  }[newStatus]) + '".');
  draggedTaskId = null;
}

function setupDragAndDrop() {
  document.querySelectorAll('.task-list').forEach(list => {
    list.addEventListener('dragstart', handleDragStart);
    list.addEventListener('dragend', handleDragEnd);
  });

  document.querySelectorAll('.kanban-column').forEach(column => {
    column.addEventListener('dragover', handleDragOver);
    column.addEventListener('dragleave', handleDragLeave);
    column.addEventListener('drop', handleDrop);
  });
}

function setupNavigation() {
  const links = document.querySelectorAll('.nav-link[data-nav]');
  links.forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      const destination = link.dataset.nav === 'board'
        ? document.getElementById('board')
        : document.getElementById('dashboard');

      destination.scrollIntoView({ behavior: 'smooth', block: 'start' });
      links.forEach(item => item.classList.toggle('active', item === link));
    });
  });
}

function clearFilters() {
  elements.search.value = '';
  elements.priorityFilter.value = 'all';
  elements.statusFilter.value = 'all';
  renderBoard();
}

function initializeDate() {
  const now = new Date();
  document.getElementById('today-date').textContent = now.toLocaleDateString('pt-BR', {
    weekday: 'short', day: '2-digit', month: 'long'
  });
}



// Alternância entre tema claro e escuro, com preferência salva no navegador.
function setupTheme() {
  const root = document.documentElement;
  const button = document.getElementById('theme-toggle');
  const icon = button.querySelector('.theme-icon');
  const savedTheme = localStorage.getItem('taskflow-theme');
  const initialTheme = savedTheme === 'dark' ? 'dark' : 'light';

  function applyTheme(theme) {
    root.dataset.theme = theme;
    icon.textContent = theme === 'dark' ? '☀' : '☾';
    button.setAttribute('aria-label', theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro');
    button.title = theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro';
  }

  applyTheme(initialTheme);
  button.addEventListener('click', () => {
    const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
    localStorage.setItem('taskflow-theme', nextTheme);
  });
}

// Eventos da interface.
document.getElementById('open-task-modal').addEventListener('click', () => openModal());
document.getElementById('close-task-modal').addEventListener('click', closeModal);
document.getElementById('cancel-task').addEventListener('click', closeModal);
elements.modal.addEventListener('click', event => {
  if (event.target === elements.modal) closeModal();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !elements.modal.hidden) closeModal();
});
elements.form.addEventListener('submit', handleFormSubmit);
document.querySelectorAll('.task-list').forEach(list => {
  list.addEventListener('click', handleBoardAction);
  list.addEventListener('change', handleStatusChange);
});
document.querySelectorAll('.add-column-task').forEach(button => {
  button.addEventListener('click', () => openModal(null, button.dataset.status));
});
elements.search.addEventListener('input', renderBoard);
elements.priorityFilter.addEventListener('change', renderBoard);
elements.statusFilter.addEventListener('change', renderBoard);
document.getElementById('clear-filters').addEventListener('click', clearFilters);

setupDragAndDrop();
setupNavigation();
setupTheme();
initializeDate();
render();
