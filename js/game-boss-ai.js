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
      shootCd: isBoss ? 95 : 110,
      attackCd: isBoss ? 165 : 145,
      moveSpeed: isBoss ? 1.3 : 1.2
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

  function initEnemyBase(e, config){
    if (e.__bossAiInit) return;

    e.__bossAiInit = true;
    e.aiTimer = 0;
    e.shootCd = Math.min(45, Math.max(20, Number(e.shootCd || config.shootCd || 120)));
    e.attackCd = Math.max(90, Number(e.attackCd || config.attackCd || 190));
    e.attackStep = Number(e.attackStep || 0);
    e.pendingShots = [];
    e.specialMove = '';
    e.specialTimer = 0;
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
    e.baseVx = Number(e.vx || config.moveSpeed || 1.3);
  }

  function updateEntrance(e){
    if (e.y < e.targetY) {
      e.y += e.vy || 1.6;
      return true;
    }
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
      e.alpha = 0.42;
      if (e.ghostTimer <= 0) e.alpha = 1;
    }

    if (e.specialTimer > 0) e.specialTimer--;
  }

  function moveBase(e, tools, config, isBoss){
    const left = isBoss ? tools.W * 0.18 : tools.W * 0.2;
    const right = isBoss ? tools.W * 0.82 : tools.W * 0.8;
    const speed = Number(config.moveSpeed || e.baseVx || 1.3);

    if (!e.vx) e.vx = speed * (Math.random() < 0.5 ? -1 : 1);

    if (e.specialMove === 'sideRapid') {
      e.x += Number(e.specialVx || e.vx || speed);

      if (e.x < left || e.x > right) {
        e.specialVx = -Number(e.specialVx || speed);
      }

      if (e.specialTimer <= 0) {
        e.specialMove = '';
        e.vx = e.baseVx || speed;
      }
    } else {
      e.x += e.vx;
    }

    if (e.x < left) {
      e.x = left;
      e.vx = Math.abs(e.vx || speed);
    }

    if (e.x > right) {
      e.x = right;
      e.vx = -Math.abs(e.vx || speed);
    }

    const minY = isBoss ? tools.H * 0.12 : tools.H * 0.16;
    const maxY = isBoss ? tools.H * 0.34 : tools.H * 0.36;

    e.y = tools.clamp(e.y, minY, maxY);
  }

  function updateDiveReturn(e, tools){
    if (!e.diveReturn) return false;

    e.y += e.vy || 2;

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

  function directBullet(e, tools, angle, opt){
    opt = opt || {};

    const speed = Number(opt.speed || 2.55);
    const r = Number(opt.r || 11);
    const hp = Number(opt.hp || 0);

    tools.state.entities.push({
      kind: 'enemyBullet',
      x: e.x,
      y: e.y + (opt.yOffset || 56),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r,
      dmg: Number(opt.dmg || (r + 2)),
      hp,
      maxHp: hp,
      breakable: hp > 0,
      dead: false,
      bob: 0,
      color: opt.color || '#ff4aff',
      image: opt.image || null,
      flipY: !!opt.flipY,
      life: 420,
      fromBoss: true
    });
  }

  function directSpread(e, tools, count, spread, opt){
    opt = opt || {};

    const dx = tools.state.player.x - e.x;
    const dy = tools.state.player.y - e.y;
    const base = Math.atan2(dy, dx);

    for (let i = 0; i < count; i++) {
      const angle = base + (i - (count - 1) / 2) * spread;
      directBullet(e, tools, angle, opt);
    }
  }

  function safeFireSpread(e, tools, count, spread, opt){
    opt = opt || {};

    const before = tools.state.entities.length;

    try {
      if (bullets() && bullets().fireSpread) {
        bullets().fireSpread(e, tools, count, spread, opt);
      }
    } catch (err) {
      console.error('boss fireSpread error:', e.name, err);
    }

    const after = tools.state.entities.length;

    if (after <= before) {
      directSpread(e, tools, count, spread, opt);
    }
  }

  function runMidNormal(e, tools, config){
    const type = config.type;

    if (type === 'rapid') {
      safeFireSpread(e, tools, 2, 0.22, { sizeType:'small', speed:2.65, hp:0, r:9 });
      return;
    }

    if (type === 'magma' || type === 'heavy') {
      safeFireSpread(e, tools, 2, 0.20, { sizeType:'normal', speed:2.25, hp:10, r:13, image:'atk/dragon.png', flipY:false, color:'#ff7a35' });
      return;
    }

    if (type === 'thunder' || type === 'neon') {
      safeFireSpread(e, tools, 3, 0.18, { sizeType:'small', speed:2.55, hp:0, r:9, image:'atk/kaminari.png', flipY:true, color:'#6be6ff', safeCenter:true });
      return;
    }

    if (type === 'blade' || type === 'dash') {
      safeFireSpread(e, tools, 2, 0.26, { sizeType:'small', speed:2.75, hp:0, r:9 });
      return;
    }

    if (type === 'lilith') {
      safeFireSpread(e, tools, 3, 0.20, { sizeType:'small', speed:2.55, hp:0, r:9, color:'#ff8cff' });
      return;
    }

    safeFireSpread(e, tools, 2, 0.24, { sizeType:'small', speed:2.45, hp:0, r:9 });
  }

  function runBossNormal(e, tools, config){
    const type = config.type;

    if (type === 'hawk') {
      safeFireSpread(e, tools, 3, 0.24, { sizeType:'normal', speed:2.45, hp:0, r:11, safeCenter:false });
      return;
    }

    if (type === 'mira') {
      safeFireSpread(e, tools, 3, 0.20, { sizeType:'normal', speed:2.65, hp:0, r:11, color:'#b78cff' });
      return;
    }

    if (type === 'guardian') {
      safeFireSpread(e, tools, 2, 0.28, { sizeType:'big', speed:2.05, hp:14, r:17, color:'#ff7a35' });
      return;
    }

    if (type === 'neon') {
      safeFireSpread(e, tools, 3, 0.18, { sizeType:'normal', speed:2.75, hp:0, r:11, image:'atk/kaminari.png', flipY:true, color:'#6be6ff' });
      return;
    }

    if (type === 'dragon') {
      safeFireSpread(e, tools, 3, 0.22, { sizeType:'big', speed:2.25, hp:12, r:17, image:'atk/dragon.png', flipY:false, color:'#ff5b35' });
      return;
    }

    if (type === 'lilith' || type === 'ultraLilith') {
      safeFireSpread(e, tools, 3, 0.20, { sizeType:'normal', speed:2.5, hp:0, r:11, color:'#ff8cff' });
      return;
    }

    if (type === 'maoh') {
      safeFireSpread(e, tools, 4, 0.18, { sizeType:'normal', speed:2.45, hp:0, r:11, safeCenter:true, image:'atk/atkmaoh.png', flipY:true, color:'#ff4aff' });
      return;
    }

    if (type === 'mail') {
      safeFireSpread(e, tools, 2, 0.28, { sizeType:'big', speed:2.05, hp:14, r:17, color:'#bfc7d5' });
      return;
    }

    if (type === 'smith') {
      safeFireSpread(e, tools, 3, 0.18, { sizeType:'normal', speed:2.65, hp:0, r:11, image:'atk/matrix.png', flipY:true, color:'#7bffea' });
      return;
    }

    if (type === 'nep') {
      safeFireSpread(e, tools, 3, 0.22, { sizeType:'normal', speed:2.45, hp:0, r:11, image:'atk/atknep.png', flipY:true, color:'#6be6ff' });
      return;
    }

    if (type === 'blueNeo' || type === 'purpleNeo') {
      safeFireSpread(e, tools, 3, 0.18, { sizeType:'normal', speed:2.75, hp:0, r:11, image:'atk/neonring.png', flipY:true });
      return;
    }

    if (type === 'enma') {
      safeFireSpread(e, tools, 3, 0.24, { sizeType:'big', speed:2.25, hp:12, r:17, image:'atk/enma.png', flipY:true, color:'#ff3b3b' });
      return;
    }

    safeFireSpread(e, tools, 3, 0.22, { sizeType:'normal', speed:2.45, hp:0, r:11 });
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

    if (isBoss) {
      runBossNormal(e, tools, config);
    } else {
      runMidNormal(e, tools, config);
    }
  }

  function updateMidBoss(e, tools){
    const config = getMidBossConfig(e);

    initEnemyBase(e, config);

    if (updateEntrance(e)) return;

    updateCommonTimers(e);
    safeProcessPendingShots(e, tools);

    if (e.diveMode) {
      if (skills() && skills().updateDive) skills().updateDive(e, tools);
      return;
    }

    if (updateDiveReturn(e, tools)) return;

    moveBase(e, tools, config, false);

    e.shootCd--;
    e.attackCd--;

    if (e.shootCd <= 0) {
      e.shootCd = Math.max(70, Number(config.shootCd || 125));
      runMidNormal(e, tools, config);
    }

    if (e.attackCd <= 0) {
      e.attackStep++;
      e.attackCd = Math.max(95, Number(config.attackCd || 185));
      safeRunSkill(e, tools, config, false);
    }
  }

  function updateBoss(e, tools){
    const config = getBossConfig(e);

    initEnemyBase(e, config);

    if (updateEntrance(e)) return;

    updateCommonTimers(e);
    safeProcessPendingShots(e, tools);

    if (e.diveMode) {
      if (skills() && skills().updateDive) skills().updateDive(e, tools);
      return;
    }

    if (updateDiveReturn(e, tools)) return;

    moveBase(e, tools, config, true);

    e.shootCd--;
    e.attackCd--;

    if (e.shootCd <= 0) {
      e.shootCd = Math.max(65, Number(config.shootCd || 115));
      runBossNormal(e, tools, config);
    }

    if (e.attackCd <= 0) {
      e.attackStep++;
      e.attackCd = Math.max(110, Number(config.attackCd || 195));
      safeRunSkill(e, tools, config, true);
    }

    if (e.name === 'モブリリス' && !e.healUsed && e.hp <= e.maxHp * 0.5) {
      e.healUsed = true;
      if (skills() && skills().healBoss) skills().healBoss(e, tools, 0.08);
    }

    if (e.name === 'ウルモブリリス' && !e.healUsed && e.hp <= e.maxHp * 0.5) {
      e.healUsed = true;
      if (skills() && skills().healBoss) skills().healBoss(e, tools, 0.08);
      if (skills() && skills().summonLilithSisters) skills().summonLilithSisters(e, tools);
    }
  }

  window.MobShotBossAI = {
    updateMidBoss,
    updateBoss
  };
})();
