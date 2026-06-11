'use strict';

(function(){
  const MISSION_SAVE_KEY = 'mobshot_mission_state_v2';

  let currentTab = 'stage';

  const COUNT_TARGETS_LONG = [
    10,25,50,75,100,150,200,300,500,750,
    1000,1500,2000,3000,5000,7500,10000,
    15000,20000,30000,50000,75000,100000,
    150000,200000,300000,500000,750000,1000000
  ];

  const COUNT_TARGETS_MID = [
    1,3,5,10,20,30,50,75,100,150,200,300,500,750,1000
  ];

  const GATE_TARGETS = [
    10,25,50,75,100,200,300,500,750,1000,1500,2000,3000,5000
  ];

  const COIN_TARGETS = [
    1000,3000,5000,10000,30000,50000,100000,300000,500000,
    1000000,3000000,5000000,10000000,30000000,50000000
  ];

  const SCORE_TARGETS = [
    1000,3000,5000,10000,30000,50000,100000,300000,500000,
    1000000,3000000,5000000,10000000,30000000,50000000,100000000
  ];

  const STAGE_CLEAR_TARGETS = [
    1,3,5,10,15,20,25,30,40,50,60,70,80,90,100,110,120,126
  ];

  const RANK_TARGETS = [2,3,4,5,6,7,8,9,10];

  const AREA_REACH_REWARDS = [
    { id:'reach_1_3', stageId:'1-3', title:'草原突破', coin:5000, diamond:3 },
    { id:'reach_1_6', stageId:'1-6', title:'砂漠突破', coin:10000, diamond:5 },
    { id:'reach_1_9', stageId:'1-9', title:'田舎町突破', coin:15000, diamond:5 },
    { id:'reach_2_3', stageId:'2-3', title:'ネオン街突破', coin:20000, diamond:7 },
    { id:'reach_2_6', stageId:'2-6', title:'マグマ突破', coin:30000, diamond:8 },
    { id:'reach_2_9', stageId:'2-9', title:'魔王城突破', coin:50000, diamond:10 },

    { id:'reach_3_9', stageId:'3-9', title:'ハード前半突破', coin:80000, diamond:10 },
    { id:'reach_4_9', stageId:'4-9', title:'ハード完全突破', coin:120000, diamond:15 },

    { id:'reach_5_9', stageId:'5-9', title:'ベリーハード前半突破', coin:180000, diamond:15 },
    { id:'reach_6_9', stageId:'6-9', title:'ベリーハード完全突破', coin:250000, diamond:20 },

    { id:'reach_7_9', stageId:'7-9', title:'インフェルノ前半突破', coin:350000, diamond:25 },
    { id:'reach_8_9', stageId:'8-9', title:'インフェルノ完全突破', coin:500000, diamond:30 },

    { id:'reach_9_9', stageId:'9-9', title:'監獄突破', coin:700000, diamond:35 },
    { id:'reach_10_9', stageId:'10-9', title:'マトリックス突破', coin:850000, diamond:40 },
    { id:'reach_11_9', stageId:'11-9', title:'海の線路突破', coin:1000000, diamond:45 },
    { id:'reach_12_9', stageId:'12-9', title:'ネオン高速突破', coin:1300000, diamond:50 },
    { id:'reach_13_9', stageId:'13-9', title:'魔界突破', coin:1700000, diamond:60 },
    { id:'reach_14_9', stageId:'14-9', title:'魔王の間突破', coin:2500000, diamond:100 }
  ];

  const NORMAL_BOSS_FIRST = [
    { key:'ホークモブ', coin:1000, diamond:1 },
    { key:'ミラモブ', coin:1000, diamond:1 },
    { key:'番人', coin:1000, diamond:1 },
    { key:'ネオンモブ', coin:1500, diamond:2 },
    { key:'ドラゴンモブ', coin:2000, diamond:2 },
    { key:'モブリリス', coin:3000, diamond:3 }
  ];

  const STRONG_BOSS_FIRST = [
    { key:'ホークモブⅡ', coin:5000, diamond:5 },
    { key:'ミラモブⅡ', coin:5000, diamond:5 },
    { key:'番人Ⅱ', coin:7000, diamond:6 },
    { key:'ネオンモブⅡ', coin:10000, diamond:7 },
    { key:'ドラゴンモブⅡ', coin:15000, diamond:8 },
    { key:'モブ魔王', coin:50000, diamond:20 },
    { key:'モブメイル', coin:100000, diamond:20 },
    { key:'モブスミス', coin:150000, diamond:25 },
    { key:'モブネプ', coin:200000, diamond:30 },
    { key:'ブルネオモブ', coin:250000, diamond:35 },
    { key:'パルネオモブ', coin:300000, diamond:40 },
    { key:'閻魔モブ', coin:500000, diamond:50 },
    { key:'ウルモブリリス', coin:1000000, diamond:100 }
  ];

  function $(id){
    return document.getElementById(id);
  }

  function defaultState(){
    return {
      claimed: {}
    };
  }

  function loadState(){
    let state = defaultState();

    try {
      const raw = localStorage.getItem(MISSION_SAVE_KEY);

      if (raw) {
        const parsed = JSON.parse(raw);
        state = Object.assign(state, parsed || {});
        state.claimed = Object.assign({}, parsed.claimed || {});
      }
    } catch(e) {}

    return state;
  }

  function saveState(state){
    try {
      localStorage.setItem(MISSION_SAVE_KEY, JSON.stringify(state));
    } catch(e) {}
  }

  function getSave(){
    if (window.MobShotStorage && window.MobShotStorage.load) {
      return window.MobShotStorage.load();
    }

    return {
      coin: 0,
      diamond: 0,
      rank: 1,
      totalScore: 0,
      bestScore: 0,
      stageProgress: {
        highestStageIndex: -1,
        clearedStageIds: {}
      },
      missionStats: {}
    };
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

  function stats(save){
    return save.missionStats || {};
  }

  function stageList(){
    if (window.MobShotStorage && window.MobShotStorage.STAGE_LIST) {
      return window.MobShotStorage.STAGE_LIST;
    }

    return [];
  }

  function stageIndexById(id){
    return stageList().findIndex(stage => stage.id === id);
  }

  function clearedStageIndex(save){
    return Number(save.stageProgress && save.stageProgress.highestStageIndex != null
      ? save.stageProgress.highestStageIndex
      : -1
    );
  }

  function rewardText(reward){
    const parts = [];

    if (reward.diamond) {
      parts.push(`${Number(reward.diamond).toLocaleString()}ダイヤ`);
    }

    if (reward.coin) {
      parts.push(`${Number(reward.coin).toLocaleString()}コイン`);
    }

    return parts.join(' / ') || '報酬なし';
  }

  function progressText(current, target){
    return `${Math.min(current, target).toLocaleString()} / ${target.toLocaleString()}`;
  }

  function progressRate(current, target){
    if (!target) return 0;
    return Math.max(0, Math.min(100, Math.floor((current / target) * 100)));
  }

  function scaleCoin(target, base){
    if (target <= 100) return base;
    if (target <= 1000) return base * 2;
    if (target <= 10000) return base * 5;
    if (target <= 100000) return base * 12;
    return base * 30;
  }

  function scaleDiamond(target, base){
    if (target < 1000) return base;
    if (target < 10000) return base + 1;
    if (target < 100000) return base + 3;
    return base + 8;
  }

  function makeStageMissions(){
    const missions = [];

    AREA_REACH_REWARDS.forEach(item => {
      const targetIndex = stageIndexById(item.stageId);

      missions.push({
        id: item.id,
        tab: 'stage',
        icon: '到',
        title: item.title,
        desc: `${item.stageId}をクリア`,
        currentType: 'stageIndex',
        target: targetIndex,
        reward: {
          coin: item.coin,
          diamond: item.diamond
        }
      });
    });

    STAGE_CLEAR_TARGETS.forEach(target => {
      missions.push({
        id: `stageclear_${target}`,
        tab: 'stage',
        icon: 'ST',
        title: `累計${target}ステージクリア`,
        desc: '通常出撃でクリアした累計ステージ数',
        currentType: 'totalStageClears',
        target,
        reward: {
          coin: target * 1200,
          diamond: target >= 30 ? Math.floor(target / 10) : 0
        }
      });
    });

    return missions;
  }

  function makeDestroyMissions(){
    const missions = [];

    COUNT_TARGETS_LONG.forEach(target => {
      missions.push({
        id: `enemy_${target}`,
        tab: 'destroy',
        icon: '敵',
        title: `敵${target.toLocaleString()}体撃破`,
        desc: '雑魚敵・中ボス・ボスを含む累計撃破数',
        currentType: 'enemyKills',
        target,
        reward: {
          coin: scaleCoin(target, 150),
          diamond: scaleDiamond(target, 1)
        }
      });
    });

    COUNT_TARGETS_LONG.forEach(target => {
      missions.push({
        id: `obstacle_${target}`,
        tab: 'destroy',
        icon: '障',
        title: `障害物${target.toLocaleString()}個破壊`,
        desc: '木箱・看板・岩・宝箱などの累計破壊数',
        currentType: 'obstacleKills',
        target,
        reward: {
          coin: scaleCoin(target, 120),
          diamond: scaleDiamond(target, 1)
        }
      });
    });

    COUNT_TARGETS_MID.forEach(target => {
      missions.push({
        id: `midboss_${target}`,
        tab: 'destroy',
        icon: '中',
        title: `中ボス${target.toLocaleString()}体撃破`,
        desc: '中ボスの累計撃破数',
        currentType: 'midBossKills',
        target,
        reward: {
          coin: scaleCoin(target, 800),
          diamond: scaleDiamond(target * 10, 1)
        }
      });
    });

    COUNT_TARGETS_MID.forEach(target => {
      missions.push({
        id: `boss_${target}`,
        tab: 'destroy',
        icon: 'B',
        title: `ボス${target.toLocaleString()}体撃破`,
        desc: 'ボス・強力ボスの累計撃破数',
        currentType: 'bossKills',
        target,
        reward: {
          coin: scaleCoin(target, 1500),
          diamond: scaleDiamond(target * 20, 2)
        }
      });
    });

    return missions;
  }

  function makeBossFirstMissions(){
    const missions = [];

    NORMAL_BOSS_FIRST.forEach(item => {
      missions.push({
        id: `first_boss_${item.key}`,
        tab: 'destroy',
        icon: '初',
        title: `${item.key}初撃破`,
        desc: '通常ボス初撃破',
        currentType: 'firstBoss',
        bossKey: item.key,
        target: 1,
        reward: {
          coin: item.coin,
          diamond: item.diamond
        }
      });
    });

    STRONG_BOSS_FIRST.forEach(item => {
      missions.push({
        id: `first_strong_${item.key}`,
        tab: 'destroy',
        icon: '強',
        title: `${item.key}初撃破`,
        desc: '強力ボス・レジェンドボス初撃破',
        currentType: 'firstStrongBoss',
        bossKey: item.key,
        target: 1,
        reward: {
          coin: item.coin,
          diamond: item.diamond
        }
      });
    });

    return missions;
  }

  function makeGateMissions(){
    return GATE_TARGETS.map(target => ({
      id: `gate_${target}`,
      tab: 'gate',
      icon: '門',
      title: `ゲート${target.toLocaleString()}回獲得`,
      desc: '種類を問わず、ゲートを獲得した累計回数',
      currentType: 'gateCount',
      target,
      reward: {
        coin: scaleCoin(target, 100),
        diamond: 0
      }
    }));
  }

  function makeRankMissions(){
    return RANK_TARGETS.map(target => ({
      id: `rank_${target}`,
      tab: 'rank',
      icon: 'R',
      title: `Rank${target}到達`,
      desc: `Rank${target}に到達`,
      currentType: 'rank',
      target,
      reward: {
        coin: target * 5000,
        diamond: target >= 5 ? target : 0
      }
    }));
  }

  function makeCoinMissions(){
    return COIN_TARGETS.map(target => ({
      id: `coin_${target}`,
      tab: 'coin',
      icon: '￥',
      title: `累計${target.toLocaleString()}コイン獲得`,
      desc: '使ったコインではなく、獲得した累計コイン',
      currentType: 'totalEarnedCoin',
      target,
      reward: {
        coin: Math.max(500, Math.floor(target * 0.08)),
        diamond: 0
      }
    }));
  }

  function makeScoreMissions(){
    return SCORE_TARGETS.map(target => ({
      id: `score_${target}`,
      tab: 'coin',
      icon: 'S',
      title: `累計${target.toLocaleString()}スコア達成`,
      desc: '累計SCOREで達成',
      currentType: 'totalScore',
      target,
      reward: {
        coin: Math.max(500, Math.floor(target * 0.03)),
        diamond: target >= 1000000 ? Math.floor(Math.log10(target)) : 0
      }
    }));
  }

  function allMissions(){
    return [
      ...makeStageMissions(),
      ...makeDestroyMissions(),
      ...makeBossFirstMissions(),
      ...makeGateMissions(),
      ...makeRankMissions(),
      ...makeCoinMissions(),
      ...makeScoreMissions()
    ];
  }

  function currentValue(mission, save){
    const s = stats(save);

    if (mission.currentType === 'stageIndex') {
      return clearedStageIndex(save);
    }

    if (mission.currentType === 'rank') {
      return Number(save.rank || 1);
    }

    if (mission.currentType === 'totalScore') {
      return Number(save.totalScore || 0);
    }

    if (mission.currentType === 'firstBoss') {
      return s.firstBossKills && s.firstBossKills[mission.bossKey] ? 1 : 0;
    }

    if (mission.currentType === 'firstStrongBoss') {
      return s.firstStrongBossKills && s.firstStrongBossKills[mission.bossKey] ? 1 : 0;
    }

    return Number(s[mission.currentType] || 0);
  }

  function claimMission(id){
    const missionState = loadState();
    const save = getSave();
    const missions = allMissions();
    const mission = missions.find(m => m.id === id);

    if (!mission) return;

    if (missionState.claimed[id]) {
      alert('すでに受け取り済みです。');
      return;
    }

    const current = currentValue(mission, save);

    if (current < mission.target) {
      alert('まだ条件を達成していません。');
      return;
    }

    const reward = mission.reward || {};

    save.coin = Number(save.coin || 0) + Number(reward.coin || 0);
    save.diamond = Number(save.diamond || 0) + Number(reward.diamond || 0);

    missionState.claimed[id] = true;

    saveMainData(save);
    saveState(missionState);

    alert(`報酬を受け取りました！\n${rewardText(reward)}`);
    refreshAll();
  }

  function renderMissionCard(mission, missionState, save){
    const list = $('missionList');
    if (!list) return;

    const current = currentValue(mission, save);
    const complete = current >= mission.target;
    const claimed = !!missionState.claimed[mission.id];
    const rate = progressRate(current, mission.target);

    const card = document.createElement('div');

    card.className =
      'mission-card' +
      (complete ? ' complete' : '') +
      (claimed ? ' claimed' : '');

    card.innerHTML = `
      <div class="mission-card-icon">${mission.icon}</div>

      <div class="mission-card-body">
        <div class="mission-card-name">${mission.title}</div>
        <div class="mission-card-desc">${mission.desc}</div>
        <div class="mission-card-reward">報酬: ${rewardText(mission.reward)}</div>
        <div class="mission-card-progress">${progressText(current, mission.target)}</div>
        <div class="mission-progress-bar">
          <div class="mission-progress-fill" style="width:${rate}%"></div>
        </div>
      </div>

      <div class="mission-card-actions">
        <button type="button" class="mission-card-btn ${claimed ? 'claimed' : complete ? 'ready' : ''}" ${claimed || !complete ? 'disabled' : ''}>
          ${claimed ? '受取済' : complete ? '受け取る' : '未達成'}
        </button>
      </div>
    `;

    const btn = card.querySelector('.mission-card-btn');

    if (btn && complete && !claimed) {
      btn.addEventListener('click', function(){
        claimMission(mission.id);
      });
    }

    list.appendChild(card);
  }

  function render(){
    const list = $('missionList');
    if (!list) return;

    const missionState = loadState();
    const save = getSave();

    list.innerHTML = '';

    allMissions()
      .filter(mission => mission.tab === currentTab)
      .forEach(mission => {
        renderMissionCard(mission, missionState, save);
      });
  }

  function setTab(tab){
    currentTab = tab;

    const tabs = {
      stage: $('missionTabStage'),
      destroy: $('missionTabDestroy'),
      gate: $('missionTabGate'),
      rank: $('missionTabRank'),
      coin: $('missionTabCoin')
    };

    Object.keys(tabs).forEach(key => {
      if (tabs[key]) {
        tabs[key].classList.toggle('active', key === tab);
      }
    });

    render();
  }

  function open(){
    const modal = $('missionModal');

    if (!modal) return;

    setTab(currentTab || 'stage');
    modal.classList.remove('hidden');
  }

  function close(){
    const modal = $('missionModal');

    if (!modal) return;

    modal.classList.add('hidden');
  }

  function bind(){
    const openBtn = $('openMissionBtn');

    if (openBtn && !openBtn.__mobMissionBound) {
      openBtn.__mobMissionBound = true;

      openBtn.addEventListener('click', function(e){
        e.preventDefault();
        e.stopPropagation();
        open();
      }, { passive:false });

      openBtn.addEventListener('pointerup', function(e){
        e.preventDefault();
        e.stopPropagation();
        open();
      }, { passive:false });
    }

    const closeBtn = $('missionCloseBtn');

    if (closeBtn && !closeBtn.__mobMissionCloseBound) {
      closeBtn.__mobMissionCloseBound = true;

      closeBtn.addEventListener('click', function(e){
        e.preventDefault();
        e.stopPropagation();
        close();
      }, { passive:false });
    }

    const tabStage = $('missionTabStage');
    const tabDestroy = $('missionTabDestroy');
    const tabGate = $('missionTabGate');
    const tabRank = $('missionTabRank');
    const tabCoin = $('missionTabCoin');

    if (tabStage && !tabStage.__mobMissionTabBound) {
      tabStage.__mobMissionTabBound = true;
      tabStage.addEventListener('click', function(){ setTab('stage'); });
    }

    if (tabDestroy && !tabDestroy.__mobMissionTabBound) {
      tabDestroy.__mobMissionTabBound = true;
      tabDestroy.addEventListener('click', function(){ setTab('destroy'); });
    }

    if (tabGate && !tabGate.__mobMissionTabBound) {
      tabGate.__mobMissionTabBound = true;
      tabGate.addEventListener('click', function(){ setTab('gate'); });
    }

    if (tabRank && !tabRank.__mobMissionTabBound) {
      tabRank.__mobMissionTabBound = true;
      tabRank.addEventListener('click', function(){ setTab('rank'); });
    }

    if (tabCoin && !tabCoin.__mobMissionTabBound) {
      tabCoin.__mobMissionTabBound = true;
      tabCoin.addEventListener('click', function(){ setTab('coin'); });
    }

    const modal = $('missionModal');

    if (modal && !modal.__mobMissionBgBound) {
      modal.__mobMissionBgBound = true;

      modal.addEventListener('click', function(e){
        if (e.target === modal) {
          close();
        }
      });
    }
  }

  function refreshAll(){
    if (window.MobShotMain && window.MobShotMain.refreshMainHud) {
      window.MobShotMain.refreshMainHud();
    }

    window.dispatchEvent(new CustomEvent('mobshot:saveUpdated'));

    render();
  }

  function addObstacleKill(count){
    if (window.MobShotStorage && window.MobShotStorage.addMissionStat) {
      window.MobShotStorage.addMissionStat('obstacleKills', Number(count || 1));
    }
  }

  function addEnemyKill(count){
    if (window.MobShotStorage && window.MobShotStorage.addMissionStat) {
      window.MobShotStorage.addMissionStat('enemyKills', Number(count || 1));
    }
  }

  function addMidBossKill(count){
    if (window.MobShotStorage && window.MobShotStorage.addMissionStat) {
      window.MobShotStorage.addMissionStat('midBossKills', Number(count || 1));
    }
  }

  function addBossKill(count){
    if (window.MobShotStorage && window.MobShotStorage.addMissionStat) {
      window.MobShotStorage.addMissionStat('bossKills', Number(count || 1));
    }
  }

  function addGateCount(count){
    if (window.MobShotStorage && window.MobShotStorage.addMissionStat) {
      window.MobShotStorage.addMissionStat('gateCount', Number(count || 1));
    }
  }

  function addEarnedCoin(amount){
    if (window.MobShotStorage && window.MobShotStorage.addMissionStat) {
      window.MobShotStorage.addMissionStat('totalEarnedCoin', Number(amount || 0));
    }
  }

  function recordStageClear(){
    return;
  }

  function onEntityKilled(entity, rewardCoin){
    if (!entity) return;

    if (entity.kind === 'gimmick' || entity.kind === 'chest') {
      addObstacleKill(1);
    }

    if (entity.kind === 'enemy') {
      addEnemyKill(1);
    }

    if (entity.kind === 'midBoss') {
      addEnemyKill(1);
      addMidBossKill(1);
    }

    if (entity.kind === 'boss') {
      addEnemyKill(1);
      addBossKill(1);

      if (
        window.MobShotStorage &&
        window.MobShotStorage.markBossFirstKill &&
        window.MobShotStorage.getCurrentStage
      ) {
        window.MobShotStorage.markBossFirstKill(
          window.MobShotStorage.getCurrentStage(),
          entity.name
        );
      }
    }

    if (rewardCoin) {
      addEarnedCoin(rewardCoin);
    }
  }

  function onGateTaken(){
    addGateCount(1);
  }

  function onStageClear(){
    return;
  }

  function init(){
    bind();
    render();
  }

  document.addEventListener('DOMContentLoaded', init);

  window.MobShotMission = {
    init,
    open,
    close,
    render,
    loadState,
    saveState,

    addObstacleKill,
    addEnemyKill,
    addMidBossKill,
    addBossKill,
    addGateCount,
    addEarnedCoin,

    recordStageClear,
    onEntityKilled,
    onGateTaken,
    onStageClear,

    allMissions
  };
})();
