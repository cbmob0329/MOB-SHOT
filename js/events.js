'use strict';

(function(){
  const EVENT_SAVE_KEY = 'mobshot_event_mode_v1';
  const GOLD_CLEAR_KEY = 'mobshot_gold_stage_clear_v1';
  const EVENT_ITEM_KEY = 'mobshot_event_items_v1';

  const TEST_GOLD_TICKET_START = 10;

  const GOLD_DIFFICULTIES = [
    { key:'easy', name:'イージー', firstCoin:3000, firstDiamond:5, clearCoin:300, chestMul:0.55, bossHpMul:0.7, bossCoinMul:0.7, showMidBoss:false },
    { key:'hard', name:'ハード', firstCoin:5000, firstDiamond:5, clearCoin:500, chestMul:0.8, bossHpMul:0.95, bossCoinMul:0.9, showMidBoss:false },
    { key:'veryHard', name:'ベリーハード', firstCoin:10000, firstDiamond:5, clearCoin:800, chestMul:1.1, bossHpMul:1.25, bossCoinMul:1.1, showMidBoss:false },
    { key:'inferno', name:'インフェルノ', firstCoin:15000, firstDiamond:10, clearCoin:1000, chestMul:1.4, bossHpMul:1.65, bossCoinMul:1.25, showMidBoss:true },
    { key:'legend', name:'レジェンド', firstCoin:30000, firstDiamond:30, clearCoin:1500, chestMul:1.85, bossHpMul:2.2, bossCoinMul:1.45, showMidBoss:true }
  ];

  const EVENTS = [
    { key:'gold', name:'GOLD STAGE', image:'mt/event_gold.png', desc:'チケットを使ってコインを稼ぐイベント。' },
    { key:'scoreAttack', name:'スコアアタック', image:'mt/event_score.png', desc:'歴代ボスを順番に倒してハイスコアを目指すイベント。' },
    { key:'doubleBoss', name:'ダブルボス', image:'mt/event_double.png', desc:'COMING SOON' },
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

  function getRank(){
    const save = getSave();
    return Number(save.rank || 1);
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

  function getGoldTicket(){
    return loadItems().goldTicket;
  }

  function addGoldTicket(amount){
    const items = loadItems();

    items.goldTicket = Math.max(0, Number(items.goldTicket || 0) + Number(amount || 0));

    saveItems(items);
    render();

    window.dispatchEvent(new CustomEvent('mobshot:eventItemsUpdated'));

    return items.goldTicket;
  }

  function consumeGoldTicket(amount){
    const need = Math.max(1, Number(amount || 1));
    const items = loadItems();

    if (Number(items.goldTicket || 0) < need) {
      return false;
    }

    items.goldTicket = Number(items.goldTicket || 0) - need;

    saveItems(items);
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
    const data = loadGoldClear();
    return !!data[difficultyKey];
  }

  function markGoldCleared(difficultyKey){
    const data = loadGoldClear();
    data[difficultyKey] = true;
    saveGoldClear(data);
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
    wrap.style.gap = '7px';
    wrap.style.marginTop = '8px';

    GOLD_DIFFICULTIES.forEach(diff => {
      const row = document.createElement('button');
      row.type = 'button';
      row.className = 'event-play-btn';
      row.disabled = !unlocked || ticket <= 0;
      row.style.width = '100%';
      row.style.textAlign = 'left';
      row.style.borderRadius = '14px';
      row.style.padding = '9px 11px';
      row.style.lineHeight = '1.35';

      const cleared = hasGoldCleared(diff.key);
      const rewardText = cleared
        ? `クリア報酬 ${diff.clearCoin.toLocaleString()} COIN / チケット1枚`
        : `初回 ${diff.firstCoin.toLocaleString()} COIN + ${diff.firstDiamond} DIAMOND / チケット1枚`;

      if (!unlocked) {
        row.innerHTML = `<b>${diff.name}</b><br><small>LOCK</small>`;
      } else if (ticket <= 0) {
        row.innerHTML = `<b>${diff.name}</b><br><small>チケット不足</small>`;
      } else {
        row.innerHTML = `<b>${diff.name}</b><br><small>${rewardText}</small>`;
      }

      row.addEventListener('click', function(e){
        e.preventDefault();
        e.stopPropagation();

        if (!unlocked) return;

        if (getGoldTicket() <= 0) {
          alert('GOLD TICKETがありません。通常ステージの宝箱からまれに入手できます。');
          render();
          return;
        }

        startEvent('gold', diff.key);
      });

      wrap.appendChild(row);
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

      startEvent('scoreAttack', '');
    });

    parent.appendChild(btn);
  }

  function startEvent(key, difficultyKey){
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

    if (game) {
      game.classList.add('active');
    }

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

  function getCurrentGoldDifficulty(){
    const ev = getCurrentEvent();

    if (!ev || ev.key !== 'gold') {
      return getDifficulty('easy');
    }

    return getDifficulty(ev.difficulty || 'easy');
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
        if (e.target === modal) {
          closeModal();
        }
      });
    }
  }

  function init(){
    loadItems();
    bind();
  }

  document.addEventListener('DOMContentLoaded', init);
  init();

  window.MobShotEvents = {
    EVENTS,
    GOLD_DIFFICULTIES,
    EVENT_SAVE_KEY,
    GOLD_CLEAR_KEY,
    EVENT_ITEM_KEY,
    TEST_GOLD_TICKET_START,

    openModal,
    closeModal,
    render,
    startEvent,
    getCurrentEvent,
    clearCurrentEvent,

    isGoldStage,
    isScoreAttack,
    isUnlocked,

    getDifficulty,
    getCurrentGoldDifficulty,

    hasGoldCleared,
    markGoldCleared,

    loadItems,
    saveItems,
    getGoldTicket,
    addGoldTicket,
    consumeGoldTicket,
    resetTestTickets
  };
})();
