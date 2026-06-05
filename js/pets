js/pets.js を丸ごと置き換えてください。

'use strict';
(function(){
  const PET_SAVE_KEY = 'mobshot_pet_equip_test_v2';
  const PET_MASTER = [
    {
      key: 'mobdrago',
      name: 'モブドラゴ',
      role: 'バランス型',
      unlock: '初期解放',
      rank: 1,
      price: 3000,
      level: 1,
      owned: true,
      icon: '🔥',
      image: '',
      normalAttack: 'プレイヤー攻撃力70%',
      normalRate: 'プレイヤー連射速度60%',
      skillName: '火の玉5連発',
      skillPower: 'プレイヤー攻撃力120%',
      skillRate: 'プレイヤー連射速度120%',
      skillCt: 30,
      firstCt: 10,
      growth: 'CT-0.1秒 / Lv5ごとに火の玉+1 / スキル連射速度+0.5% / Lv50・Lv70でワイド+1'
    },
    {
      key: 'mobfrog',
      name: 'モブガエル',
      role: '障害物特化',
      unlock: '初期解放',
      rank: 1,
      price: 3000,
      level: 1,
      owned: true,
      icon: '💧',
      image: '',
      normalAttack: 'プレイヤー攻撃力60%',
      normalRate: 'プレイヤー連射速度50%',
      skillName: '大型水弾3発',
      skillPower: 'プレイヤー攻撃力250% / 障害物350%',
      skillRate: '通常',
      skillCt: 25,
      firstCt: 5,
      growth: 'CT-0.1秒 / Lv5ごとに水弾+1 / 障害物ダメージ+0.5% / Lv50・Lv70でワイド+1'
    },
    {
      key: 'mobdenden',
      name: 'モブデンデン',
      role: '雑魚殲滅型',
      unlock: 'Rank5',
      rank: 5,
      price: 5000,
      level: 1,
      owned: true,
      icon: '⚡',
      image: '',
      normalAttack: 'プレイヤー攻撃力50%',
      normalRate: 'プレイヤー連射速度65%',
      skillName: '雷弾10発',
      skillPower: 'プレイヤー攻撃力100%',
      skillRate: 'プレイヤー連射速度160%',
      skillCt: 35,
      firstCt: 15,
      growth: 'CT-0.1秒 / Lv5ごとに雷弾+2 / スキル威力+2% / Lv50・Lv70でワイド+1'
    },
    {
      key: 'mobwolf',
      name: 'モブウルフ',
      role: 'ボス特化型',
      unlock: 'Rank5',
      rank: 5,
      price: 5000,
      level: 1,
      owned: true,
      icon: '🐺',
      image: '',
      normalAttack: 'プレイヤー攻撃力80%',
      normalRate: 'プレイヤー連射速度48%',
      skillName: '追尾銃弾5発',
      skillPower: 'プレイヤー攻撃力200% / ボス300%',
      skillRate: 'プレイヤー連射速度200%',
      skillCt: 30,
      firstCt: 20,
      growth: 'CT-0.1秒 / Lv5ごとに銃弾+1 / スキル威力+2% / Lv50・Lv70でワイド+1'
    }
  ];
  function loadEquip(){
    let data = {
      equipped: ['mobdrago', 'mobfrog', 'mobdenden']
    };
    try {
      const raw = localStorage.getItem(PET_SAVE_KEY);
      if (raw) {
        data = Object.assign(data, JSON.parse(raw));
      }
    } catch(e) {}
    data.equipped = Array.isArray(data.equipped) ? data.equipped.slice(0, 3) : [];
    data.equipped = data.equipped.filter((key, index, arr) => {
      return arr.indexOf(key) === index && !!getPet(key);
    });
    return data;
  }
  function saveEquip(data){
    data.equipped = Array.isArray(data.equipped) ? data.equipped.slice(0, 3) : [];
    data.equipped = data.equipped.filter((key, index, arr) => {
      return arr.indexOf(key) === index && !!getPet(key);
    });
    try {
      localStorage.setItem(PET_SAVE_KEY, JSON.stringify(data));
    } catch(e) {}
  }
  function getPet(key){
    return PET_MASTER.find(pet => pet.key === key) || null;
  }
  function isEquipped(key){
    const data = loadEquip();
    return data.equipped.includes(key);
  }
  function equipPet(key){
    const pet = getPet(key);
    if (!pet || !pet.owned) return;
    const data = loadEquip();
    if (data.equipped.includes(key)) {
      data.equipped = data.equipped.filter(v => v !== key);
      saveEquip(data);
      renderAll();
      return;
    }
    if (data.equipped.length >= 3) {
      data.equipped.shift();
    }
    data.equipped.push(key);
    saveEquip(data);
    renderAll();
  }
  function petVisual(pet){
    if (pet.image) {
      return `<img src="${pet.image}" alt="${pet.name}">`;
    }
    return `<span class="pet-slot-icon">${pet.icon}</span>`;
  }
  function floatVisual(pet){
    if (pet.image) {
      return `<img src="${pet.image}" alt="${pet.name}">`;
    }
    return `<span>${pet.icon}</span>`;
  }
  function cardVisual(pet){
    if (pet.image) {
      return `<img src="${pet.image}" alt="${pet.name}">`;
    }
    return `<span>${pet.icon}</span>`;
  }
  function renderSlots(){
    const wrap = document.getElementById('petEquipSlots');
    if (!wrap) return;
    const data = loadEquip();
    wrap.innerHTML = '';
    for (let i = 0; i < 3; i++) {
      const key = data.equipped[i];
      const pet = getPet(key);
      const slot = document.createElement('button');
      slot.type = 'button';
      slot.className = pet ? 'pet-slot' : 'pet-slot empty';
      if (pet) {
        slot.innerHTML = `
          <span class="pet-slot-num">${i + 1}</span>
          ${petVisual(pet)}
          <span class="pet-slot-name">${pet.name}</span>
        `;
        slot.addEventListener('click', function(){
          equipPet(pet.key);
        });
      }
      wrap.appendChild(slot);
    }
  }
  function renderFloatPets(){
    const layer = document.getElementById('mainPetFloatLayer');
    if (!layer) return;
    const data = loadEquip();
    layer.innerHTML = '';
    data.equipped.forEach(key => {
      const pet = getPet(key);
      if (!pet) return;
      const el = document.createElement('div');
      el.className = 'main-float-pet';
      el.innerHTML = floatVisual(pet);
      layer.appendChild(el);
    });
  }
  function renderOwnedList(){
    const list = document.getElementById('petOwnedList');
    if (!list) return;
    list.innerHTML = '';
    PET_MASTER.forEach(pet => {
      const equipped = isEquipped(pet.key);
      const stateText = equipped ? '装備中' : '装備する';
      const lockedText = pet.owned ? '所持中' : '未所持';
      const card = document.createElement('div');
      card.className = 'pet-card' + (equipped ? ' equipped' : '');
      card.innerHTML = `
        <div class="pet-card-icon">${cardVisual(pet)}</div>
        <div class="pet-card-body">
          <div class="pet-card-name">${pet.name} <span>Lv${pet.level}</span></div>
          <div class="pet-card-desc">${pet.role} / ${pet.unlock} / ${lockedText}</div>
          <div class="pet-card-price">SHOP価格 ${pet.price.toLocaleString()} COIN</div>
          <div class="pet-card-spec">通常: ${pet.normalAttack} / 連射: ${pet.normalRate}</div>
          <div class="pet-card-spec">スキル: ${pet.skillName} / CT${pet.skillCt}秒 / 初回${pet.firstCt}秒</div>
          <div class="pet-card-spec">威力: ${pet.skillPower}</div>
        </div>
        <button type="button" class="pet-card-btn ${equipped ? 'equipped' : ''}">
          ${equipped ? '外す' : stateText}
        </button>
      `;
      const btn = card.querySelector('button');
      btn.addEventListener('click', function(){
        equipPet(pet.key);
      });
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
  document.addEventListener('DOMContentLoaded', init);
  window.MobShotPets = {
    init,
    renderAll,
    openModal,
    closeModal,
    getEquippedPets: function(){
      return loadEquip().equipped.slice(0, 3);
    },
    PET_MASTER
  };
})();
