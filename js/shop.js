'use strict';

(function(){
  const SHOP_SAVE_KEY = 'mobshot_shop_state_v1';

  const AVATAR_MASTER = [
    {
      key: 'pink',
      name: 'ピンクモデル',
      price: 0,
      rank: 1,
      ownedDefault: true,
      menuImage: 'play/playpink2.png',
      backImage: 'play/playpink.png',
      desc: '初期装備 / 能力変化なし'
    },
    {
      key: 'blue',
      name: 'ブルーモデル',
      price: 1000,
      rank: 1,
      ownedDefault: false,
      menuImage: 'play/playblue2.png',
      backImage: 'play/playblue.png',
      desc: '能力変化なし'
    },
    {
      key: 'purple',
      name: 'パープルモデル',
      price: 1000,
      rank: 1,
      ownedDefault: false,
      menuImage: 'play/playpar2.png',
      backImage: 'play/playpar.png',
      desc: '能力変化なし'
    },
    {
      key: 'yellow',
      name: 'イエローモデル',
      price: 1000,
      rank: 1,
      ownedDefault: false,
      menuImage: 'play/playye2.png',
      backImage: 'play/playye.png',
      desc: '能力変化なし'
    },
    {
      key: 'slime',
      name: 'スライムモデル',
      price: 5000,
      rank: 5,
      ownedDefault: false,
      menuImage: 'play/playsura2.png',
      backImage: 'play/playsura.png',
      desc: 'RANK5で解放 / 能力変化なし'
    },
    {
      key: 'hero',
      name: '勇者モデル',
      price: 10000,
      rank: 10,
      ownedDefault: false,
      menuImage: 'play/playyu2.png',
      backImage: 'play/playyu.png',
      desc: 'RANK10で解放 / 能力変化なし'
    },
    {
      key: 'mobbr',
      name: 'MOB BRモデル',
      price: 15000,
      rank: 15,
      ownedDefault: false,
      menuImage: 'play/playbr2.png',
      backImage: 'play/playbr.png',
      desc: 'RANK15で解放 / 能力変化なし'
    }
  ];

  const RECORD_MASTER = [
    {
      key: 'iron',
      name: '鉄の弾',
      price: 0,
      rank: 1,
      ownedDefault: true,
      power: 0,
      rapid: 0,
      hp: 0,
      desc: '初期装備 / 効果なし'
    },
    {
      key: 'fireball',
      name: '火の玉',
      price: 1000,
      rank: 1,
      ownedDefault: false,
      power: 1,
      rapid: 0,
      hp: 0,
      desc: 'POWER+1'
    },
    {
      key: 'recordfire',
      name: 'レコードファイア',
      price: 3000,
      rank: 3,
      ownedDefault: false,
      power: 2,
      rapid: 0,
      hp: 0,
      desc: 'RANK3 / POWER+2'
    },
    {
      key: 'rainbowfire',
      name: 'レインボーファイア',
      price: 3000,
      rank: 5,
      ownedDefault: false,
      power: 2,
      rapid: 0,
      hp: 0,
      desc: 'RANK5 / POWER+2'
    },
    {
      key: 'wataame',
      name: 'WATAAME!!',
      price: null,
      rank: 10,
      ownedDefault: false,
      power: 2,
      rapid: 0.2,
      hp: 0,
      desc: 'RANK10 / POWER+2 / 攻撃速度+0.2'
    },
    {
      key: 'garagara',
      name: 'ガラガラの旅',
      price: null,
      rank: 10,
      ownedDefault: false,
      power: 3,
      rapid: 0.2,
      hp: 0,
      desc: 'RANK10 / POWER+3 / 攻撃速度+0.2'
    },
    {
      key: 'book',
      name: '読みかけの本',
      price: null,
      rank: 10,
      ownedDefault: false,
      power: 3,
      rapid: 0.1,
      hp: 50,
      desc: 'RANK10 / POWER+3 / 攻撃速度+0.1 / HP+50'
    },
    {
      key: 'mobrpg',
      name: 'MOB RPG',
      price: null,
      rank: 10,
      ownedDefault: false,
      power: 4,
      rapid: 0,
      hp: 0,
      desc: 'RANK10 / POWER+4'
    },
    {
      key: 'iyonokuni',
      name: '伊予ノ国',
      price: null,
      rank: 20,
      ownedDefault: false,
      power: 2,
      rapid: 0,
      hp: 150,
      desc: 'RANK20 / POWER+2 / HP+150'
    },
    {
      key: 'realize',
      name: 'Realize',
      price: null,
      rank: 20,
      ownedDefault: false,
      power: 4,
      rapid: 0,
      hp: 0,
      desc: 'RANK20 / POWER+4'
    },
    {
      key: 'portal',
      name: 'Portal',
      price: null,
      rank: 20,
      ownedDefault: false,
      power: 1,
      rapid: 0.4,
      hp: 0,
      desc: 'RANK20 / POWER+1 / 攻撃速度+0.4'
    },
    {
      key: 'pb2',
      name: 'PB2',
      price: null,
      rank: 20,
      ownedDefault: false,
      power: 2,
      rapid: 0.3,
      hp: 100,
      desc: 'RANK20 / POWER+2 / 攻撃速度+0.3 / HP+100'
    }
  ];

  const UPGRADE_MASTER = [
    {
      key: 'power',
      name: 'POWER',
      max: 50,
      effectText: '攻撃力 +0.5',
      desc: '弾ダメージを上げる'
    },
    {
      key: 'range',
      name: 'RANGE',
      max: 10,
      effectText: '射程 +0.5',
      desc: '弾の飛距離を伸ばす'
    },
    {
      key: 'rapid',
      name: '攻撃速度',
      max: 30,
      effectText: '攻撃速度 +0.1',
      desc: '連射速度を少し上げる'
    },
    {
      key: 'hp',
      name: 'HP',
      max: 99,
      effectText: '最大HP +10',
      desc: '最大ライフを増やす'
    }
  ];

  let currentTab = 'avatar';

  function $(id){
    return document.getElementById(id);
  }

  function defaultState(){
    const avatars = {};
    const records = {};

    AVATAR_MASTER.forEach(item => {
      avatars[item.key] = !!item.ownedDefault;
    });

    RECORD_MASTER.forEach(item => {
      records[item.key] = !!item.ownedDefault;
    });

    return {
      avatars,
      records,
      upgrades: {
        power: 0,
        range: 0,
        rapid: 0,
        hp: 0
      }
    };
  }

  function loadState(){
    let state = defaultState();

    try {
      const raw = localStorage.getItem(SHOP_SAVE_KEY);

      if (raw) {
        const parsed = JSON.parse(raw);

        state = Object.assign(state, parsed || {});
        state.avatars = Object.assign(defaultState().avatars, parsed.avatars || {});
        state.records = Object.assign(defaultState().records, parsed.records || {});
        state.upgrades = Object.assign(defaultState().upgrades, parsed.upgrades || {});
      }
    } catch(e) {}

    return state;
  }

  function saveState(state){
    try {
      localStorage.setItem(SHOP_SAVE_KEY, JSON.stringify(state));
    } catch(e) {}
  }

  function getSave(){
    if (window.MobShotStorage && window.MobShotStorage.load) {
      return window.MobShotStorage.load();
    }

    return {
      coin: 0,
      rank: 1,
      diamond: 0,
      totalScore: 0,
      bestScore: 0
    };
  }

  function saveMainData(save){
    if (window.MobShotStorage && window.MobShotStorage.save) {
      window.MobShotStorage.save(save);
      return;
    }

    try {
      localStorage.setItem('mobshot_split_v1', JSON.stringify(save));
    } catch(e) {}
  }

  function refreshHud(){
    if (window.MobShotMain && window.MobShotMain.refreshMainHud) {
      window.MobShotMain.refreshMainHud();
    }

    window.dispatchEvent(new CustomEvent('mobshot:saveUpdated'));
  }

  function playerRank(){
    const save = getSave();
    return Number(save.rank || 1);
  }

  function canUnlock(item){
    return playerRank() >= Number(item.rank || 1);
  }

  function priceText(item){
    if (item.price == null) return '価格未設定';
    if (Number(item.price) <= 0) return '無料';
    return `${Number(item.price).toLocaleString()} COIN`;
  }

  function upgradeCost(key, currentLv){
    const nextLv = currentLv + 1;

    if (key === 'power') {
      if (nextLv === 1) return 100;
      if (nextLv === 2) return 300;
      if (nextLv === 3) return 600;
      if (nextLv === 4) return 800;
      if (nextLv === 5) return 1000;
      return 1000 + (nextLv - 5) * 1000;
    }

    if (key === 'range') {
      if (nextLv === 1) return 100;
      if (nextLv === 2) return 300;
      if (nextLv === 3) return 600;
      if (nextLv === 4) return 800;
      if (nextLv === 5) return 1000;
      return 1000 + (nextLv - 5) * 3000;
    }

    if (key === 'rapid') {
      if (nextLv === 1) return 1500;
      if (nextLv === 2) return 3000;
      if (nextLv === 3) return 5000;
      if (nextLv === 4) return 8000;
      if (nextLv === 5) return 12000;
      return 12000 + (nextLv - 5) * 4000;
    }

    if (key === 'hp') {
      if (nextLv === 1) return 150;
      if (nextLv === 2) return 300;
      if (nextLv === 3) return 450;
      if (nextLv === 4) return 600;
      if (nextLv === 5) return 1000;
      return 1000 + (nextLv - 5) * 1000;
    }

    return 999999;
  }

  function buyAvatar(key){
    const item = AVATAR_MASTER.find(v => v.key === key);
    if (!item) return;

    const state = loadState();

    if (state.avatars[key]) {
      alert('すでに所持しています。');
      return;
    }

    if (!canUnlock(item)) {
      alert(`RANK${item.rank}で解放されます。`);
      return;
    }

    if (item.price == null) {
      alert('価格未設定のため、まだ購入できません。');
      return;
    }

    const save = getSave();
    const haveCoin = Number(save.coin || 0);

    if (haveCoin < item.price) {
      alert(`COINが足りません。\n必要COIN: ${item.price.toLocaleString()}`);
      return;
    }

    save.coin = haveCoin - item.price;
    saveMainData(save);

    state.avatars[key] = true;
    saveState(state);

    refreshHud();
    render();
  }

  function buyRecord(key){
    const item = RECORD_MASTER.find(v => v.key === key);
    if (!item) return;

    const state = loadState();

    if (state.records[key]) {
      alert('すでに所持しています。');
      return;
    }

    if (!canUnlock(item)) {
      alert(`RANK${item.rank}で解放されます。`);
      return;
    }

    if (item.price == null) {
      alert('価格未設定のため、まだ購入できません。');
      return;
    }

    const save = getSave();
    const haveCoin = Number(save.coin || 0);

    if (haveCoin < item.price) {
      alert(`COINが足りません。\n必要COIN: ${item.price.toLocaleString()}`);
      return;
    }

    save.coin = haveCoin - item.price;
    saveMainData(save);

    state.records[key] = true;
    saveState(state);

    refreshHud();
    render();
  }

  function upgrade(key){
    const item = UPGRADE_MASTER.find(v => v.key === key);
    if (!item) return;

    const state = loadState();
    const lv = Number(state.upgrades[key] || 0);

    if (lv >= item.max) {
      alert('最大Lvです。');
      return;
    }

    const cost = upgradeCost(key, lv);
    const save = getSave();
    const haveCoin = Number(save.coin || 0);

    if (haveCoin < cost) {
      alert(`COINが足りません。\n必要COIN: ${cost.toLocaleString()}`);
      return;
    }

    save.coin = haveCoin - cost;
    saveMainData(save);

    state.upgrades[key] = lv + 1;
    saveState(state);

    showLevelUp();
    refreshHud();
    render();
  }

  function showLevelUp(){
    const modal = $('shopModal');
    if (!modal) return;

    const fx = document.createElement('div');
    fx.textContent = 'LEVEL UP!';
    fx.style.position = 'absolute';
    fx.style.left = '50%';
    fx.style.top = '50%';
    fx.style.transform = 'translate(-50%,-50%)';
    fx.style.zIndex = '200';
    fx.style.padding = '14px 24px';
    fx.style.borderRadius = '999px';
    fx.style.background = 'linear-gradient(#ffe44d,#ff9418)';
    fx.style.color = '#351900';
    fx.style.fontWeight = '1000';
    fx.style.fontSize = '26px';
    fx.style.boxShadow = '0 8px 0 #874300, 0 18px 40px rgba(0,0,0,.45)';
    fx.style.pointerEvents = 'none';

    modal.appendChild(fx);

    setTimeout(() => {
      if (fx.parentNode) {
        fx.parentNode.removeChild(fx);
      }
    }, 700);
  }

  function iconAvatar(item, locked){
    const lock = locked ? ' lock-icon' : '';

    return `
      <div class="shop-card-icon${lock}">
        <img src="${item.menuImage}" alt="${item.name}" onerror="this.style.display='none';">
      </div>
    `;
  }

  function iconRecord(item, locked){
    const lock = locked ? ' lock-icon' : '';

    return `
      <div class="shop-card-icon record-icon${lock}">
        <span style="font-size:10px;font-weight:1000;color:#fff;text-shadow:0 2px 0 #000;text-align:center;line-height:1.05;">${item.name}</span>
      </div>
    `;
  }

  function iconUpgrade(){
    return `<div class="shop-card-icon upgrade-icon"></div>`;
  }

  function renderAvatar(){
    const list = $('shopList');
    if (!list) return;

    const state = loadState();
    list.innerHTML = '';

    AVATAR_MASTER.forEach(item => {
      const owned = !!state.avatars[item.key];
      const locked = !canUnlock(item);
      const disabled = owned || locked || item.price == null;

      const card = document.createElement('div');
      card.className = 'shop-card' + (locked ? ' locked' : '');

      card.innerHTML = `
        ${iconAvatar(item, locked)}
        <div class="shop-card-body">
          <div class="shop-card-name">${item.name}</div>
          <div class="shop-card-desc">${item.desc}</div>
          <div class="shop-card-price">価格: ${priceText(item)}</div>
          <div class="shop-card-spec">${owned ? '所持中' : locked ? `RANK${item.rank}で解放` : '未所持'}</div>
        </div>
        <div class="shop-card-actions">
          <button type="button" class="shop-card-btn" ${disabled ? 'disabled' : ''}>
            ${owned ? '所持中' : locked ? 'LOCK' : item.price == null ? '未設定' : '購入'}
          </button>
        </div>
      `;

      const btn = card.querySelector('.shop-card-btn');

      if (btn && !disabled) {
        btn.addEventListener('click', function(){
          buyAvatar(item.key);
        });
      }

      list.appendChild(card);
    });
  }

  function renderRecord(){
    const list = $('shopList');
    if (!list) return;

    const state = loadState();
    list.innerHTML = '';

    RECORD_MASTER.forEach(item => {
      const owned = !!state.records[item.key];
      const locked = !canUnlock(item);
      const disabled = owned || locked || item.price == null;

      const card = document.createElement('div');
      card.className = 'shop-card' + (locked ? ' locked' : '');

      card.innerHTML = `
        ${iconRecord(item, locked)}
        <div class="shop-card-body">
          <div class="shop-card-name">${item.name}</div>
          <div class="shop-card-desc">${item.desc}</div>
          <div class="shop-card-price">価格: ${priceText(item)}</div>
          <div class="shop-card-spec">${owned ? '所持中' : locked ? `RANK${item.rank}で解放` : '未所持'}</div>
        </div>
        <div class="shop-card-actions">
          <button type="button" class="shop-card-btn" ${disabled ? 'disabled' : ''}>
            ${owned ? '所持中' : locked ? 'LOCK' : item.price == null ? '未設定' : '購入'}
          </button>
        </div>
      `;

      const btn = card.querySelector('.shop-card-btn');

      if (btn && !disabled) {
        btn.addEventListener('click', function(){
          buyRecord(item.key);
        });
      }

      list.appendChild(card);
    });
  }

  function renderUpgrade(){
    const list = $('shopList');
    if (!list) return;

    const state = loadState();
    list.innerHTML = '';

    UPGRADE_MASTER.forEach(item => {
      const lv = Number(state.upgrades[item.key] || 0);
      const maxed = lv >= item.max;
      const cost = maxed ? 0 : upgradeCost(item.key, lv);

      const card = document.createElement('div');
      card.className = 'shop-card';

      card.innerHTML = `
        ${iconUpgrade()}
        <div class="shop-card-body">
          <div class="shop-card-name">${item.name}<span>Lv${lv}/${item.max}</span></div>
          <div class="shop-card-desc">${item.desc}</div>
          <div class="shop-card-price">${item.effectText}</div>
          <div class="shop-card-spec">${maxed ? 'MAX' : `次の強化: ${cost.toLocaleString()} COIN`}</div>
        </div>
        <div class="shop-card-actions">
          <button type="button" class="shop-card-btn" ${maxed ? 'disabled' : ''}>
            ${maxed ? 'MAX' : '強化'}
          </button>
        </div>
      `;

      const btn = card.querySelector('.shop-card-btn');

      if (btn && !maxed) {
        btn.addEventListener('click', function(){
          upgrade(item.key);
        });
      }

      list.appendChild(card);
    });
  }

  function setTab(tab){
    currentTab = tab;

    const avatar = $('shopTabAvatar');
    const record = $('shopTabRecord');
    const upgradeBtn = $('shopTabUpgrade');

    if (avatar) avatar.classList.toggle('active', tab === 'avatar');
    if (record) record.classList.toggle('active', tab === 'record');
    if (upgradeBtn) upgradeBtn.classList.toggle('active', tab === 'upgrade');

    render();
  }

  function render(){
    if (currentTab === 'avatar') {
      renderAvatar();
      return;
    }

    if (currentTab === 'record') {
      renderRecord();
      return;
    }

    renderUpgrade();
  }

  function open(){
    const modal = $('shopModal');
    if (!modal) return;

    setTab(currentTab || 'avatar');
    modal.classList.remove('hidden');
  }

  function close(){
    const modal = $('shopModal');
    if (!modal) return;

    modal.classList.add('hidden');
  }

  function bind(){
    const openBtn = $('openShopBtn');

    if (openBtn && !openBtn.__mobShopBound) {
      openBtn.__mobShopBound = true;

      openBtn.addEventListener('click', function(e){
        e.preventDefault();
        e.stopPropagation();
        open();
      }, { passive:false });

      openBtn.addEventListener('pointerup', function(e){
        e.preventDefault();
        e.stopPropagation();
        open();
      }, { passive:false });
    }

    const closeBtn = $('shopCloseBtn');

    if (closeBtn && !closeBtn.__mobShopCloseBound) {
      closeBtn.__mobShopCloseBound = true;

      closeBtn.addEventListener('click', function(e){
        e.preventDefault();
        e.stopPropagation();
        close();
      }, { passive:false });
    }

    const tabAvatar = $('shopTabAvatar');
    const tabRecord = $('shopTabRecord');
    const tabUpgrade = $('shopTabUpgrade');

    if (tabAvatar && !tabAvatar.__mobShopTabBound) {
      tabAvatar.__mobShopTabBound = true;
      tabAvatar.addEventListener('click', function(){ setTab('avatar'); });
    }

    if (tabRecord && !tabRecord.__mobShopTabBound) {
      tabRecord.__mobShopTabBound = true;
      tabRecord.addEventListener('click', function(){ setTab('record'); });
    }

    if (tabUpgrade && !tabUpgrade.__mobShopTabBound) {
      tabUpgrade.__mobShopTabBound = true;
      tabUpgrade.addEventListener('click', function(){ setTab('upgrade'); });
    }

    const modal = $('shopModal');

    if (modal && !modal.__mobShopBgBound) {
      modal.__mobShopBgBound = true;

      modal.addEventListener('click', function(e){
        if (e.target === modal) {
          close();
        }
      });
    }
  }

  function init(){
    bind();
    render();
  }

  function isAvatarOwned(key){
    const state = loadState();
    return !!state.avatars[key];
  }

  function isRecordOwned(key){
    const state = loadState();
    return !!state.records[key];
  }

  function getAvatar(key){
    return AVATAR_MASTER.find(v => v.key === key) || null;
  }

  function getRecord(key){
    return RECORD_MASTER.find(v => v.key === key) || null;
  }

  function getUpgrades(){
    return Object.assign({}, loadState().upgrades);
  }

  function getUpgradeBonus(){
    const up = getUpgrades();

    return {
      power: Number(up.power || 0) * 0.5,
      range: Number(up.range || 0) * 0.5,
      rapid: Number(up.rapid || 0) * 0.1,
      hp: Number(up.hp || 0) * 10
    };
  }

  document.addEventListener('DOMContentLoaded', init);

  window.MobShotShop = {
    init,
    open,
    close,
    render,
    loadState,
    saveState,
    isAvatarOwned,
    isRecordOwned,
    getAvatar,
    getRecord,
    getUpgrades,
    getUpgradeBonus,
    AVATAR_MASTER,
    RECORD_MASTER,
    UPGRADE_MASTER
  };
})();
