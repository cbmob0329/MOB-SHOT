'use strict';

(function(){
  function bullets(){
    return window.MobShotBossBullets;
  }

  function data(){
    return window.MobShotBossData;
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

  function makeBarrier(e, tools, sec, hp){
    e.barrierTimer = Math.max(e.barrierTimer || 0, sec * 60);
    e.barrierHp = Math.max(e.barrierHp || 0, hp);

    addText(tools, 'バリア！', e.x, e.y - 92, '#9deeff');
    burst(tools, e.x, e.y, '#9deeff', 34);
  }

  function healBoss(e, tools, rate){
    const amount = Math.ceil(e.maxHp * rate);

    e.hp = Math.min(e.maxHp, e.hp + amount);

    addText(tools, '回復！', e.x, e.y - 92, '#9dff73');
    burst(tools, e.x, e.y, '#9dff73', 34);
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
        y: -70 - i * 56,
        vx: tools.rand(-0.55, 0.55),
        vy: 1.55,
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
      bullets().fireSpread(e, tools, 3, 0.28, {
        sizeType: 'normal',
        speed: 2.45,
        hp: 0,
        safeCenter: true
      });
      return;
    }

    e.cloneUsed = true;

    addText(tools, '分身！', e.x, e.y - 92, '#b78cff');

    for (let i = 0; i < count; i++) {
      const offset = (i - (count - 1) / 2) * 78;

      tools.state.entities.push({
        kind: 'enemy',
        name: 'リリス分身',
        image: e.image,
        x: tools.clamp(e.x + offset, tools.W * 0.18, tools.W * 0.82),
        y: e.y + 32,
        vx: tools.rand(-0.45, 0.45),
        vy: 0.82,
        r: 34,
        hp: Math.ceil(e.maxHp * 0.028),
        maxHp: Math.ceil(e.maxHp * 0.028),
        score: 80,
        coinMin: 3,
        coinMax: 6,
        canShoot: true,
        baseShootCd: 190,
        shootCd: 120 + i * 25,
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
      {
        name: 'リリスレッド',
        image: 'atk/red.png',
        hp: 34,
        speed: 1.85,
        cd: 170,
        color: '#ff5b5b',
        aiType: 'sway'
      },
      {
        name: 'リリスブルー',
        image: 'atk/blue.png',
        hp: 42,
        speed: 1.55,
        cd: 190,
        color: '#6be6ff',
        aiType: 'wideHop'
      },
      {
        name: 'リリスイエロー',
        image: 'atk/yellow.png',
        hp: 30,
        speed: 2.05,
        cd: 175,
        color: '#ffe66b',
        aiType: 'fastSide'
      },
      {
        name: 'リリスホワイト',
        image: 'atk/white.png',
        hp: 28,
        speed: 1.65,
        cd: 200,
        color: '#ffffff',
        aiType: 'teleport'
      }
    ];

    sisters.forEach((s, i) => {
      tools.state.entities.push({
        kind: 'enemy',
        name: s.name,
        image: s.image,
        x: tools.W * (0.23 + i * 0.18),
        y: -80 - i * 32,
        vx: tools.rand(-0.45, 0.45),
        vy: s.speed,
        r: 30,
        hp: s.hp,
        maxHp: s.hp,
        score: 120,
        coinMin: 5,
        coinMax: 10,
        canShoot: true,
        baseShootCd: s.cd,
        shootCd: s.cd + i * 20,
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
    if (step % 3 === 1) {
      addText(tools, 'ホークショット！', e.x, e.y - 92, '#ffe66b');

      bullets().chargeLine(e, tools, '', 5, {
        delay: 42,
        sizeType: 'normal',
        speed: 2.45,
        hp: 0,
        safeCenter: true
      });

      return;
    }

    if (step % 3 === 2) {
      addText(tools, '急降下！', e.x, e.y - 92, '#ffcf5b');
      startDive(e, tools, 4.6);
      return;
    }

    bullets().fireSpread(e, tools, 3, 0.24, {
      sizeType: 'normal',
      speed: 2.55,
      hp: 0
    });
  }

  function runMira(e, tools, step){
    if (step % 4 === 1) {
      addText(tools, 'ミラージュ！', e.x, e.y - 92, '#b78cff');

      e.ghostTimer = 150;

      bullets().chargeAimed(e, tools, '', 3, {
        sizeType: 'big',
        speed: 2.1,
        hp: 18,
        gap: 26,
        textColor: '#b78cff'
      });

      return;
    }

    if (step % 4 === 2) {
      bullets().fireCross(e, tools, {
        sizeType: 'normal',
        speed: 2.65,
        hp: 0,
        color: '#b78cff'
      });
      return;
    }

    bullets().fireSpread(e, tools, 3, 0.22, {
      sizeType: 'normal',
      speed: 2.75,
      hp: 0
    });
  }

  function runGuardian(e, tools, step){
    if (step % 3 === 1) {
      makeBarrier(e, tools, 4, Math.ceil(e.maxHp * 0.045));
      return;
    }

    if (step % 3 === 2) {
      bullets().chargeAimed(e, tools, '巨大弾！', 2, {
        sizeType: 'huge',
        speed: 1.85,
        hp: Math.ceil(e.maxHp * 0.035),
        gap: 34,
        color: '#ff7a35'
      });

      return;
    }

    bullets().fireSpread(e, tools, 3, 0.26, {
      sizeType: 'big',
      speed: 2.25,
      hp: 16
    });
  }

  function runNeon(e, tools, step){
    if (step % 4 === 1) {
      addText(tools, 'ネオン雷撃！', e.x, e.y - 92, '#6be6ff');

      bullets().chargeLine(e, tools, '', 4, {
        delay: 46,
        sizeType: 'big',
        speed: 2.55,
        hp: 12,
        safeCenter: true,
        color: '#6be6ff'
      });

      return;
    }

    if (step % 4 === 2) {
      e.x = tools.clamp(
        e.x + tools.rand(-120, 120),
        tools.W * 0.2,
        tools.W * 0.8
      );

      addText(tools, 'ワープ！', e.x, e.y - 92, '#6be6ff');
      bullets().fireSpread(e, tools, 3, 0.22, {
        sizeType: 'normal',
        speed: 2.85,
        hp: 0
      });

      return;
    }

    bullets().fireSpread(e, tools, 3, 0.20, {
      sizeType: 'normal',
      speed: 2.75,
      hp: 0
    });
  }

  function runDragon(e, tools, step){
    if (step % 3 === 1) {
      bullets().chargeAimed(e, tools, '火球！', 3, {
        sizeType: 'huge',
        speed: 1.85,
        hp: Math.ceil(e.maxHp * 0.032),
        gap: 30,
        image: 'atk/dragon.png',
        flipY: false,
        color: '#ff5b35'
      });

      return;
    }

    if (step % 3 === 2) {
      addText(tools, 'ブレス！', e.x, e.y - 92, '#ff7a35');

      bullets().fireFanDown(e, tools, 7, {
        sizeType: 'big',
        speed: 2.2,
        hp: 14,
        spread: 0.18,
        safeCenter: true,
        image: 'atk/dragon.png',
        flipY: false
      });

      return;
    }

    bullets().fireSpread(e, tools, 3, 0.22, {
      sizeType: 'big',
      speed: 2.35,
      hp: 12,
      image: 'atk/dragon.png',
      flipY: false
    });
  }

  function runLilith(e, tools, step){
    if (step % 7 === 1) {
      makeBarrier(e, tools, 3, Math.ceil(e.maxHp * 0.035));
      return;
    }

    if (step % 7 === 2) {
      makeClones(e, tools, 3);
      return;
    }

    if (step % 7 === 3) {
      bullets().chargeAimed(e, tools, 'リリス弾！', 3, {
        sizeType: 'big',
        speed: 2.1,
        hp: 18,
        gap: 26,
        color: '#ff8cff'
      });
      return;
    }

    if (step % 7 === 4) {
      bullets().fireFanDown(e, tools, 6, {
        sizeType: 'normal',
        speed: 2.55,
        hp: 0,
        spread: 0.18,
        safeCenter: true,
        color: '#ff8cff'
      });
      return;
    }

    if (step % 7 === 5) {
      addText(tools, '雷撃！', e.x, e.y - 92, '#6be6ff');
      bullets().chargeLine(e, tools, '', 4, {
        delay: 44,
        sizeType: 'big',
        speed: 2.45,
        hp: 14,
        safeCenter: true,
        image: 'atk/kaminari.png',
        flipY: true,
        color: '#6be6ff'
      });
      return;
    }

    if (step % 7 === 6) {
      summonStageEnemies(e, tools, 1, 0.75);
      addText(tools, '召喚！', e.x, e.y - 92, '#b78cff');
      return;
    }

    if (!e.extraHealUsed && e.hp <= e.maxHp * 0.42) {
      e.extraHealUsed = true;
      healBoss(e, tools, 0.08);
      return;
    }

    bullets().fireSpread(e, tools, 3, 0.22, {
      sizeType: 'normal',
      speed: 2.55,
      hp: 0
    });
  }

  function runMaoh(e, tools, step){
    if (step % 6 === 1) {
      makeBarrier(e, tools, 4, Math.ceil(e.maxHp * 0.045));
      return;
    }

    if (step % 6 === 2) {
      bullets().chargeAimed(e, tools, '魔王弾！', 3, {
        sizeType: 'huge',
        speed: 1.85,
        hp: Math.ceil(e.maxHp * 0.032),
        gap: 30,
        image: 'atk/atkmaoh.png',
        flipY: true,
        color: '#ff4aff'
      });
      return;
    }

    if (step % 6 === 3) {
      summonStageEnemies(e, tools, 1, 0.85);
      addText(tools, '魔王召喚！', e.x, e.y - 92, '#b78cff');
      return;
    }

    if (step % 6 === 4) {
      bullets().fireFanDown(e, tools, 7, {
        sizeType: 'big',
        speed: 2.25,
        hp: 16,
        spread: 0.17,
        safeCenter: true,
        image: 'atk/atkmaoh.png',
        flipY: true
      });
      return;
    }

    if (step % 6 === 5) {
      startDive(e, tools, 4.3);
      addText(tools, '魔王突進！', e.x, e.y - 92, '#ffcf5b');
      return;
    }

    bullets().fireSpread(e, tools, 4, 0.20, {
      sizeType: 'normal',
      speed: 2.5,
      hp: 0,
      safeCenter: true
    });
  }

  function runMail(e, tools, step){
    if (step % 4 === 1) {
      bullets().chargeAimed(e, tools, '鉄球！', 2, {
        sizeType: 'huge',
        speed: 1.75,
        hp: Math.ceil(e.maxHp * 0.025),
        gap: 34,
        color: '#bfc7d5'
      });
      return;
    }

    if (step % 4 === 2) {
      makeBarrier(e, tools, 4, Math.ceil(e.maxHp * 0.035));
      return;
    }

    if (step % 4 === 3 && !e.extraHealUsed && e.hp <= e.maxHp * 0.5) {
      e.extraHealUsed = true;
      healBoss(e, tools, 0.07);
      return;
    }

    bullets().fireSpread(e, tools, 3, 0.24, {
      sizeType: 'big',
      speed: 2.15,
      hp: 14,
      color: '#bfc7d5'
    });
  }

  function runSmith(e, tools, step){
    if (step % 4 === 1) {
      bullets().chargeHoming(e, tools, '追尾！', 3, {
        sizeType: 'normal',
        speed: 2.15,
        homingPower: 0.010,
        image: 'atk/matrix.png',
        flipY: true,
        color: '#7bffea'
      });
      return;
    }

    if (step % 4 === 2) {
      e.x = tools.clamp(
        e.x + tools.rand(-140, 140),
        tools.W * 0.2,
        tools.W * 0.8
      );
      addText(tools, 'マトリックス！', e.x, e.y - 92, '#7bffea');
      bullets().fireLineDown(e, tools, 5, {
        sizeType: 'normal',
        speed: 2.6,
        hp: 0,
        safeCenter: true,
        image: 'atk/matrix.png',
        flipY: true
      });
      return;
    }

    bullets().fireSpread(e, tools, 3, 0.20, {
      sizeType: 'normal',
      speed: 2.65,
      hp: 0,
      image: 'atk/matrix.png',
      flipY: true
    });
  }

  function runNep(e, tools, step){
    if (step % 4 === 1) {
      addText(tools, '大波！', e.x, e.y - 92, '#6be6ff');

      bullets().fireWave(e, tools, 6, {
        sizeType: 'big',
        speed: 2.25,
        hp: 16,
        image: 'atk/atknep.png',
        flipY: true,
        color: '#6be6ff'
      });

      return;
    }

    if (step % 4 === 2) {
      bullets().chargeAimed(e, tools, '水流弾！', 3, {
        sizeType: 'big',
        speed: 2.0,
        hp: 16,
        gap: 28,
        image: 'atk/atknep.png',
        flipY: true,
        color: '#6be6ff'
      });
      return;
    }

    bullets().fireSpread(e, tools, 3, 0.24, {
      sizeType: 'normal',
      speed: 2.5,
      hp: 0,
      image: 'atk/atknep.png',
      flipY: true
    });
  }

  function runBlueNeo(e, tools, step){
    if (step % 4 === 1) {
      addText(tools, 'ネオンライン！', e.x, e.y - 92, '#4bb8ff');

      bullets().chargeLine(e, tools, '', 5, {
        delay: 42,
        sizeType: 'big',
        speed: 2.55,
        hp: 14,
        safeCenter: true,
        image: 'atk/neonring.png',
        flipY: true,
        color: '#4bb8ff'
      });

      return;
    }

    bullets().fireSpread(e, tools, 3, 0.22, {
      sizeType: 'normal',
      speed: 2.8,
      hp: 0,
      image: 'atk/neonring.png',
      flipY: true,
      color: '#4bb8ff'
    });
  }

  function runPurpleNeo(e, tools, step){
    if (step % 4 === 1) {
      bullets().chargeHoming(e, tools, 'パルス追尾！', 2, {
        sizeType: 'big',
        speed: 2.0,
        hp: 14,
        homingPower: 0.009,
        image: 'atk/neonring.png',
        flipY: true,
        color: '#b78cff'
      });

      return;
    }

    if (step % 4 === 2) {
      bullets().fireLineDown(e, tools, 6, {
        sizeType: 'normal',
        speed: 2.65,
        hp: 0,
        safeCenter: true,
        image: 'atk/neonring.png',
        flipY: true,
        color: '#b78cff'
      });

      return;
    }

    bullets().fireSpread(e, tools, 3, 0.22, {
      sizeType: 'normal',
      speed: 2.7,
      hp: 0,
      image: 'atk/neonring.png',
      flipY: true,
      color: '#b78cff'
    });
  }

  function runEnma(e, tools, step){
    if (step % 4 === 1) {
      addText(tools, '地獄門！', e.x, e.y - 92, '#ff3b3b');

      bullets().fireFanDown(e, tools, 8, {
        sizeType: 'big',
        speed: 2.25,
        hp: 18,
        spread: 0.17,
        safeCenter: true,
        image: 'atk/enma.png',
        flipY: true,
        color: '#ff3b3b'
      });

      return;
    }

    if (step % 4 === 2) {
      bullets().chargeHoming(e, tools, '魂追尾！', 3, {
        sizeType: 'normal',
        speed: 2.0,
        homingPower: 0.009,
        image: 'atk/enma.png',
        flipY: true,
        color: '#ff3b3b'
      });

      return;
    }

    bullets().fireSpread(e, tools, 3, 0.24, {
      sizeType: 'big',
      speed: 2.35,
      hp: 14,
      image: 'atk/enma.png',
      flipY: true,
      color: '#ff3b3b'
    });
  }

  function runUltraLilith(e, tools, step){
    if (step === 1) {
      summonLilithSisters(e, tools);
      return;
    }

    if (step % 8 === 1) {
      makeBarrier(e, tools, 5, Math.ceil(e.maxHp * 0.04));
      return;
    }

    if (step % 8 === 2) {
      makeClones(e, tools, 3);
      return;
    }

    if (step % 8 === 3) {
      bullets().chargeAimed(e, tools, 'ウルリリ弾！', 3, {
        sizeType: 'huge',
        speed: 1.85,
        hp: Math.ceil(e.maxHp * 0.025),
        gap: 30,
        image: 'atk/atkriri.png',
        flipY: false,
        color: '#ff8cff'
      });
      return;
    }

    if (step % 8 === 4) {
      bullets().fireFanDown(e, tools, 7, {
        sizeType: 'big',
        speed: 2.25,
        hp: 18,
        spread: 0.16,
        safeCenter: true,
        color: '#ff8cff'
      });
      return;
    }

    if (step % 8 === 5) {
      addText(tools, '最終雷撃！', e.x, e.y - 92, '#6be6ff');

      bullets().chargeLine(e, tools, '', 5, {
        delay: 44,
        sizeType: 'big',
        speed: 2.5,
        hp: 16,
        safeCenter: true,
        image: 'atk/kaminari.png',
        flipY: true,
        color: '#6be6ff'
      });
      return;
    }

    if (step % 8 === 6) {
      bullets().chargeHoming(e, tools, '精霊追尾！', 3, {
        sizeType: 'normal',
        speed: 2.05,
        homingPower: 0.008,
        image: 'atk/atkriri.png',
        flipY: false,
        color: '#ff8cff'
      });
      return;
    }

    if (step % 8 === 7 && !e.extraHealUsed && e.hp <= e.maxHp * 0.45) {
      e.extraHealUsed = true;
      healBoss(e, tools, 0.08);
      return;
    }

    bullets().fireSpread(e, tools, 4, 0.18, {
      sizeType: 'normal',
      speed: 2.5,
      hp: 0,
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

    bullets().fireSpread(e, tools, 3, 0.22, {
      sizeType: 'normal',
      speed: 2.5,
      hp: 0
    });
  }

  function runMidByType(e, tools, type, step){
    if (type === 'ptera') {
      if (step % 3 === 1) {
        startDive(e, tools, 4.4);
        addText(tools, '突進！', e.x, e.y - 60, '#ffcf5b');
        return;
      }

      bullets().fireSpread(e, tools, 3, 0.23, {
        sizeType: 'small',
        speed: 2.55,
        hp: 0
      });
      return;
    }

    if (type === 'dual') {
      bullets().fireSpread(e, tools, 2, 0.32, {
        sizeType: 'small',
        speed: 2.65,
        hp: 0
      });
      return;
    }

    if (type === 'rapid') {
      bullets().chargeAimed(e, tools, '連射！', 3, {
        sizeType: 'small',
        speed: 2.75,
        hp: 0,
        gap: 18,
        textColor: '#ffe66b'
      });
      return;
    }

    if (type === 'thunder' || type === 'neon') {
      bullets().chargeLine(e, tools, '雷！', 3, {
        delay: 36,
        sizeType: 'normal',
        speed: 2.45,
        hp: 10,
        safeCenter: true,
        image: 'atk/kaminari.png',
        flipY: true,
        color: '#6be6ff'
      });
      return;
    }

    if (type === 'magma') {
      bullets().chargeAimed(e, tools, 'マグマ弾！', 2, {
        sizeType: 'big',
        speed: 2.0,
        hp: 16,
        gap: 28,
        image: 'atk/dragon.png',
        flipY: false,
        color: '#ff7a35'
      });
      return;
    }

    if (type === 'blade' || type === 'dash') {
      if (step % 2 === 1) {
        startDive(e, tools, 4.6);
        addText(tools, '斬り込み！', e.x, e.y - 60, '#ffcf5b');
        return;
      }

      bullets().fireSpread(e, tools, 3, 0.24, {
        sizeType: 'small',
        speed: 2.75,
        hp: 0
      });
      return;
    }

    if (type === 'heavy') {
      bullets().chargeAimed(e, tools, '重弾！', 2, {
        sizeType: 'big',
        speed: 1.9,
        hp: 16,
        gap: 30
      });
      return;
    }

    if (type === 'lilith') {
      runLilith(e, tools, step);
      return;
    }

    bullets().fireSpread(e, tools, 2, 0.24, {
      sizeType: 'small',
      speed: 2.55,
      hp: 0
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
      e.vx = tools.rand(1.0, 1.6) * (Math.random() < 0.5 ? -1 : 1);
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
