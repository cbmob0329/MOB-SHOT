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

  function initEnemyBase(e, config){
    if (e.__bossAiInit) return;

    e.__bossAiInit = true;
    e.aiTimer = 0;
    e.shootCd = Math.max(60, Number(e.shootCd || config.shootCd || 140));
    e.attackCd = Math.max(90, Number(e.attackCd || config.attackCd || 220));
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

      if (e.barrierTimer <= 0) {
        e.barrierHp = 0;
      }
    }

    if (e.ghostTimer > 0) {
      e.ghostTimer--;
      e.alpha = 0.42;

      if (e.ghostTimer <= 0) {
        e.alpha = 1;
      }
    }

    if (e.specialTimer > 0) {
      e.specialTimer--;
    }
  }

  function moveBase(e, tools, config, isBoss){
    const left = isBoss ? tools.W * 0.18 : tools.W * 0.2;
    const right = isBoss ? tools.W * 0.82 : tools.W * 0.8;

    const speed = Number(config.moveSpeed || e.baseVx || 1.3);

    if (!e.vx) {
      e.vx = speed * (Math.random() < 0.5 ? -1 : 1);
    }

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

  function runMidNormal(e, tools, config){
    const type = config.type;

    if (type === 'rapid') {
      bullets().fireSpread(e, tools, 2, 0.22, {
        sizeType: 'small',
        speed: 2.65,
        hp: 0
      });
      return;
    }

    if (type === 'magma' || type === 'heavy') {
      bullets().fireSpread(e, tools, 2, 0.20, {
        sizeType: 'normal',
        speed: 2.25,
        hp: 10
      });
      return;
    }

    if (type === 'thunder' || type === 'neon') {
      bullets().fireSpread(e, tools, 3, 0.18, {
        sizeType: 'small',
        speed: 2.55,
        hp: 0,
        image: 'atk/kaminari.png',
        flipY: true,
        color: '#6be6ff',
        safeCenter: true
      });
      return;
    }

    if (type === 'blade' || type === 'dash') {
      bullets().fireSpread(e, tools, 2, 0.26, {
        sizeType: 'small',
        speed: 2.75,
        hp: 0
      });
      return;
    }

    if (type === 'lilith') {
      bullets().fireSpread(e, tools, 3, 0.20, {
        sizeType: 'small',
        speed: 2.55,
        hp: 0,
        color: '#ff8cff'
      });
      return;
    }

    bullets().fireSpread(e, tools, 2, 0.24, {
      sizeType: 'small',
      speed: 2.45,
      hp: 0
    });
  }

  function runBossNormal(e, tools, config){
    const type = config.type;

    if (type === 'hawk') {
      bullets().fireSpread(e, tools, 3, 0.24, {
        sizeType: 'normal',
        speed: 2.45,
        hp: 0,
        safeCenter: false
      });
      return;
    }

    if (type === 'mira') {
      bullets().fireSpread(e, tools, 3, 0.20, {
        sizeType: 'normal',
        speed: 2.65,
        hp: 0,
        color: '#b78cff'
      });
      return;
    }

    if (type === 'guardian') {
      bullets().fireSpread(e, tools, 2, 0.28, {
        sizeType: 'big',
        speed: 2.05,
        hp: 14,
        color: '#ff7a35'
      });
      return;
    }

    if (type === 'neon') {
      bullets().fireSpread(e, tools, 3, 0.18, {
        sizeType: 'normal',
        speed: 2.75,
        hp: 0,
        image: 'atk/kaminari.png',
        flipY: true,
        color: '#6be6ff'
      });
      return;
    }

    if (type === 'dragon') {
      bullets().fireSpread(e, tools, 3, 0.22, {
        sizeType: 'big',
        speed: 2.25,
        hp: 12,
        image: 'atk/dragon.png',
        flipY: false,
        color: '#ff5b35'
      });
      return;
    }

    if (type === 'lilith' || type === 'ultraLilith') {
      bullets().fireSpread(e, tools, 3, 0.20, {
        sizeType: 'normal',
        speed: 2.5,
        hp: 0,
        color: '#ff8cff'
      });
      return;
    }

    if (type === 'maoh') {
      bullets().fireSpread(e, tools, 4, 0.18, {
        sizeType: 'normal',
        speed: 2.45,
        hp: 0,
        safeCenter: true,
        image: 'atk/atkmaoh.png',
        flipY: true,
        color: '#ff4aff'
      });
      return;
    }

    if (type === 'mail') {
      bullets().fireSpread(e, tools, 2, 0.28, {
        sizeType: 'big',
        speed: 2.05,
        hp: 14,
        color: '#bfc7d5'
      });
      return;
    }

    if (type === 'smith') {
      bullets().fireSpread(e, tools, 3, 0.18, {
        sizeType: 'normal',
        speed: 2.65,
        hp: 0,
        image: 'atk/matrix.png',
        flipY: true,
        color: '#7bffea'
      });
      return;
    }

    if (type === 'nep') {
      bullets().fireSpread(e, tools, 3, 0.22, {
        sizeType: 'normal',
        speed: 2.45,
        hp: 0,
        image: 'atk/atknep.png',
        flipY: true,
        color: '#6be6ff'
      });
      return;
    }

    if (type === 'blueNeo' || type === 'purpleNeo') {
      bullets().fireSpread(e, tools, 3, 0.18, {
        sizeType: 'normal',
        speed: 2.75,
        hp: 0,
        image: 'atk/neonring.png',
        flipY: true
      });
      return;
    }

    if (type === 'enma') {
      bullets().fireSpread(e, tools, 3, 0.24, {
        sizeType: 'big',
        speed: 2.25,
        hp: 12,
        image: 'atk/enma.png',
        flipY: true,
        color: '#ff3b3b'
      });
      return;
    }

    bullets().fireSpread(e, tools, 3, 0.22, {
      sizeType: 'normal',
      speed: 2.45,
      hp: 0
    });
  }

  function updateMidBoss(e, tools){
    const config = data().getMidBossConfig(e.name);

    initEnemyBase(e, config);

    if (updateEntrance(e)) return;

    updateCommonTimers(e);

    bullets().processPendingShots(e, tools);

    if (e.diveMode) {
      skills().updateDive(e, tools);
      return;
    }

    if (updateDiveReturn(e, tools)) return;

    moveBase(e, tools, config, false);

    e.shootCd--;
    e.attackCd--;

    if (e.shootCd <= 0) {
      e.shootCd = Number(config.shootCd || 140);
      runMidNormal(e, tools, config);
    }

    if (e.attackCd <= 0) {
      e.attackStep++;
      e.attackCd = Number(config.attackCd || 205);
      skills().runMidByType(e, tools, config.type, e.attackStep);
    }
  }

  function updateBoss(e, tools){
    const config = data().getBossConfig(e.name);

    initEnemyBase(e, config);

    if (updateEntrance(e)) return;

    updateCommonTimers(e);

    bullets().processPendingShots(e, tools);

    if (e.diveMode) {
      skills().updateDive(e, tools);
      return;
    }

    if (updateDiveReturn(e, tools)) return;

    moveBase(e, tools, config, true);

    e.shootCd--;
    e.attackCd--;

    if (e.shootCd <= 0) {
      e.shootCd = Number(config.shootCd || 155);
      runBossNormal(e, tools, config);
    }

    if (e.attackCd <= 0) {
      e.attackStep++;
      e.attackCd = Number(config.attackCd || 245);
      skills().runByType(e, tools, config.type, e.attackStep);
    }

    if (
      e.name === 'モブリリス' &&
      !e.healUsed &&
      e.hp <= e.maxHp * 0.5
    ) {
      e.healUsed = true;
      skills().healBoss(e, tools, 0.08);
    }

    if (
      e.name === 'ウルモブリリス' &&
      !e.healUsed &&
      e.hp <= e.maxHp * 0.5
    ) {
      e.healUsed = true;
      skills().healBoss(e, tools, 0.08);
      skills().summonLilithSisters(e, tools);
    }
  }

  window.MobShotBossAI = {
    updateMidBoss,
    updateBoss
  };
})();
