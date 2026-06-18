'use strict';

(function(){
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const D = window.MOBSHOT_DATA;
  const flow = new window.MobShotStageFlow();

  const hudStage = document.getElementById('hudStage');
  const hudScore = document.getElementById('hudScore');
  const hudCoin = document.getElementById('hudCoin');
  const hudLife = document.getElementById('hudLife');
  const phaseBanner = document.getElementById('phaseBanner');
  const resultPanel = document.getElementById('resultPanel');
  const resultTitle = document.getElementById('resultTitle');
  const resultText = document.getElementById('resultText');
  const resultScore = document.getElementById('resultScore');
  const resultCoin = document.getElementById('resultCoin');
  const resultRetryBtn = document.getElementById('resultRetryBtn');
  const resultHomeBtn = document.getElementById('resultHomeBtn');

  const SCROLL_SPEED = 1.15;
  const FIELD_ENTITY_SPEED = 0.72;

  const DIFFICULTY_ICONS = {
    'イージー': 'mt/game1.png',
    'ハード': 'mt/game2.png',
    'ベリーハード': 'mt/game3.png',
    'インフェルノ': 'mt/game4.png',
    'レジェンド': 'mt/game5.png',
    easy: 'mt/game1.png',
    hard: 'mt/game2.png',
    veryHard: 'mt/game3.png',
    inferno: 'mt/game4.png',
    legend: 'mt/game5.png'
  };

  const ORIGINAL_DATA = JSON.parse(JSON.stringify({
    stage: D.stage,
    enemies: D.enemies,
    gimmicks: D.gimmicks,
    chests: D.chests
  }));

  let W = 0;
  let H = 0;
  let DPR = 1;
  let running = false;
  let raf = 0;
  let frame = 0;
  let scroll = 0;
  let runCommitted = false;
  let aiErrorCount = 0;
  let pendingRankUp = null;

  const images = new Map();

  const state = {
    hp: 50,
    maxHp: 50,
    power: 1,
    range: 3,
    baseWide: 1,
    wide: 1,
    attackSpeed: 1,
    collectionBonus: {
      score:0,
      coin:0,
      hp:0,
      power:0,
      range:0
    },
    scoreMultiplier: 1,
    coinMultiplier: 1,
    playerImage: 'play/playpink.png',
    bulletImage: 'mt/atk.png',
    score: 0,
    coin: 0,
    player: {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      r: 24
    },
    shootCd: 0,
    areaSpawn: {
      nextEnemy: 0,
      nextGimmick: 0,
      nextChest: 0,
      endAt: 0
    },
    gateEndAt: 0,
    eventMode: {
      active: false,
      key: ''
    },
    entities: [],
    bullets: [],
    particles: [],
    texts: []
  };

  function getCollectionBonus(){
    if (
      window.MobShotCollection &&
      window.MobShotCollection.calcCollectionBonus
    ) {
      const bonus = window.MobShotCollection.calcCollectionBonus() || {};

      return {
        score:Math.max(0, Number(bonus.score || 0)),
        coin:Math.max(0, Number(bonus.coin || 0)),
        hp:Math.max(0, Number(bonus.hp || 0)),
        power:Math.max(0, Number(bonus.power || 0)),
        range:Math.max(0, Number(bonus.range || 0))
      };
    }

    return {
      score:0,
      coin:0,
      hp:0,
      power:0,
      range:0
    };
  }

  function injectHudStyle(){
    if (document.getElementById('mobShotGameHudStyle')) return;

    const style = document.createElement('style');
    style.id = 'mobShotGameHudStyle';
    style.textContent = `
      .game-hud .hud-item span{
        font-size:18px !important;
        font-weight:1000 !important;
        letter-spacing:.02em;
      }
      #hudStageImg{
        width:34px !important;
        height:34px !important;
        object-fit:contain !important;
        filter:drop-shadow(0 3px 0 rgba(0,0,0,.35));
      }

      .mob-rankup-modal{
        position:absolute;
        inset:0;
        z-index:260;
        display:flex;
        align-items:center;
        justify-content:center;
        padding:20px;
        background:rgba(0,0,0,.78);
      }

      .mob-rankup-modal.hidden{
        display:none;
      }

      .mob-rankup-card{
        position:relative;
        width:min(92vw,430px);
        border-radius:32px;
        padding:24px 18px 18px;
        text-align:center;
        background:linear-gradient(180deg,rgba(55,35,100,.98),rgba(8,10,28,.98));
        border:4px solid rgba(255,230,107,.85);
        box-shadow:
          0 18px 55px rgba(0,0,0,.75),
          0 0 32px rgba(255,210,60,.38),
          inset 0 0 0 2px rgba(255,255,255,.12);
        overflow:hidden;
      }

      .mob-rankup-card::before,
      .mob-rankup-card::after{
        content:"";
        position:absolute;
        width:180px;
        height:180px;
        border-radius:50%;
        background:radial-gradient(circle,rgba(255,230,107,.75),rgba(255,230,107,0) 68%);
        animation:mobRankGlow 1.8s ease-in-out infinite;
        pointer-events:none;
      }

      .mob-rankup-card::before{
        left:-70px;
        top:-80px;
      }

      .mob-rankup-card::after{
        right:-70px;
        bottom:-80px;
        animation-delay:-.9s;
      }

      .mob-rankup-title{
        position:relative;
        z-index:2;
        font-size:42px;
        font-weight:1000;
        line-height:1;
        letter-spacing:.04em;
        color:#ffe66b;
        text-shadow:
          0 5px 0 #000,
          0 0 18px rgba(255,230,107,.65);
        animation:mobRankPop .42s ease-out both;
      }

      .mob-rankup-sub{
        position:relative;
        z-index:2;
        margin-top:10px;
        font-size:15px;
        font-weight:1000;
        color:#fff;
        text-shadow:0 3px 0 #000;
      }

      .mob-rankup-rank{
        position:relative;
        z-index:2;
        margin:18px auto 12px;
        display:flex;
        align-items:center;
        justify-content:center;
        gap:12px;
        font-size:24px;
        font-weight:1000;
        color:#fff;
        text-shadow:0 4px 0 #000;
      }

      .mob-rankup-rank b{
        display:inline-flex;
        align-items:center;
        justify-content:center;
        min-width:82px;
        padding:8px 12px;
        border-radius:18px;
        background:linear-gradient(#ff6bd8,#6b40ff);
        border:3px solid rgba(255,255,255,.45);
        box-shadow:0 5px 0 rgba(0,0,0,.35);
      }

      .mob-rankup-next{
        position:relative;
        z-index:2;
        margin:12px auto;
        padding:12px;
        border-radius:18px;
        background:rgba(255,255,255,.10);
        border:2px solid rgba(255,255,255,.20);
        color:#dfe8ff;
        font-size:13px;
        line-height:1.5;
        font-weight:900;
      }

      .mob-rankup-ok{
        position:relative;
        z-index:2;
        width:100%;
        margin-top:12px;
        border:0;
        border-radius:999px;
        padding:14px 16px;
        font-size:18px;
        font-weight:1000;
        color:#261600;
        background:linear-gradient(#fff178,#ffb423);
        box-shadow:0 6px 0 rgba(0,0,0,.38);
      }

      .mob-rankup-spark{
        position:absolute;
        z-index:1;
        width:8px;
        height:8px;
        border-radius:50%;
        background:#fff178;
        box-shadow:0 0 14px rgba(255,230,107,.9);
        animation:mobRankSpark 1.2s ease-out infinite;
      }

      @keyframes mobRankGlow{
        0%,100%{opacity:.55; transform:scale(.92)}
        50%{opacity:1; transform:scale(1.12)}
      }

      @keyframes mobRankPop{
        0%{transform:scale(.65); opacity:0}
        70%{transform:scale(1.08); opacity:1}
        100%{transform:scale(1); opacity:1}
      }

      @keyframes mobRankSpark{
        0%{transform:translateY(18px) scale(.6); opacity:0}
        20%{opacity:1}
        100%{transform:translateY(-80px) scale(1.25); opacity:0}
      }
    `;
    document.head.appendChild(style);
  }

  function ensureRankUpModal(){
    injectHudStyle();

    let modal = document.getElementById('mobRankUpModal');
    if (modal) return modal;

    modal = document.createElement('div');
    modal.id = 'mobRankUpModal';
    modal.className = 'mob-rankup-modal hidden';

    modal.innerHTML = `
      <div class="mob-rankup-card">
        <span class="mob-rankup-spark" style="left:12%;bottom:25%;animation-delay:0s"></span>
        <span class="mob-rankup-spark" style="left:28%;bottom:18%;animation-delay:-.25s"></span>
        <span class="mob-rankup-spark" style="left:48%;bottom:20%;animation-delay:-.5s"></span>
        <span class="mob-rankup-spark" style="left:70%;bottom:16%;animation-delay:-.75s"></span>
        <span class="mob-rankup-spark" style="left:86%;bottom:27%;animation-delay:-1s"></span>

        <div class="mob-rankup-title">RANK UP!</div>
        <div id="mobRankUpSub" class="mob-rankup-sub">ランクが上がりました！</div>
        <div class="mob-rankup-rank">
          <b id="mobRankBefore">1</b>
          <span>→</span>
          <b id="mobRankAfter">2</b>
        </div>
        <div id="mobRankNext" class="mob-rankup-next"></div>
        <button id="mobRankUpOk" class="mob-rankup-ok" type="button">OK</button>
      </div>
    `;

    const gameScreen = document.getElementById('gameScreen') || document.body;
    gameScreen.appendChild(modal);

    const ok = document.getElementById('mobRankUpOk');
    if (ok) {
      ok.addEventListener('click', function(e){
        e.preventDefault();
        e.stopPropagation();
        modal.classList.add('hidden');
      }, { passive:false });

      ok.addEventListener('pointerup', function(e){
        e.preventDefault();
        e.stopPropagation();
        modal.classList.add('hidden');
      }, { passive:false });
    }

    return modal;
  }

  function showRankUpModal(detail){
    if (!detail) return;

    const modal = ensureRankUpModal();

    const beforeEl = document.getElementById('mobRankBefore');
    const afterEl = document.getElementById('mobRankAfter');
    const subEl = document.getElementById('mobRankUpSub');
    const nextEl = document.getElementById('mobRankNext');

    const beforeRank = Number(detail.beforeRank || 1);
    const rank = Number(detail.rank || beforeRank);
    const totalScore = Number(detail.totalScore || 0);
    const nextScore = Number(detail.nextScore || 0);

    if (beforeEl) beforeEl.textContent = beforeRank;
    if (afterEl) afterEl.textContent = rank;
    if (subEl) subEl.textContent = `RANK ${rank} に到達！`;

    if (nextEl) {
      if (nextScore > 0 && nextScore > totalScore) {
        nextEl.innerHTML =
          `現在SCORE: ${totalScore.toLocaleString()}<br>` +
          `次のRANKまで: ${(nextScore - totalScore).toLocaleString()} SCORE`;
      } else {
        nextEl.innerHTML =
          `現在SCORE: ${totalScore.toLocaleString()}<br>` +
          `最高ランクに到達しています`;
      }
    }

    modal.classList.remove('hidden');
  }

  function setHudDifficultyIcon(difficulty){
    injectHudStyle();

    const img = document.getElementById('hudStageImg');
    if (!img) return;

    const src = DIFFICULTY_ICONS[difficulty] || 'mt/stagestage.png';
    img.src = src;
  }

  function clone(obj){
    return JSON.parse(JSON.stringify(obj));
  }

  function restoreBaseData(){
    if (!D) return;

    D.stage = clone(ORIGINAL_DATA.stage);
    D.enemies = clone(ORIGINAL_DATA.enemies);
    D.gimmicks = clone(ORIGINAL_DATA.gimmicks);
    D.chests = clone(ORIGINAL_DATA.chests);
  }

  function getImage(src){
    if (!src) return null;

    if (!images.has(src)) {
      const image = new Image();
      image.src = src + '?v=20260618_collection_bonus';
      image.onerror = function(){
        console.warn('画像が読み込めません:', src);
      };
      images.set(src, image);
    }

    return images.get(src);
  }

  function getPlayerBaseY(){
    return Math.max(H * 0.58, H - 148);
  }

  function isSkillInput(e){
    return !!(
      e &&
      e.target &&
      e.target.closest &&
      e.target.closest('#skillHud')
    );
  }

  function rand(a, b){ return a + Math.random() * (b - a); }
  function intRand(a, b){ return Math.floor(rand(a, b + 1)); }
  function pick(arr){ return arr && arr.length ? arr[Math.floor(Math.random() * arr.length)] : null; }
  function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }

  function weightedPick(list){
    if (!list || !list.length) return null;

    const total = list.reduce((sum, item) => sum + (item.weight || 1), 0);
    let roll = Math.random() * total;

    for (const item of list) {
      roll -= item.weight || 1;
      if (roll <= 0) return item;
    }

    return list[list.length - 1];
  }

  function getShopBonus(){
    if (window.MobShotShop && window.MobShotShop.getUpgradeBonus) {
      return window.MobShotShop.getUpgradeBonus();
    }

    return { power: 0, range: 0, rapid: 0, hp: 0 };
  }

  function getEquipBonus(){
    if (window.MobShotEquip && window.MobShotEquip.getEquipmentBonus) {
      return window.MobShotEquip.getEquipmentBonus();
    }

    return { power: 0, rapid: 0, hp: 0 };
  }

  function getEquippedAvatar(){
    if (window.MobShotEquip && window.MobShotEquip.getEquippedAvatar) {
      return window.MobShotEquip.getEquippedAvatar();
    }

    return null;
  }

  function getEquippedRecord(){
    if (window.MobShotEquip && window.MobShotEquip.getEquippedRecord) {
      return window.MobShotEquip.getEquippedRecord();
    }

    return null;
  }

  function getCurrentStageInfo(){
    if (window.MobShotStorage && window.MobShotStorage.getCurrentStage) {
      return window.MobShotStorage.getCurrentStage();
    }

    const stage = D.stage || {};

    return {
      index: 0,
      areaKey: stage.areaKey || 'grass',
      areaName: stage.areaName || '草原',
      areaNo: Number(stage.areaNo || 1),
      stageNo: Number(stage.stageNo || 1),
      id: stage.id || '1-1',
      difficulty: stage.difficulty || 'イージー',
      isStrongBoss: !!stage.isStrongBoss,
      isLegend: !!stage.isLegend,
      isTest: !!stage.isTest
    };
  }

  function makeTools(){
    return {
      state,
      D,
      flow,
      W,
      H,
      ctx,
      scroll,
      frame: function(){ return frame; },
      rand,
      intRand,
      pick,
      clamp,
      weightedPick,
      addText,
      burst,
      killEntity,
      applyGate
    };
  }

  function makeRenderTools(){
    return { ctx, state, D, W, H, scroll, getImage };
  }

  function resize(){
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;

    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    state.player.y = getPlayerBaseY();
    state.player.targetY = getPlayerBaseY();

    if (!state.player.x) state.player.x = W / 2;
    if (!state.player.targetX) state.player.targetX = W / 2;
  }

  function resetEventMode(){
    state.eventMode = { active: false, key: '' };
  }

  function setEventMode(mode){
    state.eventMode = Object.assign({ active: false, key: '' }, mode || {});
  }

  function isEventMode(key){
    return !!(
      state.eventMode &&
      state.eventMode.active &&
      state.eventMode.key === key
    );
  }

  function resetRun(){
    frame = 0;
    scroll = 0;
    runCommitted = false;
    aiErrorCount = 0;
    pendingRankUp = null;

    injectHudStyle();
    ensureRankUpModal();
    restoreBaseData();

    const shopBonus = getShopBonus();
    const equipBonus = getEquipBonus();
    const collectionBonus = getCollectionBonus();
    const avatar = getEquippedAvatar();
    const record = getEquippedRecord();

    state.collectionBonus = collectionBonus;
    state.scoreMultiplier = 1 + Number(collectionBonus.score || 0);
    state.coinMultiplier = 1 + Number(collectionBonus.coin || 0);

    state.maxHp = Math.ceil(
      Number(D.player.maxHp || 50) +
      Number(shopBonus.hp || 0) +
      Number(equipBonus.hp || 0) +
      Number(collectionBonus.hp || 0)
    );

    state.hp = state.maxHp;

    state.power =
      Number(D.player.power || 1) +
      Number(shopBonus.power || 0) +
      Number(equipBonus.power || 0) +
      Number(collectionBonus.power || 0);

    state.range =
      Number(D.player.range || 3) +
      Number(shopBonus.range || 0) +
      Number(collectionBonus.range || 0);

    state.baseWide = D.player.wide;
    state.wide = state.baseWide;
    state.attackSpeed = D.player.attackSpeed + shopBonus.rapid + equipBonus.rapid;
    state.playerImage = avatar ? avatar.backImage : D.player.image;
    state.bulletImage = D.player.bulletImage;

    if (record && record.bulletImage) {
      state.bulletImage = record.bulletImage;
    }

    state.score = 0;
    state.coin = 0;
    state.player.x = W / 2;
    state.player.targetX = W / 2;
    state.player.y = getPlayerBaseY();
    state.player.targetY = getPlayerBaseY();
    state.shootCd = 0;

    state.areaSpawn.nextEnemy = 0;
    state.areaSpawn.nextGimmick = 0;
    state.areaSpawn.nextChest = 0;
    state.areaSpawn.endAt = 0;
    state.gateEndAt = 0;

    state.entities.length = 0;
    state.bullets.length = 0;
    state.particles.length = 0;
    state.texts.length = 0;

    resetEventMode();
    flow.reset();

    if (window.MobShotPetBattle && window.MobShotPetBattle.init) {
      window.MobShotPetBattle.init(state);
    }

    if (window.MobShotGameSkills && window.MobShotGameSkills.init) {
      window.MobShotGameSkills.init(state);
    }

    updateSkillHudImages();

    if (resultPanel) resultPanel.classList.add('hidden');
    if (resultRetryBtn) {
      resultRetryBtn.style.display = '';
      resultRetryBtn.textContent = 'もう一度';
    }
    if (resultHomeBtn) {
      resultHomeBtn.style.display = '';
      resultHomeBtn.textContent = 'メインへ戻る';
    }

    if (
      window.MobShotGameEvents &&
      window.MobShotGameEvents.startCurrentEvent &&
      window.MobShotGameEvents.startCurrentEvent(getCoreApi())
    ) {
      return;
    }

    if (window.MobShotEvents && window.MobShotEvents.clearCurrentEvent) {
      window.MobShotEvents.clearCurrentEvent();
    }

    const info = getCurrentStageInfo();
    setHudDifficultyIcon(info.difficulty);

    handleFlowEvent(flow.start());
  }

  function start(){
    resize();
    createTestClearButton();
    stopLoopOnly();
    running = true;
    resetRun();
    loop();
  }

  function stopLoopOnly(){
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  function stop(){
    running = false;
    stopLoopOnly();
  }

  function showBanner(text){
    if (!phaseBanner) return;

    phaseBanner.textContent = text;
    phaseBanner.classList.remove('show');
    void phaseBanner.offsetWidth;
    phaseBanner.classList.add('show');
  }

  function handleFlowEvent(ev){
    if (!ev) return;

    showBanner(ev.text);

    const tools = makeTools();

    try {
      if (ev.type === 'areaStart') {
        state.areaSpawn.nextEnemy = frame + 40;
        state.areaSpawn.nextGimmick = frame + 80;
        state.areaSpawn.nextChest = frame + 150;
        state.areaSpawn.endAt = frame + 430;
      }

      if (ev.type === 'gateStart') {
        if (window.MobShotSpawn && window.MobShotSpawn.spawnGatePair) {
          window.MobShotSpawn.spawnGatePair(tools);
        }

        state.gateEndAt = frame + 520;
      }

      if (ev.type === 'midBossStart') {
        if (window.MobShotSpawn && window.MobShotSpawn.spawnMidBoss) {
          window.MobShotSpawn.spawnMidBoss(tools);
        }
      }

      if (ev.type === 'bossStart') {
        if (window.MobShotSpawn && window.MobShotSpawn.spawnBoss) {
          window.MobShotSpawn.spawnBoss(tools);
        }
      }

      if (ev.type === 'clear') {
        finishRun(true);
      }
    } catch (err) {
      console.error('Flow event error:', ev.type, err);
      addText('FLOW ERROR', W / 2, H * 0.25, '#ff5b5b');

      if (ev.type === 'gateStart') handleFlowEvent(flow.completeGate());
      else if (ev.type === 'midBossStart') handleFlowEvent(flow.completeMidBoss());
      else if (ev.type === 'bossStart') handleFlowEvent(flow.completeBoss());
    }
  }

  function updateFlow(){
    if (
      state.eventMode &&
      state.eventMode.active &&
      window.MobShotGameEvents &&
      window.MobShotGameEvents.update &&
      window.MobShotGameEvents.update(getCoreApi())
    ) {
      return;
    }

    try {
      flow.update();

      const snap = flow.snapshot();
      const tools = makeTools();

      if (snap.phase === 'area') {
        if (frame >= state.areaSpawn.nextEnemy) {
          if (window.MobShotSpawn && window.MobShotSpawn.spawnEnemy) {
            window.MobShotSpawn.spawnEnemy(tools);
          }

          state.areaSpawn.nextEnemy = frame + intRand(90, 145);
        }

        if (frame >= state.areaSpawn.nextGimmick) {
          if (window.MobShotSpawn && window.MobShotSpawn.spawnGimmick) {
            window.MobShotSpawn.spawnGimmick(tools);
          }

          state.areaSpawn.nextGimmick = frame + intRand(115, 175);
        }

        if (frame >= state.areaSpawn.nextChest) {
          if (Math.random() < 0.32) {
            if (window.MobShotSpawn && window.MobShotSpawn.spawnChest) {
              window.MobShotSpawn.spawnChest(tools);
            }
          }

          state.areaSpawn.nextChest = frame + intRand(260, 390);
        }

        if (frame >= state.areaSpawn.endAt) {
          handleFlowEvent(flow.completeArea());
        }
      }

      if (snap.phase === 'gate') {
        const gatesAlive = state.entities.some(e => e.kind === 'gate' && !e.dead);

        if (!gatesAlive || frame >= state.gateEndAt) {
          state.entities.forEach(e => {
            if (e.kind === 'gate') e.dead = true;
          });

          handleFlowEvent(flow.completeGate());
        }
      }

      if (snap.phase === 'midBoss') {
        const alive = state.entities.some(e => e.kind === 'midBoss' && !e.dead);

        if (!alive && snap.phaseFrame > 60) {
          handleFlowEvent(flow.completeMidBoss());
        }
      }

      if (snap.phase === 'boss') {
        const alive = state.entities.some(e => e.kind === 'boss' && !e.dead);

        if (!alive && snap.phaseFrame > 60) {
          handleFlowEvent(flow.completeBoss());
        }
      }
    } catch (err) {
      console.error('updateFlow error:', err);
      addText('FLOW SAFE', W / 2, H * 0.22, '#ff5b5b');
    }
  }

  function updatePlayer(){
    const p = state.player;

    p.targetY = getPlayerBaseY();
    p.x += (p.targetX - p.x) * 0.19;
    p.y += (p.targetY - p.y) * 0.20;
    p.x = clamp(p.x, W * 0.14, W * 0.86);
    p.y = getPlayerBaseY();
  }

  function updateEnemyAI(e){
    e.aiTimer = Number(e.aiTimer || 0) + 1;

    if (e.aiType === 'hop' || e.aiType === 'fastHop' || e.aiType === 'wideHop') {
      e.x += Math.sin(e.aiTimer * 0.16) * (e.aiType === 'fastHop' ? 2.2 : 1.25);
      e.y += Math.sin(e.aiTimer * 0.22) * 0.35;
    }

    if (e.aiType === 'sway') e.x += Math.sin(e.aiTimer * 0.08) * 1.6;
    if (e.aiType === 'fastSide') e.x += Math.sin(e.aiTimer * 0.16) * 2.2;
  }

  function fallbackBossMove(e){
    if (e.y < e.targetY) {
      e.y += e.vy || 1.5;
      return;
    }

    e.x += e.vx || 1.2;

    if (e.x < W * 0.18 || e.x > W * 0.82) {
      e.vx = -(e.vx || 1.2);
    }
  }

  function updateEntities(){
    const bossTools = makeTools();

    const timeStopped =
      window.MobShotGameSkills &&
      window.MobShotGameSkills.isTimeStopped &&
      window.MobShotGameSkills.isTimeStopped();

    for (const e of state.entities) {
      if (e.dead) continue;

      if (e.kind === 'enemy' || e.kind === 'midBoss' || e.kind === 'boss') {
        e.bob = Number(e.bob || 0) + 0.06;
      }

      if (
        timeStopped &&
        (
          e.kind === 'enemy' ||
          e.kind === 'midBoss' ||
          e.kind === 'boss' ||
          e.kind === 'enemyBullet'
        )
      ) {
        continue;
      }

      if (e.kind === 'midBoss') {
        if (window.MobShotBoss && window.MobShotBoss.updateMidBoss) {
          try {
            window.MobShotBoss.updateMidBoss(e, bossTools);
          } catch (err) {
            aiErrorCount++;
            console.error('中ボスAIエラー:', e.name, err);
            fallbackBossMove(e);
            if (aiErrorCount > 20) e.dead = true;
          }
        } else {
          fallbackBossMove(e);
        }
      } else if (e.kind === 'boss') {
        if (window.MobShotBoss && window.MobShotBoss.updateBoss) {
          try {
            window.MobShotBoss.updateBoss(e, bossTools);
          } catch (err) {
            aiErrorCount++;
            console.error('ボスAIエラー:', e.name, err);
            fallbackBossMove(e);
            if (aiErrorCount > 30) e.dead = true;
          }
        } else {
          fallbackBossMove(e);
        }
      } else {
        if (e.kind === 'enemy') updateEnemyAI(e);

        e.y += (e.vy || 0) * FIELD_ENTITY_SPEED;

        if (e.kind === 'enemy') {
          e.x += e.vx || 0;

          if (e.x < W * 0.16 || e.x > W * 0.84) {
            e.vx = -(e.vx || 0.8);
          }
        }
      }

      if (e.barrierTimer > 0) e.barrierTimer--;
    }
  }

  function updateParticles(){
    for (const pt of state.particles) {
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.vy += 0.12;
      pt.life--;
    }

    for (const t of state.texts) {
      t.y -= 1.1;
      t.life--;
    }
  }

  function updateSkillState(){
    let bonusWide = 0;

    try {
      if (window.MobShotGameSkills && window.MobShotGameSkills.update) {
        window.MobShotGameSkills.update();
      }

      if (window.MobShotGameSkills && window.MobShotGameSkills.getWideBonus) {
        bonusWide = window.MobShotGameSkills.getWideBonus();
      }

      state.wide = state.baseWide + bonusWide;
    } catch (err) {
      console.error('Skill update error:', err);
    }
  }

  function update(){
    if (!running) return;

    frame++;
    scroll += SCROLL_SPEED;

    updateFlow();
    updateSkillState();

    try {
      if (window.MobShotCombat && window.MobShotCombat.shoot) {
        window.MobShotCombat.shoot(makeTools());
      }
    } catch (err) {
      console.error('shoot error:', err);
    }

    try {
      if (window.MobShotPetBattle && window.MobShotPetBattle.update) {
        window.MobShotPetBattle.update();
      }
    } catch (err) {
      console.error('pet update error:', err);
    }

    updatePlayer();
    updateEntities();

    try {
      if (window.MobShotCombat && window.MobShotCombat.updateBullets) {
        window.MobShotCombat.updateBullets(makeTools());
      }

      if (window.MobShotCombat && window.MobShotCombat.collideBullets) {
        window.MobShotCombat.collideBullets(makeTools());
      }

      if (window.MobShotCombat && window.MobShotCombat.collidePlayer) {
        window.MobShotCombat.collidePlayer(makeTools());
      }
    } catch (err) {
      console.error('combat error:', err);
      addText('COMBAT SAFE', state.player.x, state.player.y - 80, '#ff5b5b');
    }

    updateParticles();
    cleanup();
    updateHud();

    if (state.hp <= 0) {
      finishRun(false);
    }
  }

  function cleanup(){
    state.entities = state.entities.filter(e =>
      !e.dead &&
      e.y < H + 260 &&
      e.y > -360 &&
      e.x > -240 &&
      e.x < W + 240
    );

    state.bullets = state.bullets.filter(b =>
      !b.dead &&
      b.y > -90 &&
      b.y < H + 90
    );

    state.particles = state.particles.filter(p => p.life > 0);
    state.texts = state.texts.filter(t => t.life > 0);
  }

  function applyGate(gate){
    if (window.MobShotCombat && window.MobShotCombat.applyGate) {
      window.MobShotCombat.applyGate(gate, makeTools());
    }
  }

  function killEntity(e){
    if (window.MobShotGameEvents && window.MobShotGameEvents.onEntityKilled) {
      window.MobShotGameEvents.onEntityKilled(e, getCoreApi());
    }

    if (window.MobShotGameBossManager && window.MobShotGameBossManager.onEntityKilled) {
      window.MobShotGameBossManager.onEntityKilled(e, getCoreApi());
    }

    if (window.MobShotCombat && window.MobShotCombat.killEntity) {
      window.MobShotCombat.killEntity(e, makeTools());
    }
  }

  function commitStageClear(){
    const info = getCurrentStageInfo();

    if (window.MobShotStorage && window.MobShotStorage.recordStageClear) {
      window.MobShotStorage.recordStageClear(info.areaKey, info.stageNo);
    }

    if (window.MobShotMission && window.MobShotMission.onStageClear) {
      window.MobShotMission.onStageClear(info.areaKey, info.stageNo);
    }

    if (window.MobShotStorage && window.MobShotStorage.advanceStage) {
      window.MobShotStorage.advanceStage();
    }

    return info;
  }

  function finishRun(clear){
    if (runCommitted) return;

    pendingRankUp = null;

    const finishData =
      window.MobShotGameEvents &&
      window.MobShotGameEvents.beforeFinish
        ? window.MobShotGameEvents.beforeFinish(clear, getCoreApi())
        : null;

    runCommitted = true;
    running = false;

    let clearInfo = null;

    if (clear && (!finishData || !finishData.event)) {
      clearInfo = commitStageClear();
    }

    if (window.MobShotStorage) {
      window.MobShotStorage.addRunResult(state.score, state.coin);
    }

    if (window.MobShotMain && window.MobShotMain.refreshMainHud) {
      window.MobShotMain.refreshMainHud();
    }

    restoreBaseData();

    window.dispatchEvent(new CustomEvent('mobshot:saveUpdated'));

    if (resultTitle) {
      resultTitle.textContent = clear ? 'CLEAR!' : 'GAME OVER';
    }

    if (resultText) {
      if (finishData && finishData.text) {
        resultText.textContent = finishData.text;
      } else if (clear && clearInfo) {
        resultText.textContent = `${clearInfo.areaName} ${clearInfo.id} クリア！`;
      } else {
        resultText.textContent = 'ライフがなくなりました';
      }
    }

    if (resultScore) resultScore.textContent = state.score.toLocaleString();
    if (resultCoin) resultCoin.textContent = state.coin.toLocaleString();

    if (finishData && finishData.event) {
      if (resultRetryBtn) resultRetryBtn.style.display = 'none';

      if (resultHomeBtn) {
        resultHomeBtn.style.display = '';
        resultHomeBtn.textContent = 'メインへ戻る';
      }
    } else {
      if (resultRetryBtn) {
        resultRetryBtn.style.display = '';
        resultRetryBtn.textContent = clear ? 'NEXT STAGE' : 'もう一度';
      }

      if (resultHomeBtn) {
        resultHomeBtn.style.display = '';
        resultHomeBtn.textContent = 'メインへ戻る';
      }
    }

    if (resultPanel) resultPanel.classList.remove('hidden');

    if (pendingRankUp) {
      setTimeout(function(){
        showRankUpModal(pendingRankUp);
      }, 500);
    }
  }

  function testClearNow(){
    if (!running || runCommitted) return;

    addText('TEST CLEAR', state.player.x, state.player.y - 90, '#9dff73');
    finishRun(true);
  }

  function createTestClearButton(){
    const gameScreen = document.getElementById('gameScreen');
    if (!gameScreen) return;

    let btn = document.getElementById('testClearBtn');
    if (btn) return;

    btn = document.createElement('button');
    btn.id = 'testClearBtn';
    btn.type = 'button';
    btn.textContent = 'テストクリア';

    btn.style.position = 'absolute';
    btn.style.left = '96px';
    btn.style.bottom = 'calc(78px + env(safe-area-inset-bottom))';
    btn.style.zIndex = '27';
    btn.style.border = '0';
    btn.style.borderRadius = '999px';
    btn.style.background = 'linear-gradient(#9dff73,#26b63e)';
    btn.style.color = '#07370f';
    btn.style.border = '2px solid rgba(255,255,255,.45)';
    btn.style.padding = '9px 14px';
    btn.style.fontSize = '14px';
    btn.style.fontWeight = '1000';
    btn.style.boxShadow = '0 4px 0 rgba(0,0,0,.28)';

    btn.addEventListener('click', function(e){
      e.preventDefault();
      e.stopPropagation();
      testClearNow();
    }, { passive:false });

    btn.addEventListener('pointerup', function(e){
      e.preventDefault();
      e.stopPropagation();
      testClearNow();
    }, { passive:false });

    gameScreen.appendChild(btn);
  }

  function updateSkillHudImages(){
    if (!window.MobShotSkills || !window.MobShotSkills.getEquippedSkills) return;

    const equipped = window.MobShotSkills.getEquippedSkills();

    for (let i = 0; i < 3; i++) {
      const imgEl = document.getElementById(`skillSlotImg${i}`);
      const cdEl = document.getElementById(`skillCd${i}`);
      const ringEl = document.getElementById(`skillRing${i}`);
      const slotEl = document.getElementById(`skillSlot${i}`);
      const skill = equipped[i];

      if (imgEl) {
        if (skill && skill.image) {
          imgEl.src = skill.image;
          imgEl.style.display = 'block';
        } else {
          imgEl.removeAttribute('src');
          imgEl.style.display = 'none';
        }
      }

      if (cdEl) {
        cdEl.textContent = '';
        cdEl.classList.add('hidden');
      }

      if (ringEl) {
        ringEl.style.setProperty('--skill-rate', '100%');
      }

      if (slotEl) {
        slotEl.classList.toggle('ready', !!skill);
      }
    }
  }

  function goMainFromResult(){
    running = false;
    stopLoopOnly();

    resetEventMode();
    restoreBaseData();

    if (window.MobShotEvents && window.MobShotEvents.clearCurrentEvent) {
      window.MobShotEvents.clearCurrentEvent();
    }

    if (resultPanel) resultPanel.classList.add('hidden');

    const rankModal = document.getElementById('mobRankUpModal');
    if (rankModal) rankModal.classList.add('hidden');

    if (window.MobShotMain && window.MobShotMain.goMain) {
      window.MobShotMain.goMain();
      return;
    }

    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.remove('active');
    });

    const main =
      document.getElementById('mainScreen') ||
      document.getElementById('mainView');

    if (main) main.classList.add('active');
  }

  function bindResultButtons(){
    ['resultHomeBtn', 'gameBackBtn', 'backBtn', 'resultRetryBtn'].forEach(id => {
      const btn = document.getElementById(id);
      if (!btn || btn.__mobShotBound) return;

      btn.__mobShotBound = true;

      btn.addEventListener('click', function(e){
        e.preventDefault();
        e.stopPropagation();
        goMainFromResult();
      });

      btn.addEventListener('pointerup', function(e){
        e.preventDefault();
        e.stopPropagation();
        goMainFromResult();
      }, { passive:false });
    });
  }

  function updateHud(){
    injectHudStyle();

    if (
      window.MobShotGameEvents &&
      window.MobShotGameEvents.updateHud &&
      window.MobShotGameEvents.updateHud(getCoreApi())
    ) {
      return;
    }

    const info = getCurrentStageInfo();

    setHudDifficultyIcon(info.difficulty);

    if (hudStage) {
      hudStage.textContent = `${info.id}`;
    }

    if (hudScore) {
      hudScore.textContent = Math.floor(state.score).toLocaleString();
    }

    if (hudCoin) {
      hudCoin.textContent = Math.floor(state.coin).toLocaleString();
    }

    if (hudLife) {
      hudLife.textContent = Math.max(0, Math.ceil(state.hp));
    }
  }

  function addText(text, x, y, color){
    state.texts.push({ text, x, y, color, life: 48 });
  }

  function burst(x, y, color, n){
    for (let i = 0; i < n; i++) {
      state.particles.push({
        x,
        y,
        vx: rand(-4, 4),
        vy: rand(-5, 2),
        color,
        life: intRand(18, 34)
      });
    }
  }

  function draw(){
    try {
      if (window.MobShotRender && window.MobShotRender.drawAll) {
        window.MobShotRender.drawAll(makeRenderTools());
      }

      if (window.MobShotGameEvents && window.MobShotGameEvents.draw) {
        window.MobShotGameEvents.draw(ctx, getCoreApi());
      }

      if (window.MobShotGameSkills && window.MobShotGameSkills.draw) {
        window.MobShotGameSkills.draw(ctx);
      }
    } catch (err) {
      console.error('draw error:', err);
    }
  }

  function loop(){
    try {
      update();
      draw();
    } catch (err) {
      console.error('main loop error:', err);
      addText('SAFE MODE', W / 2, H * 0.5, '#ff5b5b');
    }

    if (running) {
      raf = requestAnimationFrame(loop);
    }
  }

  function getCoreApi(){
    return {
      canvas,
      ctx,
      D,
      flow,
      state,

      W,
      H,
      scroll,
      frame,
      running,
      runCommitted,

      hudStage,
      hudScore,
      hudCoin,
      hudLife,

      rand,
      intRand,
      pick,
      clamp,
      weightedPick,

      clone,
      restoreBaseData,
      getImage,
      getPlayerBaseY,
      getCurrentStageInfo,

      makeTools,
      makeRenderTools,

      setEventMode,
      resetEventMode,
      isEventMode,

      showBanner,
      addText,
      burst,
      applyGate,
      killEntity,
      finishRun,
      stopLoopOnly,
      goMainFromResult,
      showRankUpModal,

      getCollectionBonus(){
        return Object.assign({}, state.collectionBonus || {});
      },

      getScoreMultiplier(){
        return Math.max(1, Number(state.scoreMultiplier || 1));
      },

      getCoinMultiplier(){
        return Math.max(1, Number(state.coinMultiplier || 1));
      },

      setGateEndAt(value){
        state.gateEndAt = Number(value || 0);
      },

      getGateEndAt(){
        return state.gateEndAt;
      },

      setRunning(value){
        running = !!value;
      },

      isRunning(){
        return running;
      },

      isCommitted(){
        return runCommitted;
      }
    };
  }

  canvas.addEventListener('pointerdown', e => {
    if (isSkillInput(e)) return;

    state.player.targetX = e.clientX;
    state.player.targetY = getPlayerBaseY();
  });

  canvas.addEventListener('pointermove', e => {
    if (isSkillInput(e)) return;

    state.player.targetX = e.clientX;
    state.player.targetY = getPlayerBaseY();
  });

  window.addEventListener('resize', resize);

  window.addEventListener('mobshot:rankUp', function(e){
    pendingRankUp = e && e.detail ? e.detail : null;
  });

  window.addEventListener('DOMContentLoaded', function(){
    bindResultButtons();
    createTestClearButton();
    injectHudStyle();
    ensureRankUpModal();
  });

  bindResultButtons();
  createTestClearButton();
  injectHudStyle();
  ensureRankUpModal();

  window.MobShotGameCore = {
    killEntity,
    state
  };

  window.MobShotGameCoreApi = {
    get: getCoreApi
  };

  window.MobShotGame = {
    start,
    stop,
    showBanner,
    goMainFromResult,
    testClearNow,
    showRankUpModal
  };
})();
