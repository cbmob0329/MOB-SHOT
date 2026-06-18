'use strict';

(function(){
  const S = window.MobShotGameSkillsShared = window.MobShotGameSkillsShared || {};

  const images = new Map();

  S.gameState = null;
  S.slots = [];
  S.skillBullets = [];
  S.skillEffects = [];
  S.inputReadyFrame = 0;
  S.frameCount = 0;

  const PRELOAD_IMAGES = [
    'skill/rocket barrage.png',
    'skill/energyrush.png',
    'skill/double missile.png',
    'skill/shadowclone.png',
    'skill/thunderbolt.png',
    'skill/arcane barrier.png',
    'skill/dark oblivion.png',
    'skill/blackhole.png',
    'skill/healingbreeze.png',
    'skill/rosepulse.png',
    'skill/goldrush.png',
    'skill/darkthunder.png',
    'skill/timemagic.png',
    'skill/lili.png',

    'skill/neonbomb.png',
    'skill/nepatk.png',
    'skill/mira.png',
    'skill/book.png',

    'atk/rocket.png',
    'atk/enetama.png',
    'atk/tuibi.png',
    'atk/kaminari.png',
    'atk/blackhole.png',
    'atk/atkriri.png',
    'atk/blackrai.png',
    'atk/rib.png',
    'atk/riy.png',
    'atk/riw.png',
    'atk/rir.png',

    'atk/hinotama.png',
    'atk/neonbomb.png',
    'atk/atknep.png',
    'atk/miraatk.png',
    'pet/pet hero2.png'
    'atk/atkmaoh.png',
  ];

  function img(src){
    if (!src) return null;

    if (!images.has(src)) {
      const image = new Image();
      image.src = src + '?v=skill_split_core_20260618_newskills';
      images.set(src, image);
    }

    return images.get(src);
  }

  function imageReady(image){
    return image && image.complete && image.naturalWidth > 0;
  }

  function preload(){
    PRELOAD_IMAGES.forEach(src => img(src));

    if (window.MobShotSkills && window.MobShotSkills.SKILL_MASTER) {
      window.MobShotSkills.SKILL_MASTER.forEach(skill => {
        img(skill.image);
        img(skill.bulletImage);
      });
    }
  }

  function init(state){
    S.gameState = state;
    S.skillBullets = [];
    S.skillEffects = [];
    S.slots = [];
    S.frameCount = 0;
    S.inputReadyFrame = performance.now() + 500;

    preload();

    if (!window.MobShotSkills || !window.MobShotSkills.getEquippedSkills) return;

    const equipped = window.MobShotSkills.getEquippedSkills();

    equipped.forEach((skill, index) => {
      S.slots.push({
        skill,
        slotIndex: index,
        cd: 0,
        maxCd: Math.floor(Number(skill.cooldown || 10) * 60),
        ready: true
      });
    });

    bindSkillButtons();
    updateHud();
  }

  function bindSkillButtons(){
    const hud = document.getElementById('skillHud');

    if (hud && !hud.__mobSkillInputBound) {
      hud.__mobSkillInputBound = true;

      hud.addEventListener('pointerdown', blockMoveInput, { passive:false });
      hud.addEventListener('touchstart', blockMoveInput, { passive:false });
      hud.addEventListener('click', blockMoveInput, { passive:false });
    }

    for (let i = 0; i < 3; i++) {
      const slotEl = document.getElementById(`skillSlot${i}`);

      if (!slotEl || slotEl.__mobSkillTapBound) continue;

      slotEl.__mobSkillTapBound = true;

      slotEl.addEventListener('pointerup', function(e){
        e.preventDefault();
        e.stopPropagation();

        if (performance.now() < S.inputReadyFrame) return;

        useSlot(i);
      }, { passive:false });
    }
  }

  function blockMoveInput(e){
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  function useSlot(index){
    const slot = S.slots[index];

    if (!slot || !slot.skill) return;
    if (slot.cd > 0) return;

    activate(slot);

    slot.cd = slot.maxCd;
    slot.ready = false;

    updateHud();
  }

  function activate(slot){
    const skill = slot.skill;
    const FX = S.FX;

    showSkillText(skill.name);

    if (!FX) return;

    if (skill.type === 'rocket') FX.fireRocket(skill);
    if (skill.type === 'energyRush') FX.fireEnergyRush(skill);
    if (skill.type === 'twinMissile') FX.fireTwinMissile(skill);
    if (skill.type === 'shadowClone') FX.startShadowClone(skill);
    if (skill.type === 'thunderbolt') FX.startThunderbolt(skill);
    if (skill.type === 'arcaneBarrier') FX.startArcaneBarrier(skill);
    if (skill.type === 'darkPower') FX.startDarkPower(skill);

    if (skill.type === 'blackHole') FX.startBlackHole(skill);
    if (skill.type === 'healingBreeze') FX.startHealingBreeze(skill);
    if (skill.type === 'rosePulse') FX.startRosePulse(skill);
    if (skill.type === 'goldRush') FX.startGoldRush(skill);
    if (skill.type === 'darkThunder') FX.fireDarkThunder(skill);
    if (skill.type === 'timeMagic') FX.startTimeMagic(skill);
    if (skill.type === 'lilithSisters') FX.startLilithSisters(skill);

    if (skill.type === 'neonBomb') FX.fireNeonBomb(skill);
    if (skill.type === 'neptuneAttack') FX.fireNeptuneAttack(skill);
    if (skill.type === 'miraPoison') FX.fireMiraPoison(skill);
    if (skill.type === 'bookHero') FX.startBookHero(skill);
  }

  function update(){
    if (!S.gameState) return;

    S.frameCount++;

    const FX = S.FX;

    if (FX) {
      FX.updateEffects();
      updateCooldowns();
      FX.updateBullets();
      FX.updateBarrierDamage();
      FX.updateBlackHole();
      FX.updateDots();
      FX.updateLilithSisters();

      if (FX.updateBookHero) FX.updateBookHero();
    } else {
      updateCooldowns();
    }

    updateHud();
  }

  function updateCooldowns(){
    S.slots.forEach(slot => {
      if (slot.cd > 0) {
        slot.cd--;
      }

      slot.ready = slot.cd <= 0;
    });
  }

  function showSkillText(text){
    if (!S.gameState) return;

    S.skillEffects.push({
      type: 'skillText',
      text,
      x: S.gameState.player.x,
      y: S.gameState.player.y - 85,
      timer: 42
    });
  }

  function basePlayerPower(){
    if (!S.gameState) return 1;
    return Number(S.gameState.power || 1);
  }

  function playerPower(){
    if (!S.gameState) return 1;

    let power = Number(S.gameState.power || 1);
    const dark = S.skillEffects.find(e => e.type === 'darkPower');

    if (dark) {
      power += Number(dark.attackAdd || 0);
    }

    return power;
  }

  function getWideBonus(){
    let bonus = 0;

    S.skillEffects.forEach(effect => {
      if (effect.type === 'shadowClone') {
        bonus += Number(effect.wideBonus || 0);
      }
    });

    return bonus;
  }

  function isInvincibleAgainst(entity){
    const hasBarrier = S.skillEffects.some(e => e.type === 'arcaneBarrier');

    if (hasBarrier) return true;

    const hasDark = S.skillEffects.some(e => e.type === 'darkPower');

    if (
      hasDark &&
      entity &&
      (
        entity.kind === 'boss' ||
        entity.kind === 'midBoss' ||
        entity.kind === 'enemyBullet' ||
        entity.fromBoss
      )
    ) {
      return true;
    }

    return false;
  }

  function isTimeStopped(){
    return S.skillEffects.some(e => e.type === 'timeMagic');
  }

  function coinMultiplier(){
    const gold = S.skillEffects.find(e => e.type === 'goldRush');
    return gold ? Number(gold.multiplier || 1.5) : 1;
  }

  function playerBulletScale(){
    return S.skillEffects.some(e => e.type === 'darkPower') ? 3 : 1;
  }

  function playerBulletDamageAdd(){
    return S.skillEffects.some(e => e.type === 'darkPower') ? 5 : 0;
  }

  function reduceCooldownAll(sec){
    const frames = Math.floor(Number(sec || 1) * 60);

    S.slots.forEach(slot => {
      slot.cd = Math.max(0, slot.cd - frames);
    });

    updateHud();
  }

  function fillAll(){
    S.slots.forEach(slot => {
      slot.cd = 0;
      slot.ready = true;
    });

    updateHud();
  }

  function updateHud(){
    for (let i = 0; i < 3; i++) {
      const slot = S.slots[i];
      const slotEl = document.getElementById(`skillSlot${i}`);
      const imgEl = document.getElementById(`skillSlotImg${i}`);
      const cdEl = document.getElementById(`skillCd${i}`);
      const ringEl = document.getElementById(`skillRing${i}`);

      if (!slotEl || !imgEl || !cdEl || !ringEl) continue;

      if (!slot || !slot.skill) {
        imgEl.style.display = 'none';
        imgEl.removeAttribute('src');
        cdEl.classList.remove('hidden');
        cdEl.textContent = '-';
        slotEl.classList.remove('ready');
        ringEl.style.setProperty('--skill-rate', '0%');
        continue;
      }

      imgEl.style.display = 'block';
      imgEl.src = slot.skill.image;

      const ready = slot.cd <= 0;
      const rate = slot.maxCd > 0
        ? Math.max(0, Math.min(1, 1 - (slot.cd / slot.maxCd)))
        : 1;

      ringEl.style.setProperty('--skill-rate', `${rate * 100}%`);

      if (ready) {
        cdEl.classList.remove('hidden');
        cdEl.textContent = 'READY';
        slotEl.classList.add('ready');
      } else {
        cdEl.classList.remove('hidden');
        cdEl.textContent = Math.ceil(slot.cd / 60);
        slotEl.classList.remove('ready');
      }
    }
  }

  function draw(ctx){
    if (!S.gameState) return;

    if (S.Draw && S.Draw.draw) {
      S.Draw.draw(ctx);
    }
  }

  S.img = img;
  S.imageReady = imageReady;
  S.showSkillText = showSkillText;
  S.basePlayerPower = basePlayerPower;
  S.playerPower = playerPower;

  window.MobShotGameSkills = {
    init,
    update,
    draw,
    getWideBonus,
    isInvincibleAgainst,
    isTimeStopped,
    coinMultiplier,
    playerBulletScale,
    playerBulletDamageAdd,
    reduceCooldownAll,
    fillAll
  };
})();
