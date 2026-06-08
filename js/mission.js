'use strict';

(function(){
  const MISSION_SAVE_KEY = 'mobshot_mission_state_v1';

  let currentTab = 'stage';

  const STAGE_AREAS = [
    { key:'grass', name:'草原' },
    { key:'desert', name:'砂漠' },
    { key:'town', name:'田舎町' },
    { key:'neon', name:'ネオン街' },
    { key:'magma', name:'マグマ' },
    { key:'castle', name:'魔王城' }
  ];

  const STAGE_NORMAL_TARGETS = [10,20,30,40,50,60,70,80,90];

  const DESTROY_TARGETS = [
    { target:10, coin:100, diamond:0, rank:0 },
    { target:30, coin:500, diamond:0, rank:0 },
    { target:50, coin:500, diamond:0, rank:0 },
    { target:100, coin:1000, diamond:0, rank:0 },
    { target:300, coin:1000, diamond:0, rank:0 },
    { target:500, coin:1000, diamond:0, rank:0 },
    { target:1000, coin:3000, diamond:10, rank:0 }
  ];

  const GATE_TARGETS = [
    { target:10, coin:100, diamond:0, rank:0 },
    { target:30, coin:500, diamond:0, rank:0 },
    { target:50, coin:800, diamond:0, rank:0 },
    { target:100, coin:1000, diamond:0, rank:0 },
    { target:300, coin:1000, diamond:0, rank:0 },
    { target:500, coin:1000, diamond:0, rank:0 },
    { target:1000, coin:3000, diamond:0, rank:0 }
  ];

  const RANK_TARGETS = [
    { target:5, coin:0, diamond:5, rank:0 },
    { target:10, coin:0, diamond:10, rank:0 },
    { target:20, coin:0, diamond:20, rank:0 },
    { target:50, coin:0, diamond:50, rank:0 },
    { target:100, coin:0, diamond:100, rank:0 }
  ];

  const COIN_TARGETS = [
    { target:1000, coin:500, diamond:0, rank:0 },
    { target:5000, coin:1000, diamond:0, rank:0 },
    { target:10000, coin:0, diamond:5, rank:0 },
    { target:50000, coin:0, diamond:10, rank:0 },
    { target:100000, coin:0, diamond:20, rank:0 },
    { target:500000, coin:0, diamond:50, rank:0 }
  ];

  function $(id){
    return document.getElementById(id);
  }

  function defaultState(){
    const stageClear = {};

    STAGE_AREAS.forEach(area => {
      stageClear[area.key] = 0;
    });

    return {
      stageClear,
      obstacleKills: 0,
      enemyKills: 0,
      gateCount: 0,
      totalEarnedCoin: 0,
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
        state.stageClear = Object.assign(defaultState().stageClear, parsed.stageClear || {});
        state.claimed = Object.assign({}, parsed.claimed || {});
      }
    } catch(e) {}

    state.obstacleKills = Number(state.obstacleKills || 0);
    state.enemyKills = Number(state.enemyKills || 0);
    state.gateCount = Number(state.gateCount || 0);
    state.totalEarnedCoin = Number(state.totalEarnedCoin || 0);

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
      bestScore: 0
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

  function refreshAll(){
    if (window.MobShotMain && window.MobShotMain.refreshMainHud) {
      window.MobShotMain.refreshMainHud();
    }

    window.dispatchEvent(new CustomEvent('mobshot:saveUpdated'));

    render();
  }

  function calcRankFromScore(totalScore){
    if (window.MobShotStorage && window.MobShotStorage.calcRank) {
      return window.MobShotStorage.calcRank(totalScore || 0);
    }

    const table = [
      [1500000, 10], [800000, 9], [400000, 8], [200000, 7], [100000, 6],
      [50000, 5], [30000, 4], [12500, 3], [5000, 2]
    ];

    for (const [score, rank] of table) {
      if (totalScore >= score) return rank;
    }

    return 1;
  }

  function addRank(save, amount){
    const baseRank = Number(save.rank || calcRankFromScore(save.totalScore || 0) || 1);
    save.rank = Math.max(1, baseRank + amount);
  }

  function rewardText(reward){
    const parts = [];

    if (reward.rank) {
      parts.push(`RANK +${reward.rank}`);
    }

    if (reward.diamond) {
      parts.push(`${reward.diamond}ダイヤ`);
    }

    if (reward.coin) {
      parts.push(`${reward.coin.toLocaleString()}コイン`);
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

  function makeStageMissions(){
    const missions = [];

    STAGE_AREAS.forEach(area => {
      STAGE_NORMAL_TARGETS.forEach(target => {
        missions.push({
          id: `stage_${area.key}_${target}`,
          tab: 'stage',
          icon: 'ST',
          title: `${area.name}${target}クリア`,
          desc: `${area.name}ステージ${target}までクリア`,
          currentKey: area.key,
          currentType: 'stage',
          target,
          reward: {
            rank: 1,
            diamond: 5,
            coin: 5000
          }
        });
      });

      missions.push({
        id: `stage_${area.key}_99`,
        tab: 'stage',
        icon: '99',
        title: `${area.name}99クリア`,
        desc: `${area.name}ステージ99までクリア`,
        currentKey: area.key,
        currentType: 'stage',
        target: 99,
        reward: {
          rank: 5,
          diamond: 10,
          coin: 50000
        }
      });
    });

    return missions;
  }

  function makeDestroyMissions(){
    const missions = [];

    DESTROY_TARGETS.forEach(item => {
      missions.push({
        id: `obstacle_${item.target}`,
        tab: 'destroy',
        icon: '岩',
        title: `障害物${item.target}破壊`,
        desc: '木箱・看板・岩などの累計破壊数',
        currentType: 'obstacleKills',
        target: item.target,
        reward: {
          rank: item.rank,
          diamond: item.diamond,
          coin: item.coin
        }
      });
    });

    DESTROY_TARGETS.forEach(item => {
      missions.push({
        id: `enemy_${item.target}`,
        tab: 'destroy',
        icon: '敵',
        title: `敵${item.target}体撃破`,
        desc: '雑魚敵・中ボス・ボスを含む累計撃破数',
        currentType: 'enemyKills',
        target: item.target,
        reward: {
          rank: item.rank,
          diamond: item.diamond,
          coin: item.coin
        }
      });
    });

    return missions;
  }

  function makeGateMissions(){
    return GATE_TARGETS.map(item => ({
      id: `gate_${item.target}`,
      tab: 'gate',
      icon: '門',
      title: `ゲート${item.target}回獲得`,
      desc: '種類を問わず、ゲートを獲得した累計回数',
      currentType: 'gateCount',
      target: item.target,
      reward: {
        rank: item.rank,
        diamond: item.diamond,
        coin: item.coin
      }
    }));
  }

  function makeRankMissions(){
    return RANK_TARGETS.map(item => ({
      id: `rank_${item.target}`,
      tab: 'rank',
      icon: 'R',
      title: `Rank${item.target}到達`,
      desc: `Rank${item.target}に到達`,
      currentType: 'rank',
      target: item.target,
      reward: {
        rank: item.rank,
        diamond: item.diamond,
        coin: item.coin
      }
    }));
  }

  function makeCoinMissions(){
    return COIN_TARGETS.map(item => ({
      id: `coin_${item.target}`,
      tab: 'coin',
      icon: '￥',
      title: `累計${item.target.toLocaleString()}コイン獲得`,
      desc: '使ったコインではなく、獲得した累計コイン',
      currentType: 'totalEarnedCoin',
      target: item.target,
      reward: {
        rank: item.rank,
        diamond: item.diamond,
        coin: item.coin
      }
    }));
  }

  function allMissions(){
    return [
      ...makeStageMissions(),
      ...makeDestroyMissions(),
      ...makeGateMissions(),
      ...makeRankMissions(),
      ...makeCoinMissions()
    ];
  }

  function currentValue(mission, missionState, save){
    if (mission.currentType === 'stage') {
      return Number(missionState.stageClear[mission.currentKey] || 0);
    }

    if (mission.currentType === 'rank') {
      return Number(save.rank || 1);
    }

    return Number(missionState[mission.currentType] || 0);
  }

  function claimMission(id){
    const missions = allMissions();
    const mission = missions.find(m => m.id === id);

    if (!mission) return;

    const missionState = loadState();
    const save = getSave();

    if (missionState.claimed[id]) {
      alert('すでに受け取り済みです。');
      return;
    }

    const current = currentValue(mission, missionState, save);

    if (current < mission.target) {
      alert('まだ条件を達成していません。');
      return;
    }

    const reward = mission.reward || {};

    save.coin = Number(save.coin || 0) + Number(reward.coin || 0);
    save.diamond = Number(save.diamond || 0) + Number(reward.diamond || 0);

    if (reward.rank) {
      addRank(save, Number(reward.rank || 0));
    }

    missionState.claimed[id] = true;

    saveMainData(save);
    saveState(missionState);

    alert(`報酬を受け取りました！\n${rewardText(reward)}`);
    refreshAll();
  }

  function renderMissionCard(mission, missionState, save){
    const list = $('missionList');
    if (!list) return;

    const current = currentValue(mission, missionState, save);
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

  function init(){
    bind();
    render();
  }

  function addObstacleKill(count){
    const state = loadState();
    state.obstacleKills += Number(count || 1);
    saveState(state);
  }

  function addEnemyKill(count){
    const state = loadState();
    state.enemyKills += Number(count || 1);
    saveState(state);
  }

  function addGateCount(count){
    const state = loadState();
    state.gateCount += Number(count || 1);
    saveState(state);
  }

  function addEarnedCoin(amount){
    const state = loadState();
    state.totalEarnedCoin += Number(amount || 0);
    saveState(state);
  }

  function recordStageClear(areaKey, stageNo){
    const state = loadState();

    areaKey = areaKey || 'grass';
    stageNo = Math.max(1, Math.min(99, Number(stageNo || 0)));

    const current = Number(state.stageClear[areaKey] || 0);

    state.stageClear[areaKey] = Math.max(current, stageNo);

    saveState(state);
  }

  function onEntityKilled(entity, rewardCoin){
    if (!entity) return;

    if (entity.kind === 'gimmick' || entity.kind === 'chest') {
      addObstacleKill(1);
    }

    if (
      entity.kind === 'enemy' ||
      entity.kind === 'midBoss' ||
      entity.kind === 'boss'
    ) {
      addEnemyKill(1);
    }

    if (rewardCoin) {
      addEarnedCoin(rewardCoin);
    }
  }

  function onGateTaken(){
    addGateCount(1);
  }

  function onStageClear(areaKey, stageNo){
    recordStageClear(areaKey || 'grass', stageNo || 1);
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
    addGateCount,
    addEarnedCoin,
    recordStageClear,
    onEntityKilled,
    onGateTaken,
    onStageClear,
    allMissions
  };
})();
