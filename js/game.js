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

  let W = 0;
  let H = 0;
  let DPR = 1;
  let running = false;
  let raf = 0;
  let frame = 0;
  let scroll = 0;
  let runCommitted = false;
  let clearedStageInfo = null;

  const images = new Map();

  const state = {
    hp: 50,
    maxHp: 50,
    power: 1,
    range: 3,
    wide: 1,
    attackSpeed: 1,
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
    entities: [],
    bullets: [],
    particles: [],
    texts: []
  };

  function getImage(src){
    if (!src) return null;

    if (!images.has(src)) {
      const image = new Image();
      image.src = src + '?v=20260607_stage_progress';
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

  function rand(a, b){
    return a + Math.random() * (b - a);
  }

  function intRand(a, b){
    return Math.floor(rand(a, b + 1));
  }

  function pick(arr){
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function clamp(v, a, b){
    return Math.max(a, Math.min(b, v));
  }

  function weightedPick(list){
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

    return {
      power: 0,
      range: 0,
      rapid: 0,
      hp: 0
    };
  }

  function getEquipBonus(){
    if (window.MobShotEquip && window.MobShotEquip.getEquipmentBonus) {
      return window.MobShotEquip.getEquipmentBonus();
    }

    return {
      power: 0,
      rapid: 0,
      hp: 0
    };
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
      areaKey: stage.areaKey || 'grass',
      areaName: stage.areaName || '草原',
      areaNo: Number(stage.areaNo || 1),
      stageNo: Number(stage.stageNo || 1),
      id: stage.id || '1-1',
      difficulty: stage.difficulty || 'EASY',
      isStrongBoss: !!stage.isStrongBoss
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
      frame: function(){
        return frame;
      },
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

  function makeBossTools(){
    return {
      state,
      W,
      H,
      rand,
      clamp,
      addText
    };
  }

  function makeRenderTools(){
    return {
      ctx,
      state,
      D,
      W,
      H,
      scroll,
      getImage
    };
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

  function resetRun(){
    frame = 0;
    scroll = 0;
    runCommitted = false;
    clearedStageInfo = null;

    const shopBonus = getShopBonus();
    const equipBonus = getEquipBonus();
    const avatar = getEquippedAvatar();
    const record = getEquippedRecord();

    state.maxHp = D.player.maxHp + shopBonus.hp + equipBonus.hp;
    state.hp = state.maxHp;

    state.power = D.player.power + shopBonus.power + equipBonus.power;
    state.range = D.player.range + shopBonus.range;
    state.wide = D.player.wide;
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
    state.entities.length = 0;
    state.bullets.length = 0;
    state.particles.length = 0;
    state.texts.length = 0;

    flow.reset();

    if (window.MobShotPetBattle && window.MobShotPetBattle.init) {
      window.MobShotPetBattle.init(state);
    }

    if (resultPanel) {
      resultPanel.classList.add('hidden');
    }

    if (resultRetryBtn) {
      resultRetryBtn.textContent = 'もう一度';
    }

    const ev = flow.start();
    handleFlowEvent(ev);
  }

  function start(){
    resize();
    stopLoopOnly();
    running = true;
    resetRun();
    loop();
  }

  function stopLoopOnly(){
    if (raf) {
      cancelAnimationFrame(raf);
    }

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

    if (ev.type === 'areaStart') {
      state.areaSpawn.nextEnemy = frame + 40;
      state.areaSpawn.nextGimmick = frame + 80;
      state.areaSpawn.nextChest = frame + 150;
      state.areaSpawn.endAt = frame + 430;
    }

    if (ev.type === 'gateStart') {
      window.MobShotSpawn.spawnGatePair(tools);
      state.gateEndAt = frame + 280;
    }

    if (ev.type === 'midBossStart') {
      window.MobShotSpawn.spawnMidBoss(tools);
    }

    if (ev.type === 'bossStart') {
      window.MobShotSpawn.spawnBoss(tools);
    }

    if (ev.type === 'clear') {
      finishRun(true);
    }
  }

  function updateFlow(){
    flow.update();
    const snap = flow.snapshot();
    const tools = makeTools();

    if (snap.phase === 'area') {
      if (frame >= state.areaSpawn.nextEnemy) {
        window.MobShotSpawn.spawnEnemy(tools);
        state.areaSpawn.nextEnemy = frame + intRand(90, 145);
      }

      if (frame >= state.areaSpawn.nextGimmick) {
        window.MobShotSpawn.spawnGimmick(tools);
        state.areaSpawn.nextGimmick = frame + intRand(115, 175);
      }

      if (frame >= state.areaSpawn.nextChest) {
        if (Math.random() < 0.42) {
          window.MobShotSpawn.spawnChest(tools);
        }

        state.areaSpawn.nextChest = frame + intRand(230, 350);
      }

      if (frame >= state.areaSpawn.endAt) {
        handleFlowEvent(flow.completeArea());
      }
    }

    if (snap.phase === 'gate') {
      const gatesAlive = state.entities.some(e =>
        e.kind === 'gate' &&
        !e.dead
      );

      if (!gatesAlive || frame >= state.gateEndAt) {
        state.entities.forEach(e => {
          if (e.kind === 'gate') {
            e.dead = true;
          }
        });

        handleFlowEvent(flow.completeGate());
      }
    }

    if (snap.phase === 'midBoss') {
      const alive = state.entities.some(e =>
        e.kind === 'midBoss' &&
        !e.dead
      );

      if (!alive && snap.phaseFrame > 60) {
        handleFlowEvent(flow.completeMidBoss());
      }
    }

    if (snap.phase === 'boss') {
      const alive = state.entities.some(e =>
        e.kind === 'boss' &&
        !e.dead
      );

      if (!alive && snap.phaseFrame > 60) {
        handleFlowEvent(flow.completeBoss());
      }
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

  function updateEntities(){
    const bossTools = makeBossTools();

    for (const e of state.entities) {
      if (e.dead) continue;

      if (
        e.kind === 'enemy' ||
        e.kind === 'midBoss' ||
        e.kind === 'boss'
      ) {
        e.bob += 0.06;
      }

      if (e.kind === 'midBoss') {
        if (window.MobShotBoss && window.MobShotBoss.updateMidBoss) {
          window.MobShotBoss.updateMidBoss(e, bossTools);
        }
      } else if (e.kind === 'boss') {
        if (window.MobShotBoss && window.MobShotBoss.updateBoss) {
          window.MobShotBoss.updateBoss(e, bossTools);
        }
      } else {
        e.y += e.vy;

        if (e.kind === 'enemy') {
          e.x += e.vx || 0;

          if (e.x < W * 0.16 || e.x > W * 0.84) {
            e.vx *= -1;
          }
        }
      }
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

  function update(){
    if (!running) return;

    frame++;
    scroll += 2.2;

    updateFlow();

    window.MobShotCombat.shoot(makeTools());

    if (window.MobShotPetBattle && window.MobShotPetBattle.update) {
      window.MobShotPetBattle.update();
    }

    updatePlayer();
    updateEntities();

    window.MobShotCombat.updateBullets(makeTools());
    window.MobShotCombat.collideBullets(makeTools());
    window.MobShotCombat.collidePlayer(makeTools());

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
      e.y < H + 240 &&
      e.y > -330 &&
      e.x > -210 &&
      e.x < W + 210
    );

    state.bullets = state.bullets.filter(b =>
      !b.dead &&
      b.y > -80
    );

    state.particles = state.particles.filter(p =>
      p.life > 0
    );

    state.texts = state.texts.filter(t =>
      t.life > 0
    );
  }

  function applyGate(gate){
    window.MobShotCombat.applyGate(gate, makeTools());
  }

  function killEntity(e){
    window.MobShotCombat.killEntity(e, makeTools());
  }

  function commitStageClear(){
    const info = getCurrentStageInfo();

    clearedStageInfo = info;

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

    runCommitted = true;
    running = false;

    let clearInfo = null;

    if (clear) {
      clearInfo = commitStageClear();
    }

    if (window.MobShotStorage) {
      window.MobShotStorage.addRunResult(state.score, state.coin);
    }

    if (window.MobShotMain && window.MobShotMain.refreshMainHud) {
      window.MobShotMain.refreshMainHud();
    }

    window.dispatchEvent(new CustomEvent('mobshot:saveUpdated'));

    if (resultTitle) {
      resultTitle.textContent = clear ? 'CLEAR!' : 'GAME OVER';
    }

    if (resultText) {
      if (clear && clearInfo) {
        resultText.textContent =
          `${clearInfo.areaName} ${clearInfo.id} クリア！`;
      } else {
        resultText.textContent = 'ライフがなくなりました';
      }
    }

    if (resultScore) {
      resultScore.textContent = state.score.toLocaleString();
    }

    if (resultCoin) {
      resultCoin.textContent = state.coin.toLocaleString();
    }

    if (resultRetryBtn) {
      resultRetryBtn.textContent = clear ? 'NEXT STAGE' : 'もう一度';
    }

    if (resultPanel) {
      resultPanel.classList.remove('hidden');
    }
  }

  function goMainFromResult(){
    running = false;
    stopLoopOnly();

    if (resultPanel) {
      resultPanel.classList.add('hidden');
    }

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

    if (main) {
      main.classList.add('active');
    }
  }

  function bindResultButtons(){
    ['resultHomeBtn', 'gameBackBtn', 'backBtn'].forEach(id => {
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
    const info = getCurrentStageInfo();

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
    state.texts.push({
      text,
      x,
      y,
      color,
      life: 48
    });
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
    if (window.MobShotRender && window.MobShotRender.drawAll) {
      window.MobShotRender.drawAll(makeRenderTools());
    }
  }

  function loop(){
    update();
    draw();

    if (running) {
      raf = requestAnimationFrame(loop);
    }
  }

  canvas.addEventListener('pointerdown', e => {
    state.player.targetX = e.clientX;
    state.player.targetY = getPlayerBaseY();
  });

  canvas.addEventListener('pointermove', e => {
    state.player.targetX = e.clientX;
    state.player.targetY = getPlayerBaseY();
  });

  window.addEventListener('resize', resize);
  window.addEventListener('DOMContentLoaded', bindResultButtons);

  bindResultButtons();

  window.MobShotGameCore = {
    killEntity,
    state
  };

  window.MobShotGame = {
    start,
    stop,
    showBanner,
    goMainFromResult
  };
})();
