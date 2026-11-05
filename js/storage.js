const STORAGE_KEY = 'todo-list-lab:tasks';

function isValidDate(value) {
  if (typeof value !== 'string') return false;

  // Пустая дата допустима: срок необязателен
  if (value === '') return true;

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    value.startsWith('0000')
  ) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);

  return (
    Number.isFinite(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

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
        !isValidDate(task.date) ||
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

const FILTERS_KEY = 'todo-list-lab:filters';

export function loadFilters() {
  const defaults = {
    query: '',
    status: 'all',
    date: '',
    sort: 'manual'
  };

  try {
    const raw = localStorage.getItem(FILTERS_KEY);

    if (raw === null) {
      return { filters: defaults, error: '' };
    }

    const saved = JSON.parse(raw);

    if (
      !saved ||
      typeof saved.query !== 'string' ||
      !['all', 'active', 'completed'].includes(saved.status) ||
      !isValidDate(saved.date) ||
      !['manual', 'asc', 'desc'].includes(saved.sort)
    ) {
      throw new Error('Некорректные настройки');
    }

    return {
      filters: {
        query: saved.query,
        status: saved.status,
        date: saved.date,
        sort: saved.sort
      },
      error: ''
    };
  } catch {
    return {
      filters: defaults,
      error: 'Не удалось загрузить фильтры. Использованы стандартные настройки.'
    };
  }
}

export function saveFilters(filters) {
  try {
    localStorage.setItem(FILTERS_KEY, JSON.stringify(filters));
    return true;
  } catch {
    return false;
  }
}