'use strict';

(function(){
  const MISSION_SAVE_KEY = 'mobshot_mission_state_v4';

  let currentTab = 'stage';

  const EVENT_REWARD = {
    small: { coin:1000, diamond:4 },
    medium:{ coin:5000, diamond:8 },
    large:{ coin:20000, diamond:15 },
    huge:{ coin:80000, diamond:25 }
  };

  const COUNT_TARGETS_LONG = [
    1,3,5,10,15,20,25,30,40,50,75,
    100,150,200,300,400,500,750,
    1000,1500,2000,3000,4000,5000,7500,
    10000,15000,20000,30000,40000,50000,75000,
    100000,150000,200000,300000,400000,500000,750000,
    1000000,1500000,2000000
  ];

  const COUNT_TARGETS_MID = [
    1,2,3,5,7,10,15,20,25,30,40,50,75,
    100,150,200,300,400,500,750,1000,1500,2000
  ];

  const GATE_TARGETS = [
    1,3,5,10,15,20,25,30,50,75,100,150,200,300,500,750,
    1000,1500,2000,3000,5000,7500,10000
  ];

  const COIN_TARGETS = [
    100,300,500,1000,2000,3000,5000,7500,
    10000,20000,30000,50000,75000,
    100000,200000,300000,500000,750000,
    1000000,2000000,3000000,5000000,7500000,
    10000000,20000000,30000000,50000000,75000000,100000000
  ];

  const SCORE_TARGETS = [
    1000,3000,5000,10000,20000,30000,50000,75000,
    100000,200000,300000,500000,750000,
    1000000,2000000,3000000,5000000,7500000,
    10000000,20000000,30000000,50000000,75000000,
    100000000,150000000,200000000
  ];

  const STAGE_CLEAR_TARGETS = [
    1,2,3,5,7,10,12,15,18,20,25,30,35,40,45,50,
    55,60,65,70,75,80,85,90,95,100,105,110,115,120,126
  ];

  const COLLECTION_COUNT_TARGETS = [
    1,3,5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85
  ];

  const COLLECTION_PLUS_TARGETS = [
    1,3,5,10,20,30,50,75,100,150,200,300,500,750,
    1000,1500,2000,3000,4000,5000
  ];

  const SKILL_COUNT_TARGETS = [
    1,2,3,4,5,6,7,8,9,10,11,12,13,14
  ];

  const SKILL_PLUS_TARGETS = [
    1,3,5,10,20,30,50,75,100,150,200,300,400
  ];

  const SKILL_USE_TARGETS = [
    1,3,5,10,20,30,50,75,100,150,200,300,500,750,
    1000,1500,2000,3000,5000,7500,10000
  ];

  const RARITIES = ['R','SR','SSR','UR'];

  const AREA_REACH_REWARDS = [
    { id:'reach_1_3', stageId:'1-3', title:'草原突破', coin:10000, diamond:5 },
    { id:'reach_1_6', stageId:'1-6', title:'砂漠突破', coin:15000, diamond:7 },
    { id:'reach_1_9', stageId:'1-9', title:'田舎町突破', coin:20000, diamond:8 },
    { id:'reach_2_3', stageId:'2-3', title:'ネオン街突破', coin:30000, diamond:10 },
    { id:'reach_2_6', stageId:'2-6', title:'マグマ突破', coin:50000, diamond:12 },
    { id:'reach_2_9', stageId:'2-9', title:'魔王城突破', coin:80000, diamond:15 },
    { id:'reach_3_9', stageId:'3-9', title:'ハード前半突破', coin:120000, diamond:18 },
    { id:'reach_4_9', stageId:'4-9', title:'ハード完全突破', coin:180000, diamond:25 },
    { id:'reach_5_9', stageId:'5-9', title:'ベリーハード前半突破', coin:260000, diamond:30 },
    { id:'reach_6_9', stageId:'6-9', title:'ベリーハード完全突破', coin:360000, diamond:40 },
    { id:'reach_7_9', stageId:'7-9', title:'インフェルノ前半突破', coin:500000, diamond:50 },
    { id:'reach_8_9', stageId:'8-9', title:'インフェルノ完全突破', coin:750000, diamond:65 },
    { id:'reach_9_9', stageId:'9-9', title:'監獄突破', coin:1000000, diamond:75 },
    { id:'reach_10_9', stageId:'10-9', title:'マトリックス突破', coin:1300000, diamond:85 },
    { id:'reach_11_9', stageId:'11-9', title:'海の線路突破', coin:1600000, diamond:95 },
    { id:'reach_12_9', stageId:'12-9', title:'ネオン高速突破', coin:2000000, diamond:110 },
    { id:'reach_13_9', stageId:'13-9', title:'魔界突破', coin:2600000, diamond:130 },
    { id:'reach_14_9', stageId:'14-9', title:'魔王の間突破', coin:4000000, diamond:200 }
  ];

  const NORMAL_BOSS_FIRST = [
    { key:'ホークモブ', coin:3000, diamond:3 },
    { key:'ミラモブ', coin:3000, diamond:3 },
    { key:'番人', coin:4000, diamond:3 },
    { key:'ネオンモブ', coin:6000, diamond:4 },
    { key:'ドラゴンモブ', coin:8000, diamond:5 },
    { key:'モブリリス', coin:12000, diamond:8 }
  ];

  const STRONG_BOSS_FIRST = [
    { key:'ホークモブⅡ', coin:15000, diamond:10 },
    { key:'ミラモブⅡ', coin:15000, diamond:10 },
    { key:'番人Ⅱ', coin:20000, diamond:12 },
    { key:'ネオンモブⅡ', coin:30000, diamond:15 },
    { key:'ドラゴンモブⅡ', coin:50000, diamond:18 },
    { key:'モブ魔王', coin:100000, diamond:30 },
    { key:'モブメイル', coin:150000, diamond:35 },
    { key:'モブスミス', coin:200000, diamond:40 },
    { key:'モブネプ', coin:300000, diamond:45 },
    { key:'ブルネオモブ', coin:400000, diamond:55 },
    { key:'パルネオモブ', coin:500000, diamond:65 },
    { key:'閻魔モブ', coin:800000, diamond:85 },
    { key:'ウルモブリリス', coin:1500000, diamond:150 }
  ];

  function $(id){
    return document.getElementById(id);
  }

  function injectMissionRewardStyle(){
    if ($('mobMissionRewardStyle')) return;

    const style = document.createElement('style');
    style.id = 'mobMissionRewardStyle';
    style.textContent = `
      .mission-reward-pop{
        position:absolute;
        inset:0;
        z-index:170;
        display:flex;
        align-items:center;
        justify-content:center;
        padding:18px;
        background:rgba(0,0,0,.62);
      }

      .mission-reward-pop.hidden{
        display:none;
      }

      .mission-reward-card{
        width:min(90vw,420px);
        border-radius:26px;
        padding:18px;
        text-align:center;
        background:linear-gradient(180deg,rgba(35,28,78,.98),rgba(5,8,22,.98));
        border:3px solid rgba(255,255,255,.38);
        box-shadow:0 18px 48px rgba(0,0,0,.7);
        animation:missionRewardIn .22s ease-out both;
      }

      @keyframes missionRewardIn{
        from{transform:scale(.9) translateY(12px);opacity:0}
        to{transform:scale(1) translateY(0);opacity:1}
      }

      .mission-reward-title{
        font-size:26px;
        font-weight:1000;
        color:#ffe66b;
        text-shadow:0 3px 0 #000,0 0 14px rgba(255,230,107,.7);
        margin-bottom:8px;
      }

      .mission-reward-name{
        font-size:15px;
        font-weight:1000;
        color:#fff;
        line-height:1.4;
        margin-bottom:12px;
      }

      .mission-reward-list{
        display:grid;
        grid-template-columns:1fr;
        gap:8px;
        margin:0 0 14px;
      }

      .mission-reward-item{
        border-radius:16px;
        padding:10px 12px;
        background:rgba(255,255,255,.10);
        border:2px solid rgba(255,255,255,.20);
        color:#dfe8ff;
        font-weight:1000;
        font-size:16px;
      }

      .mission-reward-item.diamond{
        color:#9deeff;
        box-shadow:inset 0 0 12px rgba(107,230,255,.22);
      }

      .mission-reward-item.coin{
        color:#ffcf5b;
        box-shadow:inset 0 0 12px rgba(255,207,91,.22);
      }

      .mission-reward-ok{
        border:0;
        border-radius:999px;
        padding:12px 24px;
        font-size:16px;
        font-weight:1000;
        color:#181000;
        background:linear-gradient(#ffe66b,#ffb423);
        box-shadow:0 5px 0 rgba(0,0,0,.35);
      }

      .mission-toast{
        position:absolute;
        left:50%;
        top:22%;
        transform:translateX(-50%);
        z-index:180;
        max-width:86vw;
        min-width:220px;
        padding:12px 16px;
        border-radius:999px;
        background:linear-gradient(#ffffff,#b7c1d5);
        color:#102033;
        font-size:14px;
        font-weight:1000;
        text-align:center;
        box-shadow:0 6px 0 rgba(0,0,0,.35);
        pointer-events:none;
        opacity:0;
        transition:opacity .18s, transform .18s;
      }

      .mission-toast.show{
        opacity:1;
        transform:translateX(-50%) translateY(-5px);
      }
    `;

    document.head.appendChild(style);
  }

  function ensureRewardPop(){
    injectMissionRewardStyle();

    let pop = $('missionRewardPop');
    if (pop) return pop;

    pop = document.createElement('div');
    pop.id = 'missionRewardPop';
    pop.className = 'mission-reward-pop hidden';
    pop.innerHTML = `
      <div class="mission-reward-card">
        <div class="mission-reward-title">MISSION CLEAR!</div>
        <div id="missionRewardName" class="mission-reward-name"></div>
        <div id="missionRewardList" class="mission-reward-list"></div>
        <button id="missionRewardOkBtn" class="mission-reward-ok" type="button">OK</button>
      </div>
    `;

    ($('app') || document.body).appendChild(pop);

    $('missionRewardOkBtn').addEventListener('click', closeRewardPop);
    pop.addEventListener('click', function(e){
      if (e.target === pop) closeRewardPop();
    });

    return pop;
  }

  function showRewardPop(mission, reward){
    const pop = ensureRewardPop();
    const name = $('missionRewardName');
    const list = $('missionRewardList');

    if (name) {
      name.textContent = mission ? mission.title : '報酬を受け取りました';
    }

    const items = [];

    if (reward && Number(reward.diamond || 0) > 0) {
      items.push(`<div class="mission-reward-item diamond">◆ ${Number(reward.diamond).toLocaleString()} ダイヤ</div>`);
    }

    if (reward && Number(reward.coin || 0) > 0) {
      items.push(`<div class="mission-reward-item coin">● ${Number(reward.coin).toLocaleString()} コイン</div>`);
    }

    if (list) {
      list.innerHTML = items.join('') || '<div class="mission-reward-item">報酬なし</div>';
    }

    pop.classList.remove('hidden');
  }

  function closeRewardPop(){
    const pop = $('missionRewardPop');
    if (pop) pop.classList.add('hidden');
  }

  function showMissionToast(text){
    injectMissionRewardStyle();

    let toast = $('missionToast');

    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'missionToast';
      toast.className = 'mission-toast';
      ($('app') || document.body).appendChild(toast);
    }

    toast.textContent = text;
    toast.classList.add('show');

    clearTimeout(toast.__timer);
    toast.__timer = setTimeout(function(){
      toast.classList.remove('show');
    }, 1300);
  }

  function defaultState(){
    return { claimed:{} };
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
      coin:0,
      diamond:0,
      rank:1,
      totalScore:0,
      bestScore:0,
      stageProgress:{ highestStageIndex:-1, clearedStageIds:{} },
      missionStats:{}
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

  function getEventStats(){
    if (window.MobShotEvents && window.MobShotEvents.loadStats) {
      return window.MobShotEvents.loadStats();
    }

    return {
      goldClear:0,
      scoreAttackClear:0,
      doubleBossClear:0,
      eventCoinTotal:0,
      eventBossKills:0,
      goldTicketTotal:0,
      goldTicketSpent:0,
      bossKills:{},
      doubleClearByDifficulty:{ veryHard:0, inferno:0, legend:0 },
      doubleStageClear:{}
    };
  }

  function getGachaState(){
    if (window.MobShotGacha && window.MobShotGacha.loadState) {
      return window.MobShotGacha.loadState();
    }

    try {
      return JSON.parse(localStorage.getItem('mobshot_gacha_state_v1')) || { stones:{}, skills:{} };
    } catch(e) {
      return { stones:{}, skills:{} };
    }
  }

  function allStones(){
    if (window.MobShotGacha && window.MobShotGacha.allStones) {
      return window.MobShotGacha.allStones();
    }

    return [];
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

  function eventReward(size){
    return EVENT_REWARD[size] || EVENT_REWARD.small;
  }

  function eventRewardByTier(tier){
    const r = eventReward(tier);
    return { coin:r.coin, diamond:r.diamond };
  }

  function rewardText(reward){
    const parts = [];
    if (reward.diamond) parts.push(`${Number(reward.diamond).toLocaleString()}ダイヤ`);
    if (reward.coin) parts.push(`${Number(reward.coin).toLocaleString()}コイン`);
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
    if (target <= 10) return base;
    if (target <= 100) return base * 2;
    if (target <= 1000) return base * 4;
    if (target <= 10000) return base * 8;
    if (target <= 100000) return base * 18;
    return base * 45;
  }

  function scaleDiamond(target, base){
    if (target <= 10) return base;
    if (target <= 100) return base + 1;
    if (target <= 1000) return base + 2;
    if (target <= 10000) return base + 4;
    if (target <= 100000) return base + 8;
    return base + 15;
  }

  function makeStageMissions(){
    const missions = [];

    AREA_REACH_REWARDS.forEach(item => {
      const targetIndex = stageIndexById(item.stageId);

      missions.push({
        id:item.id,
        tab:'stage',
        icon:'到',
        title:item.title,
        desc:`${item.stageId}をクリア`,
        currentType:'stageIndex',
        target:targetIndex,
        reward:{ coin:item.coin, diamond:item.diamond }
      });
    });

    STAGE_CLEAR_TARGETS.forEach(target => {
      missions.push({
        id:`stageclear_${target}`,
        tab:'stage',
        icon:'ST',
        title:`累計${target}ステージクリア`,
        desc:'通常出撃でクリアした累計ステージ数',
        currentType:'totalStageClears',
        target,
        reward:{
          coin:target * 2500,
          diamond:target <= 10 ? target : Math.floor(target / 3)
        }
      });
    });

    return missions;
  }

  function makeDestroyMissions(){
    const missions = [];

    COUNT_TARGETS_LONG.forEach(target => {
      missions.push({
        id:`enemy_${target}`,
        tab:'destroy',
        icon:'敵',
        title:`敵${target.toLocaleString()}体撃破`,
        desc:'雑魚敵・中ボス・ボスを含む累計撃破数',
        currentType:'enemyKills',
        target,
        reward:{ coin:scaleCoin(target, 400), diamond:scaleDiamond(target, 1) }
      });
    });

    COUNT_TARGETS_LONG.forEach(target => {
      missions.push({
        id:`obstacle_${target}`,
        tab:'destroy',
        icon:'障',
        title:`障害物${target.toLocaleString()}個破壊`,
        desc:'木箱・看板・岩・宝箱などの累計破壊数',
        currentType:'obstacleKills',
        target,
        reward:{ coin:scaleCoin(target, 350), diamond:scaleDiamond(target, 1) }
      });
    });

    COUNT_TARGETS_MID.forEach(target => {
      missions.push({
        id:`midboss_${target}`,
        tab:'destroy',
        icon:'中',
        title:`中ボス${target.toLocaleString()}体撃破`,
        desc:'中ボスの累計撃破数',
        currentType:'midBossKills',
        target,
        reward:{ coin:scaleCoin(target, 2000), diamond:scaleDiamond(target * 20, 2) }
      });
    });

    COUNT_TARGETS_MID.forEach(target => {
      missions.push({
        id:`boss_${target}`,
        tab:'destroy',
        icon:'B',
        title:`ボス${target.toLocaleString()}体撃破`,
        desc:'ボス・強力ボスの累計撃破数',
        currentType:'bossKills',
        target,
        reward:{ coin:scaleCoin(target, 4000), diamond:scaleDiamond(target * 30, 3) }
      });
    });

    return missions;
  }

  function makeBossFirstMissions(){
    const missions = [];

    NORMAL_BOSS_FIRST.forEach(item => {
      missions.push({
        id:`first_boss_${item.key}`,
        tab:'destroy',
        icon:'初',
        title:`${item.key}初撃破`,
        desc:'通常ボス初撃破',
        currentType:'firstBoss',
        bossKey:item.key,
        target:1,
        reward:{ coin:item.coin, diamond:item.diamond }
      });
    });

    STRONG_BOSS_FIRST.forEach(item => {
      missions.push({
        id:`first_strong_${item.key}`,
        tab:'destroy',
        icon:'強',
        title:`${item.key}初撃破`,
        desc:'強力ボス・レジェンドボス初撃破',
        currentType:'firstStrongBoss',
        bossKey:item.key,
        target:1,
        reward:{ coin:item.coin, diamond:item.diamond }
      });
    });

    return missions;
  }

  function makeGateMissions(){
    return GATE_TARGETS.map(target => ({
      id:`gate_${target}`,
      tab:'gate',
      icon:'門',
      title:`ゲート${target.toLocaleString()}回獲得`,
      desc:'種類を問わず、ゲートを獲得した累計回数',
      currentType:'gateCount',
      target,
      reward:{ coin:scaleCoin(target, 500), diamond:scaleDiamond(target, 1) }
    }));
  }

  function makeRankMissions(){
    const missions = [];

    for (let rank = 2; rank <= 100; rank++) {
      const tier = rank >= 90 ? 'huge' : rank >= 60 ? 'large' : rank >= 25 ? 'medium' : 'small';
      const base = eventReward(tier);

      missions.push({
        id:`rank_${rank}`,
        tab:'rank',
        icon:'R',
        title:`Rank${rank}到達`,
        desc:`Rank${rank}に到達`,
        currentType:'rank',
        target:rank,
        reward:{
          coin:rank * 8000 + base.coin,
          diamond:Math.max(3, Math.floor(rank / 2)) + base.diamond
        }
      });
    }

    return missions;
  }

  function makeCoinMissions(){
    return COIN_TARGETS.map(target => ({
      id:`coin_${target}`,
      tab:'coin',
      icon:'￥',
      title:`累計${target.toLocaleString()}コイン獲得`,
      desc:'使ったコインではなく、獲得した累計コイン',
      currentType:'totalEarnedCoin',
      target,
      reward:{ coin:Math.max(1000, Math.floor(target * 0.15)), diamond:scaleDiamond(target, 1) }
    }));
  }

  function makeScoreMissions(){
    return SCORE_TARGETS.map(target => ({
      id:`score_${target}`,
      tab:'coin',
      icon:'S',
      title:`累計${target.toLocaleString()}スコア達成`,
      desc:'累計SCOREで達成',
      currentType:'totalScore',
      target,
      reward:{ coin:Math.max(1000, Math.floor(target * 0.06)), diamond:scaleDiamond(target, 2) }
    }));
  }

  function makeCollectionMissions(){
    const missions = [];

    COLLECTION_COUNT_TARGETS.forEach(target => {
      missions.push({
        id:`collection_owned_${target}`,
        tab:'collection',
        icon:'石',
        title:`石板${target}枚所持`,
        desc:'石板コレクションの所持枚数',
        currentType:'collectionOwned',
        target,
        reward:{ coin:target * 7000, diamond:0 }
      });
    });

    RARITIES.forEach(rarity => {
      const targets =
        rarity === 'R' ? [1,3,5,10,15,20,25,30] :
        rarity === 'SR' ? [1,3,5,10,15,20,25,30,35,40] :
        rarity === 'SSR' ? [1,3,5,10,15,20] :
        [1,2,3,5,7,8];

      targets.forEach(target => {
        missions.push({
          id:`collection_${rarity}_${target}`,
          tab:'collection',
          icon:rarity,
          title:`${rarity}石板${target}枚所持`,
          desc:`${rarity}石板の所持枚数`,
          currentType:'collectionRarityOwned',
          rarity,
          target,
          reward:{
            coin:target * (rarity === 'UR' ? 60000 : rarity === 'SSR' ? 30000 : rarity === 'SR' ? 15000 : 6000),
            diamond:0
          }
        });
      });
    });

    COLLECTION_PLUS_TARGETS.forEach(target => {
      missions.push({
        id:`collection_plus_${target}`,
        tab:'collection',
        icon:'+',
        title:`石板合計+${target}`,
        desc:'所持石板の強化値合計',
        currentType:'collectionTotalPlus',
        target,
        reward:{ coin:scaleCoin(target, 2000), diamond:0 }
      });
    });

    missions.push({
      id:'collection_complete_85',
      tab:'collection',
      icon:'完',
      title:'石板コンプリート',
      desc:'石板85枚をすべて所持',
      currentType:'collectionOwned',
      target:85,
      reward:{ coin:1000000, diamond:200 }
    });

    return missions;
  }

  function makeSkillMissions(){
    const missions = [];

    SKILL_COUNT_TARGETS.forEach(target => {
      missions.push({
        id:`skill_owned_${target}`,
        tab:'skill',
        icon:'技',
        title:`スキル${target}種所持`,
        desc:'所持しているスキルの種類数',
        currentType:'skillOwned',
        target,
        reward:{ coin:target * 25000, diamond:target * 1 }
      });
    });

    SKILL_PLUS_TARGETS.forEach(target => {
      missions.push({
        id:`skill_plus_${target}`,
        tab:'skill',
        icon:'+',
        title:`スキル合計+${target}`,
        desc:'スキルガチャで強化された合計+値',
        currentType:'skillTotalPlus',
        target,
        reward:{ coin:scaleCoin(target, 3000), diamond:scaleDiamond(target * 30, 4) }
      });
    });

    SKILL_USE_TARGETS.forEach(target => {
      missions.push({
        id:`skill_use_${target}`,
        tab:'skill',
        icon:'発',
        title:`スキル${target.toLocaleString()}回使用`,
        desc:'全スキルの累計使用回数',
        currentType:'skillUseCount',
        target,
        reward:{ coin:scaleCoin(target, 1200), diamond:scaleDiamond(target, 2) }
      });
    });

    return missions;
  }

  function makeEventMissions(){
    const missions = [];

    const goldRuns = [1,2,3,5,7,10,15,20,30,40,50,75,100,150,200,300,500];
    const doubleRuns = [1,2,3,5,7,10,15,20,30,50,75,100,150,200,300];
    const tickets = [1,3,5,10,20,30,50,75,100,150,200,300,500,750,1000,2000];
    const bossKills = [1,3,5,10,25,50,100,150,200,300,500,750,1000,1500,2000];
    const eventCoins = [
      1000,3000,5000,10000,30000,50000,100000,200000,300000,
      500000,750000,1000000,2000000,3000000,5000000,10000000,20000000
    ];

    goldRuns.forEach(n => {
      const tier = n >= 300 ? 'huge' : n >= 100 ? 'large' : n >= 20 ? 'medium' : 'small';
      missions.push({
        id:`event_gold_clear_${n}`,
        tab:'event',
        icon:'金',
        title:`GOLD STAGE ${n}回クリア`,
        desc:'GOLD STAGEの累計クリア回数',
        currentType:'eventGoldClear',
        target:n,
        reward:eventRewardByTier(tier)
      });
    });

    [
      { key:'easy', name:'イージー', tier:'small' },
      { key:'hard', name:'ハード', tier:'small' },
      { key:'veryHard', name:'ベリーハード', tier:'medium' },
      { key:'inferno', name:'インフェルノ', tier:'large' },
      { key:'legend', name:'レジェンド', tier:'huge' }
    ].forEach(item => {
      missions.push({
        id:`event_gold_first_${item.key}`,
        tab:'event',
        icon:'初',
        title:`GOLD STAGE ${item.name} 初クリア`,
        desc:`GOLD STAGE ${item.name}を初クリア`,
        currentType:'eventGoldFirst',
        difficulty:item.key,
        target:1,
        reward:eventRewardByTier(item.tier)
      });
    });

    doubleRuns.forEach(n => {
      const tier = n >= 150 ? 'huge' : n >= 50 ? 'large' : n >= 10 ? 'medium' : 'small';
      missions.push({
        id:`event_double_clear_${n}`,
        tab:'event',
        icon:'双',
        title:`ダブルボス ${n}回クリア`,
        desc:'ダブルボスの累計クリア回数',
        currentType:'eventDoubleClear',
        target:n,
        reward:eventRewardByTier(tier)
      });
    });

    const stageNames = {
      1:'草原',
      2:'砂漠',
      3:'ネオン街',
      4:'魔王城',
      5:'監獄',
      6:'海の線路',
      7:'魔王の間'
    };

    [
      { key:'veryHard', name:'ベリーハード', max:6 },
      { key:'inferno', name:'インフェルノ', max:6 },
      { key:'legend', name:'レジェンド', max:7 }
    ].forEach(diff => {
      for (let i = 1; i <= diff.max; i++) {
        const tier = i === 7 ? 'huge' : diff.key === 'legend' ? 'large' : diff.key === 'inferno' ? 'medium' : 'small';
        missions.push({
          id:`event_double_${diff.key}_${i}`,
          tab:'event',
          icon:'双',
          title:`ダブルボス ${diff.name} ${stageNames[i]}クリア`,
          desc:`${diff.name}の${stageNames[i]}をクリア`,
          currentType:'eventDoubleStage',
          difficulty:diff.key,
          stageId:i,
          target:1,
          reward:eventRewardByTier(tier)
        });
      }

      missions.push({
        id:`event_double_${diff.key}_all`,
        tab:'event',
        icon:'制',
        title:`ダブルボス ${diff.name} 全制覇`,
        desc:`${diff.name}の全ステージをクリア`,
        currentType:'eventDoubleAll',
        difficulty:diff.key,
        maxStage:diff.max,
        target:diff.max,
        reward:eventRewardByTier(diff.key === 'legend' ? 'huge' : 'large')
      });
    });

    tickets.forEach(n => {
      const tier = n >= 1000 ? 'huge' : n >= 300 ? 'large' : n >= 50 ? 'medium' : 'small';
      missions.push({
        id:`event_ticket_${n}`,
        tab:'event',
        icon:'券',
        title:`GOLD TICKET 累計${n}枚入手`,
        desc:'通常ステージの宝箱などから入手した累計枚数',
        currentType:'eventTicketTotal',
        target:n,
        reward:eventRewardByTier(tier)
      });
    });

    bossKills.forEach(n => {
      const tier = n >= 750 ? 'huge' : n >= 200 ? 'large' : n >= 50 ? 'medium' : 'small';
      missions.push({
        id:`event_boss_kill_${n}`,
        tab:'event',
        icon:'撃',
        title:`イベントボス累計${n}体撃破`,
        desc:'イベント中に撃破したボスの累計数',
        currentType:'eventBossKills',
        target:n,
        reward:eventRewardByTier(tier)
      });
    });

    eventCoins.forEach(n => {
      const tier = n >= 5000000 ? 'huge' : n >= 1000000 ? 'large' : n >= 100000 ? 'medium' : 'small';
      missions.push({
        id:`event_coin_${n}`,
        tab:'event',
        icon:'￥',
        title:`イベント累計${n.toLocaleString()}コイン獲得`,
        desc:'イベント報酬で獲得した累計コイン',
        currentType:'eventCoinTotal',
        target:n,
        reward:eventRewardByTier(tier)
      });
    });

    return missions;
  }

  function allMissions(){
    return [
      ...makeStageMissions(),
      ...makeDestroyMissions(),
      ...makeBossFirstMissions(),
      ...makeGateMissions(),
      ...makeRankMissions(),
      ...makeCoinMissions(),
      ...makeScoreMissions(),
      ...makeCollectionMissions(),
      ...makeSkillMissions(),
      ...makeEventMissions()
    ];
  }

  function collectionOwnedCount(){
    const gacha = getGachaState();
    let count = 0;

    allStones().forEach(stone => {
      const data = gacha.stones && gacha.stones[String(stone.no)];
      if (data && data.owned) count++;
    });

    return count;
  }

  function collectionRarityOwnedCount(rarity){
    const gacha = getGachaState();
    let count = 0;

    allStones().forEach(stone => {
      if (stone.rarity !== rarity) return;
      const data = gacha.stones && gacha.stones[String(stone.no)];
      if (data && data.owned) count++;
    });

    return count;
  }

  function collectionTotalPlus(){
    const gacha = getGachaState();
    let total = 0;

    Object.keys(gacha.stones || {}).forEach(key => {
      total += Number(gacha.stones[key].plus || 0);
    });

    return total;
  }

  function skillOwnedCount(){
    const gacha = getGachaState();
    const set = new Set();

    Object.keys(gacha.skills || {}).forEach(key => {
      if (gacha.skills[key] && gacha.skills[key].owned) set.add(key);
    });

    if (window.MobShotSkills && window.MobShotSkills.loadState) {
      const state = window.MobShotSkills.loadState();
      Object.keys(state.skills || {}).forEach(key => {
        if (state.skills[key] && state.skills[key].owned) set.add(key);
      });
    }

    return Math.min(set.size, 14);
  }

  function skillTotalPlus(){
    const gacha = getGachaState();
    let total = 0;

    Object.keys(gacha.skills || {}).forEach(key => {
      total += Number(gacha.skills[key].plus || 0);
    });

    return total;
  }

  function currentValue(mission, save){
    const s = stats(save);
    const ev = getEventStats();

    if (mission.currentType === 'stageIndex') return clearedStageIndex(save);
    if (mission.currentType === 'rank') return Number(save.rank || 1);
    if (mission.currentType === 'totalScore') return Number(save.totalScore || 0);
    if (mission.currentType === 'firstBoss') return s.firstBossKills && s.firstBossKills[mission.bossKey] ? 1 : 0;
    if (mission.currentType === 'firstStrongBoss') return s.firstStrongBossKills && s.firstStrongBossKills[mission.bossKey] ? 1 : 0;

    if (mission.currentType === 'collectionOwned') return collectionOwnedCount();
    if (mission.currentType === 'collectionRarityOwned') return collectionRarityOwnedCount(mission.rarity);
    if (mission.currentType === 'collectionTotalPlus') return collectionTotalPlus();

    if (mission.currentType === 'skillOwned') return skillOwnedCount();
    if (mission.currentType === 'skillTotalPlus') return skillTotalPlus();
    if (mission.currentType === 'skillUseCount') return Number(s.skillUseCount || 0);

    if (mission.currentType === 'eventGoldClear') return Number(ev.goldClear || 0);
    if (mission.currentType === 'eventDoubleClear') return Number(ev.doubleBossClear || 0);
    if (mission.currentType === 'eventTicketTotal') return Number(ev.goldTicketTotal || 0);
    if (mission.currentType === 'eventBossKills') return Number(ev.eventBossKills || 0);
    if (mission.currentType === 'eventCoinTotal') return Number(ev.eventCoinTotal || 0);

    if (mission.currentType === 'eventGoldFirst') {
      return window.MobShotEvents && window.MobShotEvents.hasGoldCleared && window.MobShotEvents.hasGoldCleared(mission.difficulty) ? 1 : 0;
    }

    if (mission.currentType === 'eventDoubleStage') {
      return window.MobShotEvents && window.MobShotEvents.hasDoubleCleared && window.MobShotEvents.hasDoubleCleared(mission.difficulty, mission.stageId) ? 1 : 0;
    }

    if (mission.currentType === 'eventDoubleAll') {
      let count = 0;

      for (let i = 1; i <= Number(mission.maxStage || 0); i++) {
        if (window.MobShotEvents && window.MobShotEvents.hasDoubleCleared && window.MobShotEvents.hasDoubleCleared(mission.difficulty, i)) {
          count++;
        }
      }

      return count;
    }

    return Number(s[mission.currentType] || 0);
  }

  function ensureExtraTabs(){
    const tabs = document.querySelector('.mission-tabs');
    if (!tabs) return;

    [
      { id:'missionTabCollection', text:'石板', tab:'collection' },
      { id:'missionTabSkill', text:'スキル', tab:'skill' },
      { id:'missionTabEvent', text:'イベント', tab:'event' }
    ].forEach(item => {
      if ($(item.id)) return;

      const btn = document.createElement('button');
      btn.id = item.id;
      btn.className = 'mission-tab';
      btn.type = 'button';
      btn.textContent = item.text;
      btn.addEventListener('click', function(){ setTab(item.tab); });

      tabs.appendChild(btn);
    });
  }

  function claimMission(id){
    const missionState = loadState();
    const save = getSave();
    const mission = allMissions().find(m => m.id === id);

    if (!mission) return;

    if (missionState.claimed[id]) {
      showMissionToast('すでに受け取り済みです');
      return;
    }

    const current = currentValue(mission, save);

    if (current < mission.target) {
      showMissionToast('まだ条件を達成していません');
      return;
    }

    const reward = mission.reward || {};

    save.coin = Number(save.coin || 0) + Number(reward.coin || 0);
    save.diamond = Number(save.diamond || 0) + Number(reward.diamond || 0);

    missionState.claimed[id] = true;

    saveMainData(save);
    saveState(missionState);

    showRewardPop(mission, reward);
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
    ensureExtraTabs();

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

    ensureExtraTabs();

    const tabs = {
      stage:$('missionTabStage'),
      destroy:$('missionTabDestroy'),
      gate:$('missionTabGate'),
      rank:$('missionTabRank'),
      coin:$('missionTabCoin'),
      collection:$('missionTabCollection'),
      skill:$('missionTabSkill'),
      event:$('missionTabEvent')
    };

    Object.keys(tabs).forEach(key => {
      if (tabs[key]) {
        tabs[key].classList.toggle('active', key === tab);
      }
    });

    const help = $('missionHelpText');

    if (help) {
      const count = allMissions().filter(m => m.tab === tab).length;
      help.textContent = `${count}個のミッションがあります。条件達成後に報酬を受け取れます。`;
    }

    render();
  }

  function open(){
    const modal = $('missionModal');
    if (!modal) return;

    ensureRewardPop();
    ensureExtraTabs();
    setTab(currentTab || 'stage');
    modal.classList.remove('hidden');
  }

  function close(){
    const modal = $('missionModal');
    if (!modal) return;
    modal.classList.add('hidden');
  }

  function bind(){
    ensureRewardPop();
    ensureExtraTabs();

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

    const tabMap = {
      missionTabStage:'stage',
      missionTabDestroy:'destroy',
      missionTabGate:'gate',
      missionTabRank:'rank',
      missionTabCoin:'coin',
      missionTabCollection:'collection',
      missionTabSkill:'skill',
      missionTabEvent:'event'
    };

    Object.keys(tabMap).forEach(id => {
      const btn = $(id);
      if (!btn || btn.__mobMissionTabBound) return;

      btn.__mobMissionTabBound = true;
      btn.addEventListener('click', function(){
        setTab(tabMap[id]);
      });
    });

    const modal = $('missionModal');

    if (modal && !modal.__mobMissionBgBound) {
      modal.__mobMissionBgBound = true;

      modal.addEventListener('click', function(e){
        if (e.target === modal) close();
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

  function addMissionStat(key, count){
    if (window.MobShotStorage && window.MobShotStorage.addMissionStat) {
      window.MobShotStorage.addMissionStat(key, Number(count || 1));
    }
  }

  function addObstacleKill(count){ addMissionStat('obstacleKills', count); }
  function addEnemyKill(count){ addMissionStat('enemyKills', count); }
  function addMidBossKill(count){ addMissionStat('midBossKills', count); }
  function addBossKill(count){ addMissionStat('bossKills', count); }
  function addGateCount(count){ addMissionStat('gateCount', count); }
  function addEarnedCoin(amount){ addMissionStat('totalEarnedCoin', amount); }
  function addSkillUse(count){ addMissionStat('skillUseCount', count); }

  function recordStageClear(){ return; }

  function onEntityKilled(entity, rewardCoin){
    if (!entity) return;

    if (entity.kind === 'gimmick' || entity.kind === 'chest') addObstacleKill(1);
    if (entity.kind === 'enemy') addEnemyKill(1);

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

    if (rewardCoin) addEarnedCoin(rewardCoin);
  }

  function onEventBossKilled(data){
    if (window.MobShotEvents && window.MobShotEvents.recordEventBossKill) {
      window.MobShotEvents.recordEventBossKill(data && data.bossName);
    }

    render();
  }

  function onGateTaken(){ addGateCount(1); }
  function onSkillUsed(){ addSkillUse(1); }
  function onStageClear(){ return; }

  function init(){
    bind();
    render();
  }

  document.addEventListener('DOMContentLoaded', init);
  window.addEventListener('mobshot:saveUpdated', render);
  window.addEventListener('mobshot:eventStatsUpdated', render);
  window.addEventListener('mobshot:gachaUpdated', render);

  window.MobShotMission = {
    init,
    open,
    close,
    render,
    refresh:render,
    loadState,
    saveState,

    addObstacleKill,
    addEnemyKill,
    addMidBossKill,
    addBossKill,
    addGateCount,
    addEarnedCoin,
    addSkillUse,

    recordStageClear,
    onEntityKilled,
    onEventBossKilled,
    onGateTaken,
    onSkillUsed,
    onStageClear,

    allMissions
  };
})();
