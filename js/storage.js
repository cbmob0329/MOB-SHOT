'use strict';

(function(){
  const SAVE_KEY = 'mobshot_split_v1';

  const STAGE_AREAS = [
    { chapter:1, start:1, end:3, key:'grass', name:'草原', difficulty:'イージー' },
    { chapter:1, start:4, end:6, key:'desert', name:'砂漠', difficulty:'イージー' },
    { chapter:1, start:7, end:9, key:'town', name:'田舎町', difficulty:'イージー' },
    { chapter:2, start:1, end:3, key:'neon', name:'ネオン街', difficulty:'イージー' },
    { chapter:2, start:4, end:6, key:'magma', name:'マグマ', difficulty:'イージー' },
    { chapter:2, start:7, end:9, key:'castle', name:'魔王城', difficulty:'イージー' },

    { chapter:3, start:1, end:3, key:'grass', name:'草原', difficulty:'ハード' },
    { chapter:3, start:4, end:6, key:'desert', name:'砂漠', difficulty:'ハード' },
    { chapter:3, start:7, end:9, key:'town', name:'田舎町', difficulty:'ハード' },
    { chapter:4, start:1, end:3, key:'neon', name:'ネオン街', difficulty:'ハード' },
    { chapter:4, start:4, end:6, key:'magma', name:'マグマ', difficulty:'ハード' },
    { chapter:4, start:7, end:9, key:'castle', name:'魔王城', difficulty:'ハード' },

    { chapter:5, start:1, end:3, key:'grass', name:'草原', difficulty:'ベリーハード' },
    { chapter:5, start:4, end:6, key:'desert', name:'砂漠', difficulty:'ベリーハード' },
    { chapter:5, start:7, end:9, key:'town', name:'田舎町', difficulty:'ベリーハード' },
    { chapter:6, start:1, end:3, key:'neon', name:'ネオン街', difficulty:'ベリーハード' },
    { chapter:6, start:4, end:6, key:'magma', name:'マグマ', difficulty:'ベリーハード' },
    { chapter:6, start:7, end:9, key:'castle', name:'魔王城', difficulty:'ベリーハード' },

    { chapter:7, start:1, end:3, key:'grass', name:'草原', difficulty:'インフェルノ' },
    { chapter:7, start:4, end:6, key:'desert', name:'砂漠', difficulty:'インフェルノ' },
    { chapter:7, start:7, end:9, key:'town', name:'田舎町', difficulty:'インフェルノ' },
    { chapter:8, start:1, end:3, key:'magma', name:'マグマ', difficulty:'インフェルノ' },
    { chapter:8, start:4, end:6, key:'neon', name:'ネオン街', difficulty:'インフェルノ' },
    { chapter:8, start:7, end:9, key:'castle', name:'魔王城', difficulty:'インフェルノ' },

    { chapter:9, start:1, end:9, key:'prison', name:'監獄', difficulty:'レジェンド', legend:true },
    { chapter:10, start:1, end:9, key:'matrix', name:'マトリックス', difficulty:'レジェンド', legend:true },
    { chapter:11, start:1, end:9, key:'seaRail', name:'海の線路', difficulty:'レジェンド', legend:true },
    { chapter:12, start:1, end:9, key:'neonHighway', name:'ネオン高速', difficulty:'レジェンド', legend:true },
    { chapter:13, start:1, end:9, key:'makai', name:'魔界', difficulty:'レジェンド', legend:true },
    { chapter:14, start:1, end:9, key:'last', name:'魔王の間', difficulty:'レジェンド', legend:true }
  ];

  const AREA_ORDER = [
    'grass','desert','town','neon','magma','castle',
    'prison','matrix','seaRail','neonHighway','makai','last'
  ];

  const RANK_MAX = 100;

  const RANK_SCORE_TABLE = [
    0,
    0,
    1000,
    3000,
    6000,
    10000,
    16000,
    24000,
    34000,
    46000,
    60000
  ];

  function buildStageList(){
    const list = [];

    STAGE_AREAS.forEach(area => {
      for (let stageNo = area.start; stageNo <= area.end; stageNo++) {
        const slot = stageNo % 3 === 0 ? 3 : stageNo % 3;
        const isAreaFinal = slot === 3 || area.legend;

        list.push({
          id: `${area.chapter}-${stageNo}`,
          chapter: area.chapter,
          stageNo,
          areaKey: area.key,
          areaName: area.name,
          difficulty: area.difficulty,
          isLegend: !!area.legend,
          isStrongBoss: !!isAreaFinal,
          areaSlot: slot
        });
      }
    });

    return list;
  }

  const STAGE_LIST = buildStageList();

  function defaultHighestStages(){
    const highest = {};
    AREA_ORDER.forEach(key => highest[key] = 0);
    return highest;
  }

  function defaultMissionStats(){
    return {
      obstacleKills: 0,
      enemyKills: 0,
      midBossKills: 0,
      bossKills: 0,
      gateCount: 0,
      totalEarnedCoin: 0,
      totalStageClears: 0,
      firstBossKills: {},
      firstStrongBossKills: {},
      reachedAreas: {}
    };
  }

  function defaultSave(){
    return {
      totalScore: 0,
      bestScore: 0,
      coin: 10000000,
      diamond: 0,
      rank: 10,

      stageProgress: {
        currentStageIndex: 0,
        highestStageIndex: -1,
        highest: defaultHighestStages(),
        clearedStageIds: {}
      },

      testStage: {
        enabled: false,
        stageIndex: 0
      },

      missionStats: defaultMissionStats()
    };
  }

  function scoreNeedForRank(rank){
    rank = Number(rank || 1);

    if (rank <= 1) return 0;
    if (rank <= 10) return RANK_SCORE_TABLE[rank] || 0;

    const over = rank - 10;
    return 60000 + Math.floor(Math.pow(over, 1.72) * 6500);
  }

  function calcRank(totalScore){
    totalScore = Number(totalScore || 0);

    let rank = 1;

    for (let r = 2; r <= RANK_MAX; r++) {
      if (totalScore >= scoreNeedForRank(r)) {
        rank = r;
      } else {
        break;
      }
    }

    return Math.max(1, Math.min(RANK_MAX, rank));
  }

  function normalizeSave(saveData){
    const base = defaultSave();

    saveData = Object.assign(base, saveData || {});

    saveData.totalScore = Number(saveData.totalScore || 0);
    saveData.bestScore = Number(saveData.bestScore || 0);
    saveData.coin = Number(saveData.coin || 0);
    saveData.diamond = Number(saveData.diamond || 0);
    saveData.rank = Math.max(
      Number(saveData.rank || 1),
      calcRank(saveData.totalScore)
    );
    saveData.rank = Math.max(1, Math.min(RANK_MAX, Number(saveData.rank || 1)));

    saveData.stageProgress = Object.assign(defaultSave().stageProgress, saveData.stageProgress || {});
    saveData.stageProgress.highest = Object.assign(defaultHighestStages(), saveData.stageProgress.highest || {});
    saveData.stageProgress.clearedStageIds = Object.assign({}, saveData.stageProgress.clearedStageIds || {});

    saveData.stageProgress.currentStageIndex = Math.max(
      0,
      Math.min(STAGE_LIST.length - 1, Number(saveData.stageProgress.currentStageIndex || 0))
    );

    saveData.stageProgress.highestStageIndex = Math.max(
      -1,
      Math.min(STAGE_LIST.length - 1, Number(saveData.stageProgress.highestStageIndex ?? -1))
    );

    saveData.testStage = Object.assign(defaultSave().testStage, saveData.testStage || {});
    saveData.testStage.enabled = !!saveData.testStage.enabled;
    saveData.testStage.stageIndex = Math.max(
      0,
      Math.min(STAGE_LIST.length - 1, Number(saveData.testStage.stageIndex || 0))
    );

    saveData.missionStats = Object.assign(defaultMissionStats(), saveData.missionStats || {});
    saveData.missionStats.obstacleKills = Number(saveData.missionStats.obstacleKills || 0);
    saveData.missionStats.enemyKills = Number(saveData.missionStats.enemyKills || 0);
    saveData.missionStats.midBossKills = Number(saveData.missionStats.midBossKills || 0);
    saveData.missionStats.bossKills = Number(saveData.missionStats.bossKills || 0);
    saveData.missionStats.gateCount = Number(saveData.missionStats.gateCount || 0);
    saveData.missionStats.totalEarnedCoin = Number(saveData.missionStats.totalEarnedCoin || 0);
    saveData.missionStats.totalStageClears = Number(saveData.missionStats.totalStageClears || 0);

    saveData.missionStats.firstBossKills = Object.assign({}, saveData.missionStats.firstBossKills || {});
    saveData.missionStats.firstStrongBossKills = Object.assign({}, saveData.missionStats.firstStrongBossKills || {});
    saveData.missionStats.reachedAreas = Object.assign({}, saveData.missionStats.reachedAreas || {});

    return saveData;
  }

  function load(){
    try {
      const raw = localStorage.getItem(SAVE_KEY);

      if (!raw) {
        const first = defaultSave();
        save(first);
        return first;
      }

      return normalizeSave(JSON.parse(raw));
    } catch(e) {
      return defaultSave();
    }
  }

  function save(data){
    const normalized = normalizeSave(data);

    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(normalized));
    } catch(e) {}

    return normalized;
  }

  function getStageByIndex(index){
    index = Math.max(0, Math.min(STAGE_LIST.length - 1, Number(index || 0)));
    return STAGE_LIST[index];
  }

  function decorateStage(stage, index, isTest){
    return {
      index,
      id: stage.id,
      chapter: stage.chapter,
      stageNo: stage.stageNo,
      areaKey: stage.areaKey,
      areaName: stage.areaName,
      areaNo: stage.chapter,
      difficulty: stage.difficulty,
      isLegend: !!stage.isLegend,
      isStrongBoss: !!stage.isStrongBoss,
      areaSlot: stage.areaSlot,
      isTest: !!isTest
    };
  }

  function getCurrentStage(){
    const data = load();

    if (data.testStage && data.testStage.enabled) {
      const stage = getStageByIndex(data.testStage.stageIndex);
      return decorateStage(stage, data.testStage.stageIndex, true);
    }

    const index = data.stageProgress.currentStageIndex || 0;
    const stage = getStageByIndex(index);

    return decorateStage(stage, index, false);
  }

  function setCurrentStageByIndex(index){
    const data = load();

    data.stageProgress.currentStageIndex = Math.max(
      0,
      Math.min(STAGE_LIST.length - 1, Number(index || 0))
    );

    data.testStage.enabled = false;

    return save(data);
  }

  function setCurrentStageById(id){
    const index = STAGE_LIST.findIndex(stage => stage.id === id);
    if (index < 0) return load();
    return setCurrentStageByIndex(index);
  }

  function setTestStageByIndex(index){
    const data = load();

    data.testStage.enabled = true;
    data.testStage.stageIndex = Math.max(
      0,
      Math.min(STAGE_LIST.length - 1, Number(index || 0))
    );

    return save(data);
  }

  function setTestStageById(id){
    const index = STAGE_LIST.findIndex(stage => stage.id === id);
    if (index < 0) return load();
    return setTestStageByIndex(index);
  }

  function clearTestStage(){
    const data = load();
    data.testStage.enabled = false;
    return save(data);
  }

  function getDifficulty(){
    return getCurrentStage().difficulty;
  }

  function addRunResult(score, coin){
    const data = load();

    score = Number(score || 0);
    coin = Number(coin || 0);

    const beforeRank = Number(data.rank || 1);

    data.totalScore += score;
    data.bestScore = Math.max(data.bestScore, score);
    data.coin += coin;
    data.missionStats.totalEarnedCoin += coin;

    const afterRank = Math.max(beforeRank, calcRank(data.totalScore));
    data.rank = Math.max(1, Math.min(RANK_MAX, afterRank));

    const saved = save(data);

    if (saved.rank > beforeRank) {
      window.dispatchEvent(new CustomEvent('mobshot:rankUp', {
        detail: {
          beforeRank,
          rank: saved.rank,
          totalScore: saved.totalScore,
          nextScore: scoreNeedForRank(saved.rank + 1)
        }
      }));
    }

    return saved;
  }

  function recordStageClearByInfo(info){
    const data = load();

    if (!info) info = getCurrentStage();

    if (info.isTest) return save(data);

    const currentIndex = Number(info.index || 0);

    data.stageProgress.clearedStageIds[info.id] = true;
    data.stageProgress.highestStageIndex = Math.max(
      Number(data.stageProgress.highestStageIndex || -1),
      currentIndex
    );

    data.stageProgress.highest[info.areaKey] = Math.max(
      Number(data.stageProgress.highest[info.areaKey] || 0),
      Number(info.stageNo || 0)
    );

    data.missionStats.totalStageClears += 1;
    data.missionStats.reachedAreas[info.areaKey] = true;

    return save(data);
  }

  function recordStageClear(areaKey, stageNo){
    const current = getCurrentStage();

    if (current.areaKey === areaKey && Number(current.stageNo) === Number(stageNo)) {
      return recordStageClearByInfo(current);
    }

    const index = STAGE_LIST.findIndex(stage =>
      stage.areaKey === areaKey &&
      Number(stage.stageNo) === Number(stageNo)
    );

    if (index < 0) return load();

    return recordStageClearByInfo(decorateStage(STAGE_LIST[index], index, false));
  }

  function advanceStage(){
    const data = load();

    if (data.testStage && data.testStage.enabled) return save(data);

    const nextIndex = Math.min(
      STAGE_LIST.length - 1,
      Number(data.stageProgress.currentStageIndex || 0) + 1
    );

    data.stageProgress.currentStageIndex = nextIndex;

    const nextStage = STAGE_LIST[nextIndex];

    if (nextStage) {
      data.missionStats.reachedAreas[nextStage.areaKey] = true;
    }

    return save(data);
  }

  function addMissionStat(key, amount){
    const data = load();
    data.missionStats[key] = Number(data.missionStats[key] || 0) + Number(amount || 1);
    return save(data);
  }

  function markBossFirstKill(info, bossName){
    const data = load();

    if (!info || !bossName) return save(data);

    if (info.isStrongBoss || info.isLegend) {
      data.missionStats.firstStrongBossKills[bossName] = true;
    } else {
      data.missionStats.firstBossKills[bossName] = true;
    }

    return save(data);
  }

  function clearAllMobShotStorage(){
    const keys = [];

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);

        if (
          key &&
          (
            key.indexOf('mobshot') === 0 ||
            key.indexOf('MOBSHOT') === 0
          )
        ) {
          keys.push(key);
        }
      }

      keys.forEach(key => localStorage.removeItem(key));
    } catch(e) {}

    return keys;
  }

  function resetSave(){
    clearAllMobShotStorage();

    const data = defaultSave();
    save(data);

    window.dispatchEvent(new CustomEvent('mobshot:saveUpdated'));
    window.dispatchEvent(new CustomEvent('mobshot:eventItemsUpdated'));
    window.dispatchEvent(new CustomEvent('mobshot:eventStatsUpdated'));

    return data;
  }

  window.MobShotStorage = {
    load,
    save,
    calcRank,
    scoreNeedForRank,
    addRunResult,

    getCurrentStage,
    getDifficulty,

    recordStageClear,
    recordStageClearByInfo,
    advanceStage,

    setCurrentStageByIndex,
    setCurrentStageById,
    setTestStageByIndex,
    setTestStageById,
    clearTestStage,

    addMissionStat,
    markBossFirstKill,

    resetSave,
    clearAllMobShotStorage,

    RANK_MAX,
    STAGE_LIST,
    STAGE_AREAS,
    AREA_ORDER
  };
})();
