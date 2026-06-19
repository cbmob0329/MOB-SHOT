'use strict';

(function(){
  const DEFAULT_FIREBALL_IMAGE = 'atk/hinotama.png';

  function specOf(e){
    if (
      window.MobShotBossData &&
      window.MobShotBossData.getAttackSpec
    ) {
      const spec = window.MobShotBossData.getAttackSpec(e.name) || {};

      return Object.assign({
        image: DEFAULT_FIREBALL_IMAGE,
        flipY: true,
        small: 20,
        normal: 28,
        big: 40,
        huge: 56,
        color: '#ff7a35'
      }, spec);
    }

    return {
      image: DEFAULT_FIREBALL_IMAGE,
      flipY: true,
      small: 20,
      normal: 28,
      big: 40,
      huge: 56,
      color: '#ff7a35'
    };
  }

  function sizeOf(spec, sizeType){
    const raw = Number(spec[sizeType] || spec.normal || 28);

    if (sizeType === 'small') return Math.max(18, raw);
    if (sizeType === 'normal') return Math.max(26, raw);
    if (sizeType === 'big') return Math.max(38, raw);
    if (sizeType === 'huge') return Math.max(54, raw);
    if (sizeType === 'super') return Math.max(72, raw);

    return Math.max(26, raw);
  }

  function clamp(v, a, b){
    return Math.max(a, Math.min(b, v));
  }

  function playerAngle(e, tools, sx, sy){
    const p = tools.state.player;
    return Math.atan2(p.y - sy, p.x - sx);
  }

  function isCoopMode(tools){
    return !!(
      tools &&
      tools.state &&
      tools.state.coopMode &&
      tools.state.coopMode.active
    );
  }

  function getTargetPlayer(tools, sx){
    if (
      isCoopMode(tools) &&
      tools.state.coopMode.players &&
      tools.state.coopMode.players.length
    ) {
      const players = tools.state.coopMode.players.filter(p => !p.dead);

      if (players.length) {
        players.sort((a,b) => Math.abs(a.x - sx) - Math.abs(b.x - sx));
        return players[0];
      }
    }

    return tools.state.player;
  }

  function targetAngle(e, tools, sx, sy){
    const p = getTargetPlayer(tools, sx);
    return Math.atan2(p.y - sy, p.x - sx);
  }

  function lifeOf(opt){
    return Number(opt.life || 430);
  }

  function makeBulletBase(e, tools, opt){
    opt = opt || {};

    const spec = specOf(e);
    const sizeType = opt.sizeType || 'normal';
    const r = Number(opt.r || sizeOf(spec, sizeType));
    const hp = Number(opt.hp || 0);
    const speed = Number(opt.speed || 2.05);
    const angle = Number(opt.angle || Math.PI / 2);
    const sx = opt.x != null ? opt.x : e.x;
    const sy = opt.y != null ? opt.y : e.y + 58;
    const isBreakable = hp > 0 || !!opt.breakable;

    return {
      kind: 'enemyBullet',
      x: sx,
      y: sy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,

      r,
      visualR: Math.ceil(r * Number(opt.visualRate || 1.08)),
      hitR: Math.ceil(r * Number(opt.hitRate || 0.82)),

      dmg: Number(opt.dmg || Math.max(5, Math.ceil(r * 0.34))),
      hp: hp,
      maxHp: hp,
      breakable: isBreakable,

      image: opt.image || spec.image || DEFAULT_FIREBALL_IMAGE,
      flipY: opt.flipY != null ? opt.flipY : spec.flipY,
      color: opt.color || spec.color || '#ff7a35',

      dead: false,
      bob: 0,
      life: lifeOf(opt),

      homing: !!opt.homing,
      homingPower: Number(opt.homingPower || 0.006),
      homingSpeed: Number(opt.homingSpeed || speed),
      homingDelay: Number(opt.homingDelay || 12),
      homingTimer: 0,

      wave: !!opt.wave,
      waveAmp: Number(opt.waveAmp || 0),
      waveSpeed: Number(opt.waveSpeed || 0.045),
      waveBaseX: sx,

      slowBig: !!opt.slowBig,
      bossSpecial: !!opt.bossSpecial,

      glow: opt.glow !== false,
      fromBoss: true
    };
  }

  function pushEnemyBullet(e, tools, opt){
    const bullet = makeBulletBase(e, tools, opt || {});
    tools.state.entities.push(bullet);
    return bullet;
  }

  function pushBreakableFireball(e, tools, opt){
    opt = Object.assign({
      image: DEFAULT_FIREBALL_IMAGE,
      flipY: true,
      sizeType: 'big',
      speed: 1.55,
      hp: 18,
      color: '#ff7a35',
      breakable: true,
      hitRate: 0.78
    }, opt || {});

    return pushEnemyBullet(e, tools, opt);
  }

  function pushBigFireball(e, tools, opt){
    opt = Object.assign({
      image: DEFAULT_FIREBALL_IMAGE,
      flipY: true,
      sizeType: 'huge',
      speed: 1.18,
      hp: 36,
      dmg: 18,
      color: '#ff5b35',
      breakable: true,
      slowBig: true,
      bossSpecial: true,
      hitRate: 0.74,
      visualRate: 1.12,
      life: 520
    }, opt || {});

    return pushEnemyBullet(e, tools, opt);
  }

  function fireAimed(e, tools, opt){
    opt = opt || {};

    const sx = opt.x != null ? opt.x : e.x + Number(opt.offsetX || 0);
    const sy = opt.y != null ? opt.y : e.y + Number(opt.offsetY || 58);
    const angle = targetAngle(e, tools, sx, sy);

    return pushEnemyBullet(
      e,
      tools,
      Object.assign({}, opt, { x:sx, y:sy, angle })
    );
  }

  function fireSlowAimed(e, tools, opt){
    return fireAimed(e, tools, Object.assign({
      speed: 1.75,
      sizeType: 'normal',
      hp: 8,
      image: DEFAULT_FIREBALL_IMAGE,
      flipY: true,
      breakable: true
    }, opt || {}));
  }

  function fireAngle(e, tools, angle, opt){
    return pushEnemyBullet(
      e,
      tools,
      Object.assign({}, opt || {}, { angle })
    );
  }

  function fireSpread(e, tools, count, spread, opt){
    opt = opt || {};

    const sx = opt.x != null ? opt.x : e.x;
    const sy = opt.y != null ? opt.y : e.y + Number(opt.offsetY || 58);
    const base = opt.downBase ? Math.PI / 2 : targetAngle(e, tools, sx, sy);
    const safeCenter = !!opt.safeCenter;
    const bullets = [];

    for (let i = 0; i < count; i++) {
      if (safeCenter && i === Math.floor(count / 2)) continue;

      const angle = base + (i - (count - 1) / 2) * spread;

      bullets.push(pushEnemyBullet(
        e,
        tools,
        Object.assign({}, opt, { x:sx, y:sy, angle })
      ));
    }

    return bullets;
  }

  function fireSlowSpread(e, tools, count, spread, opt){
    return fireSpread(e, tools, count, spread, Object.assign({
      speed: 1.85,
      sizeType: 'normal',
      hp: 8,
      image: DEFAULT_FIREBALL_IMAGE,
      flipY: true,
      breakable: true
    }, opt || {}));
  }

  function fireFanDown(e, tools, count, opt){
    opt = opt || {};

    const spread = Number(opt.spread || 0.22);
    const base = Math.PI / 2;
    const bullets = [];

    for (let i = 0; i < count; i++) {
      if (opt.safeCenter && i === Math.floor(count / 2)) continue;

      const angle = base + (i - (count - 1) / 2) * spread;

      bullets.push(pushEnemyBullet(
        e,
        tools,
        Object.assign({}, opt, { angle })
      ));
    }

    return bullets;
  }

  function fireSafeFanDown(e, tools, count, opt){
    return fireFanDown(e, tools, count, Object.assign({
      speed: 1.9,
      sizeType: 'normal',
      hp: 6,
      safeCenter: true,
      image: DEFAULT_FIREBALL_IMAGE,
      flipY: true,
      breakable: true
    }, opt || {}));
  }

  function fireLineDown(e, tools, count, opt){
    opt = opt || {};

    const W = tools.W;
    const left = opt.left != null ? opt.left : W * 0.18;
    const right = opt.right != null ? opt.right : W * 0.82;
    const y = opt.y != null ? opt.y : e.y + 62;
    const bullets = [];

    for (let i = 0; i < count; i++) {
      if (opt.safeCenter && i === Math.floor(count / 2)) continue;

      const x = count <= 1
        ? e.x
        : left + (right - left) * (i / (count - 1));

      bullets.push(pushEnemyBullet(
        e,
        tools,
        Object.assign({}, opt, { x, y, angle:Math.PI / 2 })
      ));
    }

    return bullets;
  }

  function fireWeakHoming(e, tools, count, opt){
    opt = opt || {};

    const bullets = [];

    for (let i = 0; i < count; i++) {
      const sx = e.x + (i - (count - 1) / 2) * 28;
      const sy = e.y + 58;
      const angle = targetAngle(e, tools, sx, sy) + tools.rand(-0.13, 0.13);

      bullets.push(pushEnemyBullet(
        e,
        tools,
        Object.assign({}, opt, {
          x: sx,
          y: sy,
          angle,
          speed: opt.speed || 1.75,
          homing: true,
          homingPower: opt.homingPower || 0.0045,
          homingSpeed: opt.homingSpeed || 1.85,
          homingDelay: opt.homingDelay || 18,
          life: opt.life || 250
        })
      ));
    }

    return bullets;
  }

  function fireBreakableHoming(e, tools, count, opt){
    return fireWeakHoming(e, tools, count, Object.assign({
      sizeType: 'normal',
      speed: 1.65,
      hp: 10,
      breakable: true,
      image: DEFAULT_FIREBALL_IMAGE,
      flipY: true,
      color: '#ff9b4a',
      homingPower: 0.0038,
      life: 280
    }, opt || {}));
  }

  function fireWave(e, tools, count, opt){
    opt = opt || {};

    const baseY = e.y + 58;
    const W = tools.W;
    const bullets = [];

    for (let i = 0; i < count; i++) {
      const x = W * 0.18 + (W * 0.64) * (i / Math.max(1, count - 1));
      const offsetAngle = Math.sin(i * 0.9) * Number(opt.angleWave || 0.18);

      bullets.push(pushEnemyBullet(
        e,
        tools,
        Object.assign({}, opt, {
          x,
          y: baseY,
          angle: Math.PI / 2 + offsetAngle,
          sizeType: opt.sizeType || 'normal',
          speed: opt.speed || 1.95,
          wave: opt.wave !== false,
          waveAmp: opt.waveAmp || 18,
          waveSpeed: opt.waveSpeed || 0.045
        })
      ));
    }

    return bullets;
  }

  function fireCross(e, tools, opt){
    opt = opt || {};

    const angles = [
      Math.PI / 2,
      Math.PI * 0.40,
      Math.PI * 0.60
    ];

    const bullets = [];

    angles.forEach(angle => {
      bullets.push(pushEnemyBullet(
        e,
        tools,
        Object.assign({}, opt, { angle })
      ));
    });

    return bullets;
  }

  function fireBigSwayFireball(e, tools, opt){
    opt = Object.assign({
      x: e.x,
      y: e.y + 66,
      angle: Math.PI / 2,
      speed: 0.95,
      sizeType: 'super',
      r: 72,
      hp: 42,
      dmg: 22,
      image: DEFAULT_FIREBALL_IMAGE,
      flipY: true,
      color: '#ff5b35',
      breakable: true,
      bossSpecial: true,
      slowBig: true,
      wave: true,
      waveAmp: 42,
      waveSpeed: 0.028,
      hitRate: 0.70,
      visualRate: 1.14,
      life: 620
    }, opt || {});

    return pushEnemyBullet(e, tools, opt);
  }

  function fireDelayedAimed(e, delay, opt){
    if (!Array.isArray(e.pendingShots)) e.pendingShots = [];

    e.pendingShots.push(
      Object.assign({}, opt || {}, {
        delay,
        kind: 'aim'
      })
    );
  }

  function fireDelayedAngle(e, delay, angle, opt){
    if (!Array.isArray(e.pendingShots)) e.pendingShots = [];

    e.pendingShots.push(
      Object.assign({}, opt || {}, {
        delay,
        kind: 'angle',
        angle
      })
    );
  }

  function fireDelayedLine(e, delay, count, opt){
    if (!Array.isArray(e.pendingShots)) e.pendingShots = [];

    e.pendingShots.push(
      Object.assign({}, opt || {}, {
        delay,
        kind: 'line',
        count
      })
    );
  }

  function fireDelayedHoming(e, delay, count, opt){
    if (!Array.isArray(e.pendingShots)) e.pendingShots = [];

    e.pendingShots.push(
      Object.assign({}, opt || {}, {
        delay,
        kind: 'homing',
        count
      })
    );
  }

  function fireDelayedFan(e, delay, count, opt){
    if (!Array.isArray(e.pendingShots)) e.pendingShots = [];

    e.pendingShots.push(
      Object.assign({}, opt || {}, {
        delay,
        kind: 'fan',
        count
      })
    );
  }

  function fireDelayedSpread(e, delay, count, spread, opt){
    if (!Array.isArray(e.pendingShots)) e.pendingShots = [];

    e.pendingShots.push(
      Object.assign({}, opt || {}, {
        delay,
        kind: 'spread',
        count,
        spread
      })
    );
  }

  function fireDelayedBigSway(e, delay, opt){
    if (!Array.isArray(e.pendingShots)) e.pendingShots = [];

    e.pendingShots.push(
      Object.assign({}, opt || {}, {
        delay,
        kind: 'bigSway'
      })
    );
  }

  function processPendingShots(e, tools){
    if (!e.pendingShots || !e.pendingShots.length) return;

    for (const shot of e.pendingShots) {
      shot.delay--;
    }

    const ready = e.pendingShots.filter(shot => shot.delay <= 0);
    e.pendingShots = e.pendingShots.filter(shot => shot.delay > 0);

    ready.forEach(shot => {
      if (shot.kind === 'aim') {
        fireAimed(e, tools, shot);
      }

      if (shot.kind === 'angle') {
        fireAngle(e, tools, shot.angle, shot);
      }

      if (shot.kind === 'line') {
        fireLineDown(e, tools, shot.count || 3, shot);
      }

      if (shot.kind === 'homing') {
        fireWeakHoming(e, tools, shot.count || 1, shot);
      }

      if (shot.kind === 'fan') {
        fireFanDown(e, tools, shot.count || 5, shot);
      }

      if (shot.kind === 'spread') {
        fireSpread(
          e,
          tools,
          shot.count || 3,
          shot.spread || 0.20,
          shot
        );
      }

      if (shot.kind === 'bigSway') {
        fireBigSwayFireball(e, tools, shot);
      }
    });
  }

  function chargeAimed(e, tools, text, count, opt){
    opt = opt || {};

    if (tools.addText && text) {
      tools.addText(text, e.x, e.y - 88, opt.textColor || '#ffe66b');
    }

    for (let i = 0; i < count; i++) {
      fireDelayedAimed(
        e,
        48 + i * Number(opt.gap || 28),
        Object.assign({}, opt, {
          image: opt.image || DEFAULT_FIREBALL_IMAGE,
          flipY: opt.flipY != null ? opt.flipY : true,
          sizeType: opt.sizeType || 'big',
          hp: opt.hp != null ? opt.hp : 16,
          speed: opt.speed || 1.75,
          breakable: opt.breakable !== false
        })
      );
    }
  }

  function chargeLine(e, tools, text, count, opt){
    opt = opt || {};

    if (tools.addText && text) {
      tools.addText(text, e.x, e.y - 88, opt.textColor || '#ffe66b');
    }

    fireDelayedLine(
      e,
      Number(opt.delay || 50),
      count,
      Object.assign({}, opt, {
        image: opt.image || DEFAULT_FIREBALL_IMAGE,
        flipY: opt.flipY != null ? opt.flipY : true,
        sizeType: opt.sizeType || 'big',
        hp: opt.hp != null ? opt.hp : 14,
        speed: opt.speed || 1.9,
        breakable: opt.breakable !== false
      })
    );
  }

  function chargeHoming(e, tools, text, count, opt){
    opt = opt || {};

    if (tools.addText && text) {
      tools.addText(text, e.x, e.y - 88, opt.textColor || '#9deeff');
    }

    for (let i = 0; i < count; i++) {
      fireDelayedHoming(
        e,
        40 + i * Number(opt.gap || 24),
        1,
        Object.assign({}, opt, {
          image: opt.image || DEFAULT_FIREBALL_IMAGE,
          flipY: opt.flipY != null ? opt.flipY : true,
          sizeType: opt.sizeType || 'normal',
          hp: opt.hp != null ? opt.hp : 8,
          speed: opt.speed || 1.65,
          homingPower: opt.homingPower || 0.004,
          breakable: opt.breakable !== false
        })
      );
    }
  }

  function chargeBigFireball(e, tools, text, opt){
    opt = opt || {};

    if (tools.addText) {
      tools.addText(text || 'ビッグ火の玉！', e.x, e.y - 92, opt.textColor || '#ffcf5b');
    }

    fireDelayedBigSway(
      e,
      Number(opt.delay || 70),
      Object.assign({}, opt, {
        x: opt.x != null ? opt.x : e.x,
        y: opt.y != null ? opt.y : e.y + 70,
        image: DEFAULT_FIREBALL_IMAGE,
        flipY: true
      })
    );
  }

  function updateEnemyBullet(b, tools){
    if (!b || b.dead) return;

    b.life = Number(b.life || 0) - 1;
    b.bob = Number(b.bob || 0) + 1;

    if (b.life <= 0) {
      b.dead = true;
      return;
    }

    if (b.homing) {
      b.homingTimer = Number(b.homingTimer || 0) + 1;

      if (b.homingTimer >= Number(b.homingDelay || 0)) {
        const target = getTargetPlayer(tools, b.x);
        const desired = Math.atan2(target.y - b.y, target.x - b.x);
        const current = Math.atan2(b.vy, b.vx);
        let diff = desired - current;

        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;

        const turn = clamp(diff, -b.homingPower, b.homingPower);
        const next = current + turn;
        const speed = Number(b.homingSpeed || Math.hypot(b.vx, b.vy) || 1.7);

        b.vx = Math.cos(next) * speed;
        b.vy = Math.sin(next) * speed;
      }
    }

    if (b.wave) {
      b.x += Math.sin(b.bob * Number(b.waveSpeed || 0.04)) * Number(b.waveAmp || 0) * 0.035;
    }
  }

  window.MobShotBossBullets = {
    pushEnemyBullet,
    pushBreakableFireball,
    pushBigFireball,
    fireAimed,
    fireSlowAimed,
    fireAngle,
    fireSpread,
    fireSlowSpread,
    fireFanDown,
    fireSafeFanDown,
    fireLineDown,
    fireWeakHoming,
    fireBreakableHoming,
    fireDelayedAimed,
    fireDelayedAngle,
    fireDelayedLine,
    fireDelayedHoming,
    fireDelayedFan,
    fireDelayedSpread,
    fireDelayedBigSway,
    processPendingShots,
    chargeAimed,
    chargeLine,
    chargeHoming,
    chargeBigFireball,
    fireWave,
    fireCross,
    fireBigSwayFireball,
    updateEnemyBullet,
    DEFAULT_FIREBALL_IMAGE
  };
})();
