'use strict';

(function(){
  const GACHA_SAVE_KEY = 'mobshot_gacha_state_v1';
  const COLLECTION_SAVE_KEY = 'mobshot_collection_display_v1';
  const SOUL_CT_LIMIT_SEC = 8;

  const RARITY = {
    R:   { max:99, image:'mt/R.png' },
    SR:  { max:50, image:'mt/SR.png' },
    SSR: { max:30, image:'mt/SSR.png' },
    UR:  { max:10, image:'mt/UR.png' }
  };

  const SOUL_CT = {
    R:   { base:0.01, step:0.001 },
    SR:  { base:0.04, step:0.003 },
    SSR: { base:0.08, step:0.006 },
    UR:  { base:0.15, step:0.012 }
  };

  const CATEGORY_LIST = [
    { key:'enemy', name:'ENEMY', label:'MOB SHOT ENEMY' },
    { key:'mid', name:'MID BOSS', label:'MOB SHOT MID BOSS' },
    { key:'boss', name:'BOSS', label:'MOB SHOT BOSS' },
    { key:'artist', name:'ARTIST', label:'MOB ARTIST' },
    { key:'sp', name:'BOSS SP', label:'MOB SHOT BOSS SP' },
    { key:'pet', name:'PET', label:'MOB PET' },
    { key:'event', name:'EVENT', label:'MOB EVENT' }
  ];

  let currentMode = 'stone';
  let currentCategory = 'all';
  let currentPage = 1;
  let selectSlotIndex = null;

  function $(id){ return document.getElementById(id); }

  function allStones(){
    if (window.MobShotGacha && window.MobShotGacha.allStones) return window.MobShotGacha.allStones();
    return [];
  }

  function allSouls(){
    if (window.MobShotGacha && window.MobShotGacha.allSouls) return window.MobShotGacha.allSouls();
    if (window.MobShotSoul && window.MobShotSoul.allSouls) return window.MobShotSoul.allSouls();
    return [];
  }

  function currentItems(){
    return currentMode === 'soul' ? allSouls() : allStones();
  }

  function rarityImage(rarity){
    if (window.MobShotGacha && window.MobShotGacha.rarityImage) return window.MobShotGacha.rarityImage(rarity);
    return RARITY[rarity] ? RARITY[rarity].image : RARITY.R.image;
  }

  function rarityMax(rarity){
    if (window.MobShotGacha && window.MobShotGacha.rarityMax) return window.MobShotGacha.rarityMax(rarity);
    return RARITY[rarity] ? RARITY[rarity].max : 99;
  }

  function rarityClass(rarity){
    if (window.MobShotGacha && window.MobShotGacha.rarityClass) return window.MobShotGacha.rarityClass(rarity);
    if (rarity === 'UR') return 'rarity-frame-ur';
    if (rarity === 'SSR') return 'rarity-frame-ssr';
    if (rarity === 'SR') return 'rarity-frame-sr';
    return 'rarity-frame-r';
  }

  function categoryKey(stone){
    if (!stone || !stone.category) return 'enemy';
    if (stone.category === 'MOB SHOT MID BOSS') return 'mid';
    if (stone.category === 'MOB SHOT BOSS') return 'boss';
    if (stone.category === 'MOB ARTIST') return 'artist';
    if (stone.category === 'MOB SHOT BOSS SP') return 'sp';
    if (stone.category === 'MOB PET') return 'pet';
    if (stone.category === 'MOB EVENT') return 'event';
    return 'enemy';
  }

  function defaultGachaState(){
    return { stones:{}, skills:{}, souls:{} };
  }

  function loadGachaState(){
    if (window.MobShotGacha && window.MobShotGacha.loadState) return window.MobShotGacha.loadState();

    let state = defaultGachaState();

    try {
      const raw = localStorage.getItem(GACHA_SAVE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) || {};
        state = Object.assign(state, parsed);
        state.stones = Object.assign({}, parsed.stones || {});
        state.skills = Object.assign({}, parsed.skills || {});
        state.souls = Object.assign({}, parsed.souls || {});
      }
    } catch(e) {}

    return state;
  }

  function defaultDisplayState(){
    return { display:[null, null, null], soulDisplay:[null, null, null] };
  }

  function loadDisplayState(){
    let state = defaultDisplayState();

    try {
      const raw = localStorage.getItem(COLLECTION_SAVE_KEY);
      if (raw) state = Object.assign(state, JSON.parse(raw) || {});
    } catch(e) {}

    state.display = Array.isArray(state.display) ? state.display.slice(0, 3) : [null, null, null];
    state.soulDisplay = Array.isArray(state.soulDisplay) ? state.soulDisplay.slice(0, 3) : [null, null, null];

    while (state.display.length < 3) state.display.push(null);
    while (state.soulDisplay.length < 3) state.soulDisplay.push(null);

    state.display = state.display.map(no => {
      const n = Number(no || 0);
      return n >= 1 ? n : null;
    });

    state.soulDisplay = state.soulDisplay.map(no => {
      const n = Number(no || 0);
      return n >= 1 ? n : null;
    });

    return state;
  }

  function saveDisplayState(state){
    const fixed = Object.assign(defaultDisplayState(), state || {});

    fixed.display = Array.isArray(fixed.display) ? fixed.display.slice(0, 3) : [null, null, null];
    fixed.soulDisplay = Array.isArray(fixed.soulDisplay) ? fixed.soulDisplay.slice(0, 3) : [null, null, null];

    while (fixed.display.length < 3) fixed.display.push(null);
    while (fixed.soulDisplay.length < 3) fixed.soulDisplay.push(null);

    try {
      localStorage.setItem(COLLECTION_SAVE_KEY, JSON.stringify(fixed));
    } catch(e) {}

    window.dispatchEvent(new CustomEvent('mobshot:collectionDisplayUpdated'));
    window.dispatchEvent(new CustomEvent('mobshot:soulDisplayUpdated'));
    window.dispatchEvent(new CustomEvent('mobshot:saveUpdated'));
  }

  function ownedData(no, mode){
    const state = loadGachaState();
    const bucket = mode === 'soul' ? state.souls : state.stones;
    return bucket[String(no)] || null;
  }

  function isOwned(no, mode){
    const data = ownedData(no, mode || currentMode);
    return !!(data && data.owned);
  }

  function ownedCount(mode){
    const targetMode = mode || currentMode;
    const list = targetMode === 'soul' ? allSouls() : allStones();
    let count = 0;

    list.forEach(item => {
      if (isOwned(item.no, targetMode)) count++;
    });

    return count;
  }

  function totalPlus(mode){
    const state = loadGachaState();
    const bucket = mode === 'soul' ? state.souls : state.stones;
    let total = 0;

    Object.keys(bucket || {}).forEach(key => {
      total += Number(bucket[key].plus || 0);
    });

    return total;
  }

  function rarityOwnedCount(rarity, mode){
    const list = mode === 'soul' ? allSouls() : allStones();
    let count = 0;

    list.forEach(item => {
      if (item.rarity === rarity && isOwned(item.no, mode)) count++;
    });

    return count;
  }

  function calcCollectionBonus(){
    const state = loadGachaState();

    const bonus = {
      score:0,
      coin:0,
      hp:0,
      power:0,
      range:0
    };

    function addPercent(target, rarity, plus, table){
      const row = table[rarity] || table.R || { base:0, step:0 };
      bonus[target] += row.base + plus * row.step;
    }

    allStones().forEach(stone => {
      const data = state.stones[String(stone.no)];
      if (!data || !data.owned) return;

      const plus = Number(data.plus || 0);
      const key = categoryKey(stone);
      const rarity = stone.rarity || 'R';

      if (key === 'enemy') {
        addPercent('score', rarity, plus, {
          R:   { base:0.002, step:0.001 },
          SR:  { base:0.006, step:0.002 },
          SSR: { base:0.012, step:0.004 },
          UR:  { base:0.025, step:0.008 }
        });
      }

      if (key === 'mid') {
        addPercent('coin', rarity, plus, {
          R:   { base:0.006, step:0.002 },
          SR:  { base:0.012, step:0.006 },
          SSR: { base:0.025, step:0.010 },
          UR:  { base:0.050, step:0.020 }
        });
      }

      if (key === 'boss') {
        if (rarity === 'SSR') bonus.hp += 50 + plus * 15;
        else if (rarity === 'UR') bonus.hp += 100 + plus * 30;
        else bonus.hp += 15 + plus * 8;
      }

      if (key === 'artist') {
        const value = rarity === 'UR' ? 0.04 + plus * 0.012 : 0.02 + plus * 0.005;
        bonus.score += value;
        bonus.coin += value;
      }

      if (key === 'sp') {
        bonus.power += rarity === 'UR' ? 2 + plus * 0.3 : 0.5 + plus * 0.1;
      }

      if (key === 'pet') {
        bonus.range += 0.01 + plus * 0.003;
      }

      if (key === 'event') {
        if (rarity === 'UR') {
          bonus.power += 0.8 + plus * 0.2;
          bonus.range += 0.01 + plus * 0.003;
        } else {
          bonus.hp += 25 + plus * 15;
        }
      }
    });

    return bonus;
  }

  function soulLimit(){
    if (window.MobShotGacha && Number(window.MobShotGacha.SOUL_CT_LIMIT_SEC || 0) > 0) {
      return Number(window.MobShotGacha.SOUL_CT_LIMIT_SEC);
    }

    if (window.MobShotSoul && Number(window.MobShotSoul.SOUL_CT_LIMIT_SEC || 0) > 0) {
      return Number(window.MobShotSoul.SOUL_CT_LIMIT_SEC);
    }

    return SOUL_CT_LIMIT_SEC;
  }

  function calcSoulCooldownBonus(){
    if (window.MobShotGacha && window.MobShotGacha.calcSoulCooldownReduction) {
      return window.MobShotGacha.calcSoulCooldownReduction();
    }

    if (window.MobShotSoul && window.MobShotSoul.getCooldownReduction) {
      return window.MobShotSoul.getCooldownReduction();
    }

    const state = loadGachaState();
    let total = 0;

    allSouls().forEach(soul => {
      const data = state.souls[String(soul.no)];
      if (!data || !data.owned) return;

      const plus = Number(data.plus || 0);
      const row = SOUL_CT[soul.rarity] || SOUL_CT.SR;

      total += row.base + plus * row.step;
    });

    return Math.min(soulLimit(), Math.floor(total * 1000) / 1000);
  }

  function displayKey(mode){
    return mode === 'soul' ? 'soulDisplay' : 'display';
  }

  function displayTitle(){
    return currentMode === 'soul' ? 'メインに飾るモブソウル 3個' : 'メインに飾る石板 3枚';
  }

  function displayHelp(){
    return currentMode === 'soul'
      ? '飾ったモブソウルはメイン画面でアバター周辺を向きそのままで周回します。'
      : '飾った石板はメイン画面のプレイヤー背面に横スクロール表示されます。';
  }

  function getDisplayItems(mode){
    const targetMode = mode || currentMode;
    const key = displayKey(targetMode);
    const display = loadDisplayState()[key] || [];

    return display
      .filter(no => no && isOwned(no, targetMode))
      .map(no => {
        const list = targetMode === 'soul' ? allSouls() : allStones();
        const item = list.find(s => Number(s.no) === Number(no));
        const data = ownedData(no, targetMode) || {};

        if (!item) return null;

        return Object.assign({}, item, {
          rarity:item.rarity,
          plus:Number(data.plus || 0),
          max:rarityMax(item.rarity)
        });
      })
      .filter(Boolean);
  }

  function getDisplayStones(){
    return getDisplayItems('stone');
  }

  function getDisplaySouls(){
    return getDisplayItems('soul');
  }

  function setDisplaySlot(slotIndex, no){
    const state = loadDisplayState();
    const key = displayKey(currentMode);

    slotIndex = Number(slotIndex);
    if (slotIndex < 0 || slotIndex > 2) return;

    if (!no) {
      state[key][slotIndex] = null;
      saveDisplayState(state);
      selectSlotIndex = null;
      render();
      return;
    }

    if (!isOwned(no, currentMode)) return;

    state[key] = state[key].map(v => Number(v) === Number(no) ? null : v);
    state[key][slotIndex] = Number(no);

    saveDisplayState(state);
    selectSlotIndex = null;
    render();
  }

  function setDisplayItem(no){
    if (!isOwned(no, currentMode)) return;

    const state = loadDisplayState();
    const key = displayKey(currentMode);
    const currentIndex = state[key].findIndex(v => Number(v) === Number(no));

    if (currentIndex >= 0) {
      state[key][currentIndex] = null;
      saveDisplayState(state);
      render();
      return;
    }

    const emptyIndex = state[key].findIndex(v => !v);

    if (emptyIndex >= 0) {
      state[key][emptyIndex] = Number(no);
    } else {
      state[key][0] = Number(no);
    }

    saveDisplayState(state);
    render();
  }

  function percentText(value){
    return `${Math.floor(Number(value || 0) * 1000) / 10}%`;
  }

  function secondsText(value){
    return `${Math.floor(Number(value || 0) * 1000) / 1000}秒`;
  }

  function itemEffectText(item){
    if (currentMode === 'soul') {
      const row = SOUL_CT[item.rarity] || SOUL_CT.SR;
      return `スキルCT -${row.base.toFixed(3)}秒 / +1ごとに -${row.step.toFixed(3)}秒`;
    }

    return item.effect || '';
  }

  function injectStyle(){
    if ($('mobCollectionStyle')) return;

    const style = document.createElement('style');
    style.id = 'mobCollectionStyle';
    style.textContent = `
      .collection-modal{position:absolute;inset:0;z-index:94;display:flex;align-items:center;justify-content:center;padding:14px;background:rgba(0,0,0,.68)}
      .collection-modal.hidden{display:none}
      .collection-card{width:min(96vw,580px);max-height:88vh;overflow:auto;border-radius:26px;padding:14px;background:linear-gradient(180deg,rgba(27,24,62,.98),rgba(5,8,22,.98));border:3px solid rgba(255,255,255,.35);box-shadow:0 18px 48px rgba(0,0,0,.62)}
      .collection-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}
      .collection-head h2{margin:0;font-size:24px;font-weight:1000;color:#fff;text-shadow:0 3px 0 #000}
      .collection-close,.collection-btn{border:0;border-radius:999px;padding:9px 14px;font-weight:1000;background:linear-gradient(#ffe66b,#ffb423);color:#1b1200;box-shadow:0 4px 0 rgba(0,0,0,.35)}
      .collection-btn.gray{background:linear-gradient(#fff,#b7c1d5);color:#182033}
      .collection-mode-tabs{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:0 0 10px}
      .collection-mode-btn{border:0;border-radius:16px;padding:12px 8px;font-size:15px;font-weight:1000;color:#172033;background:linear-gradient(#fff,#b7c1d5);box-shadow:0 4px 0 rgba(0,0,0,.35)}
      .collection-mode-btn.active{background:linear-gradient(#ffe66b,#ff9f23);color:#241300}
      .collection-summary{margin:0 0 10px;padding:10px 12px;border-radius:16px;background:rgba(255,255,255,.10);border:2px solid rgba(255,255,255,.20);color:#dfe8ff;font-size:13px;font-weight:900;line-height:1.5}
      .collection-rarity-row{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:8px}
      .collection-rarity-pill{border-radius:12px;background:rgba(0,0,0,.24);padding:5px 4px;text-align:center;font-size:10px;color:#fff;font-weight:1000}
      .collection-rarity-pill img{height:22px;max-width:48px;object-fit:contain;display:block;margin:0 auto 2px}
      .collection-display{margin:0 0 10px;padding:10px;border-radius:18px;background:rgba(255,230,107,.10);border:2px solid rgba(255,230,107,.35)}
      .collection-display.soul{background:rgba(180,107,255,.12);border-color:rgba(220,150,255,.45)}
      .collection-display-title{font-size:13px;font-weight:1000;color:#ffe66b;margin-bottom:8px;text-shadow:0 2px 0 #000}
      .collection-display.soul .collection-display-title{color:#ff9df0}
      .collection-display-help{font-size:11px;font-weight:900;color:#dfe8ff;margin-bottom:8px;line-height:1.45}
      .collection-display-slots{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
      .collection-display-slot{min-height:106px;border-radius:16px;background:rgba(0,0,0,.24);border:2px dashed rgba(255,255,255,.25);display:flex;align-items:center;justify-content:center;position:relative;overflow:visible}
      .collection-display-slot.active{border-color:#ffe66b;box-shadow:0 0 14px rgba(255,230,107,.55)}
      .collection-display.soul .collection-display-slot.active{border-color:#ff9df0;box-shadow:0 0 14px rgba(255,157,240,.55)}
      .collection-display-slot img.display-rarity{position:absolute;left:4px;top:-10px;width:54px;height:28px;object-fit:contain;z-index:6;filter:drop-shadow(0 3px 0 rgba(0,0,0,.55));animation:collectionRarityFloat 1.9s ease-in-out infinite}
      .collection-display-slot img.display-stone{width:86px;height:86px;object-fit:contain;animation:collectionStoneFloat 3.2s ease-in-out infinite}
      .collection-display-slot img.display-soul{width:78px;height:78px;object-fit:contain;animation:collectionSoulFloat 2.8s ease-in-out infinite}
      .collection-display-empty{font-size:12px;font-weight:1000;color:#dfe8ff}
      .collection-display-remove{position:absolute;right:4px;top:4px;width:24px;height:24px;border:0;border-radius:50%;background:linear-gradient(#ff8b8b,#d72424);color:#fff;font-weight:1000;box-shadow:0 2px 0 rgba(0,0,0,.35);z-index:9}
      .collection-select-bar{display:none;margin:0 0 10px;padding:10px;border-radius:16px;background:rgba(107,230,255,.12);border:2px solid rgba(107,230,255,.35);color:#dff8ff;font-size:13px;font-weight:1000;text-align:center}
      .collection-select-bar.show{display:block}
      .collection-select-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}
      .collection-tabs{display:flex;gap:8px;overflow:auto;padding-bottom:8px;margin-bottom:10px}
      .collection-tab{flex:0 0 auto;border:0;border-radius:999px;padding:9px 12px;font-size:12px;font-weight:1000;color:#1a1200;background:linear-gradient(#fff,#b7c1d5);box-shadow:0 3px 0 rgba(0,0,0,.3)}
      .collection-tab.active{background:linear-gradient(#ffe66b,#ff9f23)}
      .collection-page-nav{display:grid;grid-template-columns:1fr auto 1fr;gap:8px;align-items:center;margin:0 0 10px}
      .collection-page-text{font-size:12px;font-weight:1000;color:#dfe8ff;text-align:center}
      .collection-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
      .stone-card{position:relative;min-height:138px;border-radius:18px;padding:20px 6px 8px;background:rgba(255,255,255,.10);border:2px solid rgba(255,255,255,.22);text-align:center;overflow:visible}
      .stone-card.displayed{border-color:#ffe66b;box-shadow:0 0 14px rgba(255,230,107,.38)}
      .stone-card.soul.displayed{border-color:#ff9df0;box-shadow:0 0 14px rgba(255,157,240,.38)}
      .stone-card.selectable{border-color:#6be6ff;box-shadow:0 0 12px rgba(107,230,255,.42)}
      .stone-card.locked{filter:grayscale(1);opacity:.62}
      .stone-img-wrap{height:66px;display:flex;align-items:center;justify-content:center;border-radius:14px;background:rgba(0,0,0,.22);margin-bottom:6px}
      .stone-img{width:64px;height:64px;object-fit:contain;animation:collectionStoneFloat 3.2s ease-in-out infinite}
      .soul-img{width:60px;height:60px;object-fit:contain;animation:collectionSoulFloat 2.8s ease-in-out infinite}
      @keyframes collectionStoneFloat{0%{transform:translateY(0)}50%{transform:translateY(-5px)}100%{transform:translateY(0)}}
      @keyframes collectionSoulFloat{0%{transform:translateY(0) scale(1)}50%{transform:translateY(-6px) scale(1.05)}100%{transform:translateY(0) scale(1)}}
      .stone-lock{width:46px;height:46px;border-radius:14px;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;color:#fff;font-size:24px;font-weight:1000}
      .stone-no{font-size:10px;color:#9deeff;font-weight:1000}
      .stone-name{font-size:10px;color:#fff;font-weight:1000;line-height:1.2;min-height:26px}
      .stone-rarity-img{position:absolute;left:4px;top:-13px;width:58px;height:31px;object-fit:contain;z-index:8;filter:drop-shadow(0 4px 0 rgba(0,0,0,.55));animation:collectionRarityFloat 1.9s ease-in-out infinite}
      @keyframes collectionRarityFloat{0%{transform:translateY(0)}50%{transform:translateY(-7px)}100%{transform:translateY(0)}}
      .stone-plus{position:absolute;top:6px;right:6px;padding:2px 6px;border-radius:999px;font-size:10px;font-weight:1000;color:#181000;background:linear-gradient(#fff,#ffe66b);z-index:7}
      .stone-effect{margin-top:4px;font-size:9px;color:#dfe8ff;font-weight:800;line-height:1.2}
      .stone-display-mark{margin-top:5px;display:inline-block;padding:3px 6px;border-radius:999px;background:rgba(255,230,107,.22);border:1px solid rgba(255,230,107,.55);color:#ffe66b;font-size:9px;font-weight:1000}
      .stone-card.soul .stone-display-mark{background:rgba(255,157,240,.18);border-color:rgba(255,157,240,.55);color:#ff9df0}
      .rarity-frame-r{border-color:rgba(255,255,255,.24)}
      .rarity-frame-sr{border-color:#58dfff;box-shadow:0 0 8px #58dfff,inset 0 0 8px rgba(88,223,255,.45)}
      .rarity-frame-ssr{border-color:#ffd83d;box-shadow:0 0 12px #ffd83d,0 0 22px rgba(255,216,61,.78),0 0 34px rgba(255,80,230,.28),inset 0 0 12px rgba(255,216,61,.48);animation:collectionSsrGlow 2s ease-in-out infinite}
      @keyframes collectionSsrGlow{0%{filter:hue-rotate(0deg) brightness(1)}50%{filter:hue-rotate(80deg) brightness(1.22)}100%{filter:hue-rotate(0deg) brightness(1)}}
      .rarity-frame-ur{border-color:#ff3cff;box-shadow:0 0 6px #000,0 0 18px #ff3cff,0 0 32px #6d00ff,inset 0 0 12px #ff3cff;animation:collectionUrFramePulse 1.9s ease-in-out infinite}
      .rarity-frame-ur:before{content:'';position:absolute;inset:4px;border-radius:14px;border:2px solid rgba(0,0,0,.86);box-shadow:inset 0 0 12px rgba(0,0,0,.9);pointer-events:none;z-index:1}
      .rarity-frame-ur:after{content:'';position:absolute;inset:-3px;border-radius:20px;border:2px solid rgba(255,60,255,.72);box-shadow:0 0 14px #ff3cff,0 0 26px #6d00ff;pointer-events:none;z-index:1;animation:collectionUrLine 2.4s linear infinite}
      @keyframes collectionUrFramePulse{0%{filter:brightness(1)}50%{filter:brightness(1.45)}100%{filter:brightness(1)}}
      @keyframes collectionUrLine{0%{filter:hue-rotate(0deg)}100%{filter:hue-rotate(360deg)}}
      .collection-preview{position:absolute;inset:0;z-index:142;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(0,0,0,.76)}
      .collection-preview.hidden{display:none}
      .collection-preview-card{position:relative;width:min(92vw,420px);border-radius:26px;padding:28px 16px 16px;background:linear-gradient(180deg,rgba(33,27,70,.98),rgba(5,8,22,.98));border:3px solid rgba(255,255,255,.38);text-align:center;box-shadow:0 18px 48px rgba(0,0,0,.7);overflow:visible}
      .collection-preview-card img.preview-main{width:78%;max-height:280px;object-fit:contain;margin:8px auto;position:relative;z-index:2;animation:collectionStoneFloat 3.2s ease-in-out infinite}
      .collection-preview-card.soul img.preview-main{animation:collectionSoulFloat 2.8s ease-in-out infinite}
      .collection-preview-card img.preview-rarity{position:absolute;left:12px;top:-28px;width:140px;height:76px;object-fit:contain;z-index:8;filter:drop-shadow(0 4px 0 rgba(0,0,0,.55));animation:collectionRarityFloat 1.9s ease-in-out infinite}
      .collection-preview-title{font-size:20px;font-weight:1000;color:#fff;text-shadow:0 3px 0 #000;position:relative;z-index:3}
      .collection-preview-desc{font-size:13px;font-weight:900;color:#dfe8ff;line-height:1.45;margin:8px 0 12px;position:relative;z-index:3}
      .collection-preview-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px;position:relative;z-index:3}
      @media (max-width:430px){
        .collection-grid{grid-template-columns:repeat(4,1fr);gap:6px}
        .stone-card{min-height:116px;padding:17px 4px 6px;border-radius:14px}
        .stone-img-wrap{height:52px}
        .stone-img,.soul-img{width:50px;height:50px}
        .stone-rarity-img{width:48px;height:26px;top:-10px}
        .stone-name{font-size:8px;min-height:22px}
        .stone-no,.stone-effect,.stone-display-mark{font-size:8px}
        .stone-plus{font-size:8px}
      }
    `;

    document.head.appendChild(style);
  }

  function ensureModal(){
    injectStyle();

    let modal = $('collectionModal');
    if (modal) return modal;

    modal = document.createElement('div');
    modal.id = 'collectionModal';
    modal.className = 'collection-modal hidden';
    modal.innerHTML = `
      <div class="collection-card">
        <div class="collection-head">
          <h2 id="collectionTitle">コレクション</h2>
          <button id="collectionCloseBtn" class="collection-close" type="button">閉じる</button>
        </div>
        <div id="collectionModeTabs" class="collection-mode-tabs"></div>
        <div id="collectionSummary" class="collection-summary"></div>
        <div id="collectionDisplay" class="collection-display"></div>
        <div id="collectionSelectBar" class="collection-select-bar"></div>
        <div id="collectionTabs" class="collection-tabs"></div>
        <div id="collectionPageNavTop" class="collection-page-nav"></div>
        <div id="collectionGrid" class="collection-grid"></div>
        <div id="collectionPageNavBottom" class="collection-page-nav" style="margin-top:10px;"></div>
      </div>
    `;

    ($('app') || document.body).appendChild(modal);

    $('collectionCloseBtn').addEventListener('click', close);

    modal.addEventListener('click', function(e){
      if (e.target === modal) close();
    });

    ensurePreview();

    return modal;
  }

  function ensurePreview(){
    let preview = $('collectionPreview');
    if (preview) return preview;

    preview = document.createElement('div');
    preview.id = 'collectionPreview';
    preview.className = 'collection-preview hidden';
    preview.innerHTML = `
      <div id="collectionPreviewCard" class="collection-preview-card">
        <div id="collectionPreviewRarity"></div>
        <img id="collectionPreviewImg" class="preview-main" alt="">
        <div id="collectionPreviewTitle" class="collection-preview-title"></div>
        <div id="collectionPreviewDesc" class="collection-preview-desc"></div>
        <div class="collection-preview-actions">
          <button id="collectionPreviewDisplay" class="collection-btn" type="button">飾る</button>
          <button id="collectionPreviewClose" class="collection-btn gray" type="button">閉じる</button>
        </div>
      </div>
    `;

    ($('app') || document.body).appendChild(preview);

    $('collectionPreviewClose').addEventListener('click', closePreview);

    preview.addEventListener('click', function(e){
      if (e.target === preview) closePreview();
    });

    return preview;
  }

  function openPreview(item){
    if (selectSlotIndex !== null) {
      setDisplaySlot(selectSlotIndex, item.no);
      return;
    }

    ensurePreview();

    const data = ownedData(item.no, currentMode) || {};
    const plus = Number(data.plus || 0);
    const max = rarityMax(item.rarity);
    const display = loadDisplayState()[displayKey(currentMode)] || [];
    const displayed = display.some(v => Number(v) === Number(item.no));

    const card = $('collectionPreviewCard');
    card.className = 'collection-preview-card ' + rarityClass(item.rarity) + (currentMode === 'soul' ? ' soul' : '');

    $('collectionPreviewRarity').innerHTML =
      `<img class="preview-rarity" src="${rarityImage(item.rarity)}" alt="${item.rarity}">`;

    $('collectionPreviewImg').src = item.image;
    $('collectionPreviewTitle').textContent =
      `No.${String(item.no).padStart(2, '0')} ${item.name}`;

    $('collectionPreviewDesc').textContent =
      `${currentMode === 'soul' ? 'MOB SOUL' : item.category} / ${itemEffectText(item)} / +${plus}/${max}`;

    const btn = $('collectionPreviewDisplay');
    btn.textContent = displayed ? '外す' : '飾る';

    btn.onclick = function(){
      setDisplayItem(item.no);
      closePreview();
    };

    $('collectionPreview').classList.remove('hidden');
  }

  function closePreview(){
    const preview = $('collectionPreview');
    if (preview) preview.classList.add('hidden');
  }

  function open(){
    ensureModal();
    render();
    $('collectionModal').classList.remove('hidden');
  }

  function close(){
    selectSlotIndex = null;
    const modal = $('collectionModal');
    if (modal) modal.classList.add('hidden');
  }

  function renderModeTabs(){
    const wrap = $('collectionModeTabs');
    if (!wrap) return;

    wrap.innerHTML = `
      <button id="collectionStoneModeBtn" class="collection-mode-btn ${currentMode === 'stone' ? 'active' : ''}" type="button">石板</button>
      <button id="collectionSoulModeBtn" class="collection-mode-btn ${currentMode === 'soul' ? 'active' : ''}" type="button">モブソウル</button>
    `;

    $('collectionStoneModeBtn').addEventListener('click', function(){
      currentMode = 'stone';
      currentCategory = 'all';
      currentPage = 1;
      selectSlotIndex = null;
      render();
    });

    $('collectionSoulModeBtn').addEventListener('click', function(){
      currentMode = 'soul';
      currentCategory = 'all';
      currentPage = 1;
      selectSlotIndex = null;
      render();
    });
  }

  function renderSummary(){
    const summary = $('collectionSummary');
    const title = $('collectionTitle');

    if (!summary) return;

    if (title) {
      title.textContent = currentMode === 'soul' ? 'モブソウルコレクション' : '石板コレクション';
    }

    if (currentMode === 'soul') {
      summary.innerHTML =
        `所持 ${ownedCount('soul')} / ${allSouls().length}　合計+${totalPlus('soul').toLocaleString()}<br>` +
        `効果: スキルCT短縮 -${secondsText(calcSoulCooldownBonus())} / 上限 -${secondsText(soulLimit())}` +
        `<div class="collection-rarity-row">
          ${['R','SR','SSR','UR'].map(rarity => `
            <div class="collection-rarity-pill">
              <img src="${rarityImage(rarity)}" alt="${rarity}">
              ${rarityOwnedCount(rarity, 'soul')}
            </div>
          `).join('')}
        </div>`;

      return;
    }

    const bonus = calcCollectionBonus();

    summary.innerHTML =
      `所持 ${ownedCount('stone')} / ${allStones().length}　合計+${totalPlus('stone').toLocaleString()}<br>` +
      `効果: SCORE +${percentText(bonus.score)} / ` +
      `COIN +${percentText(bonus.coin)} / ` +
      `LIFE +${Math.floor(bonus.hp)} / ` +
      `POWER +${Math.floor(bonus.power * 100) / 100} / ` +
      `RANGE +${percentText(bonus.range)}` +
      `<div class="collection-rarity-row">
        ${['R','SR','SSR','UR'].map(rarity => `
          <div class="collection-rarity-pill">
            <img src="${rarityImage(rarity)}" alt="${rarity}">
            ${rarityOwnedCount(rarity, 'stone')}
          </div>
        `).join('')}
      </div>`;
  }

  function renderDisplaySlots(){
    const wrap = $('collectionDisplay');
    if (!wrap) return;

    const key = displayKey(currentMode);
    const display = loadDisplayState()[key] || [];

    wrap.className = 'collection-display' + (currentMode === 'soul' ? ' soul' : '');

    wrap.innerHTML = `
      <div class="collection-display-title">${displayTitle()}</div>
      <div class="collection-display-help">${displayHelp()}</div>
      <div class="collection-display-slots">
        ${display.map((no, index) => {
          const active = selectSlotIndex === index ? ' active' : '';

          if (!no || !isOwned(no, currentMode)) {
            return `
              <div class="collection-display-slot${active}" data-slot="${index}">
                <span class="collection-display-empty">SLOT ${index + 1}</span>
              </div>
            `;
          }

          const list = currentMode === 'soul' ? allSouls() : allStones();
          const item = list.find(s => Number(s.no) === Number(no));

          if (!item) {
            return `
              <div class="collection-display-slot${active}" data-slot="${index}">
                <span class="collection-display-empty">SLOT ${index + 1}</span>
              </div>
            `;
          }

          return `
            <div class="collection-display-slot ${rarityClass(item.rarity)}${active}" data-slot="${index}">
              <button class="collection-display-remove" data-remove="${index}" type="button">×</button>
              <img class="display-rarity" src="${rarityImage(item.rarity)}" alt="${item.rarity}">
              <img class="${currentMode === 'soul' ? 'display-soul' : 'display-stone'}" src="${item.image}" alt="DISPLAY">
            </div>
          `;
        }).join('')}
      </div>
    `;

    wrap.querySelectorAll('.collection-display-slot').forEach(slot => {
      slot.addEventListener('click', function(e){
        if (e.target && e.target.closest && e.target.closest('.collection-display-remove')) return;
        selectSlotIndex = Number(this.getAttribute('data-slot'));
        render();
      });
    });

    wrap.querySelectorAll('.collection-display-remove').forEach(btn => {
      btn.addEventListener('click', function(e){
        e.preventDefault();
        e.stopPropagation();
        setDisplaySlot(Number(this.getAttribute('data-remove')), null);
      });
    });
  }

  function renderSelectBar(){
    const bar = $('collectionSelectBar');
    if (!bar) return;

    if (selectSlotIndex === null) {
      bar.className = 'collection-select-bar';
      bar.innerHTML = '';
      return;
    }

    bar.className = 'collection-select-bar show';
    bar.innerHTML = `
      SLOT ${selectSlotIndex + 1} に飾る${currentMode === 'soul' ? 'モブソウル' : '石板'}を選択中
      <div class="collection-select-actions">
        <button id="collectionSlotRemoveBtn" class="collection-btn" type="button">この枠を外す</button>
        <button id="collectionSlotCancelBtn" class="collection-btn gray" type="button">選択をやめる</button>
      </div>
    `;

    $('collectionSlotRemoveBtn').addEventListener('click', function(){
      setDisplaySlot(selectSlotIndex, null);
    });

    $('collectionSlotCancelBtn').addEventListener('click', function(){
      selectSlotIndex = null;
      render();
    });
  }

  function renderTabs(){
    const tabs = $('collectionTabs');
    if (!tabs) return;

    let list;

    if (currentMode === 'soul') {
      list = [
        { key:'all', name:'ALL' },
        { key:'R', name:'R' },
        { key:'SR', name:'SR' },
        { key:'SSR', name:'SSR' },
        { key:'UR', name:'UR' }
      ];
    } else {
      list = [
        { key:'all', name:'ALL' },
        { key:'R', name:'R' },
        { key:'SR', name:'SR' },
        { key:'SSR', name:'SSR' },
        { key:'UR', name:'UR' },
        ...CATEGORY_LIST
      ];
    }

    tabs.innerHTML = '';

    list.forEach(tab => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'collection-tab' + (currentCategory === tab.key ? ' active' : '');
      btn.textContent = tab.name;

      btn.addEventListener('click', function(){
        currentCategory = tab.key;
        currentPage = 1;
        render();
      });

      tabs.appendChild(btn);
    });
  }

  function filteredItems(){
    return currentItems().filter(item => {
      if (currentCategory === 'all') return true;
      if (['R','SR','SSR','UR'].includes(currentCategory)) return item.rarity === currentCategory;
      if (currentMode === 'soul') return true;
      return categoryKey(item) === currentCategory;
    });
  }

  function maxPage(){
    return Math.max(1, Math.ceil(filteredItems().length / 20));
  }

  function pageItems(){
    const list = filteredItems();
    const max = maxPage();

    currentPage = Math.max(1, Math.min(max, currentPage));

    return list.slice((currentPage - 1) * 20, currentPage * 20);
  }

  function renderPageNav(id){
    const nav = $(id);
    if (!nav) return;

    const max = maxPage();

    nav.innerHTML = `
      <button class="collection-btn gray" type="button" data-page-prev="1" ${currentPage <= 1 ? 'disabled' : ''}>前へ</button>
      <div class="collection-page-text">${currentPage} / ${max}</div>
      <button class="collection-btn gray" type="button" data-page-next="1" ${currentPage >= max ? 'disabled' : ''}>次へ</button>
    `;

    const prev = nav.querySelector('[data-page-prev]');
    const next = nav.querySelector('[data-page-next]');

    if (prev) {
      prev.addEventListener('click', function(){
        currentPage = Math.max(1, currentPage - 1);
        render();
      });
    }

    if (next) {
      next.addEventListener('click', function(){
        currentPage = Math.min(maxPage(), currentPage + 1);
        render();
      });
    }
  }

  function render(){
    ensureModal();

    renderModeTabs();
    renderSummary();
    renderDisplaySlots();
    renderSelectBar();
    renderTabs();
    renderPageNav('collectionPageNavTop');

    const grid = $('collectionGrid');
    if (!grid) return;

    const display = loadDisplayState()[displayKey(currentMode)] || [];

    grid.innerHTML = '';

    pageItems().forEach(item => {
      grid.appendChild(renderItemCard(item, display));
    });

    renderPageNav('collectionPageNavBottom');
  }

  function renderItemCard(item, display){
    const data = ownedData(item.no, currentMode);
    const owned = !!(data && data.owned);
    const plus = owned ? Number(data.plus || 0) : 0;
    const max = rarityMax(item.rarity);
    const displayed = display.some(v => Number(v) === Number(item.no));

    const card = document.createElement('div');

    card.className =
      'stone-card ' +
      rarityClass(item.rarity) +
      (currentMode === 'soul' ? ' soul' : '') +
      (owned ? '' : ' locked') +
      (displayed ? ' displayed' : '') +
      (selectSlotIndex !== null && owned ? ' selectable' : '');

    card.innerHTML = `
      <img class="stone-rarity-img" src="${rarityImage(item.rarity)}" alt="${item.rarity}">
      <div class="stone-plus">${owned ? `+${plus}/${max}` : 'LOCK'}</div>
      <div class="stone-img-wrap">
        ${
          owned
            ? `<img class="${currentMode === 'soul' ? 'soul-img' : 'stone-img'}" src="${item.image}" alt="${item.name}" onerror="this.style.display='none'">`
            : `<div class="stone-lock">?</div>`
        }
      </div>
      <div class="stone-no">No.${String(item.no).padStart(2, '0')}</div>
      <div class="stone-name">${owned ? item.name : '未所持'}</div>
      <div class="stone-effect">${itemEffectText(item)}</div>
      ${owned ? `<div class="stone-display-mark">${selectSlotIndex !== null ? 'この枠に入替' : displayed ? '展示中' : 'タップで拡大'}</div>` : ''}
    `;

    if (owned) {
      card.addEventListener('click', function(){
        openPreview(item);
      });
    }

    return card;
  }

  function bind(){
    const collectionBtn =
      $('openCollectionBtn') ||
      ($('collectionImg') && $('collectionImg').closest('button'));

    if (collectionBtn && !collectionBtn.__mobCollectionBound) {
      collectionBtn.__mobCollectionBound = true;
      collectionBtn.classList.remove('disabled-btn');
      collectionBtn.disabled = false;

      collectionBtn.addEventListener('click', function(e){
        e.preventDefault();
        e.stopPropagation();
        open();
      });

      collectionBtn.addEventListener('pointerup', function(e){
        e.preventDefault();
        e.stopPropagation();
        open();
      }, { passive:false });
    }
  }

  function init(){
    ensureModal();
    bind();
  }

  document.addEventListener('DOMContentLoaded', init);
  window.addEventListener('mobshot:gachaUpdated', render);
  window.addEventListener('mobshot:soulUpdated', render);

  init();

  window.MobShotCollection = {
    open,
    close,
    render,

    allStones,
    allSouls,

    loadGachaState,
    loadDisplayState,
    saveDisplayState,

    getDisplayStones,
    getDisplaySouls,
    getDisplayItems,

    setDisplayStone:function(no){
      currentMode = 'stone';
      setDisplayItem(no);
    },
    setDisplaySoul:function(no){
      currentMode = 'soul';
      setDisplayItem(no);
    },
    setDisplayItem,
    setDisplaySlot,

    calcCollectionBonus,
    calcSoulCooldownBonus,

    rarityImage,
    rarityClass,
    rarityMax,

    COLLECTION_SAVE_KEY,
    SOUL_CT,
    SOUL_CT_LIMIT_SEC
  };
})();
