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

  function fallbackConfig(isBoss){
    return {
      type: isBoss ? 'hawk' : 'ptera',
      shootCd: isBoss ? 175 : 165,
      attackCd: isBoss ? 285 : 245,
      moveSpeed: isBoss ? 1.05 : 1.05
    };
  }

  function getBossConfig(e){
    if (data() && data().getBossConfig) {
      return data().getBossConfig(e.name) || fallbackConfig(true);
    }
    return fallbackConfig(true);
  }

  function getMidBossConfig(e){
    if (data() && data().getMidBossConfig) {
      return data().getMidBossConfig(e.name) || fallbackConfig(false);
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

  function initEnemyBase(e, config, isBoss){
    if (e.__bossAiInit) return;

    e.__bossAiInit = true;
    e.aiTimer = 0;

    const slowMul = 1.0;

    e.shootCd = Math.max(
      isBoss ? 85 : 70,
      Math.floor(Number(e.shootCd || config.shootCd || 150) * slowMul)
    );

    e.attackCd = Math.max(
      isBoss ? 130 : 110,
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

    const baseSpeed = Number(config.moveSpeed || 1.2) * speedMulByType(config.type);
    e.baseVx = Math.max(0.45, baseSpeed);
    e.vx = e.vx || e.baseVx * (Math.random() < 0.5 ? -1 : 1);

    e.bigFireballCd = Math.floor(480 + Math.random() * 160);
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
  }

  function setMoveTarget(e, tools, config, isBoss){
    const type = config.type;
    const left = isBoss ? tools.W * 0.16 : tools.W * 0.18;
    const right = isBoss ? tools.W * 0.84 : tools.W * 0.82;
    const minY = isBoss ? tools.H * 0.12 : tools.H * 0.15;
    const maxY = isBoss ? tools.H * 0.32 : tools.H * 0.38;
    const center = tools.W * 0.5;

    if (type === 'guardian' || type === 'mail') {
      e.moveTargetX = clamp(center + Math.sin(e.aiTimer * 0.008 + e.movePhase) * tools.W * 0.18, left, right);
      e.moveTargetY = clamp((e.baseY || tools.H * 0.24) + Math.sin(e.aiTimer * 0.011) * 6, minY, maxY);
      return;
    }

    if (type === 'neon' || type === 'blueNeo' || type === 'purpleNeo' || type === 'smith') {
      if (e.aiTimer % 150 === 1) e.moveTargetX = clamp(tools.rand(left, right), left, right);
      e.moveTargetY = clamp((e.baseY || tools.H * 0.24) + Math.sin(e.aiTimer * 0.014 + e.movePhase) * 14, minY, maxY);
      return;
    }

    if (type === 'dragon' || type === 'maoh' || type === 'enma') {
      e.moveTargetX = clamp(center + Math.sin(e.aiTimer * 0.012 + e.movePhase) * tools.W * 0.27, left, right);
      e.moveTargetY = clamp((e.baseY || tools.H * 0.24) + Math.sin(e.aiTimer * 0.009) * 10, minY, maxY);
      return;
    }

    e.moveTargetX = clamp(center + Math.sin(e.aiTimer * 0.015 + e.movePhase) * tools.W * 0.28, left, right);
    e.moveTargetY = clamp((e.baseY || tools.H * 0.24) + Math.sin(e.aiTimer * 0.012 + e.movePhase) * 12, minY, maxY);
  }

  function moveBase(e, tools, config, isBoss){
    const left = isBoss ? tools.W * 0.16 : tools.W * 0.18;
    const right = isBoss ? tools.W * 0.84 : tools.W * 0.82;
    const minY = isBoss ? tools.H * 0.12 : tools.H * 0.15;
    const maxY = isBoss ? tools.H * 0.32 : tools.H * 0.38;

    const speed = Math.max(0.35, Number(e.baseVx || config.moveSpeed || 1));

    if (e.specialMove === 'sideRapid') {
      e.x += Number(e.specialVx || e.vx || speed) * 0.72;

      if (e.x < left || e.x > right) {
        e.specialVx = -Number(e.specialVx || speed);
      }

      if (e.specialTimer <= 0) {
        e.specialMove = '';
        e.vx = e.baseVx || speed;
      }
    } else {
      setMoveTarget(e, tools, config, isBoss);

      const moveRateX = isBoss ? 0.032 : 0.044;
      const moveRateY = isBoss ? 0.026 : 0.038;

      e.x += (e.moveTargetX - e.x) * moveRateX;
      e.y += (e.moveTargetY - e.y) * moveRateY;
    }

    e.x = clamp(e.x, left, right);
    e.y = clamp(e.y, minY, maxY);
  }

  function updateDiveReturn(e, tools){
    if (!e.diveReturn) return false;

    e.y += Math.min(1.8, e.vy || 1.6);

    if (e.y >= e.baseY) {
      e.y = e.baseY;
      e.diveReturn = false;
      e.targetY = e.baseY;
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

  function safeFireSpread(e, tools, count, spread, opt){
    opt = opt || {};
    const before = tools.state.entities.length;

    try {
      if (bullets()) {
        if (bullets().fireSlowSpread) bullets().fireSlowSpread(e, tools, count, spread, opt);
        else if (bullets().fireSpread) bullets().fireSpread(e, tools, count, spread, opt);
      }
    } catch (err) {
      console.error('boss fireSpread error:', e.name, err);
    }

    if (tools.state.entities.length <= before && bullets() && bullets().fireSpread) {
      bullets().fireSpread(e, tools, count, spread, opt);
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

    e.bigFireballCd = isDoubleOrCoop(tools) ? 680 : 560;
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
      safeFireSpread(e, tools, 2, 0.18, { sizeType:'normal', speed:1.55, hp:9, image:'atk/hinotama.png', flipY:true, color:'#ff7a35' });
      return;
    }

    if (type === 'thunder' || type === 'neon') {
      safeFireSpread(e, tools, 3, 0.17, { sizeType:'small', speed:1.75, hp:5, color:'#6be6ff', safeCenter:true });
      return;
    }

    if (type === 'blade' || type === 'dash') {
      safeFireSpread(e, tools, 2, 0.24, { sizeType:'small', speed:1.9, hp:5 });
      return;
    }

    if (type === 'lilith') {
      safeFireSpread(e, tools, 3, 0.18, { sizeType:'small', speed:1.75, hp:5, color:'#ff8cff' });
      return;
    }

    safeFireSpread(e, tools, 2, 0.22, { sizeType:'small', speed:1.75, hp:5 });
  }

  function runBossNormal(e, tools, config){
    const type = config.type;

    if (
      (type === 'dragon' || type === 'maoh' || type === 'enma' || type === 'purpleNeo' || type === 'ultraLilith') &&
      tryBigFireball(e, tools, 'ビッグ火の玉！', {
        hp: Math.ceil(e.maxHp * 0.020),
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
      safeFireSpread(e, tools, 3, 0.22, { sizeType:'normal', speed:1.75, hp:6, color:'#ffe66b' });
      return;
    }

    if (type === 'mira') {
      safeFireSpread(e, tools, 3, 0.18, { sizeType:'normal', speed:1.65, hp:7, color:'#b78cff' });
      return;
    }

    if (type === 'guardian') {
      safeFireSpread(e, tools, 2, 0.26, { sizeType:'big', speed:1.45, hp:10, color:'#ff7a35' });
      return;
    }

    if (type === 'neon') {
      safeFireSpread(e, tools, 3, 0.17, { sizeType:'normal', speed:1.85, hp:6, color:'#6be6ff' });
      return;
    }

    if (type === 'dragon') {
      safeFireSpread(e, tools, 3, 0.20, { sizeType:'big', speed:1.55, hp:10, image:'atk/hinotama.png', flipY:true, color:'#ff5b35' });
      return;
    }

    if (type === 'lilith' || type === 'ultraLilith') {
      safeFireSpread(e, tools, 3, 0.18, { sizeType:'normal', speed:1.7, hp:7, color:'#ff8cff' });
      return;
    }

    if (type === 'maoh') {
      safeFireSpread(e, tools, 3, 0.18, { sizeType:'normal', speed:1.65, hp:8, safeCenter:true, color:'#ff4aff' });
      return;
    }

    if (type === 'mail') {
      safeFireSpread(e, tools, 2, 0.26, { sizeType:'big', speed:1.45, hp:10, color:'#bfc7d5' });
      return;
    }

    if (type === 'smith') {
      safeFireSpread(e, tools, 3, 0.17, { sizeType:'normal', speed:1.75, hp:6, color:'#7bffea' });
      return;
    }

    if (type === 'nep') {
      safeFireSpread(e, tools, 3, 0.20, { sizeType:'normal', speed:1.65, hp:7, color:'#6be6ff' });
      return;
    }

    if (type === 'blueNeo' || type === 'purpleNeo') {
      safeFireSpread(e, tools, 3, 0.17, { sizeType:'normal', speed:1.85, hp:6, color:type === 'blueNeo' ? '#4bb8ff' : '#b78cff' });
      return;
    }

    if (type === 'enma') {
      safeFireSpread(e, tools, 3, 0.22, { sizeType:'big', speed:1.5, hp:10, color:'#ff3b3b' });
      return;
    }

    safeFireSpread(e, tools, 3, 0.20, { sizeType:'normal', speed:1.65, hp:7 });
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
    const jitter = isBoss ? 18 : 12;

    return Math.floor(
      Math.max(
        isBoss ? 85 : 70,
        (base + Math.random() * jitter) * attackRateMul(tools)
      )
    );
  }

  function nextAttackCd(config, tools, isBoss){
    const base = Number(config.attackCd || (isBoss ? 245 : 205));
    const jitter = isBoss ? 25 : 18;

    return Math.floor(
      Math.max(
        isBoss ? 130 : 110,
        (base + Math.random() * jitter) * attackRateMul(tools)
      )
    );
  }

  function updateMidBoss(e, tools){
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
})();
