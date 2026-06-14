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

  const SCROLL_SPEED = 1.15;
  const FIELD_ENTITY_SPEED = 0.72;
  const GOLD_STAGE_SECONDS = 120;

  let W = 0;
  let H = 0;
  let DPR = 1;
  let running = false;
  let raf = 0;
  let frame = 0;
  let scroll = 0;
  let runCommitted = false;
  let aiErrorCount = 0;

  const images = new Map();

  const state = {
    hp: 50,
    maxHp: 50,
    power: 1,
    range: 3,
    baseWide: 1,
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
    eventMode: {
      active: false,
      key: '',
      difficulty: null,
      endFrame: 0,
      nextChest: 0,
      nextBoss: 0,
      nextBonusEnemy: 0,
      bossCount: 0
    },
    entities: [],
    bullets: [],
    particles: [],
    texts: []
  };

  function getImage(src){
    if (!src) return null;

    if (!images.has(src)) {
      const image = new Image();
      image.src = src + '?v=20260614_gold_difficulty';
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

  function rand(a, b){
    return a + Math.random() * (b - a);
  }

  function intRand(a, b){
    return Math.floor(rand(a, b + 1));
  }

  function pick(arr){
    if (!arr || !arr.length) return null;
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function clamp(v, a, b){
    return Math.max(a, Math.min(b, v));
  }

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
      difficulty: stage.difficulty || 'EASY',
      isStrongBoss: !!stage.isStrongBoss,
      isLegend: !!stage.isLegend,
      isTest: !!stage.isTest
    };
  }

  function isGoldStageRun(){
    return !!(
      state.eventMode &&
      state.eventMode.active &&
      state.eventMode.key === 'gold'
    );
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
    return makeTools();
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
    aiErrorCount = 0;

    const shopBonus = getShopBonus();
    const equipBonus = getEquipBonus();
    const avatar = getEquippedAvatar();
    const record = getEquippedRecord();

    state.maxHp = D.player.maxHp + shopBonus.hp + equipBonus.hp;
    state.hp = state.maxHp;

    state.power = D.player.power + shopBonus.power + equipBonus.power;
    state.range = D.player.range + shopBonus.range;
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
    state.entities.length = 0;
    state.bullets.length = 0;
    state.particles.length = 0;
    state.texts.length = 0;

    state.eventMode.active = false;
    state.eventMode.key = '';
    state.eventMode.difficulty = null;
    state.eventMode.endFrame = 0;
    state.eventMode.nextChest = 0;
    state.eventMode.nextBoss = 0;
    state.eventMode.nextBonusEnemy = 0;
    state.eventMode.bossCount = 0;

    flow.reset();

    if (window.MobShotPetBattle && window.MobShotPetBattle.init) {
      window.MobShotPetBattle.init(state);
    }

    if (window.MobShotGameSkills && window.MobShotGameSkills.init) {
      window.MobShotGameSkills.init(state);
    }

    updateSkillHudImages();

    if (resultPanel) {
      resultPanel.classList.add('hidden');
    }

    if (resultRetryBtn) {
      resultRetryBtn.textContent = 'もう一度';
    }

    if (
      window.MobShotEvents &&
      window.MobShotEvents.isGoldStage &&
      window.MobShotEvents.isGoldStage()
    ) {
      startGoldStageMode();
      return;
    }

    const ev = flow.start();
    handleFlowEvent(ev);
  }

  function startGoldStageMode(){
    const diff =
      window.MobShotEvents &&
      window.MobShotEvents.getCurrentGoldDifficulty
        ? window.MobShotEvents.getCurrentGoldDifficulty()
        : {
            key: 'easy',
            name: 'イージー',
            clearCoin: 300,
            firstCoin: 3000,
            firstDiamond: 5,
            chestMul: 0.55,
            bossHpMul: 0.7,
            bossCoinMul: 0.7,
            showMidBoss: false
          };

    state.eventMode.active = true;
    state.eventMode.key = 'gold';
    state.eventMode.difficulty = diff;
    state.eventMode.endFrame = frame + GOLD_STAGE_SECONDS * 60;
    state.eventMode.nextChest = frame + 95;
    state.eventMode.nextBoss = frame + 70;
    state.eventMode.nextBonusEnemy = frame + 170;
    state.eventMode.bossCount = 0;

    showBanner(`GOLD STAGE ${diff.name}`);
    addText(`${diff.name} / 120秒`, W / 2, H * 0.28, '#ffcf5b');

    spawnGoldChestWave(1);
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

      if (ev.type === 'gateStart') {
        handleFlowEvent(flow.completeGate());
      } else if (ev.type === 'midBossStart') {
        handleFlowEvent(flow.completeMidBoss());
      } else if (ev.type === 'bossStart') {
        handleFlowEvent(flow.completeBoss());
      }
    }
  }

  function updateFlow(){
    if (isGoldStageRun()) {
      updateGoldStageMode();
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
          if (Math.random() < 0.42) {
            if (window.MobShotSpawn && window.MobShotSpawn.spawnChest) {
              window.MobShotSpawn.spawnChest(tools);
            }
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
    } catch (err) {
      console.error('updateFlow error:', err);
      addText('FLOW SAFE', W / 2, H * 0.22, '#ff5b5b');
    }
  }

  function updateGoldStageMode(){
    const remain = Math.max(0, state.eventMode.endFrame - frame);
    const diff = state.eventMode.difficulty || {};

    if (remain <= 0) {
      finishRun(true);
      return;
    }

    if (frame >= state.eventMode.nextChest) {
      const count = Math.random() < 0.22 ? 2 : 1;
      spawnGoldChestWave(count);
      state.eventMode.nextChest = frame + intRand(145, 220);
    }

    if (frame >= state.eventMode.nextBonusEnemy) {
      spawnGoldBonusEnemy();
      state.eventMode.nextBonusEnemy = frame + intRand(210, 310);
    }

    if (diff.showMidBoss && state.eventMode.bossCount > 0 && state.eventMode.bossCount % 3 === 0) {
      const midAlive = state.entities.some(e => !e.dead && e.kind === 'midBoss');

      if (!midAlive && Math.random() < 0.02) {
        spawnGoldMidBoss();
      }
    }

    const bossAlive = state.entities.some(e =>
      !e.dead &&
      e.kind === 'boss'
    );

    if (!bossAlive && frame >= state.eventMode.nextBoss) {
      spawnGoldBoss();
      state.eventMode.nextBoss = frame + 999999;
    }
  }

  function spawnGoldBoss(){
    if (!window.MobShotSpawn || !window.MobShotSpawn.spawnBoss) return;

    const tools = makeTools();
    const diff = state.eventMode.difficulty || {};

    window.MobShotSpawn.spawnBoss(tools);

    state.eventMode.bossCount++;

    state.entities.forEach(e => {
      if (e.kind !== 'boss') return;
      if (e.__goldStageBoss) return;

      e.__goldStageBoss = true;
      e.hp = Math.ceil(Number(e.hp || 1) * Number(diff.bossHpMul || 1));
      e.maxHp = e.hp;
      e.score = Math.ceil(Number(e.score || 0) * 0.55);
      e.coin = Math.ceil(Number(e.coin || 0) * Number(diff.bossCoinMul || 1));
    });

    showBanner(`GOLD BOSS ${state.eventMode.bossCount}`);
  }

  function spawnGoldMidBoss(){
    if (!window.MobShotSpawn || !window.MobShotSpawn.spawnMidBoss) return;

    const diff = state.eventMode.difficulty || {};

    window.MobShotSpawn.spawnMidBoss(makeTools());

    state.entities.forEach(e => {
      if (e.kind !== 'midBoss') return;
      if (e.__goldStageMidBoss) return;

      e.__goldStageMidBoss = true;
      e.hp = Math.ceil(Number(e.hp || 1) * Number(diff.bossHpMul || 1));
      e.maxHp = e.hp;
      e.score = Math.ceil(Number(e.score || 0) * 0.45);
      e.coin = Math.ceil(Number(e.coin || 0) * Number(diff.bossCoinMul || 1));
    });

    showBanner('GOLD MID BOSS');
  }

  function spawnGoldChestWave(count){
    for (let i = 0; i < count; i++) {
      spawnGoldChest(i);
    }
  }

  function spawnGoldChest(i){
    const diff = state.eventMode.difficulty || {};
    const chestMul = Number(diff.chestMul || 1);
    const gold = Math.random() < 0.24;

    const def = gold
      ? { name:'金の宝箱', image:'gimi/takagol.png', hp:10, score:60, coinMin:18, coinMax:42 }
      : { name:'銀の宝箱', image:'gimi/takagin.png', hp:6, score:30, coinMin:8, coinMax:22 };

    state.entities.push({
      kind: 'chest',
      name: def.name,
      image: def.image,
      x: rand(W * 0.18, W * 0.82),
      y: -80 - i * 58,
      vx: 0,
      vy: 2.05,
      w: 68,
      h: 62,
      hp: Math.ceil(def.hp * (0.9 + chestMul * 0.25)),
      maxHp: Math.ceil(def.hp * (0.9 + chestMul * 0.25)),
      score: def.score,
      coinMin: Math.ceil(def.coinMin * chestMul),
      coinMax: Math.ceil(def.coinMax * chestMul),
      dead: false,
      bob: 0,
      __goldStageChest: true
    });
  }

  function spawnGoldBonusEnemy(){
    if (!window.MobShotSpawn || !window.MobShotSpawn.spawnEnemy) return;

    const diff = state.eventMode.difficulty || {};

    window.MobShotSpawn.spawnEnemy(makeTools());

    state.entities.forEach(e => {
      if (e.kind !== 'enemy') return;
      if (e.__goldStageEnemy) return;

      e.__goldStageEnemy = true;
      e.hp = Math.ceil(Number(e.hp || 1) * 0.85);
      e.maxHp = e.hp;
      e.coinMin = Math.ceil(Number(e.coinMin || 1) * Number(diff.chestMul || 1));
      e.coinMax = Math.ceil(Number(e.coinMax || 3) * Number(diff.chestMul || 1));
    });
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

    if (e.aiType === 'sway') {
      e.x += Math.sin(e.aiTimer * 0.08) * 1.6;
    }

    if (e.aiType === 'fastSide') {
      e.x += Math.sin(e.aiTimer * 0.16) * 2.2;
    }

    if (e.aiType === 'shortDash') {
      e.dashCd = Number(e.dashCd || 90) - 1;

      if (e.dashCd <= 0) {
        e.vy += 0.8;
        e.dashCd = 110;
      }
    }

    if (e.aiType === 'teleport') {
      e.teleportCd = Number(e.teleportCd || 120) - 1;

      if (e.teleportCd <= 0) {
        e.x = rand(W * 0.18, W * 0.82);
        e.teleportCd = 140;
        addText('瞬間移動', e.x, e.y - 30, '#b78cff');
      }
    }

    if (e.aiType === 'enlargeLowHp' && !e.enlarged && e.hp <= e.maxHp * 0.45) {
      e.enlarged = true;
      e.r = Math.ceil((e.r || 32) * 1.25);
      e.hp = Math.ceil(e.hp * 1.2);
      addText('巨大化！', e.x, e.y - 30, '#b78cff');
    }

    if (e.canShoot) {
      const canShootFromFront =
        e.y > 0 &&
        e.y < state.player.y - 110;

      if (!canShootFromFront) {
        return;
      }

      e.shootCd = Number(e.shootCd || e.baseShootCd || 190) - 1;

      if (e.shootCd <= 0) {
        enemyZakoShot(e);
        e.shootCd = Number(e.baseShootCd || 190);
      }
    }
  }

  function enemyZakoShot(e){
    const count = e.burstShot ? 2 : e.aiType === 'wideShot' ? 3 : 1;
    const color = e.bulletColor || '#ff4aff';
    const r = e.bulletLarge ? 14 : 10;
    const hp = e.bulletLarge ? 10 : 6;

    for (let i = 0; i < count; i++) {
      const dx = state.player.x - e.x;
      const dy = state.player.y - e.y;

      if (dy <= 0) continue;

      const base = Math.atan2(dy, dx);
      const angle = base + (i - (count - 1) / 2) * 0.25;
      const speed = e.burstShot ? 2.8 : 2.55;

      state.entities.push({
        kind: 'enemyBullet',
        x: e.x,
        y: e.y + 24,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r,
        dmg: Math.ceil(r * 0.9),
        hp,
        maxHp: hp,
        breakable: true,
        dead: false,
        bob: 0,
        color,
        life: 360
      });
    }
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
    const bossTools = makeBossTools();
    const timeStopped =
      window.MobShotGameSkills &&
      window.MobShotGameSkills.isTimeStopped &&
      window.MobShotGameSkills.isTimeStopped();

    for (const e of state.entities) {
      if (e.dead) continue;

      if (
        e.kind === 'enemy' ||
        e.kind === 'midBoss' ||
        e.kind === 'boss'
      ) {
        e.bob = Number(e.bob || 0) + 0.06;
      }

      if (timeStopped && (
        e.kind === 'enemy' ||
        e.kind === 'midBoss' ||
        e.kind === 'boss' ||
        e.kind === 'enemyBullet'
      )) {
        continue;
      }

      if (e.kind === 'midBoss') {
        if (window.MobShotBoss && window.MobShotBoss.updateMidBoss) {
          try {
            window.MobShotBoss.updateMidBoss(e, bossTools);
          } catch (err) {
            aiErrorCount++;
            console.error('中ボスAIエラー:', e.name, err);

            if (!e.__aiErrorShown) {
              e.__aiErrorShown = true;
              addText('AI SAFE', e.x, e.y - 60, '#ff5b5b');
            }

            fallbackBossMove(e);

            if (aiErrorCount > 20) {
              e.dead = true;
            }
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

            if (!e.__aiErrorShown) {
              e.__aiErrorShown = true;
              addText('AI SAFE', e.x, e.y - 80, '#ff5b5b');
            }

            fallbackBossMove(e);

            if (aiErrorCount > 30) {
              e.dead = true;
            }
          }
        } else {
          fallbackBossMove(e);
        }
      } else {
        if (e.kind === 'enemy') {
          updateEnemyAI(e);
        }

        e.y += (e.vy || 0) * FIELD_ENTITY_SPEED;

        if (e.kind === 'enemy') {
          e.x += e.vx || 0;

          if (e.x < W * 0.16 || e.x > W * 0.84) {
            e.vx = -(e.vx || 0.8);
          }
        }
      }

      if (e.barrierTimer > 0) {
        e.barrierTimer--;
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

    state.particles = state.particles.filter(p =>
      p.life > 0
    );

    state.texts = state.texts.filter(t =>
      t.life > 0
    );
  }

  function applyGate(gate){
    if (window.MobShotCombat && window.MobShotCombat.applyGate) {
      window.MobShotCombat.applyGate(gate, makeTools());
    }
  }

  function killEntity(e){
    if (isGoldStageRun() && e) {
      if (e.kind === 'boss') {
        state.eventMode.nextBoss = frame + 95;
        if (Math.random() < 0.7) {
          spawnGoldChestWave(1);
        }
      }

      if (e.kind === 'midBoss') {
        if (Math.random() < 0.6) {
          spawnGoldChestWave(1);
        }
      }
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

  function applyGoldStageClearReward(){
    const diff = state.eventMode.difficulty || {};
    const key = diff.key || 'easy';

    const cleared =
      window.MobShotEvents &&
      window.MobShotEvents.hasGoldCleared &&
      window.MobShotEvents.hasGoldCleared(key);

    const coinReward = cleared
      ? Number(diff.clearCoin || 300)
      : Number(diff.firstCoin || 3000);

    const diamondReward = cleared
      ? 0
      : Number(diff.firstDiamond || 0);

    state.coin += coinReward;

    if (diamondReward > 0) {
      try {
        const save = window.MobShotStorage && window.MobShotStorage.load
          ? window.MobShotStorage.load()
          : JSON.parse(localStorage.getItem('mobshot_split_v1')) || {};

        save.diamond = Number(save.diamond || 0) + diamondReward;

        if (window.MobShotStorage && window.MobShotStorage.save) {
          window.MobShotStorage.save(save);
        } else {
          localStorage.setItem('mobshot_split_v1', JSON.stringify(save));
        }
      } catch(e) {}
    }

    if (window.MobShotEvents && window.MobShotEvents.markGoldCleared) {
      window.MobShotEvents.markGoldCleared(key);
    }

    return {
      coin: coinReward,
      diamond: diamondReward,
      first: !cleared
    };
  }

  function finishRun(clear){
    if (runCommitted) return;

    const wasGold = isGoldStageRun();
    let goldReward = null;

    runCommitted = true;
    running = false;

    let clearInfo = null;

    if (clear && wasGold) {
      goldReward = applyGoldStageClearReward();
    }

    if (clear && !wasGold) {
      clearInfo = commitStageClear();
    }

    if (window.MobShotStorage) {
      window.MobShotStorage.addRunResult(state.score, state.coin);
    }

    if (window.MobShotMain && window.MobShotMain.refreshMainHud) {
      window.MobShotMain.refreshMainHud();
    }

    if (wasGold && window.MobShotEvents && window.MobShotEvents.clearCurrentEvent) {
      window.MobShotEvents.clearCurrentEvent();
    }

    window.dispatchEvent(new CustomEvent('mobshot:saveUpdated'));

    if (resultTitle) {
      resultTitle.textContent = clear ? 'CLEAR!' : 'GAME OVER';
    }

    if (resultText) {
      if (wasGold && clear) {
        const diff = state.eventMode.difficulty || {};
        const rewardText = goldReward
          ? `報酬 +${goldReward.coin.toLocaleString()} COIN${goldReward.diamond ? ` / +${goldReward.diamond} DIAMOND` : ''}`
          : '';

        resultText.textContent = `GOLD STAGE ${diff.name || ''} 完了！ ${rewardText}`;
      } else if (wasGold && !clear) {
        resultText.textContent = 'GOLD STAGE 失敗';
      } else if (clear && clearInfo) {
        resultText.textContent = `${clearInfo.areaName} ${clearInfo.id} クリア！`;
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
      resultRetryBtn.textContent = wasGold ? 'メインへ' : clear ? 'NEXT STAGE' : 'もう一度';
    }

    if (resultPanel) {
      resultPanel.classList.remove('hidden');
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

    if (state.eventMode && state.eventMode.active) {
      state.eventMode.active = false;
    }

    if (window.MobShotEvents && window.MobShotEvents.clearCurrentEvent) {
      window.MobShotEvents.clearCurrentEvent();
    }

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
    const info = getCurrentStageInfo();

    if (hudStage) {
      if (isGoldStageRun()) {
        const remain = Math.max(0, Math.ceil((state.eventMode.endFrame - frame) / 60));
        const diff = state.eventMode.difficulty || {};
        hudStage.textContent = `GOLD ${diff.name || ''} ${remain}`;
      } else {
        hudStage.textContent = `${info.id}`;
      }
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
    try {
      if (window.MobShotRender && window.MobShotRender.drawAll) {
        window.MobShotRender.drawAll(makeRenderTools());
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

  window.addEventListener('DOMContentLoaded', function(){
    bindResultButtons();
    createTestClearButton();
  });

  bindResultButtons();
  createTestClearButton();

  window.MobShotGameCore = {
    killEntity,
    state
  };

  window.MobShotGame = {
    start,
    stop,
    showBanner,
    goMainFromResult,
    testClearNow
  };
})();
