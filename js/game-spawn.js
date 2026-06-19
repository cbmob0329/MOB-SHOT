'use strict';

(function(){
  function enemyProfile(name){
    const profile = {
      aiType: '',
      canShoot: false,
      baseShootCd: 190,
      burstShot: false,
      bulletLarge: false,
      bulletColor: '#ff4aff',
      vxMul: 1,
      vyMul: 1,
      rAdd: 0,
      hpMul: 1
    };

    if (name === 'スラモブ') {
      profile.aiType = 'hop';
      profile.vxMul = 0.8;
    }

    if (name === 'モブロック') {
      profile.aiType = 'sway';
      profile.rAdd = 5;
      profile.hpMul = 1.25;
      profile.vxMul = 0.45;
    }

    if (name === 'モブ盗賊') {
      profile.aiType = 'shortDash';
      profile.vyMul = 1.05;
    }

    if (name === 'モブドワーフ') {
      profile.aiType = 'sway';
      profile.vxMul = 0.8;
      profile.hpMul = 1.1;
    }

    if (name === 'モブバード') {
      profile.aiType = 'fastSide';
      profile.vxMul = 1.35;
      profile.vyMul = 1.12;
    }

    if (name === 'モブファル') {
      profile.aiType = 'shortDash';
      profile.vxMul = 1.15;
      profile.vyMul = 1.05;
    }

    if (name === 'ナーガモブ') {
      profile.aiType = 'sway';
      profile.hpMul = 1.15;
      profile.vxMul = 0.9;
    }

    if (name === 'モブグリズリー') {
      profile.aiType = 'sway';
      profile.rAdd = 7;
      profile.hpMul = 1.35;
      profile.vxMul = 0.55;
      profile.vyMul = 0.92;
    }

    if (name === 'モブマグトカゲ') {
      profile.aiType = 'hop';
      profile.vxMul = 1.05;
      profile.hpMul = 1.1;
    }

    if (name === 'モブマグプテラ') {
      profile.aiType = 'fastSide';
      profile.vxMul = 1.45;
      profile.vyMul = 1.08;
    }

    if (name === 'ダークゴブモブ') {
      profile.aiType = 'teleport';
      profile.vxMul = 1.25;
      profile.vyMul = 1.05;
    }

    if (name === 'モブアサシン') {
      profile.aiType = 'fastSide';
      profile.vxMul = 1.65;
      profile.vyMul = 1.08;
    }

    if (name === 'モブテツ') {
      profile.aiType = 'sway';
      profile.canShoot = true;
      profile.baseShootCd = 210;
      profile.bulletLarge = true;
      profile.hpMul = 1.35;
      profile.rAdd = 5;
      profile.bulletColor = '#bfc7d5';
    }

    if (name === 'マルモブ') {
      profile.aiType = 'wideHop';
      profile.canShoot = true;
      profile.baseShootCd = 230;
      profile.bulletLarge = true;
      profile.bulletColor = '#ffcf5b';
    }

    if (name === 'モブサラ') {
      profile.aiType = 'sway';
      profile.canShoot = true;
      profile.baseShootCd = 205;
      profile.bulletLarge = true;
      profile.bulletColor = '#ff8cff';
    }

    if (name === 'モブシノ') {
      profile.aiType = 'fastSide';
      profile.canShoot = true;
      profile.baseShootCd = 180;
      profile.burstShot = true;
      profile.bulletColor = '#b78cff';
      profile.vxMul = 1.45;
    }

    if (name === 'ウミシモブ') {
      profile.aiType = 'wideHop';
      profile.canShoot = true;
      profile.baseShootCd = 220;
      profile.bulletLarge = true;
      profile.bulletColor = '#6be6ff';
      profile.vxMul = 1.35;
    }

    if (name === 'バブモブ') {
      profile.aiType = 'fastSide';
      profile.canShoot = true;
      profile.baseShootCd = 235;
      profile.bulletLarge = true;
      profile.bulletColor = '#9deeff';
      profile.vxMul = 1.6;
      profile.vyMul = 1.08;
    }

    if (name === 'ネオスラモブ') {
      profile.aiType = 'fastHop';
      profile.canShoot = true;
      profile.baseShootCd = 210;
      profile.bulletColor = '#60d9ff';
      profile.vxMul = 1.55;
    }

    if (name === 'モブネオレム') {
      profile.aiType = 'enlargeLowHp';
      profile.canShoot = true;
      profile.baseShootCd = 230;
      profile.bulletLarge = true;
      profile.hpMul = 1.35;
      profile.rAdd = 5;
      profile.bulletColor = '#7bffea';
    }

    if (name === 'モブデビブルー') {
      profile.aiType = 'wideShot';
      profile.canShoot = true;
      profile.baseShootCd = 195;
      profile.bulletLarge = true;
      profile.bulletColor = '#4bb8ff';
    }

    if (name === 'モブデビピンク') {
      profile.aiType = 'sway';
      profile.canShoot = true;
      profile.baseShootCd = 215;
      profile.bulletLarge = true;
      profile.bulletColor = '#ff4aa4';
      profile.hpMul = 1.15;
    }

    if (name === 'モブデビパープル') {
      profile.aiType = 'fastSide';
      profile.canShoot = true;
      profile.baseShootCd = 220;
      profile.bulletColor = '#b78cff';
      profile.vxMul = 1.55;
    }

    if (name === 'モブデビイエロー') {
      profile.aiType = 'fastSide';
      profile.canShoot = true;
      profile.baseShootCd = 175;
      profile.burstShot = true;
      profile.bulletColor = '#ffe66b';
      profile.vxMul = 1.45;
    }

    if (name === 'モブデーモンレッド') {
      profile.aiType = 'sway';
      profile.canShoot = true;
      profile.baseShootCd = 225;
      profile.bulletLarge = true;
      profile.hpMul = 1.25;
      profile.bulletColor = '#ff5b5b';
    }

    if (name === 'モブデーモンパープル') {
      profile.aiType = 'teleport';
      profile.canShoot = true;
      profile.baseShootCd = 220;
      profile.bulletColor = '#b78cff';
      profile.vxMul = 1.35;
    }

    return profile;
  }

  function safeNumber(v, fallback){
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }

  function spawnEnemy(tools){
    const state = tools.state;
    const D = tools.D;
    const flow = tools.flow;
    const W = tools.W;
    const rand = tools.rand;
    const pick = tools.pick;

    if (!D || !D.enemies || !Array.isArray(D.enemies.zako)) return;

    const def = pick(D.enemies.zako);
    if (!def) return;

    const profile = enemyProfile(def.name);
    const areaNo = flow && flow.area ? Number(flow.area || 1) : 1;
    const scale = 1 + areaNo * 0.08;
    const hp = Math.ceil(safeNumber(def.hp, 5) * scale * profile.hpMul);

    state.entities.push({
      kind: 'enemy',
      name: def.name,
      image: def.image,
      x: rand(W * 0.18, W * 0.82),
      y: -78,
      vx: rand(-0.85, 0.85) * profile.vxMul,
      vy: (2.15 + areaNo * 0.08) * profile.vyMul,
      r: (def.name === 'モブロック' ? 34 : 31) + profile.rAdd,
      hp,
      maxHp: hp,
      score: safeNumber(def.score, 10),
      coinMin: safeNumber(def.coinMin, 1),
      coinMax: safeNumber(def.coinMax, 2),
      dead: false,
      bob: rand(0, Math.PI * 2),

      aiType: profile.aiType,
      canShoot: profile.canShoot || !!def.canShoot,
      baseShootCd: profile.baseShootCd,
      shootCd: profile.baseShootCd + Math.floor(rand(0, 70)),
      burstShot: profile.burstShot,
      bulletLarge: profile.bulletLarge,
      bulletColor: profile.bulletColor
    });
  }

  function spawnGimmick(tools){
    const state = tools.state;
    const D = tools.D;
    const flow = tools.flow;
    const W = tools.W;
    const rand = tools.rand;
    const pick = tools.pick;

    if (!D || !Array.isArray(D.gimmicks)) return;

    const def = pick(D.gimmicks);
    if (!def) return;

    const areaNo = flow && flow.area ? Number(flow.area || 1) : 1;
    const scale = 1 + areaNo * 0.1;
    const hp = Math.ceil(safeNumber(def.hp, 10) * scale);

    state.entities.push({
      kind: 'gimmick',
      name: def.name,
      image: def.image,
      x: rand(W * 0.18, W * 0.82),
      y: -80,
      vx: 0,
      vy: 2.05,
      w: 82,
      h: 82,
      hp,
      maxHp: hp,
      score: safeNumber(def.score, 10),
      coinMin: safeNumber(def.coinMin, 1),
      coinMax: safeNumber(def.coinMax, 2),
      dead: false,
      bob: 0
    });
  }

  function spawnChest(tools){
    const state = tools.state;
    const D = tools.D;
    const W = tools.W;
    const rand = tools.rand;
    const pick = tools.pick;

    if (!D || !Array.isArray(D.chests)) return;

    const def = pick(D.chests);
    if (!def) return;

    state.entities.push({
      kind: 'chest',
      name: def.name,
      image: def.image,
      x: rand(W * 0.2, W * 0.8),
      y: -76,
      vx: 0,
      vy: 2.0,
      w: 64,
      h: 58,
      hp: safeNumber(def.hp, 10),
      maxHp: safeNumber(def.hp, 10),
      score: safeNumber(def.score, 80),
      coinMin: safeNumber(def.coinMin, 10),
      coinMax: safeNumber(def.coinMax, 25),
      dead: false,
      bob: 0
    });
  }

  function spawnGatePair(tools){
    const state = tools.state;
    const D = tools.D;
    const flow = tools.flow;
    const W = tools.W;
    const frame = tools.frame();
    const weightedPick = tools.weightedPick;

    if (!D || !Array.isArray(D.gates)) return;

    let pool;

    if (flow.gate < 7) {
      pool = D.gates.filter(g =>
        g.type !== 'wide' &&
        g.type !== 'skillmax'
      );
    } else {
      pool = D.gates.map(g => {
        if (g.type === 'wide') {
          return Object.assign({}, g, { weight: 0.05 });
        }

        if (g.type === 'skillmax') {
          return Object.assign({}, g, { weight: 0.02 });
        }

        return g;
      });
    }

    pool = pool.filter(g => !g.minRank || g.minRank <= 1);

    const a = weightedPick(pool);
    let b = weightedPick(pool);

    if (!a || !b) return;

    let guard = 0;

    while (b.type === a.type && guard < 20) {
      b = weightedPick(pool);
      guard++;
    }

    const pair = `gate-${frame}-${Math.random()}`;

    state.entities.push(makeGate(a, W * 0.31, pair));
    state.entities.push(makeGate(b, W * 0.69, pair));
  }

  function makeGate(def, x, pair){
    return {
      kind: 'gate',
      name: def.label,
      image: def.image,
      type: def.type,
      value: def.value,
      color: def.color,
      x,
      y: -86,
      w: 116,
      h: 116,
      vy: 2.25,
      pair,
      dead: false,
      used: false,
      bob: 0
    };
  }

  function midBossProfile(name){
    const profile = {
      vx: 1.35,
      vy: 2.25,
      r: 64,
      contactDmg: 13,
      shootCd: 110,
      attackCd: 155,
      hpMul: 1
    };

    if (name === 'モブプテラ') {
      profile.vx = 1.35;
      profile.r = 64;
      profile.shootCd = 112;
      profile.attackCd = 165;
    }

    if (name === 'モブデュアル') {
      profile.vx = 1.55;
      profile.r = 66;
      profile.shootCd = 104;
      profile.attackCd = 158;
    }

    if (name === 'モブピー') {
      profile.vx = 1.65;
      profile.r = 58;
      profile.shootCd = 96;
      profile.attackCd = 150;
    }

    if (name === 'モブギドラ') {
      profile.vx = 1.25;
      profile.r = 72;
      profile.shootCd = 112;
      profile.attackCd = 165;
      profile.hpMul = 1.1;
    }

    if (name === 'マグモブレム') {
      profile.vx = 0.95;
      profile.r = 76;
      profile.shootCd = 135;
      profile.attackCd = 180;
      profile.hpMul = 1.25;
      profile.contactDmg = 16;
    }

    if (name === 'グラディモブ') {
      profile.vx = 1.45;
      profile.r = 70;
      profile.shootCd = 118;
      profile.attackCd = 160;
      profile.contactDmg = 17;
    }

    if (name === 'モブニコ') {
      profile.vx = 1.35;
      profile.r = 64;
    }

    if (name === 'モブラス') {
      profile.vx = 1.15;
      profile.r = 70;
      profile.hpMul = 1.15;
    }

    if (name === 'ガトリモブ') {
      profile.vx = 1.6;
      profile.r = 64;
      profile.shootCd = 96;
    }

    if (name === 'ジェイモブ') {
      profile.vx = 1.5;
      profile.r = 62;
      profile.attackCd = 150;
    }

    if (name === 'モブサメ') {
      profile.vx = 1.55;
      profile.r = 72;
      profile.contactDmg = 18;
    }

    if (name === 'モブシャチ') {
      profile.vx = 1.35;
      profile.r = 78;
      profile.hpMul = 1.2;
      profile.contactDmg = 19;
    }

    if (name === 'モブコード') {
      profile.vx = 1.5;
      profile.r = 66;
      profile.shootCd = 102;
    }

    if (name === 'モブケーブル') {
      profile.vx = 1.28;
      profile.r = 70;
      profile.attackCd = 155;
    }

    if (name === 'モブマグシャー') {
      profile.vx = 1.12;
      profile.r = 76;
      profile.hpMul = 1.2;
      profile.contactDmg = 18;
    }

    if (name === 'モブガラド') {
      profile.vx = 1.28;
      profile.r = 74;
      profile.hpMul = 1.18;
    }

    if (name === 'モブメルト') {
      profile.vx = 1.18;
      profile.r = 74;
      profile.hpMul = 1.22;
      profile.contactDmg = 18;
    }

    if (name === 'モブリリス') {
      profile.vx = 1.45;
      profile.r = 78;
      profile.shootCd = 100;
      profile.attackCd = 150;
      profile.hpMul = 1.25;
      profile.contactDmg = 18;
    }

    return profile;
  }

  function spawnMidBoss(tools){
    const state = tools.state;
    const D = tools.D;
    const flow = tools.flow;
    const W = tools.W;
    const H = tools.H;
    const pick = tools.pick;

    if (!D || !D.enemies || !Array.isArray(D.enemies.midBoss)) return;

    const def = pick(D.enemies.midBoss);
    if (!def) return;

    const profile = midBossProfile(def.name);
    const flowMidBoss = flow && flow.midBoss ? Number(flow.midBoss || 1) : 1;
    const hp = Math.ceil(safeNumber(def.hp, 80) * (flowMidBoss === 2 ? 1.35 : 1) * profile.hpMul);

    state.entities.push({
      kind: 'midBoss',
      name: def.name,
      image: def.image,
      x: W / 2,
      y: -150,
      baseY: H * 0.25,
      targetY: H * 0.25,
      vx: profile.vx,
      vy: profile.vy,
      r: profile.r,
      hp,
      maxHp: hp,
      score: safeNumber(def.score, 300),
      coin: safeNumber(def.coin, 30),
      dead: false,
      shootCd: profile.shootCd,
      attackCd: profile.attackCd,
      diveMode: false,
      diveReturn: false,
      diveVx: 0,
      diveVy: 0,
      contactDmg: profile.contactDmg,
      hitPlayerCd: 0,
      bob: 0
    });
  }

  function bossProfile(name){
    const profile = {
      vx: 1.35,
      vy: 1.55,
      r: 106,
      shootCd: 92,
      attackCd: 160,
      contactDmg: 18,
      hpMul: 1
    };

    if (String(name || '').indexOf('Ⅱ') >= 0) {
      profile.vx = 1.42;
      profile.r = 112;
      profile.shootCd = 88;
      profile.attackCd = 152;
      profile.contactDmg = 22;
      profile.hpMul = 1.1;
    }

    if (name === 'ミラモブ' || name === 'ミラモブⅡ') {
      profile.vx = 1.62;
      profile.r = 104;
      profile.shootCd = 88;
    }

    if (name === '番人' || name === '番人Ⅱ') {
      profile.vx = 1.1;
      profile.r = 112;
      profile.hpMul = name === '番人Ⅱ' ? 1.2 : 1.1;
    }

    if (name === 'ネオンモブ' || name === 'ネオンモブⅡ') {
      profile.vx = 1.7;
      profile.r = 104;
      profile.shootCd = 86;
    }

    if (name === 'ドラゴンモブ' || name === 'ドラゴンモブⅡ') {
      profile.vx = 1.2;
      profile.r = 124;
      profile.hpMul = name === 'ドラゴンモブⅡ' ? 1.25 : 1.15;
      profile.contactDmg = 24;
    }

    if (name === 'モブリリス') {
      profile.vx = 1.58;
      profile.r = 112;
      profile.shootCd = 86;
      profile.attackCd = 145;
      profile.contactDmg = 22;
      profile.hpMul = 1.12;
    }

    if (name === 'モブ魔王') {
      profile.vx = 1.42;
      profile.r = 132;
      profile.shootCd = 88;
      profile.attackCd = 145;
      profile.contactDmg = 28;
      profile.hpMul = 1.35;
    }

    if (name === 'モブメイル') {
      profile.vx = 1.25;
      profile.r = 118;
      profile.shootCd = 90;
      profile.attackCd = 150;
      profile.hpMul = 1.18;
    }

    if (name === 'モブスミス') {
      profile.vx = 1.75;
      profile.r = 108;
      profile.shootCd = 84;
      profile.attackCd = 140;
    }

    if (name === 'モブネプ') {
      profile.vx = 1.48;
      profile.r = 116;
      profile.shootCd = 86;
      profile.attackCd = 142;
    }

    if (name === 'ブルネオモブ' || name === 'パルネオモブ') {
      profile.vx = 1.78;
      profile.r = 104;
      profile.shootCd = 84;
      profile.attackCd = 142;
    }

    if (name === '閻魔モブ') {
      profile.vx = 1.35;
      profile.r = 128;
      profile.shootCd = 90;
      profile.attackCd = 150;
      profile.hpMul = 1.3;
      profile.contactDmg = 30;
    }

    if (name === 'ウルモブリリス') {
      profile.vx = 1.62;
      profile.r = 126;
      profile.shootCd = 86;
      profile.attackCd = 140;
      profile.hpMul = 1.35;
      profile.contactDmg = 30;
    }

    return profile;
  }

  function spawnBoss(tools){
    const state = tools.state;
    const D = tools.D;
    const W = tools.W;
    const H = tools.H;

    if (!D || !D.enemies || !D.enemies.boss) return;

    const def = D.enemies.boss;
    const profile = bossProfile(def.name);
    const hp = Math.ceil(safeNumber(def.hp, 1000) * profile.hpMul);

    state.entities.push({
      kind: 'boss',
      name: def.name,
      image: def.image,
      x: W / 2,
      y: -240,
      baseY: H * 0.21,
      targetY: H * 0.21,
      vx: profile.vx,
      vy: profile.vy,
      r: profile.r,
      hp,
      maxHp: hp,
      score: safeNumber(def.score, 1000),
      coin: safeNumber(def.coin, 100),
      dead: false,
      shootCd: profile.shootCd,
      attackCd: profile.attackCd,
      attackStep: 0,
      contactDmg: profile.contactDmg,
      hitPlayerCd: 0,
      bob: 0
    });
  }

  window.MobShotSpawn = {
    spawnEnemy,
    spawnGimmick,
    spawnChest,
    spawnGatePair,
    spawnMidBoss,
    spawnBoss,
    enemyProfile,
    midBossProfile,
    bossProfile
  };
})();
