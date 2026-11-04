import { loadTasks, saveTasks } from './storage.js';

// Подключение стилей
const stylesheet = document.createElement('link');
stylesheet.rel = 'stylesheet';
stylesheet.href = new URL('../assets/styles.css', import.meta.url).href;

document.head.append(stylesheet);

const main = document.createElement('main');
main.className = 'app';

const heading = document.createElement('h1');
heading.textContent = 'Мой список задач';

main.append(heading);
document.body.append(main);

// Форма добавления задачи
const form = document.createElement('form');
form.className = 'task-form';

const titleLabel = document.createElement('label');
titleLabel.textContent = 'Название задачи';
titleLabel.htmlFor = 'task-title';

const titleInput = document.createElement('input');
titleInput.type = 'text';
titleInput.id = 'task-title';
titleInput.name = 'title';
titleInput.placeholder = 'Что нужно сделать?';
titleInput.required = true;
titleInput.maxLength = 200;

const dateLabel = document.createElement('label');
dateLabel.textContent = 'Срок выполнения — необязательно';
dateLabel.htmlFor = 'task-date';

const dateInput = document.createElement('input');
dateInput.type = 'date';
dateInput.id = 'task-date';
dateInput.name = 'date';
dateInput.min = '0001-01-01';
dateInput.max = '9999-12-31';

const addButton = document.createElement('button');
addButton.type = 'submit';
addButton.textContent = 'Добавить задачу';

form.append(
  titleLabel,
  titleInput,
  dateLabel,
  dateInput,
  addButton
);

main.append(form);

const cancelButton = document.createElement('button');
cancelButton.type = 'button';
cancelButton.textContent = 'Отмена';
cancelButton.hidden = true;

form.append(cancelButton);

// Сообщения и список задач
const message = document.createElement('p');
message.className = 'message';
message.setAttribute('role', 'status');

const taskList = document.createElement('ul');
taskList.className = 'task-list';

// Поиск и фильтр статуса
const filters = document.createElement('section');
filters.className = 'filters';
filters.setAttribute('aria-label', 'Поиск и фильтрация задач');

const searchLabel = document.createElement('label');
searchLabel.textContent = 'Поиск по названию';
searchLabel.htmlFor = 'task-search';

const searchInput = document.createElement('input');
searchInput.type = 'search';
searchInput.id = 'task-search';
searchInput.placeholder = 'Введите название задачи';

const statusLabel = document.createElement('label');
statusLabel.textContent = 'Статус';
statusLabel.htmlFor = 'task-status';

const statusSelect = document.createElement('select');
statusSelect.id = 'task-status';

const statusOptions = [
  { value: 'all', text: 'Все задачи' },
  { value: 'active', text: 'Невыполненные' },
  { value: 'completed', text: 'Выполненные' }
];

for (const status of statusOptions) {
  const option = document.createElement('option');
  option.value = status.value;
  option.textContent = status.text;
  statusSelect.append(option);
}

filters.append(
  searchLabel,
  searchInput,
  statusLabel,
  statusSelect
);

// Поиск по дате
const dateFilterLabel = document.createElement('label');
dateFilterLabel.textContent = 'Задачи на дату';
dateFilterLabel.htmlFor = 'task-date-filter';

const dateFilterInput = document.createElement('input');
dateFilterInput.type = 'date';
dateFilterInput.id = 'task-date-filter';
dateFilterInput.min = '0001-01-01';
dateFilterInput.max = '9999-12-31';

// Сортировка
const sortLabel = document.createElement('label');
sortLabel.textContent = 'Порядок задач';
sortLabel.htmlFor = 'task-sort';

const sortSelect = document.createElement('select');
sortSelect.id = 'task-sort';

const sortOptions = [
  { value: 'manual', text: 'Ручной порядок' },
  { value: 'asc', text: 'Сначала ближайшие сроки' },
  { value: 'desc', text: 'Сначала поздние сроки' }
];

for (const sort of sortOptions) {
  const option = document.createElement('option');
  option.value = sort.value;
  option.textContent = sort.text;
  sortSelect.append(option);
}

// Сброс поиска, фильтров и сортировки
const resetFiltersButton = document.createElement('button');
resetFiltersButton.type = 'button';
resetFiltersButton.textContent = 'Сбросить фильтры и сортировку';

filters.append(
  dateFilterLabel,
  dateFilterInput,
  sortLabel,
  sortSelect,
  resetFiltersButton
);

