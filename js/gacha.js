'use strict';

(function(){
  const GACHA_SAVE_KEY = 'mobshot_gacha_state_v1';

  const RARITY = {
    R: { max:99, rate:68, image:'mt/R.png' },
    SR:{ max:50, rate:24, image:'mt/SR.png' },
    SSR:{ max:30, rate:7, image:'mt/SSR.png' },
    UR:{ max:10, rate:1, image:'mt/UR.png' }
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

  let isAnimating = false;
  let lastType = 'stone';

  function $(id){ return document.getElementById(id); }

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

  function rarityImage(rarity){
    return RARITY[rarity] ? RARITY[rarity].image : RARITY.R.image;
  }

  function rarityClass(rarity){
    if (rarity === 'UR') return 'rarity-frame-ur';
    if (rarity === 'SSR') return 'rarity-frame-ssr';
    if (rarity === 'SR') return 'rarity-frame-sr';
    return 'rarity-frame-r';
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
      rarityImage:rarityImage(rarity),
      maxPlus:rarityMax(rarity)
    });
  }

  function getSkillPool(){
    if (window.MobShotSkills && Array.isArray(window.MobShotSkills.SKILL_MASTER)) {
      return window.MobShotSkills.SKILL_MASTER;
    }

    return [
      { key:'rocket', name:'ロケットランチャー', image:'skill/rocket barrage.png', desc:'ロケット弾で攻撃する。' },
      { key:'energyRush', name:'エネルギーラッシュ', image:'skill/energyrush.png', desc:'エネルギー弾を乱射する。' },
      { key:'twinMissile', name:'ツインミサイル', image:'skill/double missile.png', desc:'追尾ミサイルを放つ。' },
      { key:'shadowClone', name:'影分身', image:'skill/shadowclone.png', desc:'分身を召喚する。' },
      { key:'thunderbolt', name:'サンダーボルト', image:'skill/thunderbolt.png', desc:'雷を落とす。' },
      { key:'arcaneBarrier', name:'アルカナバリア', image:'skill/arcane barrier.png', desc:'バリアを展開する。' },
      { key:'darkPower', name:'闇の力', image:'skill/dark oblivion.png', desc:'闇の力で強化する。' },
      { key:'blackHole', name:'ブラックホール', image:'skill/blackhole.png', desc:'敵を吸い寄せる。' },
      { key:'healingBreeze', name:'癒しの風', image:'skill/healingbreeze.png', desc:'HPを回復する。' },
      { key:'rosePulse', name:'薔薇の鼓動', image:'skill/rosepulse.png', desc:'薔薇弾で攻撃する。' }
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
      current.desc = result.desc || '';
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
      .gacha-close.hidden{display:none}
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

      .gacha-results{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
      .gacha-result{position:relative;border-radius:20px;padding:20px 10px 10px;background:rgba(255,255,255,.1);border:2px solid rgba(255,255,255,.22);text-align:center;overflow:visible}
      .gacha-result img.gacha-main-result-img{width:92px;height:92px;object-fit:contain;position:relative;z-index:2}
      .gacha-result-name{font-weight:1000;color:#fff;font-size:13px;margin-top:4px;position:relative;z-index:3}
      .gacha-result-rarity-img{position:absolute;left:50%;top:-18px;width:90px;height:48px;object-fit:contain;z-index:6;transform:translateX(-50%);filter:drop-shadow(0 4px 0 rgba(0,0,0,.55));animation:gachaRarityFloat 1.7s ease-in-out infinite}
      @keyframes gachaRarityFloat{0%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(-8px)}100%{transform:translateX(-50%) translateY(0)}}

      .rarity-frame-r{border-color:rgba(255,255,255,.24)}
      .rarity-frame-sr{border-color:#58dfff;box-shadow:0 0 8px #58dfff,inset 0 0 8px rgba(88,223,255,.45)}
      .rarity-frame-ssr{border-color:#ffd83d;box-shadow:0 0 12px #ffd83d,0 0 22px rgba(255,216,61,.78),inset 0 0 12px rgba(255,216,61,.48)}
      .rarity-frame-ur{border-color:#ff3cff;box-shadow:0 0 6px #000,0 0 18px #ff3cff,0 0 32px #6d00ff,inset 0 0 12px #ff3cff;animation:urFramePulse 1.9s ease-in-out infinite}
      .rarity-frame-ur:before{content:'';position:absolute;inset:4px;border-radius:16px;border:2px solid rgba(0,0,0,.85);box-shadow:inset 0 0 12px rgba(0,0,0,.85);pointer-events:none}
      @keyframes urFramePulse{0%{filter:brightness(1)}50%{filter:brightness(1.45)}100%{filter:brightness(1)}}

      .gacha-skill-tag{display:inline-block;margin-bottom:5px;padding:3px 8px;border-radius:999px;background:linear-gradient(#9deeff,#4bb8ff);color:#00172a;font-size:12px;font-weight:1000}

      .gacha-preview{position:absolute;inset:0;z-index:140;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(0,0,0,.76)}
      .gacha-preview.hidden{display:none}
      .gacha-preview-card{position:relative;width:min(92vw,420px);border-radius:26px;padding:22px 16px 16px;background:linear-gradient(180deg,rgba(33,27,70,.98),rgba(5,8,22,.98));border:3px solid rgba(255,255,255,.38);text-align:center;box-shadow:0 18px 48px rgba(0,0,0,.7);overflow:visible}
      .gacha-preview-card img.preview-main{width:78%;max-height:280px;object-fit:contain;margin:8px auto;position:relative;z-index:2}
      .gacha-preview-card img.preview-rarity{position:absolute;left:50%;top:-24px;width:126px;height:64px;object-fit:contain;z-index:8;transform:translateX(-50%);filter:drop-shadow(0 4px 0 rgba(0,0,0,.55));animation:gachaRarityFloat 1.7s ease-in-out infinite}
      .gacha-preview-title{font-size:20px;font-weight:1000;color:#fff;text-shadow:0 3px 0 #000;position:relative;z-index:3}
      .gacha-preview-desc{font-size:13px;font-weight:900;color:#dfe8ff;line-height:1.45;margin:8px 0 12px;position:relative;z-index:3}
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

    $('gachaCloseBtn').addEventListener('click', function(){
      if (!isAnimating) close();
    });

    modal.addEventListener('click', function(e){
      if (e.target === modal && !isAnimating) close();
    });

    ensurePreview();
    return modal;
  }

  function ensurePreview(){
    let preview = $('gachaPreview');
    if (preview) return preview;

    preview = document.createElement('div');
    preview.id = 'gachaPreview';
    preview.className = 'gacha-preview hidden';
    preview.innerHTML = `
      <div id="gachaPreviewCard" class="gacha-preview-card">
        <div id="gachaPreviewRarity"></div>
        <img id="gachaPreviewImg" class="preview-main" alt="">
        <div id="gachaPreviewTitle" class="gacha-preview-title"></div>
        <div id="gachaPreviewDesc" class="gacha-preview-desc"></div>
        <button id="gachaPreviewClose" class="gacha-btn gray" type="button">閉じる</button>
      </div>
    `;

    ($('app') || document.body).appendChild(preview);

    $('gachaPreviewClose').addEventListener('click', closePreview);
    preview.addEventListener('click', function(e){
      if (e.target === preview) closePreview();
    });

    return preview;
  }

  function openPreview(item){
    ensurePreview();

    const card = $('gachaPreviewCard');
    const rarityBox = $('gachaPreviewRarity');
    const img = $('gachaPreviewImg');
    const title = $('gachaPreviewTitle');
    const desc = $('gachaPreviewDesc');

    if (card) {
      card.className = 'gacha-preview-card';

      if (item.type === 'stone') {
        card.classList.add(rarityClass(item.rarity));
      }
    }

    if (rarityBox) {
      rarityBox.innerHTML = item.type === 'stone'
        ? `<img class="preview-rarity" src="${rarityImage(item.rarity)}" alt="${item.rarity}">`
        : `<span class="gacha-skill-tag">SKILL</span>`;
    }

    if (img) img.src = item.image || '';
    if (title) title.textContent = item.name || '';

    if (desc) {
      if (item.type === 'stone') {
        desc.textContent = `${item.category || ''} / ${item.effect || ''} / +1 最大+${item.maxPlus || ''}`;
      } else {
        desc.textContent = item.desc || 'スキルを入手・強化しました。';
      }
    }

    $('gachaPreview').classList.remove('hidden');
  }

  function closePreview(){
    const preview = $('gachaPreview');
    if (preview) preview.classList.add('hidden');
  }

  function setCloseVisible(show){
    const btn = $('gachaCloseBtn');
    if (btn) btn.classList.toggle('hidden', !show);
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
    if (isAnimating) return;

    const modal = $('gachaModal');
    if (modal) modal.classList.add('hidden');
  }

  function renderTop(){
    isAnimating = false;
    setCloseVisible(true);

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
    isAnimating = false;
    setCloseVisible(true);
    lastType = type;

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

    lastType = type;

    const results = [];

    for (let i = 0; i < count; i++) {
      const result = type === 'stone' ? rollStone() : rollSkill();
      results.push(result);
      addResult(result);
    }

    playAnimation(results);
  }

  function playAnimation(results){
    isAnimating = true;
    setCloseVisible(false);

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
      isAnimating = false;
      setCloseVisible(true);
      renderResults(results);
    }, 3700);
  }

  function renderResults(results){
    const content = $('gachaContent');

    content.innerHTML = `
      <div class="gacha-diamond">${diamondText()}</div>
      <div id="gachaResultList" class="gacha-results"></div>
      <div class="gacha-row">
        <button id="gachaAgainBtn" class="gacha-btn" type="button">もう一度</button>
        <button id="gachaDoneBtn" class="gacha-btn gray" type="button">終了</button>
      </div>
    `;

    const list = $('gachaResultList');

    results.forEach(result => {
      const card = document.createElement('div');

      card.className = 'gacha-result';

      if (result.type === 'stone') {
        card.classList.add(rarityClass(result.rarity));
      }

      card.innerHTML = resultCardHtml(result);

      card.addEventListener('click', function(){
        openPreview(result);
      });

      list.appendChild(card);
    });

    $('gachaAgainBtn').addEventListener('click', function(){ renderChoice(lastType); });
    $('gachaDoneBtn').addEventListener('click', close);
  }

  function resultCardHtml(r){
    if (r.type === 'skill') {
      return `
        <div class="gacha-skill-tag">SKILL</div>
        <img class="gacha-main-result-img" src="${r.image}" alt="${r.name}" onerror="this.style.display='none'">
        <div class="gacha-result-name">${r.name}</div>
        <div class="gacha-result-name">入手 / 強化</div>
      `;
    }

    return `
      <img class="gacha-result-rarity-img" src="${rarityImage(r.rarity)}" alt="${r.rarity}">
      <img class="gacha-main-result-img" src="${r.image}" alt="${r.name}" onerror="this.style.display='none'">
      <div class="gacha-result-name">${r.name}</div>
      <div class="gacha-result-name">+1 / MAX ${r.maxPlus}</div>
    `;
  }

  function showMessage(text){
    isAnimating = false;
    setCloseVisible(true);

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
    rarityImage,
    rarityClass,
    GACHA_SAVE_KEY
  };
})();
