// background.js – persistent Pomodoro timer via chrome.alarms

const ALARM_NAME = 'studyDuckTimer';

// Initialise default state when extension is installed/updated
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get('timerState', ({ timerState }) => {
    if (!timerState) {
      chrome.storage.local.set({
        timerState: {
          mode: 'focus',       // 'focus' | 'short-break' | 'long-break'
          running: false,
          remaining: 25 * 60, // seconds
          focusDuration: 25,
          shortBreak: 5,
          longBreak: 15,
          pomodorosCompleted: 0,
          startedAt: null      // timestamp when the current run started
        }
      });
    }
  });
});

// Recalculate remaining time from wall-clock start
function syncRemaining(state) {
  if (!state.running || !state.startedAt) return state;
  const elapsed = Math.floor((Date.now() - state.startedAt) / 1000);
  const remaining = Math.max(0, state.remaining - elapsed);
  return { ...state, remaining, startedAt: Date.now() };
}

// Handle messages from the popup
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  chrome.storage.local.get('timerState', ({ timerState }) => {
    let state = timerState || {};

    if (msg.action === 'GET_STATE') {
      state = syncRemaining(state);
      chrome.storage.local.set({ timerState: state });
      sendResponse({ state });
      return;
    }

    if (msg.action === 'START') {
      chrome.alarms.clear(ALARM_NAME, () => {
        state = syncRemaining(state);
        state.running = true;
        state.startedAt = Date.now();
        chrome.alarms.create(ALARM_NAME, { delayInMinutes: state.remaining / 60 });
        chrome.storage.local.set({ timerState: state });
        sendResponse({ state });
      });
      return true; // async response
    }

    if (msg.action === 'PAUSE') {
      chrome.alarms.clear(ALARM_NAME, () => {
        state = syncRemaining(state);
        state.running = false;
        state.startedAt = null;
        chrome.storage.local.set({ timerState: state });
        sendResponse({ state });
      });
      return true;
    }

    if (msg.action === 'RESET') {
      chrome.alarms.clear(ALARM_NAME, () => {
        const duration = getDuration(state.mode, state);
        state.running = false;
        state.remaining = duration;
        state.startedAt = null;
        chrome.storage.local.set({ timerState: state });
        sendResponse({ state });
      });
      return true;
    }

    if (msg.action === 'SET_MODE') {
      chrome.alarms.clear(ALARM_NAME, () => {
        state.mode = msg.mode;
        state.running = false;
        state.startedAt = null;
        state.remaining = getDuration(msg.mode, state);
        chrome.storage.local.set({ timerState: state });
        sendResponse({ state });
      });
      return true;
    }

    if (msg.action === 'SET_DURATIONS') {
      chrome.alarms.clear(ALARM_NAME, () => {
        state.focusDuration = msg.focusDuration;
        state.shortBreak = msg.shortBreak;
        state.longBreak = msg.longBreak;
        state.running = false;
        state.startedAt = null;
        state.remaining = getDuration(state.mode, state);
        chrome.storage.local.set({ timerState: state });
        sendResponse({ state });
      });
      return true;
    }

    sendResponse({});
  });
  return true; // keep message channel open for async
});

// Timer alarm fires when session ends
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name !== ALARM_NAME) return;

  chrome.storage.local.get('timerState', ({ timerState }) => {
    let state = timerState || {};
    const prevMode = state.mode;
    let title = '';
    let message = '';

    if (prevMode === 'focus') {
      state.pomodorosCompleted = (state.pomodorosCompleted || 0) + 1;
      if (state.pomodorosCompleted % 4 === 0) {
        state.mode = 'long-break';
        title = '🦆 Long Break Time!';
        message = `Great work! You've completed ${state.pomodorosCompleted} pomodoros. Take a ${state.longBreak}-minute break.`;
      } else {
        state.mode = 'short-break';
        title = '🦆 Short Break Time!';
        message = `Focus session done! Take a ${state.shortBreak}-minute breather.`;
      }
    } else {
      state.mode = 'focus';
      title = '🦆 Focus Time!';
      message = 'Break\u2019s over \u2014 time to get back to work. You\u2019ve got this!';
    }

    state.running = false;
    state.startedAt = null;
    state.remaining = getDuration(state.mode, state);
    chrome.storage.local.set({ timerState: state });

    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title,
      message
    });
  });
});

function getDuration(mode, state) {
  if (mode === 'focus') return (state.focusDuration || 25) * 60;
  if (mode === 'short-break') return (state.shortBreak || 5) * 60;
  if (mode === 'long-break') return (state.longBreak || 15) * 60;
  return 25 * 60;
}
