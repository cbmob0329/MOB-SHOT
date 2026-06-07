'use strict';

(function(){
  function spawnEnemy(tools){
    const state = tools.state;
    const D = tools.D;
    const flow = tools.flow;
    const W = tools.W;
    const rand = tools.rand;
    const pick = tools.pick;

    const def = pick(D.enemies.zako);
    const scale = 1 + flow.area * 0.08;

    state.entities.push({
      kind: 'enemy',
      name: def.name,
      image: def.image,
      x: rand(W * 0.18, W * 0.82),
      y: -78,
      vx: rand(-0.85, 0.85),
      vy: 2.15 + flow.area * 0.08,
      r: def.name === 'モブロック' ? 34 : 31,
      hp: Math.ceil(def.hp * scale),
      maxHp: Math.ceil(def.hp * scale),
      score: def.score,
      coinMin: def.coinMin,
      coinMax: def.coinMax,
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

    const def = pick(D.gimmicks);
    const scale = 1 + flow.area * 0.1;

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
      hp: Math.ceil(def.hp * scale),
      maxHp: Math.ceil(def.hp * scale),
      score: def.score,
      coinMin: def.coinMin,
      coinMax: def.coinMax,
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
      hp: def.hp,
      maxHp: def.hp,
      score: def.score,
      coinMin: def.coinMin,
      coinMax: def.coinMax,
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
    const pick = tools.pick;

    const def = pick(D.enemies.midBoss);
    const hp = Math.ceil(def.hp * (flow.midBoss === 2 ? 1.35 : 1));

    state.entities.push({
      kind: 'midBoss',
      name: def.name,
      image: def.image,
      x: W / 2,
      y: -150,
      baseY: H * 0.25,
      targetY: H * 0.25,
      vx: 1.45,
      vy: 2.35,
      r: 64,
      hp,
      maxHp: hp,
      score: def.score,
      coin: def.coin,
      dead: false,
      shootCd: 80,
      attackCd: 120,
      diveMode: false,
      diveReturn: false,
      diveVx: 0,
      diveVy: 0,
      contactDmg: 13,
      hitPlayerCd: 0,
      bob: 0
    });
  }

  function spawnBoss(tools){
    const state = tools.state;
    const D = tools.D;
    const W = tools.W;
    const H = tools.H;

    const def = D.enemies.boss;

    state.entities.push({
      kind: 'boss',
      name: def.name,
      image: def.image,
      x: W / 2,
      y: -240,
      baseY: H * 0.21,
      targetY: H * 0.21,
      vx: 1.55,
      vy: 1.6,
      r: 106,
      hp: def.hp,
      maxHp: def.hp,
      score: def.score,
      coin: def.coin,
      dead: false,
      shootCd: 50,
      attackCd: 95,
      attackStep: 0,
      contactDmg: 18,
      bob: 0
    });
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
