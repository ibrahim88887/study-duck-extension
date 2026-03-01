/* popup.js – Study Duck extension UI logic */

// ─── Utilities ──────────────────────────────────────────────────────────────

function $(id) { return document.getElementById(id); }

function pad(n) { return String(n).padStart(2, '0'); }

function fmtTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${pad(m)}:${pad(s)}`;
}

// ─── Tab switching ───────────────────────────────────────────────────────────

const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;
    tabBtns.forEach(b => {
      b.classList.toggle('active', b.dataset.tab === target);
      b.setAttribute('aria-selected', String(b.dataset.tab === target));
    });
    tabPanels.forEach(p => p.classList.toggle('active', p.id === `tab-${target}`));
  });
});

// ═══════════════════════════════════════════════════════════════════════════
//  DUCK CHAT
// ═══════════════════════════════════════════════════════════════════════════

const DUCK_RESPONSES = {
  // Keyword-based replies
  keywords: [
    { words: ['error', 'exception', 'crash'], reply: "What does the error message say exactly? Copy it here if you can — the details matter." },
    { words: ['loop', 'iteration', 'infinite'], reply: "Walk me through each iteration: what *should* happen vs. what *does* happen? Where does it first go wrong?" },
    { words: ['null', 'undefined', 'none', 'nan'], reply: "Where is that variable first assigned? Could it be uninitialised or reassigned somewhere unexpected?" },
    { words: ['function', 'method', 'return'], reply: "What are the expected inputs and outputs of that function? Does it always return what you think it does?" },
    { words: ['api', 'fetch', 'request', 'response', 'http'], reply: "What does the response actually look like? Have you logged or inspected the raw data you're receiving?" },
    { words: ['logic', 'condition', 'if', 'else', 'switch'], reply: "Trace through the condition manually with a concrete example. Which branch is actually being taken?" },
    { words: ['database', 'query', 'sql', 'db'], reply: "Can you run that query directly on the database? Is the data actually what you expect it to be?" },
    { words: ['import', 'module', 'dependency', 'package', 'library'], reply: "Is the right version installed? Check your imports and make sure the module is where you think it is." },
    { words: ['type', 'cast', 'string', 'int', 'integer', 'float', 'bool'], reply: "Are you sure the type is what you expect? Try printing or logging the type of that variable." },
    { words: ['async', 'await', 'promise', 'callback', 'concurrent'], reply: "Could this be a race condition or an unresolved promise? What does the execution order look like?" },
    { words: ['test', 'unit', 'failing', 'assertion'], reply: "What exactly is the test asserting? What value is it getting vs. what it expects?" },
    { words: ['performance', 'slow', 'memory', 'leak', 'cpu'], reply: "Have you profiled where the bottleneck actually is? Don't optimise before you know the hot spot." },
  ],
  // Follow-up fallbacks (cycled through)
  fallbacks: [
    "Tell me more — what have you tried so far?",
    "Interesting! Break it down further — what's the *very first* thing that goes wrong?",
    "What did you *expect* to happen, versus what *actually* happened?",
    "Have you tried isolating the problem? Can you reproduce it in a smaller example?",
    "Sometimes explaining it step-by-step reveals the answer. Keep going!",
    "Is this something that *used to* work? What changed recently?",
    "Could there be an assumption you're making that isn't actually true?",
    "What would a fresh pair of eyes notice here? Pretend you're reading this for the first time.",
    "Have you checked the documentation for that? Sometimes the answer is hiding there.",
    "Rubber ducking works! You're doing great — keep explaining.",
    "What are the simplest inputs that trigger the bug?",
    "Can you add a print/log statement to confirm your assumption at that point?",
  ]
};

let fallbackIndex = 0;

function getDuckReply(text) {
  const lower = text.toLowerCase();
  for (const { words, reply } of DUCK_RESPONSES.keywords) {
    if (words.some(w => lower.includes(w))) return reply;
  }
  const reply = DUCK_RESPONSES.fallbacks[fallbackIndex % DUCK_RESPONSES.fallbacks.length];
  fallbackIndex++;
  return reply;
}

function appendBubble(text, who) {
  const messagesEl = $('chat-messages');
  const div = document.createElement('div');
  div.className = `chat-bubble bubble-${who}`;

  if (who === 'duck') {
    const author = document.createElement('div');
    author.className = 'bubble-author';
    author.textContent = '🦆 Duck';
    div.appendChild(author);
  }

  const content = document.createElement('div');
  content.textContent = text;
  div.appendChild(content);

  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return div;
}

function showTypingIndicator() {
  const messagesEl = $('chat-messages');
  const div = document.createElement('div');
  div.className = 'bubble-typing';
  div.id = 'typing-indicator';
  div.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function removeTypingIndicator() {
  const el = $('typing-indicator');
  if (el) el.remove();
}

function sendMessage() {
  const input = $('chat-input');
  const text = input.value.trim();
  if (!text) return;

  appendBubble(text, 'user');
  input.value = '';

  showTypingIndicator();

  const delay = 600 + Math.random() * 800;
  setTimeout(() => {
    removeTypingIndicator();
    const reply = getDuckReply(text);
    appendBubble(reply, 'duck');
    saveChatHistory();
  }, delay);
}

$('chat-send').addEventListener('click', sendMessage);

$('chat-input').addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

$('chat-clear').addEventListener('click', () => {
  $('chat-messages').innerHTML = '';
  fallbackIndex = 0;
  messageCount = 0;
  chrome.storage.local.remove('chatHistory');
  // Show opening message again
  appendBubble("Quack! I'm all ears. Explain your problem step by step and we'll figure it out together. 🐣", 'duck');
  saveChatHistory();
});

function saveChatHistory() {
  const bubbles = [...document.querySelectorAll('#chat-messages .chat-bubble')].map(b => {
    const isDuck = b.classList.contains('bubble-duck');
    return {
      who: isDuck ? 'duck' : 'user',
      text: isDuck
        ? b.querySelector('div:last-child').textContent
        : b.textContent
    };
  });
  chrome.storage.local.set({ chatHistory: { bubbles, fallbackIndex } });
}

function loadChatHistory() {
  chrome.storage.local.get('chatHistory', ({ chatHistory }) => {
    if (chatHistory && chatHistory.bubbles && chatHistory.bubbles.length > 0) {
      fallbackIndex = chatHistory.fallbackIndex || 0;
      chatHistory.bubbles.forEach(({ who, text }) => appendBubble(text, who));
    } else {
      appendBubble("Quack! I'm all ears. Explain your problem step by step and we'll figure it out together. 🐣", 'duck');
      saveChatHistory();
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════════
//  POMODORO TIMER
// ═══════════════════════════════════════════════════════════════════════════

const RING_CIRCUMFERENCE = 2 * Math.PI * 54; // ~339.3

let timerInterval = null;
let timerState = null;

const modeBtns = document.querySelectorAll('.mode-btn');

modeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'SET_MODE', mode: btn.dataset.mode }, res => {
      if (res && res.state) applyTimerState(res.state);
    });
  });
});

$('timer-start').addEventListener('click', () => {
  if (!timerState) return;
  const action = timerState.running ? 'PAUSE' : 'START';
  chrome.runtime.sendMessage({ action }, res => {
    if (res && res.state) applyTimerState(res.state);
  });
});

$('timer-reset').addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'RESET' }, res => {
    if (res && res.state) applyTimerState(res.state);
  });
});

$('settings-save').addEventListener('click', () => {
  const focusDuration = parseInt($('set-focus').value, 10) || 25;
  const shortBreak    = parseInt($('set-short').value, 10) || 5;
  const longBreak     = parseInt($('set-long').value, 10) || 15;
  chrome.runtime.sendMessage(
    { action: 'SET_DURATIONS', focusDuration, shortBreak, longBreak },
    res => { if (res && res.state) applyTimerState(res.state); }
  );
});

function applyTimerState(state) {
  timerState = state;

  // Resync remaining from wall clock when running
  let remaining = state.remaining;
  if (state.running && state.startedAt) {
    const elapsed = Math.floor((Date.now() - state.startedAt) / 1000);
    remaining = Math.max(0, state.remaining - elapsed);
  }

  updateClockDisplay(remaining, state);

  // Start or stop local tick interval
  clearInterval(timerInterval);
  if (state.running) {
    timerInterval = setInterval(() => {
      if (!timerState) return;
      remaining = Math.max(0, remaining - 1);
      updateClockDisplay(remaining, timerState);
      if (remaining <= 0) clearInterval(timerInterval);
    }, 1000);
  }

  // Update settings inputs
  $('set-focus').value = state.focusDuration || 25;
  $('set-short').value = state.shortBreak || 5;
  $('set-long').value  = state.longBreak || 15;

  // Update pomodoro count
  $('pomodoro-count').textContent = state.pomodorosCompleted || 0;

  // Update start/pause button label
  $('timer-start').textContent = state.running ? 'Pause' : 'Start';

  // Update mode buttons
  modeBtns.forEach(b => b.classList.toggle('active', b.dataset.mode === state.mode));
}

function updateClockDisplay(remaining, state) {
  $('timer-display').textContent = fmtTime(remaining);

  const modeLabels = { focus: 'Focus', 'short-break': 'Short Break', 'long-break': 'Long Break' };
  $('timer-mode-label').textContent = modeLabels[state.mode] || 'Focus';

  // Ring progress
  const total = getDurationFor(state.mode, state);
  const progress = total > 0 ? remaining / total : 1;
  const offset = RING_CIRCUMFERENCE * (1 - progress);
  const ring = $('ring-fill');
  ring.style.strokeDashoffset = offset;
  ring.classList.toggle('break', state.mode !== 'focus');
}

function getDurationFor(mode, state) {
  if (mode === 'focus')       return (state.focusDuration || 25) * 60;
  if (mode === 'short-break') return (state.shortBreak || 5) * 60;
  if (mode === 'long-break')  return (state.longBreak || 15) * 60;
  return 25 * 60;
}

function loadTimerState() {
  chrome.runtime.sendMessage({ action: 'GET_STATE' }, res => {
    if (res && res.state) applyTimerState(res.state);
  });
}

// ═══════════════════════════════════════════════════════════════════════════
//  TASK MANAGER
// ═══════════════════════════════════════════════════════════════════════════

let tasks = [];

function saveTasks() {
  chrome.storage.local.set({ tasks });
}

function renderTasks() {
  const list = $('task-list');
  const empty = $('tasks-empty');
  const summary = $('tasks-summary');

  list.innerHTML = '';

  if (tasks.length === 0) {
    empty.classList.remove('hidden');
    summary.textContent = '';
    return;
  }

  empty.classList.add('hidden');

  const done = tasks.filter(t => t.done).length;
  summary.textContent = `${done} / ${tasks.length} done`;

  tasks.forEach((task, index) => {
    const li = document.createElement('li');
    li.className = `task-item${task.done ? ' done' : ''}`;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.done;
    checkbox.setAttribute('aria-label', `Mark "${task.text}" as done`);
    checkbox.addEventListener('change', () => {
      tasks[index].done = checkbox.checked;
      saveTasks();
      renderTasks();
    });

    const textSpan = document.createElement('span');
    textSpan.className = 'task-text';
    textSpan.textContent = task.text;
    textSpan.addEventListener('click', () => {
      tasks[index].done = !tasks[index].done;
      saveTasks();
      renderTasks();
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'task-delete';
    deleteBtn.textContent = '×';
    deleteBtn.setAttribute('aria-label', `Delete task "${task.text}"`);
    deleteBtn.addEventListener('click', () => {
      tasks.splice(index, 1);
      saveTasks();
      renderTasks();
    });

    li.appendChild(checkbox);
    li.appendChild(textSpan);
    li.appendChild(deleteBtn);
    list.appendChild(li);
  });
}

function addTask() {
  const input = $('task-input');
  const text = input.value.trim();
  if (!text) return;
  tasks.push({ text, done: false });
  input.value = '';
  saveTasks();
  renderTasks();
}

$('task-add').addEventListener('click', addTask);

$('task-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') addTask();
});

$('tasks-clear-done').addEventListener('click', () => {
  tasks = tasks.filter(t => !t.done);
  saveTasks();
  renderTasks();
});

function loadTasks() {
  chrome.storage.local.get('tasks', ({ tasks: stored }) => {
    tasks = stored || [];
    renderTasks();
  });
}

// ═══════════════════════════════════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════════════════════════════════

loadChatHistory();
loadTimerState();
loadTasks();
