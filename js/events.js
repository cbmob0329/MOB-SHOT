'use strict';

(function(){
  const EVENT_SAVE_KEY = 'mobshot_event_mode_v1';
  const GOLD_CLEAR_KEY = 'mobshot_gold_stage_clear_v2';
  const EVENT_STATS_KEY = 'mobshot_event_stats_v2';

  const GOLD_DIFFICULTIES = [
    {
      key:'easy',
      name:'イージー',
      icon:'mt/game1.png',
      color:'#9dff73',
      timeLimitSec:30,
      firstCoin:3000,
      firstDiamond:5,
      clearCoin:300,
      chestMul:0.8,
      bossHpMul:1.0,
      bossCoinMul:1.0,
      bossMinHp:600,
      areaKey:'desert',
      areaName:'砂漠',
      background:'sta/backsabaku.png',
      bosses:['モブガーディアン']
    },
    {
      key:'hard',
      name:'ハード',
      icon:'mt/game2.png',
      color:'#6be6ff',
      timeLimitSec:30,
      firstCoin:5000,
      firstDiamond:5,
      clearCoin:500,
      chestMul:1.4,
      bossHpMul:1.35,
      bossCoinMul:1.8,
      bossMinHp:1800,
      areaKey:'desert',
      areaName:'砂漠',
      background:'sta/backsabaku.png',
      bosses:['モブガーディアン','モブガーディアンⅡ']
    },
    {
      key:'veryHard',
      name:'ベリーハード',
      icon:'mt/game3.png',
      color:'#ffcf5b',
      timeLimitSec:30,
      firstCoin:10000,
      firstDiamond:5,
      clearCoin:800,
      chestMul:2.2,
      bossHpMul:1.8,
      bossCoinMul:3.2,
      bossMinHp:3800,
      areaKey:'desert',
      areaName:'砂漠',
      background:'sta/backsabaku.png',
      bosses:['モブガーディアンⅡ','モブデュアル']
    },
    {
      key:'inferno',
      name:'インフェルノ',
      icon:'mt/game4.png',
      color:'#ff5b5b',
      timeLimitSec:30,
      firstCoin:15000,
      firstDiamond:10,
      clearCoin:1000,
      chestMul:3.5,
      bossHpMul:2.35,
      bossCoinMul:6.0,
      bossMinHp:7200,
      areaKey:'desert',
      areaName:'砂漠',
      background:'sta/backsabaku.png',
      bosses:['モブガーディアンⅡ','モブデュアル']
    },
    {
      key:'legend',
      name:'レジェンド',
      icon:'mt/game5.png',
      color:'#d86bff',
      timeLimitSec:30,
      firstCoin:30000,
      firstDiamond:30,
      clearCoin:1500,
      chestMul:5.5,
      bossHpMul:3.2,
      bossCoinMul:10.0,
      bossMinHp:12000,
      areaKey:'desert',
      areaName:'砂漠',
      background:'sta/backsabaku.png',
      bosses:['モブガーディアンⅡ','モブデュアル']
    }
  ];

  function clone(obj){
    return JSON.parse(JSON.stringify(obj));
  }

  function now(){
    return Date.now();
  }

  function safeJsonLoad(key, fallback){
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch(e) {
      return fallback;
    }
  }

  function safeJsonSave(key, value){
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch(e) {}
  }

  function normalizeDifficultyKey(key){
    const raw = String(key || '').trim();
    if (raw === 'イージー') return 'easy';
    if (raw === 'ハード') return 'hard';
    if (raw === 'ベリーハード') return 'veryHard';
    if (raw === 'インフェルノ') return 'inferno';
    if (raw === 'レジェンド') return 'legend';
    if (raw === 'veryhard') return 'veryHard';
    return raw || 'easy';
  }

  function difficultyByKey(key){
    key = normalizeDifficultyKey(key);
    return GOLD_DIFFICULTIES.find(d => d.key === key) || GOLD_DIFFICULTIES[0];
  }

  function getClearState(){
    return safeJsonLoad(GOLD_CLEAR_KEY, {});
  }

  function saveClearState(state){
    safeJsonSave(GOLD_CLEAR_KEY, state || {});
  }

  function hasGoldCleared(key){
    const state = getClearState();
    key = normalizeDifficultyKey(key);
    return !!state[key];
  }

  function markGoldCleared(key){
    key = normalizeDifficultyKey(key);
    const state = getClearState();
    state[key] = true;
    saveClearState(state);
  }

  function getStats(){
    return safeJsonLoad(EVENT_STATS_KEY, {
      goldPlay:0,
      goldClear:0,
      goldBestCoin:{}
    });
  }

  function saveStats(stats){
    safeJsonSave(EVENT_STATS_KEY, stats || {});
  }

  function recordGoldClear(key, coin){
    key = normalizeDifficultyKey(key);
    const stats = getStats();
    stats.goldPlay = Number(stats.goldPlay || 0) + 1;
    stats.goldClear = Number(stats.goldClear || 0) + 1;
    stats.goldBestCoin = stats.goldBestCoin || {};
    stats.goldBestCoin[key] = Math.max(Number(stats.goldBestCoin[key] || 0), Number(coin || 0));
    saveStats(stats);
  }

  function recordGoldPlay(key){
    key = normalizeDifficultyKey(key);
    const stats = getStats();
    stats.goldPlay = Number(stats.goldPlay || 0) + 1;
    saveStats(stats);
  }

  function setCurrentEvent(data){
    const ev = Object.assign({}, data || {}, {
      startedAt:now()
    });

    safeJsonSave(EVENT_SAVE_KEY, ev);
    window.__mobShotCurrentEvent = clone(ev);
    return ev;
  }

  function getCurrentEvent(){
    if (window.__mobShotCurrentEvent && window.__mobShotCurrentEvent.key) {
      return clone(window.__mobShotCurrentEvent);
    }

    const ev = safeJsonLoad(EVENT_SAVE_KEY, null);
    if (!ev || !ev.key) return null;

    window.__mobShotCurrentEvent = clone(ev);
    return ev;
  }

  function clearCurrentEvent(){
    try {
      localStorage.removeItem(EVENT_SAVE_KEY);
    } catch(e) {}
    window.__mobShotCurrentEvent = null;
  }

  function recordEventBossKill(name){
    const stats = getStats();
    stats.bossKills = stats.bossKills || {};
    stats.bossKills[name] = Number(stats.bossKills[name] || 0) + 1;
    saveStats(stats);
  }

  function getRank(){
    const save = getMainSave();
    return Number(save.rank || save.playerRank || save.currentRank || 1);
  }

  function getMainSave(){
    if (window.MobShotStorage && window.MobShotStorage.load) {
      try {
        return window.MobShotStorage.load() || {};
      } catch(e) {}
    }

    try {
      return JSON.parse(localStorage.getItem('mobshot_split_v1')) || {};
    } catch(e) {
      return {};
    }
  }

  function startGold(diffKey){
    const diff = difficultyByKey(diffKey);

    setCurrentEvent({
      key:'gold',
      type:'gold',
      difficulty:diff.key,
      difficultyKey:diff.key,
      goldDifficulty:clone(diff),
      timeLimitSec:Number(diff.timeLimitSec || 30),
      title:'ゴールドステージ'
    });

    recordGoldPlay(diff.key);
    closeEventMenu();

    setTimeout(function(){
      startGameScene();
    }, 80);
  }

  function startGameScene(){
    if (window.MobShotApp && typeof window.MobShotApp.showGame === 'function') {
      window.MobShotApp.showGame();
      return;
    }

    if (window.MobShotScene && typeof window.MobShotScene.show === 'function') {
      window.MobShotScene.show('game');
      return;
    }

    if (typeof window.mobshotShowGame === 'function') {
      window.mobshotShowGame();
      return;
    }

    if (typeof window.startGame === 'function') {
      window.startGame();
      return;
    }

    const sortieBtn =
      document.getElementById('btnSortie') ||
      document.getElementById('mainSortieBtn') ||
      document.querySelector('[data-action="sortie"]') ||
      document.querySelector('[data-nav="game"]');

    if (sortieBtn && typeof sortieBtn.click === 'function') {
      sortieBtn.click();
      return;
    }

    window.dispatchEvent(new CustomEvent('mobshot:startGame', {
      detail:{ from:'event', key:'gold' }
    }));
  }

  function injectStyle(){
    if (document.getElementById('mobShotEventMenuStyle')) return;

    const style = document.createElement('style');
    style.id = 'mobShotEventMenuStyle';
    style.textContent = `
      #mobShotEventMenu{
        position:fixed;
        inset:0;
        z-index:180000;
        display:none;
        align-items:center;
        justify-content:center;
        padding:14px;
        background:rgba(0,0,0,.78);
        color:#fff;
        font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
      }
      #mobShotEventMenu.show{
        display:flex!important;
      }
      .mob-event-panel{
        width:min(94vw,480px);
        max-height:90vh;
        overflow:auto;
        border-radius:28px;
        padding:16px;
        background:linear-gradient(160deg,#1b2541,#070d19);
        border:4px solid rgba(255,255,255,.32);
        box-shadow:0 24px 70px rgba(0,0,0,.62);
      }
      .mob-event-head{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:10px;
        margin-bottom:12px;
      }
      .mob-event-title{
        font-size:28px;
        font-weight:1000;
        color:#ffe66b;
        text-shadow:0 3px 0 #000;
      }
      .mob-event-close{
        border:0;
        border-radius:999px;
        padding:9px 14px;
        color:#fff;
        background:#39445f;
        font-size:14px;
        font-weight:1000;
      }
      .mob-event-main-card{
        position:relative;
        overflow:hidden;
        border-radius:24px;
        padding:14px;
        margin-bottom:12px;
        background:linear-gradient(135deg,rgba(255,218,67,.20),rgba(255,122,26,.08)),linear-gradient(160deg,#263858,#101827);
        border:3px solid rgba(255,230,107,.45);
        box-shadow:inset 0 2px 0 rgba(255,255,255,.12),0 8px 0 rgba(0,0,0,.25);
      }
      .mob-event-main-top{
        display:grid;
        grid-template-columns:72px 1fr;
        gap:12px;
        align-items:center;
      }
      .mob-event-main-img{
        width:72px;
        height:72px;
        object-fit:contain;
        filter:drop-shadow(0 5px 0 rgba(0,0,0,.35));
        animation:mobEventFloat 1.6s ease-in-out infinite;
      }
      .mob-event-main-name{
        font-size:24px;
        font-weight:1000;
        color:#ffe66b;
        text-shadow:0 3px 0 #000;
      }
      .mob-event-main-desc{
        margin-top:4px;
        font-size:13px;
        font-weight:900;
        line-height:1.45;
        color:rgba(255,255,255,.88);
      }
      .mob-event-note{
        margin:10px 0 12px;
        padding:10px 12px;
        border-radius:16px;
        background:rgba(255,255,255,.07);
        border:2px solid rgba(255,255,255,.13);
        font-size:12px;
        font-weight:900;
        line-height:1.5;
        color:rgba(255,255,255,.86);
      }
      .mob-gold-diff-list{
        display:grid;
        grid-template-columns:1fr;
        gap:10px;
      }
      .mob-gold-diff{
        display:grid;
        grid-template-columns:54px 1fr 92px;
        gap:10px;
        align-items:center;
        min-height:82px;
        border-radius:18px;
        padding:10px;
        background:linear-gradient(135deg,rgba(35,52,83,.98),rgba(10,18,32,.98));
        border:2px solid rgba(255,255,255,.18);
        box-shadow:0 6px 0 rgba(0,0,0,.24);
      }
      .mob-gold-diff img{
        width:50px;
        height:50px;
        object-fit:contain;
        filter:drop-shadow(0 4px 0 rgba(0,0,0,.28));
      }
      .mob-gold-name{
        font-size:17px;
        font-weight:1000;
        line-height:1.1;
      }
      .mob-gold-meta{
        margin-top:5px;
        font-size:11px;
        font-weight:900;
        line-height:1.35;
        color:rgba(255,255,255,.82);
      }
      .mob-gold-start{
        border:0;
        border-radius:16px;
        min-height:42px;
        padding:8px 4px;
        color:#2c1600;
        background:linear-gradient(#ffe66b,#ff9419);
        box-shadow:0 5px 0 #7c3900;
        font-size:14px;
        font-weight:1000;
      }
      .mob-event-disabled{
        margin-top:12px;
        display:grid;
        gap:8px;
      }
      .mob-event-disabled-card{
        border-radius:16px;
        padding:12px;
        background:rgba(255,255,255,.05);
        border:2px dashed rgba(255,255,255,.16);
        color:rgba(255,255,255,.55);
        font-size:13px;
        font-weight:900;
      }
      @keyframes mobEventFloat{
        0%,100%{transform:translateY(0)}
        50%{transform:translateY(-6px)}
      }
    `;

    document.head.appendChild(style);
  }

  function ensureEventMenu(){
    injectStyle();

    let menu = document.getElementById('mobShotEventMenu');
    if (menu) return menu;

    menu = document.createElement('div');
    menu.id = 'mobShotEventMenu';
    menu.innerHTML = `
      <div class="mob-event-panel">
        <div class="mob-event-head">
          <div class="mob-event-title">イベント</div>
          <button class="mob-event-close" type="button" id="mobEventCloseBtn">閉じる</button>
        </div>

        <section class="mob-event-main-card">
          <div class="mob-event-main-top">
            <img class="mob-event-main-img" src="mt/goldmenu.png" alt="ゴールドステージ" onerror="this.style.display='none'">
            <div>
              <div class="mob-event-main-name">ゴールドステージ</div>
              <div class="mob-event-main-desc">30秒間、ボスと戦いながら宝箱を壊してコインを稼ごう！</div>
            </div>
          </div>
        </section>

        <div class="mob-event-note">
          クリア条件：30秒生存でクリア。<br>
          ボスを倒しても終了せず、30秒までコイン稼ぎを続けます。
        </div>

        <div id="mobGoldDiffList" class="mob-gold-diff-list"></div>

        <div class="mob-event-disabled">
          <div class="mob-event-disabled-card">イベントクエスト：調整のため一時停止中</div>
          <div class="mob-event-disabled-card">ダブルボス：調整のため一時停止中</div>
          <div class="mob-event-disabled-card">スコアアタック：調整のため一時停止中</div>
        </div>
      </div>
    `;

    document.body.appendChild(menu);

    const close = document.getElementById('mobEventCloseBtn');
    if (close) close.addEventListener('click', closeEventMenu);

    menu.addEventListener('click', function(e){
      if (e.target === menu) closeEventMenu();
    });

    renderGoldDifficulties();

    return menu;
  }

  function renderGoldDifficulties(){
    const list = document.getElementById('mobGoldDiffList');
    if (!list) return;

    list.innerHTML = GOLD_DIFFICULTIES.map(diff => {
      const first = !hasGoldCleared(diff.key);
      const rewardText = first
        ? `初回 ${Number(diff.firstCoin || 0).toLocaleString()} COIN + ${Number(diff.firstDiamond || 0)} DIAMOND`
        : `クリア ${Number(diff.clearCoin || 0).toLocaleString()} COIN`;

      return `
        <div class="mob-gold-diff" style="border-color:${diff.color}">
          <img src="${diff.icon}" alt="${diff.name}" onerror="this.style.display='none'">
          <div>
            <div class="mob-gold-name" style="color:${diff.color}">${diff.name}</div>
            <div class="mob-gold-meta">制限時間 ${diff.timeLimitSec}秒 / ${rewardText}</div>
          </div>
          <button class="mob-gold-start" type="button" data-gold-diff="${diff.key}">開始</button>
        </div>
      `;
    }).join('');

    list.querySelectorAll('[data-gold-diff]').forEach(btn => {
      btn.addEventListener('click', function(){
        startGold(btn.dataset.goldDiff);
      });
    });
  }

  function openEventMenu(){
    const rank = getRank();
    if (rank < 10) {
      showLockedMessage();
      return;
    }

    const menu = ensureEventMenu();
    renderGoldDifficulties();
    menu.classList.add('show');
  }

  function closeEventMenu(){
    const menu = document.getElementById('mobShotEventMenu');
    if (menu) menu.classList.remove('show');
  }

  function showLockedMessage(){
    const msg = document.createElement('div');
    msg.style.position = 'fixed';
    msg.style.left = '50%';
    msg.style.top = '50%';
    msg.style.transform = 'translate(-50%,-50%)';
    msg.style.zIndex = '200000';
    msg.style.padding = '16px 22px';
    msg.style.borderRadius = '18px';
    msg.style.background = 'rgba(0,0,0,.82)';
    msg.style.border = '3px solid rgba(255,255,255,.35)';
    msg.style.color = '#ffe66b';
    msg.style.fontWeight = '1000';
    msg.style.fontFamily = 'system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif';
    msg.style.textAlign = 'center';
    msg.style.boxShadow = '0 14px 36px rgba(0,0,0,.45)';
    msg.textContent = 'イベントはRANK10で解放！';

    document.body.appendChild(msg);

    setTimeout(function(){
      msg.remove();
    }, 1200);
  }

  function bindEventButtons(){
    const selectors = [
      '#eventBtn',
      '#btnEvent',
      '#mainEventBtn',
      '#mobShotEventBtn',
      '[data-action="event"]',
      '[data-menu="event"]'
    ];

    selectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(btn => {
        if (btn.__mobShotEventBound) return;
        btn.__mobShotEventBound = true;
        btn.addEventListener('click', function(e){
          e.preventDefault();
          openEventMenu();
        });
      });
    });
  }

  function installAutoBinder(){
    bindEventButtons();

    if (document.__mobShotEventAutoBinder) return;
    document.__mobShotEventAutoBinder = true;

    const obs = new MutationObserver(function(){
      bindEventButtons();
    });

    obs.observe(document.documentElement, {
      childList:true,
      subtree:true
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installAutoBinder);
  } else {
    installAutoBinder();
  }

  window.MobShotEvents = {
    openEventMenu,
    closeEventMenu,
    startGold,
    getCurrentEvent,
    clearCurrentEvent,
    hasGoldCleared,
    markGoldCleared,
    recordGoldClear,
    recordGoldPlay,
    recordEventBossKill,
    getGoldDifficulties:function(){
      return clone(GOLD_DIFFICULTIES);
    },
    getGoldDifficulty:function(key){
      return clone(difficultyByKey(key));
    }
  };
})();
