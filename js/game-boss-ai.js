'use strict';

(function(){
  function data(){
    return window.MobShotBossData;
  }

  function bullets(){
    return window.MobShotBossBullets;
  }

  function skills(){
    return window.MobShotBossSkills;
  }

  function fixBossName(name){
    if (name === '番人') return 'モブガーディアン';
    if (name === '番人Ⅱ') return 'モブガーディアンⅡ';
    if (name === '番人II') return 'モブガーディアンⅡ';
    return name;
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

    return raw || 'easy';
  }

  function difficultyBalance(e){
    const key = normalizeDifficultyKey(e.eventDifficulty || e.__doubleDifficulty || '');

    if (key === 'hard') {
      return { cd:0.88, speed:1.08, bullet:1.08, move:1.10 };
    }

    if (key === 'veryHard') {
      return { cd:0.76, speed:1.16, bullet:1.18, move:1.18 };
    }

    if (key === 'inferno') {
      return { cd:0.64, speed:1.26, bullet:1.35, move:1.26 };
    }

    if (key === 'legend') {
      return { cd:0.52, speed:1.38, bullet:1.55, move:1.36 };
    }

    return { cd:1, speed:1, bullet:1, move:1 };
  }

  function fallbackConfig(isBoss){
    return {
      type: isBoss ? 'hawk' : 'ptera',
      shootCd: isBoss ? 175 : 165,
      attackCd: isBoss ? 285 : 245,
      moveSpeed: isBoss ? 1.05 : 1.05,
      patterns: isBoss ? ['threeWayNormal', 'fastFourBurst', 'hugeThreeWay'] : ['unbreakableNormalShot', 'threeWayNormal'],
      spawnWeakEnemies: isBoss,
      spawnStageObstacles: !isBoss,
      normalAttackBreakable: false,
      specialHpMul: 1.65
    };
  }

  function getAttackSpec(e){
    const name = fixBossName(e.name);

    if (data() && data().getAttackSpec) {
      return data().getAttackSpec(name);
    }

    return {
      image:'atk/hinotama.png',
      fallbackImage:'atk/hinotama.png',
      flipY:true,
      small:24,
      normal:32,
      big:46,
      huge:60,
      super:74,
      color:'#ff7a35'
    };
  }

  function getBossConfig(e){
    const fixedName = fixBossName(e.name);
    if (e.name !== fixedName) e.name = fixedName;

    if (data() && data().getBossConfig) {
      return data().getBossConfig(fixedName) || fallbackConfig(true);
    }

    return fallbackConfig(true);
  }

  function getMidBossConfig(e){
    const fixedName = fixBossName(e.name);
    if (e.name !== fixedName) e.name = fixedName;

    if (data() && data().getMidBossConfig) {
      return data().getMidBossConfig(fixedName) || fallbackConfig(false);
    }

    return fallbackConfig(false);
  }

  function getPatterns(config, isBoss){
    if (config && Array.isArray(config.patterns) && config.patterns.length) {
      return config.patterns;
    }

    return isBoss ? fallbackConfig(true).patterns : fallbackConfig(false).patterns;
  }

  function clamp(v,a,b){
    return Math.max(a, Math.min(b, v));
  }

  function isDoubleOrCoop(tools){
    return !!(
      (tools && tools.state && tools.state.coopMode && tools.state.coopMode.active) ||
      (window.MobShotEvents && window.MobShotEvents.isDoubleBoss && window.MobShotEvents.isDoubleBoss())
    );
  }

  function attackRateMul(tools){
    return isDoubleOrCoop(tools) ? 1.12 : 1;
  }

  function speedMulByType(type){
    if (type === 'neon' || type === 'blueNeo' || type === 'purpleNeo' || type === 'smith') return 0.92;
    if (type === 'hawk' || type === 'mira' || type === 'lilith' || type === 'ultraLilith') return 0.88;
    if (type === 'guardian' || type === 'mail') return 0.70;
    if (type === 'dragon' || type === 'maoh' || type === 'enma') return 0.78;
    return 0.82;
  }

  function moveRange(tools, isBoss){
    const center = tools.W * 0.5;
    const width = isBoss ? tools.W * 0.31 : tools.W * 0.29;

    return {
      center,
      left:center - width,
      right:center + width
    };
  }

  function initEnemyBase(e, config, isBoss){
    if (e.__bossAiInit) return;

    e.name = fixBossName(e.name);
    e.__bossAiInit = true;
    e.aiTimer = 0;

    const bal = difficultyBalance(e);
    const slowMul = isBoss ? 1.10 : 1.05;

    e.shootCd = Math.max(
      isBoss ? 58 : 50,
      Math.floor(Number(e.shootCd || config.shootCd || 150) * slowMul * bal.cd)
    );

    e.attackCd = Math.max(
      isBoss ? 95 : 82,
      Math.floor(Number(e.attackCd || config.attackCd || 230) * slowMul * bal.cd)
    );

    e.attackStep = Number(e.attackStep || 0);
    e.patternStep = Number(e.patternStep || 0);
    e.pendingShots = [];
    e.specialMove = '';
    e.specialTimer = 0;
    e.specialVx = 0;
    e.hitPlayerCd = 0;
    e.summonCount = 0;
    e.stageSummonCd = Math.floor((230 + Math.random() * 110) * bal.cd);
    e.stageObstacleCd = Math.floor((180 + Math.random() * 80) * bal.cd);
    e.cloneUsed = false;
    e.sistersUsed = false;
    e.healUsed = false;
    e.extraHealUsed = false;
    e.barrierTimer = 0;
    e.barrierHp = 0;
    e.frontBarrierTimer = 0;
    e.frontBarrierHp = 0;
    e.circleBarrierTimer = 0;
    e.circleBarrierHp = 0;
    e.ghostTimer = 0;
    e.alpha = 1;

    e.baseY = Number(e.baseY || e.targetY || 0);
    e.movePhase = Math.random() * Math.PI * 2;

    e.moveTargetX = e.x;
    e.moveTargetY = e.y;
    e.moveRetargetCd = 0;

    const baseSpeed = Number(config.moveSpeed || 1.2) * speedMulByType(config.type) * bal.move;
    e.baseVx = Math.max(0.55, baseSpeed);
    e.vx = e.baseVx * (Math.random() < 0.5 ? -1 : 1);

    e.bigFireballCd = Math.floor((330 + Math.random() * 140) * bal.cd);
    e.lastBigFireballFrame = -9999;
  }

  function updateEntrance(e){
    if (e.y < e.targetY) {
      e.y += Math.min(2.0, e.vy || 1.65);
      return true;
    }

    if (!e.baseY) e.baseY = e.y;
    return false;
  }

  function updateCommonTimers(e){
    e.aiTimer = Number(e.aiTimer || 0) + 1;

    if (e.hitPlayerCd > 0) e.hitPlayerCd--;

    if (e.barrierTimer > 0) {
      e.barrierTimer--;
      if (e.barrierTimer <= 0) e.barrierHp = 0;
    }

    if (e.frontBarrierTimer > 0) {
      e.frontBarrierTimer--;
      if (e.frontBarrierTimer <= 0) e.frontBarrierHp = 0;
    }

    if (e.circleBarrierTimer > 0) {
      e.circleBarrierTimer--;
      if (e.circleBarrierTimer <= 0) e.circleBarrierHp = 0;
    }

    if (e.ghostTimer > 0) {
      e.ghostTimer--;
      e.alpha = 0.32;
      if (e.ghostTimer <= 0) e.alpha = 1;
    }

    if (e.specialTimer > 0) e.specialTimer--;
    if (e.bigFireballCd > 0) e.bigFireballCd--;
    if (e.stageSummonCd > 0) e.stageSummonCd--;
    if (e.stageObstacleCd > 0) e.stageObstacleCd--;
    if (e.moveRetargetCd > 0) e.moveRetargetCd--;
  }

  function retargetInterval(type, isBoss){
    if (type === 'neon' || type === 'blueNeo' || type === 'purpleNeo' || type === 'smith') return isBoss ? 55 : 45;
    if (type === 'guardian' || type === 'mail') return isBoss ? 95 : 75;
    if (type === 'dragon' || type === 'maoh' || type === 'enma') return isBoss ? 75 : 62;
    return isBoss ? 65 : 52;
  }

  function targetSpread(type, tools, isBoss){
    if (type === 'guardian' || type === 'mail') return tools.W * (isBoss ? 0.20 : 0.17);
    if (type === 'dragon' || type === 'maoh' || type === 'enma') return tools.W * (isBoss ? 0.28 : 0.23);
    if (type === 'neon' || type === 'blueNeo' || type === 'purpleNeo' || type === 'smith') return tools.W * (isBoss ? 0.31 : 0.26);
    return tools.W * (isBoss ? 0.27 : 0.23);
  }

  function pickMoveTarget(e, tools, config, isBoss){
    const r = moveRange(tools, isBoss);
    const type = config.type;
    const baseY = e.baseY || (isBoss ? tools.H * 0.24 : tools.H * 0.26);

    const minY = isBoss ? tools.H * 0.10 : tools.H * 0.14;
    const maxY = isBoss ? tools.H * 0.36 : tools.H * 0.39;

    const spread = targetSpread(type, tools, isBoss);
    const margin = tools.W * 0.035;

    let tx = r.center + tools.rand(-spread, spread);

    if (e.x < r.left + margin) tx = r.center + tools.rand(0, spread);
    if (e.x > r.right - margin) tx = r.center - tools.rand(0, spread);

    let yAmp = isBoss ? 18 : 15;

    if (type === 'guardian' || type === 'mail') yAmp = 8;
    if (type === 'neon' || type === 'blueNeo' || type === 'purpleNeo' || type === 'smith') yAmp = 24;
    if (type === 'mira' || type === 'hawk') yAmp = 20;

    e.moveTargetX = clamp(tx, r.left + margin, r.right - margin);
    e.moveTargetY = clamp(baseY + tools.rand(-yAmp, yAmp), minY, maxY);
    e.moveRetargetCd = Math.floor(retargetInterval(type, isBoss) * difficultyBalance(e).cd);
  }

  function moveBase(e, tools, config, isBoss){
    const r = moveRange(tools, isBoss);
    const minY = isBoss ? tools.H * 0.10 : tools.H * 0.14;
    const maxY = isBoss ? tools.H * 0.36 : tools.H * 0.39;
    const speed = Math.max(0.35, Number(e.baseVx || config.moveSpeed || 1));

    if (e.specialMove === 'sideRapid') {
      if (!e.specialVx) {
        e.specialVx = speed * 1.8 * (Math.random() < 0.5 ? -1 : 1);
      }

      e.x += e.specialVx;

      if (e.x <= r.left) {
        e.x = r.left + 8;
        e.specialVx = Math.abs(e.specialVx);
      }

      if (e.x >= r.right) {
        e.x = r.right - 8;
        e.specialVx = -Math.abs(e.specialVx);
      }

      e.y += ((e.baseY || e.y) - e.y) * 0.028;

      if (e.specialTimer <= 0) {
        e.specialMove = '';
        e.specialVx = 0;
        e.moveRetargetCd = 0;
      }
    } else if (e.specialMove === 'swayDash') {
      if (!e.specialBaseX) e.specialBaseX = e.x;
      if (!e.specialDashVy) e.specialDashVy = 3.2 * difficultyBalance(e).move;

      e.y += e.specialDashVy;
      e.x = e.specialBaseX + Math.sin(e.aiTimer * 0.34) * tools.W * 0.13;

      if (e.y > tools.H * 0.62 || e.specialTimer <= 0) {
        e.specialMove = 'dashReturn';
        e.specialTimer = 80;
        e.specialBaseX = 0;
      }
    } else if (e.specialMove === 'fastDash') {
      if (!e.specialDashVy) e.specialDashVy = 4.2 * difficultyBalance(e).move;

      e.y += e.specialDashVy;

      if (e.y > tools.H * 0.64 || e.specialTimer <= 0) {
        e.specialMove = 'dashReturn';
        e.specialTimer = 80;
      }
    } else if (e.specialMove === 'dashReturn') {
      const tx = tools.W * 0.5;
      const ty = e.baseY || (isBoss ? tools.H * 0.24 : tools.H * 0.26);

      e.x += (tx - e.x) * 0.05;
      e.y += (ty - e.y) * 0.065;

      if (Math.abs(e.y - ty) < 4 || e.specialTimer <= 0) {
        e.y = ty;
        e.specialMove = '';
        e.specialDashVy = 0;
        e.moveRetargetCd = 0;
      }
    } else {
      const dx = Number(e.moveTargetX || e.x) - e.x;

      if (
        e.moveRetargetCd <= 0 ||
        Math.abs(dx) < 4 ||
        e.x <= r.left + 4 ||
        e.x >= r.right - 4
      ) {
        pickMoveTarget(e, tools, config, isBoss);
      }

      let followX = 0.038;
      let followY = 0.030;

      if (config.type === 'guardian' || config.type === 'mail') {
        followX = 0.026;
        followY = 0.020;
      }

      if (config.type === 'neon' || config.type === 'smith' || config.type === 'blueNeo' || config.type === 'purpleNeo') {
        followX = 0.052;
        followY = 0.038;
      }

      if (e.barrierTimer > 0 || e.frontBarrierTimer > 0 || e.circleBarrierTimer > 0) {
        followX *= 0.6;
        followY *= 0.6;
      }

      e.x += (e.moveTargetX - e.x) * followX;
      e.y += (e.moveTargetY - e.y) * followY;

      e.x += (r.center - e.x) * (isBoss ? 0.0012 : 0.001);
    }

    if (e.x < r.left) {
      e.x = r.left + 6;
      e.moveRetargetCd = 0;
    }

    if (e.x > r.right) {
      e.x = r.right - 6;
      e.moveRetargetCd = 0;
    }

    e.y = clamp(e.y, minY, maxY + tools.H * 0.28);
  }

  function updateDiveReturn(e, tools){
    if (!e.diveReturn) return false;

    e.y += Math.min(2.1, e.vy || 1.8);

    if (e.y >= e.baseY) {
      e.y = e.baseY;
      e.diveReturn = false;
      e.targetY = e.baseY;
      e.moveRetargetCd = 0;
    }

    return true;
  }

  function safeProcessPendingShots(e, tools){
    if (bullets() && bullets().processPendingShots) {
      bullets().processPendingShots(e, tools);
    }
  }

  function updateBossBullets(tools){
    if (!bullets() || !bullets().updateEnemyBullet) return;

    tools.state.entities.forEach(ent => {
      if (ent && ent.kind === 'enemyBullet' && !ent.dead) {
        bullets().updateEnemyBullet(ent, tools);
      }
    });
  }

  function bulletOpt(e, sizeType, extra){
    const spec = getAttackSpec(e);
    const bal = difficultyBalance(e);
    const hpMul = data() && data().getSpecialHpMultiplier ? data().getSpecialHpMultiplier(e.name) : 1.65;
    const opt = Object.assign({
      sizeType:sizeType || 'normal',
      image:spec.image || spec.fallbackImage || 'atk/hinotama.png',
      fallbackImage:spec.fallbackImage || 'atk/hinotama.png',
      flipY:spec.flipY !== false,
      color:spec.color || '#ff7a35',
      speed:1.65 * bal.speed,
      hp:7,
      breakable:true
    }, extra || {});

    if (opt.breakable === false) {
      opt.hp = 0;
    } else if (opt.special || opt.sizeType === 'huge' || opt.sizeType === 'super') {
      opt.hp = Math.ceil(Number(opt.hp || 8) * hpMul);
    }

    return opt;
  }

  function shouldNormalBreak(e, rate){
    const r = rate == null ? 0.72 : Number(rate);
    e.__normalBreakRoll = Number(e.__normalBreakRoll || 0) + 1;

    if (e.__normalBreakRoll % 4 === 0) return false;

    return Math.random() < r;
  }

  function normalOpt(e, sizeType, extra){
    const breakable = shouldNormalBreak(e, 0.74);

    return bulletOpt(e, sizeType || 'normal', Object.assign({
      hp: breakable ? 6 : 0,
      breakable,
      special:false
    }, extra || {}));
  }

  function directBullet(e, tools, angle, opt){
    opt = opt || {};
    const spec = getAttackSpec(e);

    const speed = Number(opt.speed || 1.8);
    const sizeType = opt.sizeType || 'normal';

    let r = Number(opt.r || 0);
    if (!r) {
      if (sizeType === 'small') r = Number(spec.small || 24);
      else if (sizeType === 'big') r = Number(spec.big || 46);
      else if (sizeType === 'huge') r = Number(spec.huge || 60);
      else if (sizeType === 'super') r = Number(spec.super || 74);
      else r = Number(spec.normal || 32);
    }

    const hp = opt.breakable === false ? 0 : Number(opt.hp || 0);

    tools.state.entities.push({
      kind: 'enemyBullet',
      x: e.x + Number(opt.xOffset || 0),
      y: e.y + (opt.yOffset || 56),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r,
      visualR: Math.ceil(r * 1.08),
      hitR: Math.ceil(r * 0.82),
      dmg: Number(opt.dmg || Math.max(5, Math.ceil(r * 0.34 * difficultyBalance(e).bullet))),
      hp,
      maxHp: hp,
      breakable: hp > 0,
      dead: false,
      bob: 0,
      color: opt.color || spec.color || '#ff7a35',
      image: opt.image || spec.image || spec.fallbackImage || 'atk/hinotama.png',
      fallbackImage: opt.fallbackImage || spec.fallbackImage || 'atk/hinotama.png',
      flipY: opt.flipY !== false,
      life: Number(opt.life || 430),
      fromBoss: true,
      bossSpecial: !!opt.special,
      glow: opt.glow !== false,
      pierce: !!opt.pierce,
      trident: !!opt.trident,
      shield: !!opt.shield,
      barrier: !!opt.barrier
    });
  }

  function directSpread(e, tools, count, spread, opt){
    opt = opt || {};

    const target = tools.state.player;
    const dx = target.x - e.x;
    const dy = target.y - e.y;
    const base = Math.atan2(dy, dx);
    const safeCenter = !!opt.safeCenter;

    for (let i = 0; i < count; i++) {
      if (safeCenter && i === Math.floor(count / 2)) continue;
      directBullet(e, tools, base + (i - (count - 1) / 2) * spread, opt);
    }
  }

  function directRing(e, tools, count, opt){
    opt = opt || {};
    const base = Math.random() * Math.PI * 2;

    for (let i = 0; i < count; i++) {
      directBullet(e, tools, base + Math.PI * 2 * i / count, opt);
    }
  }

  function directLine(e, tools, count, opt){
    opt = opt || {};

    const target = tools.state.player;
    const base = Math.atan2(target.y - e.y, target.x - e.x);

    for (let i = 0; i < count; i++) {
      setTimeout(function(){
        if (!e.dead) directBullet(e, tools, base, opt);
      }, i * 70);
    }
  }

  function safeFireSpread(e, tools, count, spread, opt){
    opt = bulletOpt(e, opt && opt.sizeType ? opt.sizeType : 'normal', opt || {});
    const before = tools.state.entities.length;

    try {
      if (bullets()) {
        if (bullets().fireSlowSpread) {
          bullets().fireSlowSpread(e, tools, count, spread, opt);
        } else if (bullets().fireSpread) {
          bullets().fireSpread(e, tools, count, spread, opt);
        }
      }
    } catch (err) {
      console.error('boss fireSpread error:', e.name, err);
    }

    if (tools.state.entities.length <= before) {
      directSpread(e, tools, count, spread, opt);
    }
  }

  function canUseBigFireball(e, tools){
    if (!bullets() || !bullets().chargeBigFireball) return false;
    if (e.bigFireballCd > 0) return false;

    return !tools.state.entities.some(ent =>
      ent && ent.kind === 'enemyBullet' && ent.bossSpecial && !ent.dead
    );
  }

  function tryBigFireball(e, tools, text, opt){
    if (!canUseBigFireball(e, tools)) return false;

    e.bigFireballCd = Math.floor((isDoubleOrCoop(tools) ? 520 : 420) * difficultyBalance(e).cd);
    e.lastBigFireballFrame = tools.frame ? tools.frame() : 0;

    const finalOpt = bulletOpt(e, 'super', Object.assign({ special:true, hp:18 }, opt || {}));
    bullets().chargeBigFireball(e, tools, text || 'ビッグ火の玉！', finalOpt);
    return true;
  }

  function startSideRapid(e, tools){
    e.specialMove = 'sideRapid';
    e.specialTimer = 95;
    e.specialVx = 0;

    if (tools.addText) tools.addText('高速移動！', e.x, e.y - 80, '#ffffff');
  }

  function startFastDash(e, tools, label){
    e.specialMove = 'fastDash';
    e.specialTimer = 90;
    e.specialDashVy = 0;

    if (tools.addText) tools.addText(label || '高速突進！', e.x, e.y - 80, '#ffef6b');
  }

  function startSwayDash(e, tools, label){
    e.specialMove = 'swayDash';
    e.specialTimer = 120;
    e.specialBaseX = e.x;
    e.specialDashVy = 0;

    if (tools.addText) tools.addText(label || 'ジグザグ突進！', e.x, e.y - 80, '#ffcf5b');
  }

  function setGhost(e, tools, frames){
    e.ghostTimer = frames || 180;
    e.alpha = 0.32;

    if (tools.addText) tools.addText('透明化！', e.x, e.y - 84, '#b78cff');
  }

  function setBarrier(e, tools, type){
    const hpRate = type === 'circle' ? 0.075 : type === 'front' ? 0.055 : 0.06;
    const hp = Math.max(10, Math.ceil(Number(e.maxHp || 100) * hpRate * (data() && data().getSpecialHpMultiplier ? data().getSpecialHpMultiplier(e.name) : 1.65)));

    if (type === 'front') {
      e.frontBarrierTimer = 210;
      e.frontBarrierHp = hp;
      if (tools.addText) tools.addText('前面バリア！', e.x, e.y - 86, '#ffcf5b');
      return;
    }

    if (type === 'circle') {
      e.circleBarrierTimer = 240;
      e.circleBarrierHp = hp;
      if (tools.addText) tools.addText('円形バリア！', e.x, e.y - 88, '#ff4aff');
      return;
    }

    e.barrierTimer = 190;
    e.barrierHp = hp;
    if (tools.addText) tools.addText('バリア！', e.x, e.y - 86, '#ff8cff');
  }

  function getAreaZakoList(tools){
    const D = tools.D;

    if (
      D &&
      D.enemies &&
      Array.isArray(D.enemies.zako) &&
      D.enemies.zako.length
    ) {
      return D.enemies.zako;
    }

    return [];
  }

  function summonStageEnemy(e, tools, count, hpRate){
    const list = getAreaZakoList(tools);
    if (!list.length) return;

    const total = Number(count || 1);
    const rate = Number(hpRate || 0.72);

    for (let i = 0; i < total; i++) {
      const def = list[(Number(e.summonCount || 0) + i) % list.length];
      const hp = Math.max(3, Math.ceil(Number(def.hp || 5) * rate * difficultyBalance(e).bullet));

      tools.state.entities.push({
        kind:'enemy',
        name:def.name,
        image:def.image,
        x:tools.rand(tools.W * 0.18, tools.W * 0.82),
        y:-80 - i * 54,
        vx:tools.rand(-0.35, 0.35),
        vy:1.05,
        r:def.name === 'モブロック' ? 34 : 30,
        hp,
        maxHp:hp,
        value:hp,
        score:Number(def.score || 10),
        coinMin:Number(def.coinMin || 1),
        coinMax:Number(def.coinMax || 3),
        dead:false,
        bob:tools.rand(0, Math.PI * 2),
        aiType:i % 2 === 0 ? 'sway' : 'hop',
        isBossMinion:true
      });
    }

    e.summonCount = Number(e.summonCount || 0) + total;

    if (tools.addText) tools.addText('召喚！', e.x, e.y - 72, '#dfeaff');
  }

  function spawnStageObstacle(e, tools){
    if (!tools || !tools.state || !Array.isArray(tools.state.entities)) return;

    const hp = Math.max(8, Math.ceil(Number(e.maxHp || 100) * 0.025));
    const x = clamp(tools.rand(tools.W * 0.18, tools.W * 0.82), tools.W * 0.12, tools.W * 0.88);

    tools.state.entities.push({
      kind:'obstacle',
      name:'ステージ障害物',
      x,
      y:-60,
      w:58,
      h:58,
      r:30,
      hp,
      maxHp:hp,
      value:hp,
      score:8,
      coinMin:1,
      coinMax:2,
      vy:1.45,
      dead:false
    });
  }

  function maybeSummonStageEnemies(e, tools, config){
    const allow = config.spawnWeakEnemies !== false;
    if (!allow || e.stageSummonCd > 0) return;

    e.stageSummonCd = Math.floor((300 + Math.random() * 140) * difficultyBalance(e).cd);

    summonStageEnemy(e, tools, Math.random() < 0.45 ? 2 : 1, 0.65);
  }

  function maybeSpawnStageObstacles(e, tools, config){
    const allow = config.spawnStageObstacles !== false;
    if (!allow || e.stageObstacleCd > 0) return;

    e.stageObstacleCd = Math.floor((220 + Math.random() * 120) * difficultyBalance(e).cd);
    spawnStageObstacle(e, tools);
  }

  function runPattern(e, tools, config, key, isBoss){
    const bal = difficultyBalance(e);

    switch(key){
      case 'unbreakableNormalShot':
        safeFireSpread(e, tools, isBoss ? 3 : 2, 0.20, {
          sizeType:'small',
          speed:(isBoss ? 1.95 : 1.72) * bal.speed,
          hp:0,
          breakable:false
        });
        return true;

      case 'fourWayNormal':
        directRing(e, tools, 4, normalOpt(e, 'normal', { speed:1.55 * bal.speed, hp:7 }));
        return true;

      case 'fiveWayNormal':
        directRing(e, tools, 5, normalOpt(e, 'normal', { speed:1.55 * bal.speed, hp:7 }));
        return true;

      case 'threeWayNormal':
        safeFireSpread(e, tools, 3, 0.22, normalOpt(e, 'normal', { speed:1.7 * bal.speed, hp:7 }));
        return true;

      case 'twoWayNormal':
        safeFireSpread(e, tools, 2, 0.28, normalOpt(e, 'normal', { speed:1.75 * bal.speed, hp:7 }));
        return true;

      case 'oneWayFastNormal':
        directLine(e, tools, 1, normalOpt(e, 'normal', { speed:2.35 * bal.speed, hp:7 }));
        return true;

      case 'randomThreeNormal':
        directRing(e, tools, 3, normalOpt(e, 'normal', { speed:1.55 * bal.speed, hp:7 }));
        return true;

      case 'randomFiveNormal':
        directRing(e, tools, 5, normalOpt(e, 'normal', { speed:1.55 * bal.speed, hp:7 }));
        return true;

      case 'randomSixNormal':
        directRing(e, tools, 6, normalOpt(e, 'normal', { speed:1.52 * bal.speed, hp:7 }));
        return true;

      case 'fourWayDifferentSpeed':
        for (let i = 0; i < 4; i++) {
          directBullet(e, tools, Math.PI * 0.5 + (i - 1.5) * 0.45, normalOpt(e, 'normal', {
            speed:(1.15 + i * 0.22) * bal.speed,
            hp:7
          }));
        }
        return true;

      case 'fastThreeBurst':
        directLine(e, tools, 3, normalOpt(e, 'small', { speed:2.35 * bal.speed, hp:5 }));
        return true;

      case 'fastFourBurst':
        directLine(e, tools, 4, normalOpt(e, 'small', { speed:2.25 * bal.speed, hp:5 }));
        return true;

      case 'fastSixBurst':
        directLine(e, tools, 6, normalOpt(e, 'small', { speed:2.18 * bal.speed, hp:5 }));
        return true;

      case 'fastEightBurst':
        directLine(e, tools, 8, normalOpt(e, 'small', { speed:2.10 * bal.speed, hp:5 }));
        return true;

      case 'superFastThreeBurst':
        directLine(e, tools, 3, normalOpt(e, 'small', { speed:2.75 * bal.speed, hp:5 }));
        return true;

      case 'slowHugeThreeWay':
        safeFireSpread(e, tools, 3, 0.28, { sizeType:'huge', speed:0.95 * bal.speed, hp:14, special:true });
        return true;

      case 'slowHugeFiveWay':
        safeFireSpread(e, tools, 5, 0.22, { sizeType:'huge', speed:0.9 * bal.speed, hp:15, special:true });
        return true;

      case 'hugeTwoWay':
        safeFireSpread(e, tools, 2, 0.34, { sizeType:'huge', speed:1.08 * bal.speed, hp:15, special:true });
        return true;

      case 'hugeThreeWay':
        safeFireSpread(e, tools, 3, 0.28, { sizeType:'huge', speed:1.08 * bal.speed, hp:16, special:true });
        return true;

      case 'hugeFourWay':
        directRing(e, tools, 4, bulletOpt(e, 'huge', { speed:1.0 * bal.speed, hp:16, special:true }));
        return true;

      case 'hugeFiveWay':
        safeFireSpread(e, tools, 5, 0.22, { sizeType:'huge', speed:1.02 * bal.speed, hp:17, special:true });
        return true;

      case 'hugeEightWay':
        directRing(e, tools, 8, bulletOpt(e, 'huge', { speed:0.96 * bal.speed, hp:18, special:true }));
        return true;

      case 'chargedHugeTriple':
        return tryBigFireball(e, tools, '巨大3連射！', { hp:20, speed:1.0 * bal.speed, special:true });

      case 'chargedHugeFive':
        return tryBigFireball(e, tools, '巨大5連射！', { hp:24, speed:1.0 * bal.speed, special:true });

      case 'chargedSlowThree':
        safeFireSpread(e, tools, 3, 0.22, { sizeType:'super', speed:0.72 * bal.speed, hp:20, special:true });
        return true;

      case 'chargedSlowFive':
        safeFireSpread(e, tools, 5, 0.18, { sizeType:'super', speed:0.68 * bal.speed, hp:22, special:true });
        return true;

      case 'chargedSlowTen':
        directRing(e, tools, 10, bulletOpt(e, 'super', { speed:0.58 * bal.speed, hp:24, special:true }));
        return true;

      case 'fastDash':
      case 'dash':
        startFastDash(e, tools, '高速突進！');
        return true;

      case 'swayDash':
        startSwayDash(e, tools, '左右揺れ突進！');
        return true;

      case 'fastDashBarrage':
        startFastDash(e, tools, '高速突進乱射！');
        directLine(e, tools, 6, normalOpt(e, 'small', { speed:2.15 * bal.speed, hp:5 }));
        return true;

      case 'swayBarrage':
        startSwayDash(e, tools, '左右揺れ乱射！');
        directRing(e, tools, 12, normalOpt(e, 'small', { speed:1.55 * bal.speed, hp:5 }));
        return true;

      case 'stationaryBarrage':
        e.specialMove = '';
        directRing(e, tools, 16, normalOpt(e, 'small', { speed:1.45 * bal.speed, hp:5 }));
        if (tools.addText) tools.addText('その場乱射！', e.x, e.y - 80, '#b78cff');
        return true;

      case 'invisibleThreeSeconds':
        setGhost(e, tools, 180);
        return true;

      case 'invisibleHugeTriple':
        setGhost(e, tools, 180);
        safeFireSpread(e, tools, 3, 0.22, { sizeType:'huge', speed:0.95 * bal.speed, hp:17, special:true });
        return true;

      case 'invisibleHugeFive':
        setGhost(e, tools, 180);
        safeFireSpread(e, tools, 5, 0.18, { sizeType:'huge', speed:0.92 * bal.speed, hp:18, special:true });
        return true;

      case 'frontBreakableBarrier':
        setBarrier(e, tools, 'front');
        return true;

      case 'circleBreakableBarrier':
      case 'darkBreakableBarrier':
        setBarrier(e, tools, 'circle');
        return true;

      case 'breakableBarrierThreeSeconds':
        setBarrier(e, tools, 'normal');
        e.barrierTimer = Math.max(e.barrierTimer, 180);
        return true;

      case 'giantStrongBall':
        safeFireSpread(e, tools, 1, 0, {
          sizeType:'super',
          speed:0.78 * bal.speed,
          hp:28,
          special:true,
          dmg:34 * bal.bullet
        });
        if (tools.addText) tools.addText('巨大玉！', e.x, e.y - 84, '#6be6ff');
        return true;

      case 'weakFlameBarrage':
        directLine(e, tools, 10, bulletOpt(e, 'small', {
          speed:1.75 * bal.speed,
          hp:4,
          dmg:6 * bal.bullet,
          special:false
        }));
        if (tools.addText) tools.addText('火炎乱射！', e.x, e.y - 84, '#ff5b35');
        return true;

      case 'giantSlowTrident':
        safeFireSpread(e, tools, 1, 0, {
          sizeType:'super',
          speed:0.56 * bal.speed,
          hp:30,
          special:true,
          trident:true,
          dmg:38 * bal.bullet
        });
        if (tools.addText) tools.addText('巨大トライデント！', e.x, e.y - 88, '#6be6ff');
        return true;

      case 'summonStageZako':
      case 'summonZako':
        summonStageEnemy(e, tools, 2, 0.65);
        return true;

      case 'activeMovingClones':
      case 'summonLilithClones':
        if (skills() && skills().summonLilithSisters) {
          skills().summonLilithSisters(e, tools, { moveBoost:Number(config.cloneMoveBoost || 1.65) });
          return true;
        }
        directRing(e, tools, 10, bulletOpt(e, 'small', { speed:1.45 * bal.speed, hp:5 }));
        return true;

      case 'healTenPercent':
        if (!e.extraHealUsed) {
          e.extraHealUsed = true;
          if (skills() && skills().healBoss) skills().healBoss(e, tools, 0.10);
          else e.hp = Math.min(e.maxHp, e.hp + e.maxHp * 0.10);
          if (tools.addText) tools.addText('HP回復！', e.x, e.y - 90, '#9dff73');
        }
        return true;

      case 'lightningRandomTen':
      case 'wideRandomFast':
      case 'approachRandomFast':
      case 'randomSixBurst':
      case 'randomFiveBurst':
        directRing(e, tools, key === 'lightningRandomTen' ? 10 : 6, normalOpt(e, 'small', {
          speed:1.75 * bal.speed,
          hp:key === 'lightningRandomTen' ? 8 : 5
        }));
        return true;

      case 'threeWayDouble':
        safeFireSpread(e, tools, 3, 0.24, { sizeType:'small', speed:1.8 * bal.speed, hp:5 });
        setTimeout(function(){
          if (!e.dead) safeFireSpread(e, tools, 3, 0.24, { sizeType:'small', speed:1.8 * bal.speed, hp:5 });
        }, 160);
        return true;

      case 'fakeDashThreeWay':
        if (tools.addText) tools.addText('フェイク！', e.x, e.y - 72, '#ffffff');
        safeFireSpread(e, tools, 3, 0.22, { sizeType:'small', speed:1.9 * bal.speed, hp:5 });
        return true;

      case 'speedMoveShot':
        startSideRapid(e, tools);
        directLine(e, tools, 4, normalOpt(e, 'small', { speed:2.15 * bal.speed, hp:5 }));
        return true;

      case 'twoWayBurst':
        safeFireSpread(e, tools, 2, 0.30, normalOpt(e, 'small', { speed:1.95 * bal.speed, hp:5 }));
        return true;

      case 'homingBreakable':
      case 'homingBreakableDouble':
      case 'jumpHomingBreakable':
      case 'farHomingFive':
        directLine(e, tools, key === 'farHomingFive' ? 5 : key === 'homingBreakableDouble' ? 2 : 1, bulletOpt(e, 'normal', {
          speed:1.35 * bal.speed,
          hp:12,
          special:true
        }));
        return true;

      case 'slowHugeBreakable':
        safeFireSpread(e, tools, 1, 0, { sizeType:'huge', speed:0.8 * bal.speed, hp:16, special:true });
        return true;

      case 'sideFastContinuous':
      case 'randomMoveFastContinuous':
      case 'movingFastFourBurst':
        startSideRapid(e, tools);
        directLine(e, tools, key === 'movingFastFourBurst' ? 4 : 6, normalOpt(e, 'small', {
          speed:2.05 * bal.speed,
          hp:5
        }));
        return true;

      case 'approachFastContinuous':
        directLine(e, tools, 6, normalOpt(e, 'small', { speed:1.95 * bal.speed, hp:5 }));
        return true;

      case 'jumpHugeFour':
        directRing(e, tools, 4, bulletOpt(e, 'huge', { speed:0.9 * bal.speed, hp:16, special:true }));
        return true;

      case 'jumpHugeSix':
        directRing(e, tools, 6, bulletOpt(e, 'huge', { speed:0.9 * bal.speed, hp:18, special:true }));
        return true;

      case 'halfHpSummonMidAndZako':
        if (!e.halfSummonUsed && e.hp <= e.maxHp * 0.5) {
          e.halfSummonUsed = true;
          summonStageEnemy(e, tools, 5, 0.55);
          return true;
        }
        return false;

      case 'teleportAttack':
        e.x = clamp(tools.rand(tools.W * 0.20, tools.W * 0.80), tools.W * 0.15, tools.W * 0.85);
        e.y = clamp(tools.rand(tools.H * 0.12, tools.H * 0.34), tools.H * 0.10, tools.H * 0.38);
        directRing(e, tools, 8, normalOpt(e, 'normal', { speed:1.45 * bal.speed, hp:7 }));
        if (tools.addText) tools.addText('瞬間移動！', e.x, e.y - 84, '#ff4aff');
        return true;

      case 'summonLilithOnce':
        if (!e.sistersUsed) {
          e.sistersUsed = true;
          if (skills() && skills().summonLilithSisters) {
            skills().summonLilithSisters(e, tools);
            return true;
          }
        }
        return false;

      case 'dashInvisibleBarrage':
        startFastDash(e, tools, '透明突進！');
        setGhost(e, tools, 180);
        directRing(e, tools, 12, normalOpt(e, 'small', { speed:1.65 * bal.speed, hp:5 }));
        return true;

      case 'hyperEvadeAttack':
        startSideRapid(e, tools);
        directRing(e, tools, 10, normalOpt(e, 'small', { speed:1.65 * bal.speed, hp:5 }));
        return true;

      case 'sideHugeTriple':
        startSideRapid(e, tools);
        safeFireSpread(e, tools, 3, 0.18, { sizeType:'huge', speed:0.95 * bal.speed, hp:18, special:true });
        return true;

      case 'blueNeoDefault':
      case 'purpleNeoDefault':
      case 'enmaDefault':
      case 'ultraLilithDefault':
        runBossNormal(e, tools, config);
        return true;

      default:
        return false;
    }
  }

  function runPatternFromConfig(e, tools, config, isBoss, mode){
    const patterns = getPatterns(config, isBoss);

    if (!patterns.length) return false;

    let key;

    if (mode === 'shoot') {
      const normalKeys = patterns.filter(p =>
        String(p).indexOf('Normal') >= 0 ||
        p === 'unbreakableNormalShot' ||
        p === 'stationaryBarrage'
      );

      if (normalKeys.length) {
        key = normalKeys[e.patternStep % normalKeys.length];
      }
    }

    if (!key) {
      key = patterns[e.attackStep % patterns.length];
    }

    return runPattern(e, tools, config, key, isBoss);
  }

  function runMidNormal(e, tools, config){
    e.patternStep++;

    if (runPatternFromConfig(e, tools, config, false, 'shoot')) return;

    const breakable = shouldNormalBreak(e, 0.65);

    safeFireSpread(e, tools, 2, 0.22, {
      sizeType:'small',
      speed:1.8 * difficultyBalance(e).speed,
      hp:breakable ? 5 : 0,
      breakable
    });
  }

  function runBossNormal(e, tools, config){
    e.patternStep++;

    if (runPatternFromConfig(e, tools, config, true, 'shoot')) return;

    const breakable = shouldNormalBreak(e, 0.75);

    safeFireSpread(e, tools, 3, 0.20, {
      sizeType:'normal',
      speed:1.7 * difficultyBalance(e).speed,
      hp:breakable ? 7 : 0,
      breakable
    });
  }

  function safeRunSkill(e, tools, config, isBoss){
    const ran = runPatternFromConfig(e, tools, config, isBoss, 'attack');
    if (ran) return;

    try {
      if (skills()) {
        if (isBoss && skills().runByType) {
          skills().runByType(e, tools, config.type, e.attackStep);
          return;
        }

        if (!isBoss && skills().runMidByType) {
          skills().runMidByType(e, tools, config.type, e.attackStep);
          return;
        }
      }
    } catch (err) {
      console.error('boss skill error:', e.name, err);
    }

    if (isBoss) runBossNormal(e, tools, config);
    else runMidNormal(e, tools, config);
  }

  function nextShootCd(e, config, tools, isBoss){
    const bal = difficultyBalance(e);
    const base = Number(config.shootCd || (isBoss ? 155 : 140));
    const jitter = isBoss ? 34 : 26;

    return Math.floor(
      Math.max(
        isBoss ? 58 : 50,
        (base + Math.random() * jitter) * attackRateMul(tools) * bal.cd
      )
    );
  }

  function nextAttackCd(e, config, tools, isBoss){
    const bal = difficultyBalance(e);
    const base = Number(config.attackCd || (isBoss ? 245 : 205));
    const jitter = isBoss ? 52 : 40;

    return Math.floor(
      Math.max(
        isBoss ? 95 : 78,
        (base + Math.random() * jitter) * attackRateMul(tools) * bal.cd
      )
    );
  }

  function updateMidBoss(e, tools){
    e.name = fixBossName(e.name);

    const config = getMidBossConfig(e);

    initEnemyBase(e, config, false);

    if (updateEntrance(e)) return;

    updateCommonTimers(e);
    safeProcessPendingShots(e, tools);
    updateBossBullets(tools);

    if (e.diveMode) {
      if (skills() && skills().updateDive) skills().updateDive(e, tools);
      return;
    }

    if (updateDiveReturn(e, tools)) return;

    moveBase(e, tools, config, false);
    maybeSpawnStageObstacles(e, tools, config);

    e.shootCd--;
    e.attackCd--;

    if (e.shootCd <= 0) {
      e.shootCd = nextShootCd(e, config, tools, false);
      runMidNormal(e, tools, config);
    }

    if (e.attackCd <= 0) {
      e.attackStep++;
      e.attackCd = nextAttackCd(e, config, tools, false);
      safeRunSkill(e, tools, config, false);
    }
  }

  function updateBoss(e, tools){
    e.name = fixBossName(e.name);

    const config = getBossConfig(e);

    initEnemyBase(e, config, true);

    if (updateEntrance(e)) return;

    updateCommonTimers(e);
    safeProcessPendingShots(e, tools);
    updateBossBullets(tools);

    if (e.diveMode) {
      if (skills() && skills().updateDive) skills().updateDive(e, tools);
      return;
    }

    if (updateDiveReturn(e, tools)) return;

    moveBase(e, tools, config, true);
    maybeSummonStageEnemies(e, tools, config);

    e.shootCd--;
    e.attackCd--;

    if (e.shootCd <= 0) {
      e.shootCd = nextShootCd(e, config, tools, true);
      runBossNormal(e, tools, config);
    }

    if (e.attackCd <= 0) {
      e.attackStep++;
      e.attackCd = nextAttackCd(e, config, tools, true);
      safeRunSkill(e, tools, config, true);
    }

    if (e.name === 'モブリリス' && !e.healUsed && e.hp <= e.maxHp * 0.5) {
      e.healUsed = true;
      if (skills() && skills().healBoss) skills().healBoss(e, tools, 0.06);
    }

    if (e.name === 'ウルモブリリス' && !e.healUsed && e.hp <= e.maxHp * 0.5) {
      e.healUsed = true;

      if (skills() && skills().healBoss) skills().healBoss(e, tools, 0.06);
      if (skills() && skills().summonLilithSisters) skills().summonLilithSisters(e, tools);
    }
  }

  window.MobShotBossAI = {
    updateMidBoss,
    updateBoss
  };

  window.MobShotBoss = window.MobShotBossAI;
})();
