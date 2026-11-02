const STORAGE_KEY = 'todo-list-lab:tasks';

export function loadTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved === null) {
      return { tasks: [], error: '' };
    }

    const tasks = JSON.parse(saved);

    if (!Array.isArray(tasks)) {
      throw new Error('Неверный формат данных');
    }

    const ids = new Set();

    for (const task of tasks) {
      if (
        !task ||
        typeof task.id !== 'string' ||
        !task.id ||
        ids.has(task.id) ||
        typeof task.title !== 'string' ||
        !task.title.trim() ||
        task.title.length > 200 ||
        typeof task.date !== 'string' ||
        typeof task.completed !== 'boolean'
      ) {
        throw new Error('Некорректная задача');
      }

      ids.add(task.id);
    }

    return { tasks, error: '' };
  } catch {
    return {
      tasks: [],
      error:
        'Не удалось загрузить задачи. При следующем изменении будет сохранён новый список.'
    };
  }
}

export function saveTasks(tasks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    return true;
  } catch {
    return false;
  }
}