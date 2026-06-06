'use strict';

(function(){
  const EQUIP_SAVE_KEY = 'mobshot_equip_state_v1';

  let currentTab = 'avatar';

  function $(id){
    return document.getElementById(id);
  }

  function defaultState(){
    return {
      avatar: 'pink',
      record: 'iron',
      skill: null
    };
  }

  function loadState(){
    let state = defaultState();

    try {
      const raw = localStorage.getItem(EQUIP_SAVE_KEY);

      if (raw) {
        const parsed = JSON.parse(raw);
        state = Object.assign(state, parsed || {});
      }
    } catch(e) {}

    if (!state.avatar) state.avatar = 'pink';
    if (!state.record) state.record = 'iron';

    return state;
  }

  function saveState(state){
    try {
      localStorage.setItem(EQUIP_SAVE_KEY, JSON.stringify(state));
    } catch(e) {}
  }

  function refreshMain(){
    if (window.MobShotMain && window.MobShotMain.refreshMainHud) {
      window.MobShotMain.refreshMainHud();
    }

    updateMainPlayerImage();

    window.dispatchEvent(new CustomEvent('mobshot:saveUpdated'));
  }

  function updateMainPlayerImage(){
    const mainPlayer = $('mainPlayer');
    const equipped = loadState();

    if (!mainPlayer) return;
    if (!window.MobShotShop || !window.MobShotShop.getAvatar) return;

    const avatar = window.MobShotShop.getAvatar(equipped.avatar);

    if (!avatar) return;

    mainPlayer.src = avatar.menuImage;
    mainPlayer.style.display = 'block';
  }

  function isAvatarOwned(key){
    if (!window.MobShotShop || !window.MobShotShop.isAvatarOwned) {
      return key === 'pink';
    }

    return window.MobShotShop.isAvatarOwned(key);
  }

  function isRecordOwned(key){
    if (!window.MobShotShop || !window.MobShotShop.isRecordOwned) {
      return key === 'iron';
    }

    return window.MobShotShop.isRecordOwned(key);
  }

  function equipAvatar(key){
    if (!isAvatarOwned(key)) {
      alert('未所持です。ショップで購入してください。');
      return;
    }

    const state = loadState();
    state.avatar = key;
    saveState(state);

    refreshMain();
    render();
  }

  function equipRecord(key){
    if (!isRecordOwned(key)) {
      alert('未所持です。ショップで購入してください。');
      return;
    }

    const state = loadState();
    state.record = key;
    saveState(state);

    refreshMain();
    render();
  }

  function getEquippedAvatar(){
    const state = loadState();

    if (!window.MobShotShop || !window.MobShotShop.getAvatar) {
      return null;
    }

    return window.MobShotShop.getAvatar(state.avatar);
  }

  function getEquippedRecord(){
    const state = loadState();

    if (!window.MobShotShop || !window.MobShotShop.getRecord) {
      return null;
    }

    return window.MobShotShop.getRecord(state.record);
  }

  function getEquipmentBonus(){
    const record = getEquippedRecord();

    return {
      power: record ? Number(record.power || 0) : 0,
      rapid: record ? Number(record.rapid || 0) : 0,
      hp: record ? Number(record.hp || 0) : 0
    };
  }

  function avatarIcon(item, locked){
    const lock = locked ? ' lock-icon' : '';

    return `
      <div class="equip-card-icon${lock}">
        <img src="${item.menuImage}" alt="${item.name}" onerror="this.style.display='none';">
      </div>
    `;
  }

  function recordIcon(item, locked){
    const lock = locked ? ' lock-icon' : '';

    return `
      <div class="equip-card-icon record-icon${lock}">
        <span style="font-size:10px;font-weight:1000;color:#fff;text-shadow:0 2px 0 #000;text-align:center;line-height:1.05;">${item.name}</span>
      </div>
    `;
  }

  function renderAvatar(){
    const list = $('equipList');
    if (!list) return;

    const state = loadState();
    const avatars =
      window.MobShotShop && window.MobShotShop.AVATAR_MASTER
        ? window.MobShotShop.AVATAR_MASTER
        : [];

    list.innerHTML = '';

    avatars.forEach(item => {
      const owned = isAvatarOwned(item.key);
      const equipped = state.avatar === item.key;
      const locked = !owned;

      const card = document.createElement('div');
      card.className =
        'equip-card' +
        (equipped ? ' equipped' : '') +
        (locked ? ' locked' : '');

      card.innerHTML = `
        ${avatarIcon(item, locked)}
        <div class="equip-card-body">
          <div class="equip-card-name">${item.name}</div>
          <div class="equip-card-desc">${item.desc || '能力変化なし'}</div>
          <div class="equip-card-spec">${owned ? '所持中' : '未所持'}</div>
          <div class="equip-card-price">${equipped ? '現在装備中' : '装備メニュー'}</div>
        </div>
        <div class="equip-card-actions">
          <button type="button" class="equip-card-btn ${equipped ? 'equipped' : ''}" ${locked || equipped ? 'disabled' : ''}>
            ${equipped ? '装備中' : locked ? 'LOCK' : '装備'}
          </button>
        </div>
      `;

      const btn = card.querySelector('.equip-card-btn');

      if (btn && owned && !equipped) {
        btn.addEventListener('click', function(){
          equipAvatar(item.key);
        });
      }

      list.appendChild(card);
    });
  }

  function renderRecord(){
    const list = $('equipList');
    if (!list) return;

    const state = loadState();
    const records =
      window.MobShotShop && window.MobShotShop.RECORD_MASTER
        ? window.MobShotShop.RECORD_MASTER
        : [];

    list.innerHTML = '';

    records.forEach(item => {
      const owned = isRecordOwned(item.key);
      const equipped = state.record === item.key;
      const locked = !owned;

      const card = document.createElement('div');
      card.className =
        'equip-card' +
        (equipped ? ' equipped' : '') +
        (locked ? ' locked' : '');

      card.innerHTML = `
        ${recordIcon(item, locked)}
        <div class="equip-card-body">
          <div class="equip-card-name">${item.name}</div>
          <div class="equip-card-desc">${item.desc || '効果なし'}</div>
          <div class="equip-card-spec">${owned ? '所持中' : '未所持'}</div>
          <div class="equip-card-price">${equipped ? '現在装備中' : '装備メニュー'}</div>
        </div>
        <div class="equip-card-actions">
          <button type="button" class="equip-card-btn ${equipped ? 'equipped' : ''}" ${locked || equipped ? 'disabled' : ''}>
            ${equipped ? '装備中' : locked ? 'LOCK' : '装備'}
          </button>
        </div>
      `;

      const btn = card.querySelector('.equip-card-btn');

      if (btn && owned && !equipped) {
        btn.addEventListener('click', function(){
          equipRecord(item.key);
        });
      }

      list.appendChild(card);
    });
  }

  function renderSkill(){
    const list = $('equipList');
    if (!list) return;

    list.innerHTML = '';

    const card = document.createElement('div');
    card.className = 'equip-card locked';

    card.innerHTML = `
      <div class="equip-card-icon lock-icon">
        <span style="font-size:20px;font-weight:1000;">SKILL</span>
      </div>
      <div class="equip-card-body">
        <div class="equip-card-name">スキル装備</div>
        <div class="equip-card-desc">後日実装予定</div>
        <div class="equip-card-spec">現在は未実装です</div>
        <div class="equip-card-price">COMING SOON</div>
      </div>
      <div class="equip-card-actions">
        <button type="button" class="equip-card-btn" disabled>未実装</button>
      </div>
    `;

    list.appendChild(card);
  }

  function render(){
    if (currentTab === 'avatar') {
      renderAvatar();
      return;
    }

    if (currentTab === 'record') {
      renderRecord();
      return;
    }

    renderSkill();
  }

  function setTab(tab){
    currentTab = tab;

    const avatar = $('equipTabAvatar');
    const record = $('equipTabRecord');
    const skill = $('equipTabSkill');

    if (avatar) avatar.classList.toggle('active', tab === 'avatar');
    if (record) record.classList.toggle('active', tab === 'record');
    if (skill) skill.classList.toggle('active', tab === 'skill');

    render();
  }

  function open(){
    const modal = $('equipModal');
    if (!modal) return;

    setTab(currentTab || 'avatar');
    updateMainPlayerImage();
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
      tabAvatar.addEventListener('click', function(){ setTab('avatar'); });
    }

    if (tabRecord && !tabRecord.__mobEquipTabBound) {
      tabRecord.__mobEquipTabBound = true;
      tabRecord.addEventListener('click', function(){ setTab('record'); });
    }

    if (tabSkill && !tabSkill.__mobEquipTabBound) {
      tabSkill.__mobEquipTabBound = true;
      tabSkill.addEventListener('click', function(){ setTab('skill'); });
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
    updateMainPlayerImage();
    render();
  }

  document.addEventListener('DOMContentLoaded', init);

  window.MobShotEquip = {
    init,
    open,
    close,
    render,
    loadState,
    saveState,
    equipAvatar,
    equipRecord,
    getEquippedAvatar,
    getEquippedRecord,
    getEquipmentBonus,
    updateMainPlayerImage
  };
})();
