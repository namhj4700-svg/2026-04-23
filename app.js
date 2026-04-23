const STORAGE_KEY = 'habits';

// ── Utilities ──────────────────────────────────────────────

function today() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-');
  return `${y}년 ${m}월 ${d}일`;
}

function uuid() {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ── Storage ────────────────────────────────────────────────

function loadHabits() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveHabits(habits) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
}

// ── Streak calculation ─────────────────────────────────────

function calcStreak(completedDates) {
  if (!completedDates.length) return 0;

  const sorted = [...new Set(completedDates)].sort().reverse(); // newest first
  const todayStr = today();

  // Start counting from today or yesterday
  let cursor = sorted[0] === todayStr ? todayStr : shiftDay(todayStr, -1);
  if (sorted[0] !== cursor) return 0;

  let count = 0;
  for (const date of sorted) {
    if (date === cursor) {
      count++;
      cursor = shiftDay(cursor, -1);
    } else {
      break;
    }
  }
  return count;
}

function shiftDay(dateStr, delta) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + delta);
  return d.toISOString().slice(0, 10);
}

// ── Render ─────────────────────────────────────────────────

function render() {
  const habits = loadHabits();
  const list = document.getElementById('habit-list');
  const emptyMsg = document.getElementById('empty-msg');
  const todayStr = today();

  list.innerHTML = '';

  if (habits.length === 0) {
    emptyMsg.classList.add('visible');
    return;
  }
  emptyMsg.classList.remove('visible');

  habits.forEach(habit => {
    const isDone = habit.completedDates.includes(todayStr);
    const streak = calcStreak(habit.completedDates);

    const li = document.createElement('li');
    li.className = 'habit-card' + (isDone ? ' done' : '');

    li.innerHTML = `
      <input type="checkbox" ${isDone ? 'checked' : ''} data-id="${habit.id}" aria-label="${habit.name} 완료 체크" />
      <span class="habit-name">${escapeHtml(habit.name)}</span>
      <span class="streak ${streak === 0 ? 'zero' : ''}">
        ${streak > 0 ? '🔥' : '—'} ${streak}일 연속
      </span>
      <button class="delete-btn" data-id="${habit.id}" aria-label="삭제">✕</button>
    `;

    list.appendChild(li);
  });
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Actions ────────────────────────────────────────────────

function addHabit(name) {
  const trimmed = name.trim();
  if (!trimmed) return;

  const habits = loadHabits();

  if (habits.some(h => h.name === trimmed)) {
    alert('이미 같은 이름의 습관이 있습니다.');
    return;
  }

  habits.push({
    id: uuid(),
    name: trimmed,
    createdAt: today(),
    completedDates: [],
  });

  saveHabits(habits);
  render();
}

function deleteHabit(id) {
  const habits = loadHabits().filter(h => h.id !== id);
  saveHabits(habits);
  render();
}

function toggleToday(id) {
  const todayStr = today();
  const habits = loadHabits();
  const habit = habits.find(h => h.id === id);
  if (!habit) return;

  if (habit.completedDates.includes(todayStr)) {
    habit.completedDates = habit.completedDates.filter(d => d !== todayStr);
  } else {
    habit.completedDates.push(todayStr);
  }

  saveHabits(habits);
  render();
}

// ── Event listeners ────────────────────────────────────────

document.getElementById('add-form').addEventListener('submit', e => {
  e.preventDefault();
  const input = document.getElementById('habit-input');
  addHabit(input.value);
  input.value = '';
});

document.getElementById('habit-list').addEventListener('change', e => {
  if (e.target.matches('input[type="checkbox"]')) {
    toggleToday(e.target.dataset.id);
  }
});

document.getElementById('habit-list').addEventListener('click', e => {
  const btn = e.target.closest('.delete-btn');
  if (btn) deleteHabit(btn.dataset.id);
});

// ── Init ───────────────────────────────────────────────────

document.getElementById('today-label').textContent = '오늘: ' + formatDate(today());
render();
