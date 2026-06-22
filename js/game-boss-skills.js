'use strict';

(function(){
  function bullets(){
    return window.MobShotBossBullets;
  }

  function b(){
    return bullets();
  }

  function bossData(){
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
    if (tools && tools.addText) {
      tools.addText(text, x, y, color);
    }
  }

  function burst(tools, x, y, color, n){
    if (tools && tools.burst) {
      tools.burst(x, y, color, n);
    }
  }

  function clamp(tools, v, a, c){
    if (tools && tools.clamp) return tools.clamp(v, a, c);
    return Math.max(a, Math.min(c, v));
  }

  function rand(tools, a, c){
    if (tools && tools.rand) return tools.rand(a, c);
    return a + Math.random() * (c - a);
  }

  function difficultyMul(e){
    const key = String(e.eventDifficulty || e.__doubleDifficulty || '').trim();

    if (key === 'hard' || key === 'ハード') return 1.08;
    if (key === 'veryHard' || key === 'veryhard' || key === 'ベリーハード') return 1.18;
    if (key === 'inferno' || key === 'インフェルノ') return 1.35;
    if (key === 'legend' || key === 'レジェンド') return 1.55;

    return 1;
  }

  function specialHpMul(e){
    if (bossData() && bossData().getSpecialHpMultiplier) {
      return bossData().getSpecialHpMultiplier(e.name);
    }

    return 1.65;
  }

  function getBarrierHp(e, rate, min){
    return Math.max(
      Number(min || 8),
      Math.ceil(Number(e.maxHp || 100) * Number(rate || 0.03) * specialHpMul(e))
    );
  }

  function normalShotOpt(e, opt){
    opt = opt || {};

    const breakable = Math.random() < 0.74;

    return Object.assign({
      hp: breakable ? Number(opt.hp || 6) : 0,
      breakable,
      color: opt.color || '#ffffff'
    }, opt, {
      hp: breakable ? Number(opt.hp || 6) : 0,
      breakable
    });
  }

  function makeBarrier(e, tools, sec, hp){
    e.barrierTimer = Math.max(Number(e.barrierTimer || 0), sec * 60);
    e.barrierHp = Math.max(Number(e.barrierHp || 0), Number(hp || 1));

    addText(tools, 'バリア！', e.x, e.y - 92, '#9deeff');
    burst(tools, e.x, e.y, '#9deeff', 30);
  }

  function makeFrontBarrier(e, tools, sec, hp){
    e.frontBarrierTimer = Math.max(Number(e.frontBarrierTimer || 0), sec * 60);
    e.frontBarrierHp = Math.max(Number(e.frontBarrierHp || 0), Number(hp || 1));

    addText(tools, '前面バリア！', e.x, e.y - 92, '#ffcf5b');
    burst(tools, e.x, e.y, '#ffcf5b', 34);
  }

  function makeCircleBarrier(e, tools, sec, hp){
    e.circleBarrierTimer = Math.max(Number(e.circleBarrierTimer || 0), sec * 60);
    e.circleBarrierHp = Math.max(Number(e.circleBarrierHp || 0), Number(hp || 1));

    addText(tools, '円形バリア！', e.x, e.y - 96, '#ff4aff');
    burst(tools, e.x, e.y, '#ff4aff', 42);
  }

  function setGhost(e, tools, sec){
    e.ghostTimer = Math.max(Number(e.ghostTimer || 0), Math.floor(Number(sec || 3) * 60));
    e.alpha = 0.32;

    addText(tools, '透明化！', e.x, e.y - 92, '#b78cff');
    burst(tools, e.x, e.y, '#b78cff', 28);
  }

  function healBoss(e, tools, rate){
    const amount = Math.ceil(Number(e.maxHp || 1) * Number(rate || 0.05));

    e.hp = Math.min(Number(e.maxHp || e.hp || 1), Number(e.hp || 0) + amount);

    addText(tools, '回復！', e.x, e.y - 92, '#9dff73');
    burst(tools, e.x, e.y, '#9dff73', 30);
  }

  function summonStageEnemies(e, tools, count, hpRate){
    const list = getAreaZakoList(tools);

    if (!list.length || !tools || !tools.state || !Array.isArray(tools.state.entities)) return;

    for (let i = 0; i < count; i++) {
      const def = list[(Number(e.summonCount || 0) + i) % list.length];
      const hp = Math.max(3, Math.ceil(Number(def.hp || 5) * Number(hpRate || 0.7) * difficultyMul(e)));

      tools.state.entities.push({
        kind: 'enemy',
        name: def.name,
        image: def.image,
        x: rand(tools, tools.W * 0.22, tools.W * 0.78),
        y: -80 - i * 64,
        vx: rand(tools, -0.35, 0.35),
        vy: 1.12,
        r: def.name === 'モブロック' ? 34 : 31,
        hp,
        maxHp: hp,
        value: hp,
        score: Number(def.score || 10),
        coinMin: Number(def.coinMin || 1),
        coinMax: Number(def.coinMax || 3),
        dead: false,
        bob: rand(tools, 0, Math.PI * 2),
        aiType: i % 2 === 0 ? 'sway' : 'hop',
        isBossMinion: true
      });
    }

    e.summonCount = Number(e.summonCount || 0) + count;

    addText(tools, '召喚！', e.x, e.y - 84, '#dfeaff');
  }

  function summonWeakEnemy(e, tools, count){
    summonStageEnemies(e, tools, Number(count || 1), 0.65);
  }

  function makeClones(e, tools, count, opt){
    opt = opt || {};

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
    burst(tools, e.x, e.y, '#b78cff', 24);

    const moveBoost = Number(opt.moveBoost || 1.65);

    for (let i = 0; i < count; i++) {
      const offset = (i - (count - 1) / 2) * 76;
      const hp = Math.ceil(Number(e.maxHp || 100) * 0.026);

      tools.state.entities.push({
        kind: 'enemy',
        name: 'リリス分身',
        image: e.image,
        x: clamp(tools, e.x + offset, tools.W * 0.18, tools.W * 0.82),
        y: e.y + 34,
        vx: rand(tools, -0.55, 0.55) * moveBoost,
        vy: 0.86 * moveBoost,
        r: 32,
        hp,
        maxHp: hp,
        value: hp,
        score: 80,
        coinMin: 3,
        coinMax: 6,
        canShoot: true,
        baseShootCd: 155,
        shootCd: 80 + i * 24,
        burstShot: true,
        bulletLarge: false,
        bulletColor: '#ff8cff',
        aiType: i === 1 ? 'teleport' : 'fastSide',
        moveBoost,
        dead: false,
        bob: rand(tools, 0, Math.PI * 2)
      });
    }
  }

  function summonLilithSisters(e, tools, opt){
    opt = opt || {};

    if (e.sistersUsed) return;

    e.sistersUsed = true;

    const moveBoost = Number(opt.moveBoost || 1.45);

    const sisters = [
      { name:'リリスレッド', image:'atk/red.png', hp:30, speed:1.25, cd:190, color:'#ff5b5b', aiType:'fastSide' },
      { name:'リリスブルー', image:'atk/blue.png', hp:36, speed:1.05, cd:210, color:'#6be6ff', aiType:'wideHop' },
      { name:'リリスイエロー', image:'atk/yellow.png', hp:28, speed:1.35, cd:195, color:'#ffe66b', aiType:'teleport' },
      { name:'リリスホワイト', image:'atk/white.png', hp:26, speed:1.12, cd:220, color:'#ffffff', aiType:'fastSide' }
    ];

    sisters.forEach((s, i) => {
      tools.state.entities.push({
        kind: 'enemy',
        name: s.name,
        image: s.image,
        x: tools.W * (0.23 + i * 0.18),
        y: -90 - i * 36,
        vx: rand(tools, -0.55, 0.55) * moveBoost,
        vy: s.speed * moveBoost,
        r: 29,
        hp: Math.ceil(s.hp * difficultyMul(e)),
        maxHp: Math.ceil(s.hp * difficultyMul(e)),
        value: Math.ceil(s.hp * difficultyMul(e)),
        score: 120,
        coinMin: 5,
        coinMax: 10,
        canShoot: true,
        baseShootCd: s.cd,
        shootCd: s.cd + i * 25,
        burstShot: true,
        bulletLarge: false,
        bulletColor: s.color,
        aiType: s.aiType,
        moveBoost,
        dead: false,
        bob: rand(tools, 0, Math.PI * 2)
      });
    });

    addText(tools, 'リリス四姉妹！', e.x, e.y - 108, '#ff8cff');
    burst(tools, e.x, e.y, '#ff8cff', 36);
  }

  function startDive(e, tools, speed){
    const dx = tools.state.player.x - e.x;
    const dy = tools.state.player.y - e.y;
    const len = Math.max(1, Math.sqrt(dx * dx + dy * dy));

    e.diveMode = true;
    e.diveVx = dx / len * Number(speed || 3.2);
    e.diveVy = dy / len * Number(speed || 3.2);
  }

  function updateDive(e, tools){
    e.x += e.diveVx || 0;
    e.y += e.diveVy || 0;

    if (e.y > tools.H + 90) {
      e.diveMode = false;
      e.diveReturn = true;
      e.x = clamp(tools, e.x, tools.W * 0.2, tools.W * 0.8);
      e.y = -120;
      e.targetY = e.baseY || tools.H * 0.25;
      e.vx = rand(tools, 0.8, 1.25) * (Math.random() < 0.5 ? -1 : 1);
    }
  }

  function startFastDash(e, tools, speed){
    startDive(e, tools, Number(speed || 4.2));
    addText(tools, '高速突進！', e.x, e.y - 92, '#ffcf5b');
  }

  function startSwayDash(e, tools){
    e.specialMove = 'swayDash';
    e.specialTimer = 120;
    e.specialBaseX = e.x;
    e.specialDashVy = 0;

    addText(tools, '左右揺れ突進！', e.x, e.y - 92, '#ffcf5b');
  }

  function fireBarrage(e, tools, count, opt){
    if (!b()) return;

    opt = Object.assign({
      sizeType: 'small',
      speed: 1.9,
      hp: 5,
      breakable: true,
      color: '#ffffff'
    }, opt || {});

    for (let i = 0; i < count; i++) {
      setTimeout(function(){
        if (!e.dead && b() && b().fireSlowSpread) {
          b().fireSlowSpread(e, tools, opt.spreadCount || 1, opt.spread || 0.16, normalShotOpt(e, opt));
        }
      }, i * Number(opt.delay || 75));
    }
  }

  function runHawk(e, tools, step){
    if (!b()) return;

    if (step % 5 === 1) {
      addText(tools, '羽ばたき弾！', e.x, e.y - 92, '#ffe66b');

      b().fireSafeFanDown(e, tools, 5, normalShotOpt(e, {
        speed: 1.75,
        hp: 6,
        spread: 0.18,
        color: '#ffe66b'
      }));
      return;
    }

    if (step % 5 === 2) {
      addText(tools, '急降下！', e.x, e.y - 92, '#ffcf5b');
      startDive(e, tools, 3.35);
      return;
    }

    if (step % 5 === 3) {
      addText(tools, '高速突進！', e.x, e.y - 92, '#ffe66b');
      startDive(e, tools, 4.65);
      return;
    }

    if (step % 5 === 4) {
      b().chargeLine(e, tools, 'ホークライン！', 4, normalShotOpt(e, {
        delay: 54,
        sizeType: 'normal',
        speed: 1.8,
        hp: 7,
        safeCenter: true,
        color: '#ffe66b'
      }));
      return;
    }

    b().fireSlowSpread(e, tools, 3, 0.22, normalShotOpt(e, {
      hp: 7,
      color: '#ffe66b'
    }));
  }

  function runMira(e, tools, step){
    if (!b()) return;

    if (step % 6 === 1) {
      addText(tools, 'ミラージュ！', e.x, e.y - 92, '#b78cff');

      e.ghostTimer = 180;
      e.alpha = 0.32;

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

    if (step % 6 === 2) {
      b().fireCross(e, tools, normalShotOpt(e, {
        sizeType: 'normal',
        speed: 1.8,
        hp: 7,
        color: '#b78cff'
      }));
      return;
    }

    if (step % 6 === 3) {
      b().chargeAimed(e, tools, '幻影弾！', 2, {
        sizeType: 'big',
        speed: 1.55,
        hp: Math.ceil(14 * specialHpMul(e)),
        gap: 34,
        color: '#b78cff'
      });
      return;
    }

    if (step % 6 === 4) {
      addText(tools, 'その場乱射！', e.x, e.y - 92, '#b78cff');
      fireBarrage(e, tools, 12, {
        sizeType:'small',
        speed:1.65,
        hp:5,
        spreadCount:3,
        spread:0.20,
        delay:50,
        color:'#b78cff'
      });
      return;
    }

    if (step % 6 === 5) {
      setGhost(e, tools, 3);
      return;
    }

    b().fireSlowSpread(e, tools, 3, 0.18, normalShotOpt(e, {
      hp: 7,
      color: '#b78cff'
    }));
  }

  function runGuardian(e, tools, step){
    if (!b()) return;

    if (step % 6 === 1) {
      makeBarrier(e, tools, 4, getBarrierHp(e, 0.035, 12));
      e.vx = Number(e.vx || 1) * 0.4;
      return;
    }

    if (step % 6 === 2) {
      b().chargeAimed(e, tools, '盾弾！', 2, {
        sizeType: 'huge',
        speed: 1.28,
        hp: getBarrierHp(e, 0.022, 14),
        gap: 40,
        color: '#ff7a35'
      });
      return;
    }

    if (step % 6 === 3) {
      b().chargeLine(e, tools, '守護ライン！', 3, {
        delay: 58,
        sizeType: 'big',
        speed: 1.55,
        hp: Math.ceil(16 * specialHpMul(e)),
        safeCenter: true,
        color: '#ff7a35'
      });
      return;
    }

    if (step % 6 === 4) {
      startSwayDash(e, tools);
      return;
    }

    if (step % 6 === 5) {
      makeFrontBarrier(e, tools, 4, getBarrierHp(e, 0.055, 18));
      return;
    }

    b().fireSlowSpread(e, tools, 2, 0.26, normalShotOpt(e, {
      sizeType: 'big',
      speed: 1.55,
      hp: 8,
      color: '#ff7a35'
    }));
  }

  function runNeon(e, tools, step){
    if (!b()) return;

    if (step % 6 === 1) {
      addText(tools, 'ワープ！', e.x, e.y - 92, '#6be6ff');

      e.x = clamp(
        tools,
        e.x + rand(tools, -120, 120),
        tools.W * 0.2,
        tools.W * 0.8
      );

      b().fireSlowSpread(e, tools, 3, 0.20, normalShotOpt(e, {
        hp: 7,
        color: '#6be6ff'
      }));
      return;
    }

    if (step % 6 === 2) {
      b().chargeLine(e, tools, 'ネオンライン！', 4, normalShotOpt(e, {
        delay: 56,
        sizeType: 'normal',
        speed: 1.9,
        hp: 7,
        safeCenter: true,
        color: '#6be6ff'
      }));
      return;
    }

    if (step % 6 === 3) {
      b().fireWave(e, tools, 5, normalShotOpt(e, {
        sizeType: 'normal',
        speed: 1.75,
        hp: 7,
        waveAmp: 20,
        waveSpeed: 0.04,
        color: '#6be6ff'
      }));
      return;
    }

    if (step % 6 === 4) {
      addText(tools, '巨大玉！', e.x, e.y - 96, '#6be6ff');
      b().chargeAimed(e, tools, 'ネオン巨大玉！', 1, {
        sizeType: 'super',
        speed: 0.75,
        hp: Math.ceil(30 * specialHpMul(e)),
        gap: 0,
        color: '#6be6ff'
      });
      return;
    }

    b().fireSlowSpread(e, tools, 3, 0.18, normalShotOpt(e, {
      speed: 1.85,
      hp: 7,
      color: '#6be6ff'
    }));
  }

  function runDragon(e, tools, step){
    if (!b()) return;

    if (step % 7 === 1) {
      b().chargeBigFireball(e, tools, 'ビッグ火の玉！', {
        delay: 78,
        hp: getBarrierHp(e, 0.025, 18),
        speed: 0.92,
        waveAmp: 42,
        color: '#ff5b35'
      });
      return;
    }

    if (step % 7 === 2) {
      addText(tools, 'ブレス！', e.x, e.y - 92, '#ff7a35');

      b().fireSafeFanDown(e, tools, 5, {
        sizeType: 'big',
        speed: 1.65,
        hp: Math.ceil(12 * specialHpMul(e)),
        spread: 0.15,
        color: '#ff5b35'
      });
      return;
    }

    if (step % 7 === 3) {
      b().chargeAimed(e, tools, '火球！', 2, {
        sizeType: 'big',
        speed: 1.55,
        hp: Math.ceil(14 * specialHpMul(e)),
        gap: 34,
        color: '#ff5b35'
      });
      return;
    }

    if (step % 7 === 4) {
      addText(tools, '火炎乱射！', e.x, e.y - 92, '#ff5b35');
      fireBarrage(e, tools, 10, {
        sizeType:'small',
        speed:1.8,
        hp:4,
        spreadCount:2,
        spread:0.12,
        delay:48,
        color:'#ff5b35'
      });
      return;
    }

    b().fireSlowSpread(e, tools, 3, 0.20, normalShotOpt(e, {
      sizeType: 'big',
      speed: 1.65,
      hp: 8,
      color: '#ff5b35'
    }));
  }

  function runLilith(e, tools, step){
    if (!b()) return;

    if (step % 8 === 1) {
      makeBarrier(e, tools, 3, getBarrierHp(e, 0.025, 12));
      return;
    }

    if (step % 8 === 2) {
      makeClones(e, tools, 3, { moveBoost: 1.8 });
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
      b().fireSafeFanDown(e, tools, 5, normalShotOpt(e, {
        sizeType: 'normal',
        speed: 1.8,
        hp: 7,
        spread: 0.16,
        color: '#ff8cff'
      }));
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
      return;
    }

    if (step % 8 === 7 && !e.extraHealUsed && e.hp <= e.maxHp * 0.42) {
      e.extraHealUsed = true;
      healBoss(e, tools, 0.06);
      return;
    }

    b().fireSlowSpread(e, tools, 3, 0.20, normalShotOpt(e, {
      hp: 7,
      color: '#ff8cff'
    }));
  }

  function runMaoh(e, tools, step){
    if (!b()) return;

    if (step % 8 === 1) {
      makeBarrier(e, tools, 4, getBarrierHp(e, 0.035, 18));
      return;
    }

    if (step % 8 === 2) {
      b().chargeBigFireball(e, tools, '魔王ビッグ火球！', {
        delay: 82,
        hp: getBarrierHp(e, 0.027, 22),
        speed: 0.9,
        waveAmp: 46,
        color: '#ff4aff'
      });
      return;
    }

    if (step % 8 === 3) {
      summonStageEnemies(e, tools, 1, 0.75);
      return;
    }

    if (step % 8 === 4) {
      b().fireSafeFanDown(e, tools, 5, {
        sizeType: 'big',
        speed: 1.6,
        hp: Math.ceil(12 * specialHpMul(e)),
        spread: 0.16,
        color: '#ff4aff'
      });
      return;
    }

    if (step % 8 === 5) {
      startDive(e, tools, 3.15);
      addText(tools, '魔王突進！', e.x, e.y - 92, '#ffcf5b');
      return;
    }

    if (step % 8 === 6) {
      b().chargeHoming(e, tools, '魔弾追尾！', 2, {
        sizeType: 'normal',
        speed: 1.45,
        hp: 9,
        homingPower: 0.0035,
        color: '#ff4aff'
      });
      return;
    }

    if (step % 8 === 7) {
      makeCircleBarrier(e, tools, 4, getBarrierHp(e, 0.075, 26));
      return;
    }

    b().fireSlowSpread(e, tools, 3, 0.20, normalShotOpt(e, {
      hp: 8,
      safeCenter: true,
      color: '#ff4aff'
    }));
  }

  function runMail(e, tools, step){
    if (!b()) return;

    if (step % 6 === 1) {
      b().chargeAimed(e, tools, '鉄球！', 2, {
        sizeType: 'huge',
        speed: 1.25,
        hp: getBarrierHp(e, 0.020, 18),
        gap: 42,
        color: '#bfc7d5'
      });
      return;
    }

    if (step % 6 === 2) {
      makeBarrier(e, tools, 4, getBarrierHp(e, 0.032, 18));
      return;
    }

    if (step % 6 === 3) {
      b().chargeLine(e, tools, '鉄壁ライン！', 3, {
        delay: 58,
        sizeType: 'big',
        speed: 1.55,
        hp: Math.ceil(16 * specialHpMul(e)),
        safeCenter: true,
        color: '#bfc7d5'
      });
      return;
    }

    if (step % 6 === 4 && !e.extraHealUsed && e.hp <= e.maxHp * 0.5) {
      e.extraHealUsed = true;
      healBoss(e, tools, 0.05);
      return;
    }

    if (step % 6 === 5) {
      addText(tools, '高速突進乱射！', e.x, e.y - 92, '#bfc7d5');
      startDive(e, tools, 4.15);
      fireBarrage(e, tools, 6, {
        sizeType:'small',
        speed:2.1,
        hp:5,
        spreadCount:2,
        spread:0.16,
        delay:45,
        color:'#bfc7d5'
      });
      return;
    }

    b().fireSlowSpread(e, tools, 2, 0.24, normalShotOpt(e, {
      sizeType: 'big',
      speed: 1.55,
      hp: 8,
      color: '#bfc7d5'
    }));
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
      e.x = clamp(
        tools,
        e.x + rand(tools, -130, 130),
        tools.W * 0.2,
        tools.W * 0.8
      );

      addText(tools, 'マトリックス！', e.x, e.y - 92, '#7bffea');

      b().fireLineDown(e, tools, 4, normalShotOpt(e, {
        sizeType: 'normal',
        speed: 1.8,
        hp: 7,
        safeCenter: true,
        color: '#7bffea'
      }));
      return;
    }

    if (step % 5 === 3) {
      b().chargeAimed(e, tools, 'コード弾！', 2, {
        sizeType: 'big',
        speed: 1.5,
        hp: Math.ceil(12 * specialHpMul(e)),
        gap: 34,
        color: '#7bffea'
      });
      return;
    }

    b().fireSlowSpread(e, tools, 3, 0.18, normalShotOpt(e, {
      hp: 7,
      color: '#7bffea'
    }));
  }

  function runNep(e, tools, step){
    if (!b()) return;

    if (step % 6 === 1) {
      addText(tools, '大波！', e.x, e.y - 92, '#6be6ff');

      b().fireWave(e, tools, 5, {
        sizeType: 'big',
        speed: 1.6,
        hp: Math.ceil(12 * specialHpMul(e)),
        waveAmp: 28,
        color: '#6be6ff'
      });
      return;
    }

    if (step % 6 === 2) {
      b().chargeAimed(e, tools, '水流弾！', 2, {
        sizeType: 'big',
        speed: 1.45,
        hp: Math.ceil(14 * specialHpMul(e)),
        gap: 36,
        color: '#6be6ff'
      });
      return;
    }

    if (step % 6 === 3) {
      b().fireSafeFanDown(e, tools, 5, normalShotOpt(e, {
        sizeType: 'normal',
        speed: 1.7,
        hp: 7,
        spread: 0.17,
        color: '#6be6ff'
      }));
      return;
    }

    if (step % 6 === 4) {
      addText(tools, '巨大トライデント！', e.x, e.y - 96, '#6be6ff');
      b().chargeAimed(e, tools, '巨大トライデント！', 1, {
        sizeType: 'super',
        speed: 0.58,
        hp: Math.ceil(32 * specialHpMul(e)),
        gap: 0,
        color: '#6be6ff',
        trident: true
      });
      return;
    }

    b().fireSlowSpread(e, tools, 3, 0.22, normalShotOpt(e, {
      hp: 7,
      color: '#6be6ff'
    }));
  }

  function runBlueNeo(e, tools, step){
    if (!b()) return;

    if (step % 5 === 1) {
      addText(tools, 'ネオンライン！', e.x, e.y - 92, '#4bb8ff');

      b().chargeLine(e, tools, '', 4, {
        delay: 58,
        sizeType: 'big',
        speed: 1.8,
        hp: Math.ceil(12 * specialHpMul(e)),
        safeCenter: true,
        color: '#4bb8ff'
      });
      return;
    }

    if (step % 5 === 2) {
      e.x = clamp(
        tools,
        e.x + rand(tools, -140, 140),
        tools.W * 0.2,
        tools.W * 0.8
      );

      b().fireSlowSpread(e, tools, 3, 0.20, normalShotOpt(e, {
        hp: 7,
        color: '#4bb8ff'
      }));
      return;
    }

    b().fireSlowSpread(e, tools, 3, 0.20, normalShotOpt(e, {
      speed: 1.85,
      hp: 7,
      color: '#4bb8ff'
    }));
  }

  function runPurpleNeo(e, tools, step){
    if (!b()) return;

    if (step % 5 === 1) {
      b().chargeHoming(e, tools, 'パルス追尾！', 2, {
        sizeType: 'big',
        speed: 1.35,
        hp: Math.ceil(12 * specialHpMul(e)),
        homingPower: 0.0032,
        color: '#b78cff'
      });
      return;
    }

    if (step % 5 === 2) {
      b().fireLineDown(e, tools, 5, normalShotOpt(e, {
        sizeType: 'normal',
        speed: 1.75,
        hp: 7,
        safeCenter: true,
        color: '#b78cff'
      }));
      return;
    }

    if (step % 5 === 3) {
      b().chargeBigFireball(e, tools, 'パルス火球！', {
        delay: 80,
        hp: getBarrierHp(e, 0.022, 18),
        speed: 0.92,
        waveAmp: 38,
        color: '#b78cff'
      });
      return;
    }

    b().fireSlowSpread(e, tools, 3, 0.20, normalShotOpt(e, {
      hp: 7,
      color: '#b78cff'
    }));
  }

  function runEnma(e, tools, step){
    if (!b()) return;

    if (step % 8 === 1) {
      addText(tools, '地獄門！', e.x, e.y - 92, '#ff3b3b');

      b().fireSafeFanDown(e, tools, 6, {
        sizeType: 'big',
        speed: 1.55,
        hp: Math.ceil(13 * specialHpMul(e)),
        spread: 0.15,
        color: '#ff3b3b'
      });
      return;
    }

    if (step % 8 === 2) {
      b().chargeHoming(e, tools, '魂追尾！', 2, {
        sizeType: 'normal',
        speed: 1.35,
        hp: 9,
        homingPower: 0.003,
        color: '#ff3b3b'
      });
      return;
    }

    if (step % 8 === 3) {
      b().chargeBigFireball(e, tools, '閻魔火球！', {
        delay: 84,
        hp: getBarrierHp(e, 0.026, 22),
        speed: 0.88,
        waveAmp: 46,
        color: '#ff3b3b'
      });
      return;
    }

    if (step % 8 === 4) {
      startFastDash(e, tools, 4.7);
      return;
    }

    if (step % 8 === 5) {
      addText(tools, '左右揺れ乱射！', e.x, e.y - 92, '#ff3b3b');
      e.specialMove = 'swayDash';
      e.specialTimer = 95;
      e.specialBaseX = e.x;
      fireBarrage(e, tools, 10, {
        sizeType:'small',
        speed:1.9,
        hp:5,
        spreadCount:3,
        spread:0.20,
        delay:42,
        color:'#ff3b3b'
      });
      return;
    }

    b().fireSlowSpread(e, tools, 3, 0.22, {
      sizeType: 'big',
      speed: 1.55,
      hp: Math.ceil(12 * specialHpMul(e)),
      color: '#ff3b3b'
    });
  }

  function runUltraLilith(e, tools, step){
    if (!b()) return;

    if (step === 1) {
      summonLilithSisters(e, tools, { moveBoost: 1.6 });
      return;
    }

    if (step % 9 === 1) {
      makeBarrier(e, tools, 5, getBarrierHp(e, 0.035, 18));
      return;
    }

    if (step % 9 === 2) {
      makeClones(e, tools, 3, { moveBoost: 1.9 });
      return;
    }

    if (step % 9 === 3) {
      b().chargeBigFireball(e, tools, 'ウルリリ火球！', {
        delay: 84,
        hp: getBarrierHp(e, 0.024, 22),
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
        hp: Math.ceil(12 * specialHpMul(e)),
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
        hp: Math.ceil(12 * specialHpMul(e)),
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
      return;
    }

    if (step % 9 === 8 && !e.extraHealUsed && e.hp <= e.maxHp * 0.45) {
      e.extraHealUsed = true;
      healBoss(e, tools, 0.06);
      return;
    }

    b().fireSlowSpread(e, tools, 3, 0.18, normalShotOpt(e, {
      hp: 8,
      safeCenter: true,
      color: '#ff8cff'
    }));
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
      b().fireSlowSpread(e, tools, 3, 0.20, normalShotOpt(e, {
        hp: 7
      }));
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

      b().fireSlowSpread(e, tools, 3, 0.22, normalShotOpt(e, {
        sizeType: 'small',
        speed: 1.8,
        hp: 5
      }));
      return;
    }

    if (type === 'dual') {
      if (step % 3 === 1) {
        startSwayDash(e, tools);
        return;
      }

      b().fireSlowSpread(e, tools, 2, 0.30, normalShotOpt(e, {
        sizeType: 'small',
        speed: 1.85,
        hp: 5
      }));
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

      b().fireSlowSpread(e, tools, 3, 0.22, normalShotOpt(e, {
        sizeType: 'small',
        speed: 1.9,
        hp: 5
      }));
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

    b().fireSlowSpread(e, tools, 2, 0.22, normalShotOpt(e, {
      sizeType: 'small',
      speed: 1.8,
      hp: 5
    }));
  }

  window.MobShotBossSkills = {
    runByType,
    runMidByType,

    makeBarrier,
    makeFrontBarrier,
    makeCircleBarrier,
    setGhost,
    healBoss,
    summonStageEnemies,
    summonWeakEnemy,
    makeClones,
    summonLilithSisters,
    startDive,
    startFastDash,
    startSwayDash,
    updateDive
  };
})();
