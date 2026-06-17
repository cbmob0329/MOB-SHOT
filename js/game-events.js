'use strict';

(function(){
  let active = false;
  let eventData = null;
  let eventType = '';
  let difficultyKey = '';
  let stageId = 0;

  let phase = 'idle';
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
  let questTargetKills = 0;

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

  const QUEST_FALLBACK_BOSSES = {
    ptera:{ name:'プテラ', image:'boss/hawks.png', hp:520, score:700, coin:120 },
    mira:{ name:'ミラモブ', image:'boss/miraboss.png', hp:900, score:1200, coin:220 },
    ban:{ name:'番人', image:'boss/bossban.png', hp:850, score:1000, coin:180 },
    ghidora:{ name:'ネオンギドラ', image:'boss/bossneon.png', hp:900, score:1200, coin:220 },
    dragon:{ name:'ドラゴンモブ', image:'boss/bossdragoon.png', hp:1500, score:1800, coin:300 },
    lilith:{ name:'モブリリス', image:'boss/bossriris.png', hp:1200, score:1600, coin:280 }
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
      bossCount:2,
      bosses:['ホークモブ','ミラモブ'],
      enemySpawn:true
    };
  }

  function getDoubleInfo(){
    if (window.MobShotEvents && window.MobShotEvents.getCurrentDoubleBoss) {
      return window.MobShotEvents.getCurrentDoubleBoss();
    }

    return {
      difficulty:{
        key:'veryHard',
        name:'ベリーハード',
        color:'#ffcf5b',
        hpMul:1.35,
        scoreMul:1.25,
        firstCoin:5000,
        firstDiamond:5
      },
      stage:{
        id:1,
        areaKey:'grass',
        areaName:'草原',
        title:'草原',
        bossA:'ホークモブ',
        bossB:'ミラモブ'
      }
    };
  }

  function getQuestInfo(){
    if (window.MobShotEvents && window.MobShotEvents.getCurrentQuest) {
      return window.MobShotEvents.getCurrentQuest();
    }

    return {
      difficulty:{
        key:'easy',
        name:'イージー',
        color:'#9dff73',
        hpMul:0.85,
        scoreMul:1,
        coinMul:0.8,
        enemyHpMul:0.8,
        cost:5000
      },
      stage:{
        id:1,
        key:'pterarush',
        title:'プテラッシュ',
        areaKey:'grass',
        areaName:'草原'
      }
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

  function stageAreaData(areaKey){
    const stageData = window.MOBSHOT_STAGE_DATA || {};
    return stageData[areaKey] || null;
  }

  function bossDefByName(name, fallback){
    const stageData = window.MOBSHOT_STAGE_DATA || {};
    const all = [];

    Object.keys(stageData).forEach(key => {
      const area = stageData[key];

      if (area.boss) all.push(area.boss);
      if (area.strongBoss) all.push(area.strongBoss);
      if (area.midBoss) all.push(area.midBoss);
      if (area.midboss) all.push(area.midboss);
      if (area.middleBoss) all.push(area.middleBoss);
    });

    const found = all.find(b => b && b.name === name);

    if (found) return clone(found);

    return clone(fallback || {
      name:name || 'BOSS',
      image:'boss/hawks.png',
      hp:1000,
      score:1000,
      coin:300
    });
  }

  function midBossDef(areaKey, fallback){
    const area = stageAreaData(areaKey);

    if (area) {
      if (area.midBoss) return clone(area.midBoss);
      if (area.midboss) return clone(area.midboss);
      if (area.middleBoss) return clone(area.middleBoss);
    }

    return clone(fallback || QUEST_FALLBACK_BOSSES.ptera);
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
      shootCd:opt && opt.shootCd != null ? opt.shootCd : 76,
      attackCd:opt && opt.attackCd != null ? opt.attackCd : 130,
      attackStep:0,
      contactDmg:opt && opt.contactDmg != null ? opt.contactDmg : 22,
      hitPlayerCd:0,
      bob:0,
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
      score:Math.ceil(Number(def.score || 10) * hpMul),
      coinMin:Math.ceil(Number(def.coinMin || 1) * coinMul),
      coinMax:Math.ceil(Number(def.coinMax || 2) * coinMul),
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
      score:Math.ceil(Number(def.score || 80) * hpMul),
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
      score:Math.ceil(Number(def.score || 10) * hpMul),
      coinMin:Math.ceil(Number(def.coinMin || 1) * coinMul),
      coinMax:Math.ceil(Number(def.coinMax || 2) * coinMul),
      dead:false,
      bob:0
    };
  }

  function spawnAreaEnemy(api, areaKey, hpMul, coinMul){
    const D = api.D;
    let list = [];

    const area = stageAreaData(areaKey);
    if (area && area.enemies && area.enemies.zako) list = area.enemies.zako;
    else if (D.enemies && D.enemies.zako) list = D.enemies.zako;

    const def = pick(list);
    if (def) {
      api.state.entities.push(makeEnemyEntity(def, api, hpMul, coinMul));
    }
  }

  function spawnAreaGimmick(api, areaKey, hpMul, coinMul){
    const D = api.D;
    let list = [];

    const area = stageAreaData(areaKey);
    if (area && area.gimmicks) list = area.gimmicks;
    else if (D.gimmicks) list = D.gimmicks;

    const def = pick(list);
    if (def) {
      api.state.entities.push(makeGimmickEntity(def, api, hpMul, coinMul));
    }
  }

  function spawnAreaChest(api, areaKey, hpMul, coinMul){
    const D = api.D;
    let list = [];

    const area = stageAreaData(areaKey);
    if (area && area.chests) list = area.chests;
    else if (D.chests) list = D.chests;

    const def = pick(list);
    if (def) {
      api.state.entities.push(makeChestEntity(def, api, hpMul, coinMul));
    }
  }

  function spawnGoldBosses(api){
    if (spawnedBoss) return;

    const state = api.state;
    const W = api.W;
    const diff = getGoldDifficulty();

    const names = Array.isArray(diff.bosses) && diff.bosses.length
      ? diff.bosses.slice(0, 2)
      : ['ホークモブ','ミラモブ'];

    while (names.length < 2) {
      names.push(names[0] || 'ホークモブ');
    }

    const bosses = [
      bossDefByName(names[0]),
      bossDefByName(names[1], bossDefByName(names[0]))
    ];

    const positions = [W * 0.34, W * 0.66];

    bosses.forEach((def, index) => {
      const boss = makeBossEntity(def, api, {
        x:positions[index],
        hpMul:Number(diff.bossHpMul || 1),
        scoreMul:Number(diff.bossCoinMul || 1),
        coinMul:Number(diff.bossCoinMul || 1),
        vx:index === 0 ? 1.25 : -1.25,
        shootCd:74,
        attackCd:125,
        contactDmg:22,
        r:106
      });

      state.entities.push(boss);
    });

    spawnedBoss = true;
  }

  function updateGold(api){
    const state = api.state;
    const D = api.D;
    const diff = getGoldDifficulty();

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
            Number(diff.bossHpMul || 1) * 0.35,
            Number(diff.bossCoinMul || 1)
          ));
        }
      }

      nextEnemyAt = localFrame + intRand(
        diff.key === 'legend' ? 120 : diff.key === 'inferno' ? 140 : 180,
        diff.key === 'legend' ? 180 : diff.key === 'inferno' ? 220 : 260
      );
    }

    if (localFrame >= nextGimmickAt) {
      if (D.gimmicks && D.gimmicks.length) {
        const def = pick(D.gimmicks);

        if (def) {
          state.entities.push(makeGimmickEntity(
            def,
            api,
            Number(diff.bossHpMul || 1) * 0.45,
            Number(diff.chestMul || 1)
          ));
        }
      }

      nextGimmickAt = localFrame + intRand(160, 240);
    }

    if (localFrame >= nextChestAt) {
      if (D.chests && D.chests.length && Math.random() < 0.55) {
        const def = pick(D.chests);

        if (def) {
          state.entities.push(makeChestEntity(
            def,
            api,
            1,
            Number(diff.chestMul || 1) * 3
          ));
        }
      }

      nextChestAt = localFrame + intRand(170, 260);
    }

    const bossAlive = state.entities.some(e =>
      !e.dead &&
      e.kind === 'boss'
    );

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

    const bossA = bossDefByName(stage.bossA);
    const bossB = bossDefByName(stage.bossB, bossA);

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

    localFrame++;

    if (localFrame === 1) {
      api.showBanner(`ダブルボス ${diff.name}`);
    }

    if (localFrame >= 60) {
      spawnDoubleBosses(api);
    }

    if (localFrame >= nextEnemyAt) {
      if (diff.key !== 'veryHard') {
        const D = api.D;
        const def = pick(D.enemies && D.enemies.zako ? D.enemies.zako : []);

        if (def) {
          state.entities.push(makeEnemyEntity(
            def,
            api,
            Number(diff.hpMul || 1) * 0.4,
            Number(diff.scoreMul || 1)
          ));
        }
      }

      nextEnemyAt = localFrame + intRand(
        diff.key === 'legend' ? 90 : 130,
        diff.key === 'legend' ? 150 : 210
      );
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

    const boss = makeBossEntity(def, api, {
      x:W / 2,
      hpMul,
      scoreMul:1 + scoreAttackIndex * 0.2,
      coinMul:1 + scoreAttackIndex * 0.15,
      vx:1.35 + scoreAttackIndex * 0.08,
      shootCd:Math.max(52, 82 - scoreAttackIndex * 3),
      attackCd:Math.max(96, 135 - scoreAttackIndex * 5),
      contactDmg:20 + scoreAttackIndex * 2
    });

    state.entities.push(boss);
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
    return Number(diff.enemyHpMul || diff.hpMul || 1) * Number(extra == null ? 1 : extra);
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
    return api.state.entities.some(e =>
      !e.dead &&
      (e.kind === 'boss' || e.kind === 'midBoss') &&
      e.questBoss
    );
  }

  function spawnQuestBossGroup(api, defs, opt){
    const W = api.W;
    const count = defs.length;
    const margin = count <= 2 ? 0.32 : count <= 3 ? 0.24 : 0.16;
    const spanA = W * margin;
    const spanB = W * (1 - margin);

    defs.forEach((def, index) => {
      const t = count === 1 ? 0.5 : index / (count - 1);
      const x = spanA + (spanB - spanA) * t;
      const side = index % 2 === 0 ? 1 : -1;

      api.state.entities.push(makeBossEntity(def, api, {
        kind:opt && opt.kind ? opt.kind : 'midBoss',
        x,
        hpMul:questHpMul(opt && opt.hpMul != null ? opt.hpMul : 1),
        scoreMul:questScoreMul(opt && opt.scoreMul != null ? opt.scoreMul : 1),
        coinMul:questCoinMul(opt && opt.coinMul != null ? opt.coinMul : 1),
        vx:side * Number(opt && opt.vx != null ? opt.vx : 1.15),
        shootCd:opt && opt.shootCd != null ? opt.shootCd : 82,
        attackCd:opt && opt.attackCd != null ? opt.attackCd : 135,
        contactDmg:opt && opt.contactDmg != null ? opt.contactDmg : 18,
        r:opt && opt.r != null ? opt.r : 84,
        questBoss:true
      }));
    });
  }

  function updateQuestFieldSpawns(api, areaKey){
    if (localFrame >= nextEnemyAt) {
      spawnAreaEnemy(api, areaKey, questEnemyHpMul(0.55), questCoinMul(0.65));
      nextEnemyAt = localFrame + intRand(95, 155);
    }

    if (localFrame >= nextGimmickAt) {
      spawnAreaGimmick(api, areaKey, questEnemyHpMul(0.75), questCoinMul(0.7));
      nextGimmickAt = localFrame + intRand(135, 210);
    }

    if (localFrame >= nextChestAt) {
      if (Math.random() < 0.34) {
        spawnAreaChest(api, areaKey, questEnemyHpMul(0.65), questCoinMul(0.8));
      }

      nextChestAt = localFrame + intRand(260, 390);
    }
  }

  function updatePteraRush(api){
    const stage = currentQuestStage();
    const ptera = midBossDef('grass', QUEST_FALLBACK_BOSSES.ptera);
    const waves = [2, 3, 5];

    updateQuestFieldSpawns(api, stage.areaKey);

    if (!questWaveSpawned && localFrame > 45) {
      const count = waves[questPhase] || 0;
      const defs = [];

      for (let i = 0; i < count; i++) defs.push(ptera);

      spawnQuestBossGroup(api, defs, {
        kind:'midBoss',
        hpMul:0.75 + questPhase * 0.12,
        scoreMul:0.8,
        coinMul:0.8,
        r:76,
        contactDmg:16 + questPhase * 2
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

    updateQuestFieldSpawns(api, stage.areaKey);

    if (!questBossSpawned && localFrame > 45) {
      const mira = bossDefByName('ミラモブ', QUEST_FALLBACK_BOSSES.mira);

      spawnQuestBossGroup(api, [mira], {
        kind:'boss',
        hpMul:1.0,
        scoreMul:1.0,
        coinMul:1.0,
        r:98,
        contactDmg:22
      });

      api.showBanner('盗賊団 ミラモブ出現');
      questBossSpawned = true;
    }

    if (localFrame >= nextEnemyAt - 35 && questKills < 30) {
      spawnAreaEnemy(api, 'desert', questEnemyHpMul(0.7), questCoinMul(0.55));
    }

    const bossAlive = activeQuestBossAlive(api);

    if (questBossSpawned && !bossAlive && questKills >= 30 && localFrame > 120) {
      api.finishRun(true);
    }
  }

  function updateGuardianTest(api){
    const stage = currentQuestStage();

    updateQuestFieldSpawns(api, stage.areaKey);

    if (!questWaveSpawned && localFrame > 55) {
      const ban = bossDefByName('番人', QUEST_FALLBACK_BOSSES.ban);

      spawnQuestBossGroup(api, [ban, ban], {
        kind:'midBoss',
        hpMul:0.75,
        scoreMul:0.9,
        coinMul:0.8,
        r:72,
        contactDmg:18
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
    const ghidora = midBossDef('neon', QUEST_FALLBACK_BOSSES.ghidora);

    updateQuestFieldSpawns(api, stage.areaKey);

    if (!questWaveSpawned && questPhase === 0 && localFrame > 55) {
      spawnQuestBossGroup(api, [ghidora, ghidora, ghidora], {
        kind:'midBoss',
        hpMul:0.9,
        scoreMul:1.0,
        coinMul:1.0,
        r:82,
        contactDmg:20
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
        hpMul:2.1,
        scoreMul:2.0,
        coinMul:1.5,
        r:118,
        contactDmg:28,
        vx:1.35
      });

      api.showBanner('大型ネオンギドラ');
      questWaveSpawned = true;
    }

    if (questPhase === 1 && questWaveSpawned && !activeQuestBossAlive(api) && localFrame > 120) {
      api.finishRun(true);
    }
  }

  function updateHotMagma(api){
    const stage = currentQuestStage();

    updateQuestFieldSpawns(api, stage.areaKey);

    if (questPhase === 0) {
      if (localFrame >= nextEnemyAt - 35 && questKills < 30) {
        spawnAreaEnemy(api, 'magma', questEnemyHpMul(0.8), questCoinMul(0.55));
      }

      if (questKills >= 30) {
        questPhase = 1;
        questWaveSpawned = false;
        localFrame = 35;
        api.showBanner('ドラゴン出現準備');
      }

      return;
    }

    if (!questWaveSpawned && questPhase === 1 && localFrame > 55) {
      const dragon = bossDefByName('ドラゴンモブ', QUEST_FALLBACK_BOSSES.dragon);
      const mid = midBossDef('magma', QUEST_FALLBACK_BOSSES.dragon);

      spawnQuestBossGroup(api, [dragon, mid, mid], {
        kind:'midBoss',
        hpMul:1.15,
        scoreMul:1.25,
        coinMul:1.1,
        r:90,
        contactDmg:24
      });

      api.state.entities.forEach(e => {
        if (e.questBoss && e.name === dragon.name) {
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
      const lilith = bossDefByName('モブリリス', QUEST_FALLBACK_BOSSES.lilith);

      spawnQuestBossGroup(api, [lilith, lilith, lilith, lilith], {
        kind:'boss',
        hpMul:0.72,
        scoreMul:0.85,
        coinMul:0.8,
        r:74,
        contactDmg:18,
        shootCd:86,
        attackCd:145
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

    phase = 'event';
    localFrame = 0;
    nextEnemyAt = 120;
    nextChestAt = 150;
    nextGimmickAt = 130;
    spawnedBoss = false;
    scoreAttackIndex = 0;
    finishBonusApplied = false;

    questInfo = null;
    questPhase = 0;
    questKills = 0;
    questBossSpawned = false;
    questWaveSpawned = false;
    questTargetKills = 0;

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

      if (entity.questBoss && (entity.kind === 'boss' || entity.kind === 'midBoss')) {
        questTargetKills++;
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
          api.hudStage.textContent = `QUEST ${questKills}/30`;
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
