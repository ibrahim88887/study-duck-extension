chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ studyMode: false, sessionStart: null, sessionDuration: 0 });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'studyTimer') endStudy();
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'start') startStudy(msg.duration);
  if (msg.action === 'stop') { endStudy(); chrome.alarms.clear('studyTimer'); }
  sendResponse({ ok: true });
  return true;
});

async function startStudy(durationMinutes) {
  await chrome.storage.local.set({ studyMode: true, sessionStart: Date.now(), sessionDuration: durationMinutes });
  await chrome.declarativeNetRequest.updateEnabledRulesets({ enableRulesetIds: ['block_rules'] });
  chrome.action.setBadgeText({ text: '🔒' });
  chrome.action.setBadgeBackgroundColor({ color: '#ef4444' });
  if (durationMinutes > 0) chrome.alarms.create('studyTimer', { delayInMinutes: durationMinutes });
}

async function endStudy() {
  await chrome.storage.local.set({ studyMode: false, sessionStart: null, sessionDuration: 0 });
  await chrome.declarativeNetRequest.updateEnabledRulesets({ disableRulesetIds: ['block_rules'] });
  chrome.action.setBadgeText({ text: '' });
}
