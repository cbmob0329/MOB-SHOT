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

  let W = 0, H = 0, DPR = 1;
  let running = false;
  let raf = 0;
  let frame = 0;
  let scroll = 0;
  let runCommitted = false;

  const images = new Map();

  function img(src) {
    if (!src) return null;
    if (!images.has(src)) {
      const image = new Image();
      image.src = src;
      images.set(src, image);
    }
    return images.get(src);
  }

  const state = {
    hp: 50,
    maxHp: 50,
    power: 1,
    range: 3,
    wide: 1,
    attackSpeed: 1,
    score: 0,
    coin: 0,
    player: { x: 0, y: 0, targetX: 0, targetY: 0, r: 24 },
    shootCd: 0,
    areaSpawn: { nextEnemy: 0, nextGimmick: 0, nextChest: 0, endAt: 0 },
    gateEndAt: 0,
    entities: [],
    bullets: [],
    particles: [],
    texts: []
  };

  function getPlayerBaseY() {
    return Math.max(H * 0.58, H - 148);
  }

  function weightedPick(list) {
    const total = list.reduce((sum, item) => sum + (item.weight || 1), 0);
    let roll = Math.random() * total;
    for (const item of list) {
      roll -= (item.weight || 1);
      if (roll <= 0) return item;
    }
    return list[list.length - 1];
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

    state.maxHp = D.player.maxHp;
    state.hp = D.player.maxHp;
    state.power = D.player.power;
    state.range = D.player.range;
    state.wide = D.player.wide;
    state.attackSpeed = D.player.attackSpeed;
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
    resultPanel.classList.add('hidden');

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
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  function stop() {
    running = false;
    stopLoopOnly();
  }

  function showBanner(text) {
    phaseBanner.textContent = text;
    phaseBanner.classList.remove('show');
    void phaseBanner.offsetWidth;
    phaseBanner.classList.add('show');
  }

  function handleFlowEvent(ev) {
    if (!ev) return;

    showBanner(ev.text);

    if (ev.type === 'areaStart') {
      state.areaSpawn.nextEnemy = frame + 45;
      state.areaSpawn.nextGimmick = frame + 80;
      state.areaSpawn.nextChest = frame + 160;
      state.areaSpawn.endAt = frame + 520;
    }

    if (ev.type === 'gateStart') {
      spawnGatePair();
      state.gateEndAt = frame + 300;
    }

    if (ev.type === 'midBossStart') spawnMidBoss();
    if (ev.type === 'bossStart') spawnBoss();
    if (ev.type === 'clear') finishRun(true);
  }

  function rand(a,b){ return a + Math.random() * (b-a); }
  function intRand(a,b){ return Math.floor(rand(a,b+1)); }
  function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
  function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }

  function spawnEnemy() {
    const def = pick(D.enemies.zako);
    const scale = 1 + flow.area * 0.08;

    state.entities.push({
      kind: 'enemy',
      name: def.name,
      image: def.image,
      x: rand(W * 0.18, W * 0.82),
      y: -60,
      vx: rand(-0.45, 0.45),
      vy: 2.15 + flow.area * 0.08,
      r: 25,
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
      y: -70,
      vx: 0,
      vy: 2.05,
      w: 58,
      h: 58,
      hp: Math.ceil(def.hp * scale),
      maxHp: Math.ceil(def.hp * scale),
      score: def.score,
      coinMin: def.coinMin,
      coinMax: def.coinMax,
      dead: false,
      bob: rand(0, Math.PI * 2)
    });
  }

  function spawnChest() {
    const def = pick(D.chests);

    state.entities.push({
      kind: 'chest',
      name: def.name,
      image: def.image,
      x: rand(W * 0.2, W * 0.8),
      y: -64,
      vx: 0,
      vy: 2.0,
      w: 54,
      h: 48,
      hp: def.hp,
      maxHp: def.hp,
      score: def.score,
      coinMin: def.coinMin,
      coinMax: def.coinMax,
      dead: false,
      bob: rand(0, Math.PI * 2)
    });
  }

  function spawnGatePair() {
    let pool;

    if (flow.gate < 7) {
      pool = D.gates.filter(g => g.type !== 'wide');
    } else {
      pool = D.gates.map(g => {
        if (g.type === 'wide') return Object.assign({}, g, { weight: 0.05 });
        return g;
      });
    }

    const a = weightedPick(pool);
    let b = weightedPick(pool);
    let guard = 0;

    while (b.type === a.type && guard < 20) {
      b = weightedPick(pool);
      guard++;
    }

    const pair = `gate-${frame}-${Math.random()}`;
    state.entities.push(makeGate(a, W * 0.32, pair));
    state.entities.push(makeGate(b, W * 0.68, pair));
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
      y: -74,
      w: 138,
      h: 82,
      vy: 2.25,
      pair,
      dead: false,
      used: false
    };
  }

  function spawnMidBoss() {
    const def = D.enemies.midBoss;
    const hp = Math.ceil(def.hp * (flow.midBoss === 2 ? 1.35 : 1));

    state.entities.push({
      kind: 'midBoss',
      name: def.name,
      image: def.image,
      x: W / 2,
      y: -100,
      targetY: H * 0.25,
      vx: 1.4,
      vy: 2.2,
      r: 48,
      hp,
      maxHp: hp,
      score: def.score,
      coin: def.coin,
      dead: false,
      shootCd: 80,
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
      y: -130,
      targetY: H * 0.23,
      vx: 1.7,
      vy: 1.8,
      r: 66,
      hp: def.hp,
      maxHp: def.hp,
      score: def.score,
      coin: def.coin,
      dead: false,
      shootCd: 60,
      bob: 0
    });
  }

  function applyGate(gate) {
    if (gate.type === 'power') state.power += gate.value;
    if (gate.type === 'range') state.range += gate.value;
    if (gate.type === 'rapid') state.attackSpeed += 0.25 * gate.value;
    if (gate.type === 'life') state.hp = Math.min(state.maxHp, state.hp + gate.value);
    if (gate.type === 'wide') state.wide += gate.value;

    addText(gate.name, state.player.x, state.player.y - 70, gate.color);
    burst(gate.x, gate.y, gate.color, 24);

    state.entities.forEach(e => {
      if (e.kind === 'gate' && e.pair === gate.pair) e.dead = true;
    });
  }

  function shoot() {
    state.shootCd--;

    if (state.shootCd > 0) return;

    state.shootCd = Math.max(7, Math.floor(22 / state.attackSpeed));

    const count = Math.max(1, state.wide);

    for (let i = 0; i < count; i++) {
      const offset = (i - (count - 1) / 2) * 26;

      state.bullets.push({
        x: state.player.x + offset,
        y: state.player.y - 30,
        vy: -8.4,
        r: 7,
        life: 42 + state.range * 12,
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
        if (Math.random() < 0.42) spawnChest();
        state.areaSpawn.nextChest = frame + intRand(230, 350);
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
      if (!alive && snap.phaseFrame > 60) handleFlowEvent(flow.completeMidBoss());
    }

    if (snap.phase === 'boss') {
      const alive = state.entities.some(e => e.kind === 'boss' && !e.dead);
      if (!alive && snap.phaseFrame > 60) handleFlowEvent(flow.completeBoss());
    }
  }

  function update() {
    if (!running) return;

    frame++;
    scroll += 2.2;

    updateFlow();
    shoot();

    const p = state.player;

    p.targetY = getPlayerBaseY();
    p.x += (p.targetX - p.x) * 0.19;
    p.y += (p.targetY - p.y) * 0.20;
    p.x = clamp(p.x, W * 0.14, W * 0.86);
    p.y = getPlayerBaseY();

    for (const e of state.entities) {
      if (e.dead) continue;

      e.bob += 0.06;

      if (e.kind === 'midBoss' || e.kind === 'boss') {
        if (e.y < e.targetY) {
          e.y += e.vy;
        } else {
          e.x += e.vx;
          if (e.x < W * 0.18 || e.x > W * 0.82) e.vx *= -1;

          e.shootCd--;

          if (e.shootCd <= 0) {
            e.shootCd = e.kind === 'boss' ? 54 : 82;
            enemyShot(e);
          }
        }
      } else {
        e.y += e.vy;
        e.x += e.vx || 0;
      }
    }

    for (const b of state.bullets) {
      b.y += b.vy;
      b.life--;
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

    if (state.hp <= 0) finishRun(false);
  }

  function enemyShot(e) {
    const count = e.kind === 'boss' ? 3 : 1;

    for (let i = 0; i < count; i++) {
      const angleOffset = (i - (count - 1) / 2) * 0.34;
      const dx = state.player.x - e.x;
      const dy = state.player.y - e.y;
      const base = Math.atan2(dy, dx) + angleOffset;

      state.entities.push({
        kind: 'enemyBullet',
        x: e.x,
        y: e.y + 30,
        vx: Math.cos(base) * 3.8,
        vy: Math.sin(base) * 3.8,
        r: e.kind === 'boss' ? 11 : 8,
        dmg: e.kind === 'boss' ? 16 : 9,
        dead: false
      });
    }
  }

  function collideBullets() {
    for (const b of state.bullets) {
      if (b.dead) continue;

      for (const e of state.entities) {
        if (e.dead || e.kind === 'gate' || e.kind === 'enemyBullet') continue;

        const hit = e.r
          ? Math.hypot(b.x - e.x, b.y - e.y) < e.r + b.r
          : Math.abs(b.x - e.x) < e.w / 2 && Math.abs(b.y - e.y) < e.h / 2;

        if (!hit) continue;

        b.dead = true;
        e.hp -= b.dmg;

        burst(b.x, b.y, '#ffffff', 4);

        if (e.hp <= 0) killEntity(e);

        break;
      }
    }
  }

  function collidePlayer() {
    const p = state.player;

    for (const e of state.entities) {
      if (e.dead) continue;

      if (e.kind === 'gate') {
        if (Math.abs(p.x - e.x) < e.w / 2 && Math.abs(p.y - 20 - e.y) < e.h / 2) {
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

      if (e.kind === 'boss' || e.kind === 'midBoss') continue;

      const hit = e.r
        ? Math.hypot(p.x - e.x, p.y - e.y) < p.r + e.r
        : Math.abs(p.x - e.x) < e.w / 2 + p.r && Math.abs(p.y - e.y) < e.h / 2 + p.r;

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
    e.dead = true;

    burst(e.x, e.y, e.kind === 'boss' ? '#ff4aff' : '#ffe66b', e.kind === 'boss' ? 56 : 24);

    let coin = 0;
    let score = e.score || 0;

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
      e.y < H + 150 &&
      e.y > -240 &&
      e.x > -140 &&
      e.x < W + 140
    );

    state.bullets = state.bullets.filter(b =>
      !b.dead &&
      b.life > 0 &&
      b.y > -80
    );

    state.particles = state.particles.filter(p => p.life > 0);
    state.texts = state.texts.filter(t => t.life > 0);
  }

  function finishRun(clear) {
    if (runCommitted) return;

    runCommitted = true;
    running = false;

    if (clear) window.MobShotStorage.addRunResult(state.score, state.coin);

    resultTitle.textContent = clear ? 'CLEAR!' : 'GAME OVER';
    resultText.textContent = clear ? 'ボス撃破！ステージクリア' : 'ライフがなくなりました';
    resultScore.textContent = state.score.toLocaleString();
    resultCoin.textContent = state.coin.toLocaleString();
    resultPanel.classList.remove('hidden');
  }

  function updateHud() {
    hudStage.textContent = D.stage.id;
    hudScore.textContent = Math.floor(state.score).toLocaleString();
    hudCoin.textContent = Math.floor(state.coin).toLocaleString();
    hudLife.textContent = Math.max(0, Math.ceil(state.hp));
  }

  function addText(text, x, y, color) {
    state.texts.push({ text, x, y, color, life: 48 });
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

  function draw() {
    drawBackground();

    for (const e of state.entities) drawEntity(e);
    for (const b of state.bullets) drawBullet(b);

    drawPlayer();

    for (const p of state.particles) drawParticle(p);
    for (const t of state.texts) drawText(t);
  }

  function drawBackground() {
    const bg = img(D.stage.background);

    if (bg && bg.complete && bg.naturalWidth) {
      const h = H;
      const w = W;
      const y1 = (scroll % h) - h;

      ctx.drawImage(bg, 0, y1, w, h);
      ctx.drawImage(bg, 0, y1 + h, w, h);
      ctx.drawImage(bg, 0, y1 + h * 2, w, h);
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

    ctx.strokeStyle = 'rgba(255,255,255,.22)';
    ctx.lineWidth = 4;

    for (let y = -120 + (scroll % 120); y < H; y += 120) {
      ctx.beginPath();
      ctx.moveTo(W * 0.18, y);
      ctx.lineTo(W * 0.82, y);
      ctx.stroke();
    }
  }

  function drawEntity(e) {
    if (e.kind === 'enemyBullet') {
      ctx.fillStyle = '#ff4aff';
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      return;
    }

    if (e.kind === 'gate') return drawGate(e);

    const y = e.y + Math.sin(e.bob) * 5;
    const im = e.image ? img(e.image) : null;

    const size =
      e.kind === 'boss' ? 136 :
      e.kind === 'midBoss' ? 104 :
      e.kind === 'enemy' ? 68 :
      e.kind === 'gimmick' ? 76 :
      e.kind === 'chest' ? 70 :
      64;

    if (im && im.complete && im.naturalWidth) {
      const ratio = Math.min(size / im.naturalWidth, size / im.naturalHeight);
      const iw = im.naturalWidth * ratio;
      const ih = im.naturalHeight * ratio;
      ctx.drawImage(im, e.x - iw / 2, y - ih / 2, iw, ih);
    } else {
      drawFallbackEntity(e, y, size);
    }

    if (e.hp != null) drawHpNumber(e, y, size);
  }

  function drawGate(g) {
    const im = img(g.image);
    const gw = 138;
    const gh = 82;

    ctx.save();
    ctx.translate(g.x, g.y);

    roundRect(-gw / 2, -gh / 2, gw, gh, 16);
    ctx.fillStyle = g.color || '#277dff';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 4;
    ctx.fill();
    ctx.stroke();

    if (im && im.complete && im.naturalWidth) {
      const pad = 6;
      const boxW = gw - pad * 2;
      const boxH = gh - pad * 2;
      const ratio = Math.min(boxW / im.naturalWidth, boxH / im.naturalHeight);
      const iw = im.naturalWidth * ratio;
      const ih = im.naturalHeight * ratio;

      ctx.drawImage(
        im,
        -iw / 2,
        -ih / 2,
        iw,
        ih
      );
    } else {
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 4;
      ctx.font = '900 17px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeText(g.name, 0, 0);
      ctx.fillText(g.name, 0, 0);
    }

    ctx.restore();
  }

  function drawFallbackEntity(e, y, size) {
    ctx.save();
    ctx.translate(e.x, y);

    const isBoss = e.kind === 'boss' || e.kind === 'midBoss';

    ctx.fillStyle =
      e.kind === 'chest' ? '#b77822' :
      isBoss ? '#42215f' :
      e.kind === 'gimmick' ? '#86664a' :
      '#151822';

    ctx.strokeStyle = isBoss ? '#ffe66b' : '#111';
    ctx.lineWidth = 5;

    if (e.kind === 'gimmick' || e.kind === 'chest') {
      roundRect(-size / 2, -size / 2, size, size * 0.8, 12);
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
    }

    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffe66b';
    ctx.beginPath();
    ctx.arc(-size * 0.15, -size * 0.08, 5, 0, Math.PI * 2);
    ctx.arc(size * 0.15, -size * 0.08, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function drawHpNumber(e, y, size) {
    const ratio = Math.max(0, e.hp / e.maxHp);

    ctx.fillStyle = 'rgba(0,0,0,.55)';
    roundRect(e.x - size / 2, y - size / 2 - 16, size, 9, 6);
    ctx.fill();

    ctx.fillStyle = ratio > 0.45 ? '#ffe66b' : '#ff5b5b';
    roundRect(e.x - size / 2, y - size / 2 - 16, size * ratio, 9, 6);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.font = '900 18px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeText(Math.ceil(e.hp), e.x, y);
    ctx.fillText(Math.ceil(e.hp), e.x, y);
  }

  function drawBullet(b) {
    ctx.fillStyle = '#ffdf35';
    ctx.strokeStyle = '#7a4300';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  function drawPlayer() {
    const p = state.player;
    const im = img(D.player.image);

    ctx.fillStyle = 'rgba(0,0,0,.25)';
    ctx.beginPath();
    ctx.ellipse(p.x, p.y + 35, 40, 11, 0, 0, Math.PI * 2);
    ctx.fill();

    if (im && im.complete && im.naturalWidth) {
      const maxW = 72;
      const maxH = 86;
      const ratio = Math.min(maxW / im.naturalWidth, maxH / im.naturalHeight);
      const iw = im.naturalWidth * ratio;
      const ih = im.naturalHeight * ratio;
      ctx.drawImage(im, p.x - iw / 2, p.y - ih * 0.60, iw, ih);
    } else {
      ctx.fillStyle = '#11131e';
      ctx.strokeStyle = '#2b3654';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffdf35';
      ctx.beginPath();
      ctx.arc(p.x - 10, p.y - 4, 6, 0, Math.PI * 2);
      ctx.arc(p.x + 10, p.y - 4, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ff4aa4';
      ctx.font = '900 12px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('MOB', p.x, p.y + 16);
    }
  }

  function drawParticle(p) {
    ctx.globalAlpha = Math.max(0, p.life / 34);
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, 6, 6);
    ctx.globalAlpha = 1;
  }

  function drawText(t) {
    ctx.globalAlpha = Math.max(0, t.life / 48);
    ctx.fillStyle = t.color;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.font = '900 18px system-ui';
    ctx.textAlign = 'center';
    ctx.strokeText(t.text, t.x, t.y);
    ctx.fillText(t.text, t.x, t.y);
    ctx.globalAlpha = 1;
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

  function loop() {
    update();
    draw();

    if (running) raf = requestAnimationFrame(loop);
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

  window.MobShotGame = { start, stop, showBanner };
})();
