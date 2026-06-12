'use strict';

(function(){
  const BOSS_ATTACKS = {
    'ホークモブ': { image:'atk/hawkatk.png', flipY:true, size:24, bigSize:56 },
    'ホークモブⅡ': { image:'atk/hawkatk.png', flipY:true, size:26, bigSize:64 },

    'ミラモブ': { image:'atk/miraatk.png', flipY:true, size:28, bigSize:62 },
    'ミラモブⅡ': { image:'atk/miraatk.png', flipY:true, size:30, bigSize:70 },

    '番人': { image:'atk/hinotama.png', flipY:true, size:28, bigSize:64 },
    'モブガーディアン': { image:'atk/hinotama.png', flipY:true, size:28, bigSize:64 },
    '番人Ⅱ': { image:'atk/hinotama.png', flipY:true, size:30, bigSize:72 },
    'モブガーディアンⅡ': { image:'atk/hinotama.png', flipY:true, size:30, bigSize:72 },

    'ネオンモブ': { image:'atk/kaminari.png', flipY:true, size:30, bigSize:68 },
    'ネオンモブⅡ': { image:'atk/kaminari.png', flipY:true, size:32, bigSize:76 },

    'ドラゴンモブ': { image:'atk/dragon.png', flipY:false, size:36, bigSize:84 },
    'ドラゴンモブⅡ': { image:'atk/dragon.png', flipY:false, size:38, bigSize:92 },

    'モブリリス': { image:'atk/atkriri.png', flipY:false, size:32, bigSize:74 },
    'モブ魔王': { image:'atk/atkmaoh.png', flipY:true, size:38, bigSize:90 },

    'モブメイル': { image:'atk/atkmeiru.png', flipY:false, size:38, bigSize:88 },
    'モブスミス': { image:'atk/matrix.png', flipY:true, size:34, bigSize:78 },
    'モブネプ': { image:'atk/atknep.png', flipY:true, size:38, bigSize:88 },
    'ブルネオモブ': { image:'atk/neonring.png', flipY:true, size:34, bigSize:78 },
    'パルネオモブ': { image:'atk/neonring.png', flipY:true, size:34, bigSize:78 },
    '閻魔モブ': { image:'atk/enma.png', flipY:true, size:38, bigSize:90 },
    'ウルモブリリス': { image:'atk/atkriri.png', flipY:false, size:38, bigSize:90 }
  };

  function getSpec(e){
    return BOSS_ATTACKS[e.name] || {
      image:'atk/hawkatk.png',
      flipY:true,
      size:28,
      bigSize:64
    };
  }

  function getAreaZakoList(tools){
    const D = tools.D;

    if (
      !D ||
      !D.enemies ||
      !Array.isArray(D.enemies.zako)
    ) {
      return [];
    }

    return D.enemies.zako;
  }

  function initEnemyBase(e){
    if (e.__bossInit) return;

    e.__bossInit = true;
    e.aiTimer = 0;
    e.shootCd = Math.max(90, Number(e.shootCd || 100));
    e.attackCd = Math.max(130, Number(e.attackCd || 150));
    e.attackStep = Number(e.attackStep || 0);
    e.pendingShots = [];
    e.specialMove = '';
    e.specialTimer = 0;
    e.hitPlayerCd = 0;
    e.summonCount = 0;
    e.cloneUsed = false;
    e.healUsed = false;
    e.barrierTimer = 0;
    e.barrierHp = 0;
    e.ghostTimer = 0;
    e.alpha = 1;
  }

  function updateMidBoss(e, tools){
    initEnemyBase(e);

    if (e.y < e.targetY && !e.diveMode) {
      e.y += e.vy || 2;
      return;
    }

    if (e.hitPlayerCd > 0) e.hitPlayerCd--;

    processPendingShots(e, tools);

    if (e.diveMode) {
      updateDive(e, tools);
      return;
    }

    if (e.diveReturn) {
      e.y += e.vy || 2;

      if (e.y >= e.baseY) {
        e.y = e.baseY;
        e.diveReturn = false;
      }

      return;
    }

    e.aiTimer++;
    e.x += e.vx || 1.2;

    if (e.x < tools.W * 0.18 || e.x > tools.W * 0.82) {
      e.vx = -(e.vx || 1.2);
    }

    e.shootCd--;
    e.attackCd--;

    if (e.shootCd <= 0) {
      e.shootCd = getMidBossShootCd(e);
      runMidBossNormal(e, tools);
    }

    if (e.attackCd <= 0) {
      e.attackStep++;
      e.attackCd = getMidBossAttackCd(e);
      runMidBossSpecial(e, tools);
    }
  }

  function getMidBossShootCd(e){
    if (e.name === 'モブギドラ') return 105;
    if (e.name === 'モブピー') return 90;
    if (e.name === 'マグモブレム') return 140;
    if (e.name === 'グラディモブ') return 120;
    return 120;
  }

  function getMidBossAttackCd(e){
    if (e.name === 'モブピー') return 145;
    if (e.name === 'マグモブレム') return 185;
    if (e.name === 'グラディモブ') return 165;
    return 160;
  }

  function runMidBossNormal(e, tools){
    if (e.name === 'モブプテラ') {
      midSpreadBurst(e, tools, 3, 2, 3.0, false);
      return;
    }

    if (e.name === 'モブデュアル') {
      sideDoubleShot(e, tools);
      return;
    }

    if (e.name === 'モブピー') {
      midRapid(e, tools, 3, 16, 3.2);
      return;
    }

    if (e.name === 'モブギドラ') {
      midSpreadBurst(e, tools, 3, 1, 3.1, false);
      return;
    }

    if (e.name === 'マグモブレム') {
      fireAimed(e, tools, true, 2.15, {
        image:'atk/dragon.png',
        flipY:false,
        hp:18,
        dmg:14,
        r:24
      });
      return;
    }

    if (e.name === 'グラディモブ') {
      midSpreadBurst(e, tools, 2, 1, 3.2, false);
      return;
    }

    midSpreadBurst(e, tools, 1, 1, 3.0, false);
  }

  function runMidBossSpecial(e, tools){
    const addText = tools.addText;

    if (e.name === 'モブプテラ') {
      if (e.attackStep % 3 === 0) {
        summonStageEnemies(e, tools, 2, 0.85);
        addText('援護！', e.x, e.y - 60, '#b78cff');
      } else {
        startDive(e, tools, 5.2);
        addText('突進！', e.x, e.y - 60, '#ffcf5b');
      }
      return;
    }

    if (e.name === 'モブデュアル') {
      addText('デュアル！', e.x, e.y - 60, '#9deeff');
      e.vx = e.vx > 0 ? -2.5 : 2.5;
      sideDoubleShot(e, tools);
      midRapid(e, tools, 2, 18, 3.4);
      return;
    }

    if (e.name === 'モブピー') {
      addText('連射！', e.x, e.y - 60, '#ffe66b');
      midRapid(e, tools, 5, 12, 3.5);
      e.x = tools.clamp(
        e.x + tools.rand(-90, 90),
        tools.W * 0.18,
        tools.W * 0.82
      );
      return;
    }

    if (e.name === 'モブギドラ') {
      addText('三連雷！', e.x, e.y - 60, '#6be6ff');
      midSpreadBurst(e, tools, 3, 3, 3.25, false);
      return;
    }

    if (e.name === 'マグモブレム') {
      addText('マグマ弾！', e.x, e.y - 60, '#ff7a35');
      for (let i = 0; i < 3; i++) {
        e.pendingShots.push({
          delay: i * 28,
          kind:'aim',
          big:true,
          speed:2.0,
          image:'atk/dragon.png',
          flipY:false,
          hp:22,
          dmg:16,
          r:28
        });
      }
      return;
    }

    if (e.name === 'グラディモブ') {
      if (e.attackStep % 2 === 0) {
        startDive(e, tools, 5.8);
        addText('斬り込み！', e.x, e.y - 60, '#ffcf5b');
      } else {
        midSpreadBurst(e, tools, 3, 1, 3.3, true);
      }
      return;
    }

    startDive(e, tools, 5.2);
    addText('突進！', e.x, e.y - 60, '#ffcf5b');
  }

  function updateBoss(e, tools){
    initEnemyBase(e);

    if (e.y < e.targetY) {
      e.y += e.vy || 1.6;
      return;
    }

    if (e.hitPlayerCd > 0) e.hitPlayerCd--;

    processPendingShots(e, tools);

    if (e.diveMode) {
      updateDive(e, tools);
      return;
    }

    if (e.specialMove) {
      updateSpecialMove(e, tools);
    } else {
      moveBossBase(e, tools);
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
      e.shootCd = getBossShootCd(e);
      runBossNormal(e, tools);
    }

    if (e.attackCd <= 0) {
      e.attackStep++;
      e.attackCd = getBossAttackCd(e);
      runBossSpecial(e, tools);
    }

    if (
      e.name === 'モブリリス' &&
      !e.healUsed &&
      e.hp <= e.maxHp * 0.5
    ) {
      e.healUsed = true;
      e.hp = Math.min(e.maxHp, e.hp + Math.ceil(e.maxHp * 0.1));
      tools.addText('回復！', e.x, e.y - 96, '#9dff73');
      tools.burst(e.x, e.y, '#9dff73', 40);
    }

    if (
      e.name === 'ウルモブリリス' &&
      !e.healUsed &&
      e.hp <= e.maxHp * 0.5
    ) {
      e.healUsed = true;
      e.hp = Math.min(e.maxHp, e.hp + Math.ceil(e.maxHp * 0.1));
      tools.addText('回復！', e.x, e.y - 96, '#9dff73');
      tools.burst(e.x, e.y, '#9dff73', 50);
      summonLilithSisters(e, tools);
    }
  }

  function getBossShootCd(e){
    if (e.name === 'モブリリス') return 86;
    if (e.name === 'ウルモブリリス') return 78;
    if (e.name === 'モブ魔王') return 82;
    if (e.name === 'ドラゴンモブ' || e.name === 'ドラゴンモブⅡ') return 92;
    return 95;
  }

  function getBossAttackCd(e){
    if (e.name === 'モブリリス') return 145;
    if (e.name === 'ウルモブリリス') return 135;
    if (e.name === 'モブ魔王') return 140;
    if (e.name === 'ホークモブⅡ') return 145;
    if (e.name === 'ミラモブⅡ') return 150;
    return 155;
  }

  function runBossNormal(e, tools){
    if (e.name === 'ホークモブ') {
      aimedSpread(e, tools, 4, false, 3.0, 0.18);
      return;
    }

    if (e.name === 'ホークモブⅡ') {
      aimedSpread(e, tools, 5, false, 3.05, 0.17);
      return;
    }

    if (e.name === 'ミラモブ' || e.name === 'ミラモブⅡ') {
      speedVariedSpread(e, tools, e.name === 'ミラモブⅡ' ? 4 : 3);
      return;
    }

    if (e.name === '番人' || e.name === 'モブガーディアン') {
      aimedSpread(e, tools, 3, false, 3.0, 0.2);
      return;
    }

    if (e.name === '番人Ⅱ' || e.name === 'モブガーディアンⅡ') {
      aimedSpread(e, tools, 3, false, 3.25, 0.24);
      return;
    }

    if (e.name === 'ネオンモブ' || e.name === 'ネオンモブⅡ') {
      randomRain(e, tools, e.name === 'ネオンモブⅡ' ? 5 : 4, false, 3.0);
      return;
    }

    if (e.name === 'ドラゴンモブ' || e.name === 'ドラゴンモブⅡ') {
      aimedSpread(e, tools, 5, false, 2.8, 0.16);
      return;
    }

    if (e.name === 'モブリリス') {
      randomRain(e, tools, 5, false, 3.0);
      return;
    }

    if (e.name === 'モブ魔王') {
      aimedSpread(e, tools, 6, false, 3.05, 0.14);
      return;
    }

    if (e.name === 'モブメイル') {
      aimedSpread(e, tools, 2, false, 3.1, 0.26);
      return;
    }

    if (e.name === 'モブスミス' || e.name === 'モブネプ') {
      aimedSpread(e, tools, 1, false, 4.0, 0);
      return;
    }

    if (e.name === 'ブルネオモブ' || e.name === 'パルネオモブ') {
      aimedSpread(e, tools, 2, false, 3.15, 0.25);
      return;
    }

    if (e.name === '閻魔モブ') {
      aimedSpread(e, tools, 3, false, 3.25, 0.24);
      return;
    }

    if (e.name === 'ウルモブリリス') {
      randomRain(e, tools, 10, false, 2.6);
      return;
    }

    aimedSpread(e, tools, 3, false, 3.0, 0.2);
  }

  function runBossSpecial(e, tools){
    const n = e.attackStep % 8;

    if (e.name === 'モブリリス') {
      runLilith(e, tools, n);
      return;
    }

    if (e.name === 'ウルモブリリス') {
      runUltraLilith(e, tools, n);
      return;
    }

    if (e.name === 'モブ魔王') {
      runMaoh(e, tools, n);
      return;
    }

    if (n === 1) {
      rapidShot(e, tools, isStrong(e) ? 8 : 4);
      return;
    }

    if (n === 2) {
      chargeBigShots(e, tools, isStrong(e) ? 5 : 3);
      return;
    }

    if (n === 3) {
      sideMoveRapid(e, tools, isStrong(e) ? 6 : 4);
      return;
    }

    if (n === 4) {
      summonStageEnemies(e, tools, 2, 0.9);
      tools.addText('召喚！', e.x, e.y - 92, '#b78cff');
      return;
    }

    if (n === 5 && e.name.indexOf('ミラモブ') >= 0) {
      e.ghostTimer = 180;
      e.barrierTimer = 180;
      tools.addText('半透明！', e.x, e.y - 92, '#b78cff');
      chargeBigShots(e, tools, isStrong(e) ? 5 : 3);
      return;
    }

    if (n === 6 && e.name.indexOf('ドラゴン') >= 0) {
      chargeBigShots(e, tools, isStrong(e) ? 6 : 5, 'atk/dragon.png', false);
      return;
    }

    rapidShot(e, tools, isStrong(e) ? 6 : 4);
  }

  function runLilith(e, tools, n){
    if (n === 1) {
      makeBarrier(e, tools, 3, 38);
      return;
    }

    if (n === 2) {
      makeClones(e, tools, 3);
      return;
    }

    if (n === 3) {
      bigSpread(e, tools, 3);
      return;
    }

    if (n === 4) {
      sideMoveRapid(e, tools, 4);
      return;
    }

    if (n === 5) {
      lightningRain(e, tools, 10);
      return;
    }

    if (n === 6) {
      summonStageEnemies(e, tools, 2, 0.9);
      tools.addText('召喚！', e.x, e.y - 92, '#b78cff');
      return;
    }

    if (n === 7) {
      e.hp = Math.min(e.maxHp, e.hp + Math.ceil(e.maxHp * 0.1));
      tools.addText('回復！', e.x, e.y - 92, '#9dff73');
      tools.burst(e.x, e.y, '#9dff73', 34);
      return;
    }

    randomRain(e, tools, 5, false, 3.0);
  }

  function runUltraLilith(e, tools, n){
    if (n === 1) {
      makeBarrier(e, tools, 10, 90);
      return;
    }

    if (n === 2) {
      makeClones(e, tools, 3);
      return;
    }

    if (n === 3) {
      bigSpread(e, tools, 3);
      return;
    }

    if (n === 4) {
      sideMoveRapid(e, tools, 4);
      return;
    }

    if (n === 5) {
      lightningRain(e, tools, 10);
      return;
    }

    if (n === 6) {
      summonStageEnemies(e, tools, 2, 0.9);
      tools.addText('召喚！', e.x, e.y - 92, '#b78cff');
      return;
    }

    if (n === 7) {
      randomRain(e, tools, 10, true, 2.45, 'atk/kaminari.png', true);
      return;
    }

    randomRain(e, tools, 10, false, 2.7);
  }

  function runMaoh(e, tools, n){
    if (n === 1) {
      rapidShot(e, tools, 8);
      return;
    }

    if (n === 2) {
      chargeBigShots(e, tools, 5, 'atk/atkmaoh.png', true);
      return;
    }

    if (n === 3) {
      makeBarrier(e, tools, 5, 70);
      return;
    }

    if (n === 4) {
      sideMoveRapid(e, tools, 8);
      return;
    }

    if (n === 5) {
      summonStageEnemies(e, tools, 2, 0.9);
      tools.addText('召喚！', e.x, e.y - 92, '#b78cff');
      return;
    }

    if (n === 6) {
      randomRain(e, tools, 6, true, 2.35, 'atk/dragon.png', false);
      return;
    }

    aimedSpread(e, tools, 6, false, 3.1, 0.14);
  }

  function moveBossBase(e, tools){
    e.x += e.vx || 1.4;

    if (e.x < tools.W * 0.18 || e.x > tools.W * 0.82) {
      e.vx = -(e.vx || 1.4);
    }

    e.x = tools.clamp(e.x, tools.W * 0.14, tools.W * 0.86);
    e.y = tools.clamp(e.y, tools.H * 0.12, tools.H * 0.36);
  }

  function updateSpecialMove(e, tools){
    e.specialTimer--;

    if (e.specialMove === 'sideRapid') {
      e.x += e.specialVx || 3.0;

      if (e.x < tools.W * 0.16 || e.x > tools.W * 0.84) {
        e.specialVx *= -1;
      }
    }

    if (e.specialTimer <= 0) {
      e.specialMove = '';
      e.vx = e.baseVx || e.vx || 1.4;
    }
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
        fireAimed(e, tools, !!shot.big, shot.speed || 3.0, shot);
      }

      if (shot.kind === 'angle') {
        fireAngle(e, tools, shot.angle, !!shot.big, shot.speed || 3.0, shot);
      }

      if (shot.kind === 'rain') {
        fireToPoint(e, tools, shot.targetX, shot.targetY, !!shot.big, shot.speed || 3.0, shot);
      }
    });
  }

  function midSpreadBurst(e, tools, dirs, repeat, speed, big){
    const state = tools.state;
    const base = Math.atan2(state.player.y - e.y, state.player.x - e.x);
    const spread = 0.22;

    for (let r = 0; r < repeat; r++) {
      for (let i = 0; i < dirs; i++) {
        e.pendingShots.push({
          delay: r * 16,
          kind:'angle',
          angle: base + (i - (dirs - 1) / 2) * spread,
          big,
          speed,
          image:null,
          hp: big ? 14 : 0,
          dmg: big ? 12 : 8,
          r: big ? 20 : 9
        });
      }
    }
  }

  function sideDoubleShot(e, tools){
    const baseX = e.x;
    [-34, 34].forEach(offset => {
      fireAimed(e, tools, false, 3.2, {
        sx: baseX + offset,
        sy: e.y + 34,
        dmg:9,
        r:10
      });
    });
  }

  function midRapid(e, tools, count, gap, speed){
    for (let i = 0; i < count; i++) {
      e.pendingShots.push({
        delay:i * gap,
        kind:'aim',
        big:false,
        speed,
        dmg:8,
        r:9
      });
    }
  }

  function aimedSpread(e, tools, count, big, speed, spread){
    const state = tools.state;
    const base = Math.atan2(state.player.y - e.y, state.player.x - e.x);

    for (let i = 0; i < count; i++) {
      fireAngle(
        e,
        tools,
        base + (i - (count - 1) / 2) * spread,
        big,
        speed,
        {}
      );
    }
  }

  function speedVariedSpread(e, tools, count){
    const state = tools.state;
    const base = Math.atan2(state.player.y - e.y, state.player.x - e.x);

    for (let i = 0; i < count; i++) {
      fireAngle(
        e,
        tools,
        base + (i - (count - 1) / 2) * 0.2,
        false,
        2.6 + i * 0.28,
        {}
      );
    }
  }

  function randomRain(e, tools, count, big, speed, image, flipY){
    for (let i = 0; i < count; i++) {
      const tx = tools.rand(tools.W * 0.18, tools.W * 0.82);
      const ty = tools.H * 0.86;

      e.pendingShots.push({
        delay:i * 10,
        kind:'rain',
        targetX:tx,
        targetY:ty,
        big,
        speed: speed + tools.rand(-0.25, 0.35),
        image,
        flipY
      });
    }
  }

  function rapidShot(e, tools, count){
    tools.addText('連射！', e.x, e.y - 92, '#ff8cff');

    for (let i = 0; i < count; i++) {
      e.pendingShots.push({
        delay:i * 13,
        kind:'aim',
        big:false,
        speed:3.55,
        offsetX:(i - (count - 1) / 2) * 8
      });
    }
  }

  function chargeBigShots(e, tools, count, image, flipY){
    tools.addText('溜め！', e.x, e.y - 96, '#ffe66b');

    for (let i = 0; i < count; i++) {
      e.pendingShots.push({
        delay:80 + i * 22,
        kind:'aim',
        big:true,
        speed:2.1,
        image,
        flipY
      });
    }
  }

  function bigSpread(e, tools, count){
    tools.addText('巨大弾！', e.x, e.y - 96, '#ffe66b');
    aimedSpread(e, tools, count, true, 2.15, 0.24);
  }

  function sideMoveRapid(e, tools, count){
    tools.addText('移動連射！', e.x, e.y - 92, '#9deeff');

    e.specialMove = 'sideRapid';
    e.specialTimer = 100;
    e.baseVx = e.vx || 1.4;
    e.specialVx = e.x < tools.W / 2 ? 3.0 : -3.0;

    for (let i = 0; i < count; i++) {
      e.pendingShots.push({
        delay:i * 16,
        kind:'aim',
        big:false,
        speed:3.5
      });
    }
  }

  function lightningRain(e, tools, count){
    tools.addText('雷撃！', e.x, e.y - 96, '#6be6ff');
    randomRain(e, tools, count, true, 2.4, 'atk/kaminari.png', true);
  }

  function makeBarrier(e, tools, sec, hp){
    e.barrierTimer = sec * 60;
    e.barrierHp = hp;
    tools.addText('バリア！', e.x, e.y - 96, '#9deeff');
    tools.burst(e.x, e.y, '#9deeff', 45);
  }

  function makeClones(e, tools, count){
    if (e.cloneUsed) {
      randomRain(e, tools, 5, false, 3.0);
      return;
    }

    e.cloneUsed = true;
    tools.addText('分身！', e.x, e.y - 96, '#b78cff');

    for (let i = 0; i < count; i++) {
      const offset = (i - (count - 1) / 2) * 70;

      tools.state.entities.push({
        kind:'enemy',
        name:'リリス分身',
        image:e.image,
        x:tools.clamp(e.x + offset, tools.W * 0.18, tools.W * 0.82),
        y:e.y + 30,
        vx:tools.rand(-0.6, 0.6),
        vy:1.0,
        r:34,
        hp:Math.ceil(e.maxHp * 0.035),
        maxHp:Math.ceil(e.maxHp * 0.035),
        score:80,
        coinMin:3,
        coinMax:6,
        canShoot:true,
        baseShootCd:170,
        bulletLarge:false,
        bulletColor:'#ff8cff',
        dead:false,
        bob:tools.rand(0, Math.PI * 2)
      });
    }
  }

  function summonLilithSisters(e, tools){
    const sisters = [
      { name:'リリスレッド', image:'atk/red.png', hp:28, speed:2.2, cd:95 },
      { name:'リリスブルー', image:'atk/blue.png', hp:45, speed:1.8, cd:135 },
      { name:'リリスイエロー', image:'atk/yellow.png', hp:30, speed:2.8, cd:120 },
      { name:'リリスホワイト', image:'atk/white.png', hp:26, speed:2.1, cd:120, teleport:true }
    ];

    sisters.forEach((s, i) => {
      tools.state.entities.push({
        kind:'enemy',
        name:s.name,
        image:s.image,
        x:tools.W * (0.23 + i * 0.18),
        y:-80 - i * 32,
        vx:tools.rand(-0.7, 0.7),
        vy:s.speed,
        r:30,
        hp:s.hp,
        maxHp:s.hp,
        score:120,
        coinMin:5,
        coinMax:10,
        canShoot:true,
        baseShootCd:s.cd,
        burstShot:true,
        bulletLarge:false,
        bulletColor:'#ff8cff',
        aiType:s.teleport ? 'teleport' : 'fastSide',
        dead:false,
        bob:tools.rand(0, Math.PI * 2)
      });
    });

    tools.addText('リリス四姉妹！', e.x, e.y - 110, '#ff8cff');
  }

  function summonStageEnemies(e, tools, count, hpRate){
    const list = getAreaZakoList(tools);
    if (!list.length) return;

    for (let i = 0; i < count; i++) {
      const def = list[(e.summonCount + i) % list.length];
      const hp = Math.ceil(Number(def.hp || 5) * hpRate);

      tools.state.entities.push({
        kind:'enemy',
        name:def.name,
        image:def.image,
        x:tools.rand(tools.W * 0.22, tools.W * 0.78),
        y:-70 - i * 56,
        vx:tools.rand(-0.65, 0.65),
        vy:1.85,
        r:def.name === 'モブロック' ? 34 : 31,
        hp,
        maxHp:hp,
        score:Number(def.score || 10),
        coinMin:Number(def.coinMin || 1),
        coinMax:Number(def.coinMax || 3),
        dead:false,
        bob:tools.rand(0, Math.PI * 2)
      });
    }

    e.summonCount += count;
  }

  function startDive(e, tools, speed){
    const dx = tools.state.player.x - e.x;
    const dy = tools.state.player.y - e.y;
    const len = Math.max(1, Math.sqrt(dx * dx + dy * dy));

    e.diveMode = true;
    e.diveVx = dx / len * speed;
    e.diveVy = dy / len * speed;
  }

  function updateDive(e, tools){
    e.x += e.diveVx;
    e.y += e.diveVy;

    if (e.y > tools.H + 90) {
      e.diveMode = false;
      e.diveReturn = true;
      e.x = tools.clamp(e.x, tools.W * 0.2, tools.W * 0.8);
      e.y = -120;
      e.targetY = e.baseY || tools.H * 0.25;
      e.vx = tools.rand(1.0, 1.6) * (Math.random() < 0.5 ? -1 : 1);
    }
  }

  function fireAimed(e, tools, big, speed, opt){
    opt = opt || {};

    const sx = opt.sx != null ? opt.sx : e.x + Number(opt.offsetX || 0);
    const sy = opt.sy != null ? opt.sy : e.y + (big ? 70 : 56);

    const dx = tools.state.player.x - sx;
    const dy = tools.state.player.y - sy;
    const angle = Math.atan2(dy, dx);

    fireAngle(e, tools, angle, big, speed, Object.assign({}, opt, { sx, sy }));
  }

  function fireToPoint(e, tools, tx, ty, big, speed, opt){
    opt = opt || {};

    const sx = opt.sx != null ? opt.sx : e.x;
    const sy = opt.sy != null ? opt.sy : e.y + (big ? 70 : 56);

    const angle = Math.atan2(ty - sy, tx - sx);

    fireAngle(e, tools, angle, big, speed, Object.assign({}, opt, { sx, sy }));
  }

  function fireAngle(e, tools, angle, big, speed, opt){
    opt = opt || {};

    const spec = getSpec(e);
    const image = opt.image || spec.image;
    const flipY = opt.flipY != null ? opt.flipY : spec.flipY;
    const r = opt.r || (big ? spec.bigSize * 0.42 : spec.size * 0.42);
    const hp = big
      ? Number(opt.hp || Math.ceil((e.maxHp || 500) * 0.052))
      : Number(opt.hp || 0);

    tools.state.entities.push({
      kind:'enemyBullet',
      x:opt.sx != null ? opt.sx : e.x,
      y:opt.sy != null ? opt.sy : e.y + (big ? 70 : 56),
      vx:Math.cos(angle) * speed,
      vy:Math.sin(angle) * speed,
      r,
      dmg:Number(opt.dmg || (big ? 22 : 11)),
      hp,
      maxHp:hp,
      breakable:hp > 0,
      image,
      flipY,
      dead:false,
      bob:0,
      color:big ? '#ffe66b' : '#ff4aff',
      life:520
    });
  }

  function isStrong(e){
    return (
      e.name.indexOf('Ⅱ') >= 0 ||
      e.name === 'モブ魔王' ||
      e.name === 'モブメイル' ||
      e.name === 'モブスミス' ||
      e.name === 'モブネプ' ||
      e.name === 'ブルネオモブ' ||
      e.name === 'パルネオモブ' ||
      e.name === '閻魔モブ' ||
      e.name === 'ウルモブリリス'
    );
  }

  window.MobShotBoss = {
    updateMidBoss,
    updateBoss
  };
})();
