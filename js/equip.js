'use strict';

(function(){
  const EQUIP_SAVE_KEY = 'mobshot_equip_state_v1';
  const SHOP_SAVE_KEY = 'mobshot_shop_state_v1';

  let currentTab = 'avatar';

  const FALLBACK_AVATARS = [
    {
      key: 'pink',
      name: 'ピンクモデル',
      rank: 1,
      price: 0,
      menuImage: 'play/playpink2.png',
      backImage: 'play/playpink.png',
      initial: true,
      ownedDefault: true
    }
  ];

  const RECORDS = [
    {
      key: 'iron',
      name: '鉄の弾',
      rank: 1,
      price: 0,
      power: 0,
      rapid: 0,
      hp: 0,
      bulletImage: '',
      initial: true
    },
    {
      key: 'fireball',
      name: '火の玉',
      rank: 1,
      price: 8000,
      power: 1,
      rapid: 0,
      hp: 0,
      bulletImage: 'atk/hinotama.png'
    },
    {
      key: 'recordfire',
      name: 'レコードファイア',
      rank: 3,
      price: 18000,
      power: 2,
      rapid: 0,
      hp: 0,
      bulletImage: 'atk/record.png'
    },
    {
      key: 'rainbowfire',
      name: 'レインボーファイア',
      rank: 5,
      price: 32000,
      power: 2,
      rapid: 0,
      hp: 0,
      bulletImage: 'atk/bow.png'
    },
    {
      key: 'wataame',
      name: 'WATAAME!!',
      rank: 10,
      price: 55000,
      power: 2,
      rapid: 0.2,
      hp: 0,
      bulletImage: 'atk/wata.png'
    },
    {
      key: 'garagara',
      name: 'ガラガラの旅',
      rank: 10,
      price: 70000,
      power: 3,
      rapid: 0.2,
      hp: 0,
      bulletImage: 'atk/garagara.png'
    },
    {
      key: 'book',
      name: '読みかけの本',
      rank: 10,
      price: 85000,
      power: 3,
      rapid: 0.1,
      hp: 50,
      bulletImage: 'atk/book.png'
    },
    {
      key: 'mobrpg',
      name: 'MOB RPG',
      rank: 10,
      price: 100000,
      power: 4,
      rapid: 0,
      hp: 0,
      bulletImage: 'atk/rpg.png'
    },
    {
      key: 'iyonokuni',
      name: '伊予ノ国',
      rank: 20,
      price: 140000,
      power: 2,
      rapid: 0,
      hp: 150,
      bulletImage: 'atk/iyo.png'
    },
    {
      key: 'realize',
      name: 'Realize',
      rank: 20,
      price: 175000,
      power: 4,
      rapid: 0,
      hp: 0,
      bulletImage: 'atk/rea.png'
    },
    {
      key: 'portal',
      name: 'Portal',
      rank: 20,
      price: 220000,
      power: 1,
      rapid: 0.4,
      hp: 0,
      bulletImage: 'atk/portal.png'
    },
    {
      key: 'pb2',
      name: 'PB2',
      rank: 20,
      price: 300000,
      power: 2,
      rapid: 0.3,
      hp: 100,
      bulletImage: 'atk/pb2.png'
    }
  ];

  function $(id){
    return document.getElementById(id);
  }

  function getAvatarMaster(){
    if (
      window.MobShotShop &&
      Array.isArray(window.MobShotShop.AVATAR_MASTER) &&
      window.MobShotShop.AVATAR_MASTER.length
    ) {
      return window.MobShotShop.AVATAR_MASTER;
    }

    return FALLBACK_AVATARS;
  }

  function defaultEquipState(){
    return {
      avatar: 'pink',
      record: 'iron'
    };
  }

  function defaultShopState(){
    const avatars = {};
    const records = {};

    getAvatarMaster().forEach(item => {
      avatars[item.key] = !!(item.initial || item.ownedDefault);
    });

    RECORDS.forEach(item => {
      records[item.key] = !!item.initial;
    });

    return {
      avatars,
      records
    };
  }

  function loadEquipState(){
    let state = defaultEquipState();

    try {
      const raw = localStorage.getItem(EQUIP_SAVE_KEY);

      if (raw) {
        state = Object.assign(state, JSON.parse(raw) || {});
      }
    } catch(e) {}

    if (!getAvatar(state.avatar)) {
      state.avatar = 'pink';
    }

    if (!getRecord(state.record)) {
      state.record = 'iron';
    }

    return state;
  }

  function saveEquipState(state){
    try {
      localStorage.setItem(EQUIP_SAVE_KEY, JSON.stringify(state));
    } catch(e) {}
  }

  function loadShopState(){
    let state = defaultShopState();

    try {
      const raw = localStorage.getItem(SHOP_SAVE_KEY);

      if (raw) {
        const parsed = JSON.parse(raw);
        state = Object.assign(state, parsed || {});
        state.avatars = Object.assign(defaultShopState().avatars, parsed.avatars || {});
        state.records = Object.assign(defaultShopState().records, parsed.records || {});
      }
    } catch(e) {}

    return state;
  }

  function getAvatar(key){
    return getAvatarMaster().find(item => item.key === key) || null;
  }

  function getRecord(key){
    return RECORDS.find(item => item.key === key) || null;
  }

  function getSave(){
    if (window.MobShotStorage && window.MobShotStorage.load) {
      return window.MobShotStorage.load();
    }

    return {
      rank: 1,
      coin: 0,
      diamond: 0,
      totalScore: 0,
      bestScore: 0
    };
  }

  function isOwned(type, key){
    const shop = loadShopState();

    if (type === 'avatar') {
      return !!shop.avatars[key];
    }

    if (type === 'record') {
      return !!shop.records[key];
    }

    return false;
  }

  function getEquippedAvatar(){
    const state = loadEquipState();
    return getAvatar(state.avatar) || getAvatar('pink') || FALLBACK_AVATARS[0];
  }

  function getEquippedRecord(){
    const state = loadEquipState();
    return getRecord(state.record) || getRecord('iron');
  }

  function getEquipmentBonus(){
    const record = getEquippedRecord();

    return {
      power: Number(record.power || 0),
      rapid: Number(record.rapid || 0),
      hp: Number(record.hp || 0)
    };
  }

  function updateMainPlayerImage(){
    const avatar = getEquippedAvatar();
    const img = $('mainPlayer');

    if (img && avatar && avatar.menuImage) {
      img.style.display = 'block';
      img.src = avatar.menuImage;
    }
  }

  function refreshHud(){
    if (window.MobShotMain && window.MobShotMain.refreshMainHud) {
      window.MobShotMain.refreshMainHud();
    }

    window.dispatchEvent(new CustomEvent('mobshot:saveUpdated'));
  }

  function itemImageHtml(item, type){
    if (type === 'avatar') {
      return `<img src="${item.menuImage}" alt="${item.name}" onerror="this.style.display='none';">`;
    }

    if (type === 'record') {
      return `<div class="record-disc-small"></div>`;
    }

    if (type === 'skill') {
      return `<img src="${item.image}" alt="${item.name}" onerror="this.style.display='none';">`;
    }

    return '';
  }

  function skillSpecText(skill){
    if (!window.MobShotSkills || !window.MobShotSkills.getSkillRuntimeData) {
      return '';
    }

    const data = window.MobShotSkills.getSkillRuntimeData(skill.key);

    if (!data) return '未所持';

    return `Lv${data.level} / +${data.plus} / CT${data.cooldown}秒`;
  }

  function isDarkPowerSkill(skillKey){
    const key = String(skillKey || '').toLowerCase();
    const name = getSkillName(skillKey).toLowerCase();

    return (
      key === 'darkoblivion' ||
      key === 'dark_oblivion' ||
      key === 'darkpower' ||
      key === 'dark_power' ||
      key === 'darkthunder' ||
      key === 'dark_thunder' ||
      key.includes('dark') ||
      name.includes('闇') ||
      name.includes('ダーク')
    );
  }

  function getSkillName(skillKey){
    if (!window.MobShotSkills || !Array.isArray(window.MobShotSkills.SKILL_MASTER)) {
      return '';
    }

    const skill = window.MobShotSkills.SKILL_MASTER.find(item => item.key === skillKey);
    return skill ? String(skill.name || '') : '';
  }

  function getSkillUpgradeCostAt(skillKey, level){
    const lv = Math.max(1, Number(level || 1));

    if (isDarkPowerSkill(skillKey)) {
      return 3000 + (lv - 1) * 1500;
    }

    return 1000 + (lv - 1) * 500;
  }

  function getSkillUpgradeCost(skillKey){
    if (!window.MobShotSkills || !window.MobShotSkills.loadState) {
      return 999999999;
    }

    const state = window.MobShotSkills.loadState();
    const item = state.skills && state.skills[skillKey];

    if (!item || !item.owned) {
      return 999999999;
    }

    return getSkillUpgradeCostAt(skillKey, Number(item.level || 1));
  }

  function calcSkillUpgradePlan(skillKey, limit, useCoinLimit){
    if (!window.MobShotSkills || !window.MobShotSkills.loadState) {
      return { count:0, cost:0, finalLv:1 };
    }

    const state = window.MobShotSkills.loadState();
    const item = state.skills && state.skills[skillKey];

    if (!item || !item.owned) {
      return { count:0, cost:0, finalLv:1 };
    }

    const save = getSave();

    let lv = Number(item.level || 1);
    let coin = Number(save.coin || 0);
    let count = 0;
    let costTotal = 0;

    while (count < limit && lv < 99) {
      const cost = getSkillUpgradeCostAt(skillKey, lv);

      if (!Number.isFinite(cost) || cost <= 0) break;
      if (useCoinLimit && coin < cost) break;

      if (useCoinLimit) coin -= cost;

      costTotal += cost;
      lv += 1;
      count += 1;
    }

    return {
      count,
      cost: costTotal,
      finalLv: lv
    };
  }

  function calcSkillUpgradeBatch(skillKey, limit){
    return calcSkillUpgradePlan(skillKey, limit, true);
  }

  function calcSkillUpgradeToMax(skillKey){
    return calcSkillUpgradePlan(skillKey, 999, false);
  }

  function upgradeSkillBatch(skillKey, limit){
    if (!window.MobShotSkills || !window.MobShotSkills.loadState) return;

    const batch = calcSkillUpgradeBatch(skillKey, limit);

    if (batch.count <= 0) {
      alert('COINが足りないか、最大Lvです。');
      return;
    }

    let done = 0;

    while (done < batch.count) {
      if (!window.MobShotSkills.upgradeSkill) break;

      const before = window.MobShotSkills.loadState();
      const beforeLv = before.skills && before.skills[skillKey] ? Number(before.skills[skillKey].level || 1) : 1;

      window.MobShotSkills.upgradeSkill(skillKey);

      const after = window.MobShotSkills.loadState();
      const afterLv = after.skills && after.skills[skillKey] ? Number(after.skills[skillKey].level || 1) : beforeLv;

      if (afterLv <= beforeLv) break;

      done += 1;
    }

    refreshHud();
    render();
  }

  function renderAvatarList(){
    const list = $('equipList');
    if (!list) return;

    const save = getSave();
    const rank = Number(save.rank || 1);
    const equip = loadEquipState();
    const avatars = getAvatarMaster();

    list.innerHTML = '';

    avatars.forEach(item => {
      const owned = isOwned('avatar', item.key);
      const rankOk = rank >= Number(item.rank || 1);
      const equipped = equip.avatar === item.key;

      const card = document.createElement('div');

      card.className =
        'equip-card' +
        (equipped ? ' equipped' : '') +
        (!owned || !rankOk ? ' locked' : '');

      card.innerHTML = `
        <div class="equip-card-icon ${!owned || !rankOk ? 'lock-icon' : ''}">
          ${itemImageHtml(item, 'avatar')}
        </div>

        <div class="equip-card-body">
          <div class="equip-card-name">${item.name}</div>
          <div class="equip-card-desc">見た目変更のみ / 能力影響なし</div>
          <div class="equip-card-price">${rankOk ? '所持アイテム' : `Rank${item.rank}で解放`}</div>
          <div class="equip-card-spec">${owned ? '所持中' : '未所持'} ${equipped ? '/ 装備中' : ''}</div>
        </div>

        <div class="equip-card-actions">
          <button type="button" class="equip-card-btn ${equipped ? 'equipped' : ''}" ${!owned || !rankOk || equipped ? 'disabled' : ''}>
            ${equipped ? '装備中' : owned && rankOk ? '装備' : 'LOCK'}
          </button>
        </div>
      `;

      const btn = card.querySelector('.equip-card-btn');

      if (btn && owned && rankOk && !equipped) {
        btn.addEventListener('click', function(){
          equip.avatar = item.key;
          saveEquipState(equip);
          updateMainPlayerImage();
          render();
          refreshHud();
        });
      }

      list.appendChild(card);
    });
  }

  function renderRecordList(){
    const list = $('equipList');
    if (!list) return;

    const save = getSave();
    const rank = Number(save.rank || 1);
    const equip = loadEquipState();

    list.innerHTML = '';

    RECORDS.forEach(item => {
      const owned = isOwned('record', item.key);
      const rankOk = rank >= item.rank;
      const equipped = equip.record === item.key;

      const specs = [];

      if (item.power) specs.push(`POWER +${item.power}`);
      if (item.rapid) specs.push(`攻撃速度 +${item.rapid}`);
      if (item.hp) specs.push(`HP +${item.hp}`);
      if (!specs.length) specs.push('効果なし');

      const card = document.createElement('div');

      card.className =
        'equip-card' +
        (equipped ? ' equipped' : '') +
        (!owned || !rankOk ? ' locked' : '');

      card.innerHTML = `
        <div class="equip-card-icon record-icon ${!owned || !rankOk ? 'lock-icon' : ''}">
          ${itemImageHtml(item, 'record')}
        </div>

        <div class="equip-card-body">
          <div class="equip-card-name">${item.name}</div>
          <div class="equip-card-desc">弾画像: ${item.bulletImage || '通常弾'}</div>
          <div class="equip-card-price">${rankOk ? `購入価格: ${Number(item.price || 0).toLocaleString()} COIN` : `Rank${item.rank}で解放`}</div>
          <div class="equip-card-spec">${specs.join(' / ')}</div>
          <div class="equip-card-spec">${owned ? '所持中' : '未所持'} ${equipped ? '/ 装備中' : ''}</div>
        </div>

        <div class="equip-card-actions">
          <button type="button" class="equip-card-btn ${equipped ? 'equipped' : ''}" ${!owned || !rankOk || equipped ? 'disabled' : ''}>
            ${equipped ? '装備中' : owned && rankOk ? '装備' : 'LOCK'}
          </button>
        </div>
      `;

      const btn = card.querySelector('.equip-card-btn');

      if (btn && owned && rankOk && !equipped) {
        btn.addEventListener('click', function(){
          equip.record = item.key;
          saveEquipState(equip);
          render();
          refreshHud();
        });
      }

      list.appendChild(card);
    });
  }

  function renderSkillList(){
    const list = $('equipList');
    if (!list) return;

    list.innerHTML = '';

    if (!window.MobShotSkills || !window.MobShotSkills.SKILL_MASTER) {
      list.innerHTML = '<div class="equip-card"><div class="equip-card-body"><div class="equip-card-name">スキル未読み込み</div></div></div>';
      return;
    }

    const save = getSave();
    const coin = Number(save.coin || 0);
    const state = window.MobShotSkills.loadState();
    const equipped = state.equipped || [];

    window.MobShotSkills.SKILL_MASTER.forEach(skill => {
      const item = state.skills[skill.key] || {};
      const owned = !!item.owned;
      const isEquipped = equipped.includes(skill.key);
      const runtime = window.MobShotSkills.getSkillRuntimeData(skill.key);
      const cost = owned ? getSkillUpgradeCost(skill.key) : 0;
      const batch10 = owned ? calcSkillUpgradeBatch(skill.key, 10) : { count:0, cost:0 };
      const batchMaxAffordable = owned ? calcSkillUpgradeBatch(skill.key, 999) : { count:0, cost:0 };
      const toMax = owned ? calcSkillUpgradeToMax(skill.key) : { count:0, cost:0 };
      const lv = Number(item.level || 1);
      const maxed = owned && lv >= 99;
      const canUpgradeOne = owned && !maxed && coin >= cost;
      const canMaxNow = owned && !maxed && batchMaxAffordable.count > 0;

      const card = document.createElement('div');

      card.className =
        'equip-card' +
        (isEquipped ? ' equipped' : '') +
        (!owned ? ' locked' : '');

      card.innerHTML = `
        <div class="equip-card-icon ${!owned ? 'lock-icon' : ''}">
          ${itemImageHtml(skill, 'skill')}
        </div>

        <div class="equip-card-body">
          <div class="equip-card-name">${skill.name}</div>
          <div class="equip-card-desc">${skill.desc}</div>
          <div class="equip-card-price">${owned ? skillSpecText(skill) : 'ガチャで入手'}</div>
          <div class="equip-card-spec">${runtime ? `装備効果: CT${runtime.cooldown}秒` : '未所持'}</div>
          <div class="equip-card-spec">${isEquipped ? '装備中' : owned ? '所持中' : '未所持'}</div>
          <div class="equip-card-spec">${
            owned && !maxed
              ? `次: ${cost.toLocaleString()} COIN`
              : maxed ? 'Lv MAX' : ''
          }</div>
          <div class="equip-card-spec">${
            owned && !maxed
              ? `10回: ${batch10.count > 0 ? `${batch10.count}Lv / ${batch10.cost.toLocaleString()} COIN` : 'COIN不足'}`
              : ''
          }</div>
          <div class="equip-card-spec">${
            owned && !maxed
              ? `Lv99まで: ${toMax.count}Lv / ${toMax.cost.toLocaleString()} COIN`
              : ''
          }</div>
        </div>

        <div class="equip-card-actions" style="display:grid;gap:6px;">
          <button type="button" class="equip-card-btn ${isEquipped ? 'equipped' : ''}" ${!owned ? 'disabled' : ''}>
            ${isEquipped ? '外す' : owned ? '装備' : 'LOCK'}
          </button>

          <button type="button" class="pet-upgrade-btn skill-up-one" ${!canUpgradeOne ? 'disabled' : ''}>
            1回<br>${owned && !maxed ? cost.toLocaleString() : 'MAX'}
          </button>

          <button type="button" class="pet-upgrade-btn skill-up-ten" ${!owned || maxed || batch10.count <= 0 ? 'disabled' : ''}>
            10回<br>${batch10.count > 0 ? batch10.cost.toLocaleString() : '不可'}
          </button>

          <button type="button" class="pet-upgrade-btn skill-up-max" ${!canMaxNow ? 'disabled' : ''}>
            MAX<br>${batchMaxAffordable.count > 0 ? batchMaxAffordable.cost.toLocaleString() : '不可'}
          </button>
        </div>
      `;

      const equipBtn = card.querySelector('.equip-card-btn');
      const upgradeOneBtn = card.querySelector('.skill-up-one');
      const upgradeTenBtn = card.querySelector('.skill-up-ten');
      const upgradeMaxBtn = card.querySelector('.skill-up-max');

      if (equipBtn && owned) {
        equipBtn.addEventListener('click', function(){
          window.MobShotSkills.equipSkill(skill.key);
          render();
          refreshHud();
        });
      }

      if (upgradeOneBtn && canUpgradeOne) {
        upgradeOneBtn.addEventListener('click', function(){
          upgradeSkillBatch(skill.key, 1);
        });
      }

      if (upgradeTenBtn && owned && !maxed && batch10.count > 0) {
        upgradeTenBtn.addEventListener('click', function(){
          upgradeSkillBatch(skill.key, 10);
        });
      }

      if (upgradeMaxBtn && canMaxNow) {
        upgradeMaxBtn.addEventListener('click', function(){
          upgradeSkillBatch(skill.key, 999);
        });
      }

      list.appendChild(card);
    });
  }

  function render(){
    const tabAvatar = $('equipTabAvatar');
    const tabRecord = $('equipTabRecord');
    const tabSkill = $('equipTabSkill');

    if (tabAvatar) tabAvatar.classList.toggle('active', currentTab === 'avatar');
    if (tabRecord) tabRecord.classList.toggle('active', currentTab === 'record');
    if (tabSkill) tabSkill.classList.toggle('active', currentTab === 'skill');

    if (currentTab === 'avatar') {
      renderAvatarList();
    }

    if (currentTab === 'record') {
      renderRecordList();
    }

    if (currentTab === 'skill') {
      renderSkillList();
    }
  }

  function setTab(tab){
    currentTab = tab;
    render();
  }

  function open(){
    const modal = $('equipModal');
    if (!modal) return;

    render();
    modal.classList.remove('hidden');
  }

  function close(){
    const modal = $('equipModal');
    if (!modal) return;

    modal.classList.add('hidden');
  }

  function bind(){
    const openBtn = $('openEquipBtn');

    if (openBtn && !openBtn.__mobEquipBound) {
      openBtn.__mobEquipBound = true;

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

    const closeBtn = $('equipCloseBtn');

    if (closeBtn && !closeBtn.__mobEquipCloseBound) {
      closeBtn.__mobEquipCloseBound = true;

      closeBtn.addEventListener('click', function(e){
        e.preventDefault();
        e.stopPropagation();
        close();
      }, { passive:false });
    }

    const tabAvatar = $('equipTabAvatar');
    const tabRecord = $('equipTabRecord');
    const tabSkill = $('equipTabSkill');

    if (tabAvatar && !tabAvatar.__mobEquipTabBound) {
      tabAvatar.__mobEquipTabBound = true;
      tabAvatar.addEventListener('click', function(){
        setTab('avatar');
      });
    }

    if (tabRecord && !tabRecord.__mobEquipTabBound) {
      tabRecord.__mobEquipTabBound = true;
      tabRecord.addEventListener('click', function(){
        setTab('record');
      });
    }

    if (tabSkill && !tabSkill.__mobEquipTabBound) {
      tabSkill.__mobEquipTabBound = true;
      tabSkill.addEventListener('click', function(){
        setTab('skill');
      });
    }

    const modal = $('equipModal');

    if (modal && !modal.__mobEquipBgBound) {
      modal.__mobEquipBgBound = true;

      modal.addEventListener('click', function(e){
        if (e.target === modal) {
          close();
        }
      });
    }
  }

  function init(){
    bind();

    const equip = loadEquipState();

    if (!equip.avatar) {
      equip.avatar = 'pink';
    }

    if (!equip.record) {
      equip.record = 'iron';
    }

    saveEquipState(equip);
    updateMainPlayerImage();
    render();
  }

  document.addEventListener('DOMContentLoaded', init);

  window.MobShotEquip = {
    get AVATARS(){
      return getAvatarMaster();
    },
    RECORDS,
    init,
    open,
    close,
    render,
    getEquippedAvatar,
    getEquippedRecord,
    getEquipmentBonus,
    updateMainPlayerImage,
    loadEquipState,
    saveEquipState,
    calcSkillUpgradeBatch,
    calcSkillUpgradeToMax,
    upgradeSkillBatch
  };
})();
