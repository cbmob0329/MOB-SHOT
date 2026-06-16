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
  let spawnedMidBoss = false;
  let scoreAttackIndex = 0;
  let finishBonusApplied = false;

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
      bossCount:1,
      midBossCount:0,
      showMidBoss:false
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

  function setStageVisual(api, title, background){
    const D = api.D;

    if (!D || !D.stage) return;

    D.stage.id = title || 'EVENT';
    D.stage.name = title || 'EVENT';
    D.stage.areaName = title || 'EVENT';
    D.stage.areaType = title || 'EVENT';
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

    const hp = Math.ceil(Number(def.hp || 1000) * hpMul);

    return {
      kind:'boss',
      name:def.name || 'BOSS',
      image:def.image || 'boss/hawks.png',
      x,
      y:-240,
      baseY:H * 0.21,
      targetY:H * 0.21,
      vx:opt && opt.vx != null ? opt.vx : 1.35,
      vy:1.55,
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
      eventBoss:true
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
      bulletColor:'#ffcf5b'
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

  function spawnGoldBosses(api){
    if (spawnedBoss) return;

    const state = api.state;
    const D = api.D;
    const W = api.W;
    const diff = getGoldDifficulty();

    const baseBoss = clone(D.enemies && D.enemies.boss ? D.enemies.boss : {
      name:'ホークモブ',
      image:'boss/hawks.png',
      hp:500,
      score:1000,
      coin:100
    });

    const count = 2;
    const positions = [W * 0.34, W * 0.66];

    for (let i = 0; i < count; i++) {
      const boss = makeBossEntity(baseBoss, api, {
        x:positions[i],
        hpMul:Number(diff.bossHpMul || 1),
        scoreMul:Number(diff.bossCoinMul || 1),
        coinMul:Number(diff.bossCoinMul || 1),
        vx:i % 2 === 0 ? 1.25 : -1.25,
        shootCd:74,
        attackCd:125,
        contactDmg:22,
        r:106
      });

      boss.name = `${baseBoss.name}${i + 1}`;
      state.entities.push(boss);
    }

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

  function bossDefByName(name, fallback){
    const stageData = window.MOBSHOT_STAGE_DATA || {};
    const all = [];

    Object.keys(stageData).forEach(key => {
      const area = stageData[key];

      if (area.boss) all.push(area.boss);
      if (area.strongBoss) all.push(area.strongBoss);
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
          state.entities.push(makeEnemyEntity(def, api, Number(diff.hpMul || 1) * 0.4, Number(diff.scoreMul || 1)));
        }
      }

      nextEnemyAt = localFrame + intRand(diff.key === 'legend' ? 90 : 130, diff.key === 'legend' ? 150 : 210);
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
    spawnedMidBoss = false;
    scoreAttackIndex = 0;
    finishBonusApplied = false;

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
      setStageVisual(api, `DOUBLE ${info.difficulty.name}`, null);
      api.showBanner(`ダブルボス ${info.stage.title}`);
      return true;
    }

    if (eventType === 'scoreAttack') {
      api.setEventMode({ active:true, key:'scoreAttack' });
      setStageVisual(api, 'SCORE ATTACK', 'sta/backneon.png');
      api.showBanner('スコアアタック');
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

    return false;
  }

  function onEntityKilled(entity, api){
    if (!active || !entity) return;

    if (entity.kind === 'boss') {
      if (window.MobShotEvents && window.MobShotEvents.recordEventBossKill) {
        window.MobShotEvents.recordEventBossKill(entity.name);
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
