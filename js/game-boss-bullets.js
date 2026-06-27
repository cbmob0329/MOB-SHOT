'use strict';

(function(){
  const DEFAULT_FIREBALL_IMAGE = 'atk/hinotama.png';

  function specOf(e){
    if (window.MobShotBossData && window.MobShotBossData.getAttackSpec) {
      const spec = window.MobShotBossData.getAttackSpec(e.name) || {};

      return Object.assign({
        image: DEFAULT_FIREBALL_IMAGE,
        fallbackImage: DEFAULT_FIREBALL_IMAGE,
        flipY: true,
        small: 20,
        normal: 28,
        big: 40,
        huge: 56,
        super: 76,
        color: '#ff7a35'
      }, spec);
    }

    return {
      image: DEFAULT_FIREBALL_IMAGE,
      fallbackImage: DEFAULT_FIREBALL_IMAGE,
      flipY: true,
      small: 20,
      normal: 28,
      big: 40,
      huge: 56,
      super: 76,
      color: '#ff7a35'
    };
  }

  function normalizeDifficultyKey(key){
    const raw = String(key || '').trim();

    if (raw === 'イージー') return 'easy';
    if (raw === 'ハード') return 'hard';
    if (raw === 'ベリーハード') return 'veryHard';
    if (raw === 'インフェルノ') return 'inferno';
    if (raw === 'レジェンド') return 'legend';

    if (raw === 'easy') return 'easy';
    if (raw === 'hard') return 'hard';
    if (raw === 'veryHard') return 'veryHard';
    if (raw === 'veryhard') return 'veryHard';
    if (raw === 'inferno') return 'inferno';
    if (raw === 'legend') return 'legend';

    return raw || '';
  }

  function stageDifficultyFromTools(tools){
    const D = (tools && tools.D) || window.MOBSHOT_DATA || {};
    const st = D.stage || {};
    const areaKey = String(st.areaKey || '').trim();
    const diff = normalizeDifficultyKey(st.difficulty || st.difficultyKey || st.diff || '');

    if (
      st.isLegend ||
      areaKey === 'prison' ||
      areaKey === 'matrix' ||
      areaKey === 'seaRail' ||
      areaKey === 'neonHighway' ||
      areaKey === 'makai' ||
      areaKey === 'last'
    ) {
      return 'legend';
    }

    return diff;
  }

  function difficultyBalance(e, tools){
    const key = normalizeDifficultyKey(
      (e && e.eventDifficulty) ||
      (e && e.__doubleDifficulty) ||
      (e && e.difficulty) ||
      stageDifficultyFromTools(tools) ||
      ''
    );

    if (key === 'hard') {
      return { key:'hard', speed:1.10, dmg:1.35, hp:1.15, minBreakHp:15 };
    }

    if (key === 'veryHard') {
      return { key:'veryHard', speed:1.20, dmg:1.80, hp:1.35, minBreakHp:30 };
    }

    if (key === 'inferno') {
      return { key:'inferno', speed:1.32, dmg:2.55, hp:1.65, minBreakHp:50 };
    }

    if (key === 'legend') {
      return { key:'legend', speed:1.45, dmg:3.50, hp:2.05, minBreakHp:80 };
    }

    return { key:'easy', speed:1, dmg:1, hp:1, minBreakHp:0 };
  }

  function sizeOf(spec, sizeType){
    const raw = Number(spec[sizeType] || spec.normal || 28);

    if (sizeType === 'small') return Math.max(18, raw);
    if (sizeType === 'normal') return Math.max(26, raw);
    if (sizeType === 'big') return Math.max(40, raw);
    if (sizeType === 'huge') return Math.max(58, raw);
    if (sizeType === 'super') return Math.max(76, raw);

    return Math.max(26, raw);
  }

  function clamp(v, a, b){
    return Math.max(a, Math.min(b, v));
  }

  function rand(tools, a, b){
    if (tools && tools.rand) return tools.rand(a, b);
    return a + Math.random() * (b - a);
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
    return Number(opt.life || 460);
  }

  function specialHpMul(e){
    if (window.MobShotBossData && window.MobShotBossData.getSpecialHpMultiplier) {
      return Number(window.MobShotBossData.getSpecialHpMultiplier(e.name) || 1.65);
    }

    return 1.65;
  }

  function normalizedHp(e, tools, opt, sizeType){
    opt = opt || {};

    if (opt.breakable === false || opt.unbreakable === true) return 0;

    const bal = difficultyBalance(e, tools);

    let hp = Number(opt.hp || 0);

    if (!hp && opt.breakable === true) {
      hp = sizeType === 'small' ? 5 :
        sizeType === 'normal' ? 8 :
        sizeType === 'big' ? 14 :
        sizeType === 'huge' ? 20 :
        sizeType === 'super' ? 30 : 8;
    }

    if (hp > 0) {
      hp = Math.ceil(hp * bal.hp);

      if (bal.minBreakHp > 0) {
        hp = Math.max(hp, bal.minBreakHp);
      }
    }

    if (
      hp > 0 &&
      (
        opt.bossSpecial ||
        opt.special ||
        sizeType === 'huge' ||
        sizeType === 'super' ||
        opt.trident ||
        opt.barrier ||
        opt.shield
      )
    ) {
      hp = Math.ceil(hp * specialHpMul(e));
    }

    return hp;
  }

  function damageOf(e, tools, opt, sizeType, r){
    const bal = difficultyBalance(e, tools);

    if (opt.dmg != null) {
      return Math.max(1, Math.ceil(Number(opt.dmg) * bal.dmg));
    }

    let base = Math.ceil(r * 0.42);

    if (sizeType === 'small') base = Math.ceil(r * 0.38);
    if (sizeType === 'normal') base = Math.ceil(r * 0.44);
    if (sizeType === 'big') base = Math.ceil(r * 0.54);
    if (sizeType === 'huge') base = Math.ceil(r * 0.72);
    if (sizeType === 'super') base = Math.ceil(r * 0.95);

    if (opt.bossSpecial || opt.special || opt.slowBig || opt.trident) {
      base = Math.ceil(base * 1.25);
    }

    return Math.max(8, Math.ceil(base * bal.dmg));
  }

  function makeBulletBase(e, tools, opt){
    opt = opt || {};

    const spec = specOf(e);
    const bal = difficultyBalance(e, tools);
    const sizeType = opt.sizeType || 'normal';
    const r = Number(opt.r || sizeOf(spec, sizeType));
    const hp = normalizedHp(e, tools, opt, sizeType);
    const speed = Number(opt.speed || 1.8) * bal.speed;
    const angle = Number(opt.angle || Math.PI / 2);
    const sx = opt.x != null ? opt.x : e.x;
    const sy = opt.y != null ? opt.y : e.y + 58;
    const isBreakable = hp > 0;

    return {
      kind: 'enemyBullet',
      x: sx,
      y: sy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,

      r,
      visualR: Math.ceil(r * Number(opt.visualRate || 1.08)),
      hitR: Math.ceil(r * Number(opt.hitRate || 0.82)),

      dmg: damageOf(e, tools, opt, sizeType, r),
      hp,
      maxHp: hp,
      breakable: isBreakable,
      unbreakable: !isBreakable,

      image: opt.image || spec.image || spec.fallbackImage || DEFAULT_FIREBALL_IMAGE,
      fallbackImage: opt.fallbackImage || spec.fallbackImage || DEFAULT_FIREBALL_IMAGE,
      flipY: opt.flipY != null ? opt.flipY : spec.flipY,
      color: opt.color || spec.color || '#ff7a35',

      dead: false,
      bob: 0,
      life: lifeOf(opt),

      homing: !!opt.homing,
      homingPower: Number(opt.homingPower || 0.004),
      homingSpeed: Number(opt.homingSpeed || speed),
      homingDelay: Number(opt.homingDelay || 18),
      homingTimer: 0,

      wave: !!opt.wave,
      waveAmp: Number(opt.waveAmp || 0),
      waveSpeed: Number(opt.waveSpeed || 0.04),
      waveBaseX: sx,

      slowBig: !!opt.slowBig,
      bossSpecial: !!opt.bossSpecial || !!opt.special,

      trident: !!opt.trident,
      shield: !!opt.shield,
      barrier: !!opt.barrier,
      frontBarrier: !!opt.frontBarrier,
      circleBarrier: !!opt.circleBarrier,

      pierce: !!opt.pierce,
      rotate: !!opt.rotate,
      rotateSpeed: Number(opt.rotateSpeed || 0.06),
      angle,

      glow: opt.glow !== false,
      fromBoss: true
    };
  }

  function pushEnemyBullet(e, tools, opt){
    if (!tools || !tools.state || !Array.isArray(tools.state.entities)) return null;

    const bullet = makeBulletBase(e, tools, opt || {});
    tools.state.entities.push(bullet);
    return bullet;
  }

  function pushUnbreakableBullet(e, tools, opt){
    return pushEnemyBullet(e, tools, Object.assign({
      hp: 0,
      breakable: false,
      unbreakable: true,
      glow: true
    }, opt || {}));
  }

  function pushBreakableFireball(e, tools, opt){
    return pushEnemyBullet(e, tools, Object.assign({
      image: DEFAULT_FIREBALL_IMAGE,
      flipY: true,
      sizeType: 'big',
      speed: 1.58,
      hp: 18,
      color: '#ff7a35',
      breakable: true,
      hitRate: 0.78
    }, opt || {}));
  }

  function pushBigFireball(e, tools, opt){
    return pushEnemyBullet(e, tools, Object.assign({
      image: DEFAULT_FIREBALL_IMAGE,
      flipY: true,
      sizeType: 'huge',
      speed: 1.14,
      hp: 42,
      dmg: 42,
      color: '#ff5b35',
      breakable: true,
      slowBig: true,
      bossSpecial: true,
      hitRate: 0.72,
      visualRate: 1.12,
      life: 560
    }, opt || {}));
  }

  function pushGiantStrongBall(e, tools, opt){
    return pushEnemyBullet(e, tools, Object.assign({
      sizeType: 'super',
      speed: 0.84,
      hp: 40,
      dmg: 56,
      color: '#6be6ff',
      breakable: true,
      bossSpecial: true,
      slowBig: true,
      hitRate: 0.70,
      visualRate: 1.16,
      life: 640,
      glow: true
    }, opt || {}));
  }

  function pushTrident(e, tools, opt){
    return pushEnemyBullet(e, tools, Object.assign({
      sizeType: 'super',
      speed: 0.64,
      hp: 42,
      dmg: 68,
      color: '#6be6ff',
      breakable: true,
      bossSpecial: true,
      trident: true,
      pierce: true,
      rotate: true,
      rotateSpeed: 0.035,
      hitRate: 0.55,
      visualRate: 1.20,
      life: 760,
      glow: true
    }, opt || {}));
  }

  function fireAimed(e, tools, opt){
    opt = opt || {};

    const sx = opt.x != null ? opt.x : e.x + Number(opt.offsetX || 0);
    const sy = opt.y != null ? opt.y : e.y + Number(opt.offsetY || 58);
    const angle = targetAngle(e, tools, sx, sy);

    return pushEnemyBullet(e, tools, Object.assign({}, opt, { x:sx, y:sy, angle }));
  }

  function fireSlowAimed(e, tools, opt){
    return fireAimed(e, tools, Object.assign({
      speed: 1.68,
      sizeType: 'normal',
      hp: 9,
      image: DEFAULT_FIREBALL_IMAGE,
      flipY: true,
      breakable: true
    }, opt || {}));
  }

  function fireUnbreakableAimed(e, tools, opt){
    return fireAimed(e, tools, Object.assign({
      speed: 2.02,
      sizeType: 'normal',
      hp: 0,
      breakable: false,
      unbreakable: true
    }, opt || {}));
  }

  function fireAngle(e, tools, angle, opt){
    return pushEnemyBullet(e, tools, Object.assign({}, opt || {}, { angle }));
  }

  function fireSpread(e, tools, count, spread, opt){
    opt = opt || {};

    const sx = opt.x != null ? opt.x : e.x;
    const sy = opt.y != null ? opt.y : e.y + Number(opt.offsetY || 58);
    const base = opt.downBase ? Math.PI / 2 : targetAngle(e, tools, sx, sy);
    const safeCenter = !!opt.safeCenter;
    const result = [];

    for (let i = 0; i < count; i++) {
      if (safeCenter && i === Math.floor(count / 2)) continue;

      const angle = base + (i - (count - 1) / 2) * spread;
      result.push(pushEnemyBullet(e, tools, Object.assign({}, opt, { x:sx, y:sy, angle })));
    }

    return result;
  }

  function fireSlowSpread(e, tools, count, spread, opt){
    return fireSpread(e, tools, count, spread, Object.assign({
      speed: 1.82,
      sizeType: 'normal',
      hp: 9,
      image: DEFAULT_FIREBALL_IMAGE,
      flipY: true,
      breakable: true
    }, opt || {}));
  }

  function fireUnbreakableSpread(e, tools, count, spread, opt){
    return fireSpread(e, tools, count, spread, Object.assign({
      speed: 1.95,
      sizeType: 'normal',
      hp: 0,
      breakable: false,
      unbreakable: true
    }, opt || {}));
  }

  function fireFanDown(e, tools, count, opt){
    opt = opt || {};

    const spread = Number(opt.spread || 0.22);
    const base = Math.PI / 2;
    const result = [];

    for (let i = 0; i < count; i++) {
      if (opt.safeCenter && i === Math.floor(count / 2)) continue;

      const angle = base + (i - (count - 1) / 2) * spread;
      result.push(pushEnemyBullet(e, tools, Object.assign({}, opt, { angle })));
    }

    return result;
  }

  function fireSafeFanDown(e, tools, count, opt){
    return fireFanDown(e, tools, count, Object.assign({
      speed: 1.82,
      sizeType: 'normal',
      hp: 7,
      safeCenter: true,
      image: DEFAULT_FIREBALL_IMAGE,
      flipY: true,
      breakable: true
    }, opt || {}));
  }

  function fireLineDown(e, tools, count, opt){
    opt = opt || {};

    const left = opt.left != null ? opt.left : tools.W * 0.18;
    const right = opt.right != null ? opt.right : tools.W * 0.82;
    const y = opt.y != null ? opt.y : e.y + 62;
    const result = [];

    for (let i = 0; i < count; i++) {
      if (opt.safeCenter && i === Math.floor(count / 2)) continue;

      const x = count <= 1 ? e.x : left + (right - left) * (i / (count - 1));
      result.push(pushEnemyBullet(e, tools, Object.assign({}, opt, { x, y, angle:Math.PI / 2 })));
    }

    return result;
  }

  function fireWeakHoming(e, tools, count, opt){
    opt = opt || {};

    const result = [];

    for (let i = 0; i < count; i++) {
      const sx = e.x + (i - (count - 1) / 2) * 28;
      const sy = e.y + 58;
      const angle = targetAngle(e, tools, sx, sy) + rand(tools, -0.12, 0.12);

      result.push(pushEnemyBullet(e, tools, Object.assign({}, opt, {
        x: sx,
        y: sy,
        angle,
        speed: opt.speed || 1.58,
        homing: true,
        homingPower: opt.homingPower || 0.0034,
        homingSpeed: opt.homingSpeed || 1.70,
        homingDelay: opt.homingDelay || 18,
        life: opt.life || 300
      })));
    }

    return result;
  }

  function fireBreakableHoming(e, tools, count, opt){
    return fireWeakHoming(e, tools, count, Object.assign({
      sizeType: 'normal',
      speed: 1.58,
      hp: 11,
      breakable: true,
      image: DEFAULT_FIREBALL_IMAGE,
      flipY: true,
      color: '#ff9b4a',
      homingPower: 0.0034,
      life: 320
    }, opt || {}));
  }

  function fireWave(e, tools, count, opt){
    opt = opt || {};

    const baseY = e.y + 58;
    const result = [];

    for (let i = 0; i < count; i++) {
      const x = tools.W * 0.18 + (tools.W * 0.64) * (i / Math.max(1, count - 1));
      const offsetAngle = Math.sin(i * 0.9) * Number(opt.angleWave || 0.16);

      result.push(pushEnemyBullet(e, tools, Object.assign({}, opt, {
        x,
        y: baseY,
        angle: Math.PI / 2 + offsetAngle,
        sizeType: opt.sizeType || 'normal',
        speed: opt.speed || 1.82,
        wave: opt.wave !== false,
        waveAmp: opt.waveAmp || 18,
        waveSpeed: opt.waveSpeed || 0.038
      })));
    }

    return result;
  }

  function fireCross(e, tools, opt){
    opt = opt || {};

    const angles = [Math.PI / 2, Math.PI * 0.40, Math.PI * 0.60];
    return angles.map(angle => pushEnemyBullet(e, tools, Object.assign({}, opt, { angle })));
  }

  function fireRing(e, tools, count, opt){
    opt = opt || {};

    const base = opt.baseAngle != null ? opt.baseAngle : Math.random() * Math.PI * 2;
    const result = [];

    for (let i = 0; i < count; i++) {
      result.push(pushEnemyBullet(e, tools, Object.assign({}, opt, {
        angle: base + Math.PI * 2 * i / count
      })));
    }

    return result;
  }

  function fireBarrage(e, tools, count, opt){
    opt = opt || {};

    for (let i = 0; i < count; i++) {
      const delay = Number(opt.delay || 38) * i;
      fireDelayedAimed(e, delay, Object.assign({}, opt, {
        x:e.x + rand(tools, -Number(opt.xJitter || 18), Number(opt.xJitter || 18)),
        y:e.y + Number(opt.offsetY || 58)
      }));
    }

    return [];
  }

  function fireBigSwayFireball(e, tools, opt){
    return pushEnemyBullet(e, tools, Object.assign({
      x: e.x,
      y: e.y + 66,
      angle: Math.PI / 2,
      speed: 0.90,
      sizeType: 'super',
      r: 78,
      hp: 48,
      dmg: 64,
      image: DEFAULT_FIREBALL_IMAGE,
      flipY: true,
      color: '#ff5b35',
      breakable: true,
      bossSpecial: true,
      slowBig: true,
      wave: true,
      waveAmp: 44,
      waveSpeed: 0.026,
      hitRate: 0.68,
      visualRate: 1.14,
      life: 660
    }, opt || {}));
  }

  function ensurePending(e){
    if (!Array.isArray(e.pendingShots)) e.pendingShots = [];
  }

  function fireDelayedAimed(e, delay, opt){
    ensurePending(e);
    e.pendingShots.push(Object.assign({}, opt || {}, { delay, kind:'aim' }));
  }

  function fireDelayedAngle(e, delay, angle, opt){
    ensurePending(e);
    e.pendingShots.push(Object.assign({}, opt || {}, { delay, kind:'angle', angle }));
  }

  function fireDelayedLine(e, delay, count, opt){
    ensurePending(e);
    e.pendingShots.push(Object.assign({}, opt || {}, { delay, kind:'line', count }));
  }

  function fireDelayedHoming(e, delay, count, opt){
    ensurePending(e);
    e.pendingShots.push(Object.assign({}, opt || {}, { delay, kind:'homing', count }));
  }

  function fireDelayedFan(e, delay, count, opt){
    ensurePending(e);
    e.pendingShots.push(Object.assign({}, opt || {}, { delay, kind:'fan', count }));
  }

  function fireDelayedSpread(e, delay, count, spread, opt){
    ensurePending(e);
    e.pendingShots.push(Object.assign({}, opt || {}, { delay, kind:'spread', count, spread }));
  }

  function fireDelayedRing(e, delay, count, opt){
    ensurePending(e);
    e.pendingShots.push(Object.assign({}, opt || {}, { delay, kind:'ring', count }));
  }

  function fireDelayedBigSway(e, delay, opt){
    ensurePending(e);
    e.pendingShots.push(Object.assign({}, opt || {}, { delay, kind:'bigSway' }));
  }

  function fireDelayedTrident(e, delay, opt){
    ensurePending(e);
    e.pendingShots.push(Object.assign({}, opt || {}, { delay, kind:'trident' }));
  }

  function processPendingShots(e, tools){
    if (!e.pendingShots || !e.pendingShots.length) return;

    e.pendingShots.forEach(shot => shot.delay--);

    const ready = e.pendingShots.filter(shot => shot.delay <= 0);
    e.pendingShots = e.pendingShots.filter(shot => shot.delay > 0);

    ready.forEach(shot => {
      if (shot.kind === 'aim') fireAimed(e, tools, shot);
      if (shot.kind === 'angle') fireAngle(e, tools, shot.angle, shot);
      if (shot.kind === 'line') fireLineDown(e, tools, shot.count || 3, shot);
      if (shot.kind === 'homing') fireWeakHoming(e, tools, shot.count || 1, shot);
      if (shot.kind === 'fan') fireFanDown(e, tools, shot.count || 5, shot);
      if (shot.kind === 'spread') fireSpread(e, tools, shot.count || 3, shot.spread || 0.20, shot);
      if (shot.kind === 'ring') fireRing(e, tools, shot.count || 8, shot);
      if (shot.kind === 'bigSway') fireBigSwayFireball(e, tools, shot);
      if (shot.kind === 'trident') fireTrident(e, tools, shot);
    });
  }

  function chargeAimed(e, tools, text, count, opt){
    opt = opt || {};

    if (tools.addText && text) {
      tools.addText(text, e.x, e.y - 88, opt.textColor || '#ffe66b');
    }

    for (let i = 0; i < count; i++) {
      fireDelayedAimed(e, 46 + i * Number(opt.gap || 26), Object.assign({}, opt, {
        image: opt.image || undefined,
        flipY: opt.flipY,
        sizeType: opt.sizeType || 'big',
        hp: opt.hp != null ? opt.hp : 18,
        speed: opt.speed || 1.70,
        breakable: opt.breakable !== false
      }));
    }
  }

  function chargeLine(e, tools, text, count, opt){
    opt = opt || {};

    if (tools.addText && text) {
      tools.addText(text, e.x, e.y - 88, opt.textColor || '#ffe66b');
    }

    fireDelayedLine(e, Number(opt.delay || 50), count, Object.assign({}, opt, {
      image: opt.image || undefined,
      flipY: opt.flipY,
      sizeType: opt.sizeType || 'big',
      hp: opt.hp != null ? opt.hp : 16,
      speed: opt.speed || 1.86,
      breakable: opt.breakable !== false
    }));
  }

  function chargeHoming(e, tools, text, count, opt){
    opt = opt || {};

    if (tools.addText && text) {
      tools.addText(text, e.x, e.y - 88, opt.textColor || '#9deeff');
    }

    for (let i = 0; i < count; i++) {
      fireDelayedHoming(e, 40 + i * Number(opt.gap || 24), 1, Object.assign({}, opt, {
        image: opt.image || undefined,
        flipY: opt.flipY,
        sizeType: opt.sizeType || 'normal',
        hp: opt.hp != null ? opt.hp : 9,
        speed: opt.speed || 1.58,
        homingPower: opt.homingPower || 0.0034,
        breakable: opt.breakable !== false
      }));
    }
  }

  function chargeBigFireball(e, tools, text, opt){
    opt = opt || {};

    if (tools.addText) {
      tools.addText(text || 'ビッグ火の玉！', e.x, e.y - 92, opt.textColor || '#ffcf5b');
    }

    fireDelayedBigSway(e, Number(opt.delay || 70), Object.assign({}, opt, {
      x: opt.x != null ? opt.x : e.x,
      y: opt.y != null ? opt.y : e.y + 70,
      image: opt.image || DEFAULT_FIREBALL_IMAGE,
      flipY: opt.flipY != null ? opt.flipY : true,
      bossSpecial: true,
      special: true,
      breakable: opt.breakable !== false
    }));
  }

  function chargeGiantStrongBall(e, tools, text, opt){
    opt = opt || {};

    if (tools.addText) {
      tools.addText(text || '巨大玉！', e.x, e.y - 92, opt.textColor || '#6be6ff');
    }

    fireDelayedAimed(e, Number(opt.delay || 66), Object.assign({
      sizeType: 'super',
      speed: 0.84,
      hp: 40,
      dmg: 56,
      color: '#6be6ff',
      bossSpecial: true,
      special: true,
      breakable: true,
      slowBig: true,
      hitRate: 0.70,
      visualRate: 1.16,
      life: 640
    }, opt));
  }

  function fireTrident(e, tools, opt){
    return pushTrident(e, tools, Object.assign({
      angle: targetAngle(e, tools, e.x, e.y + 64),
      x: e.x,
      y: e.y + 64
    }, opt || {}));
  }

  function chargeTrident(e, tools, text, opt){
    opt = opt || {};

    if (tools.addText) {
      tools.addText(text || '巨大トライデント！', e.x, e.y - 92, opt.textColor || '#6be6ff');
    }

    fireDelayedTrident(e, Number(opt.delay || 72), Object.assign({
      sizeType: 'super',
      speed: 0.64,
      hp: 42,
      dmg: 68,
      color: '#6be6ff',
      bossSpecial: true,
      special: true,
      breakable: true,
      trident: true,
      pierce: true,
      rotate: true,
      hitRate: 0.55,
      visualRate: 1.20,
      life: 760
    }, opt));
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
        const speed = Number(b.homingSpeed || Math.hypot(b.vx, b.vy) || 1.5);

        b.vx = Math.cos(next) * speed;
        b.vy = Math.sin(next) * speed;
      }
    }

    if (b.wave) {
      b.x += Math.sin(b.bob * Number(b.waveSpeed || 0.04)) * Number(b.waveAmp || 0) * 0.035;
    }

    if (b.rotate) {
      b.angle = Number(b.angle || 0) + Number(b.rotateSpeed || 0.06);
    }
  }

  window.MobShotBossBullets = {
    pushEnemyBullet,
    pushUnbreakableBullet,
    pushBreakableFireball,
    pushBigFireball,
    pushGiantStrongBall,
    pushTrident,

    fireAimed,
    fireSlowAimed,
    fireUnbreakableAimed,
    fireAngle,
    fireSpread,
    fireSlowSpread,
    fireUnbreakableSpread,
    fireFanDown,
    fireSafeFanDown,
    fireLineDown,
    fireWeakHoming,
    fireBreakableHoming,
    fireWave,
    fireCross,
    fireRing,
    fireBarrage,
    fireBigSwayFireball,
    fireTrident,

    fireDelayedAimed,
    fireDelayedAngle,
    fireDelayedLine,
    fireDelayedHoming,
    fireDelayedFan,
    fireDelayedSpread,
    fireDelayedRing,
    fireDelayedBigSway,
    fireDelayedTrident,

    processPendingShots,

    chargeAimed,
    chargeLine,
    chargeHoming,
    chargeBigFireball,
    chargeGiantStrongBall,
    chargeTrident,

    updateEnemyBullet,
    DEFAULT_FIREBALL_IMAGE
  };
})();