main.append(filters);

const emptyMessage = document.createElement('p');
emptyMessage.className = 'empty-message';
emptyMessage.hidden = true;

const reorderHint = document.createElement('p');
reorderHint.className = 'reorder-hint';

main.append(message, reorderHint, taskList, emptyMessage);

// Загрузка сохранённых задач
const savedState = loadTasks();
let tasks = savedState.tasks;

let editingTaskId = null;
let draggedTaskId = null;

function resetForm() {
  editingTaskId = null;
  form.reset();
  addButton.textContent = 'Добавить задачу';
  cancelButton.hidden = true;
}

cancelButton.addEventListener('click', () => {
  resetForm();
  message.textContent = 'Редактирование отменено';
  titleInput.focus();
});

if (savedState.error) {
  message.textContent = savedState.error;
}

// Сохранение изменений
function saveChanges(successMessage) {
  const saved = saveTasks(tasks);

  message.textContent = saved
    ? successMessage
    : 'Не удалось сохранить изменения. После перезагрузки они могут потеряться.';
}

function getVisibleTasks() {
  const query = searchInput.value.trim().toLowerCase();
  const status = statusSelect.value;
  const selectedDate = dateFilterInput.value;
  const sort = sortSelect.value;

  const visibleTasks = tasks.filter((task) => {
    const matchesTitle = task.title.toLowerCase().includes(query);

    const matchesStatus =
      status === 'all' ||
      (status === 'active' && !task.completed) ||
      (status === 'completed' && task.completed);

    const matchesDate =
      selectedDate === '' || task.date === selectedDate;

    return matchesTitle && matchesStatus && matchesDate;
  });

  if (sort !== 'manual') {
    visibleTasks.sort((a, b) => {
      // Задачи без срока всегда располагаются в конце
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;

      const comparison = a.date.localeCompare(b.date);

      return sort === 'asc' ? comparison : -comparison;
    });
  }

  return visibleTasks;
}

searchInput.addEventListener('input', () => {
  renderTasks();
});

statusSelect.addEventListener('change', () => {
  renderTasks();
});

dateFilterInput.addEventListener('change', () => {
  renderTasks();
});

sortSelect.addEventListener('change', () => {
  renderTasks();
});

resetFiltersButton.addEventListener('click', () => {
  searchInput.value = '';
  statusSelect.value = 'all';
  dateFilterInput.value = '';
  sortSelect.value = 'manual';

  renderTasks();
  searchInput.focus();
});

// Перемещение задач
function canReorderTasks() {
  return (
    sortSelect.value === 'manual' &&
    statusSelect.value === 'all' &&
    searchInput.value.trim() === '' &&
    dateFilterInput.value === ''
  );
}

function moveTask(sourceId, targetId, insertAfter) {
  if (sourceId === targetId) return;

  const sourceIndex = tasks.findIndex((task) => task.id === sourceId);
  const targetExists = tasks.some((task) => task.id === targetId);

  if (sourceIndex === -1 || !targetExists) return;

  // Убираем задачу с прежнего места
  const [movedTask] = tasks.splice(sourceIndex, 1);

  // После удаления индекс целевой задачи мог измениться
  const targetIndex = tasks.findIndex((task) => task.id === targetId);
  const newIndex = targetIndex + (insertAfter ? 1 : 0);

  tasks.splice(newIndex, 0, movedTask);

  saveChanges('Порядок задач сохранён.');
  renderTasks();
}

function addDragEvents(item, task) {
  item.draggable = canReorderTasks();

  item.addEventListener('dragstart', (event) => {
    if (!canReorderTasks()) {
      event.preventDefault();
      return;
    }

    draggedTaskId = task.id;

    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', task.id);

    item.classList.add('task--dragging');
  });

  item.addEventListener('dragover', (event) => {
    if (
      !canReorderTasks() ||
      draggedTaskId === null ||
      draggedTaskId === task.id
    ) {
      return;
    }

    // Без preventDefault браузер не разрешит сбросить задачу.
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';

    const bounds = item.getBoundingClientRect();
    const insertAfter = event.clientY > bounds.top + bounds.height / 2;

    item.classList.toggle('task--drop-before', !insertAfter);
    item.classList.toggle('task--drop-after', insertAfter);
  });

  item.addEventListener('dragleave', (event) => {
    if (!item.contains(event.relatedTarget)) {
      item.classList.remove('task--drop-before', 'task--drop-after');
    }
  });

  item.addEventListener('drop', (event) => {
    event.preventDefault();

    item.classList.remove('task--drop-before', 'task--drop-after');

    if (!canReorderTasks() || draggedTaskId === null) return;

    const bounds = item.getBoundingClientRect();
    const insertAfter = event.clientY > bounds.top + bounds.height / 2;
    const sourceId = draggedTaskId;

    draggedTaskId = null;
    moveTask(sourceId, task.id, insertAfter);
  });

  item.addEventListener('dragend', () => {
    draggedTaskId = null;

    for (const taskElement of taskList.children) {
      taskElement.classList.remove(
        'task--dragging',
        'task--drop-before',
        'task--drop-after'
      );
    }
  });
}

