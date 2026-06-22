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

  function addText(tools, text, x, y, color){
    if (tools && tools.addText) tools.addText(text, x, y, color);
  }

  function burst(tools, x, y, color, n){
    if (tools && tools.burst) tools.burst(x, y, color, n);
  }

  function clamp(tools, v, a, c){
    if (tools && tools.clamp) return tools.clamp(v, a, c);
    return Math.max(a, Math.min(c, v));
  }

  function rand(tools, a, c){
    if (tools && tools.rand) return tools.rand(a, c);
    return a + Math.random() * (c - a);
  }

  function stageData(){
    return window.MOBSHOT_DATA || {};
  }

  function stageInfo(){
    return (stageData() && stageData().stage) || {};
  }

  function isLegendContext(e){
    const st = stageInfo();
    const areaKey = String(st.areaKey || '').trim();

    return !!(
      (e && e.isLegendBoss) ||
      (e && e.__legendBoss) ||
      (e && e.eventDifficulty === 'legend') ||
      (e && e.__doubleDifficulty === 'legend') ||
      st.isLegend ||
      st.difficulty === 'レジェンド' ||
      st.difficulty === 'legend' ||
      areaKey === 'prison' ||
      areaKey === 'matrix' ||
      areaKey === 'seaRail' ||
      areaKey === 'neonHighway' ||
      areaKey === 'makai' ||
      areaKey === 'last'
    );
  }

  function difficultyProfile(e){
    const st = stageInfo();
    const key = String(
      (e && (e.eventDifficulty || e.__doubleDifficulty)) ||
      st.difficulty ||
      ''
    ).trim();

    if (isLegendContext(e)) {
      return { key:'legend', bullet:2.45, zako:4.25, speed:1.48, summonAdd:2 };
    }

    if (key === 'hard' || key === 'ハード') {
      return { key:'hard', bullet:1.14, zako:1.35, speed:1.08, summonAdd:0 };
    }

    if (key === 'veryHard' || key === 'veryhard' || key === 'ベリーハード') {
      return { key:'veryHard', bullet:1.38, zako:1.8, speed:1.16, summonAdd:1 };
    }

    if (key === 'inferno' || key === 'インフェルノ') {
      return { key:'inferno', bullet:1.82, zako:2.75, speed:1.28, summonAdd:1 };
    }

    return { key:'easy', bullet:1, zako:1, speed:1, summonAdd:0 };
  }

  function difficultyMul(e){
    return difficultyProfile(e).bullet;
  }

  function specialHpMul(e){
    if (bossData() && bossData().getSpecialHpMultiplier) {
      return bossData().getSpecialHpMultiplier(e.name);
    }

    return 1.65;
  }

  function getBarrierHp(e, rate, min){
    const diff = difficultyProfile(e);

    return Math.max(
      Number(min || 8),
      Math.ceil(Number(e.maxHp || 100) * Number(rate || 0.03) * specialHpMul(e) * diff.bullet)
    );
  }

  function normalShotOpt(e, opt){
    opt = opt || {};

    const diff = difficultyProfile(e);
    const forceBreakable = opt.breakable === true;
    const forceUnbreakable = opt.breakable === false;
    const breakable = forceUnbreakable ? false : forceBreakable ? true : Math.random() < 0.76;
    const baseHp = Number(opt.hp || 6);
    const hp = breakable ? Math.max(1, Math.ceil(baseHp * diff.bullet)) : 0;

    return Object.assign({}, opt, {
      hp,
      breakable,
      color: opt.color || '#ffffff'
    });
  }

  function specialShotOpt(e, opt){
    opt = opt || {};

    const diff = difficultyProfile(e);
    const baseHp = Number(opt.hp || 10);

    return Object.assign({}, opt, {
      hp: Math.max(1, Math.ceil(baseHp * diff.bullet * specialHpMul(e))),
      breakable: opt.breakable !== false
    });
  }

  function getAreaZakoList(tools){
    const D = tools && tools.D;

    if (D && D.enemies && Array.isArray(D.enemies.zako)) {
      return D.enemies.zako;
    }

    return [];
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

    const diff = difficultyProfile(e);
    const rate = Number(hpRate || 1.35);
    const finalCount = Math.max(1, Number(count || 1) + Number(diff.summonAdd || 0));

    for (let i = 0; i < finalCount; i++) {
      const def = list[(Number(e.summonCount || 0) + i) % list.length];
      const baseHp = Number(def.hp || def.value || 5);
      const hp = Math.max(12, Math.ceil(baseHp * rate * diff.zako));

      tools.state.entities.push({
        kind: 'enemy',
        name: def.name,
        image: def.image,
        x: rand(tools, tools.W * 0.18, tools.W * 0.82),
        y: -80 - i * 52,
        vx: def.vx != null ? Number(def.vx) : rand(tools, -0.55, 0.55),
        vy: def.vy != null ? Number(def.vy) : 1.25,
        r: def.r || (def.name === 'モブロック' ? 34 : 31),
        w: def.w,
        h: def.h,
        hp,
        maxHp: hp,
        value: hp,
        score: Number(def.score || 10),
        coinMin: Number(def.coinMin || 1),
        coinMax: Number(def.coinMax || 3),
        dead: false,
        bob: rand(tools, 0, Math.PI * 2),
        aiType: def.aiType || (i % 3 === 0 ? 'fastSide' : i % 3 === 1 ? 'sway' : 'hop'),
        canShoot: def.canShoot !== false && (isLegendContext(e) || !!def.canShoot),
        baseShootCd: def.baseShootCd || (isLegendContext(e) ? 115 : 170),
        shootCd: def.shootCd || def.baseShootCd || (isLegendContext(e) ? 85 + i * 12 : 160),
        bulletColor: def.bulletColor || '#dfeaff',
        bulletLarge: !!def.bulletLarge,
        burstShot: isLegendContext(e) || !!def.burstShot,
        isBossMinion: true
      });
    }

    e.summonCount = Number(e.summonCount || 0) + finalCount;

    addText(tools, 'ステージ雑魚召喚！', e.x, e.y - 84, '#dfeaff');
  }

  function summonWeakEnemy(e, tools, count){
    summonStageEnemies(e, tools, Number(count || 1), isLegendContext(e) ? 2.0 : 1.35);
  }

  function makeClones(e, tools, count, opt){
    opt = opt || {};

    if (e.cloneUsed) {
      if (b() && b().fireSlowSpread) {
        b().fireSlowSpread(e, tools, 3, 0.24, normalShotOpt(e, {
          hp: 8,
          safeCenter: true,
          color: '#ff8cff'
        }));
      }
      return;
    }

    e.cloneUsed = true;

    addText(tools, '分身！', e.x, e.y - 92, '#b78cff');
    burst(tools, e.x, e.y, '#b78cff', 24);

    const moveBoost = Number(opt.moveBoost || (isLegendContext(e) ? 2.25 : 1.8));
    const diff = difficultyProfile(e);
    const finalCount = isLegendContext(e) ? Math.max(count, 4) : count;

    for (let i = 0; i < finalCount; i++) {
      const offset = (i - (finalCount - 1) / 2) * 70;
      const hp = Math.max(24, Math.ceil(Number(e.maxHp || 100) * 0.028 * diff.zako));

      tools.state.entities.push({
        kind: 'enemy',
        name: 'リリス分身',
        image: e.image,
        x: clamp(tools, e.x + offset, tools.W * 0.16, tools.W * 0.84),
        y: e.y + 34,
        vx: rand(tools, -0.8, 0.8) * moveBoost,
        vy: 0.95 * moveBoost,
        r: 32,
        hp,
        maxHp: hp,
        value: hp,
        score: 80,
        coinMin: 3,
        coinMax: 6,
        canShoot: true,
        baseShootCd: isLegendContext(e) ? 105 : 140,
        shootCd: 55 + i * 18,
        burstShot: true,
        bulletLarge: false,
        bulletColor: '#ff8cff',
        aiType: i % 2 === 0 ? 'teleport' : 'fastSide',
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

    const moveBoost = Number(opt.moveBoost || (isLegendContext(e) ? 2.05 : 1.65));
    const diff = difficultyProfile(e);

    const sisters = [
      { name:'リリスレッド', image:'atk/red.png', hp:30, speed:1.38, cd:145, color:'#ff5b5b', aiType:'fastSide' },
      { name:'リリスブルー', image:'atk/blue.png', hp:36, speed:1.18, cd:160, color:'#6be6ff', aiType:'wideHop' },
      { name:'リリスイエロー', image:'atk/yellow.png', hp:28, speed:1.48, cd:150, color:'#ffe66b', aiType:'teleport' },
      { name:'リリスホワイト', image:'atk/white.png', hp:26, speed:1.25, cd:175, color:'#ffffff', aiType:'fastSide' }
    ];

    sisters.forEach((s, i) => {
      const hp = Math.max(22, Math.ceil(s.hp * diff.zako));

      tools.state.entities.push({
        kind: 'enemy',
        name: s.name,
        image: s.image,
        x: tools.W * (0.23 + i * 0.18),
        y: -90 - i * 36,
        vx: rand(tools, -0.75, 0.75) * moveBoost,
        vy: s.speed * moveBoost,
        r: 29,
        hp,
        maxHp: hp,
        value: hp,
        score: 120,
        coinMin: 5,
        coinMax: 10,
        canShoot: true,
        baseShootCd: s.cd,
        shootCd: s.cd + i * 18,
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
    const diff = difficultyProfile(e);
    const dx = tools.state.player.x - e.x;
    const dy = tools.state.player.y - e.y;
    const len = Math.max(1, Math.sqrt(dx * dx + dy * dy));
    const sp = Number(speed || 3.2) * diff.speed;

    e.diveMode = true;
    e.diveVx = dx / len * sp;
    e.diveVy = dy / len * sp;
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
    e.specialTimer = isLegendContext(e) ? 145 : 120;
    e.specialBaseX = e.x;
    e.specialDashVy = 0;

    addText(tools, '左右揺れ突進！', e.x, e.y - 92, '#ffcf5b');
  }

  function fireBarrage(e, tools, count, opt){
    if (!b()) return;

    const diff = difficultyProfile(e);

    opt = Object.assign({
      sizeType: 'small',
      speed: 1.9 * diff.speed,
      hp: 5,
      breakable: true,
      color: '#ffffff'
    }, opt || {});

    const finalCount = Math.max(1, Number(count || 1) + (isLegendContext(e) ? 2 : 0));
    const delay = Math.max(32, Number(opt.delay || 75) * (isLegendContext(e) ? 0.82 : 1));

    for (let i = 0; i < finalCount; i++) {
      setTimeout(function(){
        if (!e.dead && b() && b().fireSlowSpread) {
          b().fireSlowSpread(e, tools, opt.spreadCount || 1, opt.spread || 0.16, normalShotOpt(e, opt));
        }
      }, i * delay);
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

      b().chargeHoming(e, tools, 'ゆっくり追尾！', 2, specialShotOpt(e, {
        sizeType: 'normal',
        speed: 1.35,
        hp: 8,
        homingPower: 0.0032,
        gap: 32,
        color: '#b78cff',
        textColor: '#b78cff'
      }));
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
      b().chargeAimed(e, tools, '幻影弾！', 2, specialShotOpt(e, {
        sizeType: 'big',
        speed: 1.55,
        hp: 14,
        gap: 34,
        color: '#b78cff'
      }));
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
      b().chargeAimed(e, tools, '盾弾！', 2, specialShotOpt(e, {
        sizeType: 'huge',
        speed: 1.28,
        hp: 14,
        gap: 40,
        color: '#ff7a35'
      }));
      return;
    }

    if (step % 6 === 3) {
      b().chargeLine(e, tools, '守護ライン！', 3, specialShotOpt(e, {
        delay: 58,
        sizeType: 'big',
        speed: 1.55,
        hp: 16,
        safeCenter: true,
        color: '#ff7a35'
      }));
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

      e.x = clamp(tools, e.x + rand(tools, -120, 120), tools.W * 0.2, tools.W * 0.8);

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
      b().chargeAimed(e, tools, 'ネオン巨大玉！', 1, specialShotOpt(e, {
        sizeType: 'super',
        speed: 0.75,
        hp: 30,
        gap: 0,
        color: '#6be6ff'
      }));
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
      b().chargeBigFireball(e, tools, 'ビッグ火の玉！', specialShotOpt(e, {
        delay: 78,
        hp: 18,
        speed: 0.92,
        waveAmp: 42,
        color: '#ff5b35'
      }));
      return;
    }

    if (step % 7 === 2) {
      addText(tools, 'ブレス！', e.x, e.y - 92, '#ff7a35');

      b().fireSafeFanDown(e, tools, 5, specialShotOpt(e, {
        sizeType: 'big',
        speed: 1.65,
        hp: 12,
        spread: 0.15,
        color: '#ff5b35'
      }));
      return;
    }

    if (step % 7 === 3) {
      b().chargeAimed(e, tools, '火球！', 2, specialShotOpt(e, {
        sizeType: 'big',
        speed: 1.55,
        hp: 14,
        gap: 34,
        color: '#ff5b35'
      }));
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
      makeClones(e, tools, 3, { moveBoost: isLegendContext(e) ? 2.2 : 1.9 });
      return;
    }

    if (step % 8 === 3) {
      b().chargeHoming(e, tools, '薔薇追尾！', 2, specialShotOpt(e, {
        sizeType: 'normal',
        speed: 1.45,
        hp: 8,
        homingPower: 0.0035,
        gap: 32,
        color: '#ff8cff'
      }));
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
      b().chargeLine(e, tools, '', 4, specialShotOpt(e, {
        delay: 54,
        sizeType: 'normal',
        speed: 1.85,
        hp: 8,
        safeCenter: true,
        color: '#6be6ff'
      }));
      return;
    }

    if (step % 8 === 6) {
      summonStageEnemies(e, tools, isLegendContext(e) ? 2 : 1, isLegendContext(e) ? 1.75 : 1.15);
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

    if (step % 9 === 1) {
      makeBarrier(e, tools, 4, getBarrierHp(e, 0.035, 18));
      return;
    }

    if (step % 9 === 2) {
      b().chargeBigFireball(e, tools, '魔王ビッグ火球！', specialShotOpt(e, {
        delay: 82,
        hp: 22,
        speed: 0.9,
        waveAmp: 46,
        color: '#ff4aff'
      }));
      return;
    }

    if (step % 9 === 3) {
      summonLilithSisters(e, tools, { moveBoost: 1.9 });
      return;
    }

    if (step % 9 === 4) {
      summonStageEnemies(e, tools, isLegendContext(e) ? 4 : 2, isLegendContext(e) ? 2.05 : 1.2);
      return;
    }

    if (step % 9 === 5) {
      b().fireSafeFanDown(e, tools, 5, specialShotOpt(e, {
        sizeType: 'big',
        speed: 1.6,
        hp: 12,
        spread: 0.16,
        color: '#ff4aff'
      }));
      return;
    }

    if (step % 9 === 6) {
      startDive(e, tools, 3.15);
      addText(tools, '魔王突進！', e.x, e.y - 92, '#ffcf5b');
      return;
    }

    if (step % 9 === 7) {
      b().chargeHoming(e, tools, '魔弾追尾！', 2, specialShotOpt(e, {
        sizeType: 'normal',
        speed: 1.45,
        hp: 9,
        homingPower: 0.0035,
        color: '#ff4aff'
      }));
      return;
    }

    if (step % 9 === 8) {
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

    if (step % 8 === 1) {
      b().chargeAimed(e, tools, '鉄球連射！', isLegendContext(e) ? 3 : 2, specialShotOpt(e, {
        sizeType: 'huge',
        speed: isLegendContext(e) ? 1.38 : 1.25,
        hp: isLegendContext(e) ? 24 : 18,
        gap: 34,
        color: '#bfc7d5'
      }));
      return;
    }

    if (step % 8 === 2) {
      summonStageEnemies(e, tools, isLegendContext(e) ? 4 : 2, isLegendContext(e) ? 2.25 : 1.25);
      return;
    }

    if (step % 8 === 3) {
      makeBarrier(e, tools, 4, getBarrierHp(e, isLegendContext(e) ? 0.05 : 0.032, 22));
      return;
    }

    if (step % 8 === 4) {
      b().chargeLine(e, tools, '鉄壁ライン！', isLegendContext(e) ? 5 : 3, specialShotOpt(e, {
        delay: 52,
        sizeType: 'big',
        speed: isLegendContext(e) ? 1.75 : 1.55,
        hp: isLegendContext(e) ? 22 : 16,
        safeCenter: true,
        color: '#bfc7d5'
      }));
      return;
    }

    if (step % 8 === 5) {
      addText(tools, '高速突進乱射！', e.x, e.y - 92, '#bfc7d5');
      startDive(e, tools, isLegendContext(e) ? 4.85 : 4.15);
      fireBarrage(e, tools, isLegendContext(e) ? 10 : 6, {
        sizeType:'small',
        speed:isLegendContext(e) ? 2.45 : 2.1,
        hp:isLegendContext(e) ? 7 : 5,
        spreadCount:isLegendContext(e) ? 3 : 2,
        spread:0.16,
        delay:isLegendContext(e) ? 36 : 45,
        color:'#bfc7d5'
      });
      return;
    }

    if (step % 8 === 6) {
      makeFrontBarrier(e, tools, 4, getBarrierHp(e, isLegendContext(e) ? 0.06 : 0.04, 24));
      fireBarrage(e, tools, isLegendContext(e) ? 8 : 4, {
        sizeType:'small',
        speed:2.0,
        hp:6,
        spreadCount:2,
        spread:0.22,
        delay:44,
        color:'#bfc7d5'
      });
      return;
    }

    if (step % 8 === 7 && !e.extraHealUsed && e.hp <= e.maxHp * 0.5) {
      e.extraHealUsed = true;
      healBoss(e, tools, isLegendContext(e) ? 0.08 : 0.05);
      summonStageEnemies(e, tools, isLegendContext(e) ? 3 : 1, isLegendContext(e) ? 2.0 : 1.2);
      return;
    }

    b().fireSlowSpread(e, tools, isLegendContext(e) ? 4 : 2, 0.24, normalShotOpt(e, {
      sizeType: 'big',
      speed: isLegendContext(e) ? 1.75 : 1.55,
      hp: isLegendContext(e) ? 10 : 8,
      color: '#bfc7d5'
    }));
  }

  function runSmith(e, tools, step){
    if (!b()) return;

    if (step % 6 === 1) {
      b().chargeHoming(e, tools, '弱追尾！', 2, specialShotOpt(e, {
        sizeType: 'normal',
        speed: 1.45,
        hp: 8,
        homingPower: 0.0036,
        color: '#7bffea'
      }));
      return;
    }

    if (step % 6 === 2) {
      e.x = clamp(tools, e.x + rand(tools, -130, 130), tools.W * 0.2, tools.W * 0.8);

      addText(tools, 'マトリックス！', e.x, e.y - 92, '#7bffea');

      b().fireLineDown(e, tools, isLegendContext(e) ? 6 : 4, normalShotOpt(e, {
        sizeType: 'normal',
        speed: 1.8,
        hp: 7,
        safeCenter: true,
        color: '#7bffea'
      }));
      return;
    }

    if (step % 6 === 3) {
      b().chargeAimed(e, tools, 'コード弾！', 2, specialShotOpt(e, {
        sizeType: 'big',
        speed: 1.5,
        hp: 12,
        gap: 34,
        color: '#7bffea'
      }));
      return;
    }

    if (step % 6 === 4) {
      addText(tools, '高速コード乱射！', e.x, e.y - 92, '#7bffea');
      fireBarrage(e, tools, isLegendContext(e) ? 12 : 8, {
        sizeType:'small',
        speed:2.05,
        hp:5,
        spreadCount:2,
        spread:0.16,
        delay:44,
        color:'#7bffea'
      });
      return;
    }

    if (step % 6 === 5) {
      e.x = clamp(tools, rand(tools, tools.W * 0.2, tools.W * 0.8), tools.W * 0.2, tools.W * 0.8);
      b().fireSlowSpread(e, tools, isLegendContext(e) ? 5 : 4, 0.16, normalShotOpt(e, {
        sizeType:'normal',
        speed:1.9,
        hp:7,
        color:'#7bffea'
      }));
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

      b().fireWave(e, tools, isLegendContext(e) ? 7 : 5, specialShotOpt(e, {
        sizeType: 'big',
        speed: 1.6,
        hp: 12,
        waveAmp: 28,
        color: '#6be6ff'
      }));
      return;
    }

    if (step % 6 === 2) {
      b().chargeAimed(e, tools, '水流弾！', isLegendContext(e) ? 3 : 2, specialShotOpt(e, {
        sizeType: 'big',
        speed: 1.45,
        hp: 14,
        gap: 36,
        color: '#6be6ff'
      }));
      return;
    }

    if (step % 6 === 3) {
      b().fireSafeFanDown(e, tools, isLegendContext(e) ? 7 : 5, normalShotOpt(e, {
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
      b().chargeAimed(e, tools, '巨大トライデント！', 1, specialShotOpt(e, {
        sizeType: 'super',
        speed: 0.58,
        hp: 32,
        gap: 0,
        color: '#6be6ff',
        trident: true
      }));
      return;
    }

    if (step % 6 === 5) {
      summonStageEnemies(e, tools, isLegendContext(e) ? 3 : 1, isLegendContext(e) ? 2.0 : 1.25);
      return;
    }

    b().fireSlowSpread(e, tools, 3, 0.22, normalShotOpt(e, {
      hp: 7,
      color: '#6be6ff'
    }));
  }

  function runBlueNeo(e, tools, step){
    if (!b()) return;

    if (step % 6 === 1) {
      addText(tools, 'ブルーネオンライン！', e.x, e.y - 92, '#4bb8ff');

      b().chargeLine(e, tools, '', isLegendContext(e) ? 5 : 4, specialShotOpt(e, {
        delay: 58,
        sizeType: 'big',
        speed: 1.8,
        hp: 12,
        safeCenter: true,
        color: '#4bb8ff'
      }));
      return;
    }

    if (step % 6 === 2) {
      e.x = clamp(tools, e.x + rand(tools, -150, 150), tools.W * 0.2, tools.W * 0.8);

      b().fireSlowSpread(e, tools, isLegendContext(e) ? 5 : 4, 0.18, normalShotOpt(e, {
        hp: 7,
        speed: 1.95,
        color: '#4bb8ff'
      }));
      return;
    }

    if (step % 6 === 3) {
      addText(tools, '高速リング乱射！', e.x, e.y - 92, '#4bb8ff');
      fireBarrage(e, tools, isLegendContext(e) ? 12 : 8, {
        sizeType:'small',
        speed:2.15,
        hp:5,
        spreadCount:2,
        spread:0.15,
        delay:42,
        color:'#4bb8ff'
      });
      return;
    }

    if (step % 6 === 4) {
      startFastDash(e, tools, 4.3);
      return;
    }

    if (step % 6 === 5) {
      b().fireWave(e, tools, isLegendContext(e) ? 7 : 5, normalShotOpt(e, {
        sizeType:'normal',
        speed:1.85,
        hp:7,
        waveAmp:24,
        color:'#4bb8ff'
      }));
      return;
    }

    b().fireSlowSpread(e, tools, 3, 0.20, normalShotOpt(e, {
      speed: 1.9,
      hp: 7,
      color: '#4bb8ff'
    }));
  }

  function runPurpleNeo(e, tools, step){
    if (!b()) return;

    if (step % 6 === 1) {
      b().chargeHoming(e, tools, 'パルス追尾！', 2, specialShotOpt(e, {
        sizeType: 'big',
        speed: 1.35,
        hp: 12,
        homingPower: 0.0032,
        color: '#b78cff'
      }));
      return;
    }

    if (step % 6 === 2) {
      b().fireLineDown(e, tools, isLegendContext(e) ? 7 : 5, normalShotOpt(e, {
        sizeType: 'normal',
        speed: 1.75,
        hp: 7,
        safeCenter: true,
        color: '#b78cff'
      }));
      return;
    }

    if (step % 6 === 3) {
      b().chargeBigFireball(e, tools, 'パルス火球！', specialShotOpt(e, {
        delay: 80,
        hp: 18,
        speed: 0.92,
        waveAmp: 38,
        color: '#b78cff'
      }));
      return;
    }

    if (step % 6 === 4) {
      addText(tools, 'パルス乱射！', e.x, e.y - 92, '#b78cff');
      fireBarrage(e, tools, isLegendContext(e) ? 12 : 8, {
        sizeType:'small',
        speed:1.95,
        hp:5,
        spreadCount:3,
        spread:0.18,
        delay:46,
        color:'#b78cff'
      });
      return;
    }

    if (step % 6 === 5) {
      startSwayDash(e, tools);
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

      b().fireSafeFanDown(e, tools, isLegendContext(e) ? 8 : 6, specialShotOpt(e, {
        sizeType: 'big',
        speed: 1.55,
        hp: 13,
        spread: 0.15,
        color: '#ff3b3b'
      }));
      return;
    }

    if (step % 8 === 2) {
      b().chargeHoming(e, tools, '魂追尾！', 2, specialShotOpt(e, {
        sizeType: 'normal',
        speed: 1.35,
        hp: 9,
        homingPower: 0.003,
        color: '#ff3b3b'
      }));
      return;
    }

    if (step % 8 === 3) {
      b().chargeBigFireball(e, tools, '閻魔火球！', specialShotOpt(e, {
        delay: 84,
        hp: 22,
        speed: 0.88,
        waveAmp: 46,
        color: '#ff3b3b'
      }));
      return;
    }

    if (step % 8 === 4) {
      startFastDash(e, tools, 4.7);
      return;
    }

    if (step % 8 === 5) {
      addText(tools, '左右揺れ乱射！', e.x, e.y - 92, '#ff3b3b');
      e.specialMove = 'swayDash';
      e.specialTimer = isLegendContext(e) ? 130 : 95;
      e.specialBaseX = e.x;
      fireBarrage(e, tools, isLegendContext(e) ? 14 : 10, {
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

    if (step % 8 === 6) {
      summonStageEnemies(e, tools, isLegendContext(e) ? 4 : 2, isLegendContext(e) ? 2.2 : 1.25);
      return;
    }

    b().fireSlowSpread(e, tools, 3, 0.22, specialShotOpt(e, {
      sizeType: 'big',
      speed: 1.55,
      hp: 12,
      color: '#ff3b3b'
    }));
  }

  function runUltraLilith(e, tools, step){
    if (!b()) return;

    if (step === 1) {
      summonLilithSisters(e, tools, { moveBoost: 2.1 });
      return;
    }

    if (step % 9 === 1) {
      makeBarrier(e, tools, 5, getBarrierHp(e, 0.04, 22));
      return;
    }

    if (step % 9 === 2) {
      makeClones(e, tools, 4, { moveBoost: 2.25 });
      return;
    }

    if (step % 9 === 3) {
      b().chargeBigFireball(e, tools, 'ウルリリ火球！', specialShotOpt(e, {
        delay: 84,
        hp: 22,
        speed: 0.9,
        waveAmp: 44,
        color: '#ff8cff'
      }));
      return;
    }

    if (step % 9 === 4) {
      b().fireSafeFanDown(e, tools, 7, specialShotOpt(e, {
        sizeType: 'big',
        speed: 1.55,
        hp: 12,
        spread: 0.15,
        color: '#ff8cff'
      }));
      return;
    }

    if (step % 9 === 5) {
      addText(tools, '最終雷撃！', e.x, e.y - 92, '#6be6ff');

      b().chargeLine(e, tools, '', 5, specialShotOpt(e, {
        delay: 58,
        sizeType: 'big',
        speed: 1.75,
        hp: 12,
        safeCenter: true,
        color: '#6be6ff'
      }));
      return;
    }

    if (step % 9 === 6) {
      b().chargeHoming(e, tools, '精霊追尾！', 3, specialShotOpt(e, {
        sizeType: 'normal',
        speed: 1.35,
        hp: 8,
        homingPower: 0.003,
        color: '#ff8cff'
      }));
      return;
    }

    if (step % 9 === 7) {
      summonStageEnemies(e, tools, 4, 2.25);
      return;
    }

    if (step % 9 === 8 && !e.extraHealUsed && e.hp <= e.maxHp * 0.45) {
      e.extraHealUsed = true;
      healBoss(e, tools, 0.08);
      summonStageEnemies(e, tools, 3, 2.1);
      return;
    }

    b().fireSlowSpread(e, tools, 4, 0.18, normalShotOpt(e, {
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
      b().fireSlowSpread(e, tools, 3, 0.20, normalShotOpt(e, { hp: 7 }));
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
      b().chargeAimed(e, tools, '連射！', 2, normalShotOpt(e, {
        sizeType: 'small',
        speed: 1.85,
        hp: 5,
        gap: 24,
        textColor: '#ffe66b'
      }));
      return;
    }

    if (type === 'thunder' || type === 'neon') {
      b().chargeLine(e, tools, '雷！', 3, specialShotOpt(e, {
        delay: 48,
        sizeType: 'normal',
        speed: 1.8,
        hp: 8,
        safeCenter: true,
        color: '#6be6ff'
      }));
      return;
    }

    if (type === 'magma') {
      b().chargeAimed(e, tools, 'マグマ弾！', 2, specialShotOpt(e, {
        sizeType: 'big',
        speed: 1.45,
        hp: 12,
        gap: 34,
        color: '#ff7a35'
      }));
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
      b().chargeAimed(e, tools, '重弾！', 2, specialShotOpt(e, {
        sizeType: 'big',
        speed: 1.35,
        hp: 12,
        gap: 36
      }));
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
