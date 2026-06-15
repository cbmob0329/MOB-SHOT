'use strict';

(function(){
  const BOSS_IMAGE_BY_NAME = {
    'ホークモブ': 'boss/hawks.png',
    'ミラモブ': 'boss/miraboss.png',
    'モブガーディアン': 'boss/bossban.png',
    '番人': 'boss/bossban.png',
    'ネオンモブ': 'boss/bossneon.png',
    'ドラゴンモブ': 'boss/bossdragoon.png',
    'ドラゴンモブⅡ': 'boss/bossdragoon2.png',
    'ドラゴンモブII': 'boss/bossdragoon2.png',
    'モブリリス': 'boss/bossriris.png',
    'ホークモブⅡ': 'boss/hawks2.png',
    'ホークモブII': 'boss/hawks2.png',
    'ミラモブⅡ': 'boss/bossmira2.png',
    'ミラモブII': 'boss/bossmira2.png',
    '番人Ⅱ': 'boss/bossban2.png',
    '番人II': 'boss/bossban2.png',
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
    '番人': 'guardian',
    '番人Ⅱ': 'guardian',
    '番人II': 'guardian',
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
    veryHard: {
      hpMulExtra: 1.00,
      minHp: 1600,
      minFinalHp: 0,
      cdMul: 0.82,
      minShootCd: 42,
      minAttackCd: 82,
      contactMul: 1.00
    },
    inferno: {
      hpMulExtra: 1.10,
      minHp: 3000,
      minFinalHp: 0,
      cdMul: 0.66,
      minShootCd: 34,
      minAttackCd: 66,
      contactMul: 1.25
    },
    legend: {
      hpMulExtra: 1.25,
      minHp: 5200,
      minFinalHp: 8500,
      cdMul: 0.52,
      minShootCd: 28,
      minAttackCd: 54,
      contactMul: 1.55
    }
  };

  function normalizeName(name){
    return String(name || '')
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
    const raw = String(name || '').replace(/\s/g, '').replace(/　/g, '');

    if (BOSS_IMAGE_BY_NAME[raw]) {
      return BOSS_IMAGE_BY_NAME[raw];
    }

    const normalized = normalizeName(raw);

    for (const key in BOSS_IMAGE_BY_NAME) {
      if (normalizeName(key) === normalized) {
        return BOSS_IMAGE_BY_NAME[key];
      }
    }

    return '';
  }

  function typeFromName(name){
    const raw = String(name || '').replace(/\s/g, '').replace(/　/g, '');

    if (BOSS_TYPE_BY_NAME[raw]) {
      return BOSS_TYPE_BY_NAME[raw];
    }

    const normalized = normalizeName(raw);

    for (const key in BOSS_TYPE_BY_NAME) {
      if (normalizeName(key) === normalized) {
        return BOSS_TYPE_BY_NAME[key];
      }
    }

    if (normalized.includes('ミラ')) return 'mira';
    if (normalized.includes('ガーディアン') || normalized.includes('番人')) return 'guardian';
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

  function getDifficultyBalance(diff){
    const key = typeof diff === 'string' ? diff : diff && diff.key;
    return DIFFICULTY_BALANCE[key] || DIFFICULTY_BALANCE.veryHard;
  }

  function getStageAreaData(areaKey){
    const areaData = window.MOBSHOT_STAGE_DATA || {};
    return areaData[areaKey] || null;
  }

  function allBossCandidates(core){
    const list = [];
    const areaData = window.MOBSHOT_STAGE_DATA || {};

    Object.keys(areaData).forEach(key => {
      const area = areaData[key];

      [
        'boss',
        'boss2',
        'bossA',
        'bossB',
        'strongBoss',
        'legendBoss'
      ].forEach(prop => {
        if (area && area[prop]) {
          list.push(core.clone(area[prop]));
        }
      });

      [
        'bosses',
        'extraBosses',
        'bossList',
        'doubleBosses'
      ].forEach(prop => {
        if (area && Array.isArray(area[prop])) {
          area[prop].forEach(boss => {
            if (boss) {
              list.push(core.clone(boss));
            }
          });
        }
      });
    });

    if (core.D && core.D.enemies) {
      if (core.D.enemies.boss) {
        list.push(core.clone(core.D.enemies.boss));
      }

      if (Array.isArray(core.D.enemies.bosses)) {
        core.D.enemies.bosses.forEach(boss => {
          list.push(core.clone(boss));
        });
      }

      if (Array.isArray(core.D.enemies.midBoss)) {
        core.D.enemies.midBoss.forEach(boss => {
          list.push(core.clone(boss));
        });
      }
    }

    return list;
  }

  function getBossDefByName(core, area, bossName){
    const name = String(bossName || '');

    if (area) {
      const areaCandidates = [];

      [
        'boss',
        'boss2',
        'bossA',
        'bossB',
        'strongBoss',
        'legendBoss'
      ].forEach(prop => {
        if (area[prop]) {
          areaCandidates.push(core.clone(area[prop]));
        }
      });

      [
        'bosses',
        'extraBosses',
        'bossList',
        'doubleBosses'
      ].forEach(prop => {
        if (Array.isArray(area[prop])) {
          area[prop].forEach(boss => {
            if (boss) {
              areaCandidates.push(core.clone(boss));
            }
          });
        }
      });

      const exact = areaCandidates.find(boss => bossNameMatch(boss.name, name));

      if (exact) {
        exact.image = exact.image || bossImageFromName(name);
        exact.type = exact.type || typeFromName(name);
        exact.name = exact.name || name;
        return exact;
      }
    }

    const all = allBossCandidates(core);
    const found = all.find(boss => bossNameMatch(boss.name, name));

    if (found) {
      found.image = found.image || bossImageFromName(name);
      found.type = found.type || typeFromName(name);
      found.name = found.name || name;
      return found;
    }

    return getFallbackBossDef(name);
  }

  function getFallbackBossDef(name){
    const type = typeFromName(name);
    const image = bossImageFromName(name);

    return {
      name: name || 'BOSS',
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
      type,
      shootCd:
        type === 'ultraLilith' || type === 'enma'
          ? 105
          : type === 'neon' || type === 'smith'
            ? 112
            : 130,
      attackCd:
        type === 'ultraLilith' || type === 'enma'
          ? 170
          : type === 'maoh' || type === 'lilith'
            ? 190
            : 220,
      moveSpeed:
        type === 'guardian' || type === 'mail'
          ? 0.95
          : 1.25,
      contactDmg:
        type === 'ultraLilith' || type === 'enma'
          ? 28
          : type === 'maoh'
            ? 24
            : 18
    };
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

  function spawnDoubleBosses(core, stage, diff){
    const area = getStageAreaData(stage.areaKey);
    const bossA = getBossDefByName(core, area, stage.bossA);
    const bossB = getBossDefByName(core, area, stage.bossB);

    spawnDoubleBossEntity(core, bossA, diff, stage, 0);
    spawnDoubleBossEntity(core, bossB, diff, stage, 1);

    core.state.eventMode.doubleSpawned = true;

    core.showBanner('2体同時出現！');
  }

  function spawnDoubleBossEntity(core, def, diff, stage, side){
    const balance = getDifficultyBalance(diff);
    const hpMul = Number(diff.hpMul || 1.35) * Number(balance.hpMulExtra || 1);
    const scoreMul = Number(diff.scoreMul || 1.25);

    const x = side === 0 ? core.W * 0.32 : core.W * 0.68;
    const targetY = core.H * 0.22 + side * 18;

    const baseHp = Number(def.hp || 300);
    const minHp = stage && stage.final
      ? Math.max(Number(balance.minFinalHp || 0), Number(balance.minHp || 0))
      : Number(balance.minHp || 0);

    const hp = Math.max(
      Math.ceil(baseHp * hpMul),
      minHp
    );

    const baseShootCd = Number(def.shootCd || 130);
    const baseAttackCd = Number(def.attackCd || 220);

    const shootCd = Math.max(
      Number(balance.minShootCd || 30),
      Math.floor(baseShootCd * Number(balance.cdMul || 1))
    );

    const attackCd = Math.max(
      Number(balance.minAttackCd || 60),
      Math.floor(baseAttackCd * Number(balance.cdMul || 1))
    );

    const e = {
      kind: 'boss',
      name: def.name,
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
      __doubleStageId: stage ? stage.id : 0
    };

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

    normalizeName,
    bossNameMatch,
    bossImageFromName,
    typeFromName,
    getDifficultyBalance,

    getStageAreaData,
    allBossCandidates,
    getBossDefByName,
    getFallbackBossDef,

    doubleBossEntranceEffect,
    spawnDoubleBosses,
    spawnDoubleBossEntity,
    bossDeathEffect,
    doubleBossClearEffect,
    onEntityKilled
  };
})();