// Отображение задач
function renderTasks() {
  taskList.replaceChildren();

  reorderHint.textContent = canReorderTasks()
  ? 'Перетащите задачу выше или ниже, чтобы изменить порядок.'
  : 'Для перемещения выберите ручной порядок и сбросьте поиск и фильтры.';

  const visibleTasks = getVisibleTasks();

  emptyMessage.hidden = visibleTasks.length > 0;
  emptyMessage.textContent = tasks.length === 0
    ? 'Пока нет задач. Добавьте первую!'
    : 'Ничего не найдено. Измените поиск, статус или дату.';

  for (const task of visibleTasks) {
    const item = document.createElement('li');
    item.className = 'task';
    item.classList.toggle('task--completed', task.completed);
    addDragEvents(item, task);

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.setAttribute(
      'aria-label',
      `Задача выполнена: ${task.title}`
    );

    const title = document.createElement('span');
    title.className = 'task-title';
    title.textContent = task.title;

    const date = document.createElement('span');
    date.className = 'task-date';

    if (task.date) {
      const [year, month, day] = task.date.split('-');
      date.textContent = `Срок: ${day}.${month}.${year}`;
    } else {
      date.textContent = 'Без срока';
    }

    // Отметка выполнения
    checkbox.addEventListener('change', () => {
      task.completed = checkbox.checked;

      if (task.completed) {
        // Убираем задачу с текущего места
        tasks = tasks.filter((item) => item.id !== task.id);

        // Добавляем эту же задачу в конец
        tasks.push(task);
      }

      saveChanges(
        task.completed
          ? 'Задача выполнена и перемещена в конец.'
          : 'Задача возвращена в работу.'
      );

      renderTasks();
      statusSelect.focus();
    });

    // Редактирование задачи
    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.textContent = 'Изменить';
    editButton.setAttribute(
      'aria-label',
      `Изменить задачу: ${task.title}`
    );

    editButton.addEventListener('click', () => {
      editingTaskId = task.id;

      titleInput.value = task.title;
      dateInput.value = task.date;

      addButton.textContent = 'Сохранить изменения';
      cancelButton.hidden = false;

      message.textContent = 'Измените название или дату задачи';
      titleInput.focus();
    });

    // Удаление задачи
    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'delete-button';
    deleteButton.textContent = 'Удалить';
    deleteButton.setAttribute(
      'aria-label',
      `Удалить задачу: ${task.title}`
    );

    deleteButton.addEventListener('click', () => {
      tasks = tasks.filter((item) => item.id !== task.id);

      if (editingTaskId === task.id) {
        resetForm();
      }

      renderTasks();
      saveChanges('Задача удалена.');
      titleInput.focus();
    });

    item.append(checkbox, title, date, editButton, deleteButton);
    taskList.append(item);
  }
}

// Добавление новой задачи
form.addEventListener('submit', (event) => {
  event.preventDefault();

  const title = titleInput.value.trim();

  if (!title) {
    message.textContent = 'Введите название задачи.';
    titleInput.focus();
    return;
  }

  let successMessage;

  if (editingTaskId !== null) {
    const task = tasks.find((item) => item.id === editingTaskId);

    if (!task) {
      resetForm();
      message.textContent = 'Задача не найдена.';
      titleInput.focus();
      return;
    }

    task.title = title;
    task.date = dateInput.value;

    successMessage = 'Изменения сохранены.';
  } else {
    const task = {
      id: crypto.randomUUID(),
      title,
      date: dateInput.value,
      completed: false
    };

    tasks.push(task);
    successMessage = 'Задача добавлена.';
  }

  renderTasks();
  saveChanges(successMessage);
  resetForm();
  titleInput.focus();
});

renderTasks();