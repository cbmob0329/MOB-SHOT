'use strict';

(function(){
  const GACHA_SAVE_KEY = 'mobshot_gacha_state_v1';

  const CATEGORY_LIST = [
    { key:'enemy', name:'MOB SHOT ENEMY', from:1, to:30, effect:'スコア増加' },
    { key:'mid', name:'MOB SHOT MID BOSS', from:31, to:50, effect:'コイン増加' },
    { key:'boss', name:'MOB SHOT BOSS', from:51, to:70, effect:'ライフ増加' },
    { key:'artist', name:'MOB ARTIST', from:71, to:77, effect:'コイン＆スコア増加' },
    { key:'sp', name:'MOB SHOT BOSS SP', from:78, to:85, effect:'パワー増加' }
  ];

  const RARITY_MAX = {
    R:99,
    SR:50,
    SSR:30,
    UR:10
  };

  let currentCategory = 'all';

  function $(id){ return document.getElementById(id); }

  function injectStyle(){
    if ($('mobCollectionStyle')) return;

    const style = document.createElement('style');
    style.id = 'mobCollectionStyle';
    style.textContent = `
      .collection-modal{
        position:absolute;
        inset:0;
        z-index:94;
        display:flex;
        align-items:center;
        justify-content:center;
        padding:14px;
        background:rgba(0,0,0,.68);
      }

      .collection-modal.hidden{
        display:none;
      }

      .collection-card{
        width:min(96vw,560px);
        max-height:88vh;
        overflow:auto;
        border-radius:26px;
        padding:14px;
        background:linear-gradient(180deg,rgba(27,24,62,.98),rgba(5,8,22,.98));
        border:3px solid rgba(255,255,255,.35);
        box-shadow:0 18px 48px rgba(0,0,0,.62);
      }

      .collection-head{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:10px;
        margin-bottom:10px;
      }

      .collection-head h2{
        margin:0;
        font-size:24px;
        font-weight:1000;
        color:#fff;
        text-shadow:0 3px 0 #000;
      }

      .collection-close{
        border:0;
        border-radius:999px;
        padding:9px 14px;
        font-weight:1000;
        background:linear-gradient(#ffe66b,#ffb423);
        color:#1b1200;
        box-shadow:0 4px 0 rgba(0,0,0,.35);
      }

      .collection-summary{
        margin:0 0 10px;
        padding:10px 12px;
        border-radius:16px;
        background:rgba(255,255,255,.10);
        border:2px solid rgba(255,255,255,.20);
        color:#dfe8ff;
        font-size:13px;
        font-weight:900;
        line-height:1.5;
      }

      .collection-tabs{
        display:flex;
        gap:8px;
        overflow:auto;
        padding-bottom:8px;
        margin-bottom:10px;
      }

      .collection-tab{
        flex:0 0 auto;
        border:0;
        border-radius:999px;
        padding:9px 12px;
        font-size:12px;
        font-weight:1000;
        color:#1a1200;
        background:linear-gradient(#fff,#b7c1d5);
        box-shadow:0 3px 0 rgba(0,0,0,.3);
      }

      .collection-tab.active{
        background:linear-gradient(#ffe66b,#ff9f23);
      }

      .collection-grid{
        display:grid;
        grid-template-columns:repeat(3,1fr);
        gap:10px;
      }

      .stone-card{
        position:relative;
        min-height:132px;
        border-radius:18px;
        padding:8px;
        background:rgba(255,255,255,.10);
        border:2px solid rgba(255,255,255,.22);
        text-align:center;
        overflow:hidden;
      }

      .stone-card.locked{
        filter:grayscale(1);
        opacity:.62;
      }

      .stone-img-wrap{
        height:68px;
        display:flex;
        align-items:center;
        justify-content:center;
        border-radius:14px;
        background:rgba(0,0,0,.22);
        margin-bottom:6px;
      }

      .stone-img{
        width:64px;
        height:64px;
        object-fit:contain;
      }

      .stone-lock{
        width:48px;
        height:48px;
        border-radius:14px;
        background:rgba(0,0,0,.55);
        display:flex;
        align-items:center;
        justify-content:center;
        color:#fff;
        font-size:24px;
        font-weight:1000;
      }

      .stone-no{
        font-size:11px;
        color:#9deeff;
        font-weight:1000;
      }

      .stone-name{
        font-size:11px;
        color:#fff;
        font-weight:1000;
        line-height:1.25;
        min-height:28px;
      }

      .stone-rarity{
        position:absolute;
        top:6px;
        left:6px;
        min-width:34px;
        padding:2px 6px;
        border-radius:999px;
        font-size:11px;
        font-weight:1000;
        color:#fff;
        text-shadow:0 2px 0 #000;
        background:rgba(0,0,0,.5);
      }

      .stone-plus{
        position:absolute;
        top:6px;
        right:6px;
        padding:2px 7px;
        border-radius:999px;
        font-size:11px;
        font-weight:1000;
        color:#181000;
        background:linear-gradient(#fff,#ffe66b);
      }

      .stone-effect{
        margin-top:4px;
        font-size:10px;
        color:#dfe8ff;
        font-weight:800;
      }

      .rarity-R{color:#dfe8ff}
      .rarity-SR{color:#6be6ff}
      .rarity-SSR{color:#ffe66b}
      .rarity-UR{color:#ff6bff}

      @media (max-width:380px){
        .collection-grid{
          grid-template-columns:repeat(2,1fr);
        }
      }
    `;
    document.head.appendChild(style);
  }

  function categoryOf(no){
    return CATEGORY_LIST.find(c => no >= c.from && no <= c.to) || CATEGORY_LIST[0];
  }

  function allStones(){
    const list = [];

    for (let no = 1; no <= 85; no++) {
      const cat = categoryOf(no);

      list.push({
        no,
        key:cat.key,
        category:cat.name,
        effect:cat.effect,
        name:`石板 No.${String(no).padStart(2, '0')}`,
        image:`cards/card${no}.png`
      });
    }

    return list;
  }

  function defaultState(){
    return {
      stones:{},
      skills:{}
    };
  }

  function loadGachaState(){
    if (window.MobShotGacha && window.MobShotGacha.loadState) {
      return window.MobShotGacha.loadState();
    }

    let state = defaultState();

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

  function ownedData(no){
    const state = loadGachaState();
    return state.stones[String(no)] || null;
  }

  function ownedCount(){
    const state = loadGachaState();
    let count = 0;

    for (let no = 1; no <= 85; no++) {
      const data = state.stones[String(no)];
      if (data && data.owned) count++;
    }

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

  function calcCollectionBonus(){
    const state = loadGachaState();

    const bonus = {
      score:0,
      coin:0,
      hp:0,
      power:0
    };

    Object.keys(state.stones || {}).forEach(key => {
      const no = Number(key);
      const data = state.stones[key];

      if (!data || !data.owned) return;

      const plus = Number(data.plus || 0);
      const cat = categoryOf(no);

      if (cat.key === 'enemy') bonus.score += plus * 0.001;
      if (cat.key === 'mid') bonus.coin += plus * 0.001;
      if (cat.key === 'boss') bonus.hp += plus;
      if (cat.key === 'artist') {
        bonus.score += plus * 0.0007;
        bonus.coin += plus * 0.0007;
      }
      if (cat.key === 'sp') bonus.power += plus * 0.01;
    });

    return bonus;
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
        <div id="collectionTabs" class="collection-tabs"></div>
        <div id="collectionGrid" class="collection-grid"></div>
      </div>
    `;

    ($('app') || document.body).appendChild(modal);

    $('collectionCloseBtn').addEventListener('click', close);

    modal.addEventListener('click', function(e){
      if (e.target === modal) close();
    });

    return modal;
  }

  function open(){
    ensureModal();
    render();
    $('collectionModal').classList.remove('hidden');
  }

  function close(){
    const modal = $('collectionModal');
    if (modal) modal.classList.add('hidden');
  }

  function renderTabs(){
    const tabs = $('collectionTabs');
    if (!tabs) return;

    const list = [
      { key:'all', name:'ALL' },
      ...CATEGORY_LIST
    ];

    tabs.innerHTML = '';

    list.forEach(cat => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'collection-tab' + (currentCategory === cat.key ? ' active' : '');
      btn.textContent = cat.name;

      btn.addEventListener('click', function(){
        currentCategory = cat.key;
        render();
      });

      tabs.appendChild(btn);
    });
  }

  function renderSummary(){
    const summary = $('collectionSummary');
    if (!summary) return;

    const bonus = calcCollectionBonus();

    summary.innerHTML =
      `所持 ${ownedCount()} / 85　合計+${totalPlus().toLocaleString()}<br>` +
      `効果: SCORE +${Math.floor(bonus.score * 1000) / 10}% / ` +
      `COIN +${Math.floor(bonus.coin * 1000) / 10}% / ` +
      `LIFE +${Math.floor(bonus.hp)} / ` +
      `POWER +${Math.floor(bonus.power * 100) / 100}`;
  }

  function render(){
    ensureModal();

    renderTabs();
    renderSummary();

    const grid = $('collectionGrid');
    if (!grid) return;

    grid.innerHTML = '';

    allStones()
      .filter(stone => currentCategory === 'all' || stone.key === currentCategory)
      .forEach(stone => {
        grid.appendChild(renderStoneCard(stone));
      });
  }

  function renderStoneCard(stone){
    const data = ownedData(stone.no);
    const owned = !!(data && data.owned);
    const rarity = owned ? data.rarity || 'R' : '?';
    const plus = owned ? Number(data.plus || 0) : 0;
    const max = RARITY_MAX[rarity] || 0;

    const card = document.createElement('div');
    card.className = 'stone-card' + (owned ? '' : ' locked');

    card.innerHTML = `
      <div class="stone-rarity rarity-${rarity}">${rarity}</div>
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
      <div class="stone-effect">${stone.effect}</div>
    `;

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
    calcCollectionBonus
  };
})();
