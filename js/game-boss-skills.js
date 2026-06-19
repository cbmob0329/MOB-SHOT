'use strict';

(function(){
  function bullets(){
    return window.MobShotBossBullets;
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

  function addText(tools, text, x, y, color){
    if (tools.addText) {
      tools.addText(text, x, y, color);
    }
  }

  function burst(tools, x, y, color, n){
    if (tools.burst) {
      tools.burst(x, y, color, n);
    }
  }

  function b(){
    return bullets();
  }

  function safeCall(fn){
    try {
      if (typeof fn === 'function') fn();
    } catch(e) {
      console.error('boss skill safeCall error:', e);
    }
  }

  function makeBarrier(e, tools, sec, hp){
    e.barrierTimer = Math.max(e.barrierTimer || 0, sec * 60);
    e.barrierHp = Math.max(e.barrierHp || 0, hp);

    addText(tools, 'バリア！', e.x, e.y - 92, '#9deeff');
    burst(tools, e.x, e.y, '#9deeff', 28);
  }

  function healBoss(e, tools, rate){
    const amount = Math.ceil(e.maxHp * rate);

    e.hp = Math.min(e.maxHp, e.hp + amount);

    addText(tools, '回復！', e.x, e.y - 92, '#9dff73');
    burst(tools, e.x, e.y, '#9dff73', 28);
  }

  function summonStageEnemies(e, tools, count, hpRate){
    const list = getAreaZakoList(tools);

    if (!list.length) return;

    for (let i = 0; i < count; i++) {
      const def = list[(Number(e.summonCount || 0) + i) % list.length];
      const hp = Math.ceil(Number(def.hp || 5) * hpRate);

      tools.state.entities.push({
        kind: 'enemy',
        name: def.name,
        image: def.image,
        x: tools.rand(tools.W * 0.22, tools.W * 0.78),
        y: -80 - i * 64,
        vx: tools.rand(-0.35, 0.35),
        vy: 1.18,
        r: def.name === 'モブロック' ? 34 : 31,
        hp,
        maxHp: hp,
        score: Number(def.score || 10),
        coinMin: Number(def.coinMin || 1),
        coinMax: Number(def.coinMax || 3),
        dead: false,
        bob: tools.rand(0, Math.PI * 2)
      });
    }

    e.summonCount = Number(e.summonCount || 0) + count;
  }

  function makeClones(e, tools, count){
    if (e.cloneUsed) {
      if (b() && b().fireSlowSpread) {
        b().fireSlowSpread(e, tools, 3, 0.24, {
          hp: 8,
          safeCenter: true,
          color: '#ff8cff'
        });
      }
      return;
    }

    e.cloneUsed = true;

    addText(tools, '分身！', e.x, e.y - 92, '#b78cff');

    for (let i = 0; i < count; i++) {
      const offset = (i - (count - 1) / 2) * 76;

      tools.state.entities.push({
        kind: 'enemy',
        name: 'リリス分身',
        image: e.image,
        x: tools.clamp(e.x + offset, tools.W * 0.18, tools.W * 0.82),
        y: e.y + 34,
        vx: tools.rand(-0.28, 0.28),
        vy: 0.72,
        r: 32,
        hp: Math.ceil(e.maxHp * 0.022),
        maxHp: Math.ceil(e.maxHp * 0.022),
        score: 80,
        coinMin: 3,
        coinMax: 6,
        canShoot: true,
        baseShootCd: 220,
        shootCd: 150 + i * 30,
        burstShot: false,
        bulletLarge: false,
        bulletColor: '#ff8cff',
        aiType: i === 1 ? 'sway' : 'fastSide',
        dead: false,
        bob: tools.rand(0, Math.PI * 2)
      });
    }
  }

  function summonLilithSisters(e, tools){
    if (e.sistersUsed) return;

    e.sistersUsed = true;

    const sisters = [
      { name:'リリスレッド', image:'atk/red.png', hp:30, speed:1.25, cd:220, color:'#ff5b5b', aiType:'sway' },
      { name:'リリスブルー', image:'atk/blue.png', hp:36, speed:1.05, cd:240, color:'#6be6ff', aiType:'wideHop' },
      { name:'リリスイエロー', image:'atk/yellow.png', hp:28, speed:1.35, cd:225, color:'#ffe66b', aiType:'fastSide' },
      { name:'リリスホワイト', image:'atk/white.png', hp:26, speed:1.12, cd:250, color:'#ffffff', aiType:'teleport' }
    ];

    sisters.forEach((s, i) => {
      tools.state.entities.push({
        kind: 'enemy',
        name: s.name,
        image: s.image,
        x: tools.W * (0.23 + i * 0.18),
        y: -90 - i * 36,
        vx: tools.rand(-0.3, 0.3),
        vy: s.speed,
        r: 29,
        hp: s.hp,
        maxHp: s.hp,
        score: 120,
        coinMin: 5,
        coinMax: 10,
        canShoot: true,
        baseShootCd: s.cd,
        shootCd: s.cd + i * 25,
        burstShot: false,
        bulletLarge: false,
        bulletColor: s.color,
        aiType: s.aiType,
        dead: false,
        bob: tools.rand(0, Math.PI * 2)
      });
    });

    addText(tools, 'リリス四姉妹！', e.x, e.y - 108, '#ff8cff');
  }

  function runHawk(e, tools, step){
    if (!b()) return;

    if (step % 4 === 1) {
      addText(tools, '羽ばたき弾！', e.x, e.y - 92, '#ffe66b');

      b().fireSafeFanDown(e, tools, 5, {
        speed: 1.75,
        hp: 6,
        spread: 0.18,
        color: '#ffe66b'
      });
      return;
    }

    if (step % 4 === 2) {
      addText(tools, '急降下！', e.x, e.y - 92, '#ffcf5b');
      startDive(e, tools, 3.35);
      return;
    }

    if (step % 4 === 3) {
      b().chargeLine(e, tools, 'ホークライン！', 4, {
        delay: 54,
        sizeType: 'normal',
        speed: 1.8,
        hp: 8,
        safeCenter: true,
        color: '#ffe66b'
      });
      return;
    }

    b().fireSlowSpread(e, tools, 3, 0.22, {
      hp: 7,
      color: '#ffe66b'
    });
  }

  function runMira(e, tools, step){
    if (!b()) return;

    if (step % 5 === 1) {
      addText(tools, 'ミラージュ！', e.x, e.y - 92, '#b78cff');

      e.ghostTimer = 120;

      b().chargeHoming(e, tools, 'ゆっくり追尾！', 2, {
        sizeType: 'normal',
        speed: 1.35,
        hp: 8,
        homingPower: 0.0032,
        gap: 32,
        color: '#b78cff',
        textColor: '#b78cff'
      });
      return;
    }

    if (step % 5 === 2) {
      b().fireCross(e, tools, {
        sizeType: 'normal',
        speed: 1.8,
        hp: 6,
        color: '#b78cff'
      });
      return;
    }

    if (step % 5 === 3) {
      b().chargeAimed(e, tools, '幻影弾！', 2, {
        sizeType: 'big',
        speed: 1.55,
        hp: 14,
        gap: 34,
        color: '#b78cff'
      });
      return;
    }

    b().fireSlowSpread(e, tools, 3, 0.18, {
      hp: 7,
      color: '#b78cff'
    });
  }

  function runGuardian(e, tools, step){
    if (!b()) return;

    if (step % 4 === 1) {
      makeBarrier(e, tools, 4, Math.ceil(e.maxHp * 0.035));
      e.vx *= 0.4;
      return;
    }

    if (step % 4 === 2) {
      b().chargeAimed(e, tools, '盾弾！', 2, {
        sizeType: 'huge',
        speed: 1.28,
        hp: Math.ceil(e.maxHp * 0.022),
        gap: 40,
        color: '#ff7a35'
      });
      return;
    }

    if (step % 4 === 3) {
      b().chargeLine(e, tools, '守護ライン！', 3, {
        delay: 58,
        sizeType: 'big',
        speed: 1.55,
        hp: 16,
        safeCenter: true,
        color: '#ff7a35'
      });
      return;
    }

    b().fireSlowSpread(e, tools, 2, 0.26, {
      sizeType: 'big',
      speed: 1.55,
      hp: 12,
      color: '#ff7a35'
    });
  }

  function runNeon(e, tools, step){
    if (!b()) return;

    if (step % 5 === 1) {
      addText(tools, 'ワープ！', e.x, e.y - 92, '#6be6ff');

      e.x = tools.clamp(
        e.x + tools.rand(-120, 120),
        tools.W * 0.2,
        tools.W * 0.8
      );

      b().fireSlowSpread(e, tools, 3, 0.20, {
        hp: 6,
        color: '#6be6ff'
      });
      return;
    }

    if (step % 5 === 2) {
      b().chargeLine(e, tools, 'ネオンライン！', 4, {
        delay: 56,
        sizeType: 'normal',
        speed: 1.9,
        hp: 8,
        safeCenter: true,
        color: '#6be6ff'
      });
      return;
    }

    if (step % 5 === 3) {
      b().fireWave(e, tools, 5, {
        sizeType: 'normal',
        speed: 1.75,
        hp: 7,
        waveAmp: 20,
        waveSpeed: 0.04,
        color: '#6be6ff'
      });
      return;
    }

    b().fireSlowSpread(e, tools, 3, 0.18, {
      speed: 1.85,
      hp: 6,
      color: '#6be6ff'
    });
  }

  function runDragon(e, tools, step){
    if (!b()) return;

    if (step % 6 === 1) {
      b().chargeBigFireball(e, tools, 'ビッグ火の玉！', {
        delay: 78,
        hp: Math.ceil(e.maxHp * 0.025),
        speed: 0.92,
        waveAmp: 42,
        color: '#ff5b35'
      });
      return;
    }

    if (step % 6 === 2) {
      addText(tools, 'ブレス！', e.x, e.y - 92, '#ff7a35');

      b().fireSafeFanDown(e, tools, 5, {
        sizeType: 'big',
        speed: 1.65,
        hp: 12,
        spread: 0.15,
        color: '#ff5b35'
      });
      return;
    }

    if (step % 6 === 3) {
      b().chargeAimed(e, tools, '火球！', 2, {
        sizeType: 'big',
        speed: 1.55,
        hp: 14,
        gap: 34,
        color: '#ff5b35'
      });
      return;
    }

    b().fireSlowSpread(e, tools, 3, 0.20, {
      sizeType: 'big',
      speed: 1.65,
      hp: 10,
      color: '#ff5b35'
    });
  }

  function runLilith(e, tools, step){
    if (!b()) return;

    if (step % 8 === 1) {
      makeBarrier(e, tools, 3, Math.ceil(e.maxHp * 0.025));
      return;
    }

    if (step % 8 === 2) {
      makeClones(e, tools, 3);
      return;
    }

    if (step % 8 === 3) {
      b().chargeHoming(e, tools, '薔薇追尾！', 2, {
        sizeType: 'normal',
        speed: 1.45,
        hp: 8,
        homingPower: 0.0035,
        gap: 32,
        color: '#ff8cff'
      });
      return;
    }

    if (step % 8 === 4) {
      b().fireSafeFanDown(e, tools, 5, {
        sizeType: 'normal',
        speed: 1.8,
        hp: 6,
        spread: 0.16,
        color: '#ff8cff'
      });
      return;
    }

    if (step % 8 === 5) {
      addText(tools, '雷撃！', e.x, e.y - 92, '#6be6ff');
      b().chargeLine(e, tools, '', 4, {
        delay: 54,
        sizeType: 'normal',
        speed: 1.85,
        hp: 8,
        safeCenter: true,
        color: '#6be6ff'
      });
      return;
    }

    if (step % 8 === 6) {
      summonStageEnemies(e, tools, 1, 0.65);
      addText(tools, '召喚！', e.x, e.y - 92, '#b78cff');
      return;
    }

    if (step % 8 === 7 && !e.extraHealUsed && e.hp <= e.maxHp * 0.42) {
      e.extraHealUsed = true;
      healBoss(e, tools, 0.06);
      return;
    }

    b().fireSlowSpread(e, tools, 3, 0.20, {
      hp: 7,
      color: '#ff8cff'
    });
  }

  function runMaoh(e, tools, step){
    if (!b()) return;

    if (step % 7 === 1) {
      makeBarrier(e, tools, 4, Math.ceil(e.maxHp * 0.035));
      return;
    }

    if (step % 7 === 2) {
      b().chargeBigFireball(e, tools, '魔王ビッグ火球！', {
        delay: 82,
        hp: Math.ceil(e.maxHp * 0.027),
        speed: 0.9,
        waveAmp: 46,
        color: '#ff4aff'
      });
      return;
    }

    if (step % 7 === 3) {
      summonStageEnemies(e, tools, 1, 0.75);
      addText(tools, '魔王召喚！', e.x, e.y - 92, '#b78cff');
      return;
    }

    if (step % 7 === 4) {
      b().fireSafeFanDown(e, tools, 5, {
        sizeType: 'big',
        speed: 1.6,
        hp: 12,
        spread: 0.16,
        color: '#ff4aff'
      });
      return;
    }

    if (step % 7 === 5) {
      startDive(e, tools, 3.15);
      addText(tools, '魔王突進！', e.x, e.y - 92, '#ffcf5b');
      return;
    }

    if (step % 7 === 6) {
      b().chargeHoming(e, tools, '魔弾追尾！', 2, {
        sizeType: 'normal',
        speed: 1.45,
        hp: 9,
        homingPower: 0.0035,
        color: '#ff4aff'
      });
      return;
    }

    b().fireSlowSpread(e, tools, 3, 0.20, {
      hp: 8,
      safeCenter: true,
      color: '#ff4aff'
    });
  }

  function runMail(e, tools, step){
    if (!b()) return;

    if (step % 5 === 1) {
      b().chargeAimed(e, tools, '鉄球！', 2, {
        sizeType: 'huge',
        speed: 1.25,
        hp: Math.ceil(e.maxHp * 0.020),
        gap: 42,
        color: '#bfc7d5'
      });
      return;
    }

    if (step % 5 === 2) {
      makeBarrier(e, tools, 4, Math.ceil(e.maxHp * 0.032));
      return;
    }

    if (step % 5 === 3) {
      b().chargeLine(e, tools, '鉄壁ライン！', 3, {
        delay: 58,
        sizeType: 'big',
        speed: 1.55,
        hp: 16,
        safeCenter: true,
        color: '#bfc7d5'
      });
      return;
    }

    if (step % 5 === 4 && !e.extraHealUsed && e.hp <= e.maxHp * 0.5) {
      e.extraHealUsed = true;
      healBoss(e, tools, 0.05);
      return;
    }

    b().fireSlowSpread(e, tools, 2, 0.24, {
      sizeType: 'big',
      speed: 1.55,
      hp: 12,
      color: '#bfc7d5'
    });
  }

  function runSmith(e, tools, step){
    if (!b()) return;

    if (step % 5 === 1) {
      b().chargeHoming(e, tools, '弱追尾！', 2, {
        sizeType: 'normal',
        speed: 1.45,
        hp: 8,
        homingPower: 0.0036,
        color: '#7bffea'
      });
      return;
    }

    if (step % 5 === 2) {
      e.x = tools.clamp(
        e.x + tools.rand(-130, 130),
        tools.W * 0.2,
        tools.W * 0.8
      );

      addText(tools, 'マトリックス！', e.x, e.y - 92, '#7bffea');

      b().fireLineDown(e, tools, 4, {
        sizeType: 'normal',
        speed: 1.8,
        hp: 6,
        safeCenter: true,
        color: '#7bffea'
      });
      return;
    }

    if (step % 5 === 3) {
      b().chargeAimed(e, tools, 'コード弾！', 2, {
        sizeType: 'big',
        speed: 1.5,
        hp: 12,
        gap: 34,
        color: '#7bffea'
      });
      return;
    }

    b().fireSlowSpread(e, tools, 3, 0.18, {
      hp: 7,
      color: '#7bffea'
    });
  }

  function runNep(e, tools, step){
    if (!b()) return;

    if (step % 5 === 1) {
      addText(tools, '大波！', e.x, e.y - 92, '#6be6ff');

      b().fireWave(e, tools, 5, {
        sizeType: 'big',
        speed: 1.6,
        hp: 12,
        waveAmp: 28,
        color: '#6be6ff'
      });
      return;
    }

    if (step % 5 === 2) {
      b().chargeAimed(e, tools, '水流弾！', 2, {
        sizeType: 'big',
        speed: 1.45,
        hp: 14,
        gap: 36,
        color: '#6be6ff'
      });
      return;
    }

    if (step % 5 === 3) {
      b().fireSafeFanDown(e, tools, 5, {
        sizeType: 'normal',
        speed: 1.7,
        hp: 7,
        spread: 0.17,
        color: '#6be6ff'
      });
      return;
    }

    b().fireSlowSpread(e, tools, 3, 0.22, {
      hp: 7,
      color: '#6be6ff'
    });
  }

  function runBlueNeo(e, tools, step){
    if (!b()) return;

    if (step % 5 === 1) {
      addText(tools, 'ネオンライン！', e.x, e.y - 92, '#4bb8ff');

      b().chargeLine(e, tools, '', 4, {
        delay: 58,
        sizeType: 'big',
        speed: 1.8,
        hp: 12,
        safeCenter: true,
        color: '#4bb8ff'
      });
      return;
    }

    if (step % 5 === 2) {
      e.x = tools.clamp(
        e.x + tools.rand(-140, 140),
        tools.W * 0.2,
        tools.W * 0.8
      );
      b().fireSlowSpread(e, tools, 3, 0.20, {
        hp: 7,
        color: '#4bb8ff'
      });
      return;
    }

    b().fireSlowSpread(e, tools, 3, 0.20, {
      speed: 1.85,
      hp: 7,
      color: '#4bb8ff'
    });
  }

  function runPurpleNeo(e, tools, step){
    if (!b()) return;

    if (step % 5 === 1) {
      b().chargeHoming(e, tools, 'パルス追尾！', 2, {
        sizeType: 'big',
        speed: 1.35,
        hp: 12,
        homingPower: 0.0032,
        color: '#b78cff'
      });
      return;
    }

    if (step % 5 === 2) {
      b().fireLineDown(e, tools, 5, {
        sizeType: 'normal',
        speed: 1.75,
        hp: 6,
        safeCenter: true,
        color: '#b78cff'
      });
      return;
    }

    if (step % 5 === 3) {
      b().chargeBigFireball(e, tools, 'パルス火球！', {
        delay: 80,
        hp: Math.ceil(e.maxHp * 0.022),
        speed: 0.92,
        waveAmp: 38,
        color: '#b78cff'
      });
      return;
    }

    b().fireSlowSpread(e, tools, 3, 0.20, {
      hp: 7,
      color: '#b78cff'
    });
  }

  function runEnma(e, tools, step){
    if (!b()) return;

    if (step % 6 === 1) {
      addText(tools, '地獄門！', e.x, e.y - 92, '#ff3b3b');

      b().fireSafeFanDown(e, tools, 6, {
        sizeType: 'big',
        speed: 1.55,
        hp: 13,
        spread: 0.15,
        color: '#ff3b3b'
      });
      return;
    }

    if (step % 6 === 2) {
      b().chargeHoming(e, tools, '魂追尾！', 2, {
        sizeType: 'normal',
        speed: 1.35,
        hp: 9,
        homingPower: 0.003,
        color: '#ff3b3b'
      });
      return;
    }

    if (step % 6 === 3) {
      b().chargeBigFireball(e, tools, '閻魔火球！', {
        delay: 84,
        hp: Math.ceil(e.maxHp * 0.026),
        speed: 0.88,
        waveAmp: 46,
        color: '#ff3b3b'
      });
      return;
    }

    b().fireSlowSpread(e, tools, 3, 0.22, {
      sizeType: 'big',
      speed: 1.55,
      hp: 12,
      color: '#ff3b3b'
    });
  }

  function runUltraLilith(e, tools, step){
    if (!b()) return;

    if (step === 1) {
      summonLilithSisters(e, tools);
      return;
    }

    if (step % 9 === 1) {
      makeBarrier(e, tools, 5, Math.ceil(e.maxHp * 0.035));
      return;
    }

    if (step % 9 === 2) {
      makeClones(e, tools, 3);
      return;
    }

    if (step % 9 === 3) {
      b().chargeBigFireball(e, tools, 'ウルリリ火球！', {
        delay: 84,
        hp: Math.ceil(e.maxHp * 0.024),
        speed: 0.9,
        waveAmp: 44,
        color: '#ff8cff'
      });
      return;
    }

    if (step % 9 === 4) {
      b().fireSafeFanDown(e, tools, 6, {
        sizeType: 'big',
        speed: 1.55,
        hp: 12,
        spread: 0.15,
        color: '#ff8cff'
      });
      return;
    }

    if (step % 9 === 5) {
      addText(tools, '最終雷撃！', e.x, e.y - 92, '#6be6ff');

      b().chargeLine(e, tools, '', 4, {
        delay: 58,
        sizeType: 'big',
        speed: 1.75,
        hp: 12,
        safeCenter: true,
        color: '#6be6ff'
      });
      return;
    }

    if (step % 9 === 6) {
      b().chargeHoming(e, tools, '精霊追尾！', 2, {
        sizeType: 'normal',
        speed: 1.35,
        hp: 8,
        homingPower: 0.003,
        color: '#ff8cff'
      });
      return;
    }

    if (step % 9 === 7) {
      summonStageEnemies(e, tools, 1, 0.72);
      addText(tools, '最終召喚！', e.x, e.y - 92, '#b78cff');
      return;
    }

    if (step % 9 === 8 && !e.extraHealUsed && e.hp <= e.maxHp * 0.45) {
      e.extraHealUsed = true;
      healBoss(e, tools, 0.06);
      return;
    }

    b().fireSlowSpread(e, tools, 3, 0.18, {
      hp: 8,
      safeCenter: true,
      color: '#ff8cff'
    });
  }

  function runByType(e, tools, type, step){
    if (type === 'hawk') return runHawk(e, tools, step);
    if (type === 'mira') return runMira(e, tools, step);
    if (type === 'guardian') return runGuardian(e, tools, step);
    if (type === 'neon') return runNeon(e, tools, step);
    if (type === 'dragon') return runDragon(e, tools, step);
    if (type === 'lilith') return runLilith(e, tools, step);
    if (type === 'maoh') return runMaoh(e, tools, step);
    if (type === 'mail') return runMail(e, tools, step);
    if (type === 'smith') return runSmith(e, tools, step);
    if (type === 'nep') return runNep(e, tools, step);
    if (type === 'blueNeo') return runBlueNeo(e, tools, step);
    if (type === 'purpleNeo') return runPurpleNeo(e, tools, step);
    if (type === 'enma') return runEnma(e, tools, step);
    if (type === 'ultraLilith') return runUltraLilith(e, tools, step);

    if (b() && b().fireSlowSpread) {
      b().fireSlowSpread(e, tools, 3, 0.20, {
        hp: 7
      });
    }
  }

  function runMidByType(e, tools, type, step){
    if (!b()) return;

    if (type === 'ptera') {
      if (step % 4 === 1) {
        startDive(e, tools, 3.25);
        addText(tools, '突進！', e.x, e.y - 60, '#ffcf5b');
        return;
      }

      b().fireSlowSpread(e, tools, 3, 0.22, {
        sizeType: 'small',
        speed: 1.8,
        hp: 5
      });
      return;
    }

    if (type === 'dual') {
      b().fireSlowSpread(e, tools, 2, 0.30, {
        sizeType: 'small',
        speed: 1.85,
        hp: 5
      });
      return;
    }

    if (type === 'rapid') {
      b().chargeAimed(e, tools, '連射！', 2, {
        sizeType: 'small',
        speed: 1.85,
        hp: 5,
        gap: 24,
        textColor: '#ffe66b'
      });
      return;
    }

    if (type === 'thunder' || type === 'neon') {
      b().chargeLine(e, tools, '雷！', 3, {
        delay: 48,
        sizeType: 'normal',
        speed: 1.8,
        hp: 8,
        safeCenter: true,
        color: '#6be6ff'
      });
      return;
    }

    if (type === 'magma') {
      b().chargeAimed(e, tools, 'マグマ弾！', 2, {
        sizeType: 'big',
        speed: 1.45,
        hp: 12,
        gap: 34,
        color: '#ff7a35'
      });
      return;
    }

    if (type === 'blade' || type === 'dash') {
      if (step % 3 === 1) {
        startDive(e, tools, 3.35);
        addText(tools, '斬り込み！', e.x, e.y - 60, '#ffcf5b');
        return;
      }

      b().fireSlowSpread(e, tools, 3, 0.22, {
        sizeType: 'small',
        speed: 1.9,
        hp: 5
      });
      return;
    }

    if (type === 'heavy') {
      b().chargeAimed(e, tools, '重弾！', 2, {
        sizeType: 'big',
        speed: 1.35,
        hp: 12,
        gap: 36
      });
      return;
    }

    if (type === 'lilith') {
      runLilith(e, tools, step);
      return;
    }

    b().fireSlowSpread(e, tools, 2, 0.22, {
      sizeType: 'small',
      speed: 1.8,
      hp: 5
    });
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
    e.x += e.diveVx || 0;
    e.y += e.diveVy || 0;

    if (e.y > tools.H + 90) {
      e.diveMode = false;
      e.diveReturn = true;
      e.x = tools.clamp(e.x, tools.W * 0.2, tools.W * 0.8);
      e.y = -120;
      e.targetY = e.baseY || tools.H * 0.25;
      e.vx = tools.rand(0.8, 1.25) * (Math.random() < 0.5 ? -1 : 1);
    }
  }

  window.MobShotBossSkills = {
    runByType,
    runMidByType,
    makeBarrier,
    healBoss,
    summonStageEnemies,
    makeClones,
    summonLilithSisters,
    startDive,
    updateDive
  };
})();
