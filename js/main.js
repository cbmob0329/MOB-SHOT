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

    document.addEventListener('gesturestart', e => e.preventDefault(), { passive:false });
    document.addEventListener('gesturechange', e => e.preventDefault(), { passive:false });
    document.addEventListener('gestureend', e => e.preventDefault(), { passive:false });
    document.addEventListener('dblclick', e => e.preventDefault(), { passive:false });

    document.addEventListener('touchend', function(e){
      const now = Date.now();
      if (now - lastTouchEnd <= 350) e.preventDefault();
      lastTouchEnd = now;
    }, { passive:false });
  }

  function injectMainStyle(){
    if ($('mobMainExtraStyle')) return;

    const style = document.createElement('style');
    style.id = 'mobMainExtraStyle';
    style.textContent = `
      .player-showcase{
        isolation:isolate;
      }

      .main-stone-display-layer{
        position:absolute;
        inset:0;
        z-index:0;
        pointer-events:none;
        overflow:visible;
      }

      #mainPlayer{
        z-index:5;
      }

      #mainPetFloatLayer{
        z-index:6;
        pointer-events:none;
      }

      .main-stone-display-item{
        position:absolute;
        width:92px;
        height:116px;
        display:flex;
        align-items:center;
        justify-content:center;
        opacity:.72;
        filter:drop-shadow(0 8px 0 rgba(0,0,0,.22));
        animation:mobStoneFloat 4.8s ease-in-out infinite;
      }

      .main-stone-display-item.left{
        left:-18px;
        top:38%;
        transform:translateY(-50%) rotate(-8deg);
      }

      .main-stone-display-item.top{
        left:50%;
        top:-18px;
        transform:translateX(-50%) rotate(3deg);
        animation-delay:-1.4s;
      }

      .main-stone-display-item.right{
        right:-18px;
        top:38%;
        transform:translateY(-50%) rotate(8deg);
        animation-delay:-2.7s;
      }

      .main-stone-display-item img{
        width:92px;
        height:116px;
        object-fit:contain;
      }

      @keyframes mobStoneFloat{
        0%{margin-top:8px}
        50%{margin-top:-10px}
        100%{margin-top:8px}
      }

      .main-rank-next-badge{
        position:absolute;
        left:6.2vw;
        top:22.8svh;
        z-index:21;
        min-width:142px;
        padding:7px 10px;
        border-radius:999px;
        background:rgba(5,8,22,.74);
        border:2px solid rgba(255,255,255,.28);
        box-shadow:0 4px 0 rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.12);
        color:#fff;
        font-size:11px;
        font-weight:1000;
        line-height:1.15;
        text-align:center;
        text-shadow:0 2px 0 #000;
        pointer-events:none;
      }

      .main-rank-next-badge strong{
        color:#ffe66b;
        font-size:12px;
      }

      .mob-rankup-modal{
        position:absolute;
        inset:0;
        z-index:190;
        display:flex;
        align-items:center;
        justify-content:center;
        padding:18px;
        background:rgba(0,0,0,.72);
      }

      .mob-rankup-modal.hidden{
        display:none;
      }

      .mob-rankup-card{
        width:min(90vw,420px);
        border-radius:30px;
        padding:22px 18px 18px;
        text-align:center;
        background:linear-gradient(180deg,rgba(39,31,88,.98),rgba(8,10,28,.98));
        border:4px solid rgba(255,230,107,.78);
        box-shadow:0 18px 50px rgba(0,0,0,.72), inset 0 0 0 2px rgba(255,255,255,.12);
        animation:mobRankPop .26s ease-out;
      }

      .mob-rankup-title{
        margin:0 0 8px;
        color:#ffe66b;
        font-size:34px;
        font-weight:1000;
        text-shadow:0 5px 0 #000;
        letter-spacing:.04em;
      }

      .mob-rankup-rank{
        margin:0 0 12px;
        color:#fff;
        font-size:42px;
        font-weight:1000;
        text-shadow:0 5px 0 #000;
      }

      .mob-rankup-text{
        margin:0 0 16px;
        color:#dfe8ff;
        font-size:15px;
        font-weight:900;
        line-height:1.55;
        white-space:pre-line;
      }

      .mob-rankup-btn{
        border:0;
        border-radius:999px;
        padding:13px 28px;
        color:#210800;
        background:linear-gradient(#ffe66b,#ff9f1f);
        font-size:18px;
        font-weight:1000;
        box-shadow:0 5px 0 rgba(0,0,0,.38);
      }

      @keyframes mobRankPop{
        0%{transform:scale(.82); opacity:0}
        100%{transform:scale(1); opacity:1}
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

  function ensureRankNextBadge(){
    injectMainStyle();

    if (!mainScreen) return null;

    let badge = $('mainRankNextBadge');
    if (badge) return badge;

    badge = document.createElement('div');
    badge.id = 'mainRankNextBadge';
    badge.className = 'main-rank-next-badge';
    badge.innerHTML = 'NEXT RANK<br><strong>---</strong>';

    mainScreen.appendChild(badge);
    return badge;
  }

  function rankNextText(save){
    const rank = Number(save.rank || 1);
    const totalScore = Number(save.totalScore || 0);

    if (!window.MobShotStorage || !window.MobShotStorage.scoreNeedForRank) {
      return 'NEXT RANK<br><strong>---</strong>';
    }

    const maxRank = Number(window.MobShotStorage.RANK_MAX || 100);

    if (rank >= maxRank) {
      return 'RANK MAX<br><strong>COMPLETE</strong>';
    }

    const nextNeed = Number(window.MobShotStorage.scoreNeedForRank(rank + 1) || 0);
    const rest = Math.max(0, nextNeed - totalScore);

    return `NEXT RANK<br><strong>あと ${rest.toLocaleString()} SCORE</strong>`;
  }

  function ensureRankUpModal(){
    injectMainStyle();

    let modal = $('mobRankUpModal');
    if (modal) return modal;

    modal = document.createElement('div');
    modal.id = 'mobRankUpModal';
    modal.className = 'mob-rankup-modal hidden';
    modal.innerHTML = `
      <div class="mob-rankup-card">
        <h2 class="mob-rankup-title">RANK UP!</h2>
        <div id="mobRankUpRank" class="mob-rankup-rank">RANK 1</div>
        <div id="mobRankUpText" class="mob-rankup-text"></div>
        <button id="mobRankUpOk" class="mob-rankup-btn" type="button">OK</button>
      </div>
    `;

    (mainScreen || $('app') || document.body).appendChild(modal);

    const ok = $('mobRankUpOk');
    if (ok) {
      ok.addEventListener('click', function(e){
        e.preventDefault();
        e.stopPropagation();
        modal.classList.add('hidden');
      }, { passive:false });
    }

    return modal;
  }

  function showRankUp(detail){
    const modal = ensureRankUpModal();
    if (!modal) return;

    const rank = Number(detail && detail.rank || 1);
    const beforeRank = Number(detail && detail.beforeRank || Math.max(1, rank - 1));
    const totalScore = Number(detail && detail.totalScore || 0);
    const maxRank = window.MobShotStorage ? Number(window.MobShotStorage.RANK_MAX || 100) : 100;

    const rankEl = $('mobRankUpRank');
    const textEl = $('mobRankUpText');

    if (rankEl) rankEl.textContent = `RANK ${beforeRank} → ${rank}`;

    if (textEl) {
      if (rank >= maxRank) {
        textEl.textContent = `最高ランクに到達しました！\nTOTAL SCORE ${totalScore.toLocaleString()}`;
      } else if (window.MobShotStorage && window.MobShotStorage.scoreNeedForRank) {
        const nextNeed = Number(window.MobShotStorage.scoreNeedForRank(rank + 1) || 0);
        const rest = Math.max(0, nextNeed - totalScore);
        textEl.textContent = `TOTAL SCORE ${totalScore.toLocaleString()}\n次のランクまで あと ${rest.toLocaleString()} SCORE`;
      } else {
        textEl.textContent = `TOTAL SCORE ${totalScore.toLocaleString()}`;
      }
    }

    modal.classList.remove('hidden');
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
      rank:1
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

    const badge = ensureRankNextBadge();
    if (badge) badge.innerHTML = rankNextText(save);

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

    const positions = ['left', 'top', 'right'];

    layer.innerHTML = stones.slice(0, 3).map((stone, index) => `
      <div class="main-stone-display-item ${positions[index] || 'top'}">
        <img src="${stone.image}" alt="STONE" onerror="this.style.display='none'">
      </div>
    `).join('');
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

      btn.addEventListener('click', e => runHandler(handler, e), { passive:false });
      btn.addEventListener('pointerup', e => runHandler(handler, e), { passive:false });
      btn.addEventListener('touchend', e => runHandler(handler, e), { passive:false });
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

    btn.addEventListener('click', e => runHandler(handler, e), { passive:false });
    btn.addEventListener('pointerup', e => runHandler(handler, e), { passive:false });
    btn.addEventListener('touchend', e => runHandler(handler, e), { passive:false });
  }

  function bindResultButtons(){
    const retry = $('resultRetryBtn');

    if (retry && !retry.__mobRetryBound) {
      retry.__mobRetryBound = true;
      retry.addEventListener('click', e => runHandler(goGame, e), { passive:false });
      retry.addEventListener('pointerup', e => runHandler(goGame, e), { passive:false });
    }

    const resultHome = $('resultHomeBtn');

    if (resultHome && !resultHome.__mobHomeBound) {
      resultHome.__mobHomeBound = true;
      resultHome.addEventListener('click', e => runHandler(goMain, e), { passive:false });
      resultHome.addEventListener('pointerup', e => runHandler(goMain, e), { passive:false });
    }
  }

  function clearAllMobShotLocalStorage(){
    DELETE_KEYS.forEach(key => localStorage.removeItem(key));

    Object.keys(localStorage).forEach(key => {
      if (key.indexOf('mobshot_') === 0 || key.indexOf('MOBSHOT_') === 0) {
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
    if (window.MobShotShop && window.MobShotShop.init) window.MobShotShop.init();
    if (window.MobShotEquip && window.MobShotEquip.init) window.MobShotEquip.init();
    if (window.MobShotMission && window.MobShotMission.init) window.MobShotMission.init();
    if (window.MobShotPets && window.MobShotPets.init) window.MobShotPets.init();
    if (window.MobShotCollection && window.MobShotCollection.render) window.MobShotCollection.render();
  }

  function init(){
    preventSmartphoneZoom();
    injectMainStyle();
    initImages();
    refreshMainHud();

    createDeleteSaveButton();
    ensureRankNextBadge();
    ensureRankUpModal();
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

    window.addEventListener('mobshot:rankUp', function(e){
      refreshMainHud();
      showRankUp(e.detail || {});
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
    showRankUp,
    clearAllMobShotLocalStorage
  };
})();
