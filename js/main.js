'use strict';

(function(){
  const D = window.MOBSHOT_DATA;

  const ADMIN_SAVE_KEY = 'mobshot_admin_mode_v1';
  const ADMIN_PASSWORD = 'Cb110329';

  const BATTLE_MODE_ICON = 'mt/petbattle.png';

  const mainScreen =
    document.getElementById('mainScreen') ||
    document.getElementById('mainView') ||
    document.querySelector('.screen');

  const gameScreen =
    document.getElementById('gameScreen') ||
    document.getElementById('gameView');

  const battleScreen =
    document.getElementById('battleScreen') ||
    document.getElementById('battleView');

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

  function getBattleApi(){
    return window.MobShotBattleMode || window.MobShotBattle || null;
  }

  function isAdminMode(){
    try {
      return localStorage.getItem(ADMIN_SAVE_KEY) === '1';
    } catch(e) {
      return false;
    }
  }

  function setAdminMode(value){
    try {
      localStorage.setItem(ADMIN_SAVE_KEY, value ? '1' : '0');
    } catch(e) {}

    applyAdminModeVisuals();

    window.dispatchEvent(new CustomEvent('mobshot:adminModeChanged', {
      detail:{ active:!!value }
    }));
  }

  function applyAdminModeVisuals(){
    const active = isAdminMode();

    [
      'testClearBtn',
      'testStageBtn',
      'testSortieBtn',
      'gameBackBtn',
      'backBtn'
    ].forEach(id => {
      const el = $(id);
      if (el) el.style.display = active ? '' : 'none';
    });

    document.querySelectorAll('.test-sortie,.test-stage-open,.admin-only,.mob-admin-only').forEach(el => {
      el.style.display = active ? '' : 'none';
    });

    document.body.classList.toggle('mob-admin-mode', active);
    setBattleModeIcon();
  }

  function setupAdminObserver(){
    if (document.__mobAdminObserverBound) return;
    document.__mobAdminObserverBound = true;

    const observer = new MutationObserver(function(){
      applyAdminModeVisuals();
      setBattleModeIcon();
    });

    observer.observe(document.body, {
      childList:true,
      subtree:true
    });
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
      .player-showcase{isolation:isolate}
      .main-stone-display-layer{position:absolute;inset:0;z-index:0;pointer-events:none;overflow:visible}
      .main-soul-orbit-layer{position:absolute;inset:0;z-index:7;pointer-events:none;overflow:visible}
      #mainPlayer{z-index:5}
      #mainPetFloatLayer,.main-pet-float-layer{z-index:6;pointer-events:none}

      .main-stone-display-item{
        position:absolute;width:92px;height:116px;display:flex;align-items:center;justify-content:center;
        opacity:.72;filter:drop-shadow(0 8px 0 rgba(0,0,0,.22));animation:mobStoneFloat 4.8s ease-in-out infinite;
      }
      .main-stone-display-item.left{left:-18px;top:38%;transform:translateY(-50%) rotate(-8deg)}
      .main-stone-display-item.top{left:50%;top:-18px;transform:translateX(-50%) rotate(3deg);animation-delay:-1.4s}
      .main-stone-display-item.right{right:-18px;top:38%;transform:translateY(-50%) rotate(8deg);animation-delay:-2.7s}
      .main-stone-display-item img{width:92px;height:116px;object-fit:contain}

      @keyframes mobStoneFloat{0%{margin-top:8px}50%{margin-top:-10px}100%{margin-top:8px}}

      .main-soul-orbit{
        position:absolute;
        left:50%;
        top:48%;
        width:178px;
        height:178px;
        margin-left:-89px;
        margin-top:-89px;
        border-radius:50%;
        transform-origin:center center;
        animation:mobSoulOrbitSpin var(--soul-duration, 8s) linear infinite;
        animation-delay:var(--soul-delay, 0s);
      }

      .main-soul-orbit-item{
        position:absolute;
        left:50%;
        top:-8px;
        width:54px;
        height:54px;
        margin-left:-27px;
        display:flex;
        align-items:center;
        justify-content:center;
        border-radius:50%;
        background:radial-gradient(circle,rgba(255,157,240,.22),rgba(117,75,255,.10) 58%,transparent 70%);
        filter:drop-shadow(0 7px 0 rgba(0,0,0,.25)) drop-shadow(0 0 10px rgba(255,157,240,.38));
        animation:mobSoulItemFloat 2.2s ease-in-out infinite;
      }

      .main-soul-orbit-item img{
        width:46px;
        height:46px;
        object-fit:contain;
        transform-origin:center center;
        animation:mobSoulImageCounter var(--soul-duration, 8s) linear infinite;
        animation-delay:var(--soul-delay, 0s);
      }

      .main-soul-orbit:nth-child(2) .main-soul-orbit-item{animation-delay:-.7s}
      .main-soul-orbit:nth-child(3) .main-soul-orbit-item{animation-delay:-1.4s}

      @keyframes mobSoulOrbitSpin{
        0%{transform:rotate(var(--soul-orbit-start, 0deg))}
        100%{transform:rotate(var(--soul-orbit-end, 360deg))}
      }

      @keyframes mobSoulItemFloat{
        0%{margin-top:0;transform:scale(1)}
        50%{margin-top:-8px;transform:scale(1.08)}
        100%{margin-top:0;transform:scale(1)}
      }

      @keyframes mobSoulImageCounter{
        0%{transform:rotate(var(--soul-counter-start, 0deg))}
        100%{transform:rotate(var(--soul-counter-end, -360deg))}
      }

      .mob-battle-mode-image-btn{
        display:flex!important;
        align-items:center!important;
        justify-content:center!important;
        padding:0!important;
        overflow:hidden!important;
        color:transparent!important;
        font-size:0!important;
        line-height:0!important;
        text-indent:0!important;
        white-space:normal!important;
      }

      .mob-battle-mode-image-btn .mob-battle-mode-icon{
        display:block!important;
        width:100%!important;
        height:100%!important;
        max-width:100%!important;
        max-height:100%!important;
        object-fit:contain!important;
        pointer-events:none!important;
      }

      .main-rank-next-badge{
        position:absolute;left:3vw;right:32vw;top:auto;bottom:calc(11.8svh + 108px);z-index:21;
        min-width:0;padding:7px 10px;border-radius:999px;background:rgba(5,8,22,.74);
        border:2px solid rgba(255,255,255,.28);box-shadow:0 4px 0 rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.12);
        color:#fff;font-size:11px;font-weight:1000;line-height:1.15;text-align:center;text-shadow:0 2px 0 #000;pointer-events:none;
      }
      .main-rank-next-badge strong{color:#ffe66b;font-size:12px}

      .pet-equip-panel{padding:8px!important}
      #petEquipSlots{
        display:grid!important;
        grid-template-columns:repeat(4,1fr)!important;
        gap:6px!important;
      }
      .pet-slot{
        height:58px!important;
        min-width:0!important;
        padding:4px!important;
      }
      .pet-slot img{
        width:38px!important;
        height:38px!important;
        object-fit:contain!important;
      }
      .pet-slot-name{
        max-width:100%!important;
        font-size:10px!important;
        line-height:1.05!important;
        white-space:nowrap!important;
        overflow:hidden!important;
        text-overflow:ellipsis!important;
      }
      .pet-slot-num{
        font-size:11px!important;
      }

      #mainPetFloatLayer,.main-pet-float-layer{
        position:absolute!important;
        inset:0!important;
        display:block!important;
        pointer-events:none!important;
        z-index:6!important;
      }
      .main-float-pet{
        position:absolute!important;
        width:58px!important;
        height:58px!important;
        display:flex!important;
        align-items:center!important;
        justify-content:center!important;
        font-size:28px!important;
        filter:drop-shadow(0 8px 0 rgba(0,0,0,.28));
      }
      .main-float-pet img{
        width:44px!important;
        height:44px!important;
        object-fit:contain!important;
      }

      .main-float-pet.pet-float-1{left:13%!important;bottom:16%!important}
      .main-float-pet.pet-float-2{left:33%!important;bottom:20%!important}
      .main-float-pet.pet-float-3{left:57%!important;bottom:16%!important}
      .main-float-pet.pet-float-4{left:77%!important;bottom:20%!important}

      .main-float-pet:nth-child(1):not(.pet-float-1){left:13%!important;bottom:16%!important}
      .main-float-pet:nth-child(2):not(.pet-float-2){left:33%!important;bottom:20%!important}
      .main-float-pet:nth-child(3):not(.pet-float-3){left:57%!important;bottom:16%!important}
      .main-float-pet:nth-child(4):not(.pet-float-4){left:77%!important;bottom:20%!important}

      @media (max-height:720px){
        .main-rank-next-badge{bottom:calc(10.8svh + 92px)}
        .pet-slot{height:50px!important}
        .pet-slot img{width:34px!important;height:34px!important}
        .pet-slot-name{font-size:9px!important}
        .main-float-pet{width:50px!important;height:50px!important;font-size:24px!important}
        .main-float-pet img{width:36px!important;height:36px!important}
        .main-soul-orbit{width:146px;height:146px;margin-left:-73px;margin-top:-73px}
        .main-soul-orbit-item{width:46px;height:46px;margin-left:-23px}
        .main-soul-orbit-item img{width:38px;height:38px}
      }

      .mob-rankup-modal,.mob-game-confirm,.mob-admin-pass-modal{
        position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(0,0,0,.72);
      }
      .mob-rankup-modal{z-index:190}
      .mob-game-confirm{z-index:160}
      .mob-admin-pass-modal{z-index:175}
      .mob-rankup-modal.hidden,.mob-game-confirm.hidden,.mob-admin-pass-modal.hidden{display:none}

      .mob-rankup-card,.mob-game-confirm-card,.mob-admin-pass-card{
        width:min(92vw,430px);border-radius:26px;padding:18px;text-align:center;
        background:linear-gradient(180deg,rgba(34,27,72,.98),rgba(5,8,22,.98));
        border:3px solid rgba(255,255,255,.36);box-shadow:0 18px 48px rgba(0,0,0,.7);
      }

      .mob-rankup-title,.mob-game-confirm-title,.mob-admin-pass-title{
        margin:0 0 10px;font-size:24px;font-weight:1000;color:#fff;text-shadow:0 3px 0 #000;
      }

      .mob-rankup-rank{
        margin:0 0 12px;color:#ffe66b;font-size:36px;font-weight:1000;text-shadow:0 5px 0 #000;
      }

      .mob-rankup-text,.mob-game-confirm-text,.mob-admin-pass-text{
        font-size:14px;line-height:1.6;font-weight:900;color:#dfe8ff;margin-bottom:14px;white-space:pre-line;
      }

      .mob-game-confirm-actions,.mob-admin-pass-actions{
        display:grid;grid-template-columns:1fr 1fr;gap:10px;
      }

      .mob-game-confirm-btn,.mob-admin-pass-btn,.mob-rankup-btn{
        border:0;border-radius:999px;padding:12px 14px;font-size:15px;font-weight:1000;box-shadow:0 4px 0 rgba(0,0,0,.35);
      }

      .mob-game-confirm-btn.yes,.mob-admin-pass-btn.ok,.mob-rankup-btn{
        color:#210800;background:linear-gradient(#ffe66b,#ffb423);
      }

      .mob-game-confirm-btn.no,.mob-admin-pass-btn.cancel{
        color:#102033;background:linear-gradient(#ffffff,#b7c1d5);
      }

      .mob-admin-pass-input{
        width:100%;margin:0 0 12px;padding:13px 14px;border-radius:16px;border:2px solid rgba(255,255,255,.35);
        background:rgba(0,0,0,.32);color:#fff;font-size:18px;font-weight:900;text-align:center;outline:none;
      }

      .mob-game-toast{
        position:absolute;left:50%;top:22%;transform:translateX(-50%);z-index:170;min-width:220px;max-width:86vw;
        padding:12px 16px;border-radius:999px;background:linear-gradient(#ffe66b,#ffb423);color:#181000;
        font-size:14px;font-weight:1000;text-align:center;box-shadow:0 6px 0 rgba(0,0,0,.35);
        pointer-events:none;opacity:0;transition:opacity .2s, transform .2s;
      }
      .mob-game-toast.show{opacity:1;transform:translateX(-50%) translateY(-4px)}

      body:not(.mob-admin-mode) #testClearBtn,
      body:not(.mob-admin-mode) #testStageBtn,
      body:not(.mob-admin-mode) #testSortieBtn,
      body:not(.mob-admin-mode) #gameBackBtn,
      body:not(.mob-admin-mode) #backBtn,
      body:not(.mob-admin-mode) .test-sortie,
      body:not(.mob-admin-mode) .test-stage-open,
      body:not(.mob-admin-mode) .admin-only,
      body:not(.mob-admin-mode) .mob-admin-only{
        display:none!important;
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

    if ($('mobRankUpRank')) $('mobRankUpRank').textContent = `RANK ${beforeRank} → ${rank}`;

    if ($('mobRankUpText')) {
      if (rank >= maxRank) {
        $('mobRankUpText').textContent = `最高ランクに到達しました！\nTOTAL SCORE ${totalScore.toLocaleString()}`;
      } else if (window.MobShotStorage && window.MobShotStorage.scoreNeedForRank) {
        const nextNeed = Number(window.MobShotStorage.scoreNeedForRank(rank + 1) || 0);
        const rest = Math.max(0, nextNeed - totalScore);
        $('mobRankUpText').textContent = `TOTAL SCORE ${totalScore.toLocaleString()}\n次のランクまで あと ${rest.toLocaleString()} SCORE`;
      } else {
        $('mobRankUpText').textContent = `TOTAL SCORE ${totalScore.toLocaleString()}`;
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

  function showGameConfirm(title, text, yesText, noText, onYes, onNo){
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
      if (onNo) onNo();
    };

    modal.classList.remove('hidden');
  }

  function ensureAdminPassModal(){
    injectMainStyle();

    let modal = $('mobAdminPassModal');
    if (modal) return modal;

    modal = document.createElement('div');
    modal.id = 'mobAdminPassModal';
    modal.className = 'mob-admin-pass-modal hidden';
    modal.innerHTML = `
      <div class="mob-admin-pass-card">
        <div id="mobAdminPassTitle" class="mob-admin-pass-title">管理者パスワード</div>
        <div id="mobAdminPassText" class="mob-admin-pass-text"></div>
        <input id="mobAdminPassInput" class="mob-admin-pass-input" type="password" autocomplete="off" inputmode="text">
        <div class="mob-admin-pass-actions">
          <button id="mobAdminPassOk" class="mob-admin-pass-btn ok" type="button">決定</button>
          <button id="mobAdminPassCancel" class="mob-admin-pass-btn cancel" type="button">戻る</button>
        </div>
      </div>
    `;

    (mainScreen || $('app') || document.body).appendChild(modal);

    $('mobAdminPassCancel').addEventListener('click', function(e){
      e.preventDefault();
      e.stopPropagation();
      modal.classList.add('hidden');
    }, { passive:false });

    $('mobAdminPassInput').addEventListener('keydown', function(e){
      if (e.key === 'Enter') {
        e.preventDefault();
        $('mobAdminPassOk').click();
      }
    });

    return modal;
  }

  function openAdminPassword(){
    const modal = ensureAdminPassModal();
    const input = $('mobAdminPassInput');
    const active = isAdminMode();

    $('mobAdminPassText').textContent = active
      ? '現在は管理者モードです。\nパスワードを入力すると解除します。'
      : 'パスワードを入力すると管理者モードになります。';

    input.value = '';

    $('mobAdminPassOk').onclick = function(e){
      e.preventDefault();
      e.stopPropagation();

      if (input.value !== ADMIN_PASSWORD) {
        showToast('パスワードが違います');
        input.value = '';
        return;
      }

      const next = !isAdminMode();
      setAdminMode(next);
      modal.classList.add('hidden');

      showToast(next ? '管理者モードになりました' : '管理者モードを解除しました');
    };

    modal.classList.remove('hidden');

    setTimeout(function(){
      input.focus();
    }, 80);
  }

  function openTrashMenu(){
    showGameConfirm(
      '管理メニュー',
      isAdminMode()
        ? '操作を選択してください。\n現在：管理者モード ON'
        : '操作を選択してください。\n現在：通常モード',
      'セーブ削除',
      isAdminMode() ? '管理者解除' : '管理者として入場',
      function(){
        confirmDeleteSave();
      },
      function(){
        openAdminPassword();
      }
    );
  }

  function confirmDeleteSave(){
    showGameConfirm(
      'セーブ削除',
      '本当にセーブデータを削除しますか？\nコイン・ランク・ステージ進行・ショップ・装備・ペット・ミッション・ガチャ・コレクションを初期化します。',
      'はい',
      'いいえ',
      function(){
        clearAllMobShotLocalStorage();
        showToast('セーブデータを削除しました');

        setTimeout(function(){
          location.reload();
        }, 700);
      }
    );
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

  function stopActiveGames(){
    if (window.MobShotGame && window.MobShotGame.stop) {
      window.MobShotGame.stop();
    }

    const battleApi = getBattleApi();
    if (battleApi && battleApi.stop) {
      battleApi.stop();
    }
  }

  function showScreen(name){
    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.remove('active');
    });

    if (name === 'game') {
      const battleApi = getBattleApi();
      if (battleApi && battleApi.stop) battleApi.stop();

      if (gameScreen) gameScreen.classList.add('active');

      if (window.MobShotGame && window.MobShotGame.start) {
        window.MobShotGame.start();
      } else {
        showToast('ゲーム本体が読み込まれていません');
      }

      setTimeout(applyAdminModeVisuals, 80);
      return;
    }

    if (name === 'battle') {
      if (window.MobShotGame && window.MobShotGame.stop) {
        window.MobShotGame.stop();
      }

      const battleApi = getBattleApi();

      if (!battleScreen) {
        showToast('対戦画面がありません');
        showScreen('main');
        return;
      }

      battleScreen.classList.add('active');

      if (battleApi && battleApi.openTitle) {
        battleApi.openTitle();
      } else if (battleApi && battleApi.startTitle) {
        battleApi.startTitle();
      } else if (battleApi && battleApi.start) {
        battleApi.start();
      } else {
        showToast('対戦モードが読み込まれていません');
        showScreen('main');
      }

      setTimeout(applyAdminModeVisuals, 80);
      return;
    }

    stopActiveGames();

    if (mainScreen) mainScreen.classList.add('active');

    refreshMainHud();
    refreshMainVisuals();
    applyAdminModeVisuals();
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

  function shouldUseAsBattleButton(btn){
    if (!btn) return false;

    const id = String(btn.id || '');
    const className = String(btn.className || '');
    const label = String(btn.textContent || '').trim();

    if ([
      'battleBtn',
      'openBattleBtn',
      'pvpBtn',
      'versusBtn'
    ].includes(id)) return true;

    if (id.toLowerCase().indexOf('battle') >= 0) return true;
    if (id.toLowerCase().indexOf('pvp') >= 0) return true;
    if (id.toLowerCase().indexOf('versus') >= 0) return true;

    if (className.toLowerCase().indexOf('battle') >= 0) return true;
    if (className.toLowerCase().indexOf('pvp') >= 0) return true;
    if (className.toLowerCase().indexOf('versus') >= 0) return true;

    if (label === '対戦') return true;
    if (label === 'BATTLE') return true;
    if (label === 'BATTLE MODE') return true;
    if (label === 'バトル') return true;

    return false;
  }

  function convertButtonToBattleIcon(btn){
    if (!btn) return;

    btn.setAttribute('aria-label', 'BATTLE MODE');
    btn.setAttribute('title', 'BATTLE MODE');
    btn.classList.add('mob-battle-mode-image-btn');

    let img = btn.querySelector('img.mob-battle-mode-icon');

    if (!img) {
      while (btn.firstChild) {
        btn.removeChild(btn.firstChild);
      }

      img = document.createElement('img');
      img.className = 'mob-battle-mode-icon';
      img.alt = 'BATTLE MODE';
      img.src = BATTLE_MODE_ICON;

      img.onerror = function(){
        img.style.display = 'none';
        btn.classList.remove('mob-battle-mode-image-btn');
        btn.textContent = 'BATTLE MODE';
      };

      btn.appendChild(img);
    } else {
      img.src = BATTLE_MODE_ICON;
      img.alt = 'BATTLE MODE';
      img.style.display = '';
    }
  }

  function setBattleModeIcon(){
    [
      'battleImg',
      'battleModeImg',
      'battleIcon',
      'battleModeIcon'
    ].forEach(id => {
      setImage(id, BATTLE_MODE_ICON);
    });

    [
      'battleBtn',
      'openBattleBtn',
      'pvpBtn',
      'versusBtn'
    ].forEach(id => {
      const btn = $(id);
      if (btn) convertButtonToBattleIcon(btn);
    });

    document.querySelectorAll('button').forEach(btn => {
      if (shouldUseAsBattleButton(btn)) {
        convertButtonToBattleIcon(btn);
      }
    });
  }

  function readSave(){
    if (window.MobShotStorage && window.MobShotStorage.load) {
      return window.MobShotStorage.load();
    }

    return { totalScore:0, bestScore:0, coin:0, diamond:0, rank:1 };
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

    applyAdminModeVisuals();
  }

  function getShowcase(){
    if (!mainScreen) return null;
    return mainScreen.querySelector('.player-showcase') || mainScreen;
  }

  function ensureMainStoneLayer(){
    injectMainStyle();

    if (!mainScreen) return null;

    let layer = $('mainStoneDisplayLayer');
    if (layer) return layer;

    layer = document.createElement('div');
    layer.id = 'mainStoneDisplayLayer';
    layer.className = 'main-stone-display-layer';

    const showcase = getShowcase();

    if (showcase) {
      showcase.insertBefore(layer, showcase.firstChild);
    } else {
      mainScreen.appendChild(layer);
    }

    return layer;
  }

  function ensureMainSoulLayer(){
    injectMainStyle();

    if (!mainScreen) return null;

    let layer = $('mainSoulOrbitLayer');
    if (layer) return layer;

    layer = document.createElement('div');
    layer.id = 'mainSoulOrbitLayer';
    layer.className = 'main-soul-orbit-layer';

    const showcase = getShowcase();

    if (showcase) {
      showcase.appendChild(layer);
    } else {
      mainScreen.appendChild(layer);
    }

    return layer;
  }

  function fallbackDisplayStones(){
    if (!window.MobShotCollection || !window.MobShotCollection.loadDisplayState) return [];

    const state = window.MobShotCollection.loadDisplayState();
    const display = Array.isArray(state.display) ? state.display : [];

    return display.filter(no => no).map(no => ({ no, image:`co/co${no}.png` }));
  }

  function fallbackDisplaySouls(){
    if (!window.MobShotCollection || !window.MobShotCollection.loadDisplayState) return [];

    const state = window.MobShotCollection.loadDisplayState();
    const display = Array.isArray(state.soulDisplay) ? state.soulDisplay : [];

    return display.filter(no => no).map(no => ({ no, image:`soul/${no}.png` }));
  }

  function getMainDisplayStones(){
    if (window.MobShotCollection && window.MobShotCollection.getDisplayStones) {
      return window.MobShotCollection.getDisplayStones();
    }

    return fallbackDisplayStones();
  }

  function getMainDisplaySouls(){
    if (window.MobShotCollection && window.MobShotCollection.getDisplaySouls) {
      return window.MobShotCollection.getDisplaySouls();
    }

    return fallbackDisplaySouls();
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

  function refreshMainSoulDisplay(){
    const layer = ensureMainSoulLayer();
    if (!layer) return;

    const souls = getMainDisplaySouls();

    if (!souls.length) {
      layer.innerHTML = '';
      layer.style.display = 'none';
      return;
    }

    layer.style.display = 'block';

    const orbitSettings = [
      {
        className:'',
        duration:'8s',
        delay:'0s',
        orbitStart:'0deg',
        orbitEnd:'360deg',
        counterStart:'0deg',
        counterEnd:'-360deg'
      },
      {
        className:'reverse',
        duration:'10s',
        delay:'-2.2s',
        orbitStart:'120deg',
        orbitEnd:'-240deg',
        counterStart:'-120deg',
        counterEnd:'240deg'
      },
      {
        className:'slow',
        duration:'12s',
        delay:'-4.4s',
        orbitStart:'240deg',
        orbitEnd:'600deg',
        counterStart:'-240deg',
        counterEnd:'-600deg'
      }
    ];

    layer.innerHTML = souls.slice(0, 3).map((soul, index) => {
      const set = orbitSettings[index] || orbitSettings[0];

      return `
        <div
          class="main-soul-orbit ${set.className}"
          style="
            --soul-duration:${set.duration};
            --soul-delay:${set.delay};
            --soul-orbit-start:${set.orbitStart};
            --soul-orbit-end:${set.orbitEnd};
            --soul-counter-start:${set.counterStart};
            --soul-counter-end:${set.counterEnd};
          "
        >
          <div class="main-soul-orbit-item">
            <img src="${soul.image}" alt="SOUL" onerror="this.style.display='none'">
          </div>
        </div>
      `;
    }).join('');
  }

  function refreshMainVisuals(){
    refreshMainStoneDisplay();
    refreshMainSoulDisplay();
    setBattleModeIcon();

    if (window.MobShotEquip && window.MobShotEquip.updateMainPlayerImage) window.MobShotEquip.updateMainPlayerImage();
    if (window.MobShotPets && window.MobShotPets.renderAll) window.MobShotPets.renderAll();
    if (window.MobShotShop && window.MobShotShop.render) window.MobShotShop.render();
    if (window.MobShotEquip && window.MobShotEquip.render) window.MobShotEquip.render();
    if (window.MobShotMission && window.MobShotMission.render) window.MobShotMission.render();

    setBattleModeIcon();
    applyAdminModeVisuals();
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
    if (!D) {
      setBattleModeIcon();
      return;
    }

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

    setBattleModeIcon();

    if (D.player) {
      setImage('mainPlayer', D.player.menuImage || D.player.image);
    }

    if (D.hud) {
      setImage('hudStageImg', D.hud.stage);
      setImage('hudScoreImg', D.hud.score);
      setImage('hudCoinImg', D.hud.coin);
      setImage('hudLifeImg', D.hud.life);
    }

    setBattleModeIcon();
  }

  function goMain(){
    stopActiveGames();
    showScreen('main');
  }

  function goGame(){
    showScreen('game');
  }

  function goBattle(){
    showScreen('battle');
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

  function openGacha(){
    if (window.MobShotGacha && window.MobShotGacha.open) {
      window.MobShotGacha.open();
      return;
    }

    if (window.MobShotGacha && window.MobShotGacha.openModal) {
      window.MobShotGacha.openModal();
      return;
    }

    const modal = $('gachaModal');
    if (modal) {
      modal.classList.remove('hidden');
      return;
    }

    showToast('ガチャが読み込まれていません');
  }

  function openCollection(){
    if (window.MobShotCollection && window.MobShotCollection.open) {
      window.MobShotCollection.open();
      return;
    }

    if (window.MobShotCollection && window.MobShotCollection.openModal) {
      window.MobShotCollection.openModal();
      return;
    }

    const modal = $('collectionModal');
    if (modal) {
      modal.classList.remove('hidden');
      return;
    }

    showToast('コレクションが読み込まれていません');
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
    btn.setAttribute('aria-label', '管理メニュー');

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
      openTrashMenu();
    }, { passive:false });

    btn.addEventListener('pointerup', function(e){
      e.preventDefault();
      e.stopPropagation();
      openTrashMenu();
    }, { passive:false });
  }

  function initModules(){
    if (window.MobShotShop && window.MobShotShop.init) window.MobShotShop.init();
    if (window.MobShotEquip && window.MobShotEquip.init) window.MobShotEquip.init();
    if (window.MobShotMission && window.MobShotMission.init) window.MobShotMission.init();
    if (window.MobShotPets && window.MobShotPets.init) window.MobShotPets.init();
    if (window.MobShotCollection && window.MobShotCollection.render) window.MobShotCollection.render();
    if (window.MobShotGacha && window.MobShotGacha.render) window.MobShotGacha.render();
  }

  function init(){
    preventSmartphoneZoom();
    injectMainStyle();
    setupAdminObserver();
    initImages();
    refreshMainHud();

    createDeleteSaveButton();
    ensureRankNextBadge();
    ensureRankUpModal();
    ensureGameConfirm();
    ensureAdminPassModal();
    initModules();

    wireButton(['sortieBtn', 'btnSortie', 'mainSortieBtn'], goGame);
    wireButton(['battleBtn', 'openBattleBtn', 'pvpBtn', 'versusBtn'], goBattle);
    wireButton(['backBtn', 'gameBackBtn', 'battleBackBtn'], goMain);

    bindFallbackButton('openShopBtn', openShop, '__mobShopFallbackBound');
    bindFallbackButton('openEquipBtn', openEquip, '__mobEquipFallbackBound');
    bindFallbackButton('openMissionBtn', openMission, '__mobMissionFallbackBound');
    bindFallbackButton('openPetEquipBtn', openPetEquip, '__mobPetFallbackBound');
    bindFallbackButton('openGachaBtn', openGacha, '__mobGachaFallbackBound');
    bindFallbackButton('openCollectionBtn', openCollection, '__mobCollectionFallbackBound');

    bindResultButtons();
    bindDeleteSave();

    refreshMainVisuals();
    setBattleModeIcon();
    applyAdminModeVisuals();

    setTimeout(setBattleModeIcon, 50);
    setTimeout(setBattleModeIcon, 250);
    setTimeout(setBattleModeIcon, 800);

    window.addEventListener('mobshot:saveUpdated', function(){
      refreshMainHud();
      refreshMainVisuals();
      setBattleModeIcon();
    });

    window.addEventListener('mobshot:rankUp', function(e){
      refreshMainHud();
      showRankUp(e.detail || {});
      setBattleModeIcon();
    });

    window.addEventListener('mobshot:gachaUpdated', function(){
      refreshMainVisuals();
      setBattleModeIcon();
    });

    window.addEventListener('mobshot:collectionDisplayUpdated', function(){
      refreshMainStoneDisplay();
      refreshMainSoulDisplay();
      setBattleModeIcon();
    });

    window.addEventListener('mobshot:soulDisplayUpdated', function(){
      refreshMainSoulDisplay();
      setBattleModeIcon();
    });

    window.addEventListener('mobshot:soulUpdated', function(){
      refreshMainSoulDisplay();
      setBattleModeIcon();
    });

    window.addEventListener('mobshot:adminModeChanged', function(){
      applyAdminModeVisuals();
      setBattleModeIcon();
    });
  }

  window.addEventListener('DOMContentLoaded', init);

  window.MobShotAdmin = {
    ADMIN_SAVE_KEY,
    isAdminMode,
    setAdminMode,
    applyAdminModeVisuals,
    openAdminPassword
  };

  window.MobShotMain = {
    showScreen,
    refreshMainHud,
    refreshMainVisuals,
    refreshMainStoneDisplay,
    refreshMainSoulDisplay,
    goMain,
    goGame,
    goBattle,
    openShop,
    openEquip,
    openMission,
    openPetEquip,
    openGacha,
    openCollection,
    showGameConfirm,
    showToast,
    showRankUp,
    clearAllMobShotLocalStorage,
    isAdminMode,
    setAdminMode
  };
})();
