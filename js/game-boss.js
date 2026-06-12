'use strict';

(function(){
  function initAI(e){
    if (e.__aiReady) return;

    e.__aiReady = true;
    e.aiTimer = 0;
    e.attackStep = Number(e.attackStep || 0);
    e.actionCd = Math.max(Number(e.actionCd || e.attackCd || 150), 130);
    e.shootCd = Math.max(Number(e.shootCd || 90), 75);
    e.moveMode = 'normal';
    e.summonUsed = false;
    e.specialUsed = false;
    e.hitPlayerCd = 0;
    e.baseMaxHp = e.maxHp || e.hp || 1;
  }

  function updateMidBoss(e, tools){
    initAI(e);

    const W = tools.W;
    const H = tools.H;
    const rand = tools.rand;
    const clamp = tools.clamp;

    if (e.y < e.targetY && !e.diveMode) {
      e.y += e.vy;
      return;
    }

    e.aiTimer++;

    if (e.hitPlayerCd > 0) e.hitPlayerCd--;

    if (e.diveMode) {
      e.x += e.diveVx;
      e.y += e.diveVy;

      if (e.y > H + 90 || e.x < -90 || e.x > W + 90) {
        e.diveMode = false;
        e.diveReturn = true;
        e.x = clamp(e.x, W * 0.2, W * 0.8);
        e.y = -120;
        e.targetY = e.baseY;
        e.vx = rand(1.05, 1.55) * (Math.random() < 0.5 ? -1 : 1);
        e.actionCd = 135;
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

    moveSide(e, tools, 0.18, 0.82);

    e.shootCd--;
    e.actionCd--;

    if (e.shootCd <= 0) {
      midBossNormalShot(e, tools);
      e.shootCd = getMidBossShootCd(e);
    }

    if (e.actionCd <= 0) {
      e.attackStep++;
      runMidBossSpecial(e, tools);
      e.actionCd = getMidBossActionCd(e);
    }
  }

  function updateBoss(e, tools){
    initAI(e);

    const W = tools.W;
    const H = tools.H;

    if (e.y < e.targetY) {
      e.y += e.vy;
      return;
    }

    e.aiTimer++;

    if (e.ghostTimer > 0) {
      e.ghostTimer--;
      e.x += Math.sin(e.aiTimer * 0.22) * 4;
    } else if (e.evadeTimer > 0) {
      e.evadeTimer--;
      e.x += Math.sin(e.aiTimer * 0.34) * 5;
    } else if (e.teleportTimer > 0) {
      e.teleportTimer--;

      if (e.teleportTimer % 45 === 0) {
        e.x = tools.rand(W * 0.22, W * 0.78);
        e.y = tools.rand(H * 0.13, H * 0.25);
      }
    } else {
      moveSide(e, tools, 0.16, 0.84);
    }

    e.x = tools.clamp(e.x, W * 0.12, W * 0.88);
    e.y = tools.clamp(e.y, H * 0.10, H * 0.34);

    if (e.barrierTimer > 0) {
      e.barrierTimer--;
    }

    e.shootCd--;
    e.actionCd--;

    if (e.shootCd <= 0) {
      bossNormalShot(e, tools);
      e.shootCd = getBossShootCd(e);
    }

    if (e.actionCd <= 0) {
      e.attackStep++;
      runBossSpecial(e, tools);
      e.actionCd = getBossActionCd(e);
    }

    if (!e.specialUsed && e.hp <= e.maxHp * 0.5) {
      e.specialUsed = true;
      runHalfHpSpecial(e, tools);
    }
  }

  function moveSide(e, tools, leftRate, rightRate){
    const W = tools.W;

    e.x += e.vx || 1.1;

    if (e.x < W * leftRate || e.x > W * rightRate) {
      e.vx = -(e.vx || 1.1);
    }
  }

  function getMidBossShootCd(e){
    if (e.name === 'モブギドラ') return 88;
    if (e.name === 'モブピー') return 96;
    if (e.name === 'グラディモブ') return 92;
    return 105;
  }

  function getMidBossActionCd(e){
    if (e.name === 'モブピー') return 150;
    if (e.name === 'モブギドラ') return 145;
    if (e.name === 'グラディモブ') return 145;
    return 165;
  }

  function getBossShootCd(e){
    if (e.name.includes('魔王') || e.name.includes('リリス') || e.name.includes('ウルモブ')) return 78;
    if (e.name.includes('ネオン')) return 82;
    if (e.name.includes('ドラゴン')) return 84;
    return 92;
  }

  function getBossActionCd(e){
    if (e.name.includes('魔王') || e.name.includes('ウルモブ')) return 150;
    if (e.strong || e.isLegendBoss) return 160;
    return 175;
  }

  function runMidBossSpecial(e, tools){
    const name = e.name || '';

    if (name === 'モブプテラ') {
      if (e.attackStep % 3 === 1) fanShot(e, tools, 3, 1, 3.2, 8, '#ffe66b');
      else if (e.attackStep % 3 === 2) startDive(e, tools, 5.4, '突進！');
      else summonZako(tools, 2);
      return;
    }

    if (name === 'モブデュアル') {
      if (e.attackStep % 2 === 1) startDive(e, tools, 5.6, '揺れ突進！');
      else burstAim(e, tools, 3, 3.8, 9, '#ff9b45');
      return;
    }

    if (name === 'モブピー') {
      if (e.attackStep % 3 === 1) startDive(e, tools, 5.5, '突進！');
      else if (e.attackStep % 3 === 2) fanShot(e, tools, 3, 1, 3.2, 8, '#9deeff');
      else {
        e.evadeTimer = 120;
        burstAim(e, tools, 4, 3.8, 8, '#60d9ff');
      }
      return;
    }

    if (name === 'モブギドラ') {
      if (e.attackStep % 3 === 1) fanShot(e, tools, 3, 1, 3.4, 9, '#b78cff');
      else if (e.attackStep % 3 === 2) randomBurst(e, tools, 4, 3.6, 8, '#ff4aff');
      else startDive(e, tools, 5.8, '高速突進！');
      return;
    }

    if (name === 'マグモブレム') {
      if (e.attackStep % 2 === 1) startDive(e, tools, 5.0, '重突進！');
      else randomBurst(e, tools, 4, 3.4, 10, '#ff5b3d');
      return;
    }

    if (name === 'グラディモブ') {
      if (e.attackStep % 3 === 1) fanShot(e, tools, 2, 1, 3.3, 9, '#d8d8ff');
      else if (e.attackStep % 3 === 2) homingBullet(e, tools, 1, '#b78cff');
      else homingBullet(e, tools, 2, '#b78cff');
      return;
    }

    if (e.attackStep % 3 === 1) fanShot(e, tools, 3, 1, 3.2, 8, '#ffe66b');
    else if (e.attackStep % 3 === 2) burstAim(e, tools, 3, 3.5, 8, '#ff8cff');
    else summonZako(tools, 2);
  }

  function runBossSpecial(e, tools){
    const name = e.name || '';
    const strong = !!e.strong || !!e.isLegendBoss;

    if (name.includes('ホーク')) {
      if (e.attackStep % 5 === 1) burstAim(e, tools, strong ? 5 : 4, 4.0, 9, '#ffe66b');
      else if (e.attackStep % 5 === 2) chargeBigShots(e, tools, strong ? 3 : 2, 3.0, 22, '#ffcf5b');
      else if (e.attackStep % 5 === 3) sideMoveBarrage(e, tools, 5, '#ffe66b');
      else if (e.attackStep % 5 === 4) summonZako(tools, 3);
      else fanShot(e, tools, strong ? 4 : 3, 1, 3.1, 11, '#ffe66b');
      return;
    }

    if (name.includes('ミラ')) {
      if (e.attackStep % 5 === 1) fanShot(e, tools, strong ? 4 : 3, 1, 2.5, 15, '#d6a4ff');
      else if (e.attackStep % 5 === 2) burstAim(e, tools, 3, 4.0, 10, '#c56bff');
      else if (e.attackStep % 5 === 3) ghostMove(e, tools, strong ? 130 : 100);
      else if (e.attackStep % 5 === 4) randomTeleportBarrage(e, tools, 4, '#d6a4ff');
      else summonZako(tools, 3);
      return;
    }

    if (name.includes('番人') || name.includes('ガーディアン')) {
      if (e.attackStep % 5 === 1) fanShot(e, tools, strong ? 4 : 3, 1, 2.8, 15, '#ff7a3d');
      else if (e.attackStep % 5 === 2) burstAim(e, tools, strong ? 4 : 3, 3.7, 10, '#ff9c2a');
      else if (e.attackStep % 5 === 3) jumpBarrage(e, tools, strong ? 4 : 3, '#ff7a3d');
      else if (e.attackStep % 5 === 4) closeBarrage(e, tools, 5, '#ff9c2a');
      else summonZako(tools, 3);
      return;
    }

    if (name.includes('ネオン')) {
      if (e.attackStep % 5 === 1) randomFan(e, tools, strong ? 5 : 4, 3.4, 12, '#60d9ff');
      else if (e.attackStep % 5 === 2) burstAim(e, tools, 3, 4.0, 10, '#60d9ff');
      else if (e.attackStep % 5 === 3) chargeBigShots(e, tools, strong ? 3 : 2, 2.8, 22, '#b78cff');
      else if (e.attackStep % 5 === 4) closeBarrage(e, tools, 5, '#60d9ff');
      else summonZako(tools, 3);
      return;
    }

    if (name.includes('ドラゴン')) {
      if (e.attackStep % 5 === 1) randomFan(e, tools, strong ? 4 : 3, 3.4, 15, '#ff533d');
      else if (e.attackStep % 5 === 2) chargeBigShots(e, tools, strong ? 4 : 3, 2.8, 24, '#ff2e2e');
      else if (e.attackStep % 5 === 3) burstAim(e, tools, strong ? 5 : 3, 4.1, 12, '#ff7a3d');
      else if (e.attackStep % 5 === 4) wideRain(e, tools, strong ? 8 : 6, '#ff5b3d');
      else summonZako(tools, 3);
      return;
    }

    if (name.includes('魔王')) {
      if (e.attackStep % 7 === 1) randomFan(e, tools, 4, 3.5, 14, '#b78cff');
      else if (e.attackStep % 7 === 2) chargeBigShots(e, tools, 4, 2.8, 25, '#8b36ff');
      else if (e.attackStep % 7 === 3) teleportBarrage(e, tools, 5, '#b78cff');
      else if (e.attackStep % 7 === 4) bossBarrier(e, tools, 120);
      else if (e.attackStep % 7 === 5) wideRain(e, tools, 8, '#8b36ff');
      else if (e.attackStep % 7 === 6) summonZako(tools, 3);
      else burstAim(e, tools, 5, 4.0, 12, '#b78cff');
      return;
    }

    if (name.includes('リリス') || name.includes('ウルモブ')) {
      if (e.attackStep % 7 === 1) randomFan(e, tools, name.includes('ウルモブ') ? 6 : 4, 3.4, 12, '#ff4aa4');
      else if (e.attackStep % 7 === 2) bossBarrier(e, tools, name.includes('ウルモブ') ? 180 : 100);
      else if (e.attackStep % 7 === 3) chargeBigShots(e, tools, 2, 2.8, 24, '#ff4aa4');
      else if (e.attackStep % 7 === 4) burstAim(e, tools, 4, 4.0, 11, '#ff8cff');
      else if (e.attackStep % 7 === 5) wideRain(e, tools, 7, '#b78cff');
      else if (e.attackStep % 7 === 6) healBoss(e, tools, 0.06);
      else summonZako(tools, 3);
      return;
    }

    if (name.includes('スミス') || name.includes('ネプ')) {
      if (e.attackStep % 5 === 1) burstAim(e, tools, 3, 4.3, 11, '#8cfffb');
      else if (e.attackStep % 5 === 2) startBossDive(e, tools, 5.6);
      else if (e.attackStep % 5 === 3) homingBullet(e, tools, 3, '#8cfffb');
      else if (e.attackStep % 5 === 4) evadeMode(e, tools, 180);
      else summonZako(tools, 3);
      return;
    }

    if (name.includes('メイル')) {
      if (e.attackStep % 5 === 1) fanShot(e, tools, 3, 1, 3.1, 14, '#cfd7ff');
      else if (e.attackStep % 5 === 2) burstAim(e, tools, 3, 3.8, 11, '#cfd7ff');
      else if (e.attackStep % 5 === 3) jumpBarrage(e, tools, 3, '#cfd7ff');
      else if (e.attackStep % 5 === 4) homingBullet(e, tools, 2, '#cfd7ff');
      else summonZako(tools, 3);
      return;
    }

    if (name.includes('閻魔')) {
      if (e.attackStep % 6 === 1) fanShot(e, tools, 3, 1, 3.5, 13, '#ff3434');
      else if (e.attackStep % 6 === 2) crossWall(e, tools, '#ff3434');
      else if (e.attackStep % 6 === 3) startBossDive(e, tools, 5.5);
      else if (e.attackStep % 6 === 4) wideRain(e, tools, 8, '#ff3434');
      else if (e.attackStep % 6 === 5) bossBarrier(e, tools, 120);
      else summonZako(tools, 3);
      return;
    }

    fanShot(e, tools, strong ? 4 : 3, 1, 3.1, 11, '#ff4aff');
  }

  function runHalfHpSpecial(e, tools){
    const name = e.name || '';

    if (name.includes('リリス') || name.includes('ウルモブ')) {
      tools.addText('分身！', e.x, e.y - 92, '#ff4aa4');
      summonZako(tools, name.includes('ウルモブ') ? 4 : 3);
      return;
    }

    if (name.includes('魔王')) {
      tools.addText('闇の召喚！', e.x, e.y - 92, '#b78cff');
      summonZako(tools, 4);
      return;
    }

    if (name.includes('メイル')) {
      tools.addText('監獄召喚！', e.x, e.y - 92, '#cfd7ff');
      summonZako(tools, 4);
      return;
    }

    summonZako(tools, 3);
  }

  function midBossNormalShot(e, tools){
    const name = e.name || '';

    if (name === 'グラディモブ') {
      fanShot(e, tools, 2, 1, 3.2, 8, '#d8d8ff');
      return;
    }

    if (name === 'モブギドラ') {
      fanShot(e, tools, 3, 1, 3.2, 8, '#b78cff');
      return;
    }

    aimShot(e, tools, 3.2, 8, '#ff4aff');
  }

  function bossNormalShot(e, tools){
    const name = e.name || '';

    if (name.includes('ホーク')) {
      fanShot(e, tools, e.strong ? 4 : 3, 1, 3.0, 10, '#ffe66b');
      return;
    }

    if (name.includes('ミラ')) {
      variedSpeedFan(e, tools, 3, '#d6a4ff');
      return;
    }

    if (name.includes('番人') || name.includes('ガーディアン')) {
      fanShot(e, tools, 3, 1, 3.0, 11, '#ff9c2a');
      return;
    }

    if (name.includes('ネオン')) {
      randomFan(e, tools, 4, 3.1, 11, '#60d9ff');
      return;
    }

    if (name.includes('ドラゴン')) {
      randomFan(e, tools, e.strong ? 4 : 3, 3.1, 14, '#ff533d');
      return;
    }

    if (name.includes('魔王')) {
      randomFan(e, tools, 4, 3.2, 13, '#b78cff');
      return;
    }

    if (name.includes('リリス') || name.includes('ウルモブ')) {
      randomFan(e, tools, name.includes('ウルモブ') ? 5 : 4, 3.2, 11, '#ff4aa4');
      return;
    }

    if (name.includes('スミス') || name.includes('ネプ')) {
      aimShot(e, tools, 3.8, 10, '#8cfffb');
      return;
    }

    if (name.includes('閻魔')) {
      fanShot(e, tools, 3, 1, 3.3, 13, '#ff3434');
      return;
    }

    fanShot(e, tools, 3, 1, 3.0, 10, '#ff4aff');
  }

  function aimShot(e, tools, speed, r, color){
    const state = tools.state;
    const dx = state.player.x - e.x;
    const dy = state.player.y - e.y;
    const base = Math.atan2(dy, dx);

    addEnemyBullet(tools, {
      x: e.x,
      y: e.y + 48,
      angle: base,
      speed,
      r,
      dmg: Math.ceil(r * 1.0),
      color,
      hp: 0
    });
  }

  function fanShot(e, tools, count, rows, speed, r, color){
    const state = tools.state;
    const dx = state.player.x - e.x;
    const dy = state.player.y - e.y;
    const base = Math.atan2(dy, dx);
    const spread = count >= 4 ? 0.24 : 0.31;

    for (let row = 0; row < rows; row++) {
      for (let i = 0; i < count; i++) {
        const angle = base + (i - (count - 1) / 2) * spread;

        addEnemyBullet(tools, {
          x: e.x,
          y: e.y + 58 + row * 12,
          angle,
          speed: speed + row * 0.18,
          r,
          dmg: Math.ceil(r * 1.0),
          color,
          hp: 0
        });
      }
    }
  }

  function variedSpeedFan(e, tools, count, color){
    const state = tools.state;
    const base = Math.atan2(state.player.y - e.y, state.player.x - e.x);

    for (let i = 0; i < count; i++) {
      addEnemyBullet(tools, {
        x: e.x,
        y: e.y + 60,
        angle: base + (i - (count - 1) / 2) * 0.25,
        speed: 2.5 + i * 0.25,
        r: 12,
        dmg: 12,
        color,
        hp: 0
      });
    }
  }

  function randomFan(e, tools, count, speed, r, color){
    const state = tools.state;
    const rand = tools.rand;
    const base = Math.atan2(state.player.y - e.y, state.player.x - e.x);

    for (let i = 0; i < count; i++) {
      addEnemyBullet(tools, {
        x: e.x + rand(-26, 26),
        y: e.y + 58,
        angle: base + rand(-0.52, 0.52),
        speed: speed + rand(-0.25, 0.35),
        r,
        dmg: Math.ceil(r * 1.0),
        color,
        hp: 0
      });
    }
  }

  function randomBurst(e, tools, count, speed, r, color){
    const rand = tools.rand;

    for (let i = 0; i < count; i++) {
      addEnemyBullet(tools, {
        x: e.x + rand(-30, 30),
        y: e.y + 54,
        angle: Math.PI * 0.5 + rand(-0.48, 0.48),
        speed: speed + rand(-0.25, 0.25),
        r,
        dmg: Math.ceil(r * 1.0),
        color,
        hp: 0
      });
    }
  }

  function burstAim(e, tools, count, speed, r, color){
    const state = tools.state;
    const rand = tools.rand;
    const base = Math.atan2(state.player.y - e.y, state.player.x - e.x);

    for (let i = 0; i < count; i++) {
      addEnemyBullet(tools, {
        x: e.x + rand(-22, 22),
        y: e.y + 62,
        angle: base + (i - (count - 1) / 2) * 0.075,
        speed,
        r,
        dmg: Math.ceil(r * 1.0),
        color,
        hp: 0
      });
    }
  }

  function chargeBigShots(e, tools, count, speed, r, color){
    tools.addText('チャージ！', e.x, e.y - 92, color);

    for (let i = 0; i < count; i++) {
      setTimeout(function(){
        if (!e.dead) {
          const state = tools.state;
          const base = Math.atan2(state.player.y - e.y, state.player.x - e.x);

          addEnemyBullet(tools, {
            x: e.x,
            y: e.y + 66,
            angle: base,
            speed,
            r,
            dmg: Math.ceil(r * 1.2),
            color,
            hp: Math.max(8, Math.ceil(r * 0.8)),
            breakable: true
          });
        }
      }, i * 220);
    }
  }

  function sideMoveBarrage(e, tools, count, color){
    e.evadeTimer = 90;
    burstAim(e, tools, count, 3.8, 9, color);
  }

  function closeBarrage(e, tools, count, color){
    const state = tools.state;

    e.y = Math.min(e.y + 22, tools.H * 0.29);

    for (let i = 0; i < count; i++) {
      const base = Math.atan2(state.player.y - e.y, state.player.x - e.x);

      addEnemyBullet(tools, {
        x: e.x,
        y: e.y + 60,
        angle: base + (i - count / 2) * 0.06,
        speed: 3.8,
        r: 9,
        dmg: 10,
        color,
        hp: 0
      });
    }
  }

  function jumpBarrage(e, tools, count, color){
    const rand = tools.rand;

    e.x = rand(tools.W * 0.22, tools.W * 0.78);
    e.y = rand(tools.H * 0.13, tools.H * 0.24);
    burstAim(e, tools, count, 3.7, 12, color);
  }

  function wideRain(e, tools, count, color){
    const W = tools.W;

    tools.addText('広範囲！', e.x, e.y - 92, color);

    for (let i = 0; i < count; i++) {
      const x = W * 0.16 + (W * 0.68) * (i / Math.max(1, count - 1));

      addEnemyBullet(tools, {
        x,
        y: e.y + 48,
        angle: Math.PI * 0.5 + (i - count / 2) * 0.018,
        speed: 3.0,
        r: 10,
        dmg: 10,
        color,
        hp: 0
      });
    }
  }

  function teleportBarrage(e, tools, count, color){
    e.teleportTimer = 120;
    randomBurst(e, tools, count, 3.6, 11, color);
  }

  function randomTeleportBarrage(e, tools, count, color){
    e.x = tools.rand(tools.W * 0.22, tools.W * 0.78);
    e.y = tools.rand(tools.H * 0.13, tools.H * 0.25);
    randomBurst(e, tools, count, 3.6, 11, color);
  }

  function ghostMove(e, tools, timer){
    e.ghostTimer = timer;
    tools.addText('透明化！', e.x, e.y - 92, '#d6a4ff');
    chargeBigShots(e, tools, e.strong ? 3 : 2, 2.6, 18, '#d6a4ff');
  }

  function evadeMode(e, tools, timer){
    e.evadeTimer = timer;
    tools.addText('高速回避！', e.x, e.y - 92, '#8cfffb');
    burstAim(e, tools, 3, 3.8, 9, '#8cfffb');
  }

  function bossBarrier(e, tools, timer){
    e.barrierTimer = timer;
    e.barrierHp = Math.max(e.barrierHp || 0, Math.ceil(e.maxHp * 0.045));
    tools.addText('バリア！', e.x, e.y - 92, '#b78cff');
  }

  function healBoss(e, tools, rate){
    const heal = Math.ceil(e.maxHp * rate);
    e.hp = Math.min(e.maxHp, e.hp + heal);
    tools.addText(`回復 +${heal}`, e.x, e.y - 92, '#9dff73');
  }

  function homingBullet(e, tools, count, color){
    const state = tools.state;

    tools.addText('追跡弾！', e.x, e.y - 72, color);

    for (let i = 0; i < count; i++) {
      const angle = Math.PI * 0.5 + (i - (count - 1) / 2) * 0.16;

      state.entities.push({
        kind: 'enemyBullet',
        x: e.x + (i - (count - 1) / 2) * 22,
        y: e.y + 58,
        vx: Math.cos(angle) * 2.4,
        vy: Math.sin(angle) * 2.4,
        r: 13,
        dmg: 12,
        hp: 10,
        maxHp: 10,
        breakable: true,
        homing: true,
        homingPower: 0.025,
        homingSpeed: 2.9,
        dead: false,
        bob: 0,
        color
      });
    }
  }

  function crossWall(e, tools, color){
    const state = tools.state;
    const W = tools.W;

    tools.addText('十字弾！', e.x, e.y - 92, color);

    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        if (row !== 2 && col !== 2) continue;

        state.entities.push({
          kind: 'enemyBullet',
          x: W * 0.28 + col * (W * 0.11),
          y: e.y + 40 + row * 24,
          vx: 0,
          vy: 2.8,
          r: 9,
          dmg: 10,
          dead: false,
          bob: 0,
          color
        });
      }
    }
  }

  function startDive(e, tools, speed, label){
    const state = tools.state;
    const dx = state.player.x - e.x;
    const dy = state.player.y - e.y;
    const len = Math.max(1, Math.sqrt(dx * dx + dy * dy));

    e.diveMode = true;
    e.diveVx = dx / len * speed;
    e.diveVy = dy / len * speed;

    tools.addText(label || '突進！', e.x, e.y - 54, '#ffcf5b');
  }

  function startBossDive(e, tools, speed){
    startDive(e, tools, speed, '突進！');
    e.diveReturn = false;
  }

  function summonZako(tools, count){
    const state = tools.state;
    const D = tools.D;
    const W = tools.W;
    const rand = tools.rand;
    const pick = tools.pick;

    if (!D.enemies || !D.enemies.zako || !D.enemies.zako.length) return;

    tools.addText('召喚！', W / 2, tools.H * 0.18, '#ffe66b');

    for (let i = 0; i < count; i++) {
      const def = pick(D.enemies.zako);

      state.entities.push({
        kind: 'enemy',
        name: def.name,
        image: def.image,
        x: W * (0.2 + 0.6 * ((i % 2) ? 0.75 : 0.25)) + rand(-18, 18),
        y: -100 - Math.floor(i / 2) * 48,
        vx: rand(-0.7, 0.7),
        vy: 2.0,
        r: 30,
        hp: Math.max(3, Math.ceil(Number(def.hp || 5) * 0.6)),
        maxHp: Math.max(3, Math.ceil(Number(def.hp || 5) * 0.6)),
        score: Math.ceil(Number(def.score || 10) * 0.5),
        coinMin: Math.max(1, Math.ceil(Number(def.coinMin || 1) * 0.5)),
        coinMax: Math.max(1, Math.ceil(Number(def.coinMax || 2) * 0.5)),
        summoned: true,
        dead: false,
        bob: rand(0, Math.PI * 2)
      });
    }
  }

  function addEnemyBullet(tools, opt){
    const state = tools.state;

    state.entities.push({
      kind: 'enemyBullet',
      x: opt.x,
      y: opt.y,
      vx: Math.cos(opt.angle) * opt.speed,
      vy: Math.sin(opt.angle) * opt.speed,
      r: opt.r,
      dmg: opt.dmg,
      hp: opt.hp || 0,
      maxHp: opt.hp || 0,
      breakable: !!opt.breakable || Number(opt.hp || 0) > 0,
      dead: false,
      bob: 0,
      color: opt.color || '#ff4aff'
    });
  }

  window.MobShotBoss = {
    updateMidBoss,
    updateBoss
  };
})();
