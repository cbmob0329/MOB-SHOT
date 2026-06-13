'use strict';

(function(){
  const SKILL_SAVE_KEY = 'mobshot_skill_state_v1';
  const TEST_UNLOCK_ALL_SKILLS = true;
  const AUTO_SELL_COIN = 5000;

  const SKILL_MASTER = [
    { key:'rocket', name:'ロケットランチャー', image:'skill/rocket barrage.png', type:'rocket', bulletImage:'atk/rocket.png', baseCt:30, baseCost:1000, costStep:500, maxLevel:99, maxPlus:30, defaultOwned:true, defaultEquipped:true, desc:'大きなロケット弾を撃ち、着弾時に画面半分ほどの大爆発を起こす。' },
    { key:'energyRush', name:'エネルギーラッシュ', image:'skill/energyrush.png', type:'energyRush', bulletImage:'atk/enetama.png', baseCt:28, baseCost:1000, costStep:500, maxLevel:99, maxPlus:30, defaultOwned:false, defaultEquipped:false, desc:'中央・左上・右上へランダムにエネルギー弾を乱射する。' },
    { key:'twinMissile', name:'ツインミサイル', image:'skill/double missile.png', type:'twinMissile', bulletImage:'atk/tuibi.png', baseCt:23, baseCost:1000, costStep:500, maxLevel:99, maxPlus:30, defaultOwned:false, defaultEquipped:false, desc:'一番HPが高い敵・障害物・宝箱へ追尾ミサイルを放つ。' },
    { key:'shadowClone', name:'影分身', image:'skill/shadowclone.png', type:'shadowClone', bulletImage:'', baseCt:45, baseCost:1000, costStep:500, maxLevel:99, maxPlus:30, defaultOwned:false, defaultEquipped:false, desc:'自分の単色シルエット分身を出し、分身も攻撃する。' },
    { key:'thunderbolt', name:'サンダーボルト', image:'skill/thunderbolt.png', type:'thunderbolt', bulletImage:'atk/kaminari.png', baseCt:40, baseCost:1000, costStep:500, maxLevel:99, maxPlus:30, defaultOwned:false, defaultEquipped:false, desc:'一定時間ランダムに雷を落とす。' },
    { key:'arcaneBarrier', name:'アルカナバリア', image:'skill/arcane barrier.png', type:'arcaneBarrier', bulletImage:'', baseCt:50, baseCost:1000, costStep:500, maxLevel:99, maxPlus:30, defaultOwned:false, defaultEquipped:false, desc:'泡とメタルリングの回転バリアで一定時間無敵になる。' },
    { key:'darkPower', name:'闇の力', image:'skill/dark oblivion.png', type:'darkPower', bulletImage:'', baseCt:60, baseCost:3000, costStep:1500, maxLevel:99, maxPlus:30, defaultOwned:false, defaultEquipped:false, desc:'黒い残像膜をまとい、弾を巨大化し攻撃力を上げ、ボス攻撃を完全無効化する。' },

    { key:'blackHole', name:'ブラックホール', image:'skill/blackhole.png', type:'blackHole', bulletImage:'atk/blackhole.png', baseCt:45, baseCost:2000, costStep:800, maxLevel:99, maxPlus:30, defaultOwned:false, defaultEquipped:false, desc:'画面上部にブラックホールを出し、敵と障害物を吸引する。' },
    { key:'healingBreeze', name:'癒しの風', image:'skill/healingbreeze.png', type:'healingBreeze', bulletImage:'', baseCt:35, baseCost:1200, costStep:600, maxLevel:99, maxPlus:30, defaultOwned:false, defaultEquipped:false, desc:'プレイヤーのHPを回復する。' },
    { key:'rosePulse', name:'薔薇の鼓動', image:'skill/rosepulse.png', type:'rosePulse', bulletImage:'atk/atkriri.png', baseCt:50, baseCost:2500, costStep:900, maxLevel:99, maxPlus:30, defaultOwned:false, defaultEquipped:false, desc:'一定時間、様々な方向から大きい薔薇の弾を飛ばす。' },
    { key:'goldRush', name:'ゴールドラッシュ', image:'skill/goldrush.png', type:'goldRush', bulletImage:'', baseCt:60, baseCost:1800, costStep:700, maxLevel:99, maxPlus:30, defaultOwned:false, defaultEquipped:false, desc:'コインが降る演出後、一定時間獲得コインが増える。' },
    { key:'darkThunder', name:'ダークサンダー', image:'skill/darkthunder.png', type:'darkThunder', bulletImage:'atk/blackrai.png', baseCt:45, baseCost:2500, costStep:900, maxLevel:99, maxPlus:30, defaultOwned:false, defaultEquipped:false, desc:'5方向以上に闇の雷を放ち、当たった敵に持続ダメージを与える。' },
    { key:'timeMagic', name:'タイムマジック', image:'skill/timemagic.png', type:'timeMagic', bulletImage:'', baseCt:70, baseCost:3500, costStep:1200, maxLevel:99, maxPlus:30, defaultOwned:false, defaultEquipped:false, desc:'画面を白いモノクロにし、敵と敵弾を停止させる。' },
    { key:'lilithSisters', name:'リリス四姉妹', image:'skill/lili.png', type:'lilithSisters', bulletImage:'', baseCt:70, baseCost:4000, costStep:1500, maxLevel:99, maxPlus:30, defaultOwned:false, defaultEquipped:false, desc:'リリス四姉妹を召喚し、一定時間味方として戦わせる。' }
  ];

  const ATTACK_CT_TYPES = ['rocket','energyRush','twinMissile','thunderbolt','darkThunder','rosePulse'];

  function defaultState(){
    const skills = {};

    SKILL_MASTER.forEach(skill => {
      skills[skill.key] = {
        owned: TEST_UNLOCK_ALL_SKILLS ? true : !!skill.defaultOwned,
        level: 1,
        plus: 0
      };
    });

    return {
      equipped: TEST_UNLOCK_ALL_SKILLS ? ['rocket','energyRush','twinMissile'] : ['rocket'],
      skills
    };
  }

  function loadState(){
    let state = defaultState();

    try {
      const raw = localStorage.getItem(SKILL_SAVE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        state = Object.assign(state, parsed || {});
        state.skills = Object.assign(defaultState().skills, parsed.skills || {});
      }
    } catch(e) {}

    if (TEST_UNLOCK_ALL_SKILLS) {
      SKILL_MASTER.forEach(skill => {
        if (!state.skills[skill.key]) {
          state.skills[skill.key] = { owned:true, level:1, plus:0 };
        }
        state.skills[skill.key].owned = true;
      });

      if (!Array.isArray(state.equipped) || !state.equipped.length) {
        state.equipped = ['rocket','energyRush','twinMissile'];
      }
    }

    state.equipped = Array.isArray(state.equipped) ? state.equipped.slice(0, 3) : ['rocket'];

    state.equipped = state.equipped.filter((key, index, arr) => {
      const skill = getSkill(key);
      return skill && arr.indexOf(key) === index && state.skills[key] && state.skills[key].owned;
    });

    if (!state.equipped.length && state.skills.rocket && state.skills.rocket.owned) {
      state.equipped = ['rocket'];
    }

    SKILL_MASTER.forEach(skill => {
      if (!state.skills[skill.key]) {
        state.skills[skill.key] = { owned: TEST_UNLOCK_ALL_SKILLS || !!skill.defaultOwned, level:1, plus:0 };
      }

      const item = state.skills[skill.key];
      item.level = Math.max(1, Math.min(skill.maxLevel, Number(item.level || 1)));
      item.plus = Math.max(0, Math.min(skill.maxPlus, Number(item.plus || 0)));
      item.owned = !!item.owned;
    });

    return state;
  }

  function saveState(state){
    try { localStorage.setItem(SKILL_SAVE_KEY, JSON.stringify(state)); } catch(e) {}
  }

  function getSkill(key){
    return SKILL_MASTER.find(skill => skill.key === key) || null;
  }

  function getSave(){
    if (window.MobShotStorage && window.MobShotStorage.load) {
      return window.MobShotStorage.load();
    }

    return { coin:0, diamond:0, rank:1, totalScore:0, bestScore:0 };
  }

  function saveMainData(save){
    if (window.MobShotStorage && window.MobShotStorage.save) {
      window.MobShotStorage.save(save);
      return;
    }

    try { localStorage.setItem('mobshot_split_v1', JSON.stringify(save)); } catch(e) {}
  }

  function refreshAll(){
    if (window.MobShotMain && window.MobShotMain.refreshMainHud) {
      window.MobShotMain.refreshMainHud();
    }

    if (window.MobShotEquip && window.MobShotEquip.render) {
      window.MobShotEquip.render();
    }

    window.dispatchEvent(new CustomEvent('mobshot:saveUpdated'));
  }

  function upgradeCost(key){
    const skill = getSkill(key);
    const state = loadState();
    const item = state.skills[key];

    if (!skill || !item) return 999999999;

    const level = Math.max(1, Number(item.level || 1));
    return skill.baseCost + ((level - 1) * skill.costStep);
  }

  function getCooldown(skill, item){
    let ct = Number(skill.baseCt || 30);
    const level = Number(item.level || 1);
    const plus = Number(item.plus || 0);

    if (ATTACK_CT_TYPES.includes(skill.type)) {
      ct -= Math.floor(level / 10);
    }

    if (skill.type === 'shadowClone' || skill.type === 'arcaneBarrier' || skill.type === 'darkPower') {
      ct -= Math.floor(plus / 5);
    }

    return Math.max(5, ct);
  }

  function levelBonus(item){
    return 1 + ((Number(item.level || 1) - 1) * 0.10);
  }

  function getPowerRate(skill, item){
    const lv = Number(item.level || 1);
    const bonus = levelBonus(item);

    if (skill.type === 'rocket') return { bullet: 5.0 * bonus, explosion: 3.0 * bonus };
    if (skill.type === 'energyRush') return { bullet: 1.0 * bonus };
    if (skill.type === 'twinMissile') return { bullet: 3.0 * bonus };
    if (skill.type === 'thunderbolt') return { thunder: 1.0 * bonus };
    if (skill.type === 'rosePulse') return { rose: (lv >= 99 ? 7.0 : 5.0) * bonus };
    if (skill.type === 'darkThunder') return { darkThunder: (lv >= 99 ? 5.0 : 3.0) * bonus, dot: (lv >= 99 ? 1.0 : lv >= 50 ? 0.75 : 0.5) };
    if (skill.type === 'lilithSisters') return { sisters: 1 + ((lv - 1) * 0.02), red: lv >= 99 ? 2.0 : 1.01 };

    return {};
  }

  function getCount(skill, item){
    const level = Number(item.level || 1);

    if (skill.type === 'rocket') {
      if (level >= 99) return 5;
      if (level >= 50) return 3;
      if (level >= 30) return 2;
      return 1;
    }

    if (skill.type === 'energyRush') {
      if (level >= 99) return 50;
      if (level >= 50) return 30;
      if (level >= 30) return 20;
      return 10;
    }

    if (skill.type === 'twinMissile') {
      if (level >= 99) return 10;
      if (level >= 50) return 5;
      if (level >= 30) return 3;
      return 2;
    }

    if (skill.type === 'darkThunder') {
      if (level >= 99) return 11;
      if (level >= 50) return 9;
      if (level >= 30) return 7;
      return 5;
    }

    return 0;
  }

  function getDuration(skill, item){
    const level = Number(item.level || 1);
    const smooth = 5 + ((level - 1) * 0.05);

    if (skill.type === 'thunderbolt') {
      return Math.min(15, 5 + Math.floor(level / 10));
    }

    if (skill.type === 'shadowClone' || skill.type === 'arcaneBarrier') {
      return smooth;
    }

    if (skill.type === 'darkPower') {
      if (level >= 99) return 12;
      if (level >= 50) return 9;
      if (level >= 30) return 7;
      return smooth;
    }

    if (skill.type === 'blackHole') {
      if (level >= 99) return 6;
      if (level >= 50) return 5;
      if (level >= 30) return 4;
      return 3;
    }

    if (skill.type === 'rosePulse') {
      if (level >= 99) return 10;
      if (level >= 50) return 8;
      if (level >= 30) return 6;
      return 5;
    }

    if (skill.type === 'goldRush') {
      if (level >= 99) return 30;
      if (level >= 50) return 20;
      if (level >= 30) return 15;
      return 10;
    }

    if (skill.type === 'timeMagic') {
      return Math.min(6, 3 + ((level - 1) * 0.03));
    }

    if (skill.type === 'lilithSisters') {
      if (level >= 99) return 12;
      if (level >= 50) return 9;
      if (level >= 30) return 7;
      return 5;
    }

    return 0;
  }

  function getWideBonus(skill, item){
    const level = Number(item.level || 1);
    if (skill.type !== 'shadowClone') return 0;
    if (level >= 99) return 10;
    if (level >= 50) return 6;
    if (level >= 30) return 4;
    return 3;
  }

  function getClonePowerRate(skill, item){
    const level = Number(item.level || 1);
    if (skill.type !== 'shadowClone') return 0;
    if (level >= 99) return 1.0;
    return 0.5 + ((level - 1) * 0.02);
  }

  function getCloneCount(skill, item){
    const level = Number(item.level || 1);
    if (skill.type !== 'shadowClone') return 0;
    return level >= 99 ? 3 : 2;
  }

  function getBarrierDamage(skill, item){
    const level = Number(item.level || 1);
    if (skill.type !== 'arcaneBarrier') return 0;
    if (level >= 99) return 30;
    if (level >= 50) return 15;
    if (level >= 30) return 10;
    return 0;
  }

  function getDarkPowerRate(skill, item){
    const level = Number(item.level || 1);
    if (skill.type !== 'darkPower') return 0;
    if (level >= 99) return 1.0;
    if (level >= 50) return 0.8;
    if (level >= 30) return 0.6;
    return 0.5;
  }

  function getDarkPowerAttackAdd(skill, item){
    const level = Number(item.level || 1);
    if (skill.type !== 'darkPower') return 0;
    if (level >= 99) return 20;
    if (level >= 50) return 15;
    if (level >= 30) return 10;
    return 5 + ((level - 1) * 0.2);
  }

  function getHealAmount(skill, item){
    const level = Number(item.level || 1);
    if (skill.type !== 'healingBreeze') return 0;
    return 100 + ((level - 1) * 5);
  }

  function getCoinMultiplier(skill, item){
    const level = Number(item.level || 1);
    if (skill.type !== 'goldRush') return 1;
    return Math.min(2.5, 1.5 + ((level - 1) * 0.01));
  }

  function getBlackHoleRange(skill, item){
    const level = Number(item.level || 1);
    if (skill.type !== 'blackHole') return 0;
    const base = Math.min(window.innerWidth || 390, window.innerHeight || 780) * 0.65;
    return base * (1 + ((level - 1) * 0.005));
  }

  function getBlackHolePower(skill, item){
    const level = Number(item.level || 1);
    if (skill.type !== 'blackHole') return 0;
    return 0.065 + ((level - 1) * 0.0007);
  }

  function getWhiteHeal(skill, item){
    const level = Number(item.level || 1);
    if (skill.type !== 'lilithSisters') return 0;
    return 5 + ((level - 1) * 0.1);
  }

  function getSkillRuntimeData(key){
    const state = loadState();
    const skill = getSkill(key);
    const item = state.skills[key];

    if (!skill || !item || !item.owned) return null;

    return Object.assign({}, skill, {
      level: Number(item.level || 1),
      plus: Number(item.plus || 0),
      cooldown: getCooldown(skill, item),
      count: getCount(skill, item),
      duration: getDuration(skill, item),
      wideBonus: getWideBonus(skill, item),
      clonePowerRate: getClonePowerRate(skill, item),
      cloneCount: getCloneCount(skill, item),
      barrierDamage: getBarrierDamage(skill, item),
      darkPowerRate: getDarkPowerRate(skill, item),
      darkPowerAttackAdd: getDarkPowerAttackAdd(skill, item),
      healAmount: getHealAmount(skill, item),
      coinMultiplier: getCoinMultiplier(skill, item),
      blackHoleRange: getBlackHoleRange(skill, item),
      blackHolePower: getBlackHolePower(skill, item),
      whiteHeal: getWhiteHeal(skill, item),
      powerRate: getPowerRate(skill, item)
    });
  }

  function getEquippedSkills(){
    const state = loadState();

    return state.equipped
      .map((key, index) => {
        const data = getSkillRuntimeData(key);
        if (!data) return null;
        data.slotIndex = index;
        return data;
      })
      .filter(Boolean);
  }

  function equipSkill(key){
    const state = loadState();
    const skill = getSkill(key);

    if (!skill || !state.skills[key] || !state.skills[key].owned) return;

    if (state.equipped.includes(key)) {
      state.equipped = state.equipped.filter(v => v !== key);
      if (!state.equipped.length && state.skills.rocket && state.skills.rocket.owned) state.equipped = ['rocket'];
      saveState(state);
      refreshAll();
      return;
    }

    if (state.equipped.length >= 3) {
      alert('装備できるスキルは最大3つです。先に外してください。');
      return;
    }

    state.equipped.push(key);
    saveState(state);
    refreshAll();
  }

  function upgradeSkill(key){
    const state = loadState();
    const skill = getSkill(key);

    if (!skill || !state.skills[key] || !state.skills[key].owned) {
      alert('先にスキルを入手してください。');
      return;
    }

    const item = state.skills[key];

    if (item.level >= skill.maxLevel) {
      alert('最大Lvです。');
      return;
    }

    const cost = upgradeCost(key);
    const save = getSave();

    if (Number(save.coin || 0) < cost) {
      alert(`COINが足りません。\n必要COIN: ${cost.toLocaleString()}`);
      return;
    }

    save.coin = Number(save.coin || 0) - cost;
    item.level += 1;

    saveMainData(save);
    saveState(state);
    refreshAll();
  }

  function acquireSkill(key){
    const state = loadState();
    const skill = getSkill(key);

    if (!skill) return;

    if (!state.skills[key]) state.skills[key] = { owned:false, level:1, plus:0 };

    const item = state.skills[key];

    if (!item.owned) {
      item.owned = true;
      item.level = 1;
      item.plus = 0;

      if (!state.equipped.length) state.equipped = [key];

      saveState(state);
      refreshAll();
      return { type:'new', coin:0 };
    }

    if (item.plus < skill.maxPlus) {
      item.plus += 1;
      saveState(state);
      refreshAll();
      return { type:'plus', coin:0, plus:item.plus };
    }

    const save = getSave();
    save.coin = Number(save.coin || 0) + AUTO_SELL_COIN;
    saveMainData(save);
    saveState(state);
    refreshAll();

    return { type:'sell', coin:AUTO_SELL_COIN };
  }

  function resetForTest(){
    const state = defaultState();
    saveState(state);
    refreshAll();
  }

  function init(){
    const state = loadState();
    saveState(state);
  }

  document.addEventListener('DOMContentLoaded', init);

  window.MobShotSkills = {
    SKILL_MASTER,
    TEST_UNLOCK_ALL_SKILLS,
    AUTO_SELL_COIN,
    loadState,
    saveState,
    getSkill,
    getEquippedSkills,
    getSkillRuntimeData,
    equipSkill,
    upgradeSkill,
    acquireSkill,
    upgradeCost,
    resetForTest,
    init
  };
})();
