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

  let W = 0;
  let H = 0;
  let DPR = 1;
  let running = false;
  let raf = 0;
  let frame = 0;
  let scroll = 0;
  let runCommitted = false;

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

  function img(src) {
    if (!src) return null;

    if (!images.has(src)) {
      const image = new Image();
      image.src = src + '?v=20260606_shop_equip';
      image.onerror = function(){
        console.warn('画像が読み込めません:', src);
      };
      images.set(src, image);
    }

    return images.get(src);
  }

  function imageReady(image) {
    return image && image.complete && image.naturalWidth > 0 && image.naturalHeight > 0;
  }

  function getPlayerBaseY() {
    return Math.max(H * 0.58, H - 148);
  }

  function rand(a, b) {
    return a + Math.random() * (b - a);
  }

  function intRand(a, b) {
    return Math.floor(rand(a, b + 1));
  }

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function clamp(v, a, b) {
    return Math.max(a, Math.min(b, v));
  }

  function weightedPick(list) {
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

  function resize() {
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

  function resetRun() {
    frame = 0;
    scroll = 0;
    runCommitted = false;

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

    const ev = flow.start();
    handleFlowEvent(ev);
  }

  function start() {
    resize();
    stopLoopOnly();
    running = true;
    resetRun();
    loop();
  }

  function stopLoopOnly() {
    if (raf) {
      cancelAnimationFrame(raf);
    }
    raf = 0;
  }

  function stop() {
    running = false;
    stopLoopOnly();
  }

  function showBanner(text) {
    if (!phaseBanner) return;

    phaseBanner.textContent = text;
    phaseBanner.classList.remove('show');
    void phaseBanner.offsetWidth;
    phaseBanner.classList.add('show');
  }

  function handleFlowEvent(ev) {
    if (!ev) return;

    showBanner(ev.text);

    if (ev.type === 'areaStart') {
      state.areaSpawn.nextEnemy = frame + 40;
      state.areaSpawn.nextGimmick = frame + 80;
      state.areaSpawn.nextChest = frame + 150;
      state.areaSpawn.endAt = frame + 430;
    }

    if (ev.type === 'gateStart') {
      spawnGatePair();
      state.gateEndAt = frame + 280;
    }

    if (ev.type === 'midBossStart') {
      spawnMidBoss();
    }

    if (ev.type === 'bossStart') {
      spawnBoss();
    }

    if (ev.type === 'clear') {
      finishRun(true);
    }
  }

  function spawnEnemy() {
    const def = pick(D.enemies.zako);
    const scale = 1 + flow.area * 0.08;

    state.entities.push({
      kind: 'enemy',
      name: def.name,
      image: def.image,
      x: rand(W * 0.18, W * 0.82),
      y: -78,
      vx: rand(-0.85, 0.85),
      vy: 2.15 + flow.area * 0.08,
      r: def.name === 'モブロック' ? 34 : 31,
      hp: Math.ceil(def.hp * scale),
      maxHp: Math.ceil(def.hp * scale),
      score: def.score,
      coinMin: def.coinMin,
      coinMax: def.coinMax,
      dead: false,
      bob: rand(0, Math.PI * 2)
    });
  }

  function spawnGimmick() {
    const def = pick(D.gimmicks);
    const scale = 1 + flow.area * 0.1;

    state.entities.push({
      kind: 'gimmick',
      name: def.name,
      image: def.image,
      x: rand(W * 0.18, W * 0.82),
      y: -80,
      vx: 0,
      vy: 2.05,
      w: 82,
      h: 82,
      hp: Math.ceil(def.hp * scale),
      maxHp: Math.ceil(def.hp * scale),
      score: def.score,
      coinMin: def.coinMin,
      coinMax: def.coinMax,
      dead: false,
      bob: 0
    });
  }

  function spawnChest() {
    const def = pick(D.chests);

    state.entities.push({
      kind: 'chest',
      name: def.name,
      image: def.image,
      x: rand(W * 0.2, W * 0.8),
      y: -76,
      vx: 0,
      vy: 2.0,
      w: 64,
      h: 58,
      hp: def.hp,
      maxHp: def.hp,
      score: def.score,
      coinMin: def.coinMin,
      coinMax: def.coinMax,
      dead: false,
      bob: 0
    });
  }

  function spawnGatePair() {
    let pool;

    if (flow.gate < 7) {
      pool = D.gates.filter(g =>
        g.type !== 'wide' &&
        g.type !== 'skillmax'
      );
    } else {
      pool = D.gates.map(g => {
        if (g.type === 'wide') {
          return Object.assign({}, g, { weight: 0.05 });
        }

        if (g.type === 'skillmax') {
          return Object.assign({}, g, { weight: 0.02 });
        }

        return g;
      });
    }

    pool = pool.filter(g => !g.minRank || g.minRank <= 1);

    const a = weightedPick(pool);
    let b = weightedPick(pool);
    let guard = 0;

    while (b.type === a.type && guard < 20) {
      b = weightedPick(pool);
      guard++;
    }

    const pair = `gate-${frame}-${Math.random()}`;

    state.entities.push(makeGate(a, W * 0.31, pair));
    state.entities.push(makeGate(b, W * 0.69, pair));
  }

  function makeGate(def, x, pair) {
    return {
      kind: 'gate',
      name: def.label,
      image: def.image,
      type: def.type,
      value: def.value,
      color: def.color,
      x,
      y: -86,
      w: 116,
      h: 116,
      vy: 2.25,
      pair,
      dead: false,
      used: false,
      bob: 0
    };
  }

  function spawnMidBoss() {
    const def = pick(D.enemies.midBoss);
    const hp = Math.ceil(def.hp * (flow.midBoss === 2 ? 1.35 : 1));

    state.entities.push({
      kind: 'midBoss',
      name: def.name,
      image: def.image,
      x: W / 2,
      y: -150,
      baseY: H * 0.25,
      targetY: H * 0.25,
      vx: 1.45,
      vy: 2.35,
      r: 64,
      hp,
      maxHp: hp,
      score: def.score,
      coin: def.coin,
      dead: false,
      shootCd: 80,
      attackCd: 120,
      diveMode: false,
      diveReturn: false,
      diveVx: 0,
      diveVy: 0,
      contactDmg: 13,
      hitPlayerCd: 0,
      bob: 0
    });
  }

  function spawnBoss() {
    const def = D.enemies.boss;

    state.entities.push({
      kind: 'boss',
      name: def.name,
      image: def.image,
      x: W / 2,
      y: -240,
      baseY: H * 0.21,
      targetY: H * 0.21,
      vx: 1.55,
      vy: 1.6,
      r: 106,
      hp: def.hp,
      maxHp: def.hp,
      score: def.score,
      coin: def.coin,
      dead: false,
      shootCd: 50,
      attackCd: 95,
      attackStep: 0,
      contactDmg: 18,
      bob: 0
    });
  }

  function applyGate(gate) {
    if (gate.type === 'power') {
      state.power += gate.value;
    }

    if (gate.type === 'range') {
      state.range += gate.value;
    }

    if (gate.type === 'rapid') {
      state.attackSpeed += 0.25 * gate.value;
    }

    if (gate.type === 'life') {
      state.hp = Math.min(state.maxHp, state.hp + gate.value);
    }

    if (gate.type === 'wide') {
      state.wide += gate.value;
    }

    addText(gate.name, state.player.x, state.player.y - 70, gate.color);
    burst(gate.x, gate.y, gate.color, 24);

    state.entities.forEach(e => {
      if (e.kind === 'gate' && e.pair === gate.pair) {
        e.dead = true;
      }
    });
  }

  function shoot() {
    state.shootCd--;

    if (state.shootCd > 0) return;

    state.shootCd = Math.max(7, Math.floor(22 / Math.max(0.5, state.attackSpeed)));

    const count = Math.max(1, state.wide);
    const maxTravel = 150 + state.range * 45;

    for (let i = 0; i < count; i++) {
      const offset = (i - (count - 1) / 2) * 26;

      state.bullets.push({
        x: state.player.x + offset,
        y: state.player.y - 30,
        startY: state.player.y - 30,
        vy: -8.4,
        r: 7,
        maxTravel,
        dmg: state.power,
        dead: false
      });
    }
  }

  function updateFlow() {
    flow.update();
    const snap = flow.snapshot();

    if (snap.phase === 'area') {
      if (frame >= state.areaSpawn.nextEnemy) {
        spawnEnemy();
        state.areaSpawn.nextEnemy = frame + intRand(90, 145);
      }

      if (frame >= state.areaSpawn.nextGimmick) {
        spawnGimmick();
        state.areaSpawn.nextGimmick = frame + intRand(115, 175);
      }

      if (frame >= state.areaSpawn.nextChest) {
        if (Math.random() < 0.42) {
          spawnChest();
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

  function update() {
    if (!running) return;

    frame++;
    scroll += 2.2;

    updateFlow();
    shoot();

    if (window.MobShotPetBattle && window.MobShotPetBattle.update) {
      window.MobShotPetBattle.update();
    }

    const p = state.player;

    p.targetY = getPlayerBaseY();
    p.x += (p.targetX - p.x) * 0.19;
    p.y += (p.targetY - p.y) * 0.20;
    p.x = clamp(p.x, W * 0.14, W * 0.86);
    p.y = getPlayerBaseY();

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
        updateMidBoss(e);
      } else if (e.kind === 'boss') {
        updateBoss(e);
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

    for (const b of state.bullets) {
      b.y += b.vy;

      if (b.startY - b.y >= b.maxTravel) {
        b.dead = true;
      }
    }

    collideBullets();
    collidePlayer();

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

    cleanup();
    updateHud();

    if (state.hp <= 0) {
      finishRun(false);
    }
  }

  function updateMidBoss(e) {
    if (e.y < e.targetY && !e.diveMode) {
      e.y += e.vy;
      return;
    }

    if (e.hitPlayerCd > 0) {
      e.hitPlayerCd--;
    }

    if (e.diveMode) {
      e.x += e.diveVx;
      e.y += e.diveVy;

      if (e.y > H + 90) {
        e.diveMode = false;
        e.diveReturn = true;
        e.x = clamp(e.x, W * 0.2, W * 0.8);
        e.y = -110;
        e.targetY = e.baseY;
        e.vx = rand(1.1, 1.7) * (Math.random() < 0.5 ? -1 : 1);
        e.attackCd = 95;
      }

      return;
    }

    if (e.diveReturn) {
      e.y += e.vy;

      if (e.y >= e.baseY) {
        e.y = e.baseY;
        e.diveReturn = false;
      }

      return;
    }

    e.x += e.vx;

    if (e.x < W * 0.18 || e.x > W * 0.82) {
      e.vx *= -1;
    }

    e.shootCd--;
    e.attackCd--;

    if (e.shootCd <= 0) {
      e.shootCd = 76;
      enemyShot(e);
    }

    if (e.attackCd <= 0) {
      startMidBossDive(e);
    }
  }

  function startMidBossDive(e) {
    const dx = state.player.x - e.x;
    const dy = state.player.y - e.y;
    const len = Math.max(1, Math.sqrt(dx * dx + dy * dy));
    const speed = 6.4;

    e.diveMode = true;
    e.diveVx = dx / len * speed;
    e.diveVy = dy / len * speed;
    addText('突進！', e.x, e.y - 54, '#ffcf5b');
  }

  function updateBoss(e) {
    if (e.y < e.targetY) {
      e.y += e.vy;
      return;
    }

    e.x += e.vx;

    if (e.x < W * 0.18 || e.x > W * 0.82) {
      e.vx *= -1;
    }

    e.shootCd--;
    e.attackCd--;

    if (e.shootCd <= 0) {
      e.shootCd = 48;
      bossFanShot(e);
    }

    if (e.attackCd <= 0) {
      e.attackStep++;
      e.attackCd = 88;

      if (e.attackStep % 3 === 1) {
        bossWideRain(e);
      } else if (e.attackStep % 3 === 2) {
        bossAimBurst(e);
      } else {
        bossCrossShot(e);
      }
    }
  }

  function enemyShot(e) {
    const dx = state.player.x - e.x;
    const dy = state.player.y - e.y;
    const base = Math.atan2(dy, dx);

    state.entities.push({
      kind: 'enemyBullet',
      x: e.x,
      y: e.y + 30,
      vx: Math.cos(base) * 3.8,
      vy: Math.sin(base) * 3.8,
      r: 8,
      dmg: 9,
      dead: false,
      bob: 0,
      color: '#ff4aff'
    });
  }

  function bossFanShot(e) {
    const count = 5;
    const dx = state.player.x - e.x;
    const dy = state.player.y - e.y;
    const base = Math.atan2(dy, dx);

    for (let i = 0; i < count; i++) {
      const angle = base + (i - (count - 1) / 2) * 0.22;

      state.entities.push({
        kind: 'enemyBullet',
        x: e.x,
        y: e.y + 64,
        vx: Math.cos(angle) * 3.6,
        vy: Math.sin(angle) * 3.6,
        r: 11,
        dmg: 14,
        dead: false,
        bob: 0,
        color: '#ff4aff'
      });
    }
  }

  function bossAimBurst(e) {
    addText('連射！', e.x, e.y - 92, '#ff5bff');

    for (let i = 0; i < 9; i++) {
      const delayAngle = (i - 4) * 0.08;
      const dx = state.player.x - e.x;
      const dy = state.player.y - e.y;
      const base = Math.atan2(dy, dx) + delayAngle;

      state.entities.push({
        kind: 'enemyBullet',
        x: e.x + rand(-28, 28),
        y: e.y + 66,
        vx: Math.cos(base) * 4.2,
        vy: Math.sin(base) * 4.2,
        r: 9,
        dmg: 11,
        dead: false,
        bob: 0,
        color: '#ff8cff'
      });
    }
  }

  function bossWideRain(e) {
    addText('羽弾！', e.x, e.y - 92, '#ffe66b');

    for (let i = 0; i < 7; i++) {
      const x = W * 0.18 + (W * 0.64) * (i / 6);

      state.entities.push({
        kind: 'enemyBullet',
        x,
        y: e.y + 42,
        vx: (i - 3) * 0.12,
        vy: 3.55 + Math.abs(i - 3) * 0.08,
        r: 10,
        dmg: 12,
        dead: false,
        bob: 0,
        color: '#ffe66b'
      });
    }
  }

  function bossCrossShot(e) {
    addText('拡散！', e.x, e.y - 92, '#6be6ff');

    const angles = [
      Math.PI * 0.28,
      Math.PI * 0.36,
      Math.PI * 0.44,
      Math.PI * 0.56,
      Math.PI * 0.64,
      Math.PI * 0.72
    ];

    angles.forEach(angle => {
      state.entities.push({
        kind: 'enemyBullet',
        x: e.x,
        y: e.y + 64,
        vx: Math.cos(angle) * 3.35,
        vy: Math.sin(angle) * 3.35,
        r: 10,
        dmg: 12,
        dead: false,
        bob: 0,
        color: '#6be6ff'
      });
    });
  }

  function collideBullets() {
    for (const b of state.bullets) {
      if (b.dead) continue;

      for (const e of state.entities) {
        if (
          e.dead ||
          e.kind === 'gate' ||
          e.kind === 'enemyBullet'
        ) {
          continue;
        }

        const hit = e.r
          ? Math.hypot(b.x - e.x, b.y - e.y) < e.r + b.r
          : Math.abs(b.x - e.x) < e.w / 2 &&
            Math.abs(b.y - e.y) < e.h / 2;

        if (!hit) continue;

        b.dead = true;
        e.hp -= b.dmg;
        burst(b.x, b.y, '#ffffff', 4);

        if (e.hp <= 0) {
          killEntity(e);
        }

        break;
      }
    }
  }

  function collidePlayer() {
    const p = state.player;

    for (const e of state.entities) {
      if (e.dead) continue;

      if (e.kind === 'gate') {
        if (
          Math.abs(p.x - e.x) < e.w / 2 &&
          Math.abs(p.y - 20 - e.y) < e.h / 2
        ) {
          applyGate(e);
        }

        continue;
      }

      if (e.kind === 'enemyBullet') {
        if (Math.hypot(p.x - e.x, p.y - e.y) < p.r + e.r) {
          e.dead = true;
          state.hp -= e.dmg;
          addText(`-${e.dmg}`, p.x, p.y - 50, '#ff5b5b');
          burst(p.x, p.y, '#ff5b5b', 16);
        }

        continue;
      }

      if (e.kind === 'midBoss' && e.diveMode) {
        if (Math.hypot(p.x - e.x, p.y - e.y) < p.r + e.r && e.hitPlayerCd <= 0) {
          e.hitPlayerCd = 90;
          state.hp -= e.contactDmg;
          addText(`-${e.contactDmg}`, p.x, p.y - 50, '#ff5b5b');
          burst(p.x, p.y, '#ff5b5b', 20);
        }

        continue;
      }

      if (e.kind === 'boss') {
        continue;
      }

      if (e.kind === 'midBoss') {
        continue;
      }

      const hit = e.r
        ? Math.hypot(p.x - e.x, p.y - e.y) < p.r + e.r
        : Math.abs(p.x - e.x) < e.w / 2 + p.r &&
          Math.abs(p.y - e.y) < e.h / 2 + p.r;

      if (hit) {
        e.dead = true;
        const dmg = Math.max(1, Math.ceil(e.hp));
        state.hp -= dmg;
        addText(`-${dmg}`, p.x, p.y - 50, '#ff5b5b');
        burst(p.x, p.y, '#ff5b5b', 18);
      }
    }
  }

  function killEntity(e) {
    if (e.__rewarded) return;

    e.__rewarded = true;
    e.dead = true;

    burst(
      e.x,
      e.y,
      e.kind === 'boss' ? '#ff4aff' : '#ffe66b',
      e.kind === 'boss' ? 70 : 24
    );

    let coin = 0;
    const score = e.score || 0;

    if (e.kind === 'midBoss' || e.kind === 'boss') {
      coin = e.coin;
    } else {
      coin = intRand(e.coinMin || 1, e.coinMax || 3);
    }

    state.coin += coin;
    state.score += score;

    addText(`+${score} SCORE`, e.x, e.y - 24, '#6be6ff');
    addText(`+${coin} COIN`, e.x, e.y, '#ffcf5b');
  }

  function cleanup() {
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

  function finishRun(clear) {
    if (runCommitted) return;

    runCommitted = true;
    running = false;

    if (window.MobShotStorage) {
      window.MobShotStorage.addRunResult(state.score, state.coin);
    }

    if (window.MobShotMain && window.MobShotMain.refreshMainHud) {
      window.MobShotMain.refreshMainHud();
    }

    window.dispatchEvent(new CustomEvent('mobshot:saveUpdated'));

    if (resultTitle) resultTitle.textContent = clear ? 'CLEAR!' : 'GAME OVER';
    if (resultText) resultText.textContent = clear ? 'ボス撃破！ステージクリア' : 'ライフがなくなりました';
    if (resultScore) resultScore.textContent = state.score.toLocaleString();
    if (resultCoin) resultCoin.textContent = state.coin.toLocaleString();
    if (resultPanel) resultPanel.classList.remove('hidden');
  }

  function goMainFromResult() {
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

  function bindResultButtons() {
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

  function updateHud() {
    if (hudStage) hudStage.textContent = D.stage.id;
    if (hudScore) hudScore.textContent = Math.floor(state.score).toLocaleString();
    if (hudCoin) hudCoin.textContent = Math.floor(state.coin).toLocaleString();
    if (hudLife) hudLife.textContent = Math.max(0, Math.ceil(state.hp));
  }

  function addText(text, x, y, color) {
    state.texts.push({
      text,
      x,
      y,
      color,
      life: 48
    });
  }

  function burst(x, y, color, n) {
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

  function drawImageContain(image, centerX, centerY, boxW, boxH) {
    if (!imageReady(image)) return;

    const ratio = Math.min(
      boxW / image.naturalWidth,
      boxH / image.naturalHeight
    );

    const iw = image.naturalWidth * ratio;
    const ih = image.naturalHeight * ratio;

    ctx.drawImage(
      image,
      centerX - iw / 2,
      centerY - ih / 2,
      iw,
      ih
    );
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawBackground() {
    const bg = img(D.stage.background);

    if (imageReady(bg)) {
      const y1 = (scroll % H) - H;

      ctx.drawImage(bg, 0, y1, W, H);
      ctx.drawImage(bg, 0, y1 + H, W, H);
      ctx.drawImage(bg, 0, y1 + H * 2, W, H);
      return;
    }

    ctx.fillStyle = '#58ba48';
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = '#3b9b37';
    ctx.beginPath();
    ctx.moveTo(W * 0.12, 0);
    ctx.lineTo(W * 0.88, 0);
    ctx.lineTo(W * 0.8, H);
    ctx.lineTo(W * 0.2, H);
    ctx.closePath();
    ctx.fill();
  }

  function drawGate(gate) {
    const im = img(gate.image);
    const size = 118;

    if (imageReady(im)) {
      drawImageContain(im, gate.x, gate.y, size, size);
      return;
    }

    ctx.save();
    ctx.translate(gate.x, gate.y);

    ctx.globalAlpha = 0.95;
    ctx.fillStyle = gate.color || '#277dff';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 5;

    ctx.beginPath();
    ctx.ellipse(0, 0, 54, 42, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.globalAlpha = 1;
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.font = '900 16px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.strokeText(gate.name || 'GATE', 0, 0);
    ctx.fillText(gate.name || 'GATE', 0, 0);

    ctx.restore();
  }

  function entitySize(entity) {
    if (entity.kind === 'boss') return 238;
    if (entity.kind === 'midBoss') return 140;
    if (entity.kind === 'enemy' && entity.name === 'モブロック') return 92;
    if (entity.kind === 'enemy') return 84;
    if (entity.kind === 'gimmick') return 104;
    if (entity.kind === 'chest') return 82;
    return 70;
  }

  function drawFallbackEntity(entity, y, size) {
    ctx.save();
    ctx.translate(entity.x, y);

    ctx.fillStyle =
      entity.kind === 'chest' ? '#b77822' :
      entity.kind === 'gimmick' ? '#86664a' :
      entity.kind === 'midBoss' || entity.kind === 'boss' ? '#42215f' :
      '#151822';

    ctx.strokeStyle = '#111';
    ctx.lineWidth = 5;

    ctx.beginPath();
    ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.font = '900 11px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.strokeText(entity.name || 'NO IMG', 0, 0);
    ctx.fillText(entity.name || 'NO IMG', 0, 0);

    ctx.restore();
  }

  function drawHpNumber(entity, y, size) {
    const ratio = Math.max(0, entity.hp / entity.maxHp);
    const barW = size * 0.72;
    const barH = entity.kind === 'boss' ? 10 : 8;
    const barX = entity.x - barW / 2;
    const barY = entity.kind === 'boss'
      ? y + size * 0.34
      : y + size * 0.42;

    ctx.fillStyle = 'rgba(0,0,0,.58)';
    roundRect(barX, barY, barW, barH, 6);
    ctx.fill();

    ctx.fillStyle = ratio > 0.45 ? '#ffe66b' : '#ff5b5b';
    roundRect(barX, barY, barW * ratio, barH, 6);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.font = entity.kind === 'boss' ? '900 18px system-ui' : '900 16px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    const hpText = String(Math.ceil(entity.hp));
    ctx.strokeText(hpText, entity.x, barY + barH + 2);
    ctx.fillText(hpText, entity.x, barY + barH + 2);
  }

  function drawEntity(entity) {
    if (entity.kind === 'enemyBullet') {
      ctx.fillStyle = entity.color || '#ff4aff';
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.arc(entity.x, entity.y, entity.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      return;
    }

    if (entity.kind === 'gate') {
      drawGate(entity);
      return;
    }

    const y =
      entity.kind === 'enemy' ||
      entity.kind === 'midBoss' ||
      entity.kind === 'boss'
        ? entity.y + Math.sin(entity.bob || 0) * 5
        : entity.y;

    const size = entitySize(entity);
    const im = entity.image ? img(entity.image) : null;

    if (imageReady(im)) {
      drawImageContain(im, entity.x, y, size, size);
    } else {
      drawFallbackEntity(entity, y, size);
    }

    if (entity.hp != null && entity.maxHp != null) {
      drawHpNumber(entity, y, size);
    }
  }

  function drawBullet(bullet) {
    const im = img(state.bulletImage || D.player.bulletImage);

    if (imageReady(im)) {
      drawImageContain(im, bullet.x, bullet.y, 18, 18);
      return;
    }

    ctx.fillStyle = '#ffdf35';
    ctx.strokeStyle = '#7a4300';
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, bullet.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  function drawPlayer() {
    const p = state.player;
    const im = img(state.playerImage || D.player.image);

    ctx.fillStyle = 'rgba(0,0,0,.25)';
    ctx.beginPath();
    ctx.ellipse(p.x, p.y + 35, 40, 11, 0, 0, Math.PI * 2);
    ctx.fill();

    if (imageReady(im)) {
      drawImageContain(im, p.x, p.y - 8, 76, 92);
      return;
    }

    ctx.fillStyle = '#11131e';
    ctx.strokeStyle = '#2b3654';
    ctx.lineWidth = 5;

    ctx.beginPath();
    ctx.arc(p.x, p.y, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  function drawParticle(particle) {
    ctx.globalAlpha = Math.max(0, particle.life / 34);
    ctx.fillStyle = particle.color;
    ctx.fillRect(particle.x, particle.y, 6, 6);
    ctx.globalAlpha = 1;
  }

  function drawText(textItem) {
    ctx.globalAlpha = Math.max(0, textItem.life / 48);

    ctx.fillStyle = textItem.color;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.font = '900 18px system-ui';
    ctx.textAlign = 'center';

    ctx.strokeText(textItem.text, textItem.x, textItem.y);
    ctx.fillText(textItem.text, textItem.x, textItem.y);

    ctx.globalAlpha = 1;
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    drawBackground();

    for (const entity of state.entities) {
      drawEntity(entity);
    }

    for (const bullet of state.bullets) {
      drawBullet(bullet);
    }

    drawPlayer();

    if (window.MobShotPetBattle && window.MobShotPetBattle.draw) {
      window.MobShotPetBattle.draw(ctx);
    }

    for (const particle of state.particles) {
      drawParticle(particle);
    }

    for (const textItem of state.texts) {
      drawText(textItem);
    }
  }

  function loop() {
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
    killEntity
  };

  window.MobShotGame = {
    start,
    stop,
    showBanner,
    goMainFromResult
  };
})();
