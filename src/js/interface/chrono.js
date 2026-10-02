// ─────────────────────────────────────────────
// TIMER DE PARTIE
// ─────────────────────────────────────────────

function _sp(n) {
    const v = Math.round((n || 0) * 10) / 10;
    return v % 1 === 0 ? v.toString() : v.toFixed(1);
}
function updateGameTimer() {
    if (gameState.phase !== 'game') return;
    const elapsed = gameState.isMulti ? gameState.time : gameState.gameStats.timeElapsed;
    const min = Math.floor(elapsed / 60);
    const sec = Math.floor(elapsed % 60);
    const str = String(min).padStart(2, '0') + ':' + String(sec).padStart(2, '0');
    if (DOM.gameTimer) DOM.gameTimer.textContent = str;
}


// ─────────────────────────────────────────────
// TRANSITIONS & LOADING
// ─────────────────────────────────────────────
function fadeTransition(callback) {
    const fade = document.getElementById('screenFade');
    fade.classList.add('active');
    setTimeout(() => {
        callback();
        setTimeout(() => fade.classList.remove('active'), 50);
    }, 500);
}

function updateLoadingBar(pct, text) {
    document.getElementById('loadingBarFill').style.width = pct + '%';
    if (text) document.getElementById('loadingText').textContent = text;
}

function hideLoading() {
    document.getElementById('loadingScreen').classList.add('hidden');
}


