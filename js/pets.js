'use strict';

(function(){
  const PET_SAVE_KEY = 'mobshot_pet_state_v3';

  const PET_MASTER = [
    {
      key: 'mobdrago',
      name: 'モブドラゴ',
      role: 'バランス型',
      unlock: '初期解放',
      rank: 1,
      price: 3000,
      implemented: true,
      frontImage: 'pet/pet1A.png',
      backImage: 'pet/pet1B.png',
      normalAttackRate: 0.70,
      normalRateRate: 0.60,
      skillName: '火の玉5連発',
      skillBaseCount: 5,
      skillPowerRate: 1.20,
      skillObstacleRate: 1.20,
      skillBossRate: 1.20,
      skillRateRate: 1.20,
      skillCt: 30,
      firstCt: 10,
      growthText: 'CT-0.1秒 / Lv5ごとに火の玉+1 / スキル連射速度+0.5% / Lv50・Lv70でワイド+1'
    },
    {
      key: 'mobfrog',
      name: 'モブイルカエル',
      role: '障害物特化',
      unlock: '初期解放',
      rank: 1,
      price: 3000,
      implemented: true,
      frontImage: 'pet/pet2A.png',
      backImage: 'pet/pet2B.png',
      normalAttackRate: 0.60,
      normalRateRate: 0.50,
      skillName: '大型水弾3発',
      skillBaseCount: 3,
      skillPowerRate: 2.50,
      skillObstacleRate: 3.50,
      skillBossRate: 2.50,
      skillRateRate: 1.00,
      skillCt: 25,
      firstCt: 5,
      growthText: 'CT-0.1秒 / Lv5ごとに水弾+1 / 障害物ダメージ+0.5% / Lv50・Lv70でワイド+1'
    },
    {
      key: 'mobdenden',
      name: 'モブデンデン',
      role: '雑魚殲滅型',
      unlock: 'Rank5',
      rank: 5,
      price: 5000,
      implemented: true,
      frontImage: 'pet/pet raitokage.png',
      backImage: 'pet/pet raitokage2.png',
      normalAttackRate: 0.50,
      normalRateRate: 0.65,
      skillName: '雷弾10発',
      skillBaseCount: 10,
      skillPowerRate: 1.00,
      skillObstacleRate: 1.00,
      skillBossRate: 1.00,
      skillRateRate: 1.60,
      skillCt: 35,
      firstCt: 15,
      growthText: 'CT-0.1秒 / Lv5ごとに雷弾+2 / スキル威力+2% / Lv50・Lv70でワイド+1'
    },
    {
      key: 'mobwolf',
      name: 'モブウルフ',
      role: 'ボス特化型',
      unlock: 'Rank5',
      rank: 5,
      price: 5000,
      implemented: true,
      frontImage: 'pet/pet wolf.png',
      backImage: 'pet/pet wolf2.png',
      normalAttackRate: 0.80,
      normalRateRate: 0.48,
      skillName: '追尾銃弾5発',
      skillBaseCount: 5,
      skillPowerRate: 2.00,
      skillObstacleRate: 2.00,
      skillBossRate: 3.00,
      skillRateRate: 2.00,
      skillCt: 30,
      firstCt: 20,
      growthText: 'CT-0.1秒 / Lv5ごとに銃弾+1 / スキル威力+2% / Lv50・Lv70でワイド+1'
    },
    {
      key: 'mobbike',
      name: 'モブバイク',
      role: '未実装',
      unlock: 'Rank10',
      rank: 10,
      price: 0,
      implemented: false
    },
    {
      key: 'mobhawk',
      name: 'モブホーク',
      role: '未実装',
      unlock: 'Rank10',
      rank: 10,
      price: 0,
      implemented: false
    },
    {
      key: 'mobknife',
      name: 'モブナイフ',
      role: '未実装',
      unlock: 'Rank15',
      rank: 15,
      price: 0,
      implemented: false
    },
    {
      key: 'mobryuno',
      name: 'モブリュウノ',
      role: '未実装',
      unlock: 'Rank30',
      rank: 30,
      price: 0,
      implemented: false
    },
    {
      key: 'moblilith',
      name: 'モブリリス',
      role: '未実装',
      unlock: 'Rank50',
      rank: 50,
      price: 0,
      implemented: false
    },
    {
      key: 'hero',
      name: 'あのヒーロー',
      role: '未実装',
      unlock: 'Rank100',
      rank: 100,
      price: 0,
      implemented: false
    }
  ];

  function defaultState(){
    const pets = {};

    PET_MASTER.forEach(pet => {
      pets[pet.key] = {
        owned: false,
        level: 1
      };
    });

    return {
      equipped: [],
      pets
    };
  }

  function loadState(){
    let state = defaultState();

    try {
      const raw = localStorage.getItem(PET_SAVE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        state = Object.assign(state, parsed);
        state.pets = Object.assign(defaultState().pets, parsed.pets || {});
      }
    } catch(e) {}

    state.equipped = Array.isArray(state.equipped) ? state.equipped.slice(0, 3) : [];
    state.equipped = state.equipped.filter((key, index, arr) => {
      const pet = getPet(key);
      return arr.indexOf(key) === index && pet && pet.implemented && state.pets[key] && state.pets[key].owned;
    });

    return state;
  }

  function saveState(state){
    state.equipped = Array.isArray(state.equipped) ? state.equipped.slice(0, 3) : [];

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
      coin: 0,
      rank: 1,
      score: 0,
      diamond: 0
    };
  }

  function saveMainData(save){
    if (window.MobShotStorage && window.MobShotStorage.save) {
      window.MobShotStorage.save(save);
      return true;
    }

    try {
      localStorage.setItem('mobshot_save', JSON.stringify(save));
      return true;
    } catch(e) {
      return false;
    }
  }

  function refreshMainHud(){
    if (window.MobShotMain && window.MobShotMain.refreshMainHud) {
      window.MobShotMain.refreshMainHud();
    }
  }

  function canUnlock(pet){
    const save = getSave();
    const rank = Number(save.rank || 1);
    return rank >= pet.rank;
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
    return Math.max(1, Math.min(99, Number(state.pets[key]?.level || 1)));
  }

  function upgradeCost(level){
    if (level <= 1) return 500;
    if (level === 2) return 600;
    if (level === 3) return 700;
    if (level === 4) return 800;
    if (level === 5) return 1000;
    return 1000 + (level - 5) * 500;
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

    if (coin < pet.price) {
      alert(`COINが足りません。\n必要COIN: ${pet.price.toLocaleString()}`);
      return;
    }

    save.coin = coin - pet.price;
    saveMainData(save);

    state.pets[key] = {
      owned: true,
      level: 1
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

    if (state.equipped.length >= 3) {
      alert('装備できるペットは最大3体です。先に外してください。');
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

    if (currentLevel >= 99) {
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

  function petImageHtml(pet, mode){
    if (!pet.implemented) {
      return `<div class="pet-lock-silhouette">🔒</div>`;
    }

    const src = mode === 'back' ? pet.backImage : pet.frontImage;

    if (src) {
      return `<img src="${src}" alt="${pet.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"><span class="pet-img-fallback">?</span>`;
    }

    return `<span class="pet-img-fallback">?</span>`;
  }

  function renderSlots(){
    const wrap = document.getElementById('petEquipSlots');
    if (!wrap) return;

    const state = loadState();
    wrap.innerHTML = '';

    for (let i = 0; i < 3; i++) {
      const key = state.equipped[i];
      const pet = getPet(key);

      const slot = document.createElement('button');
      slot.type = 'button';
      slot.className = pet ? 'pet-slot' : 'pet-slot empty';

      if (pet) {
        slot.innerHTML = `
          <span class="pet-slot-num">${i + 1}</span>
          ${petImageHtml(pet, 'front')}
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

    const state = loadState();
    layer.innerHTML = '';

    state.equipped.forEach(key => {
      const pet = getPet(key);
      if (!pet) return;

      const el = document.createElement('div');
      el.className = 'main-float-pet';
      el.innerHTML = petImageHtml(pet, 'front');
      layer.appendChild(el);
    });
  }

  function renderOwnedList(){
    const list = document.getElementById('petOwnedList');
    if (!list) return;

    const state = loadState();
    list.innerHTML = '';

    PET_MASTER.forEach(pet => {
      const owned = !!state.pets[pet.key]?.owned;
      const equipped = state.equipped.includes(pet.key);
      const level = getLevel(pet.key);
      const unlockOk = canUnlock(pet);
      const nextCost = level >= 99 ? 0 : upgradeCost(level);

      const card = document.createElement('div');
      card.className =
        'pet-card' +
        (equipped ? ' equipped' : '') +
        (!pet.implemented ? ' locked' : '') +
        (!unlockOk ? ' rank-locked' : '');

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
        mainButtonText = '装備';
      }

      card.innerHTML = `
        <div class="pet-card-icon">${petImageHtml(pet, 'front')}</div>

        <div class="pet-card-body">
          <div class="pet-card-name">
            ${pet.name}
            <span>Lv${level}</span>
          </div>

          <div class="pet-card-desc">${pet.role} / ${pet.unlock}</div>

          <div class="pet-card-price">
            ${pet.implemented ? `購入 ${pet.price.toLocaleString()} COIN` : '今後追加予定'}
          </div>

          <div class="pet-card-spec">
            ${owned ? '所持中' : '未所持'} ${equipped ? '/ 装備中' : ''}
          </div>

          <div class="pet-card-spec">
            ${pet.implemented ? `通常攻撃 ${Math.round(pet.normalAttackRate * 100)}% / 連射 ${Math.round(pet.normalRateRate * 100)}%` : 'シルエット表示'}
          </div>

          <div class="pet-card-spec">
            ${pet.implemented ? `スキル: ${pet.skillName} / CT${pet.skillCt}秒 / 初回${pet.firstCt}秒` : '🔒'}
          </div>

          <div class="pet-card-spec">
            ${pet.implemented ? pet.growthText : '未実装ペット'}
          </div>
        </div>

        <div class="pet-card-actions">
          <button type="button" class="pet-card-btn ${equipped ? 'equipped' : ''}" ${mainButtonDisabled ? 'disabled' : ''}>
            ${mainButtonText}
          </button>

          <button type="button" class="pet-upgrade-btn" ${(!owned || level >= 99 || !pet.implemented) ? 'disabled' : ''}>
            強化<br>${level >= 99 ? 'MAX' : nextCost.toLocaleString()}
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

      if (upgradeBtn && owned && level < 99 && pet.implemented) {
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
      .map((key, index) => {
        const pet = getPet(key);
        if (!pet || !pet.implemented) return null;

        const level = getLevel(key);

        return Object.assign({}, pet, {
          slotIndex: index,
          level
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
    PET_MASTER
  };
})();
