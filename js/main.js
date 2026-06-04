'use strict';

(function(){
  const D = window.MOBSHOT_DATA;

  const mainScreen = document.getElementById('mainScreen') || document.getElementById('mainView') || document.querySelector('.screen');
  const gameScreen = document.getElementById('gameScreen') || document.getElementById('gameView');

  function $(id){
    return document.getElementById(id);
  }

  function showScreen(name){
    const screens = document.querySelectorAll('.screen');
    screens.forEach(s => s.classList.remove('active'));

    if(name === 'game'){
      if(gameScreen) gameScreen.classList.add('active');
      if(window.MobShotGame) window.MobShotGame.start();
      return;
    }

    if(window.MobShotGame) window.MobShotGame.stop();
    if(mainScreen) mainScreen.classList.add('active');
    refreshMainHud();
  }

  function setImage(id, src){
    const el = $(id);
    if(!el || !src) return;
    el.src = src;
    el.onerror = function(){
      el.style.display = 'none';
      const fallback = el.nextElementSibling;
      if(fallback) fallback.style.display = 'block';
    };
  }

  function refreshMainHud(){
    const save = window.MobShotStorage ? window.MobShotStorage.load() : { score:0, coin:0, diamond:0, rank:1 };

    const diamond = $('mainDiamond');
    const rank = $('mainRank');
    const coin = $('mainCoin');

    if(diamond) diamond.textContent = save.diamond || 0;
    if(rank) rank.textContent = save.rank || 1;
    if(coin) coin.textContent = save.coin || 0;
  }

  function wireButton(ids, handler){
    ids.forEach(id => {
      const btn = $(id);
      if(!btn) return;
      btn.addEventListener('click', function(e){
        e.preventDefault();
        e.stopPropagation();
        handler();
      });
      btn.addEventListener('pointerup', function(e){
        e.preventDefault();
        e.stopPropagation();
        handler();
      }, { passive:false });
    });
  }

  function addDeleteSaveButton(){
    if($('deleteSaveBtn')) return;

    const btn = document.createElement('button');
    btn.id = 'deleteSaveBtn';
    btn.type = 'button';
    btn.textContent = 'セーブ削除';
    btn.style.position = 'absolute';
    btn.style.left = '3vw';
    btn.style.bottom = '12.2svh';
    btn.style.zIndex = '20';
    btn.style.border = '0';
    btn.style.borderRadius = '999px';
    btn.style.padding = '9px 14px';
    btn.style.fontWeight = '1000';
    btn.style.fontSize = '13px';
    btn.style.color = '#fff';
    btn.style.background = 'linear-gradient(#ff5b5b,#9d1212)';
    btn.style.border = '2px solid rgba(255,255,255,.35)';
    btn.style.boxShadow = '0 4px 0 rgba(0,0,0,.3)';

    btn.addEventListener('click', function(){
      const ok = confirm('セーブデータを削除しますか？\nコイン・スコア・ランクなどが初期化されます。');
      if(!ok) return;

      localStorage.removeItem('mobshot_save');
      localStorage.removeItem('mobshot_meta');
      localStorage.removeItem('MOBSHOT_SAVE');

      alert('セーブデータを削除しました。');
      location.reload();
    });

    if(mainScreen) mainScreen.appendChild(btn);
  }

  function initImages(){
    if(!D) return;

    setImage('titleImg', D.menu.title);
    setImage('mainPlayer', D.player.menuImage || D.player.image);

    setImage('sortieImg', D.menu.sortie);
    setImage('shopImg', D.menu.shop);
    setImage('equipImg', D.menu.equip);
    setImage('petImg', D.menu.pet);

    setImage('gachaImg', D.menu.gacha);
    setImage('missionImg', D.menu.mission);
    setImage('collectionImg', D.menu.collection);

    setImage('hudStageImg', D.hud.stage);
    setImage('hudScoreImg', D.hud.score);
    setImage('hudCoinImg', D.hud.coin);
    setImage('hudLifeImg', D.hud.life);
  }

  function init(){
    initImages();
    refreshMainHud();
    addDeleteSaveButton();

    wireButton(['sortieBtn','btnSortie','mainSortieBtn'], function(){
      showScreen('game');
    });

    wireButton(['backBtn','gameBackBtn'], function(){
      showScreen('main');
    });

    const retry = $('resultRetryBtn');
    if(retry){
      retry.addEventListener('click', function(){
        showScreen('game');
      });
    }

    const resultHome = $('resultHomeBtn');
    if(resultHome){
      resultHome.addEventListener('click', function(){
        showScreen('main');
      });
    }
  }

  window.addEventListener('DOMContentLoaded', init);
  window.MobShotMain = { showScreen, refreshMainHud };
})();
