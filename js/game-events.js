'use strict';

(function(){
  const EVENT_SAVE_KEY = 'mobshot_event_mode_v1';
  const EVENT_START_VALID_MS = 120000;
  const GOLD_TIME_LIMIT_SEC = 30;
  const FRAME_RATE = 60;

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
  let goldBossRespawnAt = 0;
  let scoreAttackIndex = 0;
  let finishBonusApplied = false;
  let retryEventData = null;

  let questInfo = null;
  let questPhase = 0;
  let questKills = 0;
  let questBossSpawned = false;
  let questWaveSpawned = false;
  let questExtraSpawned = false;
  let questSupportSpawned = 0;

  function canonicalBossName(name){
    const raw = String(name || '').trim();
    if (raw === '番人') return 'モブガーディアン';
    if (raw === '番人Ⅱ') return 'モブガーディアンⅡ';
    if (raw === '番人II') return 'モブガーディアンⅡ';
    if (raw === 'モブ鮫') return 'モブサメ';
    return raw;
  }

  function normalizeName(name){
    return canonicalBossName(name).replace(/\s/g, '').replace(/　/g, '').replace(/Ⅱ/g, 'II').toLowerCase();
  }

  function sameName(a, b){
    return normalizeName(a) === normalizeName(b);
  }

  const GOLD_DIFFICULTY_FALLBACK = {
    easy:{ key:'easy', name:'イージー', color:'#9dff73', clearCoin:8000, firstCoin:3000, firstDiamond:5, chestMul:3.2, bossHpMul:1.0, bossCoinMul:3.0, bossMinHp:600, areaKey:'grass', areaName:'草原', background:'sta/backsougen.png', bosses:['ホークモブ','ミラモブ'], enemySpawn:true, timeLimitSec:30 },
    hard:{ key:'hard', name:'ハード', color:'#6be6ff', clearCoin:24000, firstCoin:8000, firstDiamond:8, chestMul:8.0, bossHpMul:1.35, bossCoinMul:8.0, bossMinHp:1800, areaKey:'desert', areaName:'砂漠', background:'sta/backsabaku.png', bosses:['ミラモブⅡ','ネオンモブ'], enemySpawn:true, timeLimitSec:30 },
    veryHard:{ key:'veryHard', name:'ベリーハード', color:'#ffcf5b', clearCoin:65000, firstCoin:15000, firstDiamond:10, chestMul:18.0, bossHpMul:1.8, bossCoinMul:18.0, bossMinHp:3800, areaKey:'magma', areaName:'マグマ', background:'sta/backmagma.png', bosses:['ドラゴンモブ','ドラゴンモブⅡ'], enemySpawn:true, timeLimitSec:30 },
    inferno:{ key:'inferno', name:'インフェルノ', color:'#ff5b5b', clearCoin:180000, firstCoin:30000, firstDiamond:20, chestMul:42.0, bossHpMul:2.35, bossCoinMul:40.0, bossMinHp:7200, areaKey:'castle', areaName:'魔王城', background:'sta/backmao.png', bosses:['モブリリス','ドラゴンモブⅡ'], enemySpawn:true, timeLimitSec:30 },
    legend:{ key:'legend', name:'レジェンド', color:'#d86bff', clearCoin:450000, firstCoin:80000, firstDiamond:50, chestMul:95.0, bossHpMul:3.2, bossCoinMul:90.0, bossMinHp:12000, areaKey:'castle', areaName:'魔王城', background:'sta/backmao.png', bosses:['モブリリス','モブ魔王'], enemySpawn:true, timeLimitSec:30 }
  };

  const QUEST_DIFFICULTY_FALLBACK = {
    easy:{ key:'easy', name:'イージー', color:'#9dff73', hpMul:0.85, scoreMul:1, coinMul:0.8, enemyHpMul:0.8, cost:0 },
    veryHard:{ key:'veryHard', name:'ベリーハード', color:'#ffcf5b', hpMul:1.6, scoreMul:1.6, coinMul:1.2, enemyHpMul:1.35, cost:0 },
    legend:{ key:'legend', name:'レジェンド', color:'#d86bff', hpMul:2.8, scoreMul:2.5, coinMul:1.8, enemyHpMul:2.2, cost:0 }
  };

  const QUEST_STAGE_FALLBACK = {
    1:{ id:1, key:'pterarush', title:'プテラッシュ', areaKey:'grass', areaName:'草原', background:'sta/backsougen.png', questEnemyMode:'low', gimmickSpawn:false },
    2:{ id:2, key:'guardian_test', title:'番人試験', areaKey:'town', areaName:'田舎町', background:'sta/backumi.png', questEnemyMode:'low', gimmickSpawn:false },
    3:{ id:3, key:'grass_traveler', title:'草原の旅人', areaKey:'grass', areaName:'草原', background:'sta/backsougen.png', questEnemyMode:'low', gimmickSpawn:false },
    4:{ id:4, key:'thieves', title:'盗賊団', areaKey:'desert', areaName:'砂漠', background:'sta/backsabaku.png', questEnemyMode:'none', gimmickSpawn:false },
    5:{ id:5, key:'desert_ruler', title:'砂漠を統べる者', areaKey:'desert', areaName:'砂漠', background:'sta/backsabaku.png', questEnemyMode:'low', gimmickSpawn:false },
    6:{ id:6, key:'desert_sharks', title:'砂漠に潜む鮫', areaKey:'desert', areaName:'砂漠', background:'sta/backsabaku.png', questEnemyMode:'low', gimmickSpawn:false },
    7:{ id:7, key:'hot_magma', title:'アチアチマグマ', areaKey:'magma', areaName:'マグマ', background:'sta/backmagma.png', questEnemyMode:'low', gimmickSpawn:false },
    8:{ id:8, key:'magma_guardian', title:'マグマに潜むガーディアン', areaKey:'magma', areaName:'マグマ', background:'sta/backmagma.png', questEnemyMode:'low', gimmickSpawn:false },
    9:{ id:9, key:'sky_rulers', title:'空の支配者', areaKey:'town', areaName:'田舎町', background:'sta/backumi.png', questEnemyMode:'low', gimmickSpawn:false },
    10:{ id:10, key:'neon_nightmare', title:'ネオン街の悪夢', areaKey:'neon', areaName:'ネオン街', background:'sta/backneon.png', questEnemyMode:'low', gimmickSpawn:false },
    11:{ id:11, key:'nine_heads', title:'9つの首', areaKey:'neon', areaName:'ネオン街', background:'sta/backneon.png', questEnemyMode:'low', gimmickSpawn:false },
    12:{ id:12, key:'town_dragon', title:'街を襲うドラゴン', areaKey:'town', areaName:'田舎町', background:'sta/backumi.png', questEnemyMode:'low', gimmickSpawn:false },
    13:{ id:13, key:'three_birds', title:'三鳥見参', areaKey:'grass', areaName:'草原', background:'sta/backsougen.png', questEnemyMode:'low', gimmickSpawn:false },
    14:{ id:14, key:'neon_maoh', title:'ネオン街の魔王', areaKey:'neon', areaName:'ネオン街', background:'sta/backneon.png', questEnemyMode:'low', gimmickSpawn:false },
    15:{ id:15, key:'magma_beauty', title:'マグマを好む美女', areaKey:'magma', areaName:'マグマ', background:'sta/backmagma.png', questEnemyMode:'low', gimmickSpawn:false },
    16:{ id:16, key:'maoh_duel', title:'対峙する魔王', areaKey:'castle', areaName:'魔王城', background:'sta/backmao.png', questEnemyMode:'low', gimmickSpawn:false },
    17:{ id:17, key:'lilith_sisters', title:'リリス四姉妹', areaKey:'castle', areaName:'魔王城', background:'sta/backmao.png', questEnemyMode:'low', gimmickSpawn:false },
    18:{ id:18, key:'castle_machine', title:'魔王城の精密機械', areaKey:'castle', areaName:'魔王城', background:'sta/backmao.png', questEnemyMode:'low', gimmickSpawn:false }
  };

  const ENEMY_FALLBACK = {
    'スラモブ':{ name:'スラモブ', image:'en/sra.png', hp:5, score:10, coinMin:2, coinMax:5 },
    'モブロック':{ name:'モブロック', image:'en/eniwa.png', hp:8, score:15, coinMin:2, coinMax:5 },
    'モブ盗賊':{ name:'モブ盗賊', image:'en/entozok.png', hp:10, score:20, coinMin:3, coinMax:7 },
    'モブドワーフ':{ name:'モブドワーフ', image:'en/endowa.png', hp:12, score:22, coinMin:3, coinMax:8 },
    'モブバード':{ name:'モブバード', image:'en/enwasi.png', hp:12, score:25, coinMin:3, coinMax:8 },
    'モブファル':{ name:'モブファル', image:'en/iwakofal.png', hp:16, score:30, coinMin:4, coinMax:9 },
    'ナーガモブ':{ name:'ナーガモブ', image:'en/ennarga.png', hp:22, score:40, coinMin:4, coinMax:10 },
    'モブグリズリー':{ name:'モブグリズリー', image:'en/enguri.png', hp:30, score:55, coinMin:5, coinMax:12 },
    'モブマグトカゲ':{ name:'モブマグトカゲ', image:'en/enmagtokage.png', hp:32, score:60, coinMin:5, coinMax:13 },
    'モブマグプテラ':{ name:'モブマグプテラ', image:'en/enmagpte.png', hp:36, score:70, coinMin:6, coinMax:15 },
    'ダークゴブモブ':{ name:'ダークゴブモブ', image:'en/enmaogob.png', hp:45, score:90, coinMin:7, coinMax:18 },
    'モブアサシン':{ name:'モブアサシン', image:'en/enasa.png', hp:48, score:95, coinMin:8, coinMax:20 },
    'ネオスラモブ':{ name:'ネオスラモブ', image:'en/neosura.png', hp:60, score:120, coinMin:10, coinMax:24 }
  };

  const BOSS_FALLBACK = {
    'ホークモブ':{ name:'ホークモブ', image:'boss/hawks.png', hp:600, score:1000, coin:200 },
    'ホークモブⅡ':{ name:'ホークモブⅡ', image:'boss/hawks2.png', hp:900, score:1400, coin:280 },
    'ミラモブ':{ name:'ミラモブ', image:'boss/miraboss.png', hp:800, score:1300, coin:260 },
    'ミラモブⅡ':{ name:'ミラモブⅡ', image:'boss/bossmira2.png', hp:1200, score:1700, coin:340 },
    'モブガーディアン':{ name:'モブガーディアン', image:'boss/bossban.png', hp:1100, score:1600, coin:320 },
    'モブガーディアンⅡ':{ name:'モブガーディアンⅡ', image:'boss/bossban2.png', hp:1600, score:2100, coin:420 },
    'ネオンモブ':{ name:'ネオンモブ', image:'boss/bossneon.png', hp:1500, score:2200, coin:440 },
    'ドラゴンモブ':{ name:'ドラゴンモブ', image:'boss/bossdragoon.png', hp:2100, score:3000, coin:600 },
    'ドラゴンモブⅡ':{ name:'ドラゴンモブⅡ', image:'boss/bossdragoon2.png', hp:2900, score:3900, coin:780 },
    'モブリリス':{ name:'モブリリス', image:'boss/bossriris.png', hp:2800, score:4200, coin:840 },
    'モブ魔王':{ name:'モブ魔王', image:'boss/bossmaoh.png', hp:3800, score:6000, coin:1200 },
    'ウルモブリリス':{ name:'ウルモブリリス', image:'boss/bossulriri.png', hp:5200, score:9000, coin:1800 },
    'モブメイル':{ name:'モブメイル', image:'boss/bossmeiru.png', hp:4200, score:6400, coin:1280 },
    'モブスミス':{ name:'モブスミス', image:'boss/bosssmith.png', hp:4500, score:6800, coin:1360 },
    'モブネプ':{ name:'モブネプ', image:'boss/bossmobnep.png', hp:4700, score:7200, coin:1440 },
    '閻魔モブ':{ name:'閻魔モブ', image:'boss/enmamob.png', hp:5600, score:9800, coin:1960 }
  };

  const MID_BOSS_FALLBACK = {
    'モブプテラ':{ name:'モブプテラ', image:'en/enpte.png', hp:80, score:300, coin:30 },
    'モブデュアル':{ name:'モブデュアル', image:'en/sabadual.png', hp:150, score:550, coin:55 },
    'モブピー':{ name:'モブピー', image:'en/enmobpi.png', hp:170, score:600, coin:60 },
    'モブギドラ':{ name:'モブギドラ', image:'en/neongidra.png', hp:220, score:800, coin:80 },
    'マグモブレム':{ name:'マグモブレム', image:'en/enmaggolem.png', hp:300, score:1050, coin:110 },
    'グラディモブ':{ name:'グラディモブ', image:'en/mobgra.png', hp:340, score:1200, coin:120 },
    'モブニコ':{ name:'モブニコ', image:'en/mobnico.png', hp:380, score:1400, coin:140 },
    'モブラス':{ name:'モブラス', image:'en/mobras.png', hp:390, score:1450, coin:145 },
    'ガトリモブ':{ name:'ガトリモブ', image:'en/gatorimob.png', hp:420, score:1550, coin:155 },
    'ジェイモブ':{ name:'ジェイモブ', image:'en/jmob.png', hp:430, score:1600, coin:160 },
    'モブサメ':{ name:'モブサメ', image:'en/mobsame.png', hp:480, score:1800, coin:180 },
    'モブシャチ':{ name:'モブシャチ', image:'en/shatimob.png', hp:500, score:1900, coin:190 },
    'モブコード':{ name:'モブコード', image:'en/mobcode.png', hp:520, score:2000, coin:200 },
    'モブケーブル':{ name:'モブケーブル', image:'en/mobcable.png', hp:520, score:2000, coin:200 },
    'モブマグシャー':{ name:'モブマグシャー', image:'en/mobmagsya.png', hp:560, score:2100, coin:210 },
    'モブガラド':{ name:'モブガラド', image:'en/mobgarado.png', hp:580, score:2200, coin:220 },
    'モブメルト':{ name:'モブメルト', image:'en/mobmerut.png', hp:620, score:2400, coin:240 }
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

  function clone(obj){ return JSON.parse(JSON.stringify(obj)); }
  function rand(a, b){ return a + Math.random() * (b - a); }
  function intRand(a, b){ return Math.floor(rand(a, b + 1)); }
  function pick(arr){ return arr && arr.length ? arr[Math.floor(Math.random() * arr.length)] : null; }

  function normalizeDifficultyKey(key){
    const raw = String(key || '').trim();
    if (raw === 'イージー') return 'easy';
    if (raw === 'ハード') return 'hard';
    if (raw === 'ベリーハード') return 'veryHard';
    if (raw === 'インフェルノ') return 'inferno';
    if (raw === 'レジェンド') return 'legend';
    if (raw === 'veryhard') return 'veryHard';
    return raw || 'easy';
  }

  function goldBossDiamondRate(key){
    key = normalizeDifficultyKey(key);
    if (key === 'easy') return 0.50;
    if (key === 'hard') return 0.70;
    if (key === 'veryHard') return 0.80;
    if (key === 'inferno') return 0.90;
    if (key === 'legend') return 1.00;
    return 0;
  }

  function readEventRequest(){
    try {
      const raw = localStorage.getItem(EVENT_SAVE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch(e) {
      return null;
    }
  }

  function clearEventRequest(){
    try { localStorage.removeItem(EVENT_SAVE_KEY); } catch(e) {}
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

  function getQuestInfoFromEvent(data){
    data = data || eventData || retryEventData || {};

    const diffKey = normalizeDifficultyKey(
      data.difficulty ||
      data.difficultyKey ||
      (data.questDifficulty && data.questDifficulty.key) ||
      (data.difficultyData && data.difficultyData.key) ||
      'easy'
    );

    let difficulty = clone(QUEST_DIFFICULTY_FALLBACK[diffKey] || QUEST_DIFFICULTY_FALLBACK.easy);
    if (data.difficultyData) difficulty = Object.assign(difficulty, data.difficultyData);
    if (data.questDifficulty) difficulty = Object.assign(difficulty, data.questDifficulty);
    difficulty.key = diffKey;
    difficulty.name = difficulty.name || (QUEST_DIFFICULTY_FALLBACK[diffKey] || QUEST_DIFFICULTY_FALLBACK.easy).name;

    const qid = Number(
      data.questStageId ||
      data.stageId ||
      (data.questStage && data.questStage.id) ||
      (data.stage && data.stage.id) ||
      1
    );

    let stage = clone(QUEST_STAGE_FALLBACK[qid] || QUEST_STAGE_FALLBACK[1]);
    if (data.stage && data.stage.id) stage = Object.assign(stage, data.stage);
    if (data.questStage && data.questStage.id) stage = Object.assign(stage, data.questStage);

    stage.id = Number(stage.id || qid || 1);
    const fallback = QUEST_STAGE_FALLBACK[stage.id] || QUEST_STAGE_FALLBACK[1];

    stage.key = stage.key || fallback.key;
    stage.title = stage.title || fallback.title;
    stage.areaKey = stage.areaKey || fallback.areaKey;
    stage.areaName = stage.areaName || fallback.areaName;
    stage.background = stage.background || fallback.background || null;
    stage.questEnemies = stage.questEnemies || fallback.questEnemies || null;
    stage.questEnemyMode = stage.questEnemyMode || fallback.questEnemyMode || 'low';
    stage.gimmickSpawn = stage.gimmickSpawn === true || fallback.gimmickSpawn === true;

    return { difficulty, stage };
  }

  function getQuestInfo(){
    if (questInfo && questInfo.difficulty && questInfo.stage) return questInfo;
    return getQuestInfoFromEvent(eventData || retryEventData);
  }

  function getSave(){
    if (window.MobShotStorage && window.MobShotStorage.load) return window.MobShotStorage.load();
    try { return JSON.parse(localStorage.getItem('mobshot_split_v1')) || {}; } catch(e) { return {}; }
  }

  function saveMainData(save){
    if (window.MobShotStorage && window.MobShotStorage.save) {
      window.MobShotStorage.save(save);
      return;
    }
    try { localStorage.setItem('mobshot_split_v1', JSON.stringify(save)); } catch(e) {}
  }

  function addDiamond(amount){
    const add = Number(amount || 0);
    if (add <= 0) return;

    const save = getSave();
    save.diamond = Number(save.diamond || 0) + add;
    saveMainData(save);

    window.dispatchEvent(new CustomEvent('mobshot:diamondUpdated', { detail:{ diamond:save.diamond, add:add } }));
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
    if (key === 'veryHard') return 6.5;
    if (key === 'legend') return 24;
    return 1;
  }

  function currentQuestStageSafe(){
    try {
      if (questInfo && questInfo.stage) return questInfo.stage;
      if (eventData || retryEventData) return getQuestInfoFromEvent(eventData || retryEventData).stage;
    } catch(e) {}
    return null;
  }

  function allAreaEnemies(api){
    const out = [];
    const stageData = window.MOBSHOT_STAGE_DATA || {};

    Object.keys(stageData).forEach(key => {
      const area = stageData[key];
      if (area && Array.isArray(area.zako)) area.zako.forEach(e => e && out.push(e));
      if (area && area.enemies && Array.isArray(area.enemies.zako)) area.enemies.zako.forEach(e => e && out.push(e));
    });

    if (api.D && api.D.enemies && Array.isArray(api.D.enemies.zako)) {
      api.D.enemies.zako.forEach(e => e && out.push(e));
    }

    return out;
  }

  function enemyDefByName(api, name){
    name = canonicalBossName(name);
    const list = allAreaEnemies(api);
    const found = list.find(item => item && sameName(item.name, name));
    if (found) return clone(found);

    if (ENEMY_FALLBACK[name]) return clone(ENEMY_FALLBACK[name]);

    const key = Object.keys(ENEMY_FALLBACK).find(k => sameName(k, name));
    if (key) return clone(ENEMY_FALLBACK[key]);

    return { name:name || 'スラモブ', image:'en/sra.png', hp:10, score:10, coinMin:2, coinMax:5 };
  }

  function areaEnemyList(areaKey, api){
    const stage = currentQuestStageSafe();

    if (stage && Array.isArray(stage.questEnemies) && stage.questEnemies.length) {
      return stage.questEnemies.map(name => enemyDefByName(api, name));
    }

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

    const bossKey = Object.keys(BOSS_FALLBACK).find(k => sameName(k, name));
    if (bossKey) return clone(BOSS_FALLBACK[bossKey]);

    if (MID_BOSS_FALLBACK[name]) return clone(MID_BOSS_FALLBACK[name]);

    const midKey = Object.keys(MID_BOSS_FALLBACK).find(k => sameName(k, name));
    if (midKey) return clone(MID_BOSS_FALLBACK[midKey]);

    return { name:name || 'ホークモブ', image:'boss/hawks.png', hp:1000, score:1000, coin:300 };
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
      ['boss','strongBoss','legendBoss'].forEach(key => {
        if (area[key]) candidates.push(area[key]);
      });

      ['midBoss','midboss','middleBoss','bosses','extraBosses','bossList'].forEach(key => {
        if (Array.isArray(area[key])) area[key].forEach(item => item && candidates.push(item));
        else if (area[key]) candidates.push(area[key]);
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
      ['midBoss','midboss','middleBoss'].forEach(key => {
        if (Array.isArray(area[key])) area[key].forEach(item => item && list.push(item));
        else if (area[key]) list.push(area[key]);
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
    const drawSize = Number(opt.drawSize || opt.customSize || opt.eventDrawSize || Math.max(24, Math.ceil(r * 2 * scale)));

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
    const x = opt.x != null ? opt.x : W / 2;
    const hpMul = opt.hpMul != null ? opt.hpMul : 1;
    const scoreMul = opt.scoreMul != null ? opt.scoreMul : 1;
    const coinMul = opt.coinMul != null ? opt.coinMul : 1;
    const minHp = Number(opt.minHp || 0);
    const r = opt.r != null ? opt.r : 112;
    const kind = opt.kind || 'boss';
    const hp = Math.max(minHp, Math.ceil(Number(def.hp || 1000) * hpMul));
    const scale = opt.scale != null ? Number(opt.scale) : Number(opt.sizeMul || 1);

    const entity = {
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
      imageScale:scale,
      spriteScale:scale,
      visualScale:scale,
      renderScale:scale,
      eventBoss:true,
      eventType:eventType,
      eventDifficulty:opt.eventDifficulty || difficultyKey || '',
      questBoss:!!opt.questBoss
    };

    if (opt.flag) entity[opt.flag] = true;
    if (opt.questSupport) entity.questSupport = true;
    if (opt.questMachineInitial) entity.questMachineInitial = true;
    if (opt.questTarget) entity.questTarget = true;

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
      canShoot:!!def.canShoot,
      baseShootCd:260,
      shootCd:260 + intRand(0, 90),
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
      x:rand(W * 0.16, W * 0.84),
      y:-76,
      vx:rand(-0.25, 0.25),
      vy:1.25 + rand(0, 0.22),
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

  function spawnAreaEnemy(api, areaKey, hpMul, coinMul){
    const def = pick(areaEnemyList(areaKey, api));
    if (!def) return;
    api.state.entities.push(makeEnemyEntity(def, api, hpMul, coinMul));
  }

  function spawnAreaGimmick(api, areaKey, hpMul, coinMul){
    const stage = currentQuestStageSafe();
    if (eventType === 'eventQuest' && !(stage && stage.gimmickSpawn === true)) return;

    const def = pick(areaGimmickList(areaKey, api));
    if (!def) return;
    api.state.entities.push(makeGimmickEntity(def, api, hpMul, coinMul));
  }

  function spawnAreaChest(api, areaKey, hpMul, coinMul){
    const def = pick(areaChestList(areaKey, api));
    if (!def) return;
    api.state.entities.push(makeChestEntity(def, api, hpMul, coinMul));
  }

  function getGoldDifficulty(){
    const key = normalizeDifficultyKey(difficultyKey || (eventData && eventData.difficulty) || (eventData && eventData.difficultyKey));
    let diff = clone(GOLD_DIFFICULTY_FALLBACK[key] || GOLD_DIFFICULTY_FALLBACK.easy);

    if (eventData && eventData.goldDifficulty) {
      diff = Object.assign(diff, eventData.goldDifficulty);
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
    diff.timeLimitSec = Number(fixed.timeLimitSec || GOLD_TIME_LIMIT_SEC);

    return diff;
  }

  function goldLimitFrames(){
    const diff = getGoldDifficulty();
    const sec = Number((eventData && eventData.timeLimitSec) || diff.timeLimitSec || GOLD_TIME_LIMIT_SEC);
    return Math.max(1, Math.floor(sec * FRAME_RATE));
  }

  function goldRemainingSec(){
    return Math.max(0, Math.ceil((goldLimitFrames() - localFrame) / FRAME_RATE));
  }

  function spawnGoldBosses(api){
    if (spawnedBoss) return;

    const state = api.state;
    const W = api.W;
    const diff = getGoldDifficulty();
    const names = Array.isArray(diff.bosses) && diff.bosses.length ? diff.bosses.slice(0, 2).map(canonicalBossName) : ['ホークモブ','ミラモブ'];

    while (names.length < 2) names.push(names[0] || 'ホークモブ');

    const positions = [W * 0.34, W * 0.66];

    names.forEach((name, index) => {
      state.entities.push(makeBossEntity(eventBossDef(name), api, {
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
    goldBossRespawnAt = 0;
  }

  function updateGold(api){
    const state = api.state;
    const diff = getGoldDifficulty();
    const areaKey = diff.areaKey || 'grass';
    const enemyPower = eventEnemyPowerMul(diff.key);

    localFrame++;

    if (localFrame === 1) api.showBanner(`GOLD STAGE ${diff.name} 30秒`);
    if (localFrame >= 40) spawnGoldBosses(api);

    if (localFrame >= goldLimitFrames()) {
      api.finishRun(true);
      return true;
    }

    if (localFrame >= nextEnemyAt) {
      if (diff.enemySpawn !== false) {
        spawnAreaEnemy(api, areaKey, Number(diff.bossHpMul || 1) * 0.35 * enemyPower, Number(diff.bossCoinMul || 1));
      }

      nextEnemyAt = localFrame + intRand(
        diff.key === 'legend' ? 120 : diff.key === 'inferno' ? 145 : 180,
        diff.key === 'legend' ? 180 : diff.key === 'inferno' ? 220 : 270
      );
    }

    if (localFrame >= nextGimmickAt) {
      spawnAreaGimmick(api, areaKey, Number(diff.bossHpMul || 1) * 0.45 * enemyPower, Number(diff.chestMul || 1));
      nextGimmickAt = localFrame + intRand(170, 250);
    }

    if (localFrame >= nextChestAt) {
      spawnAreaChest(api, areaKey, Math.max(1, enemyPower * 0.35), Number(diff.chestMul || 1) * 1.8);

      if (Math.random() < 0.35) {
        spawnAreaChest(api, areaKey, Math.max(1, enemyPower * 0.35), Number(diff.chestMul || 1) * 1.8);
      }

      nextChestAt = localFrame + intRand(70, 110);
    }

    const bossAlive = state.entities.some(e => !e.dead && e.kind === 'boss');

    if (spawnedBoss && !bossAlive && localFrame > 120 && !goldBossRespawnAt) {
      goldBossRespawnAt = localFrame + 90;
    }

    if (goldBossRespawnAt && localFrame >= goldBossRespawnAt) {
      spawnedBoss = false;
      spawnGoldBosses(api);
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

    state.entities.push(makeBossEntity(def, api, {
      x:W / 2,
      hpMul:1 + scoreAttackIndex * 0.25,
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

  function currentQuestDiff(){ return getQuestInfo().difficulty; }
  function currentQuestStage(){ return getQuestInfo().stage; }

  function questHpMul(extra){
    const diff = currentQuestDiff();
    return Number(diff.hpMul || 1) * questDifficultyPowerMul(diff.key) * Number(extra == null ? 1 : extra);
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
    return api.state.entities.some(e =>
      !e.dead &&
      (e.kind === 'boss' || e.kind === 'midBoss') &&
      e.questBoss
    );
  }

  function activeQuestTargetsAlive(api){
    return api.state.entities.some(e => !e.dead && (e.questBoss || e.questTarget));
  }

  function activeQuestSupportAlive(api){
    return api.state.entities.some(e => !e.dead && e.questSupport);
  }

  function activeMachineInitialAlive(api){
    return api.state.entities.some(e => !e.dead && e.questMachineInitial);
  }

  function spawnQuestBossGroup(api, defs, opt){
    opt = opt || {};

    const W = api.W;
    const H = api.H;
    const count = defs.length;
    const margin = opt.margin != null ? opt.margin : count <= 2 ? 0.32 : count <= 3 ? 0.24 : 0.14;
    const spanA = W * margin;
    const spanB = W * (1 - margin);

    defs.forEach((def, index) => {
      def = fixBossDef(def);

      const t = count === 1 ? 0.5 : index / (count - 1);
      const x = spanA + (spanB - spanA) * t;
      const side = index % 2 === 0 ? 1 : -1;

      const entity = makeBossEntity(def, api, {
        kind:opt.kind || 'midBoss',
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
        scale:opt.scale != null ? opt.scale : opt.sizeMul != null ? opt.sizeMul : 1,
        sizeMul:opt.sizeMul != null ? opt.sizeMul : opt.scale != null ? opt.scale : 1,
        visualScale:opt.visualScale != null ? opt.visualScale : opt.sizeMul != null ? opt.sizeMul : opt.scale != null ? opt.scale : 1,
        drawSize:opt.drawSize,
        customSize:opt.customSize,
        eventDrawSize:opt.eventDrawSize,
        questBoss:true,
        questSupport:!!opt.questSupport,
        questTarget:!!opt.questTarget,
        questMachineInitial:!!opt.questMachineInitial
      });

      if (opt.flag) entity[opt.flag] = true;
      applyVisualSize(entity, opt);

      api.state.entities.push(entity);
    });
  }

  function spawnNamedGroup(api, items, defaultOpt){
    defaultOpt = defaultOpt || {};
    const defs = [];

    items.forEach(item => {
      if (typeof item === 'string') {
        defs.push({ name:item, opt:{} });
        return;
      }

      const count = Number(item.count || 1);
      for (let i = 0; i < count; i++) {
        defs.push({ name:item.name, opt:item.opt || {} });
      }
    });

    const bossDefs = defs.map(item => {
      const name = canonicalBossName(item.name);
      const base = fallbackBossByName(name);
      base.__spawnOpt = item.opt || {};
      return base;
    });

    const W = api.W;
    const H = api.H;
    const count = bossDefs.length;
    const margin = defaultOpt.margin != null ? defaultOpt.margin : count <= 2 ? 0.32 : count <= 3 ? 0.22 : 0.12;
    const spanA = W * margin;
    const spanB = W * (1 - margin);

    bossDefs.forEach((def, index) => {
      const itemOpt = def.__spawnOpt || {};
      delete def.__spawnOpt;

      const merged = Object.assign({}, defaultOpt, itemOpt);
      const isMainBoss = !!BOSS_FALLBACK[canonicalBossName(def.name)];
      const kind = merged.kind || (isMainBoss ? 'boss' : 'midBoss');

      const t = count === 1 ? 0.5 : index / (count - 1);
      const x = merged.x != null ? merged.x : spanA + (spanB - spanA) * t;
      const side = index % 2 === 0 ? 1 : -1;

      const entity = makeBossEntity(def, api, {
        kind,
        x,
        y:merged.y != null ? merged.y : -170 - index * 24,
        baseY:merged.baseY != null ? merged.baseY : H * 0.22 + index * 8,
        targetY:merged.targetY != null ? merged.targetY : H * 0.22 + index * 8,
        hpMul:questHpMul(merged.hpMul != null ? merged.hpMul : 1),
        scoreMul:questScoreMul(merged.scoreMul != null ? merged.scoreMul : 1),
        coinMul:questCoinMul(merged.coinMul != null ? merged.coinMul : 1),
        vx:side * Number(merged.vx != null ? merged.vx : 1.15),
        shootCd:merged.shootCd != null ? merged.shootCd : 100,
        attackCd:merged.attackCd != null ? merged.attackCd : 155,
        contactDmg:merged.contactDmg != null ? merged.contactDmg : 20,
        r:merged.r != null ? merged.r : isMainBoss ? 104 : 78,
        scale:merged.scale != null ? merged.scale : merged.sizeMul != null ? merged.sizeMul : 1,
        sizeMul:merged.sizeMul != null ? merged.sizeMul : merged.scale != null ? merged.scale : 1,
        visualScale:merged.visualScale != null ? merged.visualScale : merged.sizeMul != null ? merged.sizeMul : merged.scale != null ? merged.scale : 1,
        drawSize:merged.drawSize,
        customSize:merged.customSize,
        eventDrawSize:merged.eventDrawSize,
        questBoss:true,
        questSupport:!!merged.questSupport,
        questTarget:!!merged.questTarget,
        questMachineInitial:!!merged.questMachineInitial
      });

      if (merged.flag) entity[merged.flag] = true;
      applyVisualSize(entity, merged);

      api.state.entities.push(entity);
    });
  }

  function spawnQuestEnemyGroup(api, names, opt){
    opt = opt || {};
    const W = api.W;
    const count = names.length;
    const margin = opt.margin != null ? opt.margin : count <= 3 ? 0.18 : 0.10;
    const spanA = W * margin;
    const spanB = W * (1 - margin);

    names.forEach((name, index) => {
      const def = enemyDefByName(api, name);
      const entity = makeEnemyEntity(def, api, questEnemyHpMul(opt.hpMul != null ? opt.hpMul : 0.8), questCoinMul(opt.coinMul != null ? opt.coinMul : 0.8));

      const row = Math.floor(index / 5);
      const col = index % 5;
      const cols = Math.min(5, count - row * 5);
      const t = cols === 1 ? 0.5 : col / (cols - 1);

      entity.x = spanA + (spanB - spanA) * t;
      entity.y = -70 - row * 64;
      entity.vy = opt.vy != null ? opt.vy : 1.15;
      entity.vx = rand(-0.35, 0.35);
      entity.questTarget = true;
      entity.eventEnemy = true;

      api.state.entities.push(entity);
    });
  }

  function questSpawnSetting(opt){
    opt = opt || {};

    const stage = currentQuestStageSafe();
    const mode = stage && stage.questEnemyMode ? stage.questEnemyMode : 'low';

    let enemyInterval = [300, 480];
    let chestInterval = [520, 760];
    let chestRate = 0.10;

    if (mode === 'none') {
      enemyInterval = [999999, 999999];
      chestInterval = [999999, 999999];
      chestRate = 0;
    }

    if (mode === 'low') {
      enemyInterval = [300, 480];
      chestInterval = [520, 760];
      chestRate = 0.10;
    }

    if (mode === 'medium') {
      enemyInterval = [220, 340];
      chestInterval = [460, 650];
      chestRate = 0.16;
    }

    return {
      enemyInterval:opt.enemyInterval || enemyInterval,
      gimmickInterval:opt.gimmickInterval || [999999, 999999],
      chestInterval:opt.chestInterval || chestInterval,
      chestRate:opt.chestRate != null ? opt.chestRate : chestRate,
      enemyHpMul:opt.enemyHpMul != null ? opt.enemyHpMul : 0.36,
      enemyCoinMul:opt.enemyCoinMul != null ? opt.enemyCoinMul : 0.35,
      gimmickHpMul:opt.gimmickHpMul != null ? opt.gimmickHpMul : 0.45,
      gimmickCoinMul:opt.gimmickCoinMul != null ? opt.gimmickCoinMul : 0.45,
      gimmickSpawn:opt.gimmickSpawn === true || (stage && stage.gimmickSpawn === true)
    };
  }

  function updateQuestFieldSpawns(api, areaKey, opt){
    const set = questSpawnSetting(opt);

    if (localFrame >= nextEnemyAt) {
      spawnAreaEnemy(api, areaKey, questEnemyHpMul(set.enemyHpMul), questCoinMul(set.enemyCoinMul));
      nextEnemyAt = localFrame + intRand(set.enemyInterval[0], set.enemyInterval[1]);
    }

    if (set.gimmickSpawn && localFrame >= nextGimmickAt) {
      spawnAreaGimmick(api, areaKey, questEnemyHpMul(set.gimmickHpMul), questCoinMul(set.gimmickCoinMul));
      nextGimmickAt = localFrame + intRand(set.gimmickInterval[0], set.gimmickInterval[1]);
    }

    if (localFrame >= nextChestAt) {
      if (Math.random() < set.chestRate) {
        spawnAreaChest(api, areaKey, questEnemyHpMul(0.45), questCoinMul(0.55));
      }

      nextChestAt = localFrame + intRand(set.chestInterval[0], set.chestInterval[1]);
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

  function updateGuardianTest(api){
    const stage = currentQuestStage();
    updateQuestFieldSpawns(api, stage.areaKey);

    if (!questWaveSpawned && !questBossSpawned && localFrame > 55) {
      const guardian = eventBossDef('モブガーディアン');

      spawnQuestBossGroup(api, [guardian, guardian], {
        kind:'boss',
        hpMul:0.78,
        scoreMul:0.75,
        coinMul:0.65,
        r:44,
        sizeMul:0.52,
        visualScale:0.52,
        scale:0.52,
        drawSize:92,
        customSize:92,
        eventDrawSize:92,
        contactDmg:13,
        vx:1.0,
        shootCd:115,
        attackCd:175,
        flag:'eventSmallGuardian'
      });

      api.showBanner('番人試験');
      questWaveSpawned = true;
      questBossSpawned = true;
    }

    if (questBossSpawned && !activeQuestBossAlive(api) && localFrame > 120) {
      api.finishRun(true);
    }
  }

  function updateGrassTraveler(api){
    updateQuestFieldSpawns(api, currentQuestStage().areaKey);

    if (!questWaveSpawned && localFrame > 55) {
      spawnNamedGroup(api, [
        { name:'グラディモブ', opt:{ kind:'midBoss', hpMul:1.15, r:78 } },
        { name:'グラディモブ', opt:{ kind:'midBoss', hpMul:1.15, r:78 } },
        { name:'モブニコ', opt:{ kind:'midBoss', hpMul:1.15, r:78 } },
        { name:'モブニコ', opt:{ kind:'midBoss', hpMul:1.15, r:78 } }
      ], { scoreMul:1.1, coinMul:0.9, contactDmg:22, margin:0.12 });

      questWaveSpawned = true;
      questBossSpawned = true;
      api.showBanner('草原の旅人');
    }

    if (questWaveSpawned && !activeQuestBossAlive(api) && localFrame > 120) api.finishRun(true);
  }

  function updateThieves(api){
    const waves = [
      ['モブ盗賊','モブ盗賊','モブ盗賊','モブ盗賊','モブ盗賊','モブドワーフ','モブドワーフ','モブドワーフ','モブドワーフ','モブドワーフ'],
      ['モブ盗賊','モブ盗賊','モブ盗賊','モブ盗賊','モブ盗賊','モブドワーフ','モブドワーフ','モブドワーフ','モブドワーフ','モブドワーフ'],
      ['モブ盗賊','モブ盗賊','モブ盗賊','モブ盗賊','モブ盗賊','モブドワーフ','モブドワーフ','モブドワーフ','モブドワーフ','モブドワーフ']
    ];

    if (questPhase < 3 && !questWaveSpawned && localFrame > 45) {
      spawnQuestEnemyGroup(api, waves[questPhase], {
        hpMul:0.95 + questPhase * 0.14,
        coinMul:0.85,
        margin:0.10,
        vy:1.05
      });

      questWaveSpawned = true;
      api.showBanner(`盗賊団 ${questPhase + 1}/3`);
    }

    if (questPhase < 3 && questWaveSpawned && !activeQuestTargetsAlive(api) && localFrame > 90) {
      questPhase++;
      questWaveSpawned = false;
      localFrame = 35;
    }

    if (questPhase === 3 && !questBossSpawned && localFrame > 55) {
      spawnQuestBossGroup(api, [eventBossDef('ミラモブ')], {
        kind:'boss',
        hpMul:1.18,
        scoreMul:1,
        coinMul:0.8,
        r:96,
        contactDmg:22
      });

      questBossSpawned = true;
      questWaveSpawned = true;
      api.showBanner('ミラモブ出現');
    }

    if (questBossSpawned && !activeQuestBossAlive(api) && localFrame > 120) api.finishRun(true);
  }

  function updateDesertRuler(api){
    updateQuestFieldSpawns(api, currentQuestStage().areaKey);

    if (!questWaveSpawned && localFrame > 55) {
      spawnNamedGroup(api, [
        { name:'ミラモブⅡ', opt:{ kind:'boss', hpMul:1.1, r:104 } },
        { name:'ミラモブⅡ', opt:{ kind:'boss', hpMul:1.1, r:104 } }
      ], { scoreMul:1.1, coinMul:0.95, contactDmg:26, margin:0.30 });

      questWaveSpawned = true;
      questBossSpawned = true;
      api.showBanner('砂漠を統べる者');
    }

    if (questWaveSpawned && !activeQuestBossAlive(api) && localFrame > 120) api.finishRun(true);
  }

  function updateDesertSharks(api){
    updateQuestFieldSpawns(api, currentQuestStage().areaKey);

    if (questPhase === 0 && !questWaveSpawned && localFrame > 55) {
      spawnNamedGroup(api, [
        { name:'モブサメ', opt:{ kind:'midBoss', hpMul:1.15, r:82 } },
        { name:'モブサメ', opt:{ kind:'midBoss', hpMul:1.15, r:82 } }
      ], { scoreMul:1.1, coinMul:0.9, contactDmg:23, margin:0.30 });

      questWaveSpawned = true;
      questBossSpawned = true;
      api.showBanner('モブサメ2体');
    }

    if (questPhase === 0 && questWaveSpawned && !activeQuestBossAlive(api) && localFrame > 120) {
      questPhase = 1;
      questWaveSpawned = false;
      localFrame = 35;
    }

    if (questPhase === 1 && !questWaveSpawned && localFrame > 55) {
      spawnNamedGroup(api, [
        { name:'モブサメ', opt:{ kind:'midBoss', hpMul:1.15, r:82 } },
        { name:'モブサメ', opt:{ kind:'midBoss', hpMul:1.15, r:82 } },
        { name:'モブサメ', opt:{ kind:'midBoss', hpMul:1.15, r:82 } },
        { name:'モブサメ', opt:{ kind:'midBoss', hpMul:1.15, r:82 } }
      ], { scoreMul:1.1, coinMul:0.9, contactDmg:23, margin:0.12 });

      questWaveSpawned = true;
      api.showBanner('モブサメ4体');
    }

    if (questPhase === 1 && questWaveSpawned && !activeQuestBossAlive(api) && localFrame > 120) api.finishRun(true);
  }

  function updateHotMagma(api){
    updateQuestFieldSpawns(api, currentQuestStage().areaKey);

    if (!questBossSpawned && localFrame > 35) {
      spawnNamedGroup(api, [
        { name:'ドラゴンモブ', opt:{ kind:'boss', hpMul:1.6, r:112, drawSize:224, customSize:224, eventDrawSize:224 } }
      ], { scoreMul:1.15, coinMul:0.9, contactDmg:24, margin:0.34 });

      questBossSpawned = true;
      questSupportSpawned = 0;
      api.showBanner('ドラゴン出現');
    }

    if (questBossSpawned && questSupportSpawned < 3 && !activeQuestSupportAlive(api) && localFrame > 55) {
      questSupportSpawned++;

      spawnNamedGroup(api, [
        { name:'マグモブレム', opt:{ kind:'midBoss', hpMul:1.28, r:82, questSupport:true } }
      ], { scoreMul:1.15, coinMul:0.9, contactDmg:24, shootCd:100, attackCd:155, margin:0.34 });

      api.showBanner(`ボスサポート ${questSupportSpawned}/3`);
    }

    if (questBossSpawned && questSupportSpawned >= 3 && !activeQuestBossAlive(api) && localFrame > 140) api.finishRun(true);
  }

  function updateMagmaGuardian(api){
    updateQuestFieldSpawns(api, currentQuestStage().areaKey);

    if (!questBossSpawned && localFrame > 35) {
      spawnNamedGroup(api, [
        { name:'モブガーディアンⅡ', opt:{ kind:'boss', hpMul:1.25, r:108 } }
      ], { scoreMul:1.15, coinMul:0.95, contactDmg:24, margin:0.34 });

      questBossSpawned = true;
      questSupportSpawned = 0;
      api.showBanner('ガーディアン出現');
    }

    if (questBossSpawned && questSupportSpawned < 3 && !activeQuestSupportAlive(api) && localFrame > 55) {
      questSupportSpawned++;

      spawnNamedGroup(api, [
        { name:'マグモブレム', opt:{ kind:'midBoss', hpMul:1.05, r:76, questSupport:true } }
      ], { scoreMul:1.15, coinMul:0.95, contactDmg:24, margin:0.34 });

      api.showBanner(`ボスサポート ${questSupportSpawned}/3`);
    }

    if (questBossSpawned && questSupportSpawned >= 3 && !activeQuestBossAlive(api) && localFrame > 140) api.finishRun(true);
  }

  function updateSkyRulers(api){
    updateQuestFieldSpawns(api, currentQuestStage().areaKey);

    if (!questWaveSpawned && localFrame > 55) {
      spawnNamedGroup(api, [
        { name:'ホークモブ', opt:{ kind:'boss', hpMul:1.0, r:96 } },
        { name:'ホークモブⅡ', opt:{ kind:'boss', hpMul:1.08, r:104 } },
        { name:'ドラゴンモブⅡ', opt:{ kind:'boss', hpMul:1.12, r:108 } }
      ], { scoreMul:1.15, coinMul:0.95, contactDmg:24, margin:0.18 });

      questWaveSpawned = true;
      questBossSpawned = true;
      api.showBanner('空の支配者');
    }

    if (questWaveSpawned && !activeQuestBossAlive(api) && localFrame > 120) api.finishRun(true);
  }

  function updateNeonNightmare(api){
    updateQuestFieldSpawns(api, currentQuestStage().areaKey);

    if (!questWaveSpawned && localFrame > 55) {
      spawnNamedGroup(api, [
        { name:'モブコード', opt:{ kind:'midBoss', hpMul:1.05, r:82, questMachineInitial:true } },
        { name:'モブケーブル', opt:{ kind:'midBoss', hpMul:1.05, r:82, questMachineInitial:true } },
        { name:'ネオンモブ', opt:{ kind:'boss', hpMul:1.2, r:108 } }
      ], { scoreMul:1.12, coinMul:0.9, contactDmg:24, margin:0.20 });

      questWaveSpawned = true;
      questBossSpawned = true;
      questExtraSpawned = false;
      api.showBanner('ネオン街の悪夢');
    }

    if (questWaveSpawned && !questExtraSpawned && !activeMachineInitialAlive(api) && localFrame > 120) {
      spawnNamedGroup(api, [
        { name:'モブコード', opt:{ kind:'midBoss', hpMul:1.0, r:78 } },
        { name:'モブコード', opt:{ kind:'midBoss', hpMul:1.0, r:78 } },
        { name:'モブケーブル', opt:{ kind:'midBoss', hpMul:1.0, r:78 } },
        { name:'モブケーブル', opt:{ kind:'midBoss', hpMul:1.0, r:78 } }
      ], { scoreMul:1.0, coinMul:0.85, contactDmg:22, margin:0.12 });

      questExtraSpawned = true;
      api.showBanner('コード・ケーブル追加');
    }

    if (questWaveSpawned && questExtraSpawned && !activeQuestBossAlive(api) && localFrame > 120) api.finishRun(true);
  }

  function updateNineHeads(api){
    updateQuestFieldSpawns(api, currentQuestStage().areaKey);
    const ghidora = getMidBossDef(api, 'neon', 'モブギドラ', MID_BOSS_FALLBACK['モブギドラ']);

    if (!questWaveSpawned && questPhase === 0 && localFrame > 55) {
      spawnQuestBossGroup(api, [ghidora, ghidora, ghidora], {
        kind:'midBoss',
        hpMul:1.1,
        scoreMul:0.9,
        coinMul:0.75,
        r:80,
        sizeMul:1,
        visualScale:1,
        drawSize:160,
        customSize:160,
        eventDrawSize:160,
        contactDmg:20,
        shootCd:100,
        attackCd:150
      });

      api.showBanner('ギドラ3体');
      questWaveSpawned = true;
    }

    if (questPhase === 0 && questWaveSpawned && !activeQuestBossAlive(api) && localFrame > 120) {
      questPhase = 1;
      questWaveSpawned = false;
      localFrame = 35;
    }

    if (!questWaveSpawned && questPhase === 1 && localFrame > 55) {
      spawnQuestBossGroup(api, [ghidora, ghidora, ghidora, ghidora, ghidora, ghidora], {
        kind:'midBoss',
        hpMul:1.12,
        scoreMul:0.95,
        coinMul:0.8,
        r:72,
        sizeMul:1,
        visualScale:1,
        drawSize:144,
        customSize:144,
        eventDrawSize:144,
        contactDmg:22,
        shootCd:98,
        attackCd:150,
        margin:0.08
      });

      api.showBanner('ギドラ6体');
      questWaveSpawned = true;
    }

    if (questPhase === 1 && questWaveSpawned && !activeQuestBossAlive(api) && localFrame > 120) api.finishRun(true);
  }

  function updateTownDragon(api){
    updateQuestFieldSpawns(api, currentQuestStage().areaKey);

    if (!questWaveSpawned && localFrame > 55) {
      spawnNamedGroup(api, [
        { name:'ドラゴンモブⅡ', opt:{ kind:'boss', hpMul:1.2, r:112 } },
        { name:'モブギドラ', opt:{ kind:'midBoss', hpMul:1.08, r:78 } },
        { name:'モブギドラ', opt:{ kind:'midBoss', hpMul:1.08, r:78 } },
        { name:'モブギドラ', opt:{ kind:'midBoss', hpMul:1.08, r:78 } },
        { name:'モブギドラ', opt:{ kind:'midBoss', hpMul:1.08, r:78 } }
      ], { scoreMul:1.15, coinMul:0.95, contactDmg:25, margin:0.10 });

      questWaveSpawned = true;
      questBossSpawned = true;
      api.showBanner('街を襲うドラゴン');
    }

    if (questWaveSpawned && !activeQuestBossAlive(api) && localFrame > 120) api.finishRun(true);
  }

  function updateThreeBirds(api){
    updateQuestFieldSpawns(api, currentQuestStage().areaKey);

    if (questPhase === 0 && !questWaveSpawned && localFrame > 55) {
      spawnNamedGroup(api, [
        { name:'ホークモブ', opt:{ kind:'boss', hpMul:0.95, r:94 } },
        { name:'ホークモブ', opt:{ kind:'boss', hpMul:0.95, r:94 } },
        { name:'ホークモブ', opt:{ kind:'boss', hpMul:0.95, r:94 } }
      ], { scoreMul:1.15, coinMul:0.95, contactDmg:24, margin:0.18 });

      questWaveSpawned = true;
      questBossSpawned = true;
      api.showBanner('ホークモブ3体');
    }

    if (questPhase === 0 && questWaveSpawned && !activeQuestBossAlive(api) && localFrame > 120) {
      questPhase = 1;
      questWaveSpawned = false;
      localFrame = 35;
    }

    if (questPhase === 1 && !questWaveSpawned && localFrame > 55) {
      spawnNamedGroup(api, [
        { name:'ホークモブⅡ', opt:{ kind:'boss', hpMul:1.1, r:104 } },
        { name:'ホークモブⅡ', opt:{ kind:'boss', hpMul:1.1, r:104 } },
        { name:'ホークモブⅡ', opt:{ kind:'boss', hpMul:1.1, r:104 } }
      ], { scoreMul:1.2, coinMul:1.0, contactDmg:26, margin:0.18 });

      questWaveSpawned = true;
      api.showBanner('ホークモブⅡ3体');
    }

    if (questPhase === 1 && questWaveSpawned && !activeQuestBossAlive(api) && localFrame > 120) api.finishRun(true);
  }

  function updateNeonMaoh(api){
    updateQuestFieldSpawns(api, currentQuestStage().areaKey);

    if (!questWaveSpawned && localFrame > 55) {
      spawnNamedGroup(api, [
        { name:'モブ魔王', opt:{ kind:'boss', hpMul:1.25, r:112 } },
        { name:'ネオンモブ', opt:{ kind:'boss', hpMul:1.05, r:100 } },
        { name:'モブケーブル', opt:{ kind:'midBoss', hpMul:1.1, r:82 } },
        { name:'モブコード', opt:{ kind:'midBoss', hpMul:1.1, r:82 } }
      ], { scoreMul:1.16, coinMul:0.95, contactDmg:25, margin:0.12 });

      questWaveSpawned = true;
      questBossSpawned = true;
      api.showBanner('ネオン街の魔王');
    }

    if (questWaveSpawned && !activeQuestBossAlive(api) && localFrame > 120) api.finishRun(true);
  }

  function updateMagmaBeauty(api){
    updateQuestFieldSpawns(api, currentQuestStage().areaKey);

    if (questPhase === 0 && !questWaveSpawned && localFrame > 55) {
      spawnNamedGroup(api, [
        { name:'モブリリス', opt:{ kind:'boss', hpMul:1.2, r:106 } },
        { name:'モブメルト', opt:{ kind:'midBoss', hpMul:1.1, r:78 } },
        { name:'モブメルト', opt:{ kind:'midBoss', hpMul:1.1, r:78 } },
        { name:'モブメルト', opt:{ kind:'midBoss', hpMul:1.1, r:78 } }
      ], { scoreMul:1.16, coinMul:0.95, contactDmg:25, margin:0.12 });

      questWaveSpawned = true;
      questBossSpawned = true;
      api.showBanner('マグマを好む美女');
    }

    if (questPhase === 0 && questWaveSpawned && !activeQuestBossAlive(api) && localFrame > 120) {
      questPhase = 1;
      questWaveSpawned = false;
      localFrame = 35;
    }

    if (questPhase === 1 && !questWaveSpawned && localFrame > 55) {
      spawnNamedGroup(api, [
        { name:'モブメルト', opt:{ kind:'midBoss', hpMul:1.05, r:78 } },
        { name:'モブメルト', opt:{ kind:'midBoss', hpMul:1.05, r:78 } },
        { name:'モブメルト', opt:{ kind:'midBoss', hpMul:1.05, r:78 } },
        { name:'モブメルト', opt:{ kind:'midBoss', hpMul:1.05, r:78 } }
      ], { scoreMul:1.05, coinMul:0.9, contactDmg:23, margin:0.12 });

      questWaveSpawned = true;
      api.showBanner('メルト追加4体');
    }

    if (questPhase === 1 && questWaveSpawned && !activeQuestBossAlive(api) && localFrame > 120) api.finishRun(true);
  }

  function updateMaohDuel(api){
    updateQuestFieldSpawns(api, currentQuestStage().areaKey);

    if (questPhase === 0 && !questWaveSpawned && localFrame > 55) {
      spawnNamedGroup(api, [
        { name:'モブ魔王', opt:{ kind:'boss', hpMul:0.9, r:112 } }
      ], { scoreMul:1, coinMul:0.85, contactDmg:28, margin:0.34 });

      questWaveSpawned = true;
      questBossSpawned = true;
      api.showBanner('魔王出現');
    }

    if (questPhase === 0 && questWaveSpawned && !activeQuestBossAlive(api) && localFrame > 120) {
      questPhase = 1;
      questWaveSpawned = false;
      localFrame = 35;
      api.showBanner('第二波');
    }

    if (questPhase === 1 && !questWaveSpawned && localFrame > 55) {
      spawnNamedGroup(api, [
        { name:'モブ魔王', opt:{ kind:'boss', hpMul:1.15, r:116 } },
        { name:'ミラモブ', opt:{ kind:'boss', hpMul:0.85, r:88 } },
        { name:'ミラモブ', opt:{ kind:'boss', hpMul:0.85, r:88 } }
      ], { scoreMul:1.1, coinMul:0.95, contactDmg:26, margin:0.20 });

      questWaveSpawned = true;
      api.showBanner('魔王とミラモブ');
    }

    if (questPhase === 1 && questWaveSpawned && !activeQuestBossAlive(api) && localFrame > 120) api.finishRun(true);
  }

  function updateLilithSisters(api){
    updateQuestFieldSpawns(api, currentQuestStage().areaKey);

    if (!questWaveSpawned && !questBossSpawned && localFrame > 55) {
      const lilith = eventBossDef('モブリリス');

      spawnQuestBossGroup(api, [lilith, lilith, lilith, lilith], {
        kind:'boss',
        hpMul:0.74,
        scoreMul:0.75,
        coinMul:0.65,
        r:34,
        sizeMul:0.30,
        visualScale:0.30,
        scale:0.30,
        drawSize:58,
        customSize:58,
        eventDrawSize:58,
        contactDmg:10,
        shootCd:105,
        attackCd:170,
        vx:1.35,
        flag:'eventLilithSister'
      });

      api.showBanner('リリス四姉妹');
      questWaveSpawned = true;
      questBossSpawned = true;
    }

    if (questBossSpawned && !activeQuestBossAlive(api) && localFrame > 120) api.finishRun(true);
  }

  function updateCastleMachine(api){
    updateQuestFieldSpawns(api, currentQuestStage().areaKey);

    if (questPhase === 0 && !questWaveSpawned && localFrame > 55) {
      spawnNamedGroup(api, [
        { name:'ネオンモブ', opt:{ kind:'boss', hpMul:1.0, r:96 } },
        { name:'ネオンモブ', opt:{ kind:'boss', hpMul:1.0, r:96 } },
        { name:'ネオンモブ', opt:{ kind:'boss', hpMul:1.0, r:96 } },
        { name:'ホークモブ', opt:{ kind:'boss', hpMul:1.0, r:92 } }
      ], { scoreMul:1.16, coinMul:0.95, contactDmg:24, margin:0.12 });

      questWaveSpawned = true;
      questBossSpawned = true;
      api.showBanner('魔王城の精密機械');
    }

    if (questPhase === 0 && questWaveSpawned && !activeQuestBossAlive(api) && localFrame > 120) {
      questPhase = 1;
      questWaveSpawned = false;
      localFrame = 35;
    }

    if (questPhase === 1 && !questWaveSpawned && localFrame > 55) {
      spawnNamedGroup(api, [
        { name:'モブ魔王', opt:{ kind:'boss', hpMul:1.05, r:112 } },
        { name:'モブ魔王', opt:{ kind:'boss', hpMul:1.05, r:112 } }
      ], { scoreMul:1.25, coinMul:1.05, contactDmg:28, margin:0.30 });

      questWaveSpawned = true;
      api.showBanner('魔王2体出現');
    }

    if (questPhase === 1 && questWaveSpawned && !activeQuestBossAlive(api) && localFrame > 120) api.finishRun(true);
  }

  function updateEventQuest(api){
    const stage = currentQuestStage();

    localFrame++;

    if (localFrame === 1) {
      api.showBanner(`${stage.title} ${currentQuestDiff().name}`);
    }

    if (stage.key === 'pterarush') updatePteraRush(api);
    else if (stage.key === 'guardian_test') updateGuardianTest(api);
    else if (stage.key === 'grass_traveler') updateGrassTraveler(api);
    else if (stage.key === 'thieves') updateThieves(api);
    else if (stage.key === 'desert_ruler') updateDesertRuler(api);
    else if (stage.key === 'desert_sharks') updateDesertSharks(api);
    else if (stage.key === 'hot_magma') updateHotMagma(api);
    else if (stage.key === 'magma_guardian') updateMagmaGuardian(api);
    else if (stage.key === 'sky_rulers') updateSkyRulers(api);
    else if (stage.key === 'neon_nightmare') updateNeonNightmare(api);
    else if (stage.key === 'nine_heads') updateNineHeads(api);
    else if (stage.key === 'town_dragon') updateTownDragon(api);
    else if (stage.key === 'three_birds') updateThreeBirds(api);
    else if (stage.key === 'neon_maoh') updateNeonMaoh(api);
    else if (stage.key === 'magma_beauty') updateMagmaBeauty(api);
    else if (stage.key === 'maoh_duel') updateMaohDuel(api);
    else if (stage.key === 'lilith_sisters') updateLilithSisters(api);
    else if (stage.key === 'castle_machine') updateCastleMachine(api);

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

    if (diffKey === 'easy') addDropStone(91, rollDropCount(), drops);

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

  function injectDropStyle(){
    if (document.getElementById('mobEventDropStyle')) return;

    const style = document.createElement('style');
    style.id = 'mobEventDropStyle';
    style.textContent = `
      .mob-event-drop-pop{position:absolute;inset:0;z-index:260;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(0,0,0,.74)}
      .mob-event-drop-pop.hidden{display:none}
      .mob-event-drop-card{width:min(92vw,440px);border-radius:28px;padding:18px;text-align:center;background:linear-gradient(180deg,rgba(35,28,78,.98),rgba(5,8,22,.98));border:3px solid rgba(255,255,255,.38);box-shadow:0 18px 48px rgba(0,0,0,.72)}
      .mob-event-drop-title{font-size:25px;font-weight:1000;color:#ffe66b;text-shadow:0 3px 0 #000,0 0 14px rgba(255,230,107,.7);margin-bottom:12px}
      .mob-event-drop-list{display:grid;grid-template-columns:1fr;gap:10px;margin-bottom:14px;max-height:52vh;overflow:auto}
      .mob-event-drop-item{display:grid;grid-template-columns:74px 1fr;gap:10px;align-items:center;padding:10px;border-radius:18px;background:rgba(255,255,255,.10);border:2px solid rgba(255,255,255,.20)}
      .mob-event-drop-item img{width:68px;height:68px;object-fit:contain;filter:drop-shadow(0 5px 0 rgba(0,0,0,.35))}
      .mob-event-drop-name{color:#fff;font-size:15px;font-weight:1000;line-height:1.35;text-align:left;text-shadow:0 2px 0 #000}
      .mob-event-drop-count{margin-top:4px;color:#ffcf5b;font-size:13px;font-weight:1000;text-align:left}
      .mob-event-drop-ok{border:0;border-radius:999px;padding:12px 28px;font-size:16px;font-weight:1000;color:#181000;background:linear-gradient(#ffe66b,#ffb423);box-shadow:0 5px 0 rgba(0,0,0,.35)}
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

    const ok = document.getElementById('mobEventDropOk');
    if (ok) {
      ok.addEventListener('click', function(){
        pop.classList.add('hidden');
        forceEventResultButtons();
      });
    }

    pop.addEventListener('click', function(e){
      if (e.target === pop) {
        pop.classList.add('hidden');
        forceEventResultButtons();
      }
    });

    return pop;
  }

  function showDropPop(drops){
    if (!drops || !drops.length) {
      forceEventResultButtons();
      return;
    }

    hideResultButtons();

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
    nextEnemyAt = 220;
    nextChestAt = 360;
    nextGimmickAt = 999999;
    spawnedBoss = false;
    goldBossRespawnAt = 0;
    scoreAttackIndex = 0;
    finishBonusApplied = false;

    questInfo = null;
    questPhase = 0;
    questKills = 0;
    questBossSpawned = false;
    questWaveSpawned = false;
    questExtraSpawned = false;
    questSupportSpawned = 0;
  }

  function startCurrentEvent(api){
    document.__mobShotEventResultMode = false;

    eventData = getEvent();

    if (!eventData || !eventData.key) {
      active = false;
      eventData = null;
      eventType = '';
      difficultyKey = '';
      stageId = 0;
      return false;
    }

    if (eventData.key === 'doubleBoss') {
      active = false;
      eventData = null;
      eventType = '';
      difficultyKey = '';
      stageId = 0;

      if (window.MobShotEvents && window.MobShotEvents.clearCurrentEvent) {
        window.MobShotEvents.clearCurrentEvent();
      }

      return false;
    }

    retryEventData = clone(eventData);

    active = true;
    eventType = eventData.key;
    difficultyKey = normalizeDifficultyKey(eventData.difficulty || eventData.difficultyKey || '');

    stageId = Number(
      eventData.questStageId ||
      eventData.stageId ||
      (eventData.questStage && eventData.questStage.id) ||
      (eventData.stage && eventData.stage.id) ||
      0
    );

    resetLocalState();

    api.state.entities.length = 0;
    api.state.bullets.length = 0;
    api.state.particles.length = 0;
    api.state.texts.length = 0;

    if (eventType === 'gold') {
      const diff = getGoldDifficulty();

      nextEnemyAt = 120;
      nextChestAt = 40;
      nextGimmickAt = 150;

      api.setEventMode({ active:true, key:'gold' });
      setStageVisual(api, `GOLD ${diff.name}`, diff.background || 'sta/backmao.png', diff.areaKey || 'grass', diff.areaName || 'ゴールドステージ');
      api.showBanner(`GOLD STAGE ${diff.name} 30秒`);
      return true;
    }

    if (eventType === 'scoreAttack') {
      api.setEventMode({ active:true, key:'scoreAttack' });
      setStageVisual(api, 'SCORE ATTACK', 'sta/backneon.png', 'neon', 'スコアアタック');
      api.showBanner('スコアアタック');
      return true;
    }

    if (eventType === 'eventQuest') {
      questInfo = getQuestInfoFromEvent(eventData);

      nextEnemyAt = 260;
      nextChestAt = 420;
      nextGimmickAt = questInfo.stage.gimmickSpawn ? 260 : 999999;

      api.setEventMode({ active:true, key:'eventQuest' });
      setStageVisual(api, `QUEST ${questInfo.difficulty.name}`, questInfo.stage.background || null, questInfo.stage.areaKey, questInfo.stage.areaName);
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

      if (eventType === 'gold' && entity.kind === 'boss' && !entity.__goldDiamondRolled) {
        entity.__goldDiamondRolled = true;

        const diff = getGoldDifficulty();
        const rate = goldBossDiamondRate(diff.key);

        if (Math.random() < rate) {
          addDiamond(1);

          if (api && api.state && Array.isArray(api.state.texts)) {
            api.state.texts.push({
              x:entity.x || api.W / 2,
              y:entity.y || api.H * 0.25,
              text:'+1 DIAMOND',
              life:70,
              vy:-0.8,
              color:'#8ee8ff',
              size:22
            });
          }

          if (api && api.showBanner) {
            api.showBanner('DIAMOND DROP!');
          }
        }
      }
    }

    if (eventType === 'eventQuest' && entity.kind === 'enemy') {
      questKills++;
    }
  }

  function beforeFinish(clear, api){
    if (!active || finishBonusApplied) return null;

    finishBonusApplied = true;

    let text = clear ? 'イベントクリア！' : 'イベント失敗';
    let bonusCoin = 0;
    let bonusDiamond = 0;

    const retryCopy = eventData ? clone(eventData) : retryEventData ? clone(retryEventData) : null;
    if (retryCopy && retryCopy.key) retryEventData = retryCopy;

    if (clear && eventType === 'gold') {
      const diff = getGoldDifficulty();
      const first = window.MobShotEvents && window.MobShotEvents.hasGoldCleared ? !window.MobShotEvents.hasGoldCleared(diff.key) : false;

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

    if (clear && eventType === 'scoreAttack') {
      bonusCoin = Math.max(0, scoreAttackIndex) * 1000;
      api.state.coin += bonusCoin;

      if (window.MobShotEvents && window.MobShotEvents.recordScoreAttackClear) {
        window.MobShotEvents.recordScoreAttackClear(api.state.coin);
      }

      text = `スコアアタック終了！ 撃破 ${scoreAttackIndex}体`;
    }

    if (clear && eventType === 'eventQuest') {
      const info = questInfo || getQuestInfoFromEvent(eventData || retryEventData);
      const diff = info.difficulty;
      const stage = info.stage;

      if (window.MobShotEvents && window.MobShotEvents.recordEventQuestClear) {
        window.MobShotEvents.recordEventQuestClear(diff.key, stage.id, api.state.coin);
      }

      const drops = rollEventQuestDrops(diff.key, stage);

      setTimeout(function(){
        showDropPop(drops);
      }, 0);

      text = `${stage.title} ${diff.name} クリア！`;
    }

    if (!clear) text = 'イベント失敗';

    if (window.MobShotEvents && window.MobShotEvents.clearCurrentEvent) {
      window.MobShotEvents.clearCurrentEvent();
    }

    clearEventRequest();

    active = false;
    eventData = null;
    eventType = '';
    difficultyKey = '';
    stageId = 0;

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

      if (api.hudStage) api.hudStage.textContent = `GOLD ${diff.name} ${goldRemainingSec()}秒`;
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
      const info = questInfo || getQuestInfoFromEvent(eventData || retryEventData);

      if (api.hudStage) api.hudStage.textContent = `QUEST ${info.difficulty.name}`;
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
