'use strict';

(function(){
  const BOSS_ATTACKS = {
    'ホークモブ':      { image:'atk/hawkatk.png', flipY:true,  size:22, bigSize:48, normalCount:4, bigCount:3, rapidCount:6 },
    'ホークモブⅡ':    { image:'atk/hawkatk.png', flipY:true,  size:24, bigSize:54, normalCount:5, bigCount:5, rapidCount:8 },

    'ミラモブ':        { image:'atk/miraatk.png', flipY:true,  size:28, bigSize:56, normalCount:4, bigCount:3, rapidCount:3 },
    'ミラモブⅡ':      { image:'atk/miraatk.png', flipY:true,  size:30, bigSize:62, normalCount:4, bigCount:5, rapidCount:3 },

    '番人':            { image:'atk/hinotama.png', flipY:true, size:28, bigSize:56, normalCount:3, bigCount:2, rapidCount:4 },
    'モブガーディアン': { image:'atk/hinotama.png', flipY:true, size:28, bigSize:56, normalCount:3, bigCount:2, rapidCount:4 },
    '番人Ⅱ':          { image:'atk/hinotama.png', flipY:true, size:30, bigSize:62, normalCount:3, bigCount:5, rapidCount:6 },
    'モブガーディアンⅡ':{ image:'atk/hinotama.png', flipY:true, size:30, bigSize:62, normalCount:3, bigCount:5, rapidCount:6 },

    'ネオンモブ':      { image:'atk/kaminari.png', flipY:true, size:30, bigSize:62, normalCount:5, bigCount:4, rapidCount:4 },
    'ネオンモブⅡ':    { image:'atk/kaminari.png', flipY:true, size:32, bigSize:68, normalCount:5, bigCount:5, rapidCount:4 },

    'ドラゴンモブ':    { image:'atk/dragon.png', flipY:false, size:36, bigSize:78, normalCount:5, bigCount:5, rapidCount:8 },

    'モブリリス':      { image:'atk/atkriri.png', flipY:false, size:30, bigSize:64, normalCount:5, bigCount:3, rapidCount:4 },
    'モブ魔王':        { image:'atk/atkmaoh.png', flipY:true, size:38, bigSize:82, normalCount:6, bigCount:5, rapidCount:8 },

    'モブメイル':      { image:'atk/atkmeiru.png', flipY:true, size:34, bigSize:72, normalCount:3, bigCount:4, rapidCount:6 },
    'モブスミス':      { image:'atk/atksmith.png', flipY:true, size:34, bigSize:72, normalCount:3, bigCount:4, rapidCount:6 },
    'モブネプ':        { image:'atk/atknep.png', flipY:true, size:36, bigSize:78, normalCount:1, bigCount:5, rapidCount:3 },
    'ブルネオモブ':    { image:'atk/neonring.png', flipY:true, size:34, bigSize:74, normalCount:2, bigCount:4, rapidCount:4 },
    'パルネオモブ':    { image:'atk/neonring.png', flipY:true, size:34, bigSize:74, normalCount:2, bigCount:4, rapidCount:4 },
    '閻魔モブ':        { image:'atk/enma.png', flipY:true, size:36, bigSize:78, normalCount:3, bigCount:5, rapidCount:6 },
    'ウルモブリリス':  { image:'atk/atkriri.png', flipY:false, size:38, bigSize:82, normalCount:5, bigCount:5, rapidCount:8 }
  };

  function getBossSpec(e){
    return BOSS_ATTACKS[e.name] || {
      image:'atk/hawkatk.png',
      flipY:true,
      size:26,
      bigSize:58,
      normalCount:3,
      bigCount:3,
      rapidCount:4
    };
  }

  function updateMidBoss(e, tools){
    const state = tools.state;
    const W = tools.W;
    const H = tools.H;
    const rand = tools.rand;
    const clamp = tools.clamp;
    const addText = tools.addText;

    if (e.y < e.targetY && !e.diveMode) {
      e.y += e.vy;
      return;
    }

    if (e.hitPlayerCd > 0) e.hitPlayerCd--;

    if (e.diveMode) {
      e.x += e.diveVx;
      e.y += e.diveVy;

      if (e.y > H + 90) {
        e.diveMode = false;
        e.diveReturn = true;
        e.x = clamp(e.x, W * 0.2, W * 0.8);
        e.y = -110;
        e.targetY = e.baseY;
        e.vx = rand(1.0, 1.5) * (Math.random() < 0.5 ? -1 : 1);
        e.attackCd = 150;
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
      e.shootCd = 120;
      midBossShot(e, tools);
    }

    if (e.attackCd <= 0) {
      e.attackCd = 170;
      startMidBossDive(e, tools);
      addText('突進！', e.x, e.y - 54, '#ffcf5b');
    }
  }

  function startMidBossDive(e, tools){
    const state = tools.state;

    const dx = state.player.x - e.x;
    const dy = state.player.y - e.y;
    const len = Math.max(1, Math.sqrt(dx * dx + dy * dy));
    const speed = 5.4;

    e.diveMode = true;
    e.diveVx = dx / len * speed;
    e.diveVy = dy / len * speed;
  }

  function updateBoss(e, tools){
    const W = tools.W;
    const H = tools.H;
    const rand = tools.rand;
    const clamp = tools.clamp;

    if (e.y < e.targetY) {
      e.y += e.vy;
      return;
    }

    initBossState(e);

    if (e.hitPlayerCd > 0) e.hitPlayerCd--;

    processBossPendingShots(e, tools);
    processBossSpecialMove(e, tools);

    if (e.specialMove) return;

    e.x += e.vx;

    if (e.x < W * 0.18 || e.x > W * 0.82) {
      e.vx *= -1;
    }

    if (e.ghostTimer > 0) {
      e.ghostTimer--;
      e.alpha = 0.38;

      if (e.ghostTimer <= 0) {
        e.alpha = 1;
      }
    }

    if (e.barrierTimer > 0) {
      e.barrierTimer--;
    }

    e.shootCd--;
    e.attackCd--;

    if (e.shootCd <= 0) {
      e.shootCd = 80;
      bossNormalShot(e, tools);
    }

    if (e.attackCd <= 0) {
      e.attackStep++;
      e.attackCd = 150;
      runBossPattern(e, tools);
    }

    e.x = clamp(e.x, W * 0.14, W * 0.86);
    e.y = clamp(e.y, H * 0.12, H * 0.36);
  }

  function initBossState(e){
    if (e.__bossInit) return;

    e.__bossInit = true;
    e.shootCd = Math.max(70, Number(e.shootCd || 80));
    e.attackCd = Math.max(130, Number(e.attackCd || 150));
    e.attackStep = Number(e.attackStep || 0);
    e.pendingShots = [];
    e.summonStep = 0;
    e.ghostTimer = 0;
    e.alpha = 1;
    e.specialMove = null;
    e.specialTimer = 0;
    e.barrierTimer = 0;
    e.barrierHp = 0;
    e.hitPlayerCd = 0;
  }

  function runBossPattern(e, tools){
    const step = e.attackStep % 5;

    if (step === 1) {
      bossRapidShot(e, tools);
      return;
    }

    if (step === 2) {
      bossBigShot(e, tools);
      return;
    }

    if (step === 3) {
      bossMoveShot(e, tools);
      return;
    }

    if (step === 4) {
      bossSummon(e, tools);
      return;
    }

    bossChargeBigShot(e, tools);
  }

  function bossNormalShot(e, tools){
    const spec = getBossSpec(e);
    const count = Math.min(spec.normalCount || 3, 5);

    if (e.name === 'モブ魔王') {
      randomSpreadShot(e, tools, count, false, 3.0);
      return;
    }

    if (
      e.name === 'ネオンモブ' ||
      e.name === 'ネオンモブⅡ' ||
      e.name === 'ドラゴンモブ' ||
      e.name === 'モブリリス' ||
      e.name === 'ウルモブリリス'
    ) {
      randomSpreadShot(e, tools, count, false, 2.8);
      return;
    }

    aimedSpreadShot(e, tools, count, false, 3.0);
  }

  function bossRapidShot(e, tools){
    const spec = getBossSpec(e);
    const addText = tools.addText;
    const count = Math.min(spec.rapidCount || 4, 6);

    addText('連射！', e.x, e.y - 86, '#ff8cff');

    for (let i = 0; i < count; i++) {
      e.pendingShots.push({
        delay: i * 14,
        type: 'aim',
        big: false,
        speed: 3.7,
        offsetX: (i - (count - 1) / 2) * 8
      });
    }
  }

  function bossBigShot(e, tools){
    const spec = getBossSpec(e);
    const addText = tools.addText;
    const count = Math.min(spec.bigCount || 3, 5);

    addText('巨大弾！', e.x, e.y - 92, '#ffe66b');

    aimedSpreadShot(e, tools, count, true, 2.15);
  }

  function bossChargeBigShot(e, tools){
    const addText = tools.addText;

    addText('溜め！', e.x, e.y - 94, '#ffe66b');

    e.shakeTimer = 90;

    for (let i = 0; i < 3; i++) {
      e.pendingShots.push({
        delay: 90 + i * 24,
        type: 'aim',
        big: true,
        speed: 2.0,
        offsetX: 0
      });
    }
  }

  function bossMoveShot(e, tools){
    const W = tools.W;
    const addText = tools.addText;

    addText('移動攻撃！', e.x, e.y - 88, '#9deeff');

    e.specialMove = 'sideShot';
    e.specialTimer = 110;
    e.specialBaseVx = e.vx || 1.5;
    e.vx = e.x < W / 2 ? 3.2 : -3.2;

    for (let i = 0; i < 5; i++) {
      e.pendingShots.push({
        delay: i * 20,
        type: 'aim',
        big: false,
        speed: 3.4,
        offsetX: 0
      });
    }
  }

  function bossSummon(e, tools){
    const addText = tools.addText;

    if (e.summonStep >= 2) {
      bossNormalShot(e, tools);
      return;
    }

    e.summonStep++;
    addText('召喚！', e.x, e.y - 92, '#b78cff');

    summonStageEnemies(e, tools, 2);

    e.pendingShots.push({
      delay: 40,
      type: 'aim',
      big: false,
      speed: 2.8,
      offsetX: -20
    });

    e.pendingShots.push({
      delay: 60,
      type: 'aim',
      big: false,
      speed: 2.8,
      offsetX: 20
    });
  }

  function processBossSpecialMove(e, tools){
    const W = tools.W;

    if (!e.specialMove) return;

    e.specialTimer--;

    if (e.specialMove === 'sideShot') {
      e.x += e.vx;

      if (e.x < W * 0.18 || e.x > W * 0.82) {
        e.vx *= -1;
      }
    }

    if (e.specialTimer <= 0) {
      e.specialMove = null;
      e.vx = e.specialBaseVx || 1.5;
    }
  }

  function processBossPendingShots(e, tools){
    if (!e.pendingShots || !e.pendingShots.length) return;

    for (const shot of e.pendingShots) {
      shot.delay--;
    }

    const ready = e.pendingShots.filter(shot => shot.delay <= 0);
    e.pendingShots = e.pendingShots.filter(shot => shot.delay > 0);

    ready.forEach(shot => {
      if (shot.type === 'aim') {
        fireAimedBullet(e, tools, shot.big, shot.speed, shot.offsetX || 0);
      }
    });
  }

  function aimedSpreadShot(e, tools, count, big, speed){
    const state = tools.state;
    const spread = big ? 0.22 : 0.18;

    const dx = state.player.x - e.x;
    const dy = state.player.y - e.y;
    const base = Math.atan2(dy, dx);

    for (let i = 0; i < count; i++) {
      const angle = base + (i - (count - 1) / 2) * spread;

      fireBulletByAngle(e, tools, angle, big, speed);
    }
  }

  function randomSpreadShot(e, tools, count, big, speed){
    const W = tools.W;
    const rand = tools.rand;

    for (let i = 0; i < count; i++) {
      const targetX = rand(W * 0.18, W * 0.82);
      const targetY = tools.H * 0.86;

      const dx = targetX - e.x;
      const dy = targetY - e.y;
      const angle = Math.atan2(dy, dx);

      fireBulletByAngle(e, tools, angle, big, speed);
    }
  }

  function fireAimedBullet(e, tools, big, speed, offsetX){
    const state = tools.state;

    const sx = e.x + offsetX;
    const sy = e.y + (big ? 70 : 56);

    const dx = state.player.x - sx;
    const dy = state.player.y - sy;
    const angle = Math.atan2(dy, dx);

    fireBulletByAngle(e, tools, angle, big, speed, sx, sy);
  }

  function fireBulletByAngle(e, tools, angle, big, speed, sx, sy){
    const state = tools.state;
    const spec = getBossSpec(e);

    const r = big ? spec.bigSize * 0.42 : spec.size * 0.42;
    const hp = big
      ? Math.ceil((e.maxHp || 500) * 0.055)
      : 0;

    state.entities.push({
      kind: 'enemyBullet',
      x: sx != null ? sx : e.x,
      y: sy != null ? sy : e.y + (big ? 70 : 56),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r,
      dmg: big ? 22 : 11,
      hp: big ? hp : 0,
      maxHp: big ? hp : 0,
      breakable: !!big,
      image: spec.image,
      flipY: !!spec.flipY,
      dead: false,
      bob: 0,
      color: big ? '#ffe66b' : '#ff4aff',
      life: 520
    });
  }

  function midBossShot(e, tools){
    const state = tools.state;

    const dx = state.player.x - e.x;
    const dy = state.player.y - e.y;
    const base = Math.atan2(dy, dx);

    state.entities.push({
      kind: 'enemyBullet',
      x: e.x,
      y: e.y + 34,
      vx: Math.cos(base) * 3.0,
      vy: Math.sin(base) * 3.0,
      r: 9,
      dmg: 8,
      hp: 0,
      maxHp: 0,
      breakable: false,
      dead: false,
      bob: 0,
      color: '#ff4aff',
      life: 420
    });
  }

  function summonStageEnemies(e, tools, count){
    const state = tools.state;
    const D = tools.D;
    const W = tools.W;
    const rand = tools.rand;

    if (!D || !D.enemies || !Array.isArray(D.enemies.zako)) return;
    if (!D.enemies.zako.length) return;

    for (let i = 0; i < count; i++) {
      const def = D.enemies.zako[(e.summonStep + i - 1) % D.enemies.zako.length];

      state.entities.push({
        kind: 'enemy',
        name: def.name,
        image: def.image,
        x: rand(W * 0.22, W * 0.78),
        y: -70 - i * 52,
        vx: rand(-0.65, 0.65),
        vy: 2.05,
        r: def.name === 'モブロック' ? 34 : 31,
        hp: Math.ceil(Number(def.hp || 5) * 1.15),
        maxHp: Math.ceil(Number(def.hp || 5) * 1.15),
        score: Number(def.score || 10),
        coinMin: Number(def.coinMin || 1),
        coinMax: Number(def.coinMax || 3),
        dead: false,
        bob: rand(0, Math.PI * 2)
      });
    }
  }

  window.MobShotBoss = {
    updateMidBoss,
    updateBoss
  };
})();
