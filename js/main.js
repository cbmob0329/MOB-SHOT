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
    window.MobShotGame.stop();
    mainScreen.classList.add('active');
    gameScreen.classList.remove('active');
    updateMainHud();
  }

  function showGame() {
    mainScreen.classList.remove('active');
    gameScreen.classList.add('active');
    window.MobShotGame.start();
  }

  function pressAnim(btn) {
    btn.animate([
      { transform: 'translateY(0)' },
      { transform: 'translateY(5px)' },
      { transform: 'translateY(0)' }
    ], { duration: 150 });
  }

  sortieBtn.addEventListener('click', () => { pressAnim(sortieBtn); showGame(); });
  backBtn.addEventListener('click', () => showMain());
  resultMainBtn.addEventListener('click', () => showMain());
  resultRetryBtn.addEventListener('click', () => window.MobShotGame.start());

  disabledButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      pressAnim(btn);
      window.MobShotGame.showBanner('後で実装');
    });
  });

  document.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
  updateMainHud();
})();
