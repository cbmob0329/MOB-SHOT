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
      price: 3000,
      rank: 1,
      ownedDefault: false,
      menuImage: 'play/playblue2.png',
      backImage: 'play/playblue.png',
      desc: '能力変化なし'
    },
    {
      key: 'purple',
      name: 'パープルモデル',
      price: 3000,
      rank: 1,
      ownedDefault: false,
      menuImage: 'play/playpar2.png',
      backImage: 'play/playpar.png',
      desc: '能力変化なし'
    },
    {
      key: 'yellow',
      name: 'イエローモデル',
      price: 3000,
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
      price: 15000,
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
      rank: 10,
      ownedDefault: false,
      menuImage: 'play/playbr2.png',
      backImage: 'play/playbr.png',
      desc: 'RANK10で解放 / 能力変化なし'
    },
    {
      key: 'pinks',
      name: 'ラフスタイルモデル',
      price: 10000,
      rank: 10,
      ownedDefault: false,
      menuImage: 'play/pink.png',
      backImage: 'play/pink2.png',
      desc: 'RANK10で解放 / 能力変化なし'
    },
    {
      key: 'sabak',
      name: '砂漠盗賊モデル',
      price: 10000,
      rank: 10,
      ownedDefault: false,
      menuImage: 'play/sabak.png',
      backImage: 'play/sabak2.png',
      desc: 'RANK10で解放 / 能力変化なし'
    },
    {
      key: 'dot',
      name: 'ドットモブモデル',
      price: 15000,
      rank: 10,
      ownedDefault: false,
      menuImage: 'play/dot.png',
      backImage: 'play/dot2.png',
      desc: 'RANK10で解放 / 能力変化なし'
    },
    {
      key: 'home',
      name: 'ホームズモデル',
      price: 15000,
      rank: 10,
      ownedDefault: false,
      menuImage: 'play/home.png',
      backImage: 'play/home2.png',
      desc: 'RANK10で解放 / 能力変化なし'
    },
    {
      key: 'puni',
      name: 'ぷにモブモデル',
      price: 20000,
      rank: 15,
      ownedDefault: false,
      menuImage: 'play/puni.png',
      backImage: 'play/puni2.png',
      desc: 'RANK15で解放 / 能力変化なし'
    },
    {
      key: 'gra',
      name: 'グラディモブモデル',
      price: 20000,
      rank: 15,
      ownedDefault: false,
      menuImage: 'play/gra.png',
      backImage: 'play/gra2.png',
      desc: 'RANK15で解放 / 能力変化なし'
    },
    {
      key: 'art',
      name: 'MOB ARTISTモデル',
      price: 20000,
      rank: 15,
      ownedDefault: false,
      menuImage: 'play/art.png',
      backImage: 'play/art2.png',
      desc: 'RANK15で解放 / 能力変化なし'
    },
    {
      key: 'kaeru',
      name: 'カエルモデル',
      price: 20000,
      rank: 15,
      ownedDefault: false,
      menuImage: 'play/kaeru.png',
      backImage: 'play/kaeru2.png',
      desc: 'RANK15で解放 / 能力変化なし'
    },
    {
      key: 'party',
      name: 'MOB PARTYモデル',
      price: 20000,
      rank: 15,
      ownedDefault: false,
      menuImage: 'play/party.png',
      backImage: 'play/party2.png',
      desc: 'RANK15で解放 / 能力変化なし'
    },
    {
      key: 'gold',
      name: 'ゴールドモデル',
      price: 30000,
      rank: 20,
      ownedDefault: false,
      menuImage: 'play/gold.png',
      backImage: 'play/gold2.png',
      desc: 'RANK20で解放 / 能力変化なし'
    },
    {
      key: 'toy',
      name: 'トイプーモデル',
      price: 30000,
      rank: 20,
      ownedDefault: false,
      menuImage: 'play/toy.png',
      backImage: 'play/toy2.png',
      desc: 'RANK20で解放 / 能力変化なし'
    },
    {
      key: 'dog',
      name: 'モフドッグモデル',
      price: 30000,
      rank: 20,
      ownedDefault: false,
      menuImage: 'play/dog.png',
      backImage: 'play/dog2.png',
      desc: 'RANK20で解放 / 能力変化なし'
    },
    {
      key: 'mohu',
      name: 'モフモフモデル',
      price: 30000,
      rank: 20,
      ownedDefault: false,
      menuImage: 'play/mohu.png',
      backImage: 'play/mohu2.png',
      desc: 'RANK20で解放 / 能力変化なし'
    },
    {
      key: 'gab',
      name: 'ティラノモデル',
      price: 30000,
      rank: 20,
      ownedDefault: false,
      menuImage: 'play/gab.png',
      backImage: 'play/gab2.png',
      desc: 'RANK20で解放 / 能力変化なし'
    },
    {
      key: 'waack',
      name: 'waackモデル',
      price: 30000,
      rank: 20,
      ownedDefault: false,
      menuImage: 'play/waack.png',
      backImage: 'play/waack.png',
      desc: 'RANK20で解放 / 能力変化なし'
    },
    {
      key: 'magic',
      name: 'マジックモデル',
      price: 30000,
      rank: 20,
      ownedDefault: false,
      menuImage: 'play/magic.png',
      backImage: 'play/magic2.png',
      desc: 'RANK20で解放 / 能力変化なし'
    },
    {
      key: 'ace',
      name: 'エースモデル',
      price: 30000,
      rank: 20,
      ownedDefault: false,
      menuImage: 'play/ace1.png',
      backImage: 'play/ace2.png',
      desc: 'RANK20で解放 / 能力変化なし'
    },
    {
      key: 'ace2',
      name: 'エースⅡモデル',
      price: 30000,
      rank: 20,
      ownedDefault: false,
      menuImage: 'play/ace3.png',
      backImage: 'play/ace4.png',
      desc: 'RANK20で解放 / 能力変化なし'
    },
    {
      key: 'nep',
      name: 'ネプモデル',
      price: 50000,
      rank: 30,
      ownedDefault: false,
      menuImage: 'play/nep.png',
      backImage: 'play/nep2.png',
      desc: 'RANK30で解放 / 能力変化なし'
    },
    {
      key: 'en',
      name: '閻魔モデル',
      price: 50000,
      rank: 30,
      ownedDefault: false,
      menuImage: 'play/en.png',
      backImage: 'play/en2.png',
      desc: 'RANK30で解放 / 能力変化なし'
    },
    {
      key: 'riris',
      name: 'リリスモデル',
      price: 50000,
      rank: 30,
      ownedDefault: false,
      menuImage: 'play/riris.png',
      backImage: 'play/riris2.png',
      desc: 'RANK30で解放 / 能力変化なし'
    },
    {
      key: 'ul',
      name: 'ウルリリスモデル',
      price: 50000,
      rank: 30,
      ownedDefault: false,
      menuImage: 'play/ulriri.png',
      backImage: 'play/ulriri2.png',
      desc: 'RANK30で解放 / 能力変化なし'
    },
    {
      key: 'nekok',
      name: 'ネコクーモデル',
      price: 50000,
      rank: 30,
      ownedDefault: false,
      menuImage: 'play/nekok.png',
      backImage: 'play/nekok2.png',
      desc: 'RANK30で解放 / 能力変化なし'
    },
    {
      key: 'anohero',
      name: 'あのヒーローモデル',
      price: 50000,
      rank: 30,
      ownedDefault: false,
      menuImage: 'play/hero.png',
      backImage: 'play/hero2.png',
      desc: 'RANK30で解放 / 能力変化なし'
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
      price: 8000,
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
      price: 20000,
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
      price: 35000,
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
      price: 80000,
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
      price: 120000,
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
      price: 160000,
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
      price: 220000,
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
      price: 350000,
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
      price: 450000,
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
      price: 600000,
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
      price: 800000,
      rank: 20,
      ownedDefault: false,
      power: 2,
      rapid: 0.3,
      hp: 100,
      desc: 'RANK20 / POWER+2 / 攻撃速度+0.3 / HP+100'
    }
  ];

  const UPGRADE_MASTER = [
    { key: 'power', name: 'POWER', max: 120, effectText: '攻撃力 +0.5', desc: '弾ダメージを上げる' },
    { key: 'range', name: 'RANGE', max: 15, effectText: '射程 +0.5', desc: '弾の飛距離を伸ばす' },
    { key: 'rapid', name: '攻撃速度', max: 50, effectText: '攻撃速度 +0.1', desc: '連射速度を少し上げる' },
    { key: 'hp', name: 'HP', max: 150, effectText: '最大HP +10', desc: '最大ライフを増やす' }
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

  function hasLimitBreakUnlocked(){
    return playerRank() >= 40;
  }

  function canUnlock(item){
    return playerRank() >= Number(item.rank || 1);
  }

  function priceText(item){
    if (item.price == null) return '価格未設定';
    if (Number(item.price) <= 0) return '無料';
    return `${Number(item.price).toLocaleString()} COIN`;
  }

  function getNormalUpgradeCap(key){
    if (key === 'hp') return 99;

    const rank = playerRank();

    if (rank <= 9) {
      if (key === 'power') return 5;
      if (key === 'range') return 2;
      if (key === 'rapid') return 5;
    }

    if (rank <= 14) {
      if (key === 'power') return 10;
      if (key === 'range') return 5;
      if (key === 'rapid') return 10;
    }

    if (rank <= 25) {
      if (key === 'power') return 30;
      if (key === 'range') return 8;
      if (key === 'rapid') return 15;
    }

    if (rank <= 35) {
      if (key === 'power') return 40;
      if (key === 'range') return 9;
      if (key === 'rapid') return 20;
    }

    if (key === 'power') return 50;
    if (key === 'range') return 10;
    if (key === 'rapid') return 30;

    return 99;
  }

  function getLimitBreakUpgradeCap(key){
    if (key === 'power') return 120;
    if (key === 'range') return 15;
    if (key === 'rapid') return 50;
    if (key === 'hp') return 150;

    return getNormalUpgradeCap(key);
  }

  function getRankUpgradeCap(key){
    if (hasLimitBreakUnlocked()) {
      return getLimitBreakUpgradeCap(key);
    }

    return getNormalUpgradeCap(key);
  }

  function rankCapText(key){
    const cap = getRankUpgradeCap(key);

    if (hasLimitBreakUnlocked()) {
      return `RANK40達成: Lv${cap}まで`;
    }

    if (key === 'hp') {
      return `現在: Lv99まで / RANK40でLv150解放`;
    }

    const rank = playerRank();

    return `現在RANK${rank}: Lv${cap}まで / RANK40でLv${getLimitBreakUpgradeCap(key)}解放`;
  }

  function upgradeCost(key, currentLv){
    const nextLv = currentLv + 1;

    if (key === 'power') {
      if (nextLv <= 5) return 1500 * nextLv;
      if (nextLv <= 10) return 10000 + (nextLv - 5) * 4500;
      if (nextLv <= 30) return 35000 + (nextLv - 10) * 9000;
      if (nextLv <= 40) return 220000 + (nextLv - 30) * 22000;
      if (nextLv <= 50) return 470000 + (nextLv - 40) * 45000;
      if (nextLv <= 80) return 950000 + (nextLv - 50) * 70000;
      return 3100000 + (nextLv - 80) * 120000;
    }

    if (key === 'range') {
      if (nextLv <= 2) return 3000 * nextLv;
      if (nextLv <= 5) return 12000 + (nextLv - 2) * 10000;
      if (nextLv <= 8) return 50000 + (nextLv - 5) * 35000;
      if (nextLv <= 9) return 200000;
      if (nextLv <= 10) return 350000;
      return 550000 + (nextLv - 10) * 180000;
    }

    if (key === 'rapid') {
      if (nextLv <= 5) return 5000 * nextLv;
      if (nextLv <= 10) return 35000 + (nextLv - 5) * 15000;
      if (nextLv <= 15) return 120000 + (nextLv - 10) * 30000;
      if (nextLv <= 20) return 300000 + (nextLv - 15) * 60000;
      if (nextLv <= 30) return 650000 + (nextLv - 20) * 90000;
      return 1600000 + (nextLv - 30) * 140000;
    }

    if (key === 'hp') {
      if (nextLv <= 10) return 1000 * nextLv;
      if (nextLv <= 30) return 12000 + (nextLv - 10) * 3500;
      if (nextLv <= 60) return 85000 + (nextLv - 30) * 7000;
      if (nextLv <= 99) return 300000 + (nextLv - 60) * 12000;
      return 800000 + (nextLv - 99) * 25000;
    }

    return 999999999;
  }

  function calcUpgradeBatch(key, limit){
    const item = UPGRADE_MASTER.find(v => v.key === key);

    if (!item) {
      return {
        count: 0,
        cost: 0,
        stopReason: 'notfound'
      };
    }

    const state = loadState();
    const save = getSave();
    const rankCap = getRankUpgradeCap(key);

    let lv = Number(state.upgrades[key] || 0);
    let coin = Number(save.coin || 0);
    let count = 0;
    let costTotal = 0;
    let stopReason = '';

    while (count < limit) {
      if (lv >= item.max) {
        stopReason = 'max';
        break;
      }

      if (lv >= rankCap) {
        stopReason = 'rank';
        break;
      }

      const cost = upgradeCost(key, lv);

      if (coin < cost) {
        stopReason = 'coin';
        break;
      }

      coin -= cost;
      costTotal += cost;
      lv += 1;
      count += 1;
    }

    return {
      count,
      cost: costTotal,
      stopReason
    };
  }

  function upgradeBatch(key, limit){
    const item = UPGRADE_MASTER.find(v => v.key === key);
    if (!item) return;

    const batch = calcUpgradeBatch(key, limit);

    if (batch.count <= 0) {
      const state = loadState();
      const lv = Number(state.upgrades[key] || 0);
      const rankCap = getRankUpgradeCap(key);

      if (lv >= item.max) {
        alert('最大Lvです。');
        return;
      }

      if (lv >= rankCap) {
        alert(`現在はこれ以上強化できません。\n${rankCapText(key)}`);
        return;
      }

      alert('COINが足りません。');
      return;
    }

    const state = loadState();
    const save = getSave();

    save.coin = Number(save.coin || 0) - batch.cost;
    state.upgrades[key] = Number(state.upgrades[key] || 0) + batch.count;

    saveMainData(save);
    saveState(state);

    showLevelUp(batch.count);
    refreshHud();
    render();
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
    upgradeBatch(key, 1);
  }

  function showLevelUp(count){
    const modal = $('shopModal');
    if (!modal) return;

    const fx = document.createElement('div');
    fx.textContent = count && count > 1 ? `LEVEL UP +${count}!` : 'LEVEL UP!';
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
      if (fx.parentNode) fx.parentNode.removeChild(fx);
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
      const rankCap = Math.min(item.max, getRankUpgradeCap(item.key));
      const maxed = lv >= item.max;
      const rankLocked = !maxed && lv >= rankCap;
      const cost = maxed || rankLocked ? 0 : upgradeCost(item.key, lv);
      const batch10 = calcUpgradeBatch(item.key, 10);
      const batchMax = calcUpgradeBatch(item.key, 999);

      const card = document.createElement('div');
      card.className = 'shop-card' + (rankLocked ? ' locked' : '');

      card.innerHTML = `
        ${iconUpgrade()}
        <div class="shop-card-body">
          <div class="shop-card-name">${item.name}<span>Lv${lv}/${item.max}</span></div>
          <div class="shop-card-desc">${item.desc}</div>
          <div class="shop-card-price">${item.effectText}</div>
          <div class="shop-card-spec">${rankCapText(item.key)}</div>
          <div class="shop-card-spec">${
            maxed
              ? 'MAX'
              : rankLocked
                ? `制限中 / Lv${rankCap}まで`
                : `次の強化: ${cost.toLocaleString()} COIN`
          }</div>
          <div class="shop-card-spec">${
            maxed || rankLocked
              ? ''
              : `10回: ${batch10.count > 0 ? `${batch10.count}Lv / ${batch10.cost.toLocaleString()} COIN` : '不可'}`
          }</div>
          <div class="shop-card-spec">${
            maxed || rankLocked
              ? ''
              : `MAX: ${batchMax.count > 0 ? `${batchMax.count}Lv / ${batchMax.cost.toLocaleString()} COIN` : '不可'}`
          }</div>
        </div>
        <div class="shop-card-actions" style="display:grid;gap:6px;">
          <button type="button" class="shop-card-btn upgrade-one" ${maxed || rankLocked ? 'disabled' : ''}>
            ${maxed ? 'MAX' : rankLocked ? 'LOCK' : '1回'}
          </button>
          <button type="button" class="shop-card-btn upgrade-ten" ${maxed || rankLocked || batch10.count <= 0 ? 'disabled' : ''}>
            10回
          </button>
          <button type="button" class="shop-card-btn upgrade-max" ${maxed || rankLocked || batchMax.count <= 0 ? 'disabled' : ''}>
            MAX
          </button>
        </div>
      `;

      const btnOne = card.querySelector('.upgrade-one');
      const btnTen = card.querySelector('.upgrade-ten');
      const btnMax = card.querySelector('.upgrade-max');

      if (!maxed && !rankLocked) {
        if (btnOne) {
          btnOne.addEventListener('click', function(){
            upgradeBatch(item.key, 1);
          });
        }

        if (btnTen && batch10.count > 0) {
          btnTen.addEventListener('click', function(){
            upgradeBatch(item.key, 10);
          });
        }

        if (btnMax && batchMax.count > 0) {
          btnMax.addEventListener('click', function(){
            upgradeBatch(item.key, 999);
          });
        }
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
        if (e.target === modal) close();
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
    getRankUpgradeCap,
    upgradeCost,
    upgrade,
    upgradeBatch,
    calcUpgradeBatch,
    hasLimitBreakUnlocked,
    AVATAR_MASTER,
    RECORD_MASTER,
    UPGRADE_MASTER
  };
})();
