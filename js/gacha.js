'use strict';

(function(){
  const GACHA_SAVE_KEY = 'mobshot_gacha_state_v1';

  const RARITY = {
    R: { max:99, rate:68 },
    SR:{ max:50, rate:24 },
    SSR:{ max:30, rate:7 },
    UR:{ max:10, rate:1 }
  };

  const STONE_CATEGORIES = [
    { from:1, to:30, name:'MOB SHOT ENEMY', effect:'スコア増加' },
    { from:31, to:50, name:'MOB SHOT MID BOSS', effect:'コイン増加' },
    { from:51, to:70, name:'MOB SHOT BOSS', effect:'ライフ増加' },
    { from:71, to:77, name:'MOB ARTIST', effect:'コイン＆スコア増加' },
    { from:78, to:85, name:'MOB SHOT BOSS SP', effect:'パワー増加' }
  ];

  const GACHA_IMAGES = {
    top:'mt/gacha1.png',
    start:'mt/gacha2.png',
    shake:'mt/gacha3.png',
    open:'mt/gacha4.png'
  };

  function $(id){ return document.getElementById(id); }

  function getSave(){
    if (window.MobShotStorage && window.MobShotStorage.load) return window.MobShotStorage.load();

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
      localStorage.setItem('mobshot_split_v1', JSON.stringify(save));
    } catch(e) {}
  }

  function defaultState(){
    return {
      stones:{},
      skills:{}
    };
  }

  function loadState(){
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

  function saveState(state){
    try {
      localStorage.setItem(GACHA_SAVE_KEY, JSON.stringify(state || defaultState()));
    } catch(e) {}
  }

  function categoryOf(no){
    return STONE_CATEGORIES.find(c => no >= c.from && no <= c.to) || STONE_CATEGORIES[0];
  }

  function rarityMax(rarity){
    return RARITY[rarity] ? RARITY[rarity].max : 99;
  }

  function rollRarity(){
    const total = Object.values(RARITY).reduce((sum, r) => sum + r.rate, 0);
    let roll = Math.random() * total;

    for (const key of ['R','SR','SSR','UR']) {
      roll -= RARITY[key].rate;
      if (roll <= 0) return key;
    }

    return 'R';
  }

  function stoneImage(no){
    return `co/co${no}.png`;
  }

  function stoneName(no){
    return `石板 No.${String(no).padStart(2, '0')}`;
  }

  function allStones(){
    const list = [];

    for (let no = 1; no <= 85; no++) {
      const category = categoryOf(no);

      list.push({
        id:`stone_${no}`,
        no,
        name:stoneName(no),
        category:category.name,
        effect:category.effect,
        image:stoneImage(no)
      });
    }

    return list;
  }

  function rollStone(){
    const no = Math.floor(Math.random() * 85) + 1;
    const rarity = rollRarity();
    const base = allStones().find(s => s.no === no);

    return Object.assign({}, base, {
      type:'stone',
      rarity,
      maxPlus:rarityMax(rarity)
    });
  }

  function getSkillPool(){
    if (window.MobShotSkills && Array.isArray(window.MobShotSkills.SKILL_MASTER)) {
      return window.MobShotSkills.SKILL_MASTER;
    }

    return [
      { key:'rocket', name:'ロケットランチャー', image:'skill/rocket barrage.png' },
      { key:'energyRush', name:'エネルギーラッシュ', image:'skill/energyrush.png' },
      { key:'twinMissile', name:'ツインミサイル', image:'skill/double missile.png' },
      { key:'shadowClone', name:'影分身', image:'skill/shadowclone.png' },
      { key:'thunderbolt', name:'サンダーボルト', image:'skill/thunderbolt.png' },
      { key:'arcaneBarrier', name:'アルカナバリア', image:'skill/arcane barrier.png' },
      { key:'darkPower', name:'闇の力', image:'skill/dark oblivion.png' },
      { key:'blackHole', name:'ブラックホール', image:'skill/blackhole.png' },
      { key:'healingBreeze', name:'癒しの風', image:'skill/healingbreeze.png' },
      { key:'rosePulse', name:'薔薇の鼓動', image:'skill/rosepulse.png' }
    ];
  }

  function rollSkill(){
    const pool = getSkillPool();
    const skill = pool[Math.floor(Math.random() * pool.length)] || pool[0];

    return {
      type:'skill',
      id:skill.key || skill.id || skill.name,
      name:skill.name || skill.label || 'SKILL',
      image:skill.image || '',
      desc:skill.desc || ''
    };
  }

  function addResult(result){
    const state = loadState();

    if (result.type === 'stone') {
      const key = String(result.no);
      const current = state.stones[key] || {
        no:result.no,
        rarity:result.rarity,
        plus:0,
        owned:false
      };

      current.owned = true;
      current.rarity = result.rarity;
      current.plus = Math.min(rarityMax(result.rarity), Number(current.plus || 0) + 1);

      state.stones[key] = current;
    }

    if (result.type === 'skill') {
      const key = String(result.id);
      const current = state.skills[key] || {
        id:result.id,
        name:result.name,
        image:result.image,
        owned:false,
        plus:0
      };

      current.owned = true;
      current.name = result.name;
      current.image = result.image;
      current.plus = Number(current.plus || 0) + 1;

      state.skills[key] = current;

      if (window.MobShotSkills && window.MobShotSkills.acquireSkill) {
        window.MobShotSkills.acquireSkill(key);
      }
    }

    saveState(state);
    window.dispatchEvent(new CustomEvent('mobshot:gachaUpdated'));
    window.dispatchEvent(new CustomEvent('mobshot:saveUpdated'));
  }

  function spendDiamond(cost){
    const save = getSave();
    const have = Number(save.diamond || 0);

    if (have < cost) return false;

    save.diamond = have - cost;
    saveMain(save);

    if (window.MobShotMain && window.MobShotMain.refreshMainHud) {
      window.MobShotMain.refreshMainHud();
    }

    window.dispatchEvent(new CustomEvent('mobshot:saveUpdated'));
    return true;
  }

  function injectStyle(){
    if ($('mobGachaStyle')) return;

    const style = document.createElement('style');
    style.id = 'mobGachaStyle';
    style.textContent = `
      .gacha-modal{position:absolute;inset:0;z-index:95;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(0,0,0,.68)}
      .gacha-modal.hidden{display:none}
      .gacha-card{width:min(94vw,520px);max-height:86vh;overflow:auto;border-radius:26px;padding:16px;background:linear-gradient(180deg,rgba(26,22,62,.98),rgba(5,8,22,.98));border:3px solid rgba(255,255,255,.35);box-shadow:0 18px 48px rgba(0,0,0,.62)}
      .gacha-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}
      .gacha-head h2{margin:0;font-size:25px;font-weight:1000;color:#fff;text-shadow:0 3px 0 #000}
      .gacha-close,.gacha-btn{border:0;border-radius:999px;padding:10px 14px;font-weight:1000;background:linear-gradient(#ffe66b,#ffb423);color:#1d1300;box-shadow:0 4px 0 rgba(0,0,0,.35)}
      .gacha-main-img{display:block;width:100%;max-height:220px;object-fit:contain;margin:4px auto 10px;border-radius:18px;background:rgba(0,0,0,.22)}
      .gacha-diamond{font-weight:1000;color:#9deeff;margin:0 0 10px;text-align:center}
      .gacha-menu{display:grid;grid-template-columns:1fr;gap:10px}
      .gacha-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:8px}
      .gacha-btn.big{font-size:18px;padding:14px}
      .gacha-btn.gray{background:linear-gradient(#fff,#b7c1d5);color:#182033}
      .gacha-anim{display:flex;align-items:center;justify-content:center;min-height:260px}
      .gacha-anim img{width:86%;max-height:260px;object-fit:contain;filter:drop-shadow(0 12px 0 rgba(0,0,0,.32))}
      .gacha-anim.shake img{animation:gachaShake .12s linear infinite}
      .gacha-anim.zoom img{animation:gachaZoom .55s ease-out forwards}
      @keyframes gachaShake{0%{transform:translateX(-4px) rotate(-2deg)}50%{transform:translateX(4px) rotate(2deg)}100%{transform:translateX(-4px) rotate(-2deg)}}
      @keyframes gachaZoom{0%{transform:scale(1);filter:brightness(1)}100%{transform:scale(1.35);filter:brightness(2.3)}}
      .gacha-results{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
      .gacha-result{border-radius:18px;padding:10px;background:rgba(255,255,255,.1);border:2px solid rgba(255,255,255,.22);text-align:center}
      .gacha-result img{width:82px;height:82px;object-fit:contain}
      .gacha-result-name{font-weight:1000;color:#fff;font-size:13px;margin-top:4px}
      .gacha-result-rarity{font-weight:1000;font-size:18px;text-shadow:0 2px 0 #000}
      .rarity-R{color:#dfe8ff}.rarity-SR{color:#6be6ff}.rarity-SSR{color:#ffe66b}.rarity-UR{color:#ff6bff}
      .gacha-skill-tag{display:inline-block;margin-bottom:5px;padding:3px 8px;border-radius:999px;background:linear-gradient(#9deeff,#4bb8ff);color:#00172a;font-size:12px;font-weight:1000}
    `;
    document.head.appendChild(style);
  }

  function ensureModal(){
    injectStyle();

    let modal = $('gachaModal');
    if (modal) return modal;

    modal = document.createElement('div');
    modal.id = 'gachaModal';
    modal.className = 'gacha-modal hidden';
    modal.innerHTML = `
      <div class="gacha-card">
        <div class="gacha-head">
          <h2>ガチャ</h2>
          <button id="gachaCloseBtn" class="gacha-close" type="button">閉じる</button>
        </div>
        <div id="gachaContent"></div>
      </div>
    `;

    ($('app') || document.body).appendChild(modal);

    $('gachaCloseBtn').addEventListener('click', close);
    modal.addEventListener('click', function(e){
      if (e.target === modal) close();
    });

    return modal;
  }

  function diamondText(){
    return `DIAMOND: ${Number(getSave().diamond || 0).toLocaleString()}`;
  }

  function open(){
    ensureModal();
    renderTop();
    $('gachaModal').classList.remove('hidden');
  }

  function close(){
    const modal = $('gachaModal');
    if (modal) modal.classList.add('hidden');
  }

  function renderTop(){
    const content = $('gachaContent');
    if (!content) return;

    content.innerHTML = `
      <img class="gacha-main-img" src="${GACHA_IMAGES.top}" alt="GACHA">
      <div class="gacha-diamond">${diamondText()}</div>
      <div class="gacha-menu">
        <button id="stoneGachaBtn" class="gacha-btn big" type="button">石板ガチャ</button>
        <button id="skillGachaBtn" class="gacha-btn big" type="button">スキルガチャ</button>
        <button id="gachaCancelBtn" class="gacha-btn big gray" type="button">引かない</button>
      </div>
    `;

    $('stoneGachaBtn').addEventListener('click', function(){ renderChoice('stone'); });
    $('skillGachaBtn').addEventListener('click', function(){ renderChoice('skill'); });
    $('gachaCancelBtn').addEventListener('click', close);
  }

  function renderChoice(type){
    const content = $('gachaContent');
    const title = type === 'stone' ? '石板ガチャ' : 'スキルガチャ';
    const oneCost = type === 'stone' ? 1 : 5;
    const tenCost = 10;

    content.innerHTML = `
      <img class="gacha-main-img" src="${GACHA_IMAGES.top}" alt="GACHA">
      <div class="gacha-diamond">${diamondText()}</div>
      <div class="gacha-menu">
        <button id="gachaOneBtn" class="gacha-btn big" type="button">${title} 1回 / ${oneCost}ダイヤ</button>
        <button id="gachaTenBtn" class="gacha-btn big" type="button">${title} 10連 / ${tenCost}ダイヤ</button>
        <button id="gachaBackBtn" class="gacha-btn big gray" type="button">戻る</button>
      </div>
    `;

    $('gachaOneBtn').addEventListener('click', function(){ startRoll(type, 1, oneCost); });
    $('gachaTenBtn').addEventListener('click', function(){ startRoll(type, 10, tenCost); });
    $('gachaBackBtn').addEventListener('click', renderTop);
  }

  function startRoll(type, count, cost){
    if (!spendDiamond(cost)) {
      showMessage('ダイヤが足りません');
      return;
    }

    const results = [];

    for (let i = 0; i < count; i++) {
      const result = type === 'stone' ? rollStone() : rollSkill();
      results.push(result);
      addResult(result);
    }

    playAnimation(results);
  }

  function playAnimation(results){
    const content = $('gachaContent');

    content.innerHTML = `
      <div id="gachaAnim" class="gacha-anim">
        <img id="gachaAnimImg" src="${GACHA_IMAGES.start}" alt="GACHA">
      </div>
    `;

    setTimeout(function(){
      const img = $('gachaAnimImg');
      if (img) img.src = GACHA_IMAGES.shake;

      const anim = $('gachaAnim');
      if (anim) anim.classList.add('shake');
    }, 520);

    setTimeout(function(){
      const img = $('gachaAnimImg');
      if (img) img.src = GACHA_IMAGES.open;

      const anim = $('gachaAnim');
      if (anim) {
        anim.classList.remove('shake');
        anim.classList.add('zoom');
      }
    }, 3000);

    setTimeout(function(){
      renderResults(results);
    }, 3700);
  }

  function renderResults(results){
    const content = $('gachaContent');

    content.innerHTML = `
      <div class="gacha-diamond">${diamondText()}</div>
      <div class="gacha-results">
        ${results.map(resultCardHtml).join('')}
      </div>
      <div class="gacha-row">
        <button id="gachaAgainBtn" class="gacha-btn" type="button">もう一度</button>
        <button id="gachaDoneBtn" class="gacha-btn gray" type="button">終了</button>
      </div>
    `;

    $('gachaAgainBtn').addEventListener('click', renderTop);
    $('gachaDoneBtn').addEventListener('click', close);
  }

  function resultCardHtml(r){
    if (r.type === 'skill') {
      return `
        <div class="gacha-result">
          <div class="gacha-skill-tag">SKILL</div>
          <img src="${r.image}" alt="${r.name}" onerror="this.style.display='none'">
          <div class="gacha-result-name">${r.name}</div>
          <div class="gacha-result-name">入手 / 強化</div>
        </div>
      `;
    }

    return `
      <div class="gacha-result">
        <div class="gacha-result-rarity rarity-${r.rarity}">${r.rarity}</div>
        <img src="${r.image}" alt="${r.name}" onerror="this.style.display='none'">
        <div class="gacha-result-name">${r.name}</div>
        <div class="gacha-result-name">+1 / MAX ${r.maxPlus}</div>
      </div>
    `;
  }

  function showMessage(text){
    const content = $('gachaContent');

    content.innerHTML = `
      <div class="gacha-diamond">${diamondText()}</div>
      <div style="padding:22px;text-align:center;color:#fff;font-weight:1000">${text}</div>
      <button id="gachaMsgBackBtn" class="gacha-btn big gray" type="button">戻る</button>
    `;

    $('gachaMsgBackBtn').addEventListener('click', renderTop);
  }

  function bind(){
    const gachaBtn =
      $('openGachaBtn') ||
      ($('gachaImg') && $('gachaImg').closest('button'));

    if (gachaBtn && !gachaBtn.__mobGachaBound) {
      gachaBtn.__mobGachaBound = true;
      gachaBtn.classList.remove('disabled-btn');
      gachaBtn.disabled = false;

      gachaBtn.addEventListener('click', function(e){
        e.preventDefault();
        e.stopPropagation();
        open();
      });

      gachaBtn.addEventListener('pointerup', function(e){
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
  init();

  window.MobShotGacha = {
    open,
    close,
    loadState,
    saveState,
    allStones,
    rollStone,
    rollSkill,
    addResult,
    rarityMax,
    GACHA_SAVE_KEY
  };
})();
