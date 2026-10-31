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

const message = document.createElement('p');
message.className = 'message';
message.setAttribute('role', 'status');

const taskList = document.createElement('ul');
taskList.className = 'task-list';

main.append(message, taskList);

let tasks = [];

function renderTasks() {
  taskList.replaceChildren();

  for (const task of tasks) {
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

    checkbox.addEventListener('change', () => {
      task.completed = checkbox.checked;

      item.classList.toggle('task--completed', task.completed);

      message.textContent = task.completed
        ? 'Задача выполнена.'
        : 'Задача возвращена в работу.';
    });

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

      renderTasks();
      message.textContent = 'Задача удалена.';
      titleInput.focus();
    });

    item.append(checkbox, title, date, deleteButton);
    taskList.append(item);
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const title = titleInput.value.trim();

  if (!title) {
    message.textContent = 'Введите название задачи.';
    titleInput.focus();
    return;
  }

  const task = {
    id: crypto.randomUUID(),
    title,
    date: dateInput.value,
    completed: false
  };

  tasks.push(task);
  renderTasks();

  form.reset();
  titleInput.focus();
  message.textContent = 'Задача добавлена.';
});