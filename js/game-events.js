'use strict';

(function(){
  let active = false;
  let eventData = null;
  let eventType = '';
  let difficultyKey = '';
  let stageId = 0;

  let localFrame = 0;
  let nextEnemyAt = 0;
  let nextChestAt = 0;
  let nextGimmickAt = 0;
  let spawnedBoss = false;
  let scoreAttackIndex = 0;
  let finishBonusApplied = false;

  let questInfo = null;
  let questPhase = 0;
  let questKills = 0;
  let questBossSpawned = false;
  let questWaveSpawned = false;

  const SCORE_ATTACK_BOSSES = [
    { name:'ホークモブ', image:'boss/hawks.png', hp:600, score:1000, coin:200 },
    { name:'ミラモブ', image:'boss/miraboss.png', hp:800, score:1300, coin:260 },
    { name:'番人', image:'boss/bossban.png', hp:1100, score:1600, coin:320 },
    { name:'ネオンモブ', image:'boss/bossneon.png', hp:1500, score:2200, coin:440 },
    { name:'ドラゴンモブ', image:'boss/bossdragoon.png', hp:2100, score:3000, coin:600 },
    { name:'モブリリス', image:'boss/bossriris.png', hp:2800, score:4200, coin:840 },
    { name:'モブ魔王', image:'boss/bossmaoh.png', hp:3800, score:6000, coin:1200 },
    { name:'ウルモブリリス', image:'boss/bossulriri.png', hp:5200, score:9000, coin:1800 }
  ];

  const QUEST_FALLBACK = {
    ptera:{ name:'モブプテラ', image:'en/enpte.png', hp:80, score:300, coin:30 },
    mira:{ name:'ミラモブ', image:'boss/miraboss.png', hp:300, score:1300, coin:160 },
    ban:{ name:'番人', image:'boss/bossban.png', hp:390, score:1600, coin:200 },
    ghidora:{ name:'モブギドラ', image:'en/neongidra.png', hp:220, score:800, coin:80 },
    dragon:{ name:'ドラゴンモブ', image:'boss/bossdragoon.png', hp:660, score:2600, coin:340 },
    magmaMid:{ name:'マグモブレム', image:'en/enmaggolem.png', hp:300, score:1050, coin:110 },
    lilith:{ name:'モブリリス', image:'boss/bossriris.png', hp:820, score:3200, coin:420 }
  };

  function clone(obj){
    return JSON.parse(JSON.stringify(obj));
  }

  function rand(a, b){
    return a + Math.random() * (b - a);
  }

  function intRand(a, b){
    return Math.floor(rand(a, b + 1));
  }

  function pick(arr){
    return arr && arr.length ? arr[Math.floor(Math.random() * arr.length)] : null;
  }

  function normalizeName(name){
    return String(name || '').replace(/\s/g, '').replace(/　/g, '').replace(/Ⅱ/g, 'II').toLowerCase();
  }

  function sameName(a, b){
    return normalizeName(a) === normalizeName(b);
  }

  function getEvent(){
    if (!window.MobShotEvents || !window.MobShotEvents.getCurrentEvent) return null;
    return window.MobShotEvents.getCurrentEvent();
  }

  function getGoldDifficulty(){
    if (window.MobShotEvents && window.MobShotEvents.getCurrentGoldDifficulty) {
      return window.MobShotEvents.getCurrentGoldDifficulty();
    }

    return {
      key:'easy',
      name:'イージー',
      color:'#9dff73',
      clearCoin:300,
      firstCoin:3000,
      firstDiamond:5,
      chestMul:1,
      bossHpMul:1,
      bossCoinMul:1,
      bosses:['ホークモブ','ミラモブ'],
      enemySpawn:true
    };
  }

  function getDoubleInfo(){
    if (window.MobShotEvents && window.MobShotEvents.getCurrentDoubleBoss) {
      return window.MobShotEvents.getCurrentDoubleBoss();
    }

    return {
      difficulty:{ key:'veryHard', name:'ベリーハード', color:'#ffcf5b', hpMul:1.35, scoreMul:1.25, firstCoin:5000, firstDiamond:5 },
      stage:{ id:1, areaKey:'grass', areaName:'草原', title:'草原', bossA:'ホークモブ', bossB:'ミラモブ' }
    };
  }

  function getQuestInfo(){
    if (window.MobShotEvents && window.MobShotEvents.getCurrentQuest) {
      return window.MobShotEvents.getCurrentQuest();
    }

    return {
      difficulty:{ key:'easy', name:'イージー', color:'#9dff73', hpMul:0.85, scoreMul:1, coinMul:0.8, enemyHpMul:0.8, cost:5000 },
      stage:{ id:1, key:'pterarush', title:'プテラッシュ', areaKey:'grass', areaName:'草原', background:'sta/backsougen.png' }
    };
  }

  function getSave(){
    if (window.MobShotStorage && window.MobShotStorage.load) {
      return window.MobShotStorage.load();
    }

    try {
      return JSON.parse(localStorage.getItem('mobshot_split_v1')) || {};
    } catch(e) {
      return {};
    }
  }

  function saveMainData(save){
    if (window.MobShotStorage && window.MobShotStorage.save) {
      window.MobShotStorage.save(save);
      return;
    }

    try {
      localStorage.setItem('mobshot_split_v1', JSON.stringify(save));
    } catch(e) {}
  }

  function addDiamond(amount){
    const add = Number(amount || 0);
    if (add <= 0) return;

    const save = getSave();
    save.diamond = Number(save.diamond || 0) + add;
    saveMainData(save);
  }

  function stageAreaData(areaKey){
    const stageData = window.MOBSHOT_STAGE_DATA || {};
    return stageData[areaKey] || null;
  }

  function eventEnemyPowerMul(key){
    if (key === 'easy') return 1;
    if (key === 'hard') return 2.4;
    if (key === 'veryHard') return 5.5;
    if (key === 'inferno') return 11;
    if (key === 'legend') return 22;
    return 1;
  }

  function questDifficultyPowerMul(key){
    if (key === 'easy') return 1;
    if (key === 'veryHard') return 6.5;
    if (key === 'legend') return 24;
    return 1;
  }

  function areaEnemyList(areaKey, api){
    const area = stageAreaData(areaKey);

    if (area && Array.isArray(area.zako)) return area.zako;
    if (area && area.enemies && Array.isArray(area.enemies.zako)) return area.enemies.zako;
    if (api.D && api.D.enemies && Array.isArray(api.D.enemies.zako)) return api.D.enemies.zako;

    return [];
  }

  function areaGimmickList(areaKey, api){
    const area = stageAreaData(areaKey);

    if (area && Array.isArray(area.gimmicks)) return area.gimmicks;
    if (api.D && Array.isArray(api.D.gimmicks)) return api.D.gimmicks;

    return [];
  }

  function areaChestList(areaKey, api){
    const area = stageAreaData(areaKey);

    if (area && Array.isArray(area.chests)) return area.chests;
    if (api.D && Array.isArray(api.D.chests)) return api.D.chests;

    return [];
  }

  function findBossDef(api, areaKey, name, fallback){
    const area = stageAreaData(areaKey);
    const candidates = [];

    if (area) {
      ['boss', 'strongBoss', 'legendBoss'].forEach(key => {
        if (area[key]) candidates.push(area[key]);
      });

      ['midBoss', 'midboss', 'middleBoss', 'bosses', 'extraBosses', 'bossList'].forEach(key => {
        if (Array.isArray(area[key])) {
          area[key].forEach(item => {
            if (item) candidates.push(item);
          });
        } else if (area[key]) {
          candidates.push(area[key]);
        }
      });
    }

    const allArea = window.MOBSHOT_STAGE_DATA || {};
    Object.keys(allArea).forEach(key => {
      const a = allArea[key];
      if (!a) return;

      ['boss', 'strongBoss', 'legendBoss'].forEach(prop => {
        if (a[prop]) candidates.push(a[prop]);
      });

      ['midBoss', 'midboss', 'middleBoss', 'bosses', 'extraBosses', 'bossList'].forEach(prop => {
        if (Array.isArray(a[prop])) {
          a[prop].forEach(item => {
            if (item) candidates.push(item);
          });
        } else if (a[prop]) {
          candidates.push(a[prop]);
        }
      });
    });

    const found = candidates.find(item => item && sameName(item.name, name));
    return clone(found || fallback || { name:name || 'BOSS', image:'boss/hawks.png', hp:1000, score:1000, coin:300 });
  }

  function getMidBossDef(api, areaKey, name, fallback){
    const area = stageAreaData(areaKey);
    const list = [];

    if (area) {
      ['midBoss', 'midboss', 'middleBoss'].forEach(key => {
        if (Array.isArray(area[key])) {
          area[key].forEach(item => {
            if (item) list.push(item);
          });
        } else if (area[key]) {
          list.push(area[key]);
        }
      });
    }

    const found = list.find(item => item && sameName(item.name, name));
    if (found) return clone(found);

    return findBossDef(api, areaKey, name, fallback);
  }

  function setStageVisual(api, title, background, areaKey, areaName){
    const D = api.D;

    if (!D || !D.stage) return;

    D.stage.id = title || 'EVENT';
    D.stage.name = title || 'EVENT';
    D.stage.areaName = areaName || title || 'EVENT';
    D.stage.areaType = areaKey || title || 'EVENT';
    D.stage.areaKey = areaKey || D.stage.areaKey;
    D.stage.difficulty = title || 'EVENT';

    if (background) {
      D.stage.background = background;
    }
  }

  function makeBossEntity(def, api, opt){
    const W = api.W;
    const H = api.H;
    const x = opt && opt.x != null ? opt.x : W / 2;
    const hpMul = opt && opt.hpMul != null ? opt.hpMul : 1;
    const scoreMul = opt && opt.scoreMul != null ? opt.scoreMul : 1;
    const coinMul = opt && opt.coinMul != null ? opt.coinMul : 1;
    const r = opt && opt.r != null ? opt.r : 112;
    const kind = opt && opt.kind ? opt.kind : 'boss';
    const hp = Math.ceil(Number(def.hp || 1000) * hpMul);
    const scale = opt && opt.scale != null ? Number(opt.scale) : 1;

    return {
      kind,
      name:def.name || 'BOSS',
      image:def.image || 'boss/hawks.png',
      x,
      y:opt && opt.y != null ? opt.y : -240,
      baseY:opt && opt.baseY != null ? opt.baseY : H * 0.21,
      targetY:opt && opt.targetY != null ? opt.targetY : H * 0.21,
      vx:opt && opt.vx != null ? opt.vx : 1.35,
      vy:opt && opt.vy != null ? opt.vy : 1.55,
      r,
      hp,
      maxHp:hp,
      score:Math.ceil(Number(def.score || 1000) * scoreMul),
      coin:Math.ceil(Number(def.coin || 100) * coinMul),
      dead:false,
      shootCd:opt && opt.shootCd != null ? opt.shootCd : 86,
      attackCd:opt && opt.attackCd != null ? opt.attackCd : 140,
      attackStep:0,
      contactDmg:opt && opt.contactDmg != null ? opt.contactDmg : 20,
      hitPlayerCd:0,
      bob:0,
      scale,
      drawScale:scale,
      sizeMul:scale,
      eventBoss:true,
      questBoss:!!(opt && opt.questBoss)
    };
  }

  function makeEnemyEntity(def, api, hpMul, coinMul){
    const W = api.W;
    const hp = Math.ceil(Number(def.hp || 5) * hpMul);

    return {
      kind:'enemy',
      name:def.name,
      image:def.image,
      x:rand(W * 0.18, W * 0.82),
      y:-78,
      vx:rand(-0.9, 0.9),
      vy:2.05 + rand(0, 0.45),
      r:31,
      hp,
      maxHp:hp,
      score:Math.ceil(Number(def.score || 10) * Math.max(1, hpMul * 0.35)),
      coinMin:Math.ceil(Number(def.coinMin || 1) * coinMul),
      coinMax:Math.ceil(Number(def.coinMax || 2) * coinMul),
      contactDmg:Math.max(1, Math.ceil(hp * 0.35)),
      dead:false,
      bob:rand(0, Math.PI * 2),
      aiType:'sway',
      canShoot:!!def.canShoot,
      baseShootCd:210,
      shootCd:210 + intRand(0, 70),
      burstShot:false,
      bulletLarge:false,
      bulletColor:'#ffcf5b',
      eventEnemy:true
    };
  }

  function makeChestEntity(def, api, hpMul, coinMul){
    const W = api.W;
    const hp = Math.ceil(Number(def.hp || 10) * hpMul);

    return {
      kind:'chest',
      name:def.name,
      image:def.image,
      x:rand(W * 0.2, W * 0.8),
      y:-76,
      vx:0,
      vy:2.0,
      w:64,
      h:58,
      hp,
      maxHp:hp,
      score:Math.ceil(Number(def.score || 80) * Math.max(1, hpMul * 0.25)),
      coinMin:Math.ceil(Number(def.coinMin || 10) * coinMul),
      coinMax:Math.ceil(Number(def.coinMax || 25) * coinMul),
      dead:false,
      bob:0
    };
  }

  function makeGimmickEntity(def, api, hpMul, coinMul){
    const W = api.W;
    const hp = Math.ceil(Number(def.hp || 10) * hpMul);

    return {
      kind:'gimmick',
      name:def.name,
      image:def.image,
      x:rand(W * 0.18, W * 0.82),
      y:-80,
      vx:0,
      vy:2.05,
      w:82,
      h:82,
      hp,
      maxHp:hp,
      score:Math.ceil(Number(def.score || 10) * Math.max(1, hpMul * 0.3)),
      coinMin:Math.ceil(Number(def.coinMin || 1) * coinMul),
      coinMax:Math.ceil(Number(def.coinMax || 2) * coinMul),
      contactDmg:Math.max(1, Math.ceil(hp * 0.32)),
      dead:false,
      bob:0
    };
  }

  function spawnAreaEnemy(api, areaKey, hpMul, coinMul){
    const def = pick(areaEnemyList(areaKey, api));
    if (!def) return;

    api.state.entities.push(makeEnemyEntity(def, api, hpMul, coinMul));
  }

  function spawnAreaGimmick(api, areaKey, hpMul, coinMul){
    const def = pick(areaGimmickList(areaKey, api));
    if (!def) return;

    api.state.entities.push(makeGimmickEntity(def, api, hpMul, coinMul));
  }

  function spawnAreaChest(api, areaKey, hpMul, coinMul){
    const def = pick(areaChestList(areaKey, api));
    if (!def) return;

    api.state.entities.push(makeChestEntity(def, api, hpMul, coinMul));
  }

  function spawnGoldBosses(api){
    if (spawnedBoss) return;

    const state = api.state;
    const W = api.W;
    const diff = getGoldDifficulty();
    const names = Array.isArray(diff.bosses) && diff.bosses.length ? diff.bosses.slice(0, 2) : ['ホークモブ', 'ミラモブ'];

    while (names.length < 2) {
      names.push(names[0] || 'ホークモブ');
    }

    const bosses = [
      findBossDef(api, '', names[0], { name:names[0], image:'boss/hawks.png', hp:600, score:1000, coin:200 }),
      findBossDef(api, '', names[1], { name:names[1], image:'boss/miraboss.png', hp:800, score:1300, coin:260 })
    ];

    const positions = [W * 0.34, W * 0.66];

    bosses.forEach((def, index) => {
      state.entities.push(makeBossEntity(def, api, {
        x:positions[index],
        hpMul:Number(diff.bossHpMul || 1),
        scoreMul:Number(diff.bossCoinMul || 1),
        coinMul:Number(diff.bossCoinMul || 1),
        vx:index === 0 ? 1.25 : -1.25,
        shootCd:74,
        attackCd:125,
        contactDmg:22,
        r:106
      }));
    });

    spawnedBoss = true;
  }

  function updateGold(api){
    const state = api.state;
    const D = api.D;
    const diff = getGoldDifficulty();
    const enemyPower = eventEnemyPowerMul(diff.key);

    localFrame++;

    if (localFrame === 1) {
      api.showBanner(`GOLD STAGE ${diff.name}`);
    }

    if (localFrame >= 40) {
      spawnGoldBosses(api);
    }

    if (localFrame >= nextEnemyAt) {
      if (diff.enemySpawn !== false && D.enemies && D.enemies.zako) {
        const def = pick(D.enemies.zako);
        if (def) {
          state.entities.push(makeEnemyEntity(
            def,
            api,
            Number(diff.bossHpMul || 1) * 0.35 * enemyPower,
            Number(diff.bossCoinMul || 1)
          ));
        }
      }

      nextEnemyAt = localFrame + intRand(
        diff.key === 'legend' ? 100 : diff.key === 'inferno' ? 125 : 170,
        diff.key === 'legend' ? 155 : diff.key === 'inferno' ? 195 : 250
      );
    }

    if (localFrame >= nextGimmickAt) {
      if (D.gimmicks && D.gimmicks.length) {
        const def = pick(D.gimmicks);
        if (def) {
          state.entities.push(makeGimmickEntity(
            def,
            api,
            Number(diff.bossHpMul || 1) * 0.45 * enemyPower,
            Number(diff.chestMul || 1)
          ));
        }
      }

      nextGimmickAt = localFrame + intRand(150, 230);
    }

    if (localFrame >= nextChestAt) {
      if (D.chests && D.chests.length && Math.random() < 0.55) {
        const def = pick(D.chests);
        if (def) {
          state.entities.push(makeChestEntity(
            def,
            api,
            Math.max(1, enemyPower * 0.45),
            Number(diff.chestMul || 1) * 3
          ));
        }
      }

      nextChestAt = localFrame + intRand(170, 260);
    }

    const bossAlive = state.entities.some(e => !e.dead && e.kind === 'boss');

    if (spawnedBoss && !bossAlive && localFrame > 120) {
      api.finishRun(true);
    }

    return true;
  }

  function spawnDoubleBosses(api){
    if (spawnedBoss) return;

    const info = getDoubleInfo();
    const diff = info.difficulty;
    const stage = info.stage;
    const W = api.W;
    const state = api.state;

    const bossA = findBossDef(api, stage.areaKey, stage.bossA);
    const bossB = findBossDef(api, stage.areaKey, stage.bossB, bossA);

    state.entities.push(makeBossEntity(bossA, api, {
      x:W * 0.34,
      hpMul:Number(diff.hpMul || 1),
      scoreMul:Number(diff.scoreMul || 1),
      coinMul:Number(diff.scoreMul || 1),
      vx:1.45,
      shootCd:68,
      attackCd:118,
      contactDmg:24
    }));

    state.entities.push(makeBossEntity(bossB, api, {
      x:W * 0.66,
      hpMul:Number(diff.hpMul || 1),
      scoreMul:Number(diff.scoreMul || 1),
      coinMul:Number(diff.scoreMul || 1),
      vx:-1.45,
      shootCd:68,
      attackCd:118,
      contactDmg:24
    }));

    spawnedBoss = true;
  }

  function updateDoubleBoss(api){
    const state = api.state;
    const info = getDoubleInfo();
    const diff = info.difficulty;
    const enemyPower = eventEnemyPowerMul(diff.key);

    localFrame++;

    if (localFrame === 1) {
      api.showBanner(`ダブルボス ${diff.name}`);
    }

    if (localFrame >= 60) {
      spawnDoubleBosses(api);
    }

    if (localFrame >= nextEnemyAt) {
      if (diff.key !== 'veryHard') {
        spawnAreaEnemy(api, info.stage.areaKey, Number(diff.hpMul || 1) * 0.4 * enemyPower, Number(diff.scoreMul || 1));
      }

      nextEnemyAt = localFrame + intRand(diff.key === 'legend' ? 105 : 145, diff.key === 'legend' ? 165 : 225);
    }

    const bossAlive = state.entities.some(e => !e.dead && e.kind === 'boss');

    if (spawnedBoss && !bossAlive && localFrame > 120) {
      api.finishRun(true);
    }

    return true;
  }

  function spawnScoreAttackBoss(api){
    const state = api.state;
    const W = api.W;
    const def = SCORE_ATTACK_BOSSES[scoreAttackIndex];

    if (!def) {
      api.finishRun(true);
      return;
    }

    const hpMul = 1 + scoreAttackIndex * 0.25;

    state.entities.push(makeBossEntity(def, api, {
      x:W / 2,
      hpMul,
      scoreMul:1 + scoreAttackIndex * 0.2,
      coinMul:1 + scoreAttackIndex * 0.15,
      vx:1.35 + scoreAttackIndex * 0.08,
      shootCd:Math.max(52, 82 - scoreAttackIndex * 3),
      attackCd:Math.max(96, 135 - scoreAttackIndex * 5),
      contactDmg:20 + scoreAttackIndex * 2
    }));

    api.showBanner(`${scoreAttackIndex + 1}. ${def.name}`);
    spawnedBoss = true;
  }

  function updateScoreAttack(api){
    const state = api.state;

    localFrame++;

    if (localFrame === 1) {
      api.showBanner('スコアアタック');
    }

    if (!spawnedBoss && localFrame > 60) {
      spawnScoreAttackBoss(api);
    }

    const bossAlive = state.entities.some(e => !e.dead && e.kind === 'boss');

    if (spawnedBoss && !bossAlive && localFrame > 90) {
      scoreAttackIndex++;
      spawnedBoss = false;
      localFrame = 40;

      if (scoreAttackIndex >= SCORE_ATTACK_BOSSES.length) {
        api.finishRun(true);
      }
    }

    return true;
  }

  function currentQuestDiff(){
    return questInfo && questInfo.difficulty ? questInfo.difficulty : getQuestInfo().difficulty;
  }

  function currentQuestStage(){
    return questInfo && questInfo.stage ? questInfo.stage : getQuestInfo().stage;
  }

  function questHpMul(extra){
    const diff = currentQuestDiff();
    return Number(diff.hpMul || 1) * Number(extra == null ? 1 : extra);
  }

  function questEnemyHpMul(extra){
    const diff = currentQuestDiff();
    return Number(diff.enemyHpMul || diff.hpMul || 1) * questDifficultyPowerMul(diff.key) * Number(extra == null ? 1 : extra);
  }

  function questScoreMul(extra){
    const diff = currentQuestDiff();
    return Number(diff.scoreMul || 1) * Number(extra == null ? 1 : extra);
  }

  function questCoinMul(extra){
    const diff = currentQuestDiff();
    return Number(diff.coinMul || 1) * Number(extra == null ? 1 : extra);
  }

  function activeQuestBossAlive(api){
    return api.state.entities.some(e => !e.dead && (e.kind === 'boss' || e.kind === 'midBoss') && e.questBoss);
  }

  function spawnQuestBossGroup(api, defs, opt){
    const W = api.W;
    const H = api.H;
    const count = defs.length;
    const margin = count <= 2 ? 0.32 : count <= 3 ? 0.24 : 0.14;
    const spanA = W * margin;
    const spanB = W * (1 - margin);

    defs.forEach((def, index) => {
      const t = count === 1 ? 0.5 : index / (count - 1);
      const x = spanA + (spanB - spanA) * t;
      const side = index % 2 === 0 ? 1 : -1;

      api.state.entities.push(makeBossEntity(def, api, {
        kind:opt && opt.kind ? opt.kind : 'midBoss',
        x,
        y:-170 - index * 24,
        baseY:H * 0.22 + index * 8,
        targetY:H * 0.22 + index * 8,
        hpMul:questHpMul(opt && opt.hpMul != null ? opt.hpMul : 1),
        scoreMul:questScoreMul(opt && opt.scoreMul != null ? opt.scoreMul : 1),
        coinMul:questCoinMul(opt && opt.coinMul != null ? opt.coinMul : 1),
        vx:side * Number(opt && opt.vx != null ? opt.vx : 1.15),
        shootCd:opt && opt.shootCd != null ? opt.shootCd : 92,
        attackCd:opt && opt.attackCd != null ? opt.attackCd : 145,
        contactDmg:opt && opt.contactDmg != null ? opt.contactDmg : 18,
        r:opt && opt.r != null ? opt.r : 78,
        scale:opt && opt.scale != null ? opt.scale : 1,
        questBoss:true
      }));
    });
  }

  function updateQuestFieldSpawns(api, areaKey, opt){
    const enemyInterval = opt && opt.enemyInterval ? opt.enemyInterval : [115, 175];
    const gimmickInterval = opt && opt.gimmickInterval ? opt.gimmickInterval : [145, 230];

    if (localFrame >= nextEnemyAt) {
      spawnAreaEnemy(api, areaKey, questEnemyHpMul(0.55), questCoinMul(0.55));
      nextEnemyAt = localFrame + intRand(enemyInterval[0], enemyInterval[1]);
    }

    if (localFrame >= nextGimmickAt) {
      spawnAreaGimmick(api, areaKey, questEnemyHpMul(0.7), questCoinMul(0.65));
      nextGimmickAt = localFrame + intRand(gimmickInterval[0], gimmickInterval[1]);
    }

    if (localFrame >= nextChestAt) {
      if (Math.random() < 0.28) {
        spawnAreaChest(api, areaKey, questEnemyHpMul(0.6), questCoinMul(0.75));
      }

      nextChestAt = localFrame + intRand(300, 440);
    }
  }

  function updatePteraRush(api){
    const stage = currentQuestStage();
    const ptera = getMidBossDef(api, 'grass', 'モブプテラ', QUEST_FALLBACK.ptera);
    const waves = [2, 3, 5];

    updateQuestFieldSpawns(api, stage.areaKey);

    if (!questWaveSpawned && localFrame > 45) {
      const count = waves[questPhase] || 0;
      const defs = [];

      for (let i = 0; i < count; i++) defs.push(ptera);

      spawnQuestBossGroup(api, defs, {
        kind:'midBoss',
        hpMul:0.72 + questPhase * 0.1,
        scoreMul:0.8,
        coinMul:0.7,
        r:72,
        contactDmg:15 + questPhase * 2,
        shootCd:105,
        attackCd:150
      });

      api.showBanner(`プテラッシュ ${count}体`);
      questWaveSpawned = true;
    }

    if (questWaveSpawned && !activeQuestBossAlive(api) && localFrame > 90) {
      questPhase++;
      questWaveSpawned = false;
      localFrame = 35;

      if (questPhase >= waves.length) {
        api.finishRun(true);
      }
    }
  }

  function updateThieves(api){
    const stage = currentQuestStage();

    updateQuestFieldSpawns(api, stage.areaKey, {
      enemyInterval:[75, 115],
      gimmickInterval:[150, 240]
    });

    if (!questBossSpawned && localFrame > 45) {
      const mira = findBossDef(api, 'desert', 'ミラモブ', QUEST_FALLBACK.mira);

      spawnQuestBossGroup(api, [mira], {
        kind:'boss',
        hpMul:1,
        scoreMul:1,
        coinMul:0.8,
        r:96,
        contactDmg:22
      });

      api.showBanner('盗賊団');
      questBossSpawned = true;
    }

    if (questKills < 30 && localFrame >= nextEnemyAt - 18) {
      spawnAreaEnemy(api, 'desert', questEnemyHpMul(0.62), questCoinMul(0.45));
    }

    if (questBossSpawned && !activeQuestBossAlive(api) && questKills >= 30 && localFrame > 120) {
      api.finishRun(true);
    }
  }

  function updateGuardianTest(api){
    const stage = currentQuestStage();

    updateQuestFieldSpawns(api, stage.areaKey);

    if (!questWaveSpawned && localFrame > 55) {
      const ban = findBossDef(api, 'town', '番人', QUEST_FALLBACK.ban);

      spawnQuestBossGroup(api, [ban, ban], {
        kind:'boss',
        hpMul:0.58,
        scoreMul:0.75,
        coinMul:0.65,
        r:66,
        contactDmg:16,
        vx:1.0,
        shootCd:105,
        attackCd:160
      });

      api.showBanner('番人試験');
      questWaveSpawned = true;
    }

    if (questWaveSpawned && !activeQuestBossAlive(api) && localFrame > 120) {
      api.finishRun(true);
    }
  }

  function updateNineHeads(api){
    const stage = currentQuestStage();
    const ghidora = getMidBossDef(api, 'neon', 'モブギドラ', QUEST_FALLBACK.ghidora);

    updateQuestFieldSpawns(api, stage.areaKey);

    if (!questWaveSpawned && questPhase === 0 && localFrame > 55) {
      spawnQuestBossGroup(api, [ghidora, ghidora, ghidora], {
        kind:'midBoss',
        hpMul:0.9,
        scoreMul:0.9,
        coinMul:0.75,
        r:80,
        contactDmg:20,
        shootCd:95,
        attackCd:140
      });

      api.showBanner('9つの首');
      questWaveSpawned = true;
    }

    if (questPhase === 0 && questWaveSpawned && !activeQuestBossAlive(api) && localFrame > 120) {
      questPhase = 1;
      questWaveSpawned = false;
      localFrame = 35;
    }

    if (!questWaveSpawned && questPhase === 1 && localFrame > 55) {
      spawnQuestBossGroup(api, [ghidora], {
        kind:'midBoss',
        hpMul:2.05,
        scoreMul:1.8,
        coinMul:1.2,
        r:116,
        contactDmg:28,
        vx:1.3,
        shootCd:82,
        attackCd:125
      });

      api.showBanner('大型モブギドラ');
      questWaveSpawned = true;
    }

    if (questPhase === 1 && questWaveSpawned && !activeQuestBossAlive(api) && localFrame > 120) {
      api.finishRun(true);
    }
  }

  function updateHotMagma(api){
    const stage = currentQuestStage();

    updateQuestFieldSpawns(api, stage.areaKey, {
      enemyInterval:[70, 110],
      gimmickInterval:[145, 220]
    });

    if (questPhase === 0) {
      if (questKills >= 30) {
        questPhase = 1;
        questWaveSpawned = false;
        localFrame = 35;
        api.showBanner('ドラゴン出現準備');
      }

      return;
    }

    if (!questWaveSpawned && questPhase === 1 && localFrame > 55) {
      const dragon = findBossDef(api, 'magma', 'ドラゴンモブ', QUEST_FALLBACK.dragon);
      const magrem = getMidBossDef(api, 'magma', 'マグモブレム', QUEST_FALLBACK.magmaMid);

      spawnQuestBossGroup(api, [dragon, magrem, magrem], {
        kind:'midBoss',
        hpMul:1.1,
        scoreMul:1.15,
        coinMul:0.9,
        r:88,
        contactDmg:24,
        shootCd:95,
        attackCd:145
      });

      api.state.entities.forEach(e => {
        if (e.questBoss && sameName(e.name, 'ドラゴンモブ')) {
          e.kind = 'boss';
          e.r = 106;
          e.hp = Math.ceil(e.hp * 1.25);
          e.maxHp = e.hp;
        }
      });

      api.showBanner('アチアチマグマ');
      questWaveSpawned = true;
    }

    if (questPhase === 1 && questWaveSpawned && !activeQuestBossAlive(api) && localFrame > 120) {
      api.finishRun(true);
    }
  }

  function updateLilithSisters(api){
    const stage = currentQuestStage();

    updateQuestFieldSpawns(api, stage.areaKey);

    if (!questWaveSpawned && localFrame > 55) {
      const lilith = findBossDef(api, 'castle', 'モブリリス', QUEST_FALLBACK.lilith);

      spawnQuestBossGroup(api, [lilith, lilith, lilith, lilith], {
        kind:'boss',
        hpMul:0.62,
        scoreMul:0.75,
        coinMul:0.65,
        r:56,
        scale:0.5,
        contactDmg:12,
        shootCd:96,
        attackCd:155,
        vx:1.45
      });

      api.state.entities.forEach(e => {
        if (e.questBoss && sameName(e.name, 'モブリリス')) {
          e.r = 56;
          e.w = 56;
          e.h = 56;
          e.scale = 0.5;
          e.drawScale = 0.5;
          e.sizeMul = 0.5;
          e.eventLilithSister = true;
        }
      });

      api.showBanner('リリス四姉妹');
      questWaveSpawned = true;
    }

    if (questWaveSpawned && !activeQuestBossAlive(api) && localFrame > 120) {
      api.finishRun(true);
    }
  }

  function updateEventQuest(api){
    const stage = currentQuestStage();

    localFrame++;

    if (localFrame === 1) {
      api.showBanner(`${stage.title} ${currentQuestDiff().name}`);
    }

    if (stage.key === 'pterarush') updatePteraRush(api);
    else if (stage.key === 'thieves') updateThieves(api);
    else if (stage.key === 'guardian_test') updateGuardianTest(api);
    else if (stage.key === 'nine_heads') updateNineHeads(api);
    else if (stage.key === 'hot_magma') updateHotMagma(api);
    else if (stage.key === 'lilith_sisters') updateLilithSisters(api);

    return true;
  }

  function startCurrentEvent(api){
    eventData = getEvent();

    if (!eventData || !eventData.key) {
      active = false;
      return false;
    }

    active = true;
    eventType = eventData.key;
    difficultyKey = eventData.difficulty || '';
    stageId = Number(eventData.stageId || 0);

    localFrame = 0;
    nextEnemyAt = 120;
    nextChestAt = 170;
    nextGimmickAt = 150;
    spawnedBoss = false;
    scoreAttackIndex = 0;
    finishBonusApplied = false;

    questInfo = null;
    questPhase = 0;
    questKills = 0;
    questBossSpawned = false;
    questWaveSpawned = false;

    api.state.entities.length = 0;
    api.state.bullets.length = 0;
    api.state.particles.length = 0;
    api.state.texts.length = 0;

    if (eventType === 'gold') {
      const diff = getGoldDifficulty();
      api.setEventMode({ active:true, key:'gold' });
      setStageVisual(api, `GOLD ${diff.name}`, 'sta/backmao.png');
      api.showBanner(`GOLD STAGE ${diff.name}`);
      return true;
    }

    if (eventType === 'doubleBoss') {
      const info = getDoubleInfo();
      api.setEventMode({ active:true, key:'doubleBoss' });
      setStageVisual(api, `DOUBLE ${info.difficulty.name}`, null, info.stage.areaKey, info.stage.areaName);
      api.showBanner(`ダブルボス ${info.stage.title}`);
      return true;
    }

    if (eventType === 'scoreAttack') {
      api.setEventMode({ active:true, key:'scoreAttack' });
      setStageVisual(api, 'SCORE ATTACK', 'sta/backneon.png');
      api.showBanner('スコアアタック');
      return true;
    }

    if (eventType === 'eventQuest') {
      questInfo = getQuestInfo();

      api.setEventMode({ active:true, key:'eventQuest' });
      setStageVisual(
        api,
        `QUEST ${questInfo.difficulty.name}`,
        questInfo.stage.background || null,
        questInfo.stage.areaKey,
        questInfo.stage.areaName
      );

      api.showBanner(`${questInfo.stage.title}`);
      return true;
    }

    active = false;
    return false;
  }

  function update(api){
    if (!active) return false;

    if (eventType === 'gold') return updateGold(api);
    if (eventType === 'doubleBoss') return updateDoubleBoss(api);
    if (eventType === 'scoreAttack') return updateScoreAttack(api);
    if (eventType === 'eventQuest') return updateEventQuest(api);

    return false;
  }

  function onEntityKilled(entity, api){
    if (!active || !entity) return;

    if (entity.kind === 'boss' || entity.kind === 'midBoss') {
      if (window.MobShotEvents && window.MobShotEvents.recordEventBossKill) {
        window.MobShotEvents.recordEventBossKill(entity.name);
      }
    }

    if (eventType === 'eventQuest') {
      if (entity.kind === 'enemy') {
        questKills++;
      }
    }
  }

  function beforeFinish(clear, api){
    if (!active || finishBonusApplied) return null;

    finishBonusApplied = true;

    let text = clear ? 'イベントクリア！' : 'イベント失敗';
    let bonusCoin = 0;
    let bonusDiamond = 0;

    if (clear && eventType === 'gold') {
      const diff = getGoldDifficulty();
      const first = window.MobShotEvents && window.MobShotEvents.hasGoldCleared
        ? !window.MobShotEvents.hasGoldCleared(diff.key)
        : false;

      if (first) {
        bonusCoin = Number(diff.firstCoin || 0);
        bonusDiamond = Number(diff.firstDiamond || 0);

        if (window.MobShotEvents && window.MobShotEvents.markGoldCleared) {
          window.MobShotEvents.markGoldCleared(diff.key);
        }
      } else {
        bonusCoin = Number(diff.clearCoin || 0);
      }

      api.state.coin += bonusCoin;
      addDiamond(bonusDiamond);

      if (window.MobShotEvents && window.MobShotEvents.recordGoldClear) {
        window.MobShotEvents.recordGoldClear(diff.key, api.state.coin);
      }

      text = `${diff.name} クリア！ 報酬 ${bonusCoin.toLocaleString()} COIN${bonusDiamond ? ' + ' + bonusDiamond + ' DIAMOND' : ''}`;
    }

    if (clear && eventType === 'doubleBoss') {
      const info = getDoubleInfo();
      const diff = info.difficulty;
      const stage = info.stage;
      const first = window.MobShotEvents && window.MobShotEvents.hasDoubleCleared
        ? !window.MobShotEvents.hasDoubleCleared(diff.key, stage.id)
        : false;

      if (first) {
        bonusCoin = Number(stage.final ? stage.firstCoin : diff.firstCoin || 0);
        bonusDiamond = Number(stage.final ? stage.firstDiamond : diff.firstDiamond || 0);

        if (window.MobShotEvents && window.MobShotEvents.markDoubleCleared) {
          window.MobShotEvents.markDoubleCleared(diff.key, stage.id);
        }
      }

      api.state.coin += bonusCoin;
      addDiamond(bonusDiamond);

      if (window.MobShotEvents && window.MobShotEvents.recordDoubleBossClear) {
        window.MobShotEvents.recordDoubleBossClear(diff.key, stage.id, api.state.coin);
      }

      text = `${diff.name} ${stage.title} クリア！${bonusCoin ? ' 報酬 ' + bonusCoin.toLocaleString() + ' COIN' : ''}${bonusDiamond ? ' + ' + bonusDiamond + ' DIAMOND' : ''}`;
    }

    if (clear && eventType === 'scoreAttack') {
      bonusCoin = Math.max(0, scoreAttackIndex) * 1000;
      api.state.coin += bonusCoin;

      if (window.MobShotEvents && window.MobShotEvents.recordScoreAttackClear) {
        window.MobShotEvents.recordScoreAttackClear(api.state.coin);
      }

      text = `スコアアタック終了！ 撃破 ${scoreAttackIndex}体`;
    }

    if (clear && eventType === 'eventQuest') {
      const info = getQuestInfo();
      const diff = info.difficulty;
      const stage = info.stage;

      if (window.MobShotEvents && window.MobShotEvents.recordEventQuestClear) {
        window.MobShotEvents.recordEventQuestClear(diff.key, stage.id, api.state.coin);
      }

      text = `${stage.title} ${diff.name} クリア！`;
    }

    if (!clear) {
      text = 'イベント失敗';
    }

    if (window.MobShotEvents && window.MobShotEvents.clearCurrentEvent) {
      window.MobShotEvents.clearCurrentEvent();
    }

    active = false;

    return {
      event:true,
      text
    };
  }

  function updateHud(api){
    if (!active) return false;

    if (eventType === 'gold') {
      const diff = getGoldDifficulty();

      if (api.hudStage) api.hudStage.textContent = `GOLD ${diff.name}`;
      if (api.hudScore) api.hudScore.textContent = Math.floor(api.state.score).toLocaleString();
      if (api.hudCoin) api.hudCoin.textContent = Math.floor(api.state.coin).toLocaleString();
      if (api.hudLife) api.hudLife.textContent = Math.max(0, Math.ceil(api.state.hp));

      return true;
    }

    if (eventType === 'doubleBoss') {
      const info = getDoubleInfo();

      if (api.hudStage) api.hudStage.textContent = `DOUBLE ${info.difficulty.name}`;
      if (api.hudScore) api.hudScore.textContent = Math.floor(api.state.score).toLocaleString();
      if (api.hudCoin) api.hudCoin.textContent = Math.floor(api.state.coin).toLocaleString();
      if (api.hudLife) api.hudLife.textContent = Math.max(0, Math.ceil(api.state.hp));

      return true;
    }

    if (eventType === 'scoreAttack') {
      if (api.hudStage) api.hudStage.textContent = `SCORE ${scoreAttackIndex + 1}`;
      if (api.hudScore) api.hudScore.textContent = Math.floor(api.state.score).toLocaleString();
      if (api.hudCoin) api.hudCoin.textContent = Math.floor(api.state.coin).toLocaleString();
      if (api.hudLife) api.hudLife.textContent = Math.max(0, Math.ceil(api.state.hp));

      return true;
    }

    if (eventType === 'eventQuest') {
      const info = getQuestInfo();

      if (api.hudStage) {
        if (info.stage.key === 'thieves' || info.stage.key === 'hot_magma') {
          api.hudStage.textContent = `QUEST ${Math.min(questKills, 30)}/30`;
        } else {
          api.hudStage.textContent = `QUEST ${info.difficulty.name}`;
        }
      }

      if (api.hudScore) api.hudScore.textContent = Math.floor(api.state.score).toLocaleString();
      if (api.hudCoin) api.hudCoin.textContent = Math.floor(api.state.coin).toLocaleString();
      if (api.hudLife) api.hudLife.textContent = Math.max(0, Math.ceil(api.state.hp));

      return true;
    }

    return false;
  }

  function draw(ctx, api){
    return;
  }

  window.MobShotGameEvents = {
    startCurrentEvent,
    update,
    updateHud,
    draw,
    onEntityKilled,
    beforeFinish
  };
})();
