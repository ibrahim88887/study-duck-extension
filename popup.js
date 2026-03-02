let selectedMin = 45;
let timerInterval = null;

const pill       = document.getElementById('pill');
const ringFill   = document.getElementById('ringFill');
const ringTime   = document.getElementById('ringTime');
const ringLabel  = document.getElementById('ringLabel');
const mainBtn    = document.getElementById('mainBtn');
const chips      = document.getElementById('chips');
const duckCenter = document.getElementById('duckCenter');

const CIRCUMFERENCE = 2 * Math.PI * 60;

chips.querySelectorAll('.chip').forEach(c => {
  c.addEventListener('click', async () => {
    if (c.dataset.disabled) return;
    chips.querySelectorAll('.chip').forEach(x => x.classList.remove('active'));
    c.classList.add('active');
    selectedMin = parseInt(c.dataset.min);
    const studying = await isStudying();
    if (!studying) updateIdle();
  });
});

async function isStudying() {
  const d = await chrome.storage.local.get('studyMode');
  return d.studyMode;
}

function updateIdle() {
  const h = Math.floor(selectedMin / 60);
  const m = selectedMin % 60;
  ringTime.textContent  = h ? `${h}:${String(m).padStart(2,'0')}` : `${m}:00`;
  ringLabel.textContent = 'Duration';
  ringFill.style.strokeDashoffset = CIRCUMFERENCE;
}

mainBtn.addEventListener('click', async () => {
  const { studyMode } = await chrome.storage.local.get('studyMode');
  studyMode ? stopStudy() : startStudy();
});

function startStudy() {
  chrome.runtime.sendMessage({ action: 'start', duration: selectedMin });
  chrome.storage.local.set({ sessionStart: Date.now(), sessionDuration: selectedMin });
  setUI(true);
  startTick();
}

function stopStudy() {
  chrome.runtime.sendMessage({ action: 'stop' });
  setUI(false);
  stopTick();
  updateIdle();
  ringLabel.textContent = 'Pick duration';
}

function setUI(on) {
  pill.textContent = on ? 'ON 🔒' : 'OFF';
  pill.className   = on ? 'pill on' : 'pill off';
  mainBtn.innerHTML     = on ? '⛔ Stop Session' : '🚀 Start Studying';
  mainBtn.className     = on ? 'btn btn-stop' : 'btn btn-start';
  ringFill.classList.toggle('active', on);
  duckCenter.classList.toggle('active', on);
  chips.querySelectorAll('.chip').forEach(c => {
    c.dataset.disabled = on ? '1' : '';
    c.style.opacity    = on ? '.3' : '1';
    c.style.pointerEvents = on ? 'none' : 'auto';
  });
}

function startTick() { stopTick(); timerInterval = setInterval(tick, 1000); tick(); }
function stopTick()  { clearInterval(timerInterval); timerInterval = null; }

async function tick() {
  const d = await chrome.storage.local.get(['studyMode','sessionStart','sessionDuration']);
  if (!d.studyMode) { stopTick(); setUI(false); updateIdle(); return; }

  const elapsed   = Math.floor((Date.now() - d.sessionStart) / 1000);
  const totalSecs = d.sessionDuration * 60;
  const remaining = Math.max(totalSecs - elapsed, 0);

  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  ringTime.textContent  = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  ringLabel.textContent = remaining === 0 ? '🎉 Done!' : 'Remaining';

  const offset = CIRCUMFERENCE * (1 - Math.min(elapsed / totalSecs, 1));
  ringFill.style.strokeDashoffset = offset;

  if (remaining === 0) { stopTick(); stopStudy(); }
}

async function init() {
  const d = await chrome.storage.local.get(['studyMode','sessionDuration']);
  if (d.studyMode) {
    selectedMin = d.sessionDuration || 45;
    setUI(true);
    startTick();
  } else {
    updateIdle();
    ringLabel.textContent = 'Pick duration';
  }
}

init();
