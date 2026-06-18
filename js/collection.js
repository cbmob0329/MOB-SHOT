'use strict';

(function(){
  const GACHA_SAVE_KEY = 'mobshot_gacha_state_v1';
  const COLLECTION_SAVE_KEY = 'mobshot_collection_display_v1';

  const RARITY = {
    R:   { max:99, image:'mt/R.png' },
    SR:  { max:50, image:'mt/SR.png' },
    SSR: { max:30, image:'mt/SSR.png' },
    UR:  { max:10, image:'mt/UR.png' }
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

  let currentCategory = 'all';
  let currentPage = 1;
  let selectSlotIndex = null;

  function $(id){ return document.getElementById(id); }

  function allStones(){
    if (window.MobShotGacha && window.MobShotGacha.allStones) {
      return window.MobShotGacha.allStones();
    }

    return [];
  }

  function rarityImage(rarity){
    return RARITY[rarity] ? RARITY[rarity].image : RARITY.R.image;
  }

  function rarityMax(rarity){
    return RARITY[rarity] ? RARITY[rarity].max : 99;
  }

  function rarityClass(rarity){
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
    return {
      stones:{},
      skills:{}
    };
  }

  function loadGachaState(){
    if (window.MobShotGacha && window.MobShotGacha.loadState) {
      return window.MobShotGacha.loadState();
    }

    let state = defaultGachaState();

    try {
      const raw = localStorage.getItem(GACHA_SAVE_KEY);

      if (raw) {
        const parsed = JSON.parse(raw);
        state = Object.assign(state, parsed || {});
        state.stones = Object.assign({}, parsed.stones || {});
        state.skills = Object.assign({}, parsed.skills || {});
      }
    } catch(e) {}

    return state;
  }

  function defaultDisplayState(){
    return {
      display:[null, null, null]
    };
  }

  function loadDisplayState(){
    let state = defaultDisplayState();

    try {
      const raw = localStorage.getItem(COLLECTION_SAVE_KEY);

      if (raw) {
        const parsed = JSON.parse(raw);
        state = Object.assign(state, parsed || {});
      }
    } catch(e) {}

    state.display = Array.isArray(state.display)
      ? state.display.slice(0, 3)
      : [null, null, null];

    while (state.display.length < 3) {
      state.display.push(null);
    }

    state.display = state.display.map(no => {
      const n = Number(no || 0);
      return n >= 1 && n <= 107 ? n : null;
    });

    return state;
  }

  function saveDisplayState(state){
    try {
      localStorage.setItem(COLLECTION_SAVE_KEY, JSON.stringify(state || defaultDisplayState()));
    } catch(e) {}

    window.dispatchEvent(new CustomEvent('mobshot:collectionDisplayUpdated'));
    window.dispatchEvent(new CustomEvent('mobshot:saveUpdated'));
  }

  function ownedData(no){
    const state = loadGachaState();
    return state.stones[String(no)] || null;
  }

  function isOwned(no){
    const data = ownedData(no);
    return !!(data && data.owned);
  }

  function ownedCount(){
    let count = 0;

    allStones().forEach(stone => {
      if (isOwned(stone.no)) count++;
    });

    return count;
  }

  function totalPlus(){
    const state = loadGachaState();
    let total = 0;

    Object.keys(state.stones || {}).forEach(key => {
      total += Number(state.stones[key].plus || 0);
    });

    return total;
  }

  function rarityOwnedCount(rarity){
    let count = 0;

    allStones().forEach(stone => {
      if (stone.rarity === rarity && isOwned(stone.no)) count++;
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

    allStones().forEach(stone => {
      const data = state.stones[String(stone.no)];

      if (!data || !data.owned) return;

      const plus = Number(data.plus || 0);
      const key = categoryKey(stone);

      if (key === 'enemy') {
        bonus.score += plus * 0.001;
      }

      if (key === 'mid') {
        bonus.coin += plus * 0.001;
      }

      if (key === 'boss') {
        bonus.hp += plus;
      }

      if (key === 'artist') {
        bonus.score += plus * 0.0007;
        bonus.coin += plus * 0.0007;
      }

      if (key === 'sp') {
        bonus.power += plus * 0.01;
      }

      if (key === 'pet') {
        bonus.range += plus * 0.001;
      }

      if (key === 'event') {
        if (stone.rarity === 'UR') {
          bonus.power += plus * 0.05;
          bonus.range += plus * 0.0005;
        } else {
          bonus.hp += plus * 5;
        }
      }
    });

    return bonus;
  }

  function getDisplayStones(){
    const display = loadDisplayState().display;

    return display
      .filter(no => no && isOwned(no))
      .map(no => {
        const stone = allStones().find(s => Number(s.no) === Number(no));
        const data = ownedData(no) || {};

        if (!stone) return null;

        return Object.assign({}, stone, {
          rarity:stone.rarity,
          plus:Number(data.plus || 0),
          max:rarityMax(stone.rarity)
        });
      })
      .filter(Boolean);
  }

  function setDisplaySlot(slotIndex, no){
    const state = loadDisplayState();

    slotIndex = Number(slotIndex);

    if (slotIndex < 0 || slotIndex > 2) return;

    if (!no) {
      state.display[slotIndex] = null;
      saveDisplayState(state);
      selectSlotIndex = null;
      render();
      return;
    }

    if (!isOwned(no)) return;

    state.display = state.display.map(v =>
      Number(v) === Number(no) ? null : v
    );

    state.display[slotIndex] = Number(no);

    saveDisplayState(state);
    selectSlotIndex = null;
    render();
  }

  function setDisplayStone(no){
    if (!isOwned(no)) return;

    const state = loadDisplayState();
    const currentIndex = state.display.findIndex(v => Number(v) === Number(no));

    if (currentIndex >= 0) {
      state.display[currentIndex] = null;
      saveDisplayState(state);
      render();
      return;
    }

    const emptyIndex = state.display.findIndex(v => !v);

    if (emptyIndex >= 0) {
      state.display[emptyIndex] = Number(no);
    } else {
      state.display[0] = Number(no);
    }

    saveDisplayState(state);
    render();
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

      .collection-summary{margin:0 0 10px;padding:10px 12px;border-radius:16px;background:rgba(255,255,255,.10);border:2px solid rgba(255,255,255,.20);color:#dfe8ff;font-size:13px;font-weight:900;line-height:1.5}
      .collection-rarity-row{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:8px}
      .collection-rarity-pill{border-radius:12px;background:rgba(0,0,0,.24);padding:5px 4px;text-align:center;font-size:10px;color:#fff;font-weight:1000}
      .collection-rarity-pill img{height:22px;max-width:48px;object-fit:contain;display:block;margin:0 auto 2px}

      .collection-display{margin:0 0 10px;padding:10px;border-radius:18px;background:rgba(255,230,107,.10);border:2px solid rgba(255,230,107,.35)}
      .collection-display-title{font-size:13px;font-weight:1000;color:#ffe66b;margin-bottom:8px;text-shadow:0 2px 0 #000}
      .collection-display-help{font-size:11px;font-weight:900;color:#dfe8ff;margin-bottom:8px;line-height:1.45}
      .collection-display-slots{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
      .collection-display-slot{min-height:106px;border-radius:16px;background:rgba(0,0,0,.24);border:2px dashed rgba(255,255,255,.25);display:flex;align-items:center;justify-content:center;position:relative;overflow:visible}
      .collection-display-slot.active{border-color:#ffe66b;box-shadow:0 0 14px rgba(255,230,107,.55)}
      .collection-display-slot img.display-rarity{position:absolute;left:4px;top:-10px;width:54px;height:28px;object-fit:contain;z-index:6;filter:drop-shadow(0 3px 0 rgba(0,0,0,.55));animation:collectionRarityFloat 1.9s ease-in-out infinite}
      .collection-display-slot img.display-stone{width:86px;height:86px;object-fit:contain;animation:collectionStoneFloat 3.2s ease-in-out infinite}
      .collection-display-slot:nth-child(2) img.display-stone{animation-delay:-1s}
      .collection-display-slot:nth-child(3) img.display-stone{animation-delay:-2s}
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
      .stone-card.selectable{border-color:#6be6ff;box-shadow:0 0 12px rgba(107,230,255,.42)}
      .stone-card.locked{filter:grayscale(1);opacity:.62}
      .stone-img-wrap{height:66px;display:flex;align-items:center;justify-content:center;border-radius:14px;background:rgba(0,0,0,.22);margin-bottom:6px}
      .stone-img{width:64px;height:64px;object-fit:contain;animation:collectionStoneFloat 3.2s ease-in-out infinite}
      @keyframes collectionStoneFloat{0%{transform:translateY(0)}50%{transform:translateY(-5px)}100%{transform:translateY(0)}}
      .stone-lock{width:46px;height:46px;border-radius:14px;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;color:#fff;font-size:24px;font-weight:1000}
      .stone-no{font-size:10px;color:#9deeff;font-weight:1000}
      .stone-name{font-size:10px;color:#fff;font-weight:1000;line-height:1.2;min-height:26px}
      .stone-rarity-img{position:absolute;left:4px;top:-13px;width:58px;height:31px;object-fit:contain;z-index:8;filter:drop-shadow(0 4px 0 rgba(0,0,0,.55));animation:collectionRarityFloat 1.9s ease-in-out infinite}
      @keyframes collectionRarityFloat{0%{transform:translateY(0)}50%{transform:translateY(-7px)}100%{transform:translateY(0)}}
      .stone-plus{position:absolute;top:6px;right:6px;padding:2px 6px;border-radius:999px;font-size:10px;font-weight:1000;color:#181000;background:linear-gradient(#fff,#ffe66b);z-index:7}
      .stone-effect{margin-top:4px;font-size:9px;color:#dfe8ff;font-weight:800;line-height:1.2}
      .stone-display-mark{margin-top:5px;display:inline-block;padding:3px 6px;border-radius:999px;background:rgba(255,230,107,.22);border:1px solid rgba(255,230,107,.55);color:#ffe66b;font-size:9px;font-weight:1000}

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
      .collection-preview-card img.preview-rarity{position:absolute;left:12px;top:-28px;width:140px;height:76px;object-fit:contain;z-index:8;filter:drop-shadow(0 4px 0 rgba(0,0,0,.55));animation:collectionRarityFloat 1.9s ease-in-out infinite}
      .collection-preview-title{font-size:20px;font-weight:1000;color:#fff;text-shadow:0 3px 0 #000;position:relative;z-index:3}
      .collection-preview-desc{font-size:13px;font-weight:900;color:#dfe8ff;line-height:1.45;margin:8px 0 12px;position:relative;z-index:3}
      .collection-preview-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px;position:relative;z-index:3}

      @media (max-width:430px){
        .collection-grid{grid-template-columns:repeat(4,1fr);gap:6px}
        .stone-card{min-height:116px;padding:17px 4px 6px;border-radius:14px}
        .stone-img-wrap{height:52px}
        .stone-img{width:50px;height:50px}
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
          <h2>石板コレクション</h2>
          <button id="collectionCloseBtn" class="collection-close" type="button">閉じる</button>
        </div>
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

  function openPreview(stone){
    if (selectSlotIndex !== null) {
      setDisplaySlot(selectSlotIndex, stone.no);
      return;
    }

    ensurePreview();

    const data = ownedData(stone.no) || {};
    const plus = Number(data.plus || 0);
    const max = rarityMax(stone.rarity);
    const displayed = loadDisplayState().display.some(v => Number(v) === Number(stone.no));

    const card = $('collectionPreviewCard');
    card.className = 'collection-preview-card ' + rarityClass(stone.rarity);

    $('collectionPreviewRarity').innerHTML =
      `<img class="preview-rarity" src="${rarityImage(stone.rarity)}" alt="${stone.rarity}">`;

    $('collectionPreviewImg').src = stone.image;
    $('collectionPreviewTitle').textContent = `No.${String(stone.no).padStart(2, '0')} ${stone.name}`;
    $('collectionPreviewDesc').textContent =
      `${stone.category} / ${stone.effect} / +${plus}/${max}`;

    const btn = $('collectionPreviewDisplay');
    btn.textContent = displayed ? '外す' : '飾る';
    btn.onclick = function(){
      setDisplayStone(stone.no);
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

  function renderSummary(){
    const summary = $('collectionSummary');
    if (!summary) return;

    const bonus = calcCollectionBonus();

    summary.innerHTML =
      `所持 ${ownedCount()} / ${allStones().length}　合計+${totalPlus().toLocaleString()}<br>` +
      `効果: SCORE +${Math.floor(bonus.score * 1000) / 10}% / ` +
      `COIN +${Math.floor(bonus.coin * 1000) / 10}% / ` +
      `LIFE +${Math.floor(bonus.hp)} / ` +
      `POWER +${Math.floor(bonus.power * 100) / 100} / ` +
      `RANGE +${Math.floor(bonus.range * 1000) / 10}%` +
      `<div class="collection-rarity-row">
        ${['R','SR','SSR','UR'].map(rarity => `
          <div class="collection-rarity-pill">
            <img src="${rarityImage(rarity)}" alt="${rarity}">
            ${rarityOwnedCount(rarity)}
          </div>
        `).join('')}
      </div>`;
  }

  function renderDisplaySlots(){
    const wrap = $('collectionDisplay');
    if (!wrap) return;

    const display = loadDisplayState().display;

    wrap.innerHTML = `
      <div class="collection-display-title">メインに飾る石板 3枚</div>
      <div class="collection-display-help">枠をタップ → 下の石板を選ぶと入れ替え。×で外せます。</div>
      <div class="collection-display-slots">
        ${display.map((no, index) => {
          const active = selectSlotIndex === index ? ' active' : '';

          if (!no || !isOwned(no)) {
            return `
              <div class="collection-display-slot${active}" data-slot="${index}">
                <span class="collection-display-empty">SLOT ${index + 1}</span>
              </div>
            `;
          }

          const stone = allStones().find(s => Number(s.no) === Number(no));

          if (!stone) {
            return `
              <div class="collection-display-slot${active}" data-slot="${index}">
                <span class="collection-display-empty">SLOT ${index + 1}</span>
              </div>
            `;
          }

          return `
            <div class="collection-display-slot ${rarityClass(stone.rarity)}${active}" data-slot="${index}">
              <button class="collection-display-remove" data-remove="${index}" type="button">×</button>
              <img class="display-rarity" src="${rarityImage(stone.rarity)}" alt="${stone.rarity}">
              <img class="display-stone" src="${stone.image}" alt="DISPLAY">
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
      SLOT ${selectSlotIndex + 1} に飾る石板を選択中
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

    const list = [
      { key:'all', name:'ALL' },
      { key:'R', name:'R' },
      { key:'SR', name:'SR' },
      { key:'SSR', name:'SSR' },
      { key:'UR', name:'UR' },
      ...CATEGORY_LIST
    ];

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

  function filteredStones(){
    return allStones().filter(stone => {
      if (currentCategory === 'all') return true;
      if (['R','SR','SSR','UR'].includes(currentCategory)) return stone.rarity === currentCategory;
      return categoryKey(stone) === currentCategory;
    });
  }

  function maxPage(){
    return Math.max(1, Math.ceil(filteredStones().length / 20));
  }

  function pageStones(){
    const list = filteredStones();
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

    renderSummary();
    renderDisplaySlots();
    renderSelectBar();
    renderTabs();
    renderPageNav('collectionPageNavTop');

    const grid = $('collectionGrid');
    if (!grid) return;

    const display = loadDisplayState().display;

    grid.innerHTML = '';

    pageStones().forEach(stone => {
      grid.appendChild(renderStoneCard(stone, display));
    });

    renderPageNav('collectionPageNavBottom');
  }

  function renderStoneCard(stone, display){
    const data = ownedData(stone.no);
    const owned = !!(data && data.owned);
    const plus = owned ? Number(data.plus || 0) : 0;
    const max = rarityMax(stone.rarity);
    const displayed = display.some(v => Number(v) === Number(stone.no));

    const card = document.createElement('div');

    card.className =
      'stone-card ' +
      rarityClass(stone.rarity) +
      (owned ? '' : ' locked') +
      (displayed ? ' displayed' : '') +
      (selectSlotIndex !== null && owned ? ' selectable' : '');

    card.innerHTML = `
      <img class="stone-rarity-img" src="${rarityImage(stone.rarity)}" alt="${stone.rarity}">
      <div class="stone-plus">${owned ? `+${plus}/${max}` : 'LOCK'}</div>
      <div class="stone-img-wrap">
        ${
          owned
            ? `<img class="stone-img" src="${stone.image}" alt="${stone.name}" onerror="this.style.display='none'">`
            : `<div class="stone-lock">?</div>`
        }
      </div>
      <div class="stone-no">No.${String(stone.no).padStart(2, '0')}</div>
      <div class="stone-name">${owned ? stone.name : '未所持'}</div>
      <div class="stone-effect">${stone.effect || ''}</div>
      ${owned ? `<div class="stone-display-mark">${selectSlotIndex !== null ? 'この石板に入替' : displayed ? '展示中' : 'タップで拡大'}</div>` : ''}
    `;

    if (owned) {
      card.addEventListener('click', function(){
        openPreview(stone);
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

  init();

  window.MobShotCollection = {
    open,
    close,
    render,
    allStones,
    loadGachaState,
    loadDisplayState,
    saveDisplayState,
    getDisplayStones,
    setDisplayStone,
    setDisplaySlot,
    calcCollectionBonus,
    rarityImage,
    rarityClass,
    rarityMax,
    COLLECTION_SAVE_KEY
  };
})();
