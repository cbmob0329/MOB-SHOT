'use strict';

(function(){
  function canonicalBossName(name){
    const raw = String(name || '').trim();

    if (raw === '番人') return 'モブガーディアン';
    if (raw === '番人Ⅱ') return 'モブガーディアンⅡ';
    if (raw === '番人II') return 'モブガーディアンⅡ';

    return raw;
  }

  const BOSS_IMAGE_BY_NAME = {
    'ホークモブ': 'boss/hawks.png',
    'ミラモブ': 'boss/miraboss.png',
    'モブガーディアン': 'boss/bossban.png',
    'モブガーディアンⅡ': 'boss/bossban2.png',
    'モブガーディアンII': 'boss/bossban2.png',
    'ネオンモブ': 'boss/bossneon.png',
    'ドラゴンモブ': 'boss/bossdragoon.png',
    'ドラゴンモブⅡ': 'boss/bossdragoon2.png',
    'ドラゴンモブII': 'boss/bossdragoon2.png',
    'モブリリス': 'boss/bossriris.png',
    'ホークモブⅡ': 'boss/hawks2.png',
    'ホークモブII': 'boss/hawks2.png',
    'ミラモブⅡ': 'boss/bossmira2.png',
    'ミラモブII': 'boss/bossmira2.png',
    'ネオンモブⅡ': 'boss/bossneon2.png',
    'ネオンモブII': 'boss/bossneon2.png',
    'モブ魔王': 'boss/bossmaoh.png',
    'モブメイル': 'boss/bossmeiru.png',
    'モブスミス': 'boss/bosssmith.png',
    'モブネプ': 'boss/bossmobnep.png',
    'ブルネオモブ': 'boss/bossneonblue.png',
    'パルネオモブ': 'boss/bossneonpur.png',
    '閻魔モブ': 'boss/bossenmob.png',
    'ウルモブリリス': 'boss/bossulriri.png'
  };

  const BOSS_TYPE_BY_NAME = {
    'ホークモブ': 'hawk',
    'ホークモブⅡ': 'hawk',
    'ホークモブII': 'hawk',
    'ミラモブ': 'mira',
    'ミラモブⅡ': 'mira',
    'ミラモブII': 'mira',
    'モブガーディアン': 'guardian',
    'モブガーディアンⅡ': 'guardian',
    'モブガーディアンII': 'guardian',
    'ネオンモブ': 'neon',
    'ネオンモブⅡ': 'neon',
    'ネオンモブII': 'neon',
    'ドラゴンモブ': 'dragon',
    'ドラゴンモブⅡ': 'dragon',
    'ドラゴンモブII': 'dragon',
    'モブリリス': 'lilith',
    'ウルモブリリス': 'ultraLilith',
    'モブ魔王': 'maoh',
    'モブメイル': 'mail',
    'モブスミス': 'smith',
    'モブネプ': 'nep',
    'ブルネオモブ': 'blueNeo',
    'パルネオモブ': 'purpleNeo',
    '閻魔モブ': 'enma'
  };

  const DIFFICULTY_BALANCE = {
    easy: {
      hpMulExtra: 0.76,
      minHp: 900,
      minFinalHp: 0,
      cdMul: 1.00,
      minShootCd: 52,
      minAttackCd: 98,
      contactMul: 0.85,
      weakEnemyMul: 0.70
    },
    hard: {
      hpMulExtra: 0.88,
      minHp: 1200,
      minFinalHp: 0,
      cdMul: 0.92,
      minShootCd: 46,
      minAttackCd: 90,
      contactMul: 0.92,
      weakEnemyMul: 0.82
    },
    veryHard: {
      hpMulExtra: 1.00,
      minHp: 1600,
      minFinalHp: 0,
      cdMul: 0.82,
      minShootCd: 42,
      minAttackCd: 82,
      contactMul: 1.00,
      weakEnemyMul: 1.00
    },
    inferno: {
      hpMulExtra: 1.10,
      minHp: 3000,
      minFinalHp: 0,
      cdMul: 0.66,
      minShootCd: 34,
      minAttackCd: 66,
      contactMul: 1.25,
      weakEnemyMul: 1.25
    },
    legend: {
      hpMulExtra: 1.25,
      minHp: 5200,
      minFinalHp: 8500,
      cdMul: 0.52,
      minShootCd: 28,
      minAttackCd: 54,
      contactMul: 1.55,
      weakEnemyMul: 1.55
    }
  };

  function normalizeName(name){
    return canonicalBossName(name)
      .replace(/\s/g, '')
      .replace(/　/g, '')
      .replace(/Ⅱ/g, 'II')
      .replace(/Ⅲ/g, 'III')
      .replace(/Ⅰ/g, 'I')
      .replace(/２/g, '2')
      .replace(/１/g, '1')
      .toLowerCase();
  }

  function bossNameMatch(a, b){
    return normalizeName(a) === normalizeName(b);
  }

  function bossImageFromName(name){
    const raw = canonicalBossName(name).replace(/\s/g, '').replace(/　/g, '');

    if (BOSS_IMAGE_BY_NAME[raw]) return BOSS_IMAGE_BY_NAME[raw];

    const normalized = normalizeName(raw);

    for (const key in BOSS_IMAGE_BY_NAME) {
      if (normalizeName(key) === normalized) {
        return BOSS_IMAGE_BY_NAME[key];
      }
    }

    return '';
  }

  function typeFromName(name){
    const raw = canonicalBossName(name).replace(/\s/g, '').replace(/　/g, '');

    if (BOSS_TYPE_BY_NAME[raw]) return BOSS_TYPE_BY_NAME[raw];

    const normalized = normalizeName(raw);

    for (const key in BOSS_TYPE_BY_NAME) {
      if (normalizeName(key) === normalized) {
        return BOSS_TYPE_BY_NAME[key];
      }
    }

    if (normalized.includes('ミラ')) return 'mira';
    if (normalized.includes('ガーディアン')) return 'guardian';
    if (normalized.includes('ネオン')) return 'neon';
    if (normalized.includes('ドラゴン')) return 'dragon';
    if (normalized.includes('ウル') && normalized.includes('リリス')) return 'ultraLilith';
    if (normalized.includes('リリス')) return 'lilith';
    if (normalized.includes('魔王')) return 'maoh';
    if (normalized.includes('メイル') || normalized.includes('メール')) return 'mail';
    if (normalized.includes('スミス')) return 'smith';
    if (normalized.includes('ネプ')) return 'nep';
    if (normalized.includes('閻魔') || normalized.includes('エンマ')) return 'enma';
    if (normalized.includes('ホーク')) return 'hawk';

    return 'hawk';
  }

  function normalizeDifficultyKey(diff){
    const raw = typeof diff === 'string' ? diff : diff && diff.key;
    const key = String(raw || '').trim();

    if (key === 'イージー') return 'easy';
    if (key === 'ハード') return 'hard';
    if (key === 'ベリーハード') return 'veryHard';
    if (key === 'インフェルノ') return 'inferno';
    if (key === 'レジェンド') return 'legend';

    if (key === 'easy') return 'easy';
    if (key === 'hard') return 'hard';
    if (key === 'veryHard') return 'veryHard';
    if (key === 'veryhard') return 'veryHard';
    if (key === 'inferno') return 'inferno';
    if (key === 'legend') return 'legend';

    return 'veryHard';
  }

  function getDifficultyBalance(diff){
    const key = normalizeDifficultyKey(diff);
    return DIFFICULTY_BALANCE[key] || DIFFICULTY_BALANCE.veryHard;
  }

  function getStageAreaData(areaKey){
    const areaData = window.MOBSHOT_STAGE_DATA || {};
    return areaData[areaKey] || null;
  }

  function cloneCore(core, obj){
    if (core && core.clone) return core.clone(obj);
    return JSON.parse(JSON.stringify(obj));
  }

  function bossDataConfig(name){
    if (
      window.MobShotBossData &&
      window.MobShotBossData.getBossConfig
    ) {
      return window.MobShotBossData.getBossConfig(name) || null;
    }

    return null;
  }

  function createBarrierState(){
    return {
      barrierTimer: 0,
      barrierHp: 0,
      barrierMaxHp: 0,
      barrierLabel: 'バリア',
      barrierColor: '#9deeff',
      barrierGaugeVisible: true,

      frontBarrierTimer: 0,
      frontBarrierHp: 0,
      frontBarrierMaxHp: 0,
      frontBarrierLabel: '前面バリア',
      frontBarrierColor: '#ffcf5b',
      frontBarrierGaugeVisible: true,

      circleBarrierTimer: 0,
      circleBarrierHp: 0,
      circleBarrierMaxHp: 0,
      circleBarrierLabel: '円形バリア',
      circleBarrierColor: '#ff4aff',
      circleBarrierGaugeVisible: true
    };
  }

  function fixBossDef(def, fallbackName){
    def = def || {};

    const fixedName = canonicalBossName(def.name || fallbackName || 'ホークモブ');
    const dataConfig = bossDataConfig(fixedName) || {};
    const type = def.type || dataConfig.type || typeFromName(fixedName);
    const image = def.image || bossImageFromName(fixedName);

    return Object.assign({}, def, {
      name: fixedName,
      image,
      type,
      hp: Number(def.hp || dataConfig.hp || 520),
      score: Number(def.score || dataConfig.score || 1000),
      coin: Number(def.coin || dataConfig.coin || 100),
      shootCd: Number(def.shootCd || dataConfig.shootCd || 130),
      attackCd: Number(def.attackCd || dataConfig.attackCd || 220),
      moveSpeed: Number(def.moveSpeed || dataConfig.moveSpeed || 1.25),
      contactDmg: Number(def.contactDmg || dataConfig.contactDmg || 18),
      spawnWeakEnemies: dataConfig.spawnWeakEnemies !== false,
      specialHpMul: Number(dataConfig.specialHpMul || 1.65)
    });
  }

  function allBossCandidates(core){
    const list = [];
    const areaData = window.MOBSHOT_STAGE_DATA || {};

    Object.keys(areaData).forEach(key => {
      const area = areaData[key];
      if (!area) return;

      ['boss', 'boss2', 'bossA', 'bossB', 'strongBoss', 'legendBoss'].forEach(prop => {
        if (area[prop]) list.push(fixBossDef(cloneCore(core, area[prop])));
      });

      ['bosses', 'extraBosses', 'bossList', 'doubleBosses'].forEach(prop => {
        if (Array.isArray(area[prop])) {
          area[prop].forEach(boss => {
            if (boss) list.push(fixBossDef(cloneCore(core, boss)));
          });
        }
      });
    });

    if (core.D && core.D.enemies) {
      if (core.D.enemies.boss) list.push(fixBossDef(cloneCore(core, core.D.enemies.boss)));

      if (Array.isArray(core.D.enemies.bosses)) {
        core.D.enemies.bosses.forEach(boss => {
          if (boss) list.push(fixBossDef(cloneCore(core, boss)));
        });
      }

      if (Array.isArray(core.D.enemies.midBoss)) {
        core.D.enemies.midBoss.forEach(boss => {
          if (boss) list.push(fixBossDef(cloneCore(core, boss)));
        });
      }
    }

    return list;
  }

  function getBossDefByName(core, area, bossName){
    const name = canonicalBossName(bossName || '');

    if (area) {
      const areaCandidates = [];

      ['boss', 'boss2', 'bossA', 'bossB', 'strongBoss', 'legendBoss'].forEach(prop => {
        if (area[prop]) areaCandidates.push(fixBossDef(cloneCore(core, area[prop])));
      });

      ['bosses', 'extraBosses', 'bossList', 'doubleBosses'].forEach(prop => {
        if (Array.isArray(area[prop])) {
          area[prop].forEach(boss => {
            if (boss) areaCandidates.push(fixBossDef(cloneCore(core, boss)));
          });
        }
      });

      const exact = areaCandidates.find(boss => bossNameMatch(boss.name, name));
      if (exact) return fixBossDef(exact, name);
    }

    const all = allBossCandidates(core);
    const found = all.find(boss => bossNameMatch(boss.name, name));

    if (found) return fixBossDef(found, name);

    return getFallbackBossDef(name);
  }

  function getFallbackBossDef(name){
    name = canonicalBossName(name);
    const type = typeFromName(name);
    const image = bossImageFromName(name);
    const dataConfig = bossDataConfig(name) || {};

    return {
      name: name || 'ホークモブ',
      image,
      hp:
        type === 'ultraLilith' ? 1400 :
        type === 'enma' ? 1200 :
        type === 'maoh' ? 1050 :
        type === 'nep' ? 950 :
        type === 'smith' ? 850 :
        type === 'mail' ? 900 :
        type === 'dragon' ? 820 :
        type === 'lilith' ? 780 :
        type === 'guardian' ? 720 :
        type === 'neon' ? 680 :
        type === 'mira' ? 560 :
        520,
      score:
        type === 'ultraLilith' ? 4500 :
        type === 'enma' ? 3800 :
        type === 'maoh' ? 3200 :
        type === 'nep' ? 2600 :
        2200,
      coin:
        type === 'ultraLilith' ? 700 :
        type === 'enma' ? 600 :
        type === 'maoh' ? 420 :
        260,
      type: dataConfig.type || type,
      shootCd: Number(
        dataConfig.shootCd ||
        (
          type === 'ultraLilith' || type === 'enma'
            ? 105
            : type === 'neon' || type === 'smith'
              ? 112
              : 130
        )
      ),
      attackCd: Number(
        dataConfig.attackCd ||
        (
          type === 'ultraLilith' || type === 'enma'
            ? 170
            : type === 'maoh' || type === 'lilith'
              ? 190
              : 220
        )
      ),
      moveSpeed: Number(
        dataConfig.moveSpeed ||
        (
          type === 'guardian' || type === 'mail'
            ? 0.95
            : 1.25
        )
      ),
      contactDmg:
        type === 'ultraLilith' || type === 'enma'
          ? 28
          : type === 'maoh'
            ? 24
            : 18,
      spawnWeakEnemies: dataConfig.spawnWeakEnemies !== false,
      specialHpMul: Number(dataConfig.specialHpMul || 1.65)
    };
  }

  function skillFlash(core, text, x, y, color, life){
    core.state.texts.push({
      text,
      x,
      y,
      color,
      life: life || 60,
      big: true
    });
  }

  function doubleBossEntranceEffect(core){
    const cx = core.W / 2;
    const cy = core.H * 0.24;

    for (let i = 0; i < 90; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 1.5 + Math.random() * 7;

      core.state.particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        color: i % 2 ? '#ff5bff' : '#6be6ff',
        life: core.intRand(34, 72)
      });
    }

    skillFlash(core, 'DOUBLE BOSS!!', cx, cy - 25, '#ffffff', 84);
  }

  function spawnDoubleBosses(core, stage, diff){
    stage = stage || {};
    diff = diff || {};

    stage.bossA = canonicalBossName(stage.bossA);
    stage.bossB = canonicalBossName(stage.bossB);

    const area = getStageAreaData(stage.areaKey);
    const bossA = getBossDefByName(core, area, stage.bossA);
    const bossB = getBossDefByName(core, area, stage.bossB);

    spawnDoubleBossEntity(core, bossA, diff, stage, 0);
    spawnDoubleBossEntity(core, bossB, diff, stage, 1);

    core.state.eventMode.doubleSpawned = true;
    core.showBanner('2体同時出現！');
  }

  function spawnDoubleBossEntity(core, def, diff, stage, side){
    def = fixBossDef(def);

    const balance = getDifficultyBalance(diff);
    const hpMul = Number(diff.hpMul || 1.35) * Number(balance.hpMulExtra || 1);
    const scoreMul = Number(diff.scoreMul || 1.25);

    const x = side === 0 ? core.W * 0.32 : core.W * 0.68;
    const targetY = core.H * 0.22 + side * 18;

    const baseHp = Number(def.hp || 300);
    const minHp = stage && stage.final
      ? Math.max(Number(balance.minFinalHp || 0), Number(balance.minHp || 0))
      : Number(balance.minHp || 0);

    const hp = Math.max(Math.ceil(baseHp * hpMul), minHp);

    const shootCd = Math.max(
      Number(balance.minShootCd || 30),
      Math.floor(Number(def.shootCd || 130) * Number(balance.cdMul || 1))
    );

    const attackCd = Math.max(
      Number(balance.minAttackCd || 60),
      Math.floor(Number(def.attackCd || 220) * Number(balance.cdMul || 1))
    );

    const e = Object.assign({
      kind: 'boss',
      name: canonicalBossName(def.name),
      image: def.image || bossImageFromName(def.name),
      x,
      y: -190 - side * 60,
      vx: (side === 0 ? 1 : -1) * Number(def.moveSpeed || 1.25),
      vy: 1.9,
      r: Number(def.r || 76),
      hp,
      maxHp: hp,
      score: Math.ceil(Number(def.score || 1000) * scoreMul),
      coin: Math.ceil(Number(def.coin || 100) * 0.25),
      type: def.type || typeFromName(def.name),
      shootCd,
      attackCd,
      targetY,
      baseY: targetY,
      contactDmg: Math.ceil(Number(def.contactDmg || 18) * Number(balance.contactMul || 1)),
      dead: false,
      bob: core.rand(0, Math.PI * 2),
      __doubleBoss: true,
      __doubleSide: side,
      __doubleCounted: false,
      __doubleDifficulty: diff ? diff.key : '',
      __doubleStageId: stage ? stage.id : 0,
      eventDifficulty: diff ? diff.key : '',
      spawnWeakEnemies: def.spawnWeakEnemies !== false,
      specialHpMul: Number(def.specialHpMul || 1.65)
    }, createBarrierState());

    core.state.entities.push(e);

    for (let i = 0; i < 42; i++) {
      core.state.particles.push({
        x,
        y: targetY,
        vx: core.rand(-5, 5),
        vy: core.rand(-6, 3),
        color: side === 0 ? '#ffe66b' : '#6be6ff',
        life: core.intRand(28, 58)
      });
    }

    core.addText(
      '出現!!',
      x,
      targetY - 86,
      side === 0 ? '#ffe66b' : '#6be6ff'
    );

    return e;
  }

  function spawnBossEntity(core, def, opt){
    opt = opt || {};
    def = fixBossDef(def);

    const x = opt.x != null ? opt.x : core.W * 0.5;
    const targetY = opt.targetY != null ? opt.targetY : core.H * 0.22;
    const hpMul = Number(opt.hpMul || 1);
    const hp = Math.max(1, Math.ceil(Number(def.hp || 520) * hpMul));

    const e = Object.assign({
      kind: 'boss',
      name: canonicalBossName(def.name),
      image: def.image || bossImageFromName(def.name),
      x,
      y: opt.y != null ? opt.y : -190,
      vx: Number(opt.vx || def.moveSpeed || 1.25),
      vy: Number(opt.vy || 1.9),
      r: Number(opt.r || def.r || 76),
      hp,
      maxHp: hp,
      score: Number(opt.score || def.score || 1000),
      coin: Number(opt.coin || def.coin || 100),
      type: def.type || typeFromName(def.name),
      shootCd: Number(opt.shootCd || def.shootCd || 130),
      attackCd: Number(opt.attackCd || def.attackCd || 220),
      targetY,
      baseY: targetY,
      contactDmg: Number(opt.contactDmg || def.contactDmg || 18),
      dead: false,
      bob: core.rand(0, Math.PI * 2),
      eventDifficulty: opt.eventDifficulty || '',
      spawnWeakEnemies: def.spawnWeakEnemies !== false,
      specialHpMul: Number(def.specialHpMul || 1.65)
    }, createBarrierState());

    core.state.entities.push(e);
    core.addText('BOSS!!', x, targetY - 86, '#ffe66b');

    return e;
  }

  function bossDeathEffect(core, e){
    const color = e.__doubleSide === 0 ? '#ffe66b' : '#6be6ff';

    skillFlash(core, '撃破!!', e.x, e.y - 90, color, 70);

    for (let i = 0; i < 80; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 1.5 + Math.random() * 8;

      core.state.particles.push({
        x: e.x,
        y: e.y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        color: i % 2 ? color : '#ffffff',
        life: core.intRand(30, 80)
      });
    }
  }

  function doubleBossClearEffect(core){
    core.showBanner('DOUBLE BOSS CLEAR!');
    skillFlash(core, 'DOUBLE CLEAR!!', core.W / 2, core.H * 0.28, '#ffe66b', 90);

    for (let i = 0; i < 130; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 2 + Math.random() * 8;

      core.state.particles.push({
        x: core.W / 2,
        y: core.H * 0.28,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        color:
          i % 3 === 0
            ? '#ffe66b'
            : i % 3 === 1
              ? '#ff5bff'
              : '#6be6ff',
        life: core.intRand(36, 84)
      });
    }
  }

  function onEntityKilled(e, core){
    if (
      !core.isEventMode('doubleBoss') ||
      !e ||
      e.kind !== 'boss' ||
      !e.__doubleBoss ||
      e.__doubleCounted
    ) {
      return;
    }

    e.name = canonicalBossName(e.name);
    e.__doubleCounted = true;
    core.state.eventMode.doubleKilled = Number(core.state.eventMode.doubleKilled || 0) + 1;

    bossDeathEffect(core, e);

    if (window.MobShotMission && window.MobShotMission.onEventBossKilled) {
      window.MobShotMission.onEventBossKilled({
        eventKey: 'doubleBoss',
        bossName: e.name,
        difficulty: e.__doubleDifficulty || '',
        stageId: Number(e.__doubleStageId || 0)
      });
    }
  }

  window.MobShotGameBossManager = {
    BOSS_IMAGE_BY_NAME,
    BOSS_TYPE_BY_NAME,
    DIFFICULTY_BALANCE,

    canonicalBossName,
    normalizeName,
    bossNameMatch,
    bossImageFromName,
    typeFromName,
    normalizeDifficultyKey,
    getDifficultyBalance,

    getStageAreaData,
    allBossCandidates,
    getBossDefByName,
    getFallbackBossDef,

    createBarrierState,

    doubleBossEntranceEffect,
    skillFlash,
    spawnDoubleBosses,
    spawnDoubleBossEntity,
    spawnBossEntity,
    bossDeathEffect,
    doubleBossClearEffect,
    onEntityKilled
  };
})();
