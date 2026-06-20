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
      moveSpeed: isBoss ? 1.05 : 1.05
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
    e.cloneUsed = false;
    e.sistersUsed = false;
    e.healUsed = false;
    e.extraHealUsed = false;
    e.barrierTimer = 0;
    e.barrierHp = 0;
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

    if (e.ghostTimer > 0) {
      e.ghostTimer--;
      e.alpha = 0.46;
      if (e.ghostTimer <= 0) e.alpha = 1;
    }

    if (e.specialTimer > 0) e.specialTimer--;
    if (e.bigFireballCd > 0) e.bigFireballCd--;
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

      if (e.barrierTimer > 0) {
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

    e.y = clamp(e.y, minY, maxY);
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
    const opt = Object.assign({
      sizeType:sizeType || 'normal',
      image:spec.image || spec.fallbackImage || 'atk/hinotama.png',
      fallbackImage:spec.fallbackImage || 'atk/hinotama.png',
      flipY:spec.flipY !== false,
      color:spec.color || '#ff7a35',
      speed:1.65 * bal.speed,
      hp:7
    }, extra || {});

    return opt;
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

    const hp = Number(opt.hp || 0);

    tools.state.entities.push({
      kind: 'enemyBullet',
      x: e.x,
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
      life: 430,
      fromBoss: true,
      glow: true
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

    const finalOpt = bulletOpt(e, 'super', opt || {});
    bullets().chargeBigFireball(e, tools, text || 'ビッグ火の玉！', finalOpt);
    return true;
  }

  function startSideRapid(e, tools){
    e.specialMove = 'sideRapid';
    e.specialTimer = 95;
    e.specialVx = 0;

    if (tools.addText) tools.addText('高速移動！', e.x, e.y - 80, '#ffffff');
  }

  function runMidNormal(e, tools, config){
    const type = config.type;
    e.patternStep++;

    if (type === 'rapid') {
      if (e.patternStep % 3 === 0) directLine(e, tools, 3, bulletOpt(e, 'small', { speed:2.05 * difficultyBalance(e).speed, hp:4 }));
      else safeFireSpread(e, tools, 2, 0.20, { sizeType:'small', speed:1.9 * difficultyBalance(e).speed, hp:5 });
      return;
    }

    if (type === 'magma' || type === 'heavy') {
      if (e.patternStep % 3 === 0) directRing(e, tools, 8, bulletOpt(e, 'small', { speed:1.3 * difficultyBalance(e).speed, hp:6 }));
      else safeFireSpread(e, tools, 2, 0.18, { sizeType:'normal', speed:1.55 * difficultyBalance(e).speed, hp:10 });
      return;
    }

    if (type === 'thunder' || type === 'neon') {
      if (e.patternStep % 4 === 0) startSideRapid(e, tools);
      safeFireSpread(e, tools, 3, 0.17, { sizeType:'small', speed:1.85 * difficultyBalance(e).speed, hp:5, safeCenter:true });
      return;
    }

    if (type === 'blade' || type === 'dash') {
      if (e.patternStep % 3 === 0) startSideRapid(e, tools);
      safeFireSpread(e, tools, 2, 0.24, { sizeType:'small', speed:2.0 * difficultyBalance(e).speed, hp:5 });
      return;
    }

    if (type === 'lilith') {
      if (e.patternStep % 3 === 0) directRing(e, tools, 7, bulletOpt(e, 'small', { speed:1.35 * difficultyBalance(e).speed, hp:5 }));
      else safeFireSpread(e, tools, 3, 0.18, { sizeType:'small', speed:1.8 * difficultyBalance(e).speed, hp:5 });
      return;
    }

    safeFireSpread(e, tools, 2, 0.22, { sizeType:'small', speed:1.8 * difficultyBalance(e).speed, hp:5 });
  }

  function runBossNormal(e, tools, config){
    const type = config.type;
    e.patternStep++;

    if (
      (type === 'dragon' || type === 'maoh' || type === 'enma' || type === 'purpleNeo' || type === 'ultraLilith') &&
      e.patternStep % 4 === 0 &&
      tryBigFireball(e, tools, 'ビッグ火の玉！')
    ) {
      return;
    }

    if (type === 'hawk') {
      if (e.patternStep % 3 === 0) {
        directLine(e, tools, 4, bulletOpt(e, 'small', { speed:2.05 * difficultyBalance(e).speed, hp:5 }));
      } else {
        safeFireSpread(e, tools, 3, 0.22, { sizeType:'normal', speed:1.8 * difficultyBalance(e).speed, hp:6 });
      }
      return;
    }

    if (type === 'mira') {
      if (e.patternStep % 3 === 0) startSideRapid(e, tools);
      if (e.patternStep % 2 === 0) directRing(e, tools, 10, bulletOpt(e, 'small', { speed:1.25 * difficultyBalance(e).speed, hp:5 }));
      else safeFireSpread(e, tools, 4, 0.16, { sizeType:'normal', speed:1.7 * difficultyBalance(e).speed, hp:7 });
      return;
    }

    if (type === 'guardian') {
      if (e.patternStep % 3 === 0) {
        e.barrierTimer = 120;
        e.barrierHp = Math.ceil(e.maxHp * 0.04);
        if (tools.addText) tools.addText('ガード！', e.x, e.y - 84, '#ffcf5b');
      }
      safeFireSpread(e, tools, e.patternStep % 2 === 0 ? 3 : 2, 0.26, {
        sizeType:'big',
        speed:1.48 * difficultyBalance(e).speed,
        hp:13
      });
      return;
    }

    if (type === 'neon') {
      if (e.patternStep % 4 === 0) startSideRapid(e, tools);
      if (e.patternStep % 2 === 0) directRing(e, tools, 12, bulletOpt(e, 'small', { speed:1.42 * difficultyBalance(e).speed, hp:5 }));
      else safeFireSpread(e, tools, 4, 0.16, { sizeType:'normal', speed:1.95 * difficultyBalance(e).speed, hp:6 });
      return;
    }

    if (type === 'dragon') {
      if (e.patternStep % 3 === 0) {
        directRing(e, tools, 9, bulletOpt(e, 'normal', { speed:1.25 * difficultyBalance(e).speed, hp:8 }));
      } else {
        safeFireSpread(e, tools, 3, 0.20, { sizeType:'big', speed:1.62 * difficultyBalance(e).speed, hp:11 });
      }
      return;
    }

    if (type === 'lilith' || type === 'ultraLilith') {
      if (e.patternStep % 4 === 0) directRing(e, tools, type === 'ultraLilith' ? 16 : 12, bulletOpt(e, 'small', { speed:1.36 * difficultyBalance(e).speed, hp:5 }));
      else safeFireSpread(e, tools, type === 'ultraLilith' ? 5 : 3, 0.16, { sizeType:'normal', speed:1.78 * difficultyBalance(e).speed, hp:7 });
      return;
    }

    if (type === 'maoh') {
      if (e.patternStep % 3 === 0) directRing(e, tools, 14, bulletOpt(e, 'normal', { speed:1.28 * difficultyBalance(e).speed, hp:8 }));
      else safeFireSpread(e, tools, 5, 0.15, { sizeType:'normal', speed:1.72 * difficultyBalance(e).speed, hp:8, safeCenter:true });
      return;
    }

    if (type === 'mail') {
      if (e.patternStep % 3 === 0) {
        e.barrierTimer = 150;
        e.barrierHp = Math.ceil(e.maxHp * 0.05);
      }
      safeFireSpread(e, tools, 2, 0.26, { sizeType:'big', speed:1.48 * difficultyBalance(e).speed, hp:13 });
      return;
    }

    if (type === 'smith') {
      if (e.patternStep % 3 === 0) startSideRapid(e, tools);
      safeFireSpread(e, tools, 4, 0.16, { sizeType:'normal', speed:1.85 * difficultyBalance(e).speed, hp:6 });
      return;
    }

    if (type === 'nep') {
      if (e.patternStep % 3 === 0) directRing(e, tools, 12, bulletOpt(e, 'small', { speed:1.35 * difficultyBalance(e).speed, hp:6 }));
      else safeFireSpread(e, tools, 4, 0.18, { sizeType:'normal', speed:1.75 * difficultyBalance(e).speed, hp:7 });
      return;
    }

    if (type === 'blueNeo' || type === 'purpleNeo') {
      if (e.patternStep % 4 === 0) startSideRapid(e, tools);
      if (e.patternStep % 2 === 0) directRing(e, tools, 12, bulletOpt(e, 'small', { speed:1.45 * difficultyBalance(e).speed, hp:5 }));
      else safeFireSpread(e, tools, 4, 0.16, { sizeType:'normal', speed:1.95 * difficultyBalance(e).speed, hp:6 });
      return;
    }

    if (type === 'enma') {
      if (e.patternStep % 3 === 0) directRing(e, tools, 16, bulletOpt(e, 'normal', { speed:1.32 * difficultyBalance(e).speed, hp:8 }));
      else safeFireSpread(e, tools, 5, 0.18, { sizeType:'big', speed:1.58 * difficultyBalance(e).speed, hp:12 });
      return;
    }

    safeFireSpread(e, tools, 3, 0.20, {
      sizeType:'normal',
      speed:1.7 * difficultyBalance(e).speed,
      hp:7
    });
  }

  function safeRunSkill(e, tools, config, isBoss){
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
