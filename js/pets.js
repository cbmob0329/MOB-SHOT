'use strict';

(function(){
  const PET_SAVE_KEY = 'mobshot_pet_state_v4';
  const MAX_LEVEL = 50;
  const MAX_EQUIPPED_PETS = 4;

  const PET_MASTER = [
    {
      key:'mobdrago',
      name:'モブドラゴン',
      role:'万能型',
      unlock:'初期解放',
      unlockType:'initial',
      rank:1,
      price:5000,
      implemented:true,
      frontImage:'pet/pet1A.png',
      backImage:'pet/pet1B.png',
      atkImage:'',
      htmlBullet:'fire',
      skillName:'ドラゴフレイム',
      normalAttackRate:0.70,
      normalRateRate:0.50,
      normalBreakPower:150,
      skillBaseCount:5,
      skillPowerRate:0.95,
      skillObstacleRate:0.95,
      skillBossRate:0.95,
      skillBreakPower:150,
      skillCt:30,
      firstCt:10,
      skillWideAt:[30,50],
      normalWideAt:[10,20,40],
      growthText:'Lv毎: 通常+1% / スキル+1.3% / CT-0.1秒。Lv10通常ワイド+1、Lv20通常ワイド+1、Lv30スキルワイド+1、Lv40通常ワイド+1、Lv50スキルワイド+1'
    },
    {
      key:'mobfrog',
      name:'モブイルカエル',
      role:'障害物特化',
      unlock:'初期解放',
      unlockType:'initial',
      rank:1,
      price:5000,
      implemented:true,
      frontImage:'pet/pet2A.png',
      backImage:'pet/pet2B.png',
      atkImage:'',
      htmlBullet:'water',
      skillName:'アクアバースト',
      normalAttackRate:0.60,
      normalRateRate:0.40,
      normalBreakPower:250,
      skillBaseCount:3,
      skillPowerRate:1.70,
      skillObstacleRate:2.50,
      skillBossRate:1.70,
      skillBreakPower:250,
      skillCt:25,
      firstCt:5,
      skillWideAt:[50],
      normalWideAt:[10,20,40],
      growthText:'Lv毎: 通常+1% / スキル+1.3% / CT-0.1秒。Lv10通常ワイド+1、Lv20通常ワイド+1、Lv40通常ワイド+1、Lv50スキルワイド+1'
    },
    {
      key:'mobdenden',
      name:'モブデンデン',
      role:'雑魚殲滅',
      unlock:'初期解放',
      unlockType:'initial',
      rank:1,
      price:5000,
      implemented:true,
      frontImage:'pet/pet raitokage.png',
      backImage:'pet/pet raitokage2.png',
      atkImage:'',
      htmlBullet:'thunder',
      skillName:'サンダーストーム',
      normalAttackRate:0.50,
      normalRateRate:0.50,
      normalBreakPower:80,
      skillBaseCount:9,
      skillPowerRate:0.62,
      skillObstacleRate:0.62,
      skillBossRate:0.62,
      skillBreakPower:80,
      skillCt:35,
      firstCt:15,
      skillWideAt:[50],
      normalWideAt:[10,20,40],
      growthText:'Lv毎: 通常+1% / スキル+1.3% / CT-0.1秒。Lv10通常ワイド+1、Lv20通常ワイド+1、Lv40通常ワイド+1、Lv50スキルワイド+1'
    },
    {
      key:'mobwolf',
      name:'モブウルフ',
      role:'ボス特化',
      unlock:'初期解放',
      unlockType:'initial',
      rank:1,
      price:5000,
      implemented:true,
      frontImage:'pet/pet wolf.png',
      backImage:'pet/pet wolf2.png',
      atkImage:'',
      htmlBullet:'gray',
      skillName:'ウルフチェイス',
      normalAttackRate:0.80,
      normalRateRate:0.38,
      normalBreakPower:300,
      skillBaseCount:5,
      skillPowerRate:1.45,
      skillObstacleRate:1.45,
      skillBossRate:2.25,
      skillBreakPower:300,
      skillCt:30,
      firstCt:20,
      skillWideAt:[50],
      normalWideAt:[10,20,40],
      growthText:'Lv毎: 通常+1% / スキル+1.3% / CT-0.1秒。Lv10通常ワイド+1、Lv20通常ワイド+1、Lv40通常ワイド+1、Lv50スキルワイド+1'
    },
    {
      key:'mobslime',
      name:'モブスラっち',
      role:'回復支援',
      unlock:'草原クリア',
      unlockType:'grassClear',
      rank:1,
      price:10000,
      implemented:true,
      frontImage:'pet/petsr.png',
      backImage:'pet/petsr2.png',
      atkImage:'atk/miraatk.png',
      htmlBullet:'',
      skillName:'スライムヒール',
      normalAttackRate:0.40,
      normalRateRate:0.42,
      normalBreakPower:80,
      skillBaseCount:3,
      skillPowerRate:0.58,
      skillObstacleRate:0.58,
      skillBossRate:0.58,
      skillBreakPower:80,
      skillCt:42,
      firstCt:20,
      skillWideAt:[],
      normalWideAt:[15,30,45],
      healBase:15,
      healLv5:20,
      healLv30:45,
      healLv50:60,
      barrierAt:25,
      growthText:'Lv毎: 通常+1% / スキル+1.3% / CT-0.1秒。Lv1 HP15回復、Lv5 HP20回復、Lv15通常ワイド+1、Lv25小バリア、Lv30 HP45回復、Lv45通常ワイド+1、Lv50 HP60回復'
    },
    {
      key:'mobchibihawk',
      name:'モブチビホーク',
      role:'連射',
      unlock:'草原クリア',
      unlockType:'grassClear',
      rank:1,
      price:10000,
      implemented:true,
      frontImage:'pet/pethawk1.png',
      backImage:'pet/pethawk2.png',
      atkImage:'atk/hawkatk.png',
      htmlBullet:'',
      skillName:'ホークウィング',
      normalAttackRate:0.65,
      normalRateRate:0.65,
      normalBreakPower:600,
      skillBaseCount:1,
      skillPowerRate:3.00,
      skillObstacleRate:3.00,
      skillBossRate:3.00,
      skillBreakPower:600,
      skillCt:28,
      firstCt:8,
      skillWideAt:[50],
      normalWideAt:[10,20,40],
      growthText:'Lv毎: 通常+1% / スキル+1.3% / CT-0.1秒。Lv10通常ワイド+1、Lv20通常ワイド+1、Lv40通常ワイド+1、Lv50スキルワイド+1'
    },
    {
      key:'punimobpink',
      name:'ぷにモブピンク',
      role:'コイン特化',
      unlock:'Rank10',
      unlockType:'rank',
      rank:10,
      price:30000,
      implemented:true,
      frontImage:'pet/petpink.png',
      backImage:'pet/petpink2.png',
      atkImage:'atk/enetama.png',
      htmlBullet:'',
      skillName:'ラッキーバブル',
      normalAttackRate:0.55,
      normalRateRate:0.50,
      normalBreakPower:120,
      skillBaseCount:6,
      skillPowerRate:0.75,
      skillObstacleRate:0.75,
      skillBossRate:0.75,
      skillBreakPower:120,
      skillCt:40,
      firstCt:12,
      skillWideAt:[25,50],
      normalWideAt:[10,20,40],
      growthText:'Lv毎: 通常+1% / スキル+1.3% / CT-0.1秒。Lv10通常ワイド+1、Lv20通常ワイド+1、Lv25スキルワイド+1、Lv40通常ワイド+1、Lv50スキルワイド+1'
    },
    {
      key:'minimiramob',
      name:'ミニミラモブ',
      role:'分身型',
      unlock:'Rank10',
      unlockType:'rank',
      rank:10,
      price:30000,
      implemented:true,
      frontImage:'pet/petmira1.png',
      backImage:'pet/petmira2.png',
      atkImage:'atk/miraatk.png',
      htmlBullet:'',
      skillName:'ミラージュアタック',
      normalAttackRate:0.60,
      normalRateRate:0.52,
      normalBreakPower:150,
      skillBaseCount:6,
      skillPowerRate:1.00,
      skillObstacleRate:1.00,
      skillBossRate:1.00,
      skillBreakPower:150,
      skillCt:35,
      firstCt:12,
      skillWideAt:[50],
      normalWideAt:[10,20,40],
      growthText:'Lv毎: 通常+1% / スキル+1.3% / CT-0.1秒。Lv10通常ワイド+1、Lv20通常ワイド+1、Lv40通常ワイド+1、Lv50スキルワイド+1'
    },
    {
      key:'neonkidmob',
      name:'ネオンキッドモブ',
      role:'連射型',
      unlock:'Rank20',
      unlockType:'rank',
      rank:20,
      price:50000,
      implemented:true,
      frontImage:'pet/petneon1.png',
      backImage:'pet/petneon2.png',
      atkImage:'atk/neonring.png',
      htmlBullet:'',
      skillName:'ネオンボム',
      normalAttackRate:0.60,
      normalRateRate:0.70,
      normalBreakPower:200,
      skillBaseCount:3,
      skillPowerRate:1.30,
      skillObstacleRate:1.30,
      skillBossRate:1.30,
      skillBreakPower:200,
      skillCt:30,
      firstCt:10,
      skillWideAt:[50],
      normalWideAt:[10,20,40],
      growthText:'Lv毎: 通常+1% / スキル+1.3% / CT-0.1秒。Lv10通常ワイド+1、Lv20通常ワイド+1、Lv40通常ワイド+1、Lv50スキルワイド+1'
    },
    {
      key:'minidramob',
      name:'ミニドラモブ',
      role:'重砲型',
      unlock:'Rank20',
      unlockType:'rank',
      rank:20,
      price:50000,
      implemented:true,
      frontImage:'pet/petdragoon.png',
      backImage:'pet/petdragoon2.png',
      atkImage:'atk/hinotama.png',
      htmlBullet:'',
      skillName:'メガフレア',
      normalAttackRate:0.90,
      normalRateRate:0.38,
      normalBreakPower:1000,
      skillBaseCount:2,
      skillPowerRate:3.50,
      skillObstacleRate:3.50,
      skillBossRate:3.50,
      skillBreakPower:1000,
      skillCt:38,
      firstCt:18,
      skillWideAt:[50],
      normalWideAt:[10,20,40],
      growthText:'Lv毎: 通常+1% / スキル+1.3% / CT-0.1秒。Lv10通常ワイド+1、Lv20通常ワイド+1、Lv40通常ワイド+1、Lv50スキルワイド+1'
    },
    {
      key:'merurumob',
      name:'メルルモブ',
      role:'吸血',
      unlock:'ハード全クリア',
      unlockType:'hardClear',
      rank:1,
      price:100000,
      implemented:true,
      frontImage:'pet/petmeru.png',
      backImage:'pet/petmeru2.png',
      atkImage:'atk/atkriri.png',
      htmlBullet:'',
      skillName:'ブラッドローズ',
      normalAttackRate:0.75,
      normalRateRate:0.50,
      normalBreakPower:250,
      skillBaseCount:5,
      skillPowerRate:1.55,
      skillObstacleRate:1.55,
      skillBossRate:1.55,
      skillBreakPower:250,
      skillCt:36,
      firstCt:14,
      skillWideAt:[50],
      normalWideAt:[10,20,40],
      growthText:'Lv毎: 通常+1% / スキル+1.3% / CT-0.1秒。Lv10通常ワイド+1、Lv20通常ワイド+1、Lv40通常ワイド+1、Lv50スキルワイド+1'
    },
    {
      key:'lilmoblilith',
      name:'リルモブリリス',
      role:'弾幕',
      unlock:'ハード全クリア',
      unlockType:'hardClear',
      rank:1,
      price:100000,
      implemented:true,
      frontImage:'pet/petriris.png',
      backImage:'pet/petriris2.png',
      atkImage:'atk/atkriri.png',
      htmlBullet:'',
      skillName:'ローズテンペスト',
      normalAttackRate:0.70,
      normalRateRate:0.60,
      normalBreakPower:300,
      skillBaseCount:9,
      skillPowerRate:1.05,
      skillObstacleRate:1.05,
      skillBossRate:1.05,
      skillBreakPower:300,
      skillCt:42,
      firstCt:16,
      skillWideAt:[50],
      normalWideAt:[10,20,40],
      growthText:'Lv毎: 通常+1% / スキル+1.3% / CT-0.1秒。Lv10通常ワイド+1、Lv20通常ワイド+1、Lv40通常ワイド+1、Lv50スキルワイド+1'
    },
    {
      key:'chibimaohmob',
      name:'ちび魔王モブ',
      role:'超火力',
      unlock:'ハード全クリア',
      unlockType:'hardClear',
      rank:1,
      price:100000,
      implemented:true,
      frontImage:'pet/petmaoh.png',
      backImage:'pet/petmaoh2.png',
      atkImage:'atk/atkmaoh.png',
      htmlBullet:'',
      skillName:'デモンカノン',
      normalAttackRate:0.95,
      normalRateRate:0.38,
      normalBreakPower:800,
      skillBaseCount:1,
      skillPowerRate:4.80,
      skillObstacleRate:4.80,
      skillBossRate:4.80,
      skillBreakPower:800,
      skillCt:45,
      firstCt:20,
      skillWideAt:[50],
      normalWideAt:[10,20,40],
      growthText:'Lv毎: 通常+1% / スキル+1.3% / CT-0.1秒。Lv10通常ワイド+1、Lv20通常ワイド+1、Lv40通常ワイド+1、Lv50スキルワイド+1'
    },
    {
      key:'chibimobtetsu',
      name:'ちびモブテツ',
      role:'防御補助',
      unlock:'ベリーハード全クリア',
      unlockType:'veryHardClear',
      rank:1,
      price:100000,
      implemented:true,
      frontImage:'pet/pettetu.png',
      backImage:'pet/pettetu2.png',
      atkImage:'atk/atkmeiru.png',
      htmlBullet:'',
      skillName:'アイアンウォール',
      normalAttackRate:0.70,
      normalRateRate:0.45,
      normalBreakPower:400,
      skillBaseCount:1,
      skillPowerRate:0.75,
      skillObstacleRate:0.75,
      skillBossRate:0.75,
      skillBreakPower:400,
      skillCt:40,
      firstCt:15,
      skillWideAt:[50],
      normalWideAt:[10,20,40],
      growthText:'Lv毎: 通常+1% / スキル+1.3% / CT-0.1秒。Lv10通常ワイド+1、Lv20通常ワイド+1、Lv40通常ワイド+1、Lv50スキルワイド+1'
    },
    {
      key:'chibimobmelt',
      name:'ちびモブメルト',
      role:'障害物破壊',
      unlock:'ベリーハード全クリア',
      unlockType:'veryHardClear',
      rank:1,
      price:100000,
      implemented:true,
      frontImage:'pet/petmerut.png',
      backImage:'pet/petmerut2.png',
      atkImage:'atk/atkmeiru.png',
      htmlBullet:'',
      skillName:'メルトハンマー',
      normalAttackRate:0.85,
      normalRateRate:0.40,
      normalBreakPower:600,
      skillBaseCount:2,
      skillPowerRate:2.80,
      skillObstacleRate:4.20,
      skillBossRate:2.80,
      skillBreakPower:600,
      skillCt:38,
      firstCt:14,
      skillWideAt:[50],
      normalWideAt:[10,20,40],
      growthText:'Lv毎: 通常+1% / スキル+1.3% / CT-0.1秒。Lv10通常ワイド+1、Lv20通常ワイド+1、Lv40通常ワイド+1、Lv50スキルワイド+1'
    },
    {
      key:'wondamob',
      name:'ワンダモブ',
      role:'支援',
      unlock:'ベリーハード全クリア',
      unlockType:'veryHardClear',
      rank:1,
      price:100000,
      implemented:true,
      frontImage:'pet/petwon.png',
      backImage:'pet/petwon2.png',
      atkImage:'atk/book.png',
      htmlBullet:'',
      skillName:'bboy',
      normalAttackRate:0.65,
      normalRateRate:0.55,
      normalBreakPower:250,
      skillBaseCount:1,
      skillPowerRate:0.75,
      skillObstacleRate:0.75,
      skillBossRate:0.75,
      skillBreakPower:250,
      skillCt:50,
      firstCt:20,
      skillWideAt:[50],
      normalWideAt:[10,20,40],
      growthText:'Lv毎: 通常+1% / スキル+1.3% / CT-0.1秒。Lv10通常ワイド+1、Lv20通常ワイド+1、Lv40通常ワイド+1、Lv50スキルワイド+1'
    },
    {
      key:'lilmobnep',
      name:'リルモブネプ',
      role:'範囲殲滅',
      unlock:'インフェルノ全クリア',
      unlockType:'infernoClear',
      rank:1,
      price:100000,
      implemented:true,
      frontImage:'pet/petmobnep.png',
      backImage:'pet/petmobnep2.png',
      atkImage:'atk/atknep.png',
      htmlBullet:'',
      skillName:'ネプチューンウェーブ',
      normalAttackRate:0.88,
      normalRateRate:0.50,
      normalBreakPower:600,
      skillBaseCount:4,
      skillPowerRate:2.10,
      skillObstacleRate:2.10,
      skillBossRate:2.10,
      skillBreakPower:600,
      skillCt:42,
      firstCt:16,
      skillWideAt:[50],
      normalWideAt:[10,20,40],
      growthText:'Lv毎: 通常+1% / スキル+1.3% / CT-0.1秒。Lv10通常ワイド+1、Lv20通常ワイド+1、Lv40通常ワイド+1、Lv50スキルワイド+1'
    },
    {
      key:'chibiulmob',
      name:'ちびウルモブ',
      role:'最終弾幕',
      unlock:'インフェルノ全クリア',
      unlockType:'infernoClear',
      rank:1,
      price:100000,
      implemented:true,
      frontImage:'pet/petul1.png',
      backImage:'pet/petul2.png',
      atkImage:'atk/atkriri.png',
      htmlBullet:'',
      skillName:'ダークローズレイン',
      normalAttackRate:0.90,
      normalRateRate:0.60,
      normalBreakPower:800,
      skillBaseCount:9,
      skillPowerRate:1.55,
      skillObstacleRate:1.55,
      skillBossRate:1.55,
      skillBreakPower:800,
      skillCt:45,
      firstCt:18,
      skillWideAt:[50],
      normalWideAt:[10,20,40],
      growthText:'Lv毎: 通常+1% / スキル+1.3% / CT-0.1秒。Lv10通常ワイド+1、Lv20通常ワイド+1、Lv40通常ワイド+1、Lv50スキルワイド+1'
    },
    {
      key:'hero',
      name:'あのヒーロー',
      role:'最強万能',
      unlock:'インフェルノ全クリア',
      unlockType:'infernoClear',
      rank:1,
      price:100000,
      implemented:true,
      frontImage:'pet/pet hero.png',
      backImage:'pet/pet hero2.png',
      atkImage:'atk/book.png',
      htmlBullet:'',
      skillName:'ヒーローフィニッシュ',
      normalAttackRate:1.00,
      normalRateRate:0.50,
      normalBreakPower:3000,
      skillBaseCount:3,
      skillPowerRate:4.00,
      skillObstacleRate:4.00,
      skillBossRate:4.00,
      skillBreakPower:3000,
      skillCt:50,
      firstCt:20,
      skillWideAt:[50],
      normalWideAt:[10,20,40],
      growthText:'Lv毎: 通常+1% / スキル+1.3% / CT-0.1秒。Lv10通常ワイド+1、Lv20通常ワイド+1、Lv40通常ワイド+1、Lv50スキルワイド+1'
    }
  ];

  function defaultState(){
    const pets = {};

    PET_MASTER.forEach(pet => {
      pets[pet.key] = {
        owned:false,
        level:1
      };
    });

    return {
      equipped:[],
      pets
    };
  }

  function loadState(){
    let state = defaultState();

    try {
      const raw = localStorage.getItem(PET_SAVE_KEY);

      if (raw) {
        const parsed = JSON.parse(raw);
        state = Object.assign(state, parsed || {});
        state.pets = Object.assign(defaultState().pets, parsed.pets || {});
      }
    } catch(e) {}

    state.equipped = Array.isArray(state.equipped) ? state.equipped.slice(0, MAX_EQUIPPED_PETS) : [];

    state.equipped = state.equipped.filter((key, index, arr) => {
      const pet = getPet(key);

      return (
        arr.indexOf(key) === index &&
        pet &&
        pet.implemented &&
        state.pets[key] &&
        state.pets[key].owned
      );
    });

    PET_MASTER.forEach(pet => {
      if (!state.pets[pet.key]) {
        state.pets[pet.key] = {
          owned:false,
          level:1
        };
      }

      state.pets[pet.key].level = Math.max(
        1,
        Math.min(MAX_LEVEL, Number(state.pets[pet.key].level || 1))
      );

      state.pets[pet.key].owned = !!state.pets[pet.key].owned;
    });

    return state;
  }

  function saveState(state){
    state.equipped = Array.isArray(state.equipped) ? state.equipped.slice(0, MAX_EQUIPPED_PETS) : [];

    try {
      localStorage.setItem(PET_SAVE_KEY, JSON.stringify(state));
    } catch(e) {}
  }

  function getPet(key){
    return PET_MASTER.find(pet => pet.key === key) || null;
  }

  function getSave(){
    if (window.MobShotStorage && window.MobShotStorage.load) {
      return window.MobShotStorage.load();
    }

    return {
      coin:0,
      rank:1,
      score:0,
      diamond:0,
      stageProgress:{
        highestStageIndex:-1,
        clearedStageIds:{}
      }
    };
  }

  function saveMainData(save){
    if (window.MobShotStorage && window.MobShotStorage.save) {
      window.MobShotStorage.save(save);
      return true;
    }

    try {
      localStorage.setItem('mobshot_split_v1', JSON.stringify(save));
      return true;
    } catch(e) {
      return false;
    }
  }

  function refreshMainHud(){
    if (window.MobShotMain && window.MobShotMain.refreshMainHud) {
      window.MobShotMain.refreshMainHud();
    }

    window.dispatchEvent(new CustomEvent('mobshot:saveUpdated'));
  }

  function stageList(){
    if (window.MobShotStorage && window.MobShotStorage.STAGE_LIST) {
      return window.MobShotStorage.STAGE_LIST;
    }

    return [];
  }

  function clearedStageIndex(save){
    return Number(
      save.stageProgress && save.stageProgress.highestStageIndex != null
        ? save.stageProgress.highestStageIndex
        : -1
    );
  }

  function stageIndexById(id){
    const list = stageList();
    return list.findIndex(stage => stage.id === id);
  }

  function hasClearedStageId(save, id){
    if (save.stageProgress && save.stageProgress.clearedStageIds && save.stageProgress.clearedStageIds[id]) {
      return true;
    }

    const targetIndex = stageIndexById(id);

    if (targetIndex >= 0) {
      return clearedStageIndex(save) >= targetIndex;
    }

    return false;
  }

  function canUnlock(pet){
    if (!pet || !pet.implemented) return false;

    const save = getSave();
    const rank = Number(save.rank || 1);

    if (pet.unlockType === 'initial') return true;
    if (pet.unlockType === 'rank') return rank >= Number(pet.rank || 1);
    if (pet.unlockType === 'grassClear') return hasClearedStageId(save, '1-3');
    if (pet.unlockType === 'hardClear') return hasClearedStageId(save, '4-9');
    if (pet.unlockType === 'veryHardClear') return hasClearedStageId(save, '6-9');
    if (pet.unlockType === 'infernoClear') return hasClearedStageId(save, '8-9');
    if (pet.unlockType === 'legendClear') return hasClearedStageId(save, '14-9');

    return rank >= Number(pet.rank || 1);
  }

  function isOwned(key){
    const state = loadState();
    return !!(state.pets[key] && state.pets[key].owned);
  }

  function isEquipped(key){
    const state = loadState();
    return state.equipped.includes(key);
  }

  function getLevel(key){
    const state = loadState();
    return Math.max(1, Math.min(MAX_LEVEL, Number(state.pets[key]?.level || 1)));
  }

  function upgradeCost(level){
    const lv = Math.max(1, Number(level || 1));

    if (lv >= MAX_LEVEL) return 0;
    if (lv === 1) return 500;
    if (lv === 2) return 700;
    if (lv === 3) return 900;
    if (lv === 4) return 1200;
    if (lv < 10) return 1500 + ((lv - 5) * 500);
    if (lv < 20) return 4000 + ((lv - 10) * 1000);
    if (lv < 30) return 14000 + ((lv - 20) * 2000);
    if (lv < 40) return 34000 + ((lv - 30) * 3000);
    return 64000 + ((lv - 40) * 5000);
  }

  function normalLevelRate(level){
    return 1 + ((Math.max(1, Number(level || 1)) - 1) * 0.01);
  }

  function skillLevelRate(level){
    return 1 + ((Math.max(1, Number(level || 1)) - 1) * 0.013);
  }

  function skillCooldown(pet, level){
    return Math.max(5, Number(pet.skillCt || 30) - ((Math.max(1, Number(level || 1)) - 1) * 0.1));
  }

  function normalWideBonus(level, pet){
    const lv = Number(level || 1);
    const list = pet.normalWideAt || [];
    return list.filter(n => lv >= n).length;
  }

  function skillWideBonus(level, pet){
    const lv = Number(level || 1);
    const list = pet.skillWideAt || [];
    return list.filter(n => lv >= n).length;
  }

  function buyPet(key){
    const pet = getPet(key);
    if (!pet || !pet.implemented) return;

    if (!canUnlock(pet)) {
      alert(`${pet.unlock}で解放されます。`);
      return;
    }

    const state = loadState();

    if (state.pets[key]?.owned) {
      alert('すでに所持しています。');
      return;
    }

    const save = getSave();
    const coin = Number(save.coin || 0);

    if (coin < Number(pet.price || 0)) {
      alert(`COINが足りません。\n必要COIN: ${Number(pet.price || 0).toLocaleString()}`);
      return;
    }

    save.coin = coin - Number(pet.price || 0);
    saveMainData(save);

    state.pets[key] = {
      owned:true,
      level:1
    };

    saveState(state);
    refreshMainHud();
    renderAll();
  }

  function equipPet(key){
    const pet = getPet(key);
    if (!pet || !pet.implemented) return;

    const state = loadState();

    if (!state.pets[key]?.owned) {
      buyPet(key);
      return;
    }

    if (state.equipped.includes(key)) {
      state.equipped = state.equipped.filter(v => v !== key);
      saveState(state);
      renderAll();
      return;
    }

    if (state.equipped.length >= MAX_EQUIPPED_PETS) {
      alert(`装備できるペットは最大${MAX_EQUIPPED_PETS}体です。先に外してください。`);
      return;
    }

    state.equipped.push(key);
    saveState(state);
    renderAll();
  }

  function upgradePet(key){
    const pet = getPet(key);
    if (!pet || !pet.implemented) return;

    const state = loadState();

    if (!state.pets[key]?.owned) {
      alert('先に購入してください。');
      return;
    }

    const currentLevel = getLevel(key);

    if (currentLevel >= MAX_LEVEL) {
      alert('最大Lvです。');
      return;
    }

    const cost = upgradeCost(currentLevel);
    const save = getSave();
    const coin = Number(save.coin || 0);

    if (coin < cost) {
      alert(`COINが足りません。\n必要COIN: ${cost.toLocaleString()}`);
      return;
    }

    save.coin = coin - cost;
    saveMainData(save);

    state.pets[key].level = currentLevel + 1;

    saveState(state);
    refreshMainHud();
    renderAll();
  }

  function petImageHtml(pet, mode, locked){
    const isLocked = !!locked || !pet.implemented;
    const src = mode === 'back' ? pet.backImage : pet.frontImage;

    if (!src) {
      return `<span class="pet-img-fallback">?</span>`;
    }

    return `
      <img
        src="${src}?v=20260625_pet50"
        alt="${isLocked ? 'LOCK' : pet.name}"
        style="${isLocked ? 'filter:brightness(0) opacity(.75);' : ''}"
        onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"
      >
      <span class="pet-img-fallback">?</span>
    `;
  }

  function renderSlots(){
    const wrap = document.getElementById('petEquipSlots');
    if (!wrap) return;

    const state = loadState();
    wrap.innerHTML = '';

    for (let i = 0; i < MAX_EQUIPPED_PETS; i++) {
      const key = state.equipped[i];
      const pet = getPet(key);

      const slot = document.createElement('button');
      slot.type = 'button';
      slot.className = pet ? 'pet-slot' : 'pet-slot empty';

      if (pet) {
        slot.innerHTML = `
          <span class="pet-slot-num">${i + 1}</span>
          ${petImageHtml(pet, 'front', false)}
          <span class="pet-slot-name">${pet.name}</span>
        `;

        slot.addEventListener('click', function(){
          equipPet(pet.key);
        });
      } else {
        slot.innerHTML = `
          <span class="pet-slot-num">${i + 1}</span>
          <span class="pet-slot-name">EMPTY</span>
        `;
      }

      wrap.appendChild(slot);
    }
  }

  function renderFloatPets(){
    const layer = document.getElementById('mainPetFloatLayer');
    if (!layer) return;

    const state = loadState();
    layer.innerHTML = '';

    state.equipped.slice(0, MAX_EQUIPPED_PETS).forEach((key, index) => {
      const pet = getPet(key);
      if (!pet) return;

      const el = document.createElement('div');
      el.className = `main-float-pet pet-float-${index + 1}`;
      el.innerHTML = petImageHtml(pet, 'front', false);
      layer.appendChild(el);
    });
  }

  function renderOwnedList(){
    const list = document.getElementById('petOwnedList');
    if (!list) return;

    const state = loadState();
    list.innerHTML = '';

    PET_MASTER.forEach(pet => {
      const unlockOk = canUnlock(pet);
      const owned = !!state.pets[pet.key]?.owned;
      const equipped = state.equipped.includes(pet.key);
      const level = getLevel(pet.key);
      const nextCost = level >= MAX_LEVEL ? 0 : upgradeCost(level);
      const lockedView = !unlockOk || !pet.implemented;

      const card = document.createElement('div');
      card.className =
        'pet-card' +
        (equipped ? ' equipped' : '') +
        (lockedView ? ' locked rank-locked' : '');

      let mainButtonText = '購入';
      let mainButtonDisabled = false;

      if (!pet.implemented) {
        mainButtonText = '未実装';
        mainButtonDisabled = true;
      } else if (!unlockOk) {
        mainButtonText = 'LOCK';
        mainButtonDisabled = true;
      } else if (owned && equipped) {
        mainButtonText = '外す';
      } else if (owned) {
        mainButtonText = state.equipped.length >= MAX_EQUIPPED_PETS ? '満員' : '装備';
      }

      const displayName = lockedView ? '？？？' : pet.name;
      const displayRole = lockedView ? '未解放' : pet.role;
      const displayUnlock = pet.unlock || '初期解放';

      card.innerHTML = `
        <div class="pet-card-icon">${petImageHtml(pet, 'front', lockedView)}</div>

        <div class="pet-card-body">
          <div class="pet-card-name">
            ${displayName}
            <span>${lockedView ? '' : `Lv${level}/${MAX_LEVEL}`}</span>
          </div>

          <div class="pet-card-desc">${displayRole} / ${displayUnlock}</div>

          <div class="pet-card-price">
            ${lockedView ? `条件: ${displayUnlock}` : `購入 ${Number(pet.price || 0).toLocaleString()} COIN`}
          </div>

          <div class="pet-card-spec">
            ${lockedView ? 'LOCK' : `${owned ? '所持中' : '未所持'} ${equipped ? '/ 装備中' : ''}`}
          </div>

          <div class="pet-card-spec">
            ${lockedView ? '？？？' : `通常攻撃 ${Math.round(pet.normalAttackRate * normalLevelRate(level) * 100)}% / 連射 ${Math.round(pet.normalRateRate * 100)}% / 通常ワイド+${normalWideBonus(level, pet)}`}
          </div>

          <div class="pet-card-spec">
            ${lockedView ? '？？？' : `スキル: ${pet.skillName} / 威力倍率${Math.round(skillLevelRate(level) * 100)}% / CT${Math.round(skillCooldown(pet, level) * 10) / 10}秒 / 初回${pet.firstCt}秒 / スキルワイド+${skillWideBonus(level, pet)}`}
          </div>

          <div class="pet-card-spec">
            ${lockedView ? '解放後に性能表示' : pet.growthText}
          </div>
        </div>

        <div class="pet-card-actions">
          <button type="button" class="pet-card-btn ${equipped ? 'equipped' : ''}" ${mainButtonDisabled ? 'disabled' : ''}>
            ${mainButtonText}
          </button>

          <button type="button" class="pet-upgrade-btn" ${(!owned || level >= MAX_LEVEL || !pet.implemented || !unlockOk) ? 'disabled' : ''}>
            強化<br>${level >= MAX_LEVEL ? 'MAX' : nextCost.toLocaleString()}
          </button>
        </div>
      `;

      const mainBtn = card.querySelector('.pet-card-btn');
      const upgradeBtn = card.querySelector('.pet-upgrade-btn');

      if (mainBtn && !mainButtonDisabled) {
        mainBtn.addEventListener('click', function(){
          if (!owned) {
            buyPet(pet.key);
          } else {
            equipPet(pet.key);
          }
        });
      }

      if (upgradeBtn && owned && level < MAX_LEVEL && pet.implemented && unlockOk) {
        upgradeBtn.addEventListener('click', function(){
          upgradePet(pet.key);
        });
      }

      list.appendChild(card);
    });
  }

  function openModal(){
    const modal = document.getElementById('petEquipModal');
    if (!modal) return;

    renderAll();
    modal.classList.remove('hidden');
  }

  function closeModal(){
    const modal = document.getElementById('petEquipModal');
    if (!modal) return;

    modal.classList.add('hidden');
  }

  function bindButtons(){
    const openBtn = document.getElementById('openPetEquipBtn');

    if (openBtn && !openBtn.__mobPetBound) {
      openBtn.__mobPetBound = true;

      openBtn.addEventListener('click', function(e){
        e.preventDefault();
        e.stopPropagation();
        openModal();
      });

      openBtn.addEventListener('pointerup', function(e){
        e.preventDefault();
        e.stopPropagation();
        openModal();
      }, { passive:false });
    }

    const closeBtn = document.getElementById('petModalCloseBtn');

    if (closeBtn && !closeBtn.__mobPetBound) {
      closeBtn.__mobPetBound = true;

      closeBtn.addEventListener('click', function(e){
        e.preventDefault();
        e.stopPropagation();
        closeModal();
      });
    }

    const modal = document.getElementById('petEquipModal');

    if (modal && !modal.__mobPetBgBound) {
      modal.__mobPetBgBound = true;

      modal.addEventListener('click', function(e){
        if (e.target === modal) {
          closeModal();
        }
      });
    }
  }

  function renderAll(){
    renderSlots();
    renderFloatPets();
    renderOwnedList();
  }

  function init(){
    bindButtons();
    renderAll();
  }

  function getEquippedPets(){
    const state = loadState();

    return state.equipped
      .slice(0, MAX_EQUIPPED_PETS)
      .map((key, index) => {
        const pet = getPet(key);
        if (!pet || !pet.implemented) return null;

        const level = getLevel(key);

        return Object.assign({}, pet, {
          slotIndex:index,
          level,
          maxLevel:MAX_LEVEL,
          normalLevelRate:normalLevelRate(level),
          skillLevelRate:skillLevelRate(level),
          currentSkillCt:skillCooldown(pet, level),
          normalWideBonus:normalWideBonus(level, pet),
          skillWideBonus:skillWideBonus(level, pet)
        });
      })
      .filter(Boolean);
  }

  document.addEventListener('DOMContentLoaded', init);

  window.MobShotPets = {
    init,
    renderAll,
    openModal,
    closeModal,
    buyPet,
    equipPet,
    upgradePet,
    getEquippedPets,
    getPet,
    getLevel,
    upgradeCost,
    canUnlock,
    isOwned,
    isEquipped,
    PET_MASTER,
    MAX_LEVEL,
    MAX_EQUIPPED_PETS
  };
})();
