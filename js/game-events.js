'use strict';

(function(){
  const EVENT_SAVE_KEY = 'mobshot_event_mode_v1';
  const EVENT_START_VALID_MS = 12000;

  let active = false;
  let eventData = null;
  let eventType = '';
  let difficultyKey = '';
  let stageId = 0;

  let localFrame = 0;
  let nextEnemyAt = 0;
  let nextChestAt = 0;
  let nextGimmickAt = 0;
  let nextGateAt = 0;
  let spawnedBoss = false;
  let scoreAttackIndex = 0;
  let finishBonusApplied = false;
  let retryEventData = null;

  let questInfo = null;
  let questPhase = 0;
  let questKills = 0;
  let questBossSpawned = false;
  let questWaveSpawned = false;

  function canonicalBossName(name){
    const raw = String(name || '').trim();

    if (raw === '番人') return 'モブガーディアン';
    if (raw === '番人Ⅱ') return 'モブガーディアンⅡ';
    if (raw === '番人II') return 'モブガーディアンⅡ';

    return raw;
  }

  function normalizeName(name){
    return canonicalBossName(name)
      .replace(/\s/g, '')
      .replace(/　/g, '')
      .replace(/Ⅱ/g, 'II')
      .toLowerCase();
  }

  function sameName(a, b){
    return normalizeName(a) === normalizeName(b);
  }

  const GOLD_DIFFICULTY_FALLBACK = {
    easy:{
      key:'easy',
      name:'イージー',
      color:'#9dff73',
      clearCoin:300,
      firstCoin:3000,
      firstDiamond:5,
      chestMul:0.8,
      bossHpMul:1.0,
      bossCoinMul:1.0,
      bossMinHp:600,
      areaKey:'grass',
      areaName:'草原',
      background:'sta/backsougen.png',
      bosses:['ホークモブ','ミラモブ'],
      enemySpawn:true
    },
    hard:{
      key:'hard',
      name:'ハード',
      color:'#6be6ff',
      clearCoin:800,
      firstCoin:8000,
      firstDiamond:8,
      chestMul:1.4,
      bossHpMul:1.35,
      bossCoinMul:1.8,
      bossMinHp:1800,
      areaKey:'desert',
      areaName:'砂漠',
      background:'sta/backsabaku.png',
      bosses:['ミラモブⅡ','ネオンモブ'],
      enemySpawn:true
    },
    veryHard:{
      key:'veryHard',
      name:'ベリーハード',
      color:'#ffcf5b',
      clearCoin:1500,
      firstCoin:15000,
      firstDiamond:10,
      chestMul:2.2,
      bossHpMul:1.8,
      bossCoinMul:3.2,
      bossMinHp:3800,
      areaKey:'magma',
      areaName:'マグマ',
      background:'sta/backmagma.png',
      bosses:['ドラゴンモブ','ドラゴンモブⅡ'],
      enemySpawn:true
    },
    inferno:{
      key:'inferno',
      name:'インフェルノ',
      color:'#ff5b5b',
      clearCoin:3000,
      firstCoin:30000,
      firstDiamond:20,
      chestMul:3.5,
      bossHpMul:2.35,
      bossCoinMul:6.0,
      bossMinHp:7200,
      areaKey:'castle',
      areaName:'魔王城',
      background:'sta/backmao.png',
      bosses:['モブリリス','ドラゴンモブⅡ'],
      enemySpawn:true
    },
    legend:{
      key:'legend',
      name:'レジェンド',
      color:'#d86bff',
      clearCoin:7000,
      firstCoin:80000,
      firstDiamond:50,
      chestMul:5.5,
      bossHpMul:3.2,
      bossCoinMul:10.0,
      bossMinHp:12000,
      areaKey:'castle',
      areaName:'魔王城',
      background:'sta/backmao.png',
      bosses:['モブリリス','モブ魔王'],
      enemySpawn:true
    }
  };

  const DOUBLE_DIFFICULTY_FALLBACK = {
    easy:{ key:'easy', name:'イージー', color:'#9dff73', hpMul:0.9, scoreMul:1, firstCoin:2000, firstDiamond:3, bossMinHp:900 },
    hard:{ key:'hard', name:'ハード', color:'#60d9ff', hpMul:1.1, scoreMul:1.1, firstCoin:3500, firstDiamond:4, bossMinHp:1400 },
    veryHard:{ key:'veryHard', name:'ベリーハード', color:'#ffcf5b', hpMul:1.35, scoreMul:1.25, firstCoin:5000, firstDiamond:5, bossMinHp:2200 },
    inferno:{ key:'inferno', name:'インフェルノ', color:'#ff6b3d', hpMul:1.95, scoreMul:1.55, firstCoin:10000, firstDiamond:10, bossMinHp:4300 },
    legend:{ key:'legend', name:'レジェンド', color:'#d86bff', hpMul:2.75, scoreMul:2.1, firstCoin:30000, firstDiamond:50, bossMinHp:7800 }
  };

  const DOUBLE_STAGE_FALLBACK = [
    { id:1, areaKey:'grass', areaName:'草原', title:'草原', background:'sta/backsougen.png', bossA:'ホークモブ', bossB:'ミラモブ' },
    { id:2, areaKey:'desert', areaName:'砂漠', title:'砂漠', background:'sta/backsabaku.png', bossA:'モブガーディアン', bossB:'ネオンモブ' },
    { id:3, areaKey:'neon', areaName:'ネオン街', title:'ネオン街', background:'sta/backneon.png', bossA:'ドラゴンモブ', bossB:'ドラゴンモブⅡ' },
    { id:4, areaKey:'castle', areaName:'魔王城', title:'魔王城', background:'sta/backmao.png', bossA:'モブリリス', bossB:'モブ魔王' },
    { id:5, areaKey:'prison', areaName:'監獄', title:'監獄', background:'sta/stkan.png', bossA:'モブメイル', bossB:'モブスミス' },
    { id:6, areaKey:'seaRail', areaName:'海の線路', title:'海の線路', background:'sta/umisenro.png', bossA:'モブネプ', bossB:'ホークモブⅡ' },
    { id:7, areaKey:'last', areaName:'魔王の間', title:'魔王の間', background:'sta/makailast.png', bossA:'閻魔モブ', bossB:'ウルモブリリス', final:true, firstCoin:50000, firstDiamond:100, legendOnly:true }
  ];

  const DOUBLE_DEFAULT_STAGE_BY_DIFFICULTY = {
    easy:1,
    hard:2,
    veryHard:3,
    inferno:4,
    legend:7
  };

  const BOSS_FALLBACK = {
    'ホークモブ':{ name:'ホークモブ', image:'boss/hawks.png', hp:600, score:1000, coin:200 },
    'ホークモブⅡ':{ name:'ホークモブⅡ', image:'boss/hawks2.png', hp:900, score:1400, coin:280 },
    'ミラモブ':{ name:'ミラモブ', image:'boss/miraboss.png', hp:800, score:1300, coin:260 },
    'ミラモブⅡ':{ name:'ミラモブⅡ', image:'boss/bossmira2.png', hp:1200, score:1700, coin:340 },
    'モブガーディアン':{ name:'モブガーディアン', image:'boss/bossban.png', hp:1100, score:1600, coin:320 },
    'モブガーディアンⅡ':{ name:'モブガーディアンⅡ', image:'boss/bossban2.png', hp:1600, score:2100, coin:420 },
    'ネオンモブ':{ name:'ネオンモブ', image:'boss/bossneon.png', hp:1500, score:2200, coin:440 },
    'ネオンモブⅡ':{ name:'ネオンモブⅡ', image:'boss/bossneon2.png', hp:2100, score:2800, coin:560 },
    'ドラゴンモブ':{ name:'ドラゴンモブ', image:'boss/bossdragoon.png', hp:2100, score:3000, coin:600 },
    'ドラゴンモブⅡ':{ name:'ドラゴンモブⅡ', image:'boss/bossdragoon2.png', hp:2900, score:3900, coin:780 },
    'モブリリス':{ name:'モブリリス', image:'boss/bossriris.png', hp:2800, score:4200, coin:840 },
    'モブ魔王':{ name:'モブ魔王', image:'boss/bossmaoh.png', hp:3800, score:6000, coin:1200 },
    'モブメイル':{ name:'モブメイル', image:'boss/bossmeiru.png', hp:3200, score:5200, coin:1000 },
    'モブスミス':{ name:'モブスミス', image:'boss/bosssmith.png', hp:3400, score:5400, coin:1080 },
    'モブネプ':{ name:'モブネプ', image:'boss/bossmobnep.png', hp:3600, score:5600, coin:1120 },
    'ブルネオモブ':{ name:'ブルネオモブ', image:'boss/bossneonblue.png', hp:3600, score:5800, coin:1160 },
    'パルネオモブ':{ name:'パルネオモブ', image:'boss/bossneonpur.png', hp:3700, score:5900, coin:1180 },
    '閻魔モブ':{ name:'閻魔モブ', image:'boss/bossenmob.png', hp:4400, score:7200, coin:1440 },
    'ウルモブリリス':{ name:'ウルモブリリス', image:'boss/bossulriri.png', hp:5200, score:9000, coin:1800 }
  };

  const MID_BOSS_FALLBACK = {
    'モブプテラ':{ name:'モブプテラ', image:'en/enpte.png', hp:80, score:300, coin:30 },
    'モブデュアル':{ name:'モブデュアル', image:'en/sabadual.png', hp:120, score:420, coin:42 },
    'モブピー':{ name:'モブピー', image:'en/enmobpi.png', hp:95, score:360, coin:36 },
    'モブギドラ':{ name:'モブギドラ', image:'en/neongidra.png', hp:220, score:800, coin:80 },
    'マグモブレム':{ name:'マグモブレム', image:'en/enmaggolem.png', hp:300, score:1050, coin:110 },
    'グラディモブ':{ name:'グラディモブ', image:'en/mobgra.png', hp:260, score:900, coin:90 },
    'モブニコ':{ name:'モブニコ', image:'en/mobnico.png', hp:180, score:620, coin:62 },
    'モブラス':{ name:'モブラス', image:'en/mobras.png', hp:230, score:760, coin:76 },
    'ガトリモブ':{ name:'ガトリモブ', image:'en/gatorimob.png', hp:210, score:720, coin:72 },
    'ジェイモブ':{ name:'ジェイモブ', image:'en/jmob.png', hp:220, score:740, coin:74 },
    'モブサメ':{ name:'モブサメ', image:'en/mobsame.png', hp:250, score:820, coin:82 },
    'モブシャチ':{ name:'モブシャチ', image:'en/shatimob.png', hp:280, score:880, coin:88 },
    'モブコード':{ name:'モブコード', image:'en/mobcode.png', hp:220, score:760, coin:76 },
    'モブケーブル':{ name:'モブケーブル', image:'en/mobcable.png', hp:240, score:800, coin:80 },
    'モブマグシャー':{ name:'モブマグシャー', image:'en/mobmagsya.png', hp:290, score:980, coin:98 },
    'モブガラド':{ name:'モブガラド', image:'en/mobgarado.png', hp:280, score:940, coin:94 },
    'モブメルト':{ name:'モブメルト', image:'en/mobmerut.png', hp:300, score:1000, coin:100 }
  };

  const SCORE_ATTACK_BOSSES = [
    BOSS_FALLBACK['ホークモブ'],
    BOSS_FALLBACK['ミラモブ'],
    BOSS_FALLBACK['モブガーディアン'],
    BOSS_FALLBACK['ネオンモブ'],
    BOSS_FALLBACK['ドラゴンモブ'],
    BOSS_FALLBACK['モブリリス'],
    BOSS_FALLBACK['モブ魔王'],
    BOSS_FALLBACK['ウルモブリリス']
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

  function normalizeDifficultyKey(key){
    const raw = String(key || '').trim();

    if (raw === 'イージー') return 'easy';
    if (raw === 'ハード') return 'hard';
    if (raw === 'ベリーハード') return 'veryHard';
    if (raw === 'インフェルノ') return 'inferno';
    if (raw === 'レジェンド') return 'legend';

    if (raw === 'easy') return 'easy';
    if (raw === 'hard') return 'hard';
    if (raw === 'veryHard') return 'veryHard';
    if (raw === 'veryhard') return 'veryHard';
    if (raw === 'inferno') return 'inferno';
    if (raw === 'legend') return 'legend';

    return raw || 'easy';
  }

  function readEventRequest(){
    try {
      const raw = localStorage.getItem(EVENT_SAVE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch(e) {
      return null;
    }
  }

  function writeEventRequest(data){
    if (!data || !data.key) return;

    try {
      const save = clone(data);
      save.startedAt = Date.now();
      localStorage.setItem(EVENT_SAVE_KEY, JSON.stringify(save));
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

  function mergeDiff(base, extra){
    const merged = Object.assign({}, base || {}, extra || {});

    if (Array.isArray(merged.bosses)) {
      merged.bosses = merged.bosses.map(canonicalBossName);
    }

    if (merged.bossA) merged.bossA = canonicalBossName(merged.bossA);
    if (merged.bossB) merged.bossB = canonicalBossName(merged.bossB);

    return merged;
  }

  function getGoldDifficulty(){
    const key = normalizeDifficultyKey(
      difficultyKey ||
      (eventData && eventData.difficulty) ||
      (eventData && eventData.difficultyKey)
    );

    let diff = clone(GOLD_DIFFICULTY_FALLBACK[key] || GOLD_DIFFICULTY_FALLBACK.easy);

    if (window.MobShotEvents && window.MobShotEvents.getCurrentGoldDifficulty) {
      const fromEvents = window.MobShotEvents.getCurrentGoldDifficulty();
      if (fromEvents && normalizeDifficultyKey(fromEvents.key || fromEvents.difficulty || key) === key) {
        diff = mergeDiff(diff, fromEvents);
      }
    }

    if (eventData && eventData.goldDifficulty) {
      const d = eventData.goldDifficulty;
      if (normalizeDifficultyKey(d.key || d.difficulty || key) === key) {
        diff = mergeDiff(diff, d);
      }
    }

    const fixed = GOLD_DIFFICULTY_FALLBACK[key] || GOLD_DIFFICULTY_FALLBACK.easy;

    diff.key = fixed.key;
    diff.bosses = fixed.bosses.slice();
    diff.areaKey = fixed.areaKey;
    diff.areaName = fixed.areaName;
    diff.background = fixed.background;
    diff.bossHpMul = fixed.bossHpMul;
    diff.bossCoinMul = fixed.bossCoinMul;
    diff.bossMinHp = fixed.bossMinHp;
    diff.chestMul = fixed.chestMul;
    diff.enemySpawn = fixed.enemySpawn;

    return diff;
  }

  function normalizeDoubleStageId(value, diffKey){
    const n = Number(value || 0);
    if (n >= 1) return n;

    return Number(DOUBLE_DEFAULT_STAGE_BY_DIFFICULTY[diffKey] || 1);
  }

  function findDoubleStageFromEvent(data, diffKey){
    data = data || {};

    const directId = normalizeDoubleStageId(
      data.stageId ||
      data.doubleStageId ||
      data.doubleBossStageId ||
      data.selectedStageId ||
      data.areaId ||
      data.id ||
      (data.stage && data.stage.id) ||
      (data.doubleStage && data.doubleStage.id),
      ''
    );

    if (directId >= 1) {
      return clone(DOUBLE_STAGE_FALLBACK.find(s => Number(s.id) === directId) || DOUBLE_STAGE_FALLBACK[directId - 1] || DOUBLE_STAGE_FALLBACK[0]);
    }

    const bossA = canonicalBossName(
      data.bossA ||
      data.boss1 ||
      data.firstBoss ||
      data.leftBoss ||
      (data.stage && (data.stage.bossA || data.stage.boss1 || data.stage.firstBoss)) ||
      (data.doubleStage && (data.doubleStage.bossA || data.doubleStage.boss1 || data.doubleStage.firstBoss))
    );

    const bossB = canonicalBossName(
      data.bossB ||
      data.boss2 ||
      data.secondBoss ||
      data.rightBoss ||
      (data.stage && (data.stage.bossB || data.stage.boss2 || data.stage.secondBoss)) ||
      (data.doubleStage && (data.doubleStage.bossB || data.doubleStage.boss2 || data.doubleStage.secondBoss))
    );

    if (bossA && bossB) {
      const found = DOUBLE_STAGE_FALLBACK.find(s => sameName(s.bossA, bossA) && sameName(s.bossB, bossB));
      const base = found ? clone(found) : clone(DOUBLE_STAGE_FALLBACK[0]);

      base.bossA = bossA;
      base.bossB = bossB;

      if (data.areaKey) base.areaKey = data.areaKey;
      if (data.areaName) base.areaName = data.areaName;
      if (data.title) base.title = data.title;
      if (data.background) base.background = data.background;

      if (data.stage) {
        if (data.stage.areaKey) base.areaKey = data.stage.areaKey;
        if (data.stage.areaName) base.areaName = data.stage.areaName;
        if (data.stage.title) base.title = data.stage.title;
        if (data.stage.background) base.background = data.stage.background;
      }

      if (data.doubleStage) {
        if (data.doubleStage.areaKey) base.areaKey = data.doubleStage.areaKey;
        if (data.doubleStage.areaName) base.areaName = data.doubleStage.areaName;
        if (data.doubleStage.title) base.title = data.doubleStage.title;
        if (data.doubleStage.background) base.background = data.doubleStage.background;
      }

      return base;
    }

    const areaKey = data.areaKey || (data.stage && data.stage.areaKey) || (data.doubleStage && data.doubleStage.areaKey);
    const areaName = data.areaName || data.title || (data.stage && (data.stage.areaName || data.stage.title)) || (data.doubleStage && (data.doubleStage.areaName || data.doubleStage.title));

    if (areaKey || areaName) {
      const found = DOUBLE_STAGE_FALLBACK.find(s =>
        String(s.areaKey) === String(areaKey) ||
        String(s.areaName) === String(areaName) ||
        String(s.title) === String(areaName)
      );

      if (found) return clone(found);
    }

    return clone(DOUBLE_STAGE_FALLBACK.find(s => Number(s.id) === normalizeDoubleStageId(0, diffKey)) || DOUBLE_STAGE_FALLBACK[0]);
  }

  function getDoubleInfo(){
    const diffKey = normalizeDifficultyKey(
      difficultyKey ||
      (eventData && eventData.difficulty) ||
      (eventData && eventData.difficultyKey) ||
      'veryHard'
    );

    let diff = clone(DOUBLE_DIFFICULTY_FALLBACK[diffKey] || DOUBLE_DIFFICULTY_FALLBACK.veryHard);
    let stage = findDoubleStageFromEvent(eventData, diffKey);

    if (window.MobShotEvents && window.MobShotEvents.getCurrentDoubleBoss) {
      const fromEvents = window.MobShotEvents.getCurrentDoubleBoss();

      if (fromEvents && fromEvents.difficulty) {
        diff = mergeDiff(diff, fromEvents.difficulty);
        diff.key = diffKey;
      }

      if (fromEvents && fromEvents.stage) {
        const stageFromEvents = findDoubleStageFromEvent({
          stage:fromEvents.stage,
          stageId:fromEvents.stage.id,
          bossA:fromEvents.stage.bossA,
          bossB:fromEvents.stage.bossB,
          areaKey:fromEvents.stage.areaKey,
          areaName:fromEvents.stage.areaName,
          title:fromEvents.stage.title,
          background:fromEvents.stage.background
        }, diffKey);

        if (
          Number(stageFromEvents.id || 0) !== 1 ||
          Number(stage.id || 0) === 1 ||
          !eventData ||
          !(
            eventData.stageId ||
            eventData.doubleStageId ||
            eventData.doubleBossStageId ||
            eventData.selectedStageId ||
            eventData.bossA ||
            eventData.bossB ||
            eventData.stage ||
            eventData.doubleStage
          )
        ) {
          stage = Object.assign(stage, stageFromEvents);
        }
      }
    }

    if (eventData && eventData.difficultyData) {
      diff = mergeDiff(diff, eventData.difficultyData);
      diff.key = diffKey;
    }

    if (eventData) {
      const explicitStage = findDoubleStageFromEvent(eventData, diffKey);

      if (
        eventData.stageId ||
        eventData.doubleStageId ||
        eventData.doubleBossStageId ||
        eventData.selectedStageId ||
        eventData.bossA ||
        eventData.bossB ||
        eventData.stage ||
        eventData.doubleStage ||
        eventData.areaKey ||
        eventData.areaName
      ) {
        stage = explicitStage;
      }
    }

    if (diffKey !== 'legend' && stage.legendOnly) {
      stage = clone(DOUBLE_STAGE_FALLBACK.find(s => Number(s.id) === 6) || DOUBLE_STAGE_FALLBACK[0]);
    }

    stage.bossA = canonicalBossName(stage.bossA);
    stage.bossB = canonicalBossName(stage.bossB);

    if (!stage.bossA || !stage.bossB) {
      const fallbackStage = DOUBLE_STAGE_FALLBACK.find(s => Number(s.id) === Number(stage.id)) || DOUBLE_STAGE_FALLBACK[0];
      stage.bossA = stage.bossA || fallbackStage.bossA;
      stage.bossB = stage.bossB || fallbackStage.bossB;
    }

    diff.key = diffKey;

    return { difficulty:diff, stage };
  }

  function getQuestInfo(){
    let fromEvents = null;

    if (window.MobShotEvents && window.MobShotEvents.getCurrentQuest) {
      fromEvents = window.MobShotEvents.getCurrentQuest();
    }

    if (fromEvents && fromEvents.difficulty && fromEvents.stage) return fromEvents;

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
        areaName:'草原',
        background:'sta/backsougen.png'
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

  function stageAreaData(areaKey){
    const stageData = window.MOBSHOT_STAGE_DATA || {};
    return stageData[areaKey] || null;
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

  function questDifficultyPowerMul(key){
    key = normalizeDifficultyKey(key);

    if (key === 'easy') return 1;
    if (key === 'hard') return 2.4;
    if (key === 'veryHard') return 6.5;
    if (key === 'inferno') return 12;
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

    return [
      { name:'銀の宝箱', image:'gimi/takagin.png', hp:10, score:80, coinMin:10, coinMax:25 },
      { name:'金の宝箱', image:'gimi/takagol.png', hp:18, score:160, coinMin:25, coinMax:60 }
    ];
  }

  function fallbackBossByName(name){
    name = canonicalBossName(name);

    if (BOSS_FALLBACK[name]) return clone(BOSS_FALLBACK[name]);

    const key = Object.keys(BOSS_FALLBACK).find(k => sameName(k, name));
    if (key) return clone(BOSS_FALLBACK[key]);

    if (MID_BOSS_FALLBACK[name]) return clone(MID_BOSS_FALLBACK[name]);

    const midKey = Object.keys(MID_BOSS_FALLBACK).find(k => sameName(k, name));
    if (midKey) return clone(MID_BOSS_FALLBACK[midKey]);

    return {
      name:name || 'ホークモブ',
      image:'boss/hawks.png',
      hp:1000,
      score:1000,
      coin:300
    };
  }

  function eventBossDef(name){
    return fallbackBossByName(canonicalBossName(name));
  }

  function fixBossDef(def){
    def = clone(def || {});
    def.name = canonicalBossName(def.name);

    const fallback = fallbackBossByName(def.name);

    def.image = def.image || fallback.image;
    def.hp = Number(def.hp || fallback.hp || 1000);
    def.score = Number(def.score || fallback.score || 1000);
    def.coin = Number(def.coin || fallback.coin || 100);

    return def;
  }

  function findBossDef(api, areaKey, name, fallback){
    name = canonicalBossName(name);
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

    const found = candidates.find(item => item && sameName(item.name, name));

    if (found) return fixBossDef(found);

    if (fallback) {
      const fixed = Object.assign(fallbackBossByName(name), fallback);
      fixed.name = canonicalBossName(name || fixed.name);
      return fixBossDef(fixed);
    }

    return fallbackBossByName(name);
  }

  function getMidBossDef(api, areaKey, name, fallback){
    name = canonicalBossName(name);
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
    if (found) return fixBossDef(found);

    return findBossDef(api, areaKey, name, fallback || fallbackBossByName(name));
  }

  function setStageVisual(api, title, background, areaKey, areaName){
    const D = api.D;
    if (!D || !D.stage) return;

    const area = stageAreaData(areaKey);
    const bg = background || (area && area.background) || D.stage.background;

    D.stage.id = title || 'EVENT';
    D.stage.name = title || 'EVENT';
    D.stage.areaName = areaName || (area && area.name) || title || 'EVENT';
    D.stage.areaType = areaKey || title || 'EVENT';
    D.stage.areaKey = areaKey || D.stage.areaKey;
    D.stage.difficulty = title || 'EVENT';

    if (bg) D.stage.background = bg;
  }

  function makeBossEntity(def, api, opt){
    opt = opt || {};
    def = fixBossDef(def);

    const W = api.W;
    const H = api.H;
    const x = opt.x != null ? opt.x : W / 2;
    const hpMul = opt.hpMul != null ? opt.hpMul : 1;
    const scoreMul = opt.scoreMul != null ? opt.scoreMul : 1;
    const coinMul = opt.coinMul != null ? opt.coinMul : 1;
    const minHp = Number(opt.minHp || 0);
    const r = opt.r != null ? opt.r : 112;
    const kind = opt.kind ? opt.kind : 'boss';
    const hp = Math.max(minHp, Math.ceil(Number(def.hp || 1000) * hpMul));
    const scale = opt.scale != null ? Number(opt.scale) : 1;

    return {
      kind,
      name:def.name || 'ホークモブ',
      image:def.image || fallbackBossByName(def.name).image || 'boss/hawks.png',
      x,
      y:opt.y != null ? opt.y : -240,
      baseY:opt.baseY != null ? opt.baseY : H * 0.21,
      targetY:opt.targetY != null ? opt.targetY : H * 0.21,
      vx:opt.vx != null ? opt.vx : 1.35,
      vy:opt.vy != null ? opt.vy : 1.55,
      r,
      hp,
      maxHp:hp,
      score:Math.ceil(Number(def.score || 1000) * scoreMul),
      coin:Math.ceil(Number(def.coin || 100) * coinMul),
      dead:false,
      shootCd:opt.shootCd != null ? opt.shootCd : 92,
      attackCd:opt.attackCd != null ? opt.attackCd : 160,
      attackStep:0,
      contactDmg:opt.contactDmg != null ? opt.contactDmg : 20,
      hitPlayerCd:0,
      bob:0,
      scale,
      drawScale:scale,
      sizeMul:scale,
      eventBoss:true,
      eventType:eventType,
      eventDifficulty:opt.eventDifficulty || difficultyKey || '',
      questBoss:!!opt.questBoss
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
      vx:rand(-0.65, 0.65),
      vy:1.65 + rand(0, 0.35),
      r:def.name === 'モブロック' ? 36 : 31,
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
      vy:1.55,
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
      vy:1.6,
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

  function spawnEventGate(api){
    if (!window.MobShotSpawn || !window.MobShotSpawn.spawnGatePair) return;
    if (!api || !api.makeTools) return;

    try {
      window.MobShotSpawn.spawnGatePair(api.makeTools());
      if (api.addText) api.addText('GATE', api.W / 2, api.H * 0.34, '#6be6ff');
    } catch(err) {
      console.error('event gate spawn error:', err);
    }
  }

  function spawnGoldBosses(api){
    if (spawnedBoss) return;

    const state = api.state;
    const W = api.W;
    const diff = getGoldDifficulty();
    const names = Array.isArray(diff.bosses) && diff.bosses.length
      ? diff.bosses.slice(0, 2).map(canonicalBossName)
      : ['ホークモブ', 'ミラモブ'];

    while (names.length < 2) names.push(names[0] || 'ホークモブ');

    const bosses = [
      eventBossDef(names[0]),
      eventBossDef(names[1])
    ];

    const positions = [W * 0.34, W * 0.66];

    bosses.forEach((def, index) => {
      state.entities.push(makeBossEntity(def, api, {
        x:positions[index],
        hpMul:Number(diff.bossHpMul || 1),
        minHp:Number(diff.bossMinHp || 0),
        scoreMul:Number(diff.bossCoinMul || 1),
        coinMul:Number(diff.bossCoinMul || 1),
        vx:index === 0 ? 1.25 : -1.25,
        shootCd:92,
        attackCd:165,
        contactDmg:22,
        r:106,
        eventDifficulty:diff.key
      }));
    });

    spawnedBoss = true;
  }

  function updateGold(api){
    const state = api.state;
    const diff = getGoldDifficulty();
    const areaKey = diff.areaKey || 'grass';
    const enemyPower = eventEnemyPowerMul(diff.key);

    localFrame++;

    if (localFrame === 1) api.showBanner(`GOLD STAGE ${diff.name}`);
    if (localFrame >= 40) spawnGoldBosses(api);

    if (localFrame >= nextEnemyAt) {
      if (diff.enemySpawn !== false) {
        spawnAreaEnemy(
          api,
          areaKey,
          Number(diff.bossHpMul || 1) * 0.35 * enemyPower,
          Number(diff.bossCoinMul || 1)
        );
      }

      nextEnemyAt = localFrame + intRand(
        diff.key === 'legend' ? 120 : diff.key === 'inferno' ? 145 : 180,
        diff.key === 'legend' ? 180 : diff.key === 'inferno' ? 220 : 270
      );
    }

    if (localFrame >= nextGimmickAt) {
      spawnAreaGimmick(
        api,
        areaKey,
        Number(diff.bossHpMul || 1) * 0.45 * enemyPower,
        Number(diff.chestMul || 1)
      );

      nextGimmickAt = localFrame + intRand(170, 250);
    }

    if (localFrame >= nextChestAt) {
      if (Math.random() < 0.55) {
        spawnAreaChest(
          api,
          areaKey,
          Math.max(1, enemyPower * 0.45),
          Number(diff.chestMul || 1) * 3
        );
      }

      nextChestAt = localFrame + intRand(190, 290);
    }

    const bossAlive = state.entities.some(e => !e.dead && e.kind === 'boss');

    if (spawnedBoss && !bossAlive && localFrame > 120) api.finishRun(true);

    return true;
  }

  function spawnDoubleBosses(api){
    if (spawnedBoss) return;

    const info = getDoubleInfo();
    const diff = info.difficulty;
    const stage = info.stage;
    const W = api.W;
    const state = api.state;

    const bossA = eventBossDef(stage.bossA);
    const bossB = eventBossDef(stage.bossB);

    state.entities.push(makeBossEntity(bossA, api, {
      x:W * 0.34,
      hpMul:Number(diff.hpMul || 1),
      minHp:Number(diff.bossMinHp || 0),
      scoreMul:Number(diff.scoreMul || 1),
      coinMul:Number(diff.scoreMul || 1),
      vx:1.35,
      shootCd:92,
      attackCd:160,
      contactDmg:24,
      eventDifficulty:diff.key
    }));

    state.entities.push(makeBossEntity(bossB, api, {
      x:W * 0.66,
      hpMul:Number(diff.hpMul || 1),
      minHp:Number(diff.bossMinHp || 0),
      scoreMul:Number(diff.scoreMul || 1),
      coinMul:Number(diff.scoreMul || 1),
      vx:-1.35,
      shootCd:92,
      attackCd:160,
      contactDmg:24,
      eventDifficulty:diff.key
    }));

    spawnedBoss = true;
  }

  function updateDoubleBoss(api){
    const state = api.state;
    const info = getDoubleInfo();
    const diff = info.difficulty;

    localFrame++;

    if (localFrame === 1) {
      api.showBanner(`ダブルボス ${info.stage.title}`);
    }

    if (localFrame >= 60) {
      spawnDoubleBosses(api);
    }

    if (localFrame >= nextGateAt) {
      spawnEventGate(api);
      nextGateAt = localFrame + 1200;
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
      shootCd:Math.max(70, 92 - scoreAttackIndex * 2),
      attackCd:Math.max(115, 150 - scoreAttackIndex * 4),
      contactDmg:20 + scoreAttackIndex * 2
    }));

    api.showBanner(`${scoreAttackIndex + 1}. ${def.name}`);
    spawnedBoss = true;
  }

  function updateScoreAttack(api){
    const state = api.state;

    localFrame++;

    if (localFrame === 1) api.showBanner('スコアアタック');
    if (!spawnedBoss && localFrame > 60) spawnScoreAttackBoss(api);

    const bossAlive = state.entities.some(e => !e.dead && e.kind === 'boss');

    if (spawnedBoss && !bossAlive && localFrame > 90) {
      scoreAttackIndex++;
      spawnedBoss = false;
      localFrame = 40;

      if (scoreAttackIndex >= SCORE_ATTACK_BOSSES.length) api.finishRun(true);
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
    const difficultyPower = questDifficultyPowerMul(diff.key);
    const base = Number(diff.hpMul || 1);
    const local = Number(extra == null ? 1 : extra);

    return base * difficultyPower * local;
  }

  function questEnemyHpMul(extra){
    const diff = currentQuestDiff();

    return Number(diff.enemyHpMul || diff.hpMul || 1) *
      questDifficultyPowerMul(diff.key) *
      Number(extra == null ? 1 : extra);
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
    opt = opt || {};

    const W = api.W;
    const H = api.H;
    const count = defs.length;
    const margin = count <= 2 ? 0.32 : count <= 3 ? 0.24 : 0.14;
    const spanA = W * margin;
    const spanB = W * (1 - margin);

    defs.forEach((def, index) => {
      def = fixBossDef(def);

      const t = count === 1 ? 0.5 : index / (count - 1);
      const x = spanA + (spanB - spanA) * t;
      const side = index % 2 === 0 ? 1 : -1;

      api.state.entities.push(makeBossEntity(def, api, {
        kind:opt.kind ? opt.kind : 'midBoss',
        x,
        y:-170 - index * 24,
        baseY:H * 0.22 + index * 8,
        targetY:H * 0.22 + index * 8,
        hpMul:questHpMul(opt.hpMul != null ? opt.hpMul : 1),
        scoreMul:questScoreMul(opt.scoreMul != null ? opt.scoreMul : 1),
        coinMul:questCoinMul(opt.coinMul != null ? opt.coinMul : 1),
        vx:side * Number(opt.vx != null ? opt.vx : 1.15),
        shootCd:opt.shootCd != null ? opt.shootCd : 100,
        attackCd:opt.attackCd != null ? opt.attackCd : 155,
        contactDmg:opt.contactDmg != null ? opt.contactDmg : 18,
        r:opt.r != null ? opt.r : 78,
        scale:opt.scale != null ? opt.scale : 1,
        questBoss:true
      }));
    });
  }

  function updateQuestFieldSpawns(api, areaKey, opt){
    opt = opt || {};

    const enemyInterval = opt.enemyInterval ? opt.enemyInterval : [125, 185];
    const gimmickInterval = opt.gimmickInterval ? opt.gimmickInterval : [160, 245];

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
    const ptera = getMidBossDef(api, 'grass', 'モブプテラ', MID_BOSS_FALLBACK['モブプテラ']);
    const waves = [2, 3, 5];

    updateQuestFieldSpawns(api, stage.areaKey);

    if (!questWaveSpawned && localFrame > 45) {
      const count = waves[questPhase] || 0;
      const defs = [];

      for (let i = 0; i < count; i++) defs.push(ptera);

      spawnQuestBossGroup(api, defs, {
        kind:'midBoss',
        hpMul:0.9 + questPhase * 0.18,
        scoreMul:0.8,
        coinMul:0.7,
        r:72,
        contactDmg:15 + questPhase * 2,
        shootCd:110,
        attackCd:165
      });

      api.showBanner(`プテラッシュ ${count}体`);
      questWaveSpawned = true;
    }

    if (questWaveSpawned && !activeQuestBossAlive(api) && localFrame > 90) {
      questPhase++;
      questWaveSpawned = false;
      localFrame = 35;

      if (questPhase >= waves.length) api.finishRun(true);
    }
  }

  function updateThieves(api){
    const stage = currentQuestStage();

    updateQuestFieldSpawns(api, stage.areaKey, {
      enemyInterval:[85, 125],
      gimmickInterval:[160, 250]
    });

    if (!questBossSpawned && localFrame > 45) {
      const mira = eventBossDef('ミラモブ');

      spawnQuestBossGroup(api, [mira], {
        kind:'boss',
        hpMul:1.2,
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

    if (
      questBossSpawned &&
      !activeQuestBossAlive(api) &&
      questKills >= 30 &&
      localFrame > 120
    ) {
      api.finishRun(true);
    }
  }

  function updateGuardianTest(api){
    const stage = currentQuestStage();

    updateQuestFieldSpawns(api, stage.areaKey);

    if (!questWaveSpawned && localFrame > 55) {
      const guardian = eventBossDef('モブガーディアン');

      spawnQuestBossGroup(api, [guardian, guardian], {
        kind:'boss',
        hpMul:0.92,
        scoreMul:0.75,
        coinMul:0.65,
        r:66,
        contactDmg:16,
        vx:1.0,
        shootCd:110,
        attackCd:170
      });

      api.showBanner('ガーディアン試験');
      questWaveSpawned = true;
    }

    if (questWaveSpawned && !activeQuestBossAlive(api) && localFrame > 120) {
      api.finishRun(true);
    }
  }

  function updateNineHeads(api){
    const stage = currentQuestStage();
    const ghidora = getMidBossDef(api, 'neon', 'モブギドラ', MID_BOSS_FALLBACK['モブギドラ']);

    updateQuestFieldSpawns(api, stage.areaKey);

    if (!questWaveSpawned && questPhase === 0 && localFrame > 55) {
      spawnQuestBossGroup(api, [ghidora, ghidora, ghidora], {
        kind:'midBoss',
        hpMul:1.1,
        scoreMul:0.9,
        coinMul:0.75,
        r:80,
        contactDmg:20,
        shootCd:100,
        attackCd:150
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
        hpMul:2.35,
        scoreMul:1.8,
        coinMul:1.2,
        r:116,
        contactDmg:28,
        vx:1.3,
        shootCd:90,
        attackCd:140
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
      enemyInterval:[80, 120],
      gimmickInterval:[155, 235]
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
      const dragon = eventBossDef('ドラゴンモブ');
      const magrem = getMidBossDef(api, 'magma', 'マグモブレム', MID_BOSS_FALLBACK['マグモブレム']);

      spawnQuestBossGroup(api, [dragon, magrem, magrem], {
        kind:'midBoss',
        hpMul:1.28,
        scoreMul:1.15,
        coinMul:0.9,
        r:88,
        contactDmg:24,
        shootCd:100,
        attackCd:155
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
      const lilith = eventBossDef('モブリリス');

      spawnQuestBossGroup(api, [lilith, lilith, lilith, lilith], {
        kind:'boss',
        hpMul:0.82,
        scoreMul:0.75,
        coinMul:0.65,
        r:56,
        scale:0.5,
        contactDmg:12,
        shootCd:100,
        attackCd:165,
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

  function rollDropCount(){
    let count = 0;
    if (Math.random() < 0.90) count++;
    if (Math.random() < 0.40) count++;
    if (Math.random() < 0.20) count++;
    return count;
  }

  function stoneMaster(no){
    if (!window.MobShotGacha || !window.MobShotGacha.allStones) return null;
    return window.MobShotGacha.allStones().find(s => Number(s.no) === Number(no)) || null;
  }

  function addDropStone(no, count, drops){
    const stone = stoneMaster(no);
    if (!stone || count <= 0) return;

    if (window.MobShotGacha && window.MobShotGacha.addStoneByNo) {
      window.MobShotGacha.addStoneByNo(no, count);
    }

    drops.push({
      no,
      name:stone.name,
      image:stone.image,
      rarity:stone.rarity,
      count
    });
  }

  function rollEventQuestDrops(diffKey, stage){
    diffKey = normalizeDifficultyKey(diffKey);

    const drops = [];

    if (diffKey === 'easy') {
      addDropStone(91, rollDropCount(), drops);
    }

    if (diffKey === 'veryHard') {
      addDropStone(92, rollDropCount(), drops);
      addDropStone(93, rollDropCount(), drops);
    }

    if (diffKey === 'legend') {
      addDropStone(94, rollDropCount(), drops);
      addDropStone(95, rollDropCount(), drops);
    }

    if (stage && stage.key === 'lilith_sisters') {
      const chance96 = diffKey === 'legend' ? 0.60 : diffKey === 'veryHard' ? 0.30 : 0.15;
      const chance106 = diffKey === 'legend' ? 0.15 : diffKey === 'veryHard' ? 0.10 : 0.05;

      if (Math.random() < chance96) addDropStone(96, 1, drops);
      if (Math.random() < chance106) addDropStone(106, 1, drops);
    }

    return drops;
  }

  function injectDropStyle(){
    if (document.getElementById('mobEventDropStyle')) return;

    const style = document.createElement('style');
    style.id = 'mobEventDropStyle';
    style.textContent = `
      .mob-event-drop-pop{
        position:absolute;
        inset:0;
        z-index:190;
        display:flex;
        align-items:center;
        justify-content:center;
        padding:18px;
        background:rgba(0,0,0,.68);
      }
      .mob-event-drop-pop.hidden{display:none}
      .mob-event-drop-card{
        width:min(92vw,440px);
        border-radius:28px;
        padding:18px;
        text-align:center;
        background:linear-gradient(180deg,rgba(35,28,78,.98),rgba(5,8,22,.98));
        border:3px solid rgba(255,255,255,.38);
        box-shadow:0 18px 48px rgba(0,0,0,.72);
      }
      .mob-event-drop-title{
        font-size:25px;
        font-weight:1000;
        color:#ffe66b;
        text-shadow:0 3px 0 #000,0 0 14px rgba(255,230,107,.7);
        margin-bottom:12px;
      }
      .mob-event-drop-list{
        display:grid;
        grid-template-columns:1fr;
        gap:10px;
        margin-bottom:14px;
      }
      .mob-event-drop-item{
        display:grid;
        grid-template-columns:74px 1fr;
        gap:10px;
        align-items:center;
        padding:10px;
        border-radius:18px;
        background:rgba(255,255,255,.10);
        border:2px solid rgba(255,255,255,.20);
      }
      .mob-event-drop-item img{
        width:68px;
        height:68px;
        object-fit:contain;
        filter:drop-shadow(0 5px 0 rgba(0,0,0,.35));
      }
      .mob-event-drop-name{
        color:#fff;
        font-size:15px;
        font-weight:1000;
        line-height:1.35;
        text-align:left;
        text-shadow:0 2px 0 #000;
      }
      .mob-event-drop-count{
        margin-top:4px;
        color:#ffcf5b;
        font-size:13px;
        font-weight:1000;
        text-align:left;
      }
      .mob-event-drop-ok{
        border:0;
        border-radius:999px;
        padding:12px 28px;
        font-size:16px;
        font-weight:1000;
        color:#181000;
        background:linear-gradient(#ffe66b,#ffb423);
        box-shadow:0 5px 0 rgba(0,0,0,.35);
      }
    `;

    document.head.appendChild(style);
  }

  function ensureDropPop(){
    injectDropStyle();

    let pop = document.getElementById('mobEventDropPop');
    if (pop) return pop;

    pop = document.createElement('div');
    pop.id = 'mobEventDropPop';
    pop.className = 'mob-event-drop-pop hidden';
    pop.innerHTML = `
      <div class="mob-event-drop-card">
        <div class="mob-event-drop-title">STONE DROP!</div>
        <div id="mobEventDropList" class="mob-event-drop-list"></div>
        <button id="mobEventDropOk" class="mob-event-drop-ok" type="button">OK</button>
      </div>
    `;

    const app = document.getElementById('app') || document.body;
    app.appendChild(pop);

    document.getElementById('mobEventDropOk').addEventListener('click', function(){
      pop.classList.add('hidden');
    });

    pop.addEventListener('click', function(e){
      if (e.target === pop) pop.classList.add('hidden');
    });

    return pop;
  }

  function showDropPop(drops){
    if (!drops || !drops.length) return;

    const pop = ensureDropPop();
    const list = document.getElementById('mobEventDropList');

    if (!list) return;

    list.innerHTML = drops.map(drop => `
      <div class="mob-event-drop-item">
        <img src="${drop.image}" alt="${drop.name}" onerror="this.style.display='none'">
        <div>
          <div class="mob-event-drop-name">${drop.name}</div>
          <div class="mob-event-drop-count">${drop.name}が${drop.count}枚ドロップ！</div>
        </div>
      </div>
    `).join('');

    pop.classList.remove('hidden');
  }

  function resetLocalState(){
    localFrame = 0;
    nextEnemyAt = 120;
    nextChestAt = 170;
    nextGimmickAt = 150;
    nextGateAt = 1200;
    spawnedBoss = false;
    scoreAttackIndex = 0;
    finishBonusApplied = false;

    questInfo = null;
    questPhase = 0;
    questKills = 0;
    questBossSpawned = false;
    questWaveSpawned = false;
  }

  function startCurrentEvent(api){
    eventData = getEvent();

    if (!eventData || !eventData.key) {
      active = false;
      eventData = null;
      eventType = '';
      difficultyKey = '';
      stageId = 0;
      return false;
    }

    active = true;
    eventType = eventData.key;
    difficultyKey = normalizeDifficultyKey(eventData.difficulty || eventData.difficultyKey || '');
    stageId = Number(
      eventData.stageId ||
      eventData.doubleStageId ||
      eventData.doubleBossStageId ||
      eventData.selectedStageId ||
      (eventData.stage && eventData.stage.id) ||
      (eventData.doubleStage && eventData.doubleStage.id) ||
      0
    );

    retryEventData = clone(eventData);

    resetLocalState();

    api.state.entities.length = 0;
    api.state.bullets.length = 0;
    api.state.particles.length = 0;
    api.state.texts.length = 0;

    if (eventType === 'gold') {
      const diff = getGoldDifficulty();

      api.setEventMode({ active:true, key:'gold' });
      setStageVisual(
        api,
        `GOLD ${diff.name}`,
        diff.background || 'sta/backmao.png',
        diff.areaKey || 'grass',
        diff.areaName || 'ゴールドステージ'
      );
      api.showBanner(`GOLD STAGE ${diff.name}`);
      return true;
    }

    if (eventType === 'doubleBoss') {
      const info = getDoubleInfo();

      api.setEventMode({ active:true, key:'doubleBoss' });
      setStageVisual(
        api,
        `DOUBLE ${info.stage.title}`,
        info.stage.background || null,
        info.stage.areaKey,
        info.stage.areaName
      );
      api.showBanner(`ダブルボス ${info.stage.title}`);
      return true;
    }

    if (eventType === 'scoreAttack') {
      api.setEventMode({ active:true, key:'scoreAttack' });
      setStageVisual(api, 'SCORE ATTACK', 'sta/backneon.png', 'neon', 'スコアアタック');
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
    eventData = null;
    eventType = '';
    difficultyKey = '';
    stageId = 0;
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
      entity.name = canonicalBossName(entity.name);

      if (window.MobShotEvents && window.MobShotEvents.recordEventBossKill) {
        window.MobShotEvents.recordEventBossKill(entity.name);
      }
    }

    if (eventType === 'eventQuest') {
      if (entity.kind === 'enemy') questKills++;
    }
  }

  function beforeFinish(clear, api){
    if (!active || finishBonusApplied) return null;

    finishBonusApplied = true;

    let text = clear ? 'イベントクリア！' : 'イベント失敗';
    let bonusCoin = 0;
    let bonusDiamond = 0;

    const retryCopy = eventData ? clone(eventData) : retryEventData ? clone(retryEventData) : null;
    if (retryCopy && retryCopy.key) {
      retryEventData = retryCopy;
    }

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

      const drops = rollEventQuestDrops(diff.key, stage);

      if (drops.length) {
        setTimeout(function(){
          showDropPop(drops);
        }, 420);
      }

      text = `${stage.title} ${diff.name} クリア！`;
    }

    if (!clear) text = 'イベント失敗';

    if (window.MobShotEvents && window.MobShotEvents.clearCurrentEvent) {
      window.MobShotEvents.clearCurrentEvent();
    }

    active = false;
    eventData = null;
    eventType = '';
    difficultyKey = '';
    stageId = 0;

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

      if (api.hudStage) api.hudStage.textContent = `DOUBLE ${info.stage.title}`;
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
      const info = questInfo || getQuestInfo();

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

  function shouldRestoreRetryEvent(btn){
    if (!btn || btn.id !== 'resultRetryBtn') return false;
    if (!retryEventData || !retryEventData.key) return false;

    const text = String(btn.textContent || '').trim();

    return text === 'もう一度';
  }

  function restoreRetryEventForButton(e){
    const btn = e && e.target && e.target.closest ? e.target.closest('#resultRetryBtn') : null;
    if (!shouldRestoreRetryEvent(btn)) return;

    writeEventRequest(retryEventData);
  }

  function bindRetryRestore(){
    if (document.__mobShotEventRetryRestoreBound) return;
    document.__mobShotEventRetryRestoreBound = true;

    document.addEventListener('pointerdown', restoreRetryEventForButton, true);
    document.addEventListener('click', restoreRetryEventForButton, true);
  }

  bindRetryRestore();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindRetryRestore);
  } else {
    bindRetryRestore();
  }

  window.MobShotGameEvents = {
    startCurrentEvent,
    update,
    updateHud,
    draw,
    onEntityKilled,
    beforeFinish,
    canonicalBossName,
    getDoubleInfo
  };
})();
