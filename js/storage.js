'use strict';

(function(){
  const SAVE_KEY = 'mobshot_split_v1';

  const AREA_ORDER = [
    { key:'grass', areaNo:1, name:'草原' },
    { key:'desert', areaNo:2, name:'砂漠' },
    { key:'town', areaNo:3, name:'田舎町' },
    { key:'neon', areaNo:4, name:'ネオン街' },
    { key:'magma', areaNo:5, name:'マグマ' },
    { key:'castle', areaNo:6, name:'魔王城' }
  ];

  function defaultSave(){
    return {
      totalScore: 0,
      bestScore: 0,
      coin: 100000,
      diamond: 0,
      rank: 10,

      stageProgress: {
        currentAreaIndex: 0,
        currentStageNo: 1,
        highest: {
          grass: 0,
          desert: 0,
          town: 0,
          neon: 0,
          magma: 0,
          castle: 0
        }
      }
    };
  }

  function normalizeSave(save){
    const base = defaultSave();

    save = Object.assign(base, save || {});

    save.totalScore = Number(save.totalScore || 0);
    save.bestScore = Number(save.bestScore || 0);
    save.coin = Number(save.coin || 0);
    save.diamond = Number(save.diamond || 0);
    save.rank = Number(save.rank || calcRank(save.totalScore));

    save.stageProgress = Object.assign(
      defaultSave().stageProgress,
      save.stageProgress || {}
    );

    save.stageProgress.highest = Object.assign(
      defaultSave().stageProgress.highest,
      save.stageProgress.highest || {}
    );

    save.stageProgress.currentAreaIndex = Math.max(
      0,
      Math.min(
        AREA_ORDER.length - 1,
        Number(save.stageProgress.currentAreaIndex || 0)
      )
    );

    save.stageProgress.currentStageNo = Math.max(
      1,
      Math.min(
        99,
        Number(save.stageProgress.currentStageNo || 1)
      )
    );

    return save;
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

  function calcRank(totalScore){
    totalScore = Number(totalScore || 0);

    if (totalScore >= 1500000) return 10;
    if (totalScore >= 800000) return 9;
    if (totalScore >= 400000) return 8;
    if (totalScore >= 200000) return 7;
    if (totalScore >= 100000) return 6;
    if (totalScore >= 50000) return 5;
    if (totalScore >= 30000) return 4;
    if (totalScore >= 12500) return 3;
    if (totalScore >= 5000) return 2;

    return 1;
  }

  function addRunResult(score, coin){
    const data = load();

    score = Number(score || 0);
    coin = Number(coin || 0);

    data.totalScore += score;
    data.bestScore = Math.max(data.bestScore, score);
    data.coin += coin;

    data.rank = Math.max(
      Number(data.rank || 1),
      calcRank(data.totalScore)
    );

    return save(data);
  }

  function getStageProgress(){
    return load().stageProgress;
  }

  function getCurrentStage(){
    const data = load();
    const progress = data.stageProgress;
    const area = AREA_ORDER[progress.currentAreaIndex] || AREA_ORDER[0];

    return {
      areaIndex: progress.currentAreaIndex,
      areaKey: area.key,
      areaNo: area.areaNo,
      areaName: area.name,
      stageNo: progress.currentStageNo,
      id: `${area.areaNo}-${progress.currentStageNo}`,
      isStrongBoss: progress.currentStageNo % 10 === 0,
      difficulty: getDifficulty(progress.currentStageNo)
    };
  }

  function getDifficulty(stageNo){
    stageNo = Number(stageNo || 1);

    if (stageNo <= 10) return 'EASY';
    if (stageNo <= 20) return 'HARD';
    if (stageNo <= 30) return 'VERY HARD';
    if (stageNo <= 40) return 'EXPERT';
    if (stageNo <= 50) return 'MASTER';
    if (stageNo <= 60) return 'LEGEND';
    if (stageNo <= 70) return 'MYTHIC';
    if (stageNo <= 80) return 'CHAOS';
    if (stageNo <= 90) return 'HELL';

    return 'DEMON LORD';
  }

  function recordStageClear(areaKey, stageNo){
    const data = load();

    areaKey = areaKey || 'grass';
    stageNo = Math.max(1, Math.min(99, Number(stageNo || 1)));

    if (!data.stageProgress.highest[areaKey]) {
      data.stageProgress.highest[areaKey] = 0;
    }

    data.stageProgress.highest[areaKey] = Math.max(
      Number(data.stageProgress.highest[areaKey] || 0),
      stageNo
    );

    return save(data);
  }

  function advanceStage(){
    const data = load();
    const progress = data.stageProgress;
    const currentArea = AREA_ORDER[progress.currentAreaIndex] || AREA_ORDER[0];

    recordStageClear(currentArea.key, progress.currentStageNo);

    if (progress.currentStageNo < 99) {
      progress.currentStageNo += 1;
    } else {
      progress.currentStageNo = 1;
      progress.currentAreaIndex += 1;

      if (progress.currentAreaIndex >= AREA_ORDER.length) {
        progress.currentAreaIndex = AREA_ORDER.length - 1;
        progress.currentStageNo = 99;
      }
    }

    data.stageProgress = progress;

    return save(data);
  }

  function setCurrentStage(areaIndex, stageNo){
    const data = load();

    data.stageProgress.currentAreaIndex = Math.max(
      0,
      Math.min(AREA_ORDER.length - 1, Number(areaIndex || 0))
    );

    data.stageProgress.currentStageNo = Math.max(
      1,
      Math.min(99, Number(stageNo || 1))
    );

    return save(data);
  }

  function resetSave(){
    const data = defaultSave();
    save(data);
    return data;
  }

  window.MobShotStorage = {
    load,
    save,
    calcRank,
    addRunResult,
    getStageProgress,
    getCurrentStage,
    getDifficulty,
    recordStageClear,
    advanceStage,
    setCurrentStage,
    resetSave,
    AREA_ORDER
  };
})();
