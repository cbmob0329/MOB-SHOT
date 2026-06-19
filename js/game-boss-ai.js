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
    return name;
  }

  function fallbackConfig(isBoss){
    return {
      type: isBoss ? 'hawk' : 'ptera',
      shootCd: isBoss ? 175 : 165,
      attackCd: isBoss ? 285 : 245,
      moveSpeed: isBoss ? 1.05 : 1.05
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
    return isDoubleOrCoop(tools) ? 1.22 : 1;
  }

  function speedMulByType(type){
    if (type === 'neon' || type === 'blueNeo' || type === 'purpleNeo' || type === 'smith') return 0.78;
    if (type === 'hawk' || type === 'mira' || type === 'lilith' || type === 'ultraLilith') return 0.72;
    if (type === 'guardian' || type === 'mail') return 0.56;
    if (type === 'dragon' || type === 'maoh' || type === 'enma') return 0.62;
    return 0.68;
  }

  function moveRange(tools, isBoss){
    const center = tools.W * 0.5;
    const width = isBoss ? tools.W * 0.25 : tools.W * 0.24;

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

    const slowMul = isBoss ? 1.25 : 1.15;

    e.shootCd = Math.max(
      isBoss ? 95 : 85,
      Math.floor(Number(e.shootCd || config.shootCd || 150) * slowMul)
    );

    e.attackCd = Math.max(
      isBoss ? 165 : 135,
      Math.floor(Number(e.attackCd || config.attackCd || 230) * slowMul)
    );

    e.attackStep = Number(e.attackStep || 0);
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

    const baseSpeed = Number(config.moveSpeed || 1.2) * speedMulByType(config.type);
    e.baseVx = Math.max(0.45, baseSpeed);
    e.vx = e.baseVx * (Math.random() < 0.5 ? -1 : 1);

    e.bigFireballCd = Math.floor(420 + Math.random() * 160);
    e.lastBigFireballFrame = -9999;
  }

  function updateEntrance(e){
    if (e.y < e.targetY) {
      e.y += Math.min(1.45, e.vy || 1.35);
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
    if (type === 'neon' || type === 'blueNeo' || type === 'purpleNeo' || type === 'smith') {
      return isBoss ? 110 : 85;
    }

    if (type === 'guardian' || type === 'mail') {
      return isBoss ? 150 : 115;
    }

    if (type === 'dragon' || type === 'maoh' || type === 'enma') {
      return isBoss ? 135 : 105;
    }

    return isBoss ? 120 : 95;
  }

  function targetSpread(type, tools, isBoss){
    if (type === 'guardian' || type === 'mail') return tools.W * (isBoss ? 0.14 : 0.13);
    if (type === 'dragon' || type === 'maoh' || type === 'enma') return tools.W * (isBoss ? 0.20 : 0.17);
    if (type === 'neon' || type === 'blueNeo' || type === 'purpleNeo' || type === 'smith') return tools.W * (isBoss ? 0.21 : 0.18);
    return tools.W * (isBoss ? 0.20 : 0.17);
  }

  function pickMoveTarget(e, tools, config, isBoss){
    const r = moveRange(tools, isBoss);
    const type = config.type;
    const baseY = e.baseY || (isBoss ? tools.H * 0.24 : tools.H * 0.26);

    const minY = isBoss ? tools.H * 0.12 : tools.H * 0.16;
    const maxY = isBoss ? tools.H * 0.32 : tools.H * 0.36;

    const spread = targetSpread(type, tools, isBoss);
    const margin = tools.W * 0.035;

    let tx = r.center + tools.rand(-spread, spread);

    if (e.x < r.left + margin) {
      tx = r.center + tools.rand(0, spread * 0.7);
    }

    if (e.x > r.right - margin) {
      tx = r.center - tools.rand(0, spread * 0.7);
    }

    let yAmp = isBoss ? 10 : 12;

    if (type === 'guardian' || type === 'mail') yAmp = 5;
    if (type === 'neon' || type === 'blueNeo' || type === 'purpleNeo' || type === 'smith') yAmp = 12;

    e.moveTargetX = clamp(tx, r.left + margin, r.right - margin);
    e.moveTargetY = clamp(baseY + tools.rand(-yAmp, yAmp), minY, maxY);
    e.moveRetargetCd = retargetInterval(type, isBoss);
  }

  function moveBase(e, tools, config, isBoss){
    const r = moveRange(tools, isBoss);
    const minY = isBoss ? tools.H * 0.12 : tools.H * 0.16;
    const maxY = isBoss ? tools.H * 0.32 : tools.H * 0.36;
    const speed = Math.max(0.35, Number(e.baseVx || config.moveSpeed || 1));

    if (e.specialMove === 'sideRapid') {
      if (!e.specialVx) {
        e.specialVx = speed * (Math.random() < 0.5 ? -1 : 1);
      }

      e.x += e.specialVx * 0.58;

      if (e.x <= r.left) {
        e.x = r.left + 8;
        e.specialVx = Math.abs(e.specialVx);
      }

      if (e.x >= r.right) {
        e.x = r.right - 8;
        e.specialVx = -Math.abs(e.specialVx);
      }

      e.y += ((e.baseY || e.y) - e.y) * 0.018;

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

      const followX =
        e.barrierTimer > 0 && (config.type === 'guardian' || config.type === 'mail')
          ? 0.018
          : 0.026;

      const followY =
        e.barrierTimer > 0 && (config.type === 'guardian' || config.type === 'mail')
          ? 0.016
          : 0.020;

      e.x += (e.moveTargetX - e.x) * followX;
      e.y += (e.moveTargetY - e.y) * followY;

      e.x += (r.center - e.x) * (isBoss ? 0.0025 : 0.002);
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

    e.y += Math.min(1.8, e.vy || 1.6);

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

  function directBullet(e, tools, angle, opt){
    opt = opt || {};

    const speed = Number(opt.speed || 1.8);
    const r = Number(opt.r || 28);
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
      dmg: Number(opt.dmg || Math.max(5, Math.ceil(r * 0.34))),
      hp,
      maxHp: hp,
      breakable: hp > 0,
      dead: false,
      bob: 0,
      color: opt.color || '#ff7a35',
      image: opt.image || 'atk/hinotama.png',
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

  function safeFireSpread(e, tools, count, spread, opt){
    opt = opt || {};
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

    e.bigFireballCd = isDoubleOrCoop(tools) ? 620 : 500;
    e.lastBigFireballFrame = tools.frame ? tools.frame() : 0;

    bullets().chargeBigFireball(e, tools, text || 'ビッグ火の玉！', opt || {});
    return true;
  }

  function runMidNormal(e, tools, config){
    const type = config.type;

    if (type === 'rapid') {
      safeFireSpread(e, tools, 2, 0.20, { sizeType:'small', speed:1.85, hp:5 });
      return;
    }

    if (type === 'magma' || type === 'heavy') {
      safeFireSpread(e, tools, 2, 0.18, {
        sizeType:'normal',
        speed:1.55,
        hp:10,
        image:'atk/hinotama.png',
        flipY:true,
        color:'#ff7a35'
      });
      return;
    }

    if (type === 'thunder' || type === 'neon') {
      safeFireSpread(e, tools, 3, 0.17, {
        sizeType:'small',
        speed:1.75,
        hp:5,
        color:'#6be6ff',
        safeCenter:true
      });
      return;
    }

    if (type === 'blade' || type === 'dash') {
      safeFireSpread(e, tools, 2, 0.24, { sizeType:'small', speed:1.9, hp:5 });
      return;
    }

    if (type === 'lilith') {
      safeFireSpread(e, tools, 3, 0.18, {
        sizeType:'small',
        speed:1.75,
        hp:5,
        color:'#ff8cff'
      });
      return;
    }

    safeFireSpread(e, tools, 2, 0.22, { sizeType:'small', speed:1.75, hp:5 });
  }

  function runBossNormal(e, tools, config){
    const type = config.type;

    if (
      (type === 'dragon' || type === 'maoh' || type === 'enma' || type === 'purpleNeo' || type === 'ultraLilith') &&
      tryBigFireball(e, tools, 'ビッグ火の玉！', {
        color:
          type === 'enma' ? '#ff3b3b' :
          type === 'purpleNeo' ? '#b78cff' :
          type === 'ultraLilith' ? '#ff8cff' :
          '#ff5b35'
      })
    ) {
      return;
    }

    if (type === 'hawk') {
      safeFireSpread(e, tools, 3, 0.22, {
        sizeType:'normal',
        speed:1.75,
        hp:6,
        color:'#ffe66b'
      });
      return;
    }

    if (type === 'mira') {
      safeFireSpread(e, tools, 3, 0.18, {
        sizeType:'normal',
        speed:1.65,
        hp:7,
        color:'#b78cff'
      });
      return;
    }

    if (type === 'guardian') {
      safeFireSpread(e, tools, 2, 0.26, {
        sizeType:'big',
        speed:1.45,
        hp:13,
        color:'#ff7a35'
      });
      return;
    }

    if (type === 'neon') {
      safeFireSpread(e, tools, 3, 0.17, {
        sizeType:'normal',
        speed:1.85,
        hp:6,
        color:'#6be6ff'
      });
      return;
    }

    if (type === 'dragon') {
      safeFireSpread(e, tools, 3, 0.20, {
        sizeType:'big',
        speed:1.55,
        hp:11,
        image:'atk/hinotama.png',
        flipY:true,
        color:'#ff5b35'
      });
      return;
    }

    if (type === 'lilith' || type === 'ultraLilith') {
      safeFireSpread(e, tools, 3, 0.18, {
        sizeType:'normal',
        speed:1.7,
        hp:7,
        color:'#ff8cff'
      });
      return;
    }

    if (type === 'maoh') {
      safeFireSpread(e, tools, 3, 0.18, {
        sizeType:'normal',
        speed:1.65,
        hp:8,
        safeCenter:true,
        color:'#ff4aff'
      });
      return;
    }

    if (type === 'mail') {
      safeFireSpread(e, tools, 2, 0.26, {
        sizeType:'big',
        speed:1.45,
        hp:13,
        color:'#bfc7d5'
      });
      return;
    }

    if (type === 'smith') {
      safeFireSpread(e, tools, 3, 0.17, {
        sizeType:'normal',
        speed:1.75,
        hp:6,
        color:'#7bffea'
      });
      return;
    }

    if (type === 'nep') {
      safeFireSpread(e, tools, 3, 0.20, {
        sizeType:'normal',
        speed:1.65,
        hp:7,
        color:'#6be6ff'
      });
      return;
    }

    if (type === 'blueNeo' || type === 'purpleNeo') {
      safeFireSpread(e, tools, 3, 0.17, {
        sizeType:'normal',
        speed:1.85,
        hp:6,
        color:type === 'blueNeo' ? '#4bb8ff' : '#b78cff'
      });
      return;
    }

    if (type === 'enma') {
      safeFireSpread(e, tools, 3, 0.22, {
        sizeType:'big',
        speed:1.5,
        hp:12,
        color:'#ff3b3b'
      });
      return;
    }

    safeFireSpread(e, tools, 3, 0.20, {
      sizeType:'normal',
      speed:1.65,
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

  function nextShootCd(config, tools, isBoss){
    const base = Number(config.shootCd || (isBoss ? 155 : 140));
    const jitter = isBoss ? 45 : 35;

    return Math.floor(
      Math.max(
        isBoss ? 105 : 85,
        (base + Math.random() * jitter) * attackRateMul(tools)
      )
    );
  }

  function nextAttackCd(config, tools, isBoss){
    const base = Number(config.attackCd || (isBoss ? 245 : 205));
    const jitter = isBoss ? 70 : 50;

    return Math.floor(
      Math.max(
        isBoss ? 185 : 140,
        (base + Math.random() * jitter) * attackRateMul(tools)
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
      e.shootCd = nextShootCd(config, tools, false);
      runMidNormal(e, tools, config);
    }

    if (e.attackCd <= 0) {
      e.attackStep++;
      e.attackCd = nextAttackCd(config, tools, false);
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
      e.shootCd = nextShootCd(config, tools, true);
      runBossNormal(e, tools, config);
    }

    if (e.attackCd <= 0) {
      e.attackStep++;
      e.attackCd = nextAttackCd(config, tools, true);
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
