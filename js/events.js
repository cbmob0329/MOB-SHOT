'use strict';

(function(){
  const EVENT_SAVE_KEY = 'mobshot_event_mode_v1';
  const GOLD_CLEAR_KEY = 'mobshot_gold_stage_clear_v1';
  const DOUBLE_CLEAR_KEY = 'mobshot_double_boss_clear_v1';
  const EVENT_ITEM_KEY = 'mobshot_event_items_v1';
  const EVENT_STATS_KEY = 'mobshot_event_stats_v1';

  const TEST_GOLD_TICKET_START = 10;

  const GOLD_DIFFICULTIES = [
    { key:'easy', name:'イージー', color:'#9dff73', firstCoin:3000, firstDiamond:5, clearCoin:300, chestMul:0.55, bossHpMul:0.7, bossCoinMul:0.7, showMidBoss:false },
    { key:'hard', name:'ハード', color:'#6be6ff', firstCoin:5000, firstDiamond:5, clearCoin:500, chestMul:0.8, bossHpMul:0.95, bossCoinMul:0.9, showMidBoss:false },
    { key:'veryHard', name:'ベリーハード', color:'#ffcf5b', firstCoin:10000, firstDiamond:5, clearCoin:800, chestMul:1.1, bossHpMul:1.25, bossCoinMul:1.1, showMidBoss:false },
    { key:'inferno', name:'インフェルノ', color:'#ff5b5b', firstCoin:15000, firstDiamond:10, clearCoin:1000, chestMul:1.4, bossHpMul:1.65, bossCoinMul:1.25, showMidBoss:true },
    { key:'legend', name:'レジェンド', color:'#d86bff', firstCoin:30000, firstDiamond:30, clearCoin:1500, chestMul:1.85, bossHpMul:2.2, bossCoinMul:1.45, showMidBoss:true }
  ];

  const DOUBLE_DIFFICULTIES = [
    { key:'veryHard', name:'ベリーハード', color:'#ffcf5b', firstCoin:5000, firstDiamond:5, hpMul:1.35, scoreMul:1.25 },
    { key:'inferno', name:'インフェルノ', color:'#ff5b5b', firstCoin:10000, firstDiamond:10, hpMul:1.95, scoreMul:1.55 },
    { key:'legend', name:'レジェンド', color:'#d86bff', firstCoin:30000, firstDiamond:50, hpMul:2.75, scoreMul:2.1 }
  ];

  const DOUBLE_STAGES = [
    { id:1, areaKey:'grass', areaName:'草原', title:'草原', bossA:'ホークモブ', bossB:'ミラモブ', allowed:['veryHard','inferno','legend'], final:false },
    { id:2, areaKey:'desert', areaName:'砂漠', title:'砂漠', bossA:'モブガーディアン', bossB:'ネオンモブ', allowed:['veryHard','inferno','legend'], final:false },
    { id:3, areaKey:'neon', areaName:'ネオン街', title:'ネオン街', bossA:'ドラゴンモブ', bossB:'ドラゴンモブⅡ', allowed:['veryHard','inferno','legend'], final:false },
    { id:4, areaKey:'castle', areaName:'魔王城', title:'魔王城', bossA:'モブリリス', bossB:'モブ魔王', allowed:['veryHard','inferno','legend'], final:false },
    { id:5, areaKey:'prison', areaName:'監獄', title:'監獄', bossA:'モブメイル', bossB:'モブスミス', allowed:['veryHard','inferno','legend'], final:false },
    { id:6, areaKey:'seaRail', areaName:'海の線路', title:'海の線路', bossA:'モブネプ', bossB:'ホークモブⅡ', allowed:['veryHard','inferno','legend'], final:false },
    { id:7, areaKey:'last', areaName:'魔王の間', title:'魔王の間', bossA:'閻魔モブ', bossB:'ウルモブリリス', allowed:['legend'], final:true, firstCoin:50000, firstDiamond:100 }
  ];

  const EVENTS = [
    { key:'gold', name:'GOLD STAGE', image:'mt/event_gold.png', desc:'チケットを使ってコインを稼ぐイベント。' },
    { key:'scoreAttack', name:'スコアアタック', image:'mt/event_score.png', desc:'歴代ボスを順番に倒してハイスコアを目指すイベント。' },
    { key:'doubleBoss', name:'ダブルボス', image:'mt/event_double.png', desc:'2体のボスを同時に撃破する高難易度イベント。' },
    { key:'secretBoss', name:'シークレットボス', image:'mt/event_secret.png', desc:'COMING SOON' }
  ];

  function qs(id){
    return document.getElementById(id);
  }

  function getSave(){
    if (window.MobShotStorage && window.MobShotStorage.load) {
      return window.MobShotStorage.load();
    }

    try {
      return JSON.parse(localStorage.getItem('mobshot_split_v1')) || {};
    } catch(e) {
      return {};
    }
  }

  function saveMain(save){
    if (window.MobShotStorage && window.MobShotStorage.save) {
      window.MobShotStorage.save(save);
      return;
    }

    try {
      localStorage.setItem('mobshot_split_v1', JSON.stringify(save || {}));
    } catch(e) {}
  }

  function getRank(){
    return Number(getSave().rank || 1);
  }

  function isUnlocked(){
    return getRank() >= 10;
  }

  function defaultItems(){
    return {
      goldTicket: TEST_GOLD_TICKET_START,
      __testInitialized: true
    };
  }

  function loadItems(){
    let items = null;

    try {
      items = JSON.parse(localStorage.getItem(EVENT_ITEM_KEY)) || null;
    } catch(e) {
      items = null;
    }

    if (!items || !items.__testInitialized) {
      items = defaultItems();
      saveItems(items);
    }

    items.goldTicket = Math.max(0, Number(items.goldTicket || 0));

    return items;
  }

  function saveItems(items){
    try {
      localStorage.setItem(EVENT_ITEM_KEY, JSON.stringify(items || defaultItems()));
    } catch(e) {}
  }

  function defaultStats(){
    return {
      goldClear:0,
      scoreAttackClear:0,
      doubleBossClear:0,
      eventCoinTotal:0,
      eventBossKills:0,
      goldTicketTotal:0,
      goldTicketSpent:0,
      bossKills:{},
      doubleClearByDifficulty:{ veryHard:0, inferno:0, legend:0 },
      doubleStageClear:{}
    };
  }

  function loadStats(){
    let stats = null;

    try {
      stats = JSON.parse(localStorage.getItem(EVENT_STATS_KEY)) || null;
    } catch(e) {
      stats = null;
    }

    stats = Object.assign(defaultStats(), stats || {});
    stats.bossKills = stats.bossKills || {};
    stats.doubleClearByDifficulty = Object.assign({ veryHard:0, inferno:0, legend:0 }, stats.doubleClearByDifficulty || {});
    stats.doubleStageClear = stats.doubleStageClear || {};

    return stats;
  }

  function saveStats(stats){
    try {
      localStorage.setItem(EVENT_STATS_KEY, JSON.stringify(stats || defaultStats()));
    } catch(e) {}
  }

  function addStat(key, amount){
    const stats = loadStats();
    stats[key] = Number(stats[key] || 0) + Number(amount || 0);
    saveStats(stats);
    notifyMission();
    return stats[key];
  }

  function getGoldTicket(){
    return loadItems().goldTicket;
  }

  function addGoldTicket(amount){
    const items = loadItems();
    const add = Number(amount || 0);

    items.goldTicket = Math.max(0, Number(items.goldTicket || 0) + add);
    saveItems(items);

    if (add > 0) {
      addStat('goldTicketTotal', add);
    }

    render();
    window.dispatchEvent(new CustomEvent('mobshot:eventItemsUpdated'));

    return items.goldTicket;
  }

  function consumeGoldTicket(amount){
    const need = Math.max(1, Number(amount || 1));
    const items = loadItems();

    if (Number(items.goldTicket || 0) < need) return false;

    items.goldTicket = Number(items.goldTicket || 0) - need;
    saveItems(items);

    addStat('goldTicketSpent', need);

    render();
    window.dispatchEvent(new CustomEvent('mobshot:eventItemsUpdated'));

    return true;
  }

  function resetTestTickets(){
    const items = loadItems();
    items.goldTicket = TEST_GOLD_TICKET_START;
    items.__testInitialized = true;
    saveItems(items);
    render();
    window.dispatchEvent(new CustomEvent('mobshot:eventItemsUpdated'));
  }

  function getDifficulty(key){
    return GOLD_DIFFICULTIES.find(d => d.key === key) || GOLD_DIFFICULTIES[0];
  }

  function getDoubleDifficulty(key){
    return DOUBLE_DIFFICULTIES.find(d => d.key === key) || DOUBLE_DIFFICULTIES[0];
  }

  function getDoubleStage(id){
    return DOUBLE_STAGES.find(s => Number(s.id) === Number(id)) || DOUBLE_STAGES[0];
  }

  function loadGoldClear(){
    try {
      return JSON.parse(localStorage.getItem(GOLD_CLEAR_KEY)) || {};
    } catch(e) {
      return {};
    }
  }

  function saveGoldClear(data){
    try {
      localStorage.setItem(GOLD_CLEAR_KEY, JSON.stringify(data || {}));
    } catch(e) {}
  }

  function hasGoldCleared(difficultyKey){
    return !!loadGoldClear()[difficultyKey];
  }

  function markGoldCleared(difficultyKey){
    const data = loadGoldClear();
    data[difficultyKey] = true;
    saveGoldClear(data);
  }

  function loadDoubleClear(){
    try {
      return JSON.parse(localStorage.getItem(DOUBLE_CLEAR_KEY)) || {};
    } catch(e) {
      return {};
    }
  }

  function saveDoubleClear(data){
    try {
      localStorage.setItem(DOUBLE_CLEAR_KEY, JSON.stringify(data || {}));
    } catch(e) {}
  }

  function doubleClearKey(difficultyKey, stageId){
    return `${difficultyKey}_${stageId}`;
  }

  function hasDoubleCleared(difficultyKey, stageId){
    return !!loadDoubleClear()[doubleClearKey(difficultyKey, stageId)];
  }

  function markDoubleCleared(difficultyKey, stageId){
    const data = loadDoubleClear();
    const key = doubleClearKey(difficultyKey, stageId);

    data[key] = true;
    saveDoubleClear(data);
  }

  function isDoubleDifficultyUnlocked(difficultyKey){
    if (difficultyKey === 'veryHard') return true;

    if (difficultyKey === 'inferno') {
      return DOUBLE_STAGES
        .filter(s => !s.final)
        .every(s => hasDoubleCleared('veryHard', s.id));
    }

    if (difficultyKey === 'legend') {
      return DOUBLE_STAGES
        .filter(s => !s.final)
        .every(s => hasDoubleCleared('inferno', s.id));
    }

    return false;
  }

  function recordGoldClear(difficultyKey, coinAmount){
    const stats = loadStats();
    stats.goldClear = Number(stats.goldClear || 0) + 1;
    stats.eventCoinTotal = Number(stats.eventCoinTotal || 0) + Number(coinAmount || 0);
    saveStats(stats);
    notifyMission();
  }

  function recordScoreAttackClear(coinAmount){
    const stats = loadStats();
    stats.scoreAttackClear = Number(stats.scoreAttackClear || 0) + 1;
    stats.eventCoinTotal = Number(stats.eventCoinTotal || 0) + Number(coinAmount || 0);
    saveStats(stats);
    notifyMission();
  }

  function recordDoubleBossClear(difficultyKey, stageId, coinAmount){
    const stats = loadStats();
    const stageKey = doubleClearKey(difficultyKey, stageId);

    stats.doubleBossClear = Number(stats.doubleBossClear || 0) + 1;
    stats.eventCoinTotal = Number(stats.eventCoinTotal || 0) + Number(coinAmount || 0);
    stats.doubleClearByDifficulty[difficultyKey] = Number(stats.doubleClearByDifficulty[difficultyKey] || 0) + 1;
    stats.doubleStageClear[stageKey] = Number(stats.doubleStageClear[stageKey] || 0) + 1;

    saveStats(stats);
    notifyMission();
  }

  function recordEventBossKill(bossName){
    const stats = loadStats();
    const name = String(bossName || 'BOSS');

    stats.eventBossKills = Number(stats.eventBossKills || 0) + 1;
    stats.bossKills[name] = Number(stats.bossKills[name] || 0) + 1;

    saveStats(stats);
    notifyMission();
  }

  function notifyMission(){
    if (window.MobShotMission && window.MobShotMission.refresh) {
      window.MobShotMission.refresh();
    }

    window.dispatchEvent(new CustomEvent('mobshot:eventStatsUpdated'));
  }

  function openModal(){
    const modal = qs('eventModal');
    if (!modal) return;

    clearCurrentEvent();
    render();
    modal.classList.remove('hidden');
  }

  function closeModal(){
    const modal = qs('eventModal');
    if (!modal) return;
    modal.classList.add('hidden');
  }

  function rewardTextGold(diff){
    const cleared = hasGoldCleared(diff.key);

    if (cleared) {
      return `クリア報酬：${diff.clearCoin.toLocaleString()} COIN`;
    }

    return `初回報酬：${diff.firstCoin.toLocaleString()} COIN + ${diff.firstDiamond} DIAMOND`;
  }

  function rewardTextDouble(diff, stage){
    const cleared = hasDoubleCleared(diff.key, stage.id);

    if (cleared) {
      return 'クリア済み：初回報酬なし';
    }

    const coin = stage.final ? stage.firstCoin : diff.firstCoin;
    const diamond = stage.final ? stage.firstDiamond : diff.firstDiamond;

    return `初回報酬：${coin.toLocaleString()} COIN + ${diamond} DIAMOND`;
  }

  function confirmStart(title, rewardText, extra){
    const lines = [
      `${title}に出撃しますか？`,
      '',
      rewardText
    ];

    if (extra) {
      lines.push('');
      lines.push(extra);
    }

    return window.confirm(lines.join('\n'));
  }

  function styleModeButton(btn, color){
    btn.style.width = '100%';
    btn.style.textAlign = 'center';
    btn.style.borderRadius = '18px';
    btn.style.padding = '14px 12px';
    btn.style.fontSize = '18px';
    btn.style.lineHeight = '1.25';
    btn.style.color = '#10070a';
    btn.style.background = `linear-gradient(180deg,#ffffff,${color})`;
    btn.style.border = `3px solid ${color}`;
    btn.style.boxShadow = '0 5px 0 rgba(0,0,0,.36)';
  }

  function render(){
    const list = qs('eventList');
    const lock = qs('eventLockText');

    if (!list) return;

    const unlocked = isUnlocked();

    if (lock) {
      lock.classList.toggle('hidden', unlocked);
      lock.textContent = `ランク10で解放されます。現在ランク: ${getRank()}`;
    }

    list.innerHTML = '';

    EVENTS.forEach(ev => {
      const card = document.createElement('div');
      card.className = 'event-card';

      const icon = document.createElement('img');
      icon.className = 'event-icon';
      icon.src = ev.image;
      icon.alt = ev.name;

      const info = document.createElement('div');
      info.className = 'event-info';

      const title = document.createElement('h3');
      title.textContent = ev.name;

      const desc = document.createElement('p');
      desc.textContent = ev.desc;

      info.appendChild(title);
      info.appendChild(desc);

      if (ev.key === 'gold') {
        renderGoldButtons(info, unlocked);
      } else if (ev.key === 'scoreAttack') {
        renderScoreAttackButton(info, unlocked);
      } else if (ev.key === 'doubleBoss') {
        renderDoubleBossButtons(info, unlocked);
      } else {
        const btn = document.createElement('button');
        btn.className = 'event-play-btn';
        btn.type = 'button';
        btn.textContent = unlocked ? 'COMING SOON' : 'LOCK';
        btn.disabled = true;
        info.appendChild(btn);
      }

      card.appendChild(icon);
      card.appendChild(info);
      list.appendChild(card);
    });
  }

  function renderGoldButtons(parent, unlocked){
    const ticket = getGoldTicket();

    const ticketText = document.createElement('div');
    ticketText.style.marginTop = '8px';
    ticketText.style.fontWeight = '1000';
    ticketText.style.color = '#ffcf5b';
    ticketText.textContent = `GOLD TICKET: ${ticket}`;

    parent.appendChild(ticketText);

    const wrap = document.createElement('div');
    wrap.style.display = 'grid';
    wrap.style.gridTemplateColumns = '1fr';
    wrap.style.gap = '9px';
    wrap.style.marginTop = '10px';

    GOLD_DIFFICULTIES.forEach(diff => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'event-play-btn';
      btn.disabled = !unlocked || ticket <= 0;

      styleModeButton(btn, diff.color);

      if (!unlocked) {
        btn.innerHTML = `<b>${diff.name}</b><br><small>LOCK</small>`;
      } else if (ticket <= 0) {
        btn.innerHTML = `<b>${diff.name}</b><br><small>チケット不足</small>`;
      } else {
        btn.innerHTML = `<b>${diff.name}</b>`;
      }

      btn.addEventListener('click', function(e){
        e.preventDefault();
        e.stopPropagation();

        if (!unlocked) return;

        if (getGoldTicket() <= 0) {
          alert('GOLD TICKETがありません。通常ステージの宝箱からまれに入手できます。');
          render();
          return;
        }

        const ok = confirmStart(
          `GOLD STAGE ${diff.name}`,
          rewardTextGold(diff),
          '消費：GOLD TICKET 1枚'
        );

        if (!ok) return;

        startEvent('gold', diff.key);
      });

      wrap.appendChild(btn);
    });

    parent.appendChild(wrap);
  }

  function renderScoreAttackButton(parent, unlocked){
    const btn = document.createElement('button');

    btn.className = 'event-play-btn';
    btn.type = 'button';
    btn.disabled = !unlocked;
    btn.textContent = unlocked ? '挑戦する' : 'LOCK';
    btn.style.marginTop = '8px';

    btn.addEventListener('click', function(e){
      e.preventDefault();
      e.stopPropagation();

      if (!unlocked) return;

      const ok = confirmStart(
        'スコアアタック',
        '報酬：スコア記録のみ',
        'ボス連戦に挑戦します。'
      );

      if (!ok) return;

      startEvent('scoreAttack', '');
    });

    parent.appendChild(btn);
  }

  function renderDoubleBossButtons(parent, unlocked){
    const wrap = document.createElement('div');
    wrap.style.display = 'grid';
    wrap.style.gridTemplateColumns = '1fr';
    wrap.style.gap = '10px';
    wrap.style.marginTop = '8px';

    DOUBLE_DIFFICULTIES.forEach(diff => {
      const diffUnlocked = unlocked && isDoubleDifficultyUnlocked(diff.key);

      const title = document.createElement('div');
      title.style.fontWeight = '1000';
      title.style.color = diffUnlocked ? diff.color : '#9aa4bd';
      title.style.fontSize = '18px';
      title.style.marginTop = '4px';
      title.textContent = diffUnlocked ? diff.name : `${diff.name} LOCK`;

      wrap.appendChild(title);

      DOUBLE_STAGES.forEach(stage => {
        if (!stage.allowed.includes(diff.key)) return;

        const cleared = hasDoubleCleared(diff.key, stage.id);
        const btn = document.createElement('button');

        btn.type = 'button';
        btn.className = 'event-play-btn';
        btn.disabled = !diffUnlocked;

        styleModeButton(btn, diff.color);

        btn.innerHTML =
          `<b>${stage.id}. ${stage.title}</b>` +
          `<br><small>${cleared ? 'CLEAR' : 'NEW'}</small>`;

        btn.addEventListener('click', function(e){
          e.preventDefault();
          e.stopPropagation();

          if (!diffUnlocked) return;

          const ok = confirmStart(
            `ダブルボス ${diff.name} / ${stage.title}`,
            rewardTextDouble(diff, stage),
            'ボス2体が同時に出現します。'
          );

          if (!ok) return;

          startEvent('doubleBoss', diff.key, stage.id);
        });

        wrap.appendChild(btn);
      });
    });

    parent.appendChild(wrap);
  }

  function startEvent(key, difficultyKey, stageId){
    if (key === 'gold') {
      if (!consumeGoldTicket(1)) {
        alert('GOLD TICKETがありません。通常ステージの宝箱からまれに入手できます。');
        render();
        return;
      }
    }

    const eventData = {
      key,
      difficulty: difficultyKey || '',
      stageId: Number(stageId || 0),
      startedAt: Date.now()
    };

    try {
      localStorage.setItem(EVENT_SAVE_KEY, JSON.stringify(eventData));
    } catch(e) {}

    closeModal();

    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.remove('active');
    });

    const game = qs('gameScreen');
    if (game) game.classList.add('active');

    if (window.MobShotGame && window.MobShotGame.start) {
      window.MobShotGame.start();
    }
  }

  function getCurrentEvent(){
    try {
      const raw = localStorage.getItem(EVENT_SAVE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch(e) {
      return null;
    }
  }

  function isGoldStage(){
    const ev = getCurrentEvent();
    return !!(ev && ev.key === 'gold');
  }

  function isScoreAttack(){
    const ev = getCurrentEvent();
    return !!(ev && ev.key === 'scoreAttack');
  }

  function isDoubleBoss(){
    const ev = getCurrentEvent();
    return !!(ev && ev.key === 'doubleBoss');
  }

  function getCurrentGoldDifficulty(){
    const ev = getCurrentEvent();
    if (!ev || ev.key !== 'gold') return getDifficulty('easy');
    return getDifficulty(ev.difficulty || 'easy');
  }

  function getCurrentDoubleBoss(){
    const ev = getCurrentEvent();
    const difficulty = getDoubleDifficulty(ev && ev.difficulty ? ev.difficulty : 'veryHard');
    const stage = getDoubleStage(ev && ev.stageId ? ev.stageId : 1);

    return { difficulty, stage };
  }

  function clearCurrentEvent(){
    try {
      localStorage.removeItem(EVENT_SAVE_KEY);
    } catch(e) {}
  }

  function bind(){
    const openBtn = qs('openEventBtn');
    const closeBtn = qs('eventCloseBtn');
    const modal = qs('eventModal');

    if (openBtn && !openBtn.__mobEventBound) {
      openBtn.__mobEventBound = true;

      openBtn.addEventListener('click', function(e){
        e.preventDefault();
        e.stopPropagation();
        openModal();
      });

      openBtn.addEventListener('pointerup', function(e){
        e.preventDefault();
        e.stopPropagation();
        openModal();
      }, { passive:false });
    }

    if (closeBtn && !closeBtn.__mobEventBound) {
      closeBtn.__mobEventBound = true;

      closeBtn.addEventListener('click', function(e){
        e.preventDefault();
        e.stopPropagation();
        closeModal();
      });
    }

    if (modal && !modal.__mobEventBgBound) {
      modal.__mobEventBgBound = true;

      modal.addEventListener('click', function(e){
        if (e.target === modal) closeModal();
      });
    }
  }

  function init(){
    loadItems();
    loadStats();
    bind();
  }

  document.addEventListener('DOMContentLoaded', init);
  init();

  window.MobShotEvents = {
    EVENTS,
    GOLD_DIFFICULTIES,
    DOUBLE_DIFFICULTIES,
    DOUBLE_STAGES,
    EVENT_SAVE_KEY,
    GOLD_CLEAR_KEY,
    DOUBLE_CLEAR_KEY,
    EVENT_ITEM_KEY,
    EVENT_STATS_KEY,
    TEST_GOLD_TICKET_START,

    openModal,
    closeModal,
    render,
    startEvent,
    getCurrentEvent,
    clearCurrentEvent,

    isGoldStage,
    isScoreAttack,
    isDoubleBoss,
    isUnlocked,

    getDifficulty,
    getCurrentGoldDifficulty,
    getDoubleDifficulty,
    getDoubleStage,
    getCurrentDoubleBoss,

    hasGoldCleared,
    markGoldCleared,

    loadDoubleClear,
    saveDoubleClear,
    hasDoubleCleared,
    markDoubleCleared,
    isDoubleDifficultyUnlocked,

    loadItems,
    saveItems,
    getGoldTicket,
    addGoldTicket,
    consumeGoldTicket,
    resetTestTickets,

    loadStats,
    saveStats,
    addStat,
    recordGoldClear,
    recordScoreAttackClear,
    recordDoubleBossClear,
    recordEventBossKill
  };
})();
