const quotes = [
  "1 hour of focus > 1 day of distraction.",
  "The feed will still be there after your exam.",
  "Future you is counting on present you.",
  "Close the scroll, open the book.",
  "Champions study. Then they scroll.",
];
document.getElementById('q').innerHTML = `<strong>${quotes[Math.floor(Math.random()*quotes.length)]}</strong>`;

document.getElementById('backBtn').addEventListener('click', () => history.back());

function pad(n){ return String(n).padStart(2,'0'); }
async function tick(){
  try {
    const d = await chrome.storage.local.get(['studyMode','sessionStart','sessionDuration']);
    if(!d.studyMode){ document.getElementById('tv').textContent='--:--'; return; }
    const rem = Math.max(d.sessionDuration*60 - Math.floor((Date.now()-d.sessionStart)/1000), 0);
    document.getElementById('tv').textContent = `${pad(Math.floor(rem/60))}:${pad(rem%60)}`;
  } catch(e){}
}
tick(); setInterval(tick,1000);
