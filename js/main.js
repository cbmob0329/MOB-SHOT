'use strict';

(function(){
  const mainScreen = document.getElementById('mainScreen');
  const gameScreen = document.getElementById('gameScreen');
  const sortieBtn = document.getElementById('sortieBtn');
  const backBtn = document.getElementById('backToMainBtn');
  const resultMainBtn = document.getElementById('resultMainBtn');
  const resultRetryBtn = document.getElementById('resultRetryBtn');
  const disabledButtons = document.querySelectorAll('.disabled-btn');

  const mainDiamond = document.getElementById('mainDiamond');
  const mainRank = document.getElementById('mainRank');
  const mainCoin = document.getElementById('mainCoin');

  function updateMainHud() {
    const data = window.MobShotStorage.load();
    mainDiamond.textContent = data.diamond;
    mainRank.textContent = data.rank;
    mainCoin.textContent = data.coin.toLocaleString();
  }

  function showMain() {
    if (window.MobShotGame && typeof window.MobShotGame.stop === 'function') {
      window.MobShotGame.stop();
    }
    mainScreen.classList.add('active');
    gameScreen.classList.remove('active');
    updateMainHud();
  }

  function showGame() {
    mainScreen.classList.remove('active');
    gameScreen.classList.add('active');
    if (window.MobShotGame && typeof window.MobShotGame.start === 'function') {
      window.MobShotGame.start();
    } else {
      console.error('MobShotGame.start が見つかりません');
      mainScreen.classList.add('active');
      gameScreen.classList.remove('active');
    }
  }

  function pressAnim(btn) {
    if (!btn || !btn.animate) return;
    btn.animate([
      { transform: 'translateY(0)' },
      { transform: 'translateY(5px)' },
      { transform: 'translateY(0)' }
    ], { duration: 150 });
  }

  function startSortie(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    pressAnim(sortieBtn);
    showGame();
  }

  // iPhone/Safariでclickが取りこぼされても出撃できるように、pointerupを主導にする。
  let sortiePointerStarted = false;
  sortieBtn.setAttribute('type', 'button');
  sortieBtn.addEventListener('pointerdown', e => {
    sortiePointerStarted = true;
    if (e) e.preventDefault();
  }, { passive: false });
  sortieBtn.addEventListener('pointerup', e => {
    if (!sortiePointerStarted) return;
    sortiePointerStarted = false;
    startSortie(e);
  }, { passive: false });
  sortieBtn.addEventListener('click', e => {
    if (sortiePointerStarted) sortiePointerStarted = false;
    startSortie(e);
  });

  backBtn.addEventListener('click', () => showMain());
  resultMainBtn.addEventListener('click', () => showMain());
  resultRetryBtn.addEventListener('click', () => {
    if (window.MobShotGame && typeof window.MobShotGame.start === 'function') window.MobShotGame.start();
  });

  disabledButtons.forEach(btn => {
    btn.setAttribute('type', 'button');
    btn.addEventListener('click', () => {
      pressAnim(btn);
      if (mainScreen.classList.contains('active')) return;
      if (window.MobShotGame && typeof window.MobShotGame.showBanner === 'function') {
        window.MobShotGame.showBanner('後で実装');
      }
    });
  });

  // ゲーム中は画面スクロールを止める。ボタンのタップは止めない。
  document.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
  updateMainHud();
})();
