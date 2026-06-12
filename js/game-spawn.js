'use strict';

(function(){
  const ENEMY_AI = {
    'スラモブ': {
      type: 'hop',
      r: 31,
      vxMin: -1.15,
      vxMax: 1.15,
      vyBonus: 0.05
    },
    'モブロック': {
      type: 'heavy',
      r: 36,
      vxMin: -0.45,
      vxMax: 0.45,
      vyBonus: -0.08,
      hpRate: 1.2
    },
    'モブ盗賊': {
      type: 'ambush',
      r: 31,
      vxMin: -0.9,
      vxMax: 0.9,
      vyBonus: 0.08
    },
    'モブドワーフ': {
      type: 'sway',
      r: 32,
      vxMin: -1.05,
      vxMax: 1.05,
      vyBonus: 0
    },
    'モブバード': {
      type: 'fast',
      r: 30,
      vxMin: -1.25,
      vxMax: 1.25,
      vyBonus: 0.32
    },
    'モブファル': {
      type: 'shortDash',
      r: 31,
      vxMin: -0.85,
      vxMax: 0.85,
      vyBonus: 0.15,
      dashCd: 90
    },
    'ナーガモブ': {
      type: 'hide',
      r: 32,
      vxMin: -0.85,
      vxMax: 0.85,
      vyBonus: 0
    },
    'モブグリズリー': {
      type: 'heavy',
      r: 38,
      vxMin: -0.55,
      vxMax: 0.55,
      vyBonus: -0.05,
      hpRate: 1.25
    },
    'モブマグトカゲ': {
      type: 'hop',
      r: 32,
      vxMin: -1.25,
      vxMax: 1.25,
      vyBonus: 0.08
    },
    'モブマグプテラ': {
      type: 'fastSide',
      r: 31,
      vxMin: -1.75,
      vxMax: 1.75,
      vyBonus: 0.18
    },
    'ダークゴブモブ': {
      type: 'coverDash',
      r: 31,
      vxMin: -1.55,
      vxMax: 1.55,
      vyBonus: 0.1,
      dashCd: 75
    },
    'モブアサシン': {
      type: 'fastSide',
      r: 30,
      vxMin: -1.9,
      vxMax: 1.9,
      vyBonus: 0.14
    },

    'モブテツ': {
      type: 'legendShot',
      r: 32,
      vxMin: -1.2,
      vxMax: 1.2,
      vyBonus: 0.08,
      canShoot: true,
      shootCd: 150,
      bulletColor: '#b8c4d8'
    },
    'マルモブ': {
      type: 'spin',
      r: 33,
      vxMin: -1.0,
      vxMax: 1.0,
      vyBonus: 0.12,
      canShoot: true,
      shootCd: 170,
      bulletColor: '#d8d8ff'
    },
    'モブサラ': {
      type: 'legendShot',
      r: 31,
      vxMin: -1.35,
      vxMax: 1.35,
      vyBonus: 0.12,
      canShoot: true,
      shootCd: 145,
      bulletColor: '#60d9ff'
    },
    'モブシノ': {
      type: 'rapidShot',
      r: 31,
      vxMin: -1.25,
      vxMax: 1.25,
      vyBonus: 0.1,
      canShoot: true,
      shootCd: 125,
      burstShot: true,
      bulletColor: '#b78cff'
    },
    'ウミシモブ': {
      type: 'wideHop',
      r: 32,
      vxMin: -1.8,
      vxMax: 1.8,
      vyBonus: 0.14,
      canShoot: true,
      shootCd: 155,
      bulletColor: '#60d9ff'
    },
    'バブモブ': {
      type: 'freeMove',
      r: 31,
      vxMin: -1.6,
      vxMax: 1.6,
      vyBonus: 0.1,
      canShoot: true,
      shootCd: 150,
      bulletColor: '#9deeff'
    },
    'ネオスラモブ': {
      type: 'fastHop',
      r: 30,
      vxMin: -2.0,
      vxMax: 2.0,
      vyBonus: 0.2,
      canShoot: true,
      shootCd: 135,
      bulletColor: '#60d9ff'
    },
    'モブネオレム': {
      type: 'enlargeLowHp',
      r: 34,
      vxMin: -0.95,
      vxMax: 0.95,
      vyBonus: 0.06,
      canShoot: true,
      shootCd: 150,
      bulletColor: '#b78cff'
    },
    'モブデビブルー': {
      type: 'wideShot',
      r: 31,
      vxMin: -1.35,
      vxMax: 1.35,
      vyBonus: 0.14,
      canShoot: true,
      shootCd: 120,
      bulletColor: '#4bb8ff'
    },
    'モブデビピンク': {
      type: 'bombShot',
      r: 31,
      vxMin: -1.1,
      vxMax: 1.1,
      vyBonus: 0.1,
      canShoot: true,
      shootCd: 145,
      bulletColor: '#ff4aa4'
    },
    'モブデビパープル': {
      type: 'fastSide',
      r: 30,
      vxMin: -2.0,
      vxMax: 2.0,
      vyBonus: 0.13,
      canShoot: true,
      shootCd: 140,
      bulletColor: '#b78cff'
    },
    'モブデビイエロー': {
      type: 'rapidShot',
      r: 30,
      vxMin: -1.45,
      vxMax: 1.45,
      vyBonus: 0.14,
      canShoot: true,
      shootCd: 110,
      burstShot: true,
      bulletColor: '#ffe66b'
    },
    'モブデーモンレッド': {
      type: 'coverShot',
      r: 32,
      vxMin: -1.0,
      vxMax: 1.0,
      vyBonus: 0.1,
      canShoot: true,
      shootCd: 135,
      bulletColor: '#ff5b5b',
      bulletLarge: true
    },
    'モブデーモンパープル': {
      type: 'teleport',
      r: 31,
      vxMin: -1.4,
      vxMax: 1.4,
      vyBonus: 0.12,
      canShoot: true,
      shootCd: 135,
      teleportCd: 120,
      bulletColor: '#b78cff'
    }
  };

  function enemyAI(name){
    return ENEMY_AI[name] || {
      type: 'normal',
      r: 31,
      vxMin: -0.85,
      vxMax: 0.85,
      vyBonus: 0
    };
  }

  function spawnEnemy(tools){
    const state = tools.state;
    const D = tools.D;
    const flow = tools.flow;
    const W = tools.W;
    const rand = tools.rand;
    const pick = tools.pick;

    if (!D.enemies || !D.enemies.zako || !D.enemies.zako.length) return;

    const def = pick(D.enemies.zako);
    const ai = enemyAI(def.name);
    const scale = 1 + flow.area * 0.08;
    const hpRate = ai.hpRate || 1;

    const hp = Math.ceil(Number(def.hp || 1) * scale * hpRate);

    state.entities.push({
      kind: 'enemy',
      name: def.name,
      image: def.image,

      x: rand(W * 0.18, W * 0.82),
      y: -78,

      vx: rand(ai.vxMin, ai.vxMax),
      vy: 2.15 + flow.area * 0.08 + (ai.vyBonus || 0),

      r: ai.r || 31,

      hp,
      maxHp: hp,

      score: Number(def.score || 10),
      coinMin: Number(def.coinMin || 1),
      coinMax: Number(def.coinMax || 3),

      aiType: ai.type,
      canShoot: !!(def.canShoot || ai.canShoot),
      shootCd: ai.shootCd || 160,
      baseShootCd: ai.shootCd || 160,
      burstShot: !!ai.burstShot,
      bulletColor: ai.bulletColor || '#ff4aff',
      bulletLarge: !!ai.bulletLarge,

      dashCd: ai.dashCd || 0,
      teleportCd: ai.teleportCd || 0,
      aiTimer: 0,

      dead: false,
      bob: rand(0, Math.PI * 2)
    });
  }

  function spawnGimmick(tools){
    const state = tools.state;
    const D = tools.D;
    const flow = tools.flow;
    const W = tools.W;
    const rand = tools.rand;
    const pick = tools.pick;

    if (!D.gimmicks || !D.gimmicks.length) return;

    const def = pick(D.gimmicks);
    const scale = 1 + flow.area * 0.1;
    const hp = Math.ceil(Number(def.hp || 1) * scale);

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

      score: Number(def.score || 10),
      coinMin: Number(def.coinMin || 1),
      coinMax: Number(def.coinMax || 3),

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

    if (!D.chests || !D.chests.length) return;

    const def = pick(D.chests);

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

      hp: Number(def.hp || 1),
      maxHp: Number(def.hp || 1),

      score: Number(def.score || 20),
      coinMin: Number(def.coinMin || 10),
      coinMax: Number(def.coinMax || 20),

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

    if (!D.gates || !D.gates.length) return;

    let pool;
    const stageInfo = flow.stageInfo || {};
    const chapter = Number(stageInfo.chapter || 1);
    const allowRare = chapter >= 3 || flow.gate >= 3;

    if (!allowRare) {
      pool = D.gates.filter(g =>
        g.type !== 'wide' &&
        g.type !== 'skillmax'
      );
    } else {
      pool = D.gates.map(g => {
        if (g.type === 'wide') {
          return Object.assign({}, g, { weight: g.weight || 0.05 });
        }

        if (g.type === 'skillmax') {
          return Object.assign({}, g, { weight: g.weight || 0.02 });
        }

        return g;
      });
    }

    pool = pool.filter(g => !g.minRank || g.minRank <= Number(stageInfo.chapter || 1) * 10);

    if (pool.length < 2) {
      pool = D.gates.slice();
    }

    const a = weightedPick(pool);
    let b = weightedPick(pool);
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

  function spawnMidBoss(tools){
    const state = tools.state;
    const D = tools.D;
    const flow = tools.flow;
    const W = tools.W;
    const H = tools.H;

    if (!D.enemies || !D.enemies.midBoss || !D.enemies.midBoss.length) return;

    const list = D.enemies.midBoss;
    const index = Math.max(
      0,
      Math.min(list.length - 1, Number(flow.midBoss || 1) - 1)
    );

    const def = list[index] || list[0];
    const hpRate = flow.midBoss === 2 ? 1.35 : 1;
    const hp = Math.ceil(Number(def.hp || 100) * hpRate);

    state.entities.push({
      kind: 'midBoss',
      name: def.name,
      image: def.image,

      x: W / 2,
      y: -150,

      baseY: H * 0.25,
      targetY: H * 0.25,

      vx: midBossVx(def.name),
      vy: 2.35,

      r: midBossRadius(def.name),

      hp,
      maxHp: hp,

      score: Number(def.score || 300),
      coin: Number(def.coin || 30),

      dead: false,

      shootCd: midBossShootCd(def.name),
      actionCd: midBossActionCd(def.name),
      attackCd: midBossActionCd(def.name),
      attackStep: 0,

      diveMode: false,
      diveReturn: false,
      diveVx: 0,
      diveVy: 0,

      contactDmg: midBossContactDmg(def.name),
      hitPlayerCd: 0,

      aiTimer: 0,
      bossType: 'mid',

      bob: 0
    });
  }

  function spawnBoss(tools){
    const state = tools.state;
    const D = tools.D;
    const flow = tools.flow;
    const W = tools.W;
    const H = tools.H;

    if (!D.enemies || !D.enemies.boss) return;

    const def = D.enemies.boss;
    const stageInfo = flow.stageInfo || {};
    const areaKey = stageInfo.areaKey || '';

    if (areaKey === 'neonHighway' && def.name === 'パルネオモブ') {
      spawnNeonHighwayDoubleBoss(tools, def);
      return;
    }

    state.entities.push(makeBossEntity(def, tools, {
      x: W / 2,
      y: -240,
      hpRate: 1,
      nameOverride: null,
      imageOverride: null
    }));
  }

  function spawnNeonHighwayDoubleBoss(tools, def){
    const state = tools.state;
    const W = tools.W;

    const hpBase = Math.ceil(Number(def.hp || 3000) * 0.5);
    const scoreBase = Math.ceil(Number(def.score || 13000) * 0.5);
    const coinBase = Math.ceil(Number(def.coin || 2000) * 0.5);

    const blue = Object.assign({}, def, {
      name: 'ブルネオモブ',
      image: 'boss/bossneonblue.png',
      hp: hpBase,
      score: scoreBase,
      coin: coinBase,
      strong: true,
      isLegendBoss: true
    });

    const purple = Object.assign({}, def, {
      name: 'パルネオモブ',
      image: 'boss/bossneonpur.png',
      hp: hpBase,
      score: scoreBase,
      coin: coinBase,
      strong: true,
      isLegendBoss: true
    });

    state.entities.push(makeBossEntity(blue, tools, {
      x: W * 0.35,
      y: -240
    }));

    state.entities.push(makeBossEntity(purple, tools, {
      x: W * 0.65,
      y: -300
    }));
  }

  function makeBossEntity(def, tools, opt){
    const W = tools.W;
    const H = tools.H;

    const hp = Math.ceil(Number(def.hp || 500) * Number(opt.hpRate || 1));

    return {
      kind: 'boss',
      name: opt.nameOverride || def.name,
      image: opt.imageOverride || def.image,

      x: opt.x != null ? opt.x : W / 2,
      y: opt.y != null ? opt.y : -240,

      baseY: H * 0.21,
      targetY: H * 0.21,

      vx: bossVx(def.name),
      vy: 1.6,

      r: bossRadius(def.name),

      hp,
      maxHp: hp,

      score: Number(def.score || 500),
      coin: Number(def.coin || 100),

      strong: !!def.strong,
      isLegendBoss: !!def.isLegendBoss,

      dead: false,

      shootCd: bossShootCd(def.name),
      actionCd: bossActionCd(def.name),
      attackCd: bossActionCd(def.name),
      attackStep: 0,

      contactDmg: bossContactDmg(def.name),
      hitPlayerCd: 0,

      diveMode: false,
      diveReturn: false,
      diveVx: 0,
      diveVy: 0,

      barrierTimer: 0,
      barrierHp: 0,

      aiTimer: 0,
      bossType: 'boss',

      bob: 0
    };
  }

  function midBossVx(name){
    if (name === 'モブピー') return 1.75;
    if (name === 'モブギドラ') return 1.9;
    if (name === 'グラディモブ') return 1.35;
    if (name === 'マグモブレム') return 1.05;
    return 1.45;
  }

  function midBossRadius(name){
    if (name === 'マグモブレム') return 72;
    if (name === 'グラディモブ') return 66;
    return 64;
  }

  function midBossShootCd(name){
    if (name === 'モブギドラ') return 54;
    if (name === 'グラディモブ') return 58;
    if (name === 'モブピー') return 66;
    return 76;
  }

  function midBossActionCd(name){
    if (name === 'モブギドラ') return 95;
    if (name === 'モブピー') return 105;
    if (name === 'グラディモブ') return 100;
    return 120;
  }

  function midBossContactDmg(name){
    if (name === 'マグモブレム') return 18;
    if (name === 'モブギドラ') return 15;
    return 13;
  }

  function bossVx(name){
    if ((name || '').includes('スミス')) return 2.1;
    if ((name || '').includes('ネプ')) return 2.0;
    if ((name || '').includes('ネオン')) return 1.9;
    if ((name || '').includes('魔王')) return 1.75;
    if ((name || '').includes('リリス')) return 1.65;
    return 1.55;
  }

  function bossRadius(name){
    if ((name || '').includes('ウルモブ')) return 122;
    if ((name || '').includes('魔王')) return 116;
    if ((name || '').includes('ドラゴン')) return 116;
    if ((name || '').includes('メイル')) return 112;
    return 106;
  }

  function bossShootCd(name){
    if ((name || '').includes('ウルモブ')) return 38;
    if ((name || '').includes('魔王')) return 40;
    if ((name || '').includes('リリス')) return 42;
    if ((name || '').includes('ネオン')) return 44;
    return 50;
  }

  function bossActionCd(name){
    if ((name || '').includes('ウルモブ')) return 78;
    if ((name || '').includes('魔王')) return 82;
    if ((name || '').includes('リリス')) return 86;
    return 95;
  }

  function bossContactDmg(name){
    if ((name || '').includes('ウルモブ')) return 26;
    if ((name || '').includes('魔王')) return 24;
    if ((name || '').includes('ドラゴン')) return 22;
    return 18;
  }

  window.MobShotSpawn = {
    spawnEnemy,
    spawnGimmick,
    spawnChest,
    spawnGatePair,
    spawnMidBoss,
    spawnBoss
  };
})();
