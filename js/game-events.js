'use strict';

(function(){
  const EVENT_SAVE_KEY = 'mobshot_event_mode_v1';
  const EVENT_START_VALID_MS = 120000;
  const GOLD_TIME_LIMIT_FRAMES = 30 * 60;
  const GOLD_BOSS_RESPAWN_FRAMES = 5 * 60;

  let active = false;
  let eventData = null;
  let eventType = '';
  let difficultyKey = '';

  let localFrame = 0;
  let nextEnemyAt = 0;
  let nextChestAt = 0;
  let nextGimmickAt = 0;
  let nextBossRespawnAt = 0;
  let spawnedBoss = false;
  let finishBonusApplied = false;
  let retryEventData = null;

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

  function canonicalBossName(name){
    const raw = String(name || '').trim();
    if (raw === '番人') return 'モブガーディアン';
    if (raw === '番人Ⅱ') return 'モブガーディアンⅡ';
    if (raw === '番人II') return 'モブガーディアンⅡ';
    if (raw === 'モブ鮫') return 'モブサメ';
    if (raw === 'モグガラド') return 'モブガラド';
    if (raw === '閻魔') return '閻魔モブ';
    if (raw === 'モブドラゴン') return 'ドラゴンモブ';
    if (raw === 'モブドラゴンⅡ') return 'ドラゴンモブⅡ';
    if (raw === 'モブドラゴンII') return 'ドラゴンモブⅡ';
    if (raw === 'メルト') return 'モブメイル';
    if (raw === 'モブメルト') return 'モブメイル';
    return raw;
  }

  function normalizeDifficultyKey(key){
    const raw = String(key || '').trim();
    if (raw === 'イージー') return 'easy';
    if (raw === 'ハード') return 'hard';
    if (raw === 'ベリーハード') return 'veryHard';
    if (raw === 'インフェルノ') return 'inferno';
    if (raw === 'レジェンド') return 'legend';
    if (raw === 'veryhard') return 'veryHard';
    if (raw === 'veryHard') return 'veryHard';
    return raw || 'easy';
  }

  const BOSS_FALLBACK = {
    'モブガーディアン':{ name:'モブガーディアン', image:'boss/bossban.png', hp:1100, score:1600, coin:320 },
    'モブガーディアンⅡ':{ name:'モブガーディアンⅡ', image:'boss/bossban2.png', hp:1600, score:2100, coin:420 },
    'モブデュアル':{ name:'モブデュアル', image:'en/sabadual.png', hp:150, score:550, coin:55 }
  };

  const ENEMY_FALLBACK = {
    'モブ盗賊':{ name:'モブ盗賊', image:'en/entozok.png', hp:10, score:20, coinMin:3, coinMax:7 },
    'モブドワーフ':{ name:'モブドワーフ', image:'en/endowa.png', hp:12, score:22, coinMin:3, coinMax:8 }
  };

  const CHEST_FALLBACK = [
    { name:'木箱', image:'gimi/kibako.png', hp:8, score:30, coinMin:5, coinMax:15 },
    { name:'銀の宝箱', image:'gimi/takagin.png', hp:10, score:80, coinMin:10, coinMax:25 },
    { name:'金の宝箱', image:'gimi/takagol.png', hp:18, score:160, coinMin:25, coinMax:60 }
  ];

  const GOLD_DIFFICULTY_FALLBACK = {
    easy:{
      key:'easy',
      name:'イージー',
      clearCoin:300,
      firstCoin:3000,
      firstDiamond:5,
      chestMul:0.8,
      bossHpMul:1.0,
      bossCoinMul:1.0,
      bossMinHp:600,
      areaKey:'desert',
      areaName:'砂漠',
      background:'sta/backsabaku.png',
      bosses:['モブガーディアン']
    },
    hard:{
      key:'hard',
      name:'ハード',
      clearCoin:500,
      firstCoin:5000,
      firstDiamond:5,
      chestMul:1.4,
      bossHpMul:1.35,
      bossCoinMul:1.8,
      bossMinHp:1800,
      areaKey:'desert',
      areaName:'砂漠',
      background:'sta/backsabaku.png',
      bosses:['モブガーディアン','モブガーディアンⅡ']
    },
    veryHard:{
      key:'veryHard',
      name:'ベリーハード',
      clearCoin:800,
      firstCoin:10000,
      firstDiamond:5,
      chestMul:2.2,
      bossHpMul:1.8,
      bossCoinMul:3.2,
      bossMinHp:3800,
      areaKey:'desert',
      areaName:'砂漠',
      background:'sta/backsabaku.png',
      bosses:['モブガーディアンⅡ','モブデュアル']
    },
    inferno:{
      key:'inferno',
      name:'インフェルノ',
      clearCoin:1000,
      firstCoin:15000,
      firstDiamond:10,
      chestMul:3.5,
      bossHpMul:2.35,
      bossCoinMul:6.0,
      bossMinHp:7200,
      areaKey:'desert',
      areaName:'砂漠',
      background:'sta/backsabaku.png',
      bosses:['モブガーディアンⅡ','モブデュアル']
    },
    legend:{
      key:'legend',
      name:'レジェンド',
      clearCoin:1500,
      firstCoin:30000,
      firstDiamond:30,
      chestMul:5.5,
      bossHpMul:3.2,
      bossCoinMul:10.0,
      bossMinHp:12000,
      areaKey:'desert',
      areaName:'砂漠',
      background:'sta/backsabaku.png',
      bosses:['モブガーディアンⅡ','モブデュアル']
    }
  };

  function readEventRequest(){
    try {
      const raw = localStorage.getItem(EVENT_SAVE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch(e) {
      return null;
    }
  }

  function clearEventRequest(){
    try {
      localStorage.removeItem(EVENT_SAVE_KEY);
    } catch(e) {}
  }

  function isFreshEventRequest(data){
    if (!data || !data.key) return false;
    const startedAt = Number(data.startedAt || 0);
    if (!startedAt) return true;
    return Date.now() - startedAt <= EVENT_START_VALID_MS;
  }

  function getEvent(){
    let ev = null;

    if (window.MobShotEvents && window.MobShotEvents.getCurrentEvent) {
      ev = window.MobShotEvents.getCurrentEvent();
    }

    if (ev && ev.key) return ev;

    ev = readEventRequest();
    if (isFreshEventRequest(ev)) return ev;

    return null;
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

  function getGoldDifficulty(){
    const key = normalizeDifficultyKey(
      difficultyKey ||
      (eventData && eventData.difficulty) ||
      (eventData && eventData.difficultyKey) ||
      'easy'
    );

    let diff = clone(GOLD_DIFFICULTY_FALLBACK[key] || GOLD_DIFFICULTY_FALLBACK.easy);

    if (eventData && eventData.goldDifficulty) {
      diff = Object.assign(diff, eventData.goldDifficulty);
    }

    const fixed = GOLD_DIFFICULTY_FALLBACK[key] || GOLD_DIFFICULTY_FALLBACK.easy;

    diff.key = fixed.key;
    diff.name = fixed.name;
    diff.bosses = fixed.bosses.slice();
    diff.areaKey = fixed.areaKey;
    diff.areaName = fixed.areaName;
    diff.background = fixed.background;
    diff.clearCoin = fixed.clearCoin;
    diff.firstCoin = fixed.firstCoin;
    diff.firstDiamond = fixed.firstDiamond;
    diff.chestMul = fixed.chestMul;
    diff.bossHpMul = fixed.bossHpMul;
    diff.bossCoinMul = fixed.bossCoinMul;
    diff.bossMinHp = fixed.bossMinHp;

    return diff;
  }

  function setStageVisual(api, title, background, areaKey, areaName){
    const D = api.D;
    if (!D || !D.stage) return;

    D.stage.id = title || 'GOLD';
    D.stage.name = title || 'GOLD';
    D.stage.areaName = areaName || '砂漠';
    D.stage.areaType = areaKey || 'desert';
    D.stage.areaKey = areaKey || 'desert';
    D.stage.difficulty = title || 'GOLD';

    if (background) {
      D.stage.background = background;
    }
  }

  function eventEnemyPowerMul(key){
    key = normalizeDifficultyKey(key);
    if (key === 'easy') return 1;
    if (key === 'hard') return 2.4;
    if (key === 'veryHard') return 5.5;
    if (key === 'inferno') return 11;
    if (key === 'legend') return 22;
    return 1;
  }

  function fixBossDef(def){
    def = clone(def || {});
    def.name = canonicalBossName(def.name);

    const fallback = BOSS_FALLBACK[def.name] || BOSS_FALLBACK['モブガーディアン'];

    def.image = def.image || fallback.image;
    def.hp = Number(def.hp || fallback.hp || 1000);
    def.score = Number(def.score || fallback.score || 1000);
    def.coin = Number(def.coin || fallback.coin || 100);

    return def;
  }

  function eventBossDef(name){
    name = canonicalBossName(name);
    return clone(BOSS_FALLBACK[name] || BOSS_FALLBACK['モブガーディアン']);
  }

  function applyVisualSize(entity, opt){
    opt = opt || {};

    const scale = Number(
      opt.visualScale != null ? opt.visualScale :
      opt.scale != null ? opt.scale :
      opt.sizeMul != null ? opt.sizeMul :
      entity.visualScale != null ? entity.visualScale :
      entity.scale != null ? entity.scale :
      1
    );

    const r = Number(opt.r || entity.r || 80);
    const drawSize = Number(
      opt.drawSize ||
      opt.customSize ||
      opt.eventDrawSize ||
      Math.max(24, Math.ceil(r * 2 * scale))
    );

    entity.r = r;
    entity.hitR = r;
    entity.radius = r;
    entity.collisionR = r;

    entity.scale = scale;
    entity.drawScale = scale;
    entity.sizeMul = scale;
    entity.imageScale = scale;
    entity.spriteScale = scale;
    entity.visualScale = scale;
    entity.renderScale = scale;
    entity.bossScale = scale;
    entity.scaleX = scale;
    entity.scaleY = scale;

    entity.w = drawSize;
    entity.h = drawSize;
    entity.width = drawSize;
    entity.height = drawSize;
    entity.drawW = drawSize;
    entity.drawH = drawSize;
    entity.renderW = drawSize;
    entity.renderH = drawSize;
    entity.imgW = drawSize;
    entity.imgH = drawSize;
    entity.imageW = drawSize;
    entity.imageH = drawSize;
    entity.spriteW = drawSize;
    entity.spriteH = drawSize;
    entity.eventDrawSize = drawSize;
    entity.drawSize = drawSize;
    entity.customSize = drawSize;
    entity.fixedDrawSize = drawSize;
    entity.forceDrawSize = drawSize;
  }

  function makeBossEntity(def, api, opt){
    opt = opt || {};
    def = fixBossDef(def);

    const W = api.W;
    const H = api.H;
    const hpMul = Number(opt.hpMul || 1);
    const scoreMul = Number(opt.scoreMul || 1);
    const coinMul = Number(opt.coinMul || 1);
    const minHp = Number(opt.minHp || 0);
    const hp = Math.max(minHp, Math.ceil(Number(def.hp || 1000) * hpMul));
    const r = Number(opt.r || 106);
    const scale = Number(opt.scale || opt.sizeMul || 1);

    const entity = {
      kind:opt.kind || 'boss',
      name:def.name || 'モブガーディアン',
      image:def.image || 'boss/bossban.png',
      x:opt.x != null ? opt.x : W / 2,
      y:opt.y != null ? opt.y : -240,
      baseY:opt.baseY != null ? opt.baseY : H * 0.21,
      targetY:opt.targetY != null ? opt.targetY : H * 0.21,
      vx:opt.vx != null ? opt.vx : 1.25,
      vy:opt.vy != null ? opt.vy : 1.55,
      r,
      hp,
      maxHp:hp,
      score:Math.ceil(Number(def.score || 1000) * scoreMul),
      coin:Math.ceil(Number(def.coin || 100) * coinMul),
      dead:false,
      shootCd:opt.shootCd != null ? opt.shootCd : 92,
      attackCd:opt.attackCd != null ? opt.attackCd : 165,
      attackStep:0,
      contactDmg:opt.contactDmg != null ? opt.contactDmg : 22,
      hitPlayerCd:0,
      bob:0,
      scale,
      eventBoss:true,
      eventType:'gold',
      eventDifficulty:opt.eventDifficulty || difficultyKey || ''
    };

    applyVisualSize(entity, opt);
    return entity;
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
      vx:rand(-0.45, 0.45),
      vy:1.35 + rand(0, 0.25),
      r:def.name === 'モブロック' ? 36 : 31,
      hp,
      maxHp:hp,
      score:Math.ceil(Number(def.score || 10) * Math.max(1, hpMul * 0.35)),
      coinMin:Math.ceil(Number(def.coinMin || 1) * coinMul),
      coinMax:Math.ceil(Number(def.coinMax || 2) * coinMul),
      contactDmg:Math.max(1, Math.ceil(hp * 0.28)),
      dead:false,
      bob:rand(0, Math.PI * 2),
      aiType:'sway',
      canShoot:false,
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
      vy:1.35,
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
      vy:1.45,
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

  function spawnGoldBosses(api){
    const state = api.state;
    const W = api.W;
    const diff = getGoldDifficulty();

    const names = Array.isArray(diff.bosses) && diff.bosses.length
      ? diff.bosses.slice(0, 2).map(canonicalBossName)
      : ['モブガーディアン'];

    const count = names.length;
    const positions = count >= 2 ? [W * 0.34, W * 0.66] : [W * 0.5];

    names.forEach((name, index) => {
      const isMid = name === 'モブデュアル';

      state.entities.push(makeBossEntity(eventBossDef(name), api, {
        kind:isMid ? 'midBoss' : 'boss',
        x:positions[index] || W * 0.5,
        hpMul:Number(diff.bossHpMul || 1) * (isMid ? 1.8 : 1),
        minHp:Number(diff.bossMinHp || 0) * (isMid ? 0.45 : 1),
        scoreMul:Number(diff.bossCoinMul || 1),
        coinMul:Number(diff.bossCoinMul || 1),
        vx:index === 0 ? 1.25 : -1.25,
        shootCd:isMid ? 105 : 92,
        attackCd:isMid ? 170 : 165,
        contactDmg:isMid ? 18 : 22,
        r:isMid ? 78 : 106,
        eventDifficulty:diff.key
      }));
    });

    spawnedBoss = true;
    nextBossRespawnAt = 0;
  }

  function spawnGoldEnemy(api){
    const diff = getGoldDifficulty();
    const enemyPower = eventEnemyPowerMul(diff.key);
    const def = pick([
      ENEMY_FALLBACK['モブ盗賊'],
      ENEMY_FALLBACK['モブドワーフ']
    ]);

    if (!def) return;

    api.state.entities.push(makeEnemyEntity(
      def,
      api,
      Number(diff.bossHpMul || 1) * 0.35 * enemyPower,
      Number(diff.bossCoinMul || 1)
    ));
  }

  function spawnGoldChest(api){
    const diff = getGoldDifficulty();
    const enemyPower = eventEnemyPowerMul(diff.key);
    const def = pick(CHEST_FALLBACK);

    if (!def) return;

    api.state.entities.push(makeChestEntity(
      def,
      api,
      Math.max(1, enemyPower * 0.45),
      Number(diff.chestMul || 1) * 3
    ));
  }

  function spawnGoldGimmick(api){
    const diff = getGoldDifficulty();
    const enemyPower = eventEnemyPowerMul(diff.key);
    const def = { name:'木箱', image:'gimi/kibako.png', hp:12, score:40, coinMin:6, coinMax:18 };

    api.state.entities.push(makeGimmickEntity(
      def,
      api,
      Number(diff.bossHpMul || 1) * 0.45 * enemyPower,
      Number(diff.chestMul || 1)
    ));
  }

  function updateGold(api){
    const state = api.state;
    const diff = getGoldDifficulty();

    localFrame++;

    if (localFrame === 1) {
      api.showBanner(`GOLD STAGE ${diff.name}`);
    }

    if (!spawnedBoss && localFrame >= 35) {
      spawnGoldBosses(api);
    }

    if (spawnedBoss) {
      const bossAlive = state.entities.some(e =>
        !e.dead &&
        (e.kind === 'boss' || e.kind === 'midBoss') &&
        e.eventBoss
      );

      if (!bossAlive && nextBossRespawnAt <= 0) {
        nextBossRespawnAt = localFrame + GOLD_BOSS_RESPAWN_FRAMES;
        api.showBanner('ボス再出現まで5秒');
      }

      if (!bossAlive && nextBossRespawnAt > 0 && localFrame >= nextBossRespawnAt) {
        spawnedBoss = false;
        spawnGoldBosses(api);
        api.showBanner('ボス再出現！');
      }
    }

    if (localFrame >= nextEnemyAt) {
      spawnGoldEnemy(api);
      nextEnemyAt = localFrame + intRand(
        diff.key === 'legend' ? 120 : diff.key === 'inferno' ? 145 : 180,
        diff.key === 'legend' ? 180 : diff.key === 'inferno' ? 220 : 270
      );
    }

    if (localFrame >= nextGimmickAt) {
      spawnGoldGimmick(api);
      nextGimmickAt = localFrame + intRand(170, 250);
    }

    if (localFrame >= nextChestAt) {
      if (Math.random() < 0.72) {
        spawnGoldChest(api);
      }

      nextChestAt = localFrame + intRand(95, 145);
    }

    if (localFrame >= GOLD_TIME_LIMIT_FRAMES) {
      api.finishRun(true);
    }

    return true;
  }

  function resetLocalState(){
    localFrame = 0;
    nextEnemyAt = 110;
    nextChestAt = 70;
    nextGimmickAt = 150;
    nextBossRespawnAt = 0;
    spawnedBoss = false;
    finishBonusApplied = false;
  }

  function startCurrentEvent(api){
    document.__mobShotEventResultMode = false;

    eventData = getEvent();

    if (!eventData || !eventData.key) {
      active = false;
      eventData = null;
      eventType = '';
      difficultyKey = '';
      return false;
    }

    if (eventData.key !== 'gold') {
      active = false;
      retryEventData = null;
      eventData = null;
      eventType = '';
      difficultyKey = '';

      if (window.MobShotEvents && window.MobShotEvents.clearCurrentEvent) {
        window.MobShotEvents.clearCurrentEvent();
      }

      clearEventRequest();
      return false;
    }

    retryEventData = clone(eventData);

    active = true;
    eventType = 'gold';
    difficultyKey = normalizeDifficultyKey(eventData.difficulty || eventData.difficultyKey || 'easy');

    resetLocalState();

    if (api.state && Array.isArray(api.state.entities)) api.state.entities.length = 0;
    if (api.state && Array.isArray(api.state.bullets)) api.state.bullets.length = 0;
    if (api.state && Array.isArray(api.state.particles)) api.state.particles.length = 0;
    if (api.state && Array.isArray(api.state.texts)) api.state.texts.length = 0;

    const diff = getGoldDifficulty();

    api.setEventMode({ active:true, key:'gold' });
    setStageVisual(api, `GOLD ${diff.name}`, diff.background || 'sta/backsabaku.png', diff.areaKey || 'desert', diff.areaName || '砂漠');
    api.showBanner(`GOLD STAGE ${diff.name}`);

    return true;
  }

  function update(api){
    if (!active) return false;

    if (eventType === 'gold') {
      return updateGold(api);
    }

    return false;
  }

  function onEntityKilled(entity, api){
    if (!active || !entity) return;

    if (entity.kind === 'boss' || entity.kind === 'midBoss') {
      entity.name = canonicalBossName(entity.name);

      if (window.MobShotEvents && window.MobShotEvents.recordEventBossKill) {
        window.MobShotEvents.recordEventBossKill(entity.name);
      }
    }
  }

  function beforeFinish(clear, api){
    if (!active || finishBonusApplied) return null;

    finishBonusApplied = true;

    let text = clear ? 'ゴールドステージクリア！' : 'イベント失敗';
    let bonusCoin = 0;
    let bonusDiamond = 0;

    const retryCopy = eventData ? clone(eventData) : retryEventData ? clone(retryEventData) : null;
    if (retryCopy && retryCopy.key) retryEventData = retryCopy;

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

      text = `${diff.name} 30秒クリア！ 報酬 ${bonusCoin.toLocaleString()} COIN${bonusDiamond ? ' + ' + bonusDiamond + ' DIAMOND' : ''}`;
    }

    if (!clear) {
      text = 'イベント失敗';
    }

    if (window.MobShotEvents && window.MobShotEvents.clearCurrentEvent) {
      window.MobShotEvents.clearCurrentEvent();
    }

    clearEventRequest();

    active = false;
    eventData = null;
    eventType = '';
    difficultyKey = '';

    setTimeout(forceEventResultButtons, 0);
    setTimeout(forceEventResultButtons, 100);
    setTimeout(forceEventResultButtons, 300);
    setTimeout(forceEventResultButtons, 700);

    return {
      event:true,
      text,
      retry:false,
      next:false,
      hideRetry:true
    };
  }

  function updateHud(api){
    if (!active) return false;

    if (eventType === 'gold') {
      const diff = getGoldDifficulty();
      const remain = Math.max(0, Math.ceil((GOLD_TIME_LIMIT_FRAMES - localFrame) / 60));

      if (api.hudStage) api.hudStage.textContent = `GOLD ${diff.name} ${remain}秒`;
      if (api.hudScore) api.hudScore.textContent = Math.floor(api.state.score).toLocaleString();
      if (api.hudCoin) api.hudCoin.textContent = Math.floor(api.state.coin).toLocaleString();
      if (api.hudLife) api.hudLife.textContent = Math.max(0, Math.ceil(api.state.hp));

      return true;
    }

    return false;
  }

  function hideResultButtons(){
    const retry = document.getElementById('resultRetryBtn');
    const home = document.getElementById('resultHomeBtn');
    const next = document.getElementById('resultNextBtn');

    if (retry) retry.style.display = 'none';
    if (next) next.style.display = 'none';
    if (home) home.style.display = '';
  }

  function forceEventResultButtons(){
    document.__mobShotEventResultMode = true;

    const retry = document.getElementById('resultRetryBtn');
    const next = document.getElementById('resultNextBtn');
    const home = document.getElementById('resultHomeBtn');

    if (retry) {
      retry.style.display = 'none';
      retry.disabled = true;
      retry.dataset.mobShotHiddenEventRetry = '1';
    }

    if (next) {
      next.style.display = 'none';
      next.disabled = true;
    }

    if (home) {
      home.style.display = '';
      home.disabled = false;
    }

    hideResultButtons();
  }

  function blockHiddenEventRetry(e){
    const retry = e && e.target && e.target.closest ? e.target.closest('#resultRetryBtn') : null;
    if (!retry) return;

    if (!document.__mobShotEventResultMode && retry.dataset.mobShotHiddenEventRetry !== '1') return;

    e.preventDefault();
    e.stopPropagation();
    if (e.stopImmediatePropagation) e.stopImmediatePropagation();

    forceEventResultButtons();
  }

  function draw(ctx, api){
    return;
  }

  function bindEventResultGuards(){
    if (document.__mobShotEventResultGuardsBound) return;
    document.__mobShotEventResultGuardsBound = true;

    document.addEventListener('pointerdown', blockHiddenEventRetry, true);
    document.addEventListener('touchstart', blockHiddenEventRetry, true);
    document.addEventListener('mousedown', blockHiddenEventRetry, true);
    document.addEventListener('click', blockHiddenEventRetry, true);
  }

  bindEventResultGuards();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindEventResultGuards);
  } else {
    bindEventResultGuards();
  }

  window.MobShotGameEvents = {
    startCurrentEvent,
    update,
    updateHud,
    draw,
    onEntityKilled,
    beforeFinish,
    canonicalBossName
  };
})();
