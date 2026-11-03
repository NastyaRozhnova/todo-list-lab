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

main.append(filters);

const emptyMessage = document.createElement('p');
emptyMessage.className = 'empty-message';
emptyMessage.hidden = true;

main.append(message, taskList, emptyMessage);

// Загрузка сохранённых задач
const savedState = loadTasks();
let tasks = savedState.tasks;

let editingTaskId = null;

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

  return tasks.filter((task) => {
    const matchesTitle = task.title.toLowerCase().includes(query);

    const matchesStatus =
      status === 'all' ||
      (status === 'active' && !task.completed) ||
      (status === 'completed' && task.completed);

    return matchesTitle && matchesStatus;
  });
}

searchInput.addEventListener('input', () => {
  renderTasks();
});

statusSelect.addEventListener('change', () => {
  renderTasks();
});

// Отображение задач
function renderTasks() {
  taskList.replaceChildren();

  const visibleTasks = getVisibleTasks();

  emptyMessage.hidden = visibleTasks.length > 0;
  emptyMessage.textContent = tasks.length === 0
    ? 'Пока нет задач. Добавьте первую!'
    : 'Ничего не найдено. Измените поиск или статус.';

  for (const task of visibleTasks) {
    const item = document.createElement('li');
    item.className = 'task';
    item.classList.toggle('task--completed', task.completed);

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

      saveChanges(
        task.completed
          ? 'Задача выполнена.'
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