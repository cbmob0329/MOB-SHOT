'use strict';

(function(){
  const D = window.MOBSHOT_DATA;

  const mainScreen =
    document.getElementById('mainScreen') ||
    document.getElementById('mainView') ||
    document.querySelector('.screen');

  const gameScreen =
    document.getElementById('gameScreen') ||
    document.getElementById('gameView');

  const DELETE_KEYS = [
    'mobshot_split_v1',
    'mobshot_save',
    'mobshot_meta',
    'MOBSHOT_SAVE',
    'mobshot_pet_state_v1',
    'mobshot_pet_state_v2',
    'mobshot_pet_state_v3',
    'mobshot_pet_equip_test',
    'mobshot_pet_equip_test_v2',
    'mobshot_shop_state_v1',
    'mobshot_shop_state_v2',
    'mobshot_equip_state_v1',
    'mobshot_equip_state_v2',
    'mobshot_skill_state_v1',
    'mobshot_mission_state_v1',
    'mobshot_mission_state_v2',
    'mobshot_gacha_state_v1',
    'mobshot_collection_display_v1',
    'mobshot_event_state_v1',
    'mobshot_events_state_v1',
    'mobshot_current_event_v1',
    'mobshot_double_boss_state_v1'
  ];

  function $(id){
    return document.getElementById(id);
  }

  function preventSmartphoneZoom(){
    let lastTouchEnd = 0;

    document.addEventListener('gesturestart', function(e){
      e.preventDefault();
    }, { passive:false });

    document.addEventListener('gesturechange', function(e){
      e.preventDefault();
    }, { passive:false });

    document.addEventListener('gestureend', function(e){
      e.preventDefault();
    }, { passive:false });

    document.addEventListener('dblclick', function(e){
      e.preventDefault();
    }, { passive:false });

    document.addEventListener('touchend', function(e){
      const now = Date.now();

      if (now - lastTouchEnd <= 350) {
        e.preventDefault();
      }

      lastTouchEnd = now;
    }, { passive:false });
  }

  function injectMainStyle(){
    if ($('mobMainExtraStyle')) return;

    const style = document.createElement('style');
    style.id = 'mobMainExtraStyle';
    style.textContent = `
      .player-showcase{
        position:relative;
        isolation:isolate;
      }

      .player-showcase .player-glow{
        position:relative;
        z-index:2;
      }

      .player-showcase #mainPlayer,
      .player-showcase .fallback-player{
        position:relative;
        z-index:5;
      }

      .player-showcase #mainPetFloatLayer{
        position:absolute;
        z-index:6;
      }

      .main-stone-display-layer{
        position:absolute;
        left:50%;
        top:50%;
        width:min(88vw,430px);
        height:190px;
        transform:translate(-50%,-50%);
        z-index:1;
        pointer-events:none;
        overflow:hidden;
        opacity:.62;
      }

      .main-stone-display-track{
        position:absolute;
        left:0;
        top:0;
        height:100%;
        display:flex;
        align-items:center;
        gap:34px;
        width:max-content;
        animation:mobStoneScroll 34s linear infinite;
      }

      .main-stone-display-item{
        width:112px;
        height:142px;
        flex:0 0 auto;
        display:flex;
        align-items:center;
        justify-content:center;
        border-radius:22px;
        background:rgba(0,0,0,.10);
        filter:drop-shadow(0 8px 0 rgba(0,0,0,.22));
        animation:mobStoneFloat 4.6s ease-in-out infinite;
      }

      .main-stone-display-item:nth-child(2n){
        animation-delay:-1.4s;
      }

      .main-stone-display-item:nth-child(3n){
        animation-delay:-2.7s;
      }

      .main-stone-display-item img{
        width:108px;
        height:134px;
        object-fit:contain;
      }

      @keyframes mobStoneScroll{
        0%{transform:translateX(0)}
        100%{transform:translateX(-50%)}
      }

      @keyframes mobStoneFloat{
        0%{transform:translateY(8px)}
        50%{transform:translateY(-10px)}
        100%{transform:translateY(8px)}
      }

      .mob-game-confirm{
        position:absolute;
        inset:0;
        z-index:160;
        display:flex;
        align-items:center;
        justify-content:center;
        padding:18px;
        background:rgba(0,0,0,.68);
      }

      .mob-game-confirm.hidden{
        display:none;
      }

      .mob-game-confirm-card{
        width:min(92vw,430px);
        border-radius:26px;
        padding:18px;
        background:linear-gradient(180deg,rgba(34,27,72,.98),rgba(5,8,22,.98));
        border:3px solid rgba(255,255,255,.36);
        box-shadow:0 18px 48px rgba(0,0,0,.7);
        text-align:center;
      }

      .mob-game-confirm-title{
        font-size:24px;
        font-weight:1000;
        color:#fff;
        text-shadow:0 3px 0 #000;
        margin-bottom:10px;
      }

      .mob-game-confirm-text{
        font-size:14px;
        line-height:1.6;
        font-weight:900;
        color:#dfe8ff;
        margin-bottom:14px;
        white-space:pre-line;
      }

      .mob-game-confirm-actions{
        display:grid;
        grid-template-columns:1fr 1fr;
        gap:10px;
      }

      .mob-game-confirm-btn{
        border:0;
        border-radius:999px;
        padding:12px 14px;
        font-size:15px;
        font-weight:1000;
        box-shadow:0 4px 0 rgba(0,0,0,.35);
      }

      .mob-game-confirm-btn.yes{
        color:#210800;
        background:linear-gradient(#ff8b8b,#e22a2a);
      }

      .mob-game-confirm-btn.no{
        color:#102033;
        background:linear-gradient(#ffffff,#b7c1d5);
      }

      .mob-game-toast{
        position:absolute;
        left:50%;
        top:22%;
        transform:translateX(-50%);
        z-index:170;
        min-width:220px;
        max-width:86vw;
        padding:12px 16px;
        border-radius:999px;
        background:linear-gradient(#ffe66b,#ffb423);
        color:#181000;
        font-size:14px;
        font-weight:1000;
        text-align:center;
        box-shadow:0 6px 0 rgba(0,0,0,.35);
        pointer-events:none;
        opacity:0;
        transition:opacity .2s, transform .2s;
      }

      .mob-game-toast.show{
        opacity:1;
        transform:translateX(-50%) translateY(-4px);
      }
    `;

    document.head.appendChild(style);
  }

  function ensureGameConfirm(){
    injectMainStyle();

    let modal = $('mobGameConfirm');
    if (modal) return modal;

    modal = document.createElement('div');
    modal.id = 'mobGameConfirm';
    modal.className = 'mob-game-confirm hidden';
    modal.innerHTML = `
      <div class="mob-game-confirm-card">
        <div id="mobGameConfirmTitle" class="mob-game-confirm-title"></div>
        <div id="mobGameConfirmText" class="mob-game-confirm-text"></div>
        <div class="mob-game-confirm-actions">
          <button id="mobGameConfirmYes" class="mob-game-confirm-btn yes" type="button">はい</button>
          <button id="mobGameConfirmNo" class="mob-game-confirm-btn no" type="button">いいえ</button>
        </div>
      </div>
    `;

    (mainScreen || $('app') || document.body).appendChild(modal);
    return modal;
  }

  function showGameConfirm(title, text, yesText, noText, onYes){
    const modal = ensureGameConfirm();

    $('mobGameConfirmTitle').textContent = title || '確認';
    $('mobGameConfirmText').textContent = text || '';
    $('mobGameConfirmYes').textContent = yesText || 'はい';
    $('mobGameConfirmNo').textContent = noText || 'いいえ';

    $('mobGameConfirmYes').onclick = function(e){
      e.preventDefault();
      e.stopPropagation();
      modal.classList.add('hidden');
      if (onYes) onYes();
    };

    $('mobGameConfirmNo').onclick = function(e){
      e.preventDefault();
      e.stopPropagation();
      modal.classList.add('hidden');
    };

    modal.classList.remove('hidden');
  }

  function showToast(text){
    injectMainStyle();

    let toast = $('mobGameToast');

    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'mobGameToast';
      toast.className = 'mob-game-toast';
      (mainScreen || $('app') || document.body).appendChild(toast);
    }

    toast.textContent = text;
    toast.classList.add('show');

    clearTimeout(toast.__timer);
    toast.__timer = setTimeout(function(){
      toast.classList.remove('show');
    }, 1450);
  }

  function showScreen(name){
    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.remove('active');
    });

    if (name === 'game') {
      if (gameScreen) gameScreen.classList.add('active');

      if (window.MobShotGame && window.MobShotGame.start) {
        window.MobShotGame.start();
      } else {
        showToast('ゲーム本体が読み込まれていません');
      }

      return;
    }

    if (window.MobShotGame && window.MobShotGame.stop) {
      window.MobShotGame.stop();
    }

    if (mainScreen) mainScreen.classList.add('active');

    refreshMainHud();
    refreshMainVisuals();
  }

  function setImage(id, src){
    const el = $(id);

    if (!el || !src) return;

    el.src = src;

    el.onerror = function(){
      el.style.display = 'none';

      const fallback = el.nextElementSibling;
      if (fallback) fallback.style.display = 'block';
    };
  }

  function readSave(){
    if (window.MobShotStorage && window.MobShotStorage.load) {
      return window.MobShotStorage.load();
    }

    return {
      totalScore:0,
      bestScore:0,
      coin:0,
      diamond:0,
      rank:1,
      stageProgress:{
        currentAreaIndex:0,
        currentStageNo:1
      }
    };
  }

  function currentStageText(){
    if (window.MobShotStorage && window.MobShotStorage.getCurrentStage) {
      const stage = window.MobShotStorage.getCurrentStage();
      return `${stage.areaName} ${stage.id}`;
    }

    return '草原 1-1';
  }

  function refreshMainHud(){
    const save = readSave();

    if ($('mainDiamond')) $('mainDiamond').textContent = Number(save.diamond || 0).toLocaleString();
    if ($('mainRank')) $('mainRank').textContent = Number(save.rank || 1).toLocaleString();
    if ($('mainCoin')) $('mainCoin').textContent = Number(save.coin || 0).toLocaleString();

    const sortieBtn = $('sortieBtn');
    if (sortieBtn) sortieBtn.setAttribute('data-stage', currentStageText());
  }

  function ensureMainStoneLayer(){
    injectMainStyle();

    if (!mainScreen) return null;

    let layer = $('mainStoneDisplayLayer');
    if (layer) return layer;

    layer = document.createElement('div');
    layer.id = 'mainStoneDisplayLayer';
    layer.className = 'main-stone-display-layer';

    const showcase = mainScreen.querySelector('.player-showcase');

    if (showcase) {
      showcase.insertBefore(layer, showcase.firstChild);
    } else {
      mainScreen.appendChild(layer);
    }

    return layer;
  }

  function fallbackDisplayStones(){
    if (!window.MobShotCollection || !window.MobShotCollection.loadDisplayState) {
      return [];
    }

    const state = window.MobShotCollection.loadDisplayState();
    const display = Array.isArray(state.display) ? state.display : [];

    return display
      .filter(no => no)
      .map(no => ({
        no,
        image:`co/co${no}.png`
      }));
  }

  function getMainDisplayStones(){
    if (window.MobShotCollection && window.MobShotCollection.getDisplayStones) {
      return window.MobShotCollection.getDisplayStones();
    }

    return fallbackDisplayStones();
  }

  function refreshMainStoneDisplay(){
    const layer = ensureMainStoneLayer();
    if (!layer) return;

    const stones = getMainDisplayStones();

    if (!stones.length) {
      layer.innerHTML = '';
      layer.style.display = 'none';
      return;
    }

    layer.style.display = 'block';

    const loopStones = stones.concat(stones, stones, stones);

    layer.innerHTML = `
      <div class="main-stone-display-track">
        ${loopStones.map(stone => `
          <div class="main-stone-display-item">
            <img src="${stone.image}" alt="STONE" onerror="this.style.display='none'">
          </div>
        `).join('')}
      </div>
    `;
  }

  function refreshMainVisuals(){
    refreshMainStoneDisplay();

    if (window.MobShotEquip && window.MobShotEquip.updateMainPlayerImage) {
      window.MobShotEquip.updateMainPlayerImage();
    }

    if (window.MobShotPets && window.MobShotPets.renderAll) {
      window.MobShotPets.renderAll();
    }

    if (window.MobShotShop && window.MobShotShop.render) {
      window.MobShotShop.render();
    }

    if (window.MobShotEquip && window.MobShotEquip.render) {
      window.MobShotEquip.render();
    }

    if (window.MobShotMission && window.MobShotMission.render) {
      window.MobShotMission.render();
    }
  }

  function runHandler(handler, e){
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    handler(e);
  }

  function wireButton(ids, handler){
    ids.forEach(id => {
      const btn = $(id);

      if (!btn || btn.__mobMainBound) return;

      btn.__mobMainBound = true;

      btn.addEventListener('click', function(e){
        runHandler(handler, e);
      }, { passive:false });

      btn.addEventListener('pointerup', function(e){
        runHandler(handler, e);
      }, { passive:false });

      btn.addEventListener('touchend', function(e){
        runHandler(handler, e);
      }, { passive:false });
    });
  }

  function initImages(){
    if (!D) return;

    if (D.menu) {
      setImage('titleImg', D.menu.title);
      setImage('sortieImg', D.menu.sortie);
      setImage('shopImg', D.menu.shop);
      setImage('equipImg', D.menu.equip);
      setImage('petImg', D.menu.pet);
      setImage('gachaImg', D.menu.gacha);
      setImage('missionImg', D.menu.mission);
      setImage('collectionImg', D.menu.collection);
    }

    if (D.player) {
      setImage('mainPlayer', D.player.menuImage || D.player.image);
    }

    if (D.hud) {
      setImage('hudStageImg', D.hud.stage);
      setImage('hudScoreImg', D.hud.score);
      setImage('hudCoinImg', D.hud.coin);
      setImage('hudLifeImg', D.hud.life);
    }
  }

  function goMain(){
    if (window.MobShotGame && window.MobShotGame.stop) {
      window.MobShotGame.stop();
    }

    showScreen('main');
    refreshMainHud();
    refreshMainVisuals();
  }

  function goGame(){
    showScreen('game');
  }

  function openPetEquip(){
    if (window.MobShotPets && window.MobShotPets.openModal) {
      window.MobShotPets.openModal();
      return;
    }

    const modal = $('petEquipModal');
    if (modal) modal.classList.remove('hidden');
  }

  function openShop(){
    if (window.MobShotShop && window.MobShotShop.open) {
      window.MobShotShop.open();
      return;
    }

    const modal = $('shopModal');
    if (modal) modal.classList.remove('hidden');
  }

  function openEquip(){
    if (window.MobShotEquip && window.MobShotEquip.open) {
      window.MobShotEquip.open();
      return;
    }

    const modal = $('equipModal');
    if (modal) modal.classList.remove('hidden');
  }

  function openMission(){
    if (window.MobShotMission && window.MobShotMission.open) {
      window.MobShotMission.open();
      return;
    }

    const modal = $('missionModal');
    if (modal) modal.classList.remove('hidden');
  }

  function createDeleteSaveButton(){
    if (!mainScreen) return;

    let btn = $('deleteSaveBtn');
    if (btn) return;

    btn = document.createElement('button');
    btn.id = 'deleteSaveBtn';
    btn.type = 'button';
    btn.textContent = '🗑';
    btn.className = 'delete-save-btn';
    btn.setAttribute('aria-label', 'セーブ削除');

    btn.style.position = 'absolute';
    btn.style.left = '6.2vw';
    btn.style.top = '17.2svh';
    btn.style.width = '42px';
    btn.style.height = '42px';
    btn.style.zIndex = '20';
    btn.style.border = '2px solid rgba(255,255,255,.45)';
    btn.style.borderRadius = '50%';
    btn.style.padding = '0';
    btn.style.fontWeight = '1000';
    btn.style.fontSize = '20px';
    btn.style.lineHeight = '42px';
    btn.style.textAlign = 'center';
    btn.style.color = '#fff';
    btn.style.background = 'linear-gradient(#ff5b5b,#9d1212)';
    btn.style.boxShadow = '0 4px 0 rgba(0,0,0,.3), inset 0 2px 0 rgba(255,255,255,.18)';

    mainScreen.appendChild(btn);
  }

  function bindFallbackButton(id, handler, flag){
    const btn = $(id);

    if (!btn || btn[flag]) return;

    btn[flag] = true;

    btn.addEventListener('click', function(e){
      runHandler(handler, e);
    }, { passive:false });

    btn.addEventListener('pointerup', function(e){
      runHandler(handler, e);
    }, { passive:false });

    btn.addEventListener('touchend', function(e){
      runHandler(handler, e);
    }, { passive:false });
  }

  function bindResultButtons(){
    const retry = $('resultRetryBtn');

    if (retry && !retry.__mobRetryBound) {
      retry.__mobRetryBound = true;

      retry.addEventListener('click', function(e){
        runHandler(goGame, e);
      }, { passive:false });

      retry.addEventListener('pointerup', function(e){
        runHandler(goGame, e);
      }, { passive:false });
    }

    const resultHome = $('resultHomeBtn');

    if (resultHome && !resultHome.__mobHomeBound) {
      resultHome.__mobHomeBound = true;

      resultHome.addEventListener('click', function(e){
        runHandler(goMain, e);
      }, { passive:false });

      resultHome.addEventListener('pointerup', function(e){
        runHandler(goMain, e);
      }, { passive:false });
    }
  }

  function clearAllMobShotLocalStorage(){
    DELETE_KEYS.forEach(key => {
      localStorage.removeItem(key);
    });

    Object.keys(localStorage).forEach(key => {
      if (
        key.indexOf('mobshot_') === 0 ||
        key.indexOf('MOBSHOT_') === 0
      ) {
        localStorage.removeItem(key);
      }
    });
  }

  function bindDeleteSave(){
    const btn = $('deleteSaveBtn');

    if (!btn || btn.__mobDeleteBound) return;

    btn.__mobDeleteBound = true;

    btn.addEventListener('click', function(e){
      e.preventDefault();
      e.stopPropagation();

      showGameConfirm(
        'セーブ削除',
        '本当にセーブデータを削除しますか？\nコイン・ランク・ステージ進行・ショップ・装備・ペット・ミッション・ガチャ・コレクションを初期化します。',
        '削除する',
        'やめる',
        function(){
          clearAllMobShotLocalStorage();
          showToast('セーブデータを削除しました');

          setTimeout(function(){
            location.reload();
          }, 700);
        }
      );
    }, { passive:false });
  }

  function initModules(){
    if (window.MobShotShop && window.MobShotShop.init) {
      window.MobShotShop.init();
    }

    if (window.MobShotEquip && window.MobShotEquip.init) {
      window.MobShotEquip.init();
    }

    if (window.MobShotMission && window.MobShotMission.init) {
      window.MobShotMission.init();
    }

    if (window.MobShotPets && window.MobShotPets.init) {
      window.MobShotPets.init();
    }

    if (window.MobShotCollection && window.MobShotCollection.render) {
      window.MobShotCollection.render();
    }
  }

  function init(){
    preventSmartphoneZoom();
    injectMainStyle();
    initImages();
    refreshMainHud();

    createDeleteSaveButton();
    ensureGameConfirm();
    initModules();

    wireButton(['sortieBtn', 'btnSortie', 'mainSortieBtn'], goGame);
    wireButton(['backBtn', 'gameBackBtn'], goMain);

    bindFallbackButton('openShopBtn', openShop, '__mobShopFallbackBound');
    bindFallbackButton('openEquipBtn', openEquip, '__mobEquipFallbackBound');
    bindFallbackButton('openMissionBtn', openMission, '__mobMissionFallbackBound');
    bindFallbackButton('openPetEquipBtn', openPetEquip, '__mobPetFallbackBound');

    bindResultButtons();
    bindDeleteSave();

    refreshMainVisuals();

    window.addEventListener('mobshot:saveUpdated', function(){
      refreshMainHud();
      refreshMainVisuals();
    });

    window.addEventListener('mobshot:gachaUpdated', function(){
      refreshMainVisuals();
    });

    window.addEventListener('mobshot:collectionDisplayUpdated', function(){
      refreshMainStoneDisplay();
    });
  }

  window.addEventListener('DOMContentLoaded', init);

  window.MobShotMain = {
    showScreen,
    refreshMainHud,
    refreshMainVisuals,
    refreshMainStoneDisplay,
    goMain,
    goGame,
    openShop,
    openEquip,
    openMission,
    openPetEquip,
    showGameConfirm,
    showToast,
    clearAllMobShotLocalStorage
  };
})();
