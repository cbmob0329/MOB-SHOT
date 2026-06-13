'use strict';

(function(){
  const images = new Map();

  let gameState = null;
  let slots = [];
  let skillBullets = [];
  let skillEffects = [];
  let inputReadyFrame = 0;
  let frameCount = 0;

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
    'atk/rir.png'
  ];

  function img(src){
    if (!src) return null;

    if (!images.has(src)) {
      const image = new Image();
      image.src = src + '?v=skill_fix_20260613';
      images.set(src, image);
    }

    return images.get(src);
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

  function imageReady(image){
    return image && image.complete && image.naturalWidth > 0;
  }

  function init(state){
    gameState = state;
    skillBullets.length = 0;
    skillEffects.length = 0;
    slots.length = 0;
    frameCount = 0;
    inputReadyFrame = performance.now() + 500;

    preload();

    if (!window.MobShotSkills || !window.MobShotSkills.getEquippedSkills) return;

    const equipped = window.MobShotSkills.getEquippedSkills();

    equipped.forEach((skill, index) => {
      slots.push({
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

        if (performance.now() < inputReadyFrame) return;

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
    const slot = slots[index];

    if (!slot || !slot.skill) return;
    if (slot.cd > 0) return;

    activate(slot);

    slot.cd = slot.maxCd;
    slot.ready = false;

    updateHud();
  }

  function activate(slot){
    const skill = slot.skill;

    showSkillText(skill.name);

    if (skill.type === 'rocket') fireRocket(skill);
    if (skill.type === 'energyRush') fireEnergyRush(skill);
    if (skill.type === 'twinMissile') fireTwinMissile(skill);
    if (skill.type === 'shadowClone') startShadowClone(skill);
    if (skill.type === 'thunderbolt') startThunderbolt(skill);
    if (skill.type === 'arcaneBarrier') startArcaneBarrier(skill);
    if (skill.type === 'darkPower') startDarkPower(skill);

    if (skill.type === 'blackHole') startBlackHole(skill);
    if (skill.type === 'healingBreeze') startHealingBreeze(skill);
    if (skill.type === 'rosePulse') startRosePulse(skill);
    if (skill.type === 'goldRush') startGoldRush(skill);
    if (skill.type === 'darkThunder') fireDarkThunder(skill);
    if (skill.type === 'timeMagic') startTimeMagic(skill);
    if (skill.type === 'lilithSisters') startLilithSisters(skill);
  }

  function update(){
    if (!gameState) return;

    frameCount++;

    updateEffects();
    updateCooldowns();
    updateBullets();
    updateBarrierDamage();
    updateBlackHole();
    updateDots();
    updateLilithSisters();
    updateHud();
  }

  function updateCooldowns(){
    slots.forEach(slot => {
      if (slot.cd > 0) slot.cd--;
      slot.ready = slot.cd <= 0;
    });
  }

  function showSkillText(text){
    skillEffects.push({
      type: 'skillText',
      text,
      x: gameState.player.x,
      y: gameState.player.y - 85,
      timer: 42
    });
  }

  function playerPower(){
    if (!gameState) return 1;

    let power = Number(gameState.power || 1);
    const dark = skillEffects.find(e => e.type === 'darkPower');

    if (dark) {
      power += Number(dark.attackAdd || 0);
    }

    return power;
  }

  function basePlayerPower(){
    if (!gameState) return 1;
    return Number(gameState.power || 1);
  }

  function plusDamage(skill){
    return Number(skill.plus || 0);
  }

  function damageEntity(entity, damage){
    if (!entity || entity.dead) return;

    entity.hp = Number(entity.hp || 0) - Number(damage || 0);

    if (entity.hp <= 0 && !entity.__rewarded) {
      if (window.MobShotGameCore && window.MobShotGameCore.killEntity) {
        window.MobShotGameCore.killEntity(entity);
      } else {
        entity.dead = true;
      }
    }
  }

  function getTargets(){
    if (!gameState) return [];

    return gameState.entities.filter(e =>
      !e.dead &&
      e.kind !== 'gate' &&
      e.kind !== 'enemyBullet'
    );
  }

  function findStrongestTarget(){
    let target = null;
    let bestHp = -1;

    getTargets().forEach(e => {
      const hp = Number(e.hp || 0);

      if (hp > bestHp) {
        bestHp = hp;
        target = e;
      }
    });

    return target;
  }

  function fireRocket(skill){
    const count = Math.max(1, Number(skill.count || 1));

    for (let i = 0; i < count; i++) {
      skillBullets.push({
        type: 'rocket',
        skill,
        x: gameState.player.x + (i - (count - 1) / 2) * 32,
        y: gameState.player.y - 38 - i * 20,
        vx: 0,
        vy: -5.2,
        r: 22,
        smokeTick: 0,
        dead: false
      });
    }
  }

  function fireEnergyRush(skill){
    const count = Math.max(1, Number(skill.count || 10));

    skillEffects.push({
      type: 'muzzleFlash',
      x: gameState.player.x,
      y: gameState.player.y - 45,
      timer: 16
    });

    for (let i = 0; i < count; i++) {
      const dir = Math.floor(Math.random() * 3);
      let vx = 0;
      let vy = -6.2;

      if (dir === 1) {
        vx = -2.3;
        vy = -5.8;
      }

      if (dir === 2) {
        vx = 2.3;
        vy = -5.8;
      }

      skillBullets.push({
        type: 'energyRush',
        skill,
        x: gameState.player.x + Math.random() * 16 - 8,
        y: gameState.player.y - 38,
        vx,
        vy,
        r: 15,
        delay: i * 3,
        dead: false
      });
    }
  }

  function fireTwinMissile(skill){
    const count = Math.max(1, Number(skill.count || 2));

    for (let i = 0; i < count; i++) {
      const side = i % 2 === 0 ? -1 : 1;

      skillBullets.push({
        type: 'twinMissile',
        skill,
        x: gameState.player.x + side * 18,
        y: gameState.player.y - 24,
        vx: side * 4.8,
        vy: -3.2,
        r: 14,
        openTimer: 24,
        target: findStrongestTarget(),
        smokeTick: 0,
        dead: false
      });
    }
  }

  function startShadowClone(skill){
    skillEffects.push({
      type: 'shadowClone',
      skill,
      timer: Math.floor(Number(skill.duration || 5) * 60),
      wideBonus: Number(skill.wideBonus || 3),
      clonePowerRate: Number(skill.clonePowerRate || 0.5),
      cloneCount: Number(skill.cloneCount || 2),
      shotCd: 0
    });
  }

  function startThunderbolt(skill){
    skillEffects.push({
      type: 'thunderbolt',
      skill,
      timer: Math.floor(Number(skill.duration || 5) * 60),
      tick: 0
    });
  }

  function startArcaneBarrier(skill){
    skillEffects.push({
      type: 'arcaneBarrier',
      skill,
      timer: Math.floor(Number(skill.duration || 5) * 60),
      damage: Number(skill.barrierDamage || 0),
      hitCd: 0,
      rot: 0,
      rot2: 0,
      rot3: 0
    });
  }

  function startDarkPower(skill){
    skillEffects.push({
      type: 'darkPower',
      skill,
      timer: Math.floor(Number(skill.duration || 5) * 60),
      attackAdd: Number(skill.darkPowerAttackAdd || 5),
      ghostTick: 0
    });

    skillEffects.push({
      type: 'darkBurst',
      x: gameState.player.x,
      y: gameState.player.y,
      timer: 36
    });
  }

  function startBlackHole(skill){
    const x = gameState.player.x;
    const y = Math.max(92, window.innerHeight * 0.18);

    skillEffects.push({
      type: 'blackHole',
      skill,
      x,
      y,
      timer: Math.floor(Number(skill.duration || 3) * 60),
      total: Math.floor(Number(skill.duration || 3) * 60),
      range: Number(skill.blackHoleRange || 250),
      power: Number(skill.blackHolePower || 0.065),
      damageTick: 30,
      rot: 0
    });
  }

  function startHealingBreeze(skill){
    const amount = Math.ceil(Number(skill.healAmount || 100));

    gameState.hp = Math.min(gameState.maxHp, Number(gameState.hp || 0) + amount);

    skillEffects.push({
      type: 'healBreeze',
      x: gameState.player.x,
      y: gameState.player.y,
      amount,
      timer: 70,
      leaves: makeLeaves(gameState.player.x, gameState.player.y, 18)
    });

    skillEffects.push({
      type: 'healNumber',
      text: `+${amount}`,
      x: gameState.player.x,
      y: gameState.player.y - 70,
      timer: 56
    });
  }

  function makeLeaves(x, y, count){
    const leaves = [];

    for (let i = 0; i < count; i++) {
      leaves.push({
        x: x + Math.random() * 80 - 40,
        y: y + Math.random() * 80 - 40,
        vx: Math.random() * 2 - 1,
        vy: -1.4 - Math.random() * 1.2,
        rot: Math.random() * Math.PI * 2,
        sp: Math.random() * 0.12 + 0.04
      });
    }

    return leaves;
  }

  function startRosePulse(skill){
    skillEffects.push({
      type: 'rosePulse',
      skill,
      timer: Math.floor(Number(skill.duration || 5) * 60),
      tick: 0
    });
  }

  function startGoldRush(skill){
    skillEffects.push({
      type: 'goldRushBurst',
      timer: 60,
      coins: makeGoldBurstCoins()
    });

    skillEffects.push({
      type: 'goldRush',
      skill,
      timer: Math.floor(Number(skill.duration || 10) * 60),
      multiplier: Number(skill.coinMultiplier || 1.5)
    });
  }

  function makeGoldBurstCoins(){
    const coins = [];

    for (let i = 0; i < 24; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 2.5 + Math.random() * 4;

      coins.push({
        x: gameState.player.x,
        y: gameState.player.y - 30,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 2,
        rot: Math.random() * Math.PI * 2
      });
    }

    return coins;
  }

  function fireDarkThunder(skill){
    const count = Math.max(5, Number(skill.count || 5));
    const spread = Math.PI * 0.72;
    const base = -Math.PI / 2;

    for (let i = 0; i < count; i++) {
      const angle = base + (i - (count - 1) / 2) * (spread / Math.max(1, count - 1));

      skillBullets.push({
        type: 'darkThunder',
        skill,
        x: gameState.player.x,
        y: gameState.player.y - 34,
        vx: Math.cos(angle) * 7.2,
        vy: Math.sin(angle) * 7.2,
        r: 16,
        dead: false
      });
    }

    skillEffects.push({
      type: 'darkThunderFlash',
      x: gameState.player.x,
      y: gameState.player.y - 40,
      timer: 20
    });
  }

  function startTimeMagic(skill){
    skillEffects.push({
      type: 'timeMagic',
      skill,
      timer: Math.floor(Number(skill.duration || 3) * 60),
      total: Math.floor(Number(skill.duration || 3) * 60)
    });
  }

  function startLilithSisters(skill){
    const duration = Math.floor(Number(skill.duration || 5) * 60);
    const p = gameState.player;

    const sisters = [
      { id:'blue', image:'atk/rib.png', x:p.x - 78, y:p.y - 70, shotCd:30 },
      { id:'yellow', image:'atk/riy.png', x:p.x + 78, y:p.y - 70, shotCd:20 },
      { id:'white', image:'atk/riw.png', x:p.x - 40, y:p.y + 20, healCd:0 },
      { id:'red', image:'atk/rir.png', x:p.x + 40, y:p.y + 20, shotCd:45 }
    ];

    skillEffects.push({
      type: 'lilithSisters',
      skill,
      timer: duration,
      sisters,
      powerRate: Number((skill.powerRate && skill.powerRate.sisters) || 1),
      redRate: Number((skill.powerRate && skill.powerRate.red) || 1.01),
      whiteHeal: Number(skill.whiteHeal || 5)
    });
  }

  function updateEffects(){
    for (const effect of skillEffects) {
      effect.timer--;

      if (effect.type === 'thunderbolt') {
        effect.tick--;

        if (effect.tick <= 0) {
          effect.tick = 18;
          createThunder(effect.skill);
        }
      }

      if (effect.type === 'arcaneBarrier') {
        effect.hitCd--;
        effect.rot += 0.08;
        effect.rot2 -= 0.055;
        effect.rot3 += 0.16;
      }

      if (effect.type === 'darkPower') {
        effect.ghostTick--;

        if (effect.ghostTick <= 0) {
          effect.ghostTick = 5;
          skillEffects.push({
            type: 'darkAfterImage',
            x: gameState.player.x,
            y: gameState.player.y,
            timer: 24
          });
        }
      }

      if (effect.type === 'rosePulse') {
        effect.tick--;

        if (effect.tick <= 0) {
          effect.tick = 7;
          fireRoseBullet(effect.skill);
        }
      }

      if (effect.type === 'goldRushBurst') {
        effect.coins.forEach(c => {
          c.x += c.vx;
          c.y += c.vy;
          c.vy += 0.15;
          c.rot += 0.18;
        });
      }

      if (effect.type === 'healBreeze') {
        effect.leaves.forEach(l => {
          l.x += l.vx;
          l.y += l.vy;
          l.rot += l.sp;
        });
      }

      if (effect.type === 'blackHole' && effect.timer <= 1) {
        getTargets().forEach(e => {
          delete e.__blackHolePull;
        });
      }
    }

    skillEffects = skillEffects.filter(effect => effect.timer > 0);
  }

  function updateBullets(){
    for (const bullet of skillBullets) {
      if (bullet.dead) continue;

      if (bullet.delay && bullet.delay > 0) {
        bullet.delay--;
        continue;
      }

      if (bullet.type === 'twinMissile') {
        updateMissile(bullet);
      } else {
        bullet.x += bullet.vx;
        bullet.y += bullet.vy;
      }

      if (bullet.type === 'rocket' || bullet.type === 'twinMissile') {
        bullet.smokeTick--;

        if (bullet.smokeTick <= 0) {
          bullet.smokeTick = 5;

          skillEffects.push({
            type: 'smoke',
            x: bullet.x,
            y: bullet.y + 12,
            radius: bullet.type === 'rocket' ? 18 : 10,
            timer: 20
          });
        }
      }

      checkBulletHit(bullet);

      if (
        bullet.y < -180 ||
        bullet.y > window.innerHeight + 180 ||
        bullet.x < -180 ||
        bullet.x > window.innerWidth + 180
      ) {
        bullet.dead = true;
      }
    }

    skillBullets = skillBullets.filter(b => !b.dead);
  }

  function updateMissile(bullet){
    if (bullet.openTimer > 0) {
      bullet.openTimer--;
      bullet.y += bullet.vy;
      bullet.x += bullet.vx;
      return;
    }

    if (!bullet.target || bullet.target.dead) {
      bullet.target = findStrongestTarget();
    }

    if (bullet.target) {
      const dx = bullet.target.x - bullet.x;
      const dy = bullet.target.y - bullet.y;
      const d = Math.max(1, Math.hypot(dx, dy));

      bullet.vx += (dx / d) * 0.26;
      bullet.vy += (dy / d) * 0.26;

      const sp = Math.hypot(bullet.vx, bullet.vy);
      const maxSp = 5.4;

      if (sp > maxSp) {
        bullet.vx = bullet.vx / sp * maxSp;
        bullet.vy = bullet.vy / sp * maxSp;
      }
    }

    bullet.x += bullet.vx;
    bullet.y += bullet.vy;
  }

  function checkBulletHit(bullet){
    for (const e of gameState.entities) {
      if (
        e.dead ||
        e.kind === 'gate' ||
        e.kind === 'enemyBullet'
      ) {
        continue;
      }

      const hit = e.r
        ? Math.hypot(bullet.x - e.x, bullet.y - e.y) < e.r + bullet.r
        : Math.abs(bullet.x - e.x) < e.w / 2 + bullet.r &&
          Math.abs(bullet.y - e.y) < e.h / 2 + bullet.r;

      if (!hit) continue;

      if (bullet.type === 'rocket') {
        damageEntity(e, playerPower() * bullet.skill.powerRate.bullet + plusDamage(bullet.skill));
        explode(bullet.x, bullet.y, bullet.skill);
      }

      if (bullet.type === 'energyRush') {
        damageEntity(e, playerPower() * bullet.skill.powerRate.bullet + plusDamage(bullet.skill));
        skillEffects.push({ type:'energyHit', x:bullet.x, y:bullet.y, timer:10 });
      }

      if (bullet.type === 'twinMissile') {
        damageEntity(e, playerPower() * bullet.skill.powerRate.bullet + plusDamage(bullet.skill));
        smallExplode(bullet.x, bullet.y, bullet.skill);
      }

      if (bullet.type === 'shadowCloneShot') {
        damageEntity(e, playerPower() * Number(bullet.powerRate || 0.5));
        skillEffects.push({ type:'energyHit', x:bullet.x, y:bullet.y, timer:10 });
      }

      if (bullet.type === 'rosePulse') {
        damageEntity(e, playerPower() * Number((bullet.skill.powerRate && bullet.skill.powerRate.rose) || 5) + plusDamage(bullet.skill));
        skillEffects.push({ type:'roseHit', x:bullet.x, y:bullet.y, timer:16 });
      }

      if (bullet.type === 'darkThunder') {
        damageEntity(e, playerPower() * Number((bullet.skill.powerRate && bullet.skill.powerRate.darkThunder) || 3) + plusDamage(bullet.skill));
        addDarkDot(e, bullet.skill);
        skillEffects.push({ type:'darkThunderHit', x:bullet.x, y:bullet.y, timer:18 });
      }

      if (bullet.type === 'sisterBlue' || bullet.type === 'sisterYellow') {
        damageEntity(e, basePlayerPower() * Number(bullet.powerRate || 1));
      }

      if (bullet.type === 'sisterRed') {
        damageEntity(e, (basePlayerPower() + 1) * Number(bullet.powerRate || 1.01));
        smallExplode(bullet.x, bullet.y, bullet.skill);
      }

      bullet.dead = true;
      break;
    }
  }

  function explode(x, y, skill){
    const radius = Math.min(window.innerWidth, window.innerHeight) * 0.55;

    skillEffects.push({ type:'explosion', x, y, radius, timer:32 });
    skillEffects.push({ type:'boomText', text:'BOOM!!', x, y:y - 20, timer:34 });

    getTargets().forEach(e => {
      if (Math.hypot(e.x - x, e.y - y) <= radius) {
        damageEntity(e, playerPower() * skill.powerRate.explosion + plusDamage(skill));
      }
    });
  }

  function smallExplode(x, y, skill){
    const radius = 88;

    skillEffects.push({ type:'smallExplosion', x, y, radius, timer:18 });

    getTargets().forEach(e => {
      if (Math.hypot(e.x - x, e.y - y) <= radius) {
        damageEntity(e, playerPower() * 0.8 + plusDamage(skill));
      }
    });
  }

  function createThunder(skill){
    const targets = getTargets();

    if (!targets.length) return;

    const target = targets[Math.floor(Math.random() * targets.length)];
    const startY = -60;

    skillEffects.push({
      type: 'thunderFall',
      skill,
      image: skill.bulletImage,
      x: target.x,
      y: startY,
      targetY: target.y,
      timer: 18,
      total: 18,
      target,
      impacted: false
    });
  }

  function thunderImpact(effect){
    if (effect.impacted) return;

    effect.impacted = true;

    const target = effect.target;

    skillEffects.push({
      type: 'thunderImpact',
      image: effect.image,
      x: effect.x,
      y: effect.targetY,
      timer: 30
    });

    if (target && !target.dead) {
      damageEntity(target, playerPower() * effect.skill.powerRate.thunder + plusDamage(effect.skill));
    }
  }

  function fireRoseBullet(skill){
    const side = Math.floor(Math.random() * 4);
    let x = 0;
    let y = 0;

    if (side === 0) {
      x = Math.random() * window.innerWidth;
      y = -50;
    }

    if (side === 1) {
      x = Math.random() * window.innerWidth;
      y = window.innerHeight + 50;
    }

    if (side === 2) {
      x = -50;
      y = Math.random() * window.innerHeight * 0.75;
    }

    if (side === 3) {
      x = window.innerWidth + 50;
      y = Math.random() * window.innerHeight * 0.75;
    }

    const target = findStrongestTarget() || { x: gameState.player.x, y: gameState.player.y - 300 };
    const tx = target.x + Math.random() * 80 - 40;
    const ty = target.y + Math.random() * 80 - 40;

    const dx = tx - x;
    const dy = ty - y;
    const len = Math.max(1, Math.hypot(dx, dy));
    const speed = 5.2;

    skillBullets.push({
      type: 'rosePulse',
      skill,
      x,
      y,
      vx: dx / len * speed,
      vy: dy / len * speed,
      r: 24,
      dead: false
    });
  }

  function addDarkDot(entity, skill){
    entity.__darkDot = {
      timer: 10 * 60,
      tick: 30,
      damage: basePlayerPower() * Number((skill.powerRate && skill.powerRate.dot) || 0.5),
      image: 'atk/blackrai.png',
      spark: 0
    };
  }

  function updateDots(){
    gameState.entities.forEach(e => {
      if (!e.__darkDot || e.dead) return;

      e.__darkDot.timer--;
      e.__darkDot.tick--;
      e.__darkDot.spark--;

      if (e.__darkDot.spark <= 0) {
        e.__darkDot.spark = 8;
        skillEffects.push({
          type: 'darkSpark',
          x: e.x,
          y: e.y,
          timer: 10
        });
      }

      if (e.__darkDot.tick <= 0) {
        e.__darkDot.tick = 30;
        damageEntity(e, e.__darkDot.damage);

        skillEffects.push({
          type: 'dotHit',
          x: e.x,
          y: e.y,
          timer: 12
        });
      }

      if (e.__darkDot.timer <= 0) {
        e.__darkDot = null;
      }
    });
  }

  function updateBarrierDamage(){
    const barrier = skillEffects.find(e => e.type === 'arcaneBarrier');

    if (!barrier || barrier.damage <= 0 || barrier.hitCd > 0) return;

    barrier.hitCd = 18;

    const p = gameState.player;
    const radius = 72;

    getTargets().forEach(e => {
      if (Math.hypot(e.x - p.x, e.y - p.y) <= radius + (e.r || 28)) {
        damageEntity(e, barrier.damage);
      }
    });
  }

  function updateBlackHole(){
    const hole = skillEffects.find(e => e.type === 'blackHole');

    if (!hole) return;

    hole.rot += 0.18;
    hole.damageTick--;

    if (hole.damageTick <= 0) {
      hole.damageTick = 30;

      getTargets().forEach(e => {
        const dist = Math.hypot(e.x - hole.x, e.y - hole.y);

        if (dist <= hole.range) {
          damageEntity(e, 1);
          skillEffects.push({
            type: 'blackHoleDamage',
            x: e.x,
            y: e.y,
            timer: 18
          });
        }
      });
    }

    getTargets().forEach(e => {
      const dx = hole.x - e.x;
      const dy = hole.y - e.y;
      const dist = Math.max(1, Math.hypot(dx, dy));

      if (dist > hole.range) {
        delete e.__blackHolePull;
        return;
      }

      const pull = hole.power * (1 - dist / hole.range);
      const shake = Math.sin(frameCount * 1.8 + e.x) * 3;

      e.__blackHolePull = true;
      e.x += dx * pull + shake;
      e.y += dy * pull + Math.cos(frameCount * 1.6 + e.y) * 2;
    });
  }

  function updateLilithSisters(){
    const effect = skillEffects.find(e => e.type === 'lilithSisters');

    if (!effect) return;

    const p = gameState.player;

    effect.sisters.forEach((s, i) => {
      const targetX = p.x + [-86, 86, -45, 45][i];
      const targetY = p.y + [-76, -76, 20, 20][i] + Math.sin(frameCount * 0.08 + i) * 22;

      s.x += (targetX - s.x) * 0.055 + Math.sin(frameCount * 0.1 + i) * 1.4;
      s.y += (targetY - s.y) * 0.055 + Math.cos(frameCount * 0.09 + i) * 1.0;

      if (s.id === 'blue') {
        s.shotCd--;

        if (s.shotCd <= 0) {
          s.shotCd = 45;
          fireSisterBlue(effect, s);
        }
      }

      if (s.id === 'yellow') {
        s.shotCd--;

        if (s.shotCd <= 0) {
          s.shotCd = 18;
          fireSisterYellow(effect, s);
        }
      }

      if (s.id === 'white') {
        s.healCd--;

        if (s.healCd <= 0) {
          s.healCd = 30;
          gameState.hp = Math.min(gameState.maxHp, Number(gameState.hp || 0) + Number(effect.whiteHeal || 5));
          skillEffects.push({ type:'whiteHealMini', x:s.x, y:s.y, timer:16 });
        }
      }

      if (s.id === 'red') {
        s.shotCd--;

        if (s.shotCd <= 0) {
          s.shotCd = 60;
          fireSisterRed(effect, s);
        }
      }
    });
  }

  function fireSisterBlue(effect, s){
    const angles = [-Math.PI / 2 - 0.18, -Math.PI / 2, -Math.PI / 2 + 0.18];

    angles.forEach(a => {
      skillBullets.push({
        type:'sisterBlue',
        skill:effect.skill,
        image:'atk/atkriri.png',
        x:s.x,
        y:s.y,
        vx:Math.cos(a) * 6.4,
        vy:Math.sin(a) * 6.4,
        r:10,
        powerRate:effect.powerRate,
        dead:false
      });
    });
  }

  function fireSisterYellow(effect, s){
    const a = -Math.PI / 2 + (Math.random() * 1.4 - 0.7);

    skillBullets.push({
      type:'sisterYellow',
      skill:effect.skill,
      image:'atk/atkriri.png',
      x:s.x,
      y:s.y,
      vx:Math.cos(a) * 6.2,
      vy:Math.sin(a) * 6.2,
      r:9,
      powerRate:effect.powerRate,
      dead:false
    });
  }

  function fireSisterRed(effect, s){
    const target = findStrongestTarget();
    let angle = -Math.PI / 2;

    if (target) {
      angle = Math.atan2(target.y - s.y, target.x - s.x);
    }

    skillBullets.push({
      type:'sisterRed',
      skill:effect.skill,
      image:'atk/atkriri.png',
      x:s.x,
      y:s.y,
      vx:Math.cos(angle) * 5.4,
      vy:Math.sin(angle) * 5.4,
      r:22,
      powerRate:effect.redRate,
      dead:false
    });
  }

  function getWideBonus(){
    let bonus = 0;

    skillEffects.forEach(effect => {
      if (effect.type === 'shadowClone') {
        bonus += Number(effect.wideBonus || 0);
      }
    });

    return bonus;
  }

  function isInvincibleAgainst(entity){
    const hasBarrier = skillEffects.some(e => e.type === 'arcaneBarrier');

    if (hasBarrier) return true;

    const hasDark = skillEffects.some(e => e.type === 'darkPower');

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
    return skillEffects.some(e => e.type === 'timeMagic');
  }

  function coinMultiplier(){
    const gold = skillEffects.find(e => e.type === 'goldRush');
    return gold ? Number(gold.multiplier || 1.5) : 1;
  }

  function reduceCooldownAll(sec){
    const frames = Math.floor(Number(sec || 1) * 60);

    slots.forEach(slot => {
      slot.cd = Math.max(0, slot.cd - frames);
    });

    updateHud();
  }

  function fillAll(){
    slots.forEach(slot => {
      slot.cd = 0;
      slot.ready = true;
    });

    updateHud();
  }

  function updateHud(){
    for (let i = 0; i < 3; i++) {
      const slot = slots[i];
      const slotEl = document.getElementById(`skillSlot${i}`);
      const imgEl = document.getElementById(`skillSlotImg${i}`);
      const cdEl = document.getElementById(`skillCd${i}`);
      const ringEl = document.getElementById(`skillRing${i}`);

      if (!slotEl || !imgEl || !cdEl || !ringEl) continue;

      if (!slot || !slot.skill) {
        imgEl.style.display = 'none';
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
    if (!gameState) return;

    for (const bullet of skillBullets) {
      if (bullet.delay && bullet.delay > 0) continue;
      drawSkillBullet(ctx, bullet);
    }

    drawDarkThunderStuck(ctx);
    drawEffects(ctx);
  }

  function drawSkillBullet(ctx, bullet){
    let image = img(bullet.skill && bullet.skill.bulletImage);

    if (
      bullet.type === 'sisterBlue' ||
      bullet.type === 'sisterYellow' ||
      bullet.type === 'sisterRed'
    ) {
      image = img('atk/atkriri.png');
    }

    let size = 34;

    if (bullet.type === 'rocket') size = 54;
    if (bullet.type === 'twinMissile') size = 34;
    if (bullet.type === 'rosePulse') size = 58;
    if (bullet.type === 'darkThunder') size = 44;
    if (bullet.type === 'sisterRed') size = 38;
    if (bullet.type === 'sisterBlue' || bullet.type === 'sisterYellow') size = 28;

    if (imageReady(image)) {
      ctx.save();

      if (bullet.type === 'rosePulse') {
        ctx.translate(bullet.x, bullet.y);
        ctx.scale(1, -1);
        ctx.drawImage(image, -size / 2, -size / 2, size, size);
      } else {
        ctx.drawImage(image, bullet.x - size / 2, bullet.y - size / 2, size, size);
      }

      ctx.restore();
    } else {
      ctx.fillStyle =
        bullet.type === 'rocket' ? '#ff6b22' :
        bullet.type === 'rosePulse' ? '#ff7ab8' :
        bullet.type === 'darkThunder' ? '#30003f' :
        '#9deeff';

      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, bullet.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawDarkThunderStuck(ctx){
    if (!gameState) return;

    gameState.entities.forEach(e => {
      if (!e.__darkDot || e.dead) return;

      const image = img('atk/blackrai.png');
      const size = 38 + Math.sin(frameCount * 0.5) * 4;

      ctx.save();

      if (imageReady(image)) {
        ctx.drawImage(image, e.x - size / 2, e.y - size / 2, size, size);
      } else {
        ctx.strokeStyle = '#b45cff';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(e.x, e.y - 24);
        ctx.lineTo(e.x - 10, e.y);
        ctx.lineTo(e.x + 12, e.y - 4);
        ctx.lineTo(e.x, e.y + 24);
        ctx.stroke();
      }

      ctx.restore();
    });
  }

  function drawEffects(ctx){
    const p = gameState.player;

    skillEffects.forEach(effect => {
      if (effect.type === 'timeMagic') {
        const alpha = Math.min(0.78, 0.35 + (effect.timer / effect.total) * 0.25);

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
        ctx.globalAlpha = 0.22;
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
        ctx.restore();
      }

      if (effect.type === 'blackHole') {
        const image = img(effect.skill.bulletImage);
        const size = 132 + Math.sin(frameCount * 0.25) * 8;

        ctx.save();
        ctx.translate(effect.x, effect.y);
        ctx.rotate(effect.rot || 0);

        if (imageReady(image)) {
          ctx.drawImage(image, -size / 2, -size / 2, size, size);
        } else {
          ctx.fillStyle = '#050009';
          ctx.beginPath();
          ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#b45cff';
          ctx.lineWidth = 8;
          ctx.beginPath();
          ctx.arc(0, 0, size * 0.38, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.restore();
      }

      if (effect.type === 'blackHoleDamage') {
        const alpha = effect.timer / 18;

        ctx.globalAlpha = alpha;
        ctx.font = '900 18px system-ui';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 5;
        ctx.strokeText('-1', effect.x, effect.y - (1 - alpha) * 20);
        ctx.fillText('-1', effect.x, effect.y - (1 - alpha) * 20);
        ctx.globalAlpha = 1;
      }

      if (effect.type === 'smoke') {
        const alpha = Math.max(0, effect.timer / 20);
        ctx.globalAlpha = alpha * 0.38;
        ctx.fillStyle = '#777';
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.radius * (1.2 - alpha * .2), 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      if (effect.type === 'muzzleFlash') {
        const alpha = effect.timer / 16;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#9deeff';
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, 34 * alpha, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      if (
        effect.type === 'energyHit' ||
        effect.type === 'roseHit' ||
        effect.type === 'darkThunderHit' ||
        effect.type === 'dotHit'
      ) {
        const alpha = effect.timer / 18;

        ctx.globalAlpha = alpha;
        ctx.fillStyle =
          effect.type === 'roseHit' ? '#ff8cff' :
          effect.type === 'darkThunderHit' || effect.type === 'dotHit' ? '#b45cff' :
          '#9deeff';

        ctx.beginPath();
        ctx.arc(effect.x, effect.y, 34 * (1 - alpha + .25), 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      if (effect.type === 'darkSpark') {
        const alpha = effect.timer / 10;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = '#c04fff';
        ctx.lineWidth = 3;

        for (let i = 0; i < 5; i++) {
          const a = (Math.PI * 2 / 5) * i + frameCount * 0.35;
          ctx.beginPath();
          ctx.moveTo(effect.x, effect.y);
          ctx.lineTo(
            effect.x + Math.cos(a) * 24,
            effect.y + Math.sin(a) * 24
          );
          ctx.stroke();
        }

        ctx.restore();
      }

      if (effect.type === 'explosion') {
        const alpha = Math.max(0, effect.timer / 32);
        const grow = 1 - alpha;

        ctx.globalAlpha = alpha * 0.25;
        ctx.fillStyle = '#ff3b00';
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.radius * (.65 + grow * .25), 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = alpha * 0.42;
        ctx.fillStyle = '#ffb02e';
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.radius * (.42 + grow * .18), 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = alpha * 0.70;
        ctx.fillStyle = '#fff6a8';
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.radius * (.18 + grow * .08), 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = alpha;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.radius * (.25 + grow * .65), 0, Math.PI * 2);
        ctx.stroke();

        ctx.globalAlpha = 1;
      }

      if (effect.type === 'smallExplosion') {
        const alpha = effect.timer / 18;

        ctx.globalAlpha = alpha * 0.75;
        ctx.fillStyle = '#ffb02e';
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.radius * (1 - alpha * .25), 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = alpha;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.radius * (1 - alpha * .5), 0, Math.PI * 2);
        ctx.stroke();

        ctx.globalAlpha = 1;
      }

      if (effect.type === 'boomText' || effect.type === 'skillText' || effect.type === 'healNumber') {
        const max = effect.type === 'boomText' ? 34 : effect.type === 'healNumber' ? 56 : 42;
        const alpha = effect.timer / max;

        ctx.globalAlpha = alpha;
        ctx.font =
          effect.type === 'boomText' ? '900 34px system-ui' :
          effect.type === 'healNumber' ? '900 36px system-ui' :
          '900 20px system-ui';

        ctx.textAlign = 'center';
        ctx.fillStyle = effect.type === 'healNumber' ? '#9dff73' : '#ffe66b';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 6;
        ctx.strokeText(effect.text, effect.x, effect.y - (1 - alpha) * 28);
        ctx.fillText(effect.text, effect.x, effect.y - (1 - alpha) * 28);
        ctx.globalAlpha = 1;
      }

      if (effect.type === 'thunderFall') {
        const progress = 1 - effect.timer / effect.total;
        const y = effect.y + (effect.targetY - effect.y) * progress;

        ctx.globalAlpha = 0.95;
        ctx.strokeStyle = '#fff36b';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(effect.x, -40);
        ctx.lineTo(effect.x - 16, y - 30);
        ctx.lineTo(effect.x + 12, y - 42);
        ctx.lineTo(effect.x, y);
        ctx.stroke();

        ctx.strokeStyle = '#9deeff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(effect.x + 18, -20);
        ctx.lineTo(effect.x + 4, y - 25);
        ctx.lineTo(effect.x + 24, y - 4);
        ctx.stroke();

        ctx.globalAlpha = 1;

        if (effect.timer <= 1) {
          thunderImpact(effect);
        }
      }

      if (effect.type === 'thunderImpact') {
        const alpha = effect.timer / 30;

        ctx.globalAlpha = alpha * 0.65;
        ctx.fillStyle = '#fff36b';
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, 54 * (1 - alpha * .35), 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = alpha;
        ctx.strokeStyle = '#9deeff';
        ctx.lineWidth = 4;

        for (let i = 0; i < 6; i++) {
          const a = (Math.PI * 2 / 6) * i + frameCount * 0.08;
          ctx.beginPath();
          ctx.moveTo(effect.x, effect.y);
          ctx.lineTo(effect.x + Math.cos(a) * 62, effect.y + Math.sin(a) * 62);
          ctx.stroke();
        }

        ctx.globalAlpha = 1;
      }

      if (effect.type === 'arcaneBarrier') {
        drawArcaneBarrier(ctx, effect, p);
      }

      if (effect.type === 'darkPower') {
        drawDarkPower(ctx, effect, p);
      }

      if (effect.type === 'darkAfterImage') {
        const alpha = effect.timer / 24;

        ctx.globalAlpha = alpha * 0.28;
        ctx.fillStyle = '#07000d';
        ctx.beginPath();
        ctx.ellipse(effect.x, effect.y - 8, 34, 44, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = alpha * 0.28;
        ctx.strokeStyle = '#b45cff';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.ellipse(effect.x, effect.y - 8, 38, 48, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.globalAlpha = 1;
      }

      if (effect.type === 'darkBurst') {
        const alpha = effect.timer / 36;
        const radius = 120 * (1 - alpha);

        ctx.globalAlpha = alpha * 0.55;
        ctx.strokeStyle = '#b45cff';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      if (effect.type === 'shadowClone') {
        drawShadowClone(ctx, effect, p);
      }

      if (effect.type === 'healBreeze') {
        drawHealBreeze(ctx, effect);
      }

      if (effect.type === 'goldRushBurst') {
        drawGoldRushBurst(ctx, effect);
      }

      if (effect.type === 'darkThunderFlash') {
        const alpha = effect.timer / 20;

        ctx.globalAlpha = alpha * 0.8;
        ctx.strokeStyle = '#b45cff';
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, 72 * (1 - alpha * 0.4), 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      if (effect.type === 'lilithSisters') {
        drawLilithSisters(ctx, effect);
      }

      if (effect.type === 'whiteHealMini') {
        const alpha = effect.timer / 16;

        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, 26 * (1 - alpha * 0.4), 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    });
  }

  function drawArcaneBarrier(ctx, effect, p){
    const r1 = 72 + Math.sin(frameCount * 0.12) * 4;
    const r2 = 88 + Math.cos(frameCount * 0.1) * 4;
    const r3 = 104 + Math.sin(frameCount * 0.18) * 5;

    ctx.save();

    ctx.globalAlpha = 0.34;
    ctx.fillStyle = '#dff9ff';
    ctx.beginPath();
    ctx.arc(p.x, p.y, r3, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.78;
    ctx.strokeStyle = '#d8e8f2';
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r2, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#8ea1aa';
    ctx.lineWidth = 4;

    for (let i = 0; i < 12; i++) {
      const a = effect.rot + (Math.PI * 2 / 12) * i;
      ctx.beginPath();
      ctx.moveTo(p.x + Math.cos(a) * (r1 - 8), p.y + Math.sin(a) * (r1 - 8));
      ctx.lineTo(p.x + Math.cos(a) * (r2 + 8), p.y + Math.sin(a) * (r2 + 8));
      ctx.stroke();
    }

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;

    for (let i = 0; i < 9; i++) {
      const a = effect.rot2 + (Math.PI * 2 / 9) * i;
      ctx.beginPath();
      ctx.arc(
        p.x + Math.cos(a) * r1,
        p.y + Math.sin(a) * r1,
        9 + Math.sin(frameCount * 0.2 + i) * 2,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }

    ctx.strokeStyle = '#60d9ff';
    ctx.lineWidth = 3;

    for (let i = 0; i < 8; i++) {
      const a = effect.rot3 + (Math.PI * 2 / 8) * i;
      ctx.beginPath();
      ctx.moveTo(p.x + Math.cos(a) * 48, p.y + Math.sin(a) * 48);
      ctx.lineTo(p.x + Math.cos(a + .18) * 88, p.y + Math.sin(a + .18) * 88);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawDarkPower(ctx, effect, p){
    const pulse = 1 + Math.sin(frameCount * 0.12) * 0.08;

    ctx.save();

    ctx.globalAlpha = 0.42;
    ctx.fillStyle = '#050008';
    ctx.beginPath();
    ctx.ellipse(p.x, p.y - 8, 42 * pulse, 54 * pulse, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.32;
    ctx.strokeStyle = '#b45cff';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.ellipse(p.x, p.y - 8, 48 * pulse, 62 * pulse, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.globalAlpha = 0.45;
    ctx.fillStyle = '#20002f';
    ctx.beginPath();
    ctx.arc(p.x, p.y, 78 * pulse, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.42;
    ctx.strokeStyle = '#b45cff';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 94 * pulse, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  function drawShadowClone(ctx, effect, p){
    const count = Number(effect.cloneCount || 2);
    const offsets = count >= 3 ? [-72, 0, 72] : [-54, 54];

    ctx.save();
    ctx.globalAlpha = 0.34;
    ctx.fillStyle = '#7cff8a';
    ctx.strokeStyle = '#d7ffdf';
    ctx.lineWidth = 4;

    offsets.forEach((off, i) => {
      const x = p.x + off;
      const y = p.y + Math.sin(frameCount * 0.15 + i) * 5;

      ctx.beginPath();
      ctx.ellipse(x, y - 8, 30, 42, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

    ctx.restore();
  }

  function drawHealBreeze(ctx, effect){
    ctx.save();

    const alpha = effect.timer / 70;

    ctx.globalAlpha = alpha * 0.38;
    ctx.fillStyle = '#9dff73';
    ctx.beginPath();
    ctx.arc(effect.x, effect.y, 92 * (1 - alpha * 0.25), 0, Math.PI * 2);
    ctx.fill();

    effect.leaves.forEach(l => {
      ctx.globalAlpha = alpha;
      ctx.save();
      ctx.translate(l.x, l.y);
      ctx.rotate(l.rot);
      ctx.fillStyle = '#9dff73';
      ctx.beginPath();
      ctx.ellipse(0, 0, 5, 11, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function drawGoldRushBurst(ctx, effect){
    ctx.save();

    const alpha = effect.timer / 60;

    effect.coins.forEach(c => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(c.x, c.y);
      ctx.rotate(c.rot);

      ctx.fillStyle = '#ffcf5b';
      ctx.strokeStyle = '#7a4300';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#7a4300';
      ctx.font = '900 10px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('M', 0, 1);

      ctx.restore();
    });

    ctx.globalAlpha = alpha * 0.18;
    ctx.fillStyle = '#ffcf5b';
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function drawLilithSisters(ctx, effect){
    effect.sisters.forEach(s => {
      const image = img(s.image);
      const size = 52;

      if (imageReady(image)) {
        ctx.drawImage(image, s.x - size / 2, s.y - size / 2, size, size);
      } else {
        ctx.fillStyle =
          s.id === 'blue' ? '#6be6ff' :
          s.id === 'yellow' ? '#ffe66b' :
          s.id === 'white' ? '#ffffff' :
          '#ff5b5b';

        ctx.beginPath();
        ctx.arc(s.x, s.y, 20, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }

  window.MobShotGameSkills = {
    init,
    update,
    draw,
    getWideBonus,
    isInvincibleAgainst,
    isTimeStopped,
    coinMultiplier,
    reduceCooldownAll,
    fillAll
  };
})();
