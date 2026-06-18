'use strict';

(function(){
  const SKILL_SAVE_KEY = 'mobshot_skill_state_v1';
  const TEST_UNLOCK_ALL_SKILLS = true;
  const AUTO_SELL_COIN = 5000;

  const SKILL_MASTER = [
    { key:'rocket', name:'ロケットランチャー', image:'skill/rocket barrage.png', type:'rocket', bulletImage:'atk/rocket.png', baseCt:24, baseCost:1000, costStep:500, maxLevel:99, maxPlus:30, defaultOwned:true, defaultEquipped:true, desc:'大きなロケット弾を撃ち、着弾時に広範囲爆発を起こす。Lvで弾数が増える。' },
    { key:'energyRush', name:'エネルギーラッシュ', image:'skill/energyrush.png', type:'energyRush', bulletImage:'atk/enetama.png', baseCt:26, baseCost:1000, costStep:500, maxLevel:99, maxPlus:30, defaultOwned:false, defaultEquipped:false, desc:'エネルギー弾をバラバラの角度へ乱射する。Lvで弾数と拡散性能が上がる。' },
    { key:'twinMissile', name:'ツインミサイル', image:'skill/double missile.png', type:'twinMissile', bulletImage:'atk/tuibi.png', baseCt:25, baseCost:1000, costStep:500, maxLevel:99, maxPlus:30, defaultOwned:false, defaultEquipped:false, desc:'一番HPが高い敵・障害物・宝箱へ大きな追尾ミサイルを放つ。Lv10で3発になる。' },
    { key:'shadowClone', name:'影分身', image:'skill/shadowclone.png', type:'shadowClone', bulletImage:'', baseCt:45, baseCost:1000, costStep:500, maxLevel:99, maxPlus:30, defaultOwned:false, defaultEquipped:false, desc:'自分の単色シルエット分身を出し、分身も攻撃する。WIDE補助もある。' },
    { key:'thunderbolt', name:'サンダーボルト', image:'skill/thunderbolt.png', type:'thunderbolt', bulletImage:'atk/kaminari.png', baseCt:38, baseCost:1000, costStep:500, maxLevel:99, maxPlus:30, defaultOwned:false, defaultEquipped:false, desc:'一定時間ランダムに雷を落とす。Lvで持続時間と落雷威力が上がる。' },
    { key:'arcaneBarrier', name:'アルカナバリア', image:'skill/arcane barrier.png', type:'arcaneBarrier', bulletImage:'', baseCt:55, baseCost:1000, costStep:500, maxLevel:99, maxPlus:30, defaultOwned:false, defaultEquipped:false, desc:'泡とメタルリングの回転バリアで一定時間無敵になる。Lvで接触ダメージも追加。' },
    { key:'darkPower', name:'闇の力', image:'skill/dark oblivion.png', type:'darkPower', bulletImage:'atk/hinotama.png', baseCt:60, baseCost:3000, costStep:1500, maxLevel:99, maxPlus:30, defaultOwned:false, defaultEquipped:false, desc:'黒い残像膜をまとい、弾を巨大化。さらに巨大な火の玉を1秒に1回放つ。' },

    { key:'blackHole', name:'ブラックホール', image:'skill/blackhole.png', type:'blackHole', bulletImage:'atk/blackhole.png', baseCt:48, baseCost:2000, costStep:800, maxLevel:99, maxPlus:30, defaultOwned:false, defaultEquipped:false, desc:'画面上部にブラックホールを出し、敵と障害物を吸引する。火力より拘束重視。' },
    { key:'healingBreeze', name:'癒しの風', image:'skill/healingbreeze.png', type:'healingBreeze', bulletImage:'', baseCt:40, baseCost:1200, costStep:600, maxLevel:99, maxPlus:30, defaultOwned:false, defaultEquipped:false, desc:'10秒間、2秒ごとにHPを回復する持続スキル。' },
    { key:'rosePulse', name:'薔薇の鼓動', image:'skill/rosepulse.png', type:'rosePulse', bulletImage:'atk/atkriri.png', baseCt:50, baseCost:2500, costStep:900, maxLevel:99, maxPlus:30, defaultOwned:false, defaultEquipped:false, desc:'一定時間、様々な方向から大きい薔薇の弾を飛ばす。火力は抑えめに再調整。' },
    { key:'goldRush', name:'ゴールドラッシュ', image:'skill/goldrush.png', type:'goldRush', bulletImage:'', baseCt:60, baseCost:1800, costStep:700, maxLevel:99, maxPlus:30, defaultOwned:false, defaultEquipped:false, desc:'コインが降る演出後、一定時間獲得コイン倍率が大きく上がる。' },
    { key:'darkThunder', name:'ダークサンダー', image:'skill/darkthunder.png', type:'darkThunder', bulletImage:'atk/blackrai.png', baseCt:42, baseCost:2500, costStep:900, maxLevel:99, maxPlus:30, defaultOwned:false, defaultEquipped:false, desc:'5方向以上に闇の雷を放ち、当たった敵に持続ダメージを与える。' },
    { key:'timeMagic', name:'タイムマジック', image:'skill/timemagic.png', type:'timeMagic', bulletImage:'', baseCt:70, baseCost:3500, costStep:1200, maxLevel:99, maxPlus:30, defaultOwned:false, defaultEquipped:false, desc:'画面を白いモノクロにし、敵と敵弾を停止させる。火力なしの安全スキル。' },
    { key:'lilithSisters', name:'リリス四姉妹', image:'skill/lili.png', type:'lilithSisters', bulletImage:'', baseCt:75, baseCost:4000, costStep:1500, maxLevel:99, maxPlus:30, defaultOwned:false, defaultEquipped:false, desc:'リリス四姉妹を召喚し、一定時間味方として戦わせる。' },

    { key:'neonBomb', name:'ネオンボム', image:'skill/neonbomb.png', type:'neonBomb', bulletImage:'atk/neonbomb.png', baseCt:42, baseCost:3000, costStep:1000, maxLevel:99, maxPlus:30, defaultOwned:false, defaultEquipped:false, desc:'巨大なネオンボムをゆっくり飛ばし、画面上部で停滞後に大爆発する。' },
    { key:'neptuneAttack', name:'ネプチューンアタック', image:'skill/nepatk.png', type:'neptuneAttack', bulletImage:'atk/atknep.png', baseCt:32, baseCost:2500, costStep:900, maxLevel:99, maxPlus:30, defaultOwned:false, defaultEquipped:false, desc:'貫通する大きなトライデントを5連発射する。弾速は遅め。' },
    { key:'miraPoison', name:'ミラポイズン', image:'skill/mira.png', type:'miraPoison', bulletImage:'atk/mira atk.png', baseCt:36, baseCost:2500, costStep:900, maxLevel:99, maxPlus:30, defaultOwned:false, defaultEquipped:false, desc:'毒の弾を5ワイドで発射し、当たった敵に強力な毒を付与する。' },
    { key:'bookHero', name:'読みかけの本', image:'skill/book.png', type:'bookHero', bulletImage:'pet/pet hero.png', baseCt:50, baseCost:3500, costStep:1200, maxLevel:99, maxPlus:30, defaultOwned:false, defaultEquipped:false, desc:'黄金に輝くヒーローを召喚し、5秒間敵へ高速突進する。' }
  ];

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

  function lv(item){
    return Math.max(1, Number(item.level || 1));
  }

  function plus(item){
    return Math.max(0, Number(item.plus || 0));
  }

  function clamp(v, min, max){
    return Math.max(min, Math.min(max, v));
  }

  function stepLevel(level, lv30, lv50, lv99, base){
    if (level >= 99) return lv99;
    if (level >= 50) return lv50;
    if (level >= 30) return lv30;
    return base;
  }

  function getCooldown(skill, item){
    const level = lv(item);
    const p = plus(item);
    let ct = Number(skill.baseCt || 30);

    if (skill.type === 'rocket') ct -= Math.floor(level / 20);
    if (skill.type === 'energyRush') ct -= Math.floor(level / 25);
    if (skill.type === 'twinMissile') ct -= Math.floor(level / 30);
    if (skill.type === 'thunderbolt') ct -= Math.floor(level / 25);
    if (skill.type === 'darkThunder') ct -= Math.floor(level / 30);

    if (skill.type === 'shadowClone') ct -= Math.floor(p / 10);
    if (skill.type === 'arcaneBarrier') ct -= Math.floor(p / 10);
    if (skill.type === 'darkPower') ct -= Math.floor(p / 10);

    if (skill.type === 'blackHole') ct -= Math.floor(level / 35);
    if (skill.type === 'healingBreeze') ct -= Math.floor(level / 40);
    if (skill.type === 'rosePulse') ct -= Math.floor(level / 50);
    if (skill.type === 'goldRush') ct -= Math.floor(level / 45);
    if (skill.type === 'timeMagic') ct -= Math.floor(level / 60);
    if (skill.type === 'lilithSisters') ct -= Math.floor(level / 60);

    if (skill.type === 'neonBomb') ct -= Math.floor(level / 45);
    if (skill.type === 'neptuneAttack') ct -= Math.floor(level / 40);
    if (skill.type === 'miraPoison') ct -= Math.floor(level / 45);
    if (skill.type === 'bookHero') ct -= Math.floor(level / 60);

    const minimums = {
      rocket:18,
      energyRush:21,
      twinMissile:21,
      shadowClone:40,
      thunderbolt:32,
      arcaneBarrier:50,
      darkPower:54,
      blackHole:43,
      healingBreeze:36,
      rosePulse:45,
      goldRush:55,
      darkThunder:37,
      timeMagic:66,
      lilithSisters:70,
      neonBomb:38,
      neptuneAttack:28,
      miraPoison:32,
      bookHero:46
    };

    return Math.max(minimums[skill.type] || 20, ct);
  }

  function getPowerRate(skill, item){
    const level = lv(item);

    if (skill.type === 'rocket') {
      return {
        bullet: 5.0 + ((level - 1) * 0.035),
        explosion: 2.5 + ((level - 1) * 0.025)
      };
    }

    if (skill.type === 'energyRush') {
      return {
        bullet: 0.8 + ((level - 1) * 0.006)
      };
    }

    if (skill.type === 'twinMissile') {
      return {
        bullet: 2.4 + ((level - 1) * 0.018),
        explosion: 0.8 + ((level - 1) * 0.006)
      };
    }

    if (skill.type === 'thunderbolt') {
      return {
        thunder: 1.2 + ((level - 1) * 0.010)
      };
    }

    if (skill.type === 'rosePulse') {
      return {
        rose: 1.8 + ((level - 1) * 0.016)
      };
    }

    if (skill.type === 'darkThunder') {
      return {
        darkThunder: 2.0 + ((level - 1) * 0.018),
        dot: 0.5 + ((level - 1) * 0.004)
      };
    }

    if (skill.type === 'lilithSisters') {
      return {
        sisters: 0.8 + ((level - 1) * 0.012),
        red: 1.0 + ((level - 1) * 0.012)
      };
    }

    if (skill.type === 'darkPower') {
      return {
        darkFire: 3.0 + ((level - 1) * 0.015)
      };
    }

    if (skill.type === 'neonBomb') {
      return {
        pierce: 2.0 + ((level - 1) * 0.012),
        explosion: 3.0 + ((level - 1) * 0.018),
        dot: 1.0 + ((level - 1) * 0.006)
      };
    }

    if (skill.type === 'neptuneAttack') {
      return {
        trident: 2.0 + ((level - 1) * 0.012)
      };
    }

    if (skill.type === 'miraPoison') {
      return {
        bullet: 0.8 + ((level - 1) * 0.004),
        poison: 3.0 + ((level - 1) * 0.018)
      };
    }

    if (skill.type === 'bookHero') {
      return {
        hero: 3.0 + ((level - 1) * 0.018)
      };
    }

    return {};
  }

  function getCount(skill, item){
    const level = lv(item);

    if (skill.type === 'rocket') {
      if (level >= 99) return 4;
      if (level >= 60) return 3;
      if (level >= 30) return 2;
      return 1;
    }

    if (skill.type === 'energyRush') {
      if (level >= 99) return 42;
      if (level >= 60) return 32;
      if (level >= 30) return 22;
      return 12;
    }

    if (skill.type === 'twinMissile') {
      if (level >= 99) return 8;
      if (level >= 60) return 6;
      if (level >= 30) return 4;
      if (level >= 10) return 3;
      return 2;
    }

    if (skill.type === 'darkThunder') {
      if (level >= 99) return 11;
      if (level >= 60) return 9;
      if (level >= 30) return 7;
      return 5;
    }

    if (skill.type === 'neptuneAttack') return 5;

    if (skill.type === 'miraPoison') return 5;

    return 0;
  }

  function getDuration(skill, item){
    const level = lv(item);

    if (skill.type === 'thunderbolt') {
      return Math.min(12, 5 + Math.floor(level / 15));
    }

    if (skill.type === 'shadowClone') {
      if (level >= 99) return 9;
      if (level >= 60) return 8;
      if (level >= 30) return 7;
      return 5;
    }

    if (skill.type === 'arcaneBarrier') {
      if (level >= 99) return 8;
      if (level >= 60) return 7;
      if (level >= 30) return 6;
      return 5;
    }

    if (skill.type === 'darkPower') {
      if (level >= 99) return 12;
      if (level >= 60) return 10;
      if (level >= 30) return 8;
      return 6;
    }

    if (skill.type === 'blackHole') {
      if (level >= 99) return 6;
      if (level >= 60) return 5;
      if (level >= 30) return 4;
      return 3;
    }

    if (skill.type === 'healingBreeze') {
      return 10;
    }

    if (skill.type === 'rosePulse') {
      if (level >= 99) return 7;
      if (level >= 60) return 6.5;
      if (level >= 30) return 6;
      return 5;
    }

    if (skill.type === 'goldRush') {
      if (level >= 99) return 30;
      if (level >= 60) return 24;
      if (level >= 30) return 18;
      return 12;
    }

    if (skill.type === 'timeMagic') {
      return Math.min(6, 3 + ((level - 1) * 0.025));
    }

    if (skill.type === 'lilithSisters') {
      if (level >= 99) return 12;
      if (level >= 60) return 10;
      if (level >= 30) return 8;
      return 5;
    }

    if (skill.type === 'neonBomb') {
      return 3;
    }

    if (skill.type === 'miraPoison') {
      if (level >= 99) return 6;
      if (level >= 50) return 5.5;
      return 4 + ((level - 1) * 0.015);
    }

    if (skill.type === 'bookHero') {
      if (level >= 99) return 8;
      if (level >= 60) return 7;
      if (level >= 30) return 6;
      return 5;
    }

    return 0;
  }

  function getWideBonus(skill, item){
    const level = lv(item);
    if (skill.type !== 'shadowClone') return 0;
    if (level >= 99) return 8;
    if (level >= 60) return 6;
    if (level >= 30) return 4;
    return 3;
  }

  function getClonePowerRate(skill, item){
    const level = lv(item);
    if (skill.type !== 'shadowClone') return 0;
    return Math.min(1.0, 0.45 + ((level - 1) * 0.006));
  }

  function getCloneCount(skill, item){
    const level = lv(item);
    if (skill.type !== 'shadowClone') return 0;
    return level >= 99 ? 3 : 2;
  }

  function getBarrierDamage(skill, item){
    const level = lv(item);
    if (skill.type !== 'arcaneBarrier') return 0;
    if (level >= 99) return 30;
    if (level >= 60) return 20;
    if (level >= 30) return 10;
    return 0;
  }

  function getDarkPowerRate(skill, item){
    const level = lv(item);
    if (skill.type !== 'darkPower') return 0;
    if (level >= 99) return 1.0;
    if (level >= 60) return 0.8;
    if (level >= 30) return 0.6;
    return 0.5;
  }

  function getDarkPowerAttackAdd(skill, item){
    const level = lv(item);
    if (skill.type !== 'darkPower') return 0;
    if (level >= 99) return 20;
    if (level >= 60) return 15;
    if (level >= 30) return 10;
    return 5 + ((level - 1) * 0.12);
  }

  function getDarkFireInterval(skill, item){
    if (skill.type !== 'darkPower') return 0;
    return 60;
  }

  function getHealAmount(skill, item){
    const level = lv(item);
    if (skill.type !== 'healingBreeze') return 0;

    if (level >= 99) return 100;
    if (level >= 60) return 80;
    if (level >= 30) return 65;
    return 50 + Math.floor((level - 1) * 0.5);
  }

  function getHealInterval(skill, item){
    if (skill.type !== 'healingBreeze') return 0;
    return 2;
  }

  function getCoinMultiplier(skill, item){
    const level = lv(item);
    if (skill.type !== 'goldRush') return 1;

    if (level >= 99) return 5.0;
    if (level >= 60) return 4.0;
    if (level >= 30) return 3.2;
    return Math.min(3.0, 2.5 + ((level - 1) * 0.02));
  }

  function getBlackHoleRange(skill, item){
    const level = lv(item);
    if (skill.type !== 'blackHole') return 0;
    const base = Math.min(window.innerWidth || 390, window.innerHeight || 780) * 0.65;
    return base * (1 + ((level - 1) * 0.004));
  }

  function getBlackHolePower(skill, item){
    const level = lv(item);
    if (skill.type !== 'blackHole') return 0;
    return 0.065 + ((level - 1) * 0.0006);
  }

  function getWhiteHeal(skill, item){
    const level = lv(item);
    if (skill.type !== 'lilithSisters') return 0;
    return 5 + ((level - 1) * 0.08);
  }

  function getBulletSize(skill, item){
    const level = lv(item);

    if (skill.type === 'twinMissile') {
      if (level >= 99) return 56;
      if (level >= 60) return 50;
      if (level >= 30) return 44;
      if (level >= 10) return 40;
      return 36;
    }

    if (skill.type === 'neonBomb') {
      if (level >= 99) return 132;
      if (level >= 60) return 122;
      if (level >= 30) return 112;
      return 104;
    }

    if (skill.type === 'neptuneAttack') {
      if (level >= 99) return 86;
      if (level >= 60) return 78;
      if (level >= 30) return 70;
      return 64;
    }

    if (skill.type === 'bookHero') {
      if (level >= 99) return 96;
      if (level >= 60) return 88;
      if (level >= 30) return 80;
      return 72;
    }

    return 0;
  }

  function getExplosionRange(skill, item){
    const level = lv(item);

    if (skill.type === 'twinMissile') {
      if (level >= 99) return 150;
      if (level >= 60) return 132;
      if (level >= 30) return 112;
      return 96;
    }

    if (skill.type === 'neonBomb') {
      if (level >= 99) return 260;
      if (level >= 60) return 238;
      if (level >= 30) return 220;
      return 200;
    }

    return 0;
  }

  function getPoisonTick(skill, item){
    if (skill.type !== 'miraPoison') return 0;
    return 2;
  }

  function getNeonBombHitInterval(skill, item){
    if (skill.type !== 'neonBomb') return 0;
    return 2;
  }

  function getHeroHitInterval(skill, item){
    if (skill.type !== 'bookHero') return 0;
    return 2;
  }

  function getSkillRuntimeData(key){
    const state = loadState();
    const skill = getSkill(key);
    const item = state.skills[key];

    if (!skill || !item || !item.owned) return null;

    return Object.assign({}, skill, {
      level: lv(item),
      plus: plus(item),
      cooldown: getCooldown(skill, item),
      count: getCount(skill, item),
      duration: getDuration(skill, item),
      wideBonus: getWideBonus(skill, item),
      clonePowerRate: getClonePowerRate(skill, item),
      cloneCount: getCloneCount(skill, item),
      barrierDamage: getBarrierDamage(skill, item),
      darkPowerRate: getDarkPowerRate(skill, item),
      darkPowerAttackAdd: getDarkPowerAttackAdd(skill, item),
      darkFireInterval: getDarkFireInterval(skill, item),
      healAmount: getHealAmount(skill, item),
      healInterval: getHealInterval(skill, item),
      coinMultiplier: getCoinMultiplier(skill, item),
      blackHoleRange: getBlackHoleRange(skill, item),
      blackHolePower: getBlackHolePower(skill, item),
      whiteHeal: getWhiteHeal(skill, item),
      bulletSize: getBulletSize(skill, item),
      explosionRange: getExplosionRange(skill, item),
      poisonTick: getPoisonTick(skill, item),
      neonBombHitInterval: getNeonBombHitInterval(skill, item),
      heroHitInterval: getHeroHitInterval(skill, item),
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
