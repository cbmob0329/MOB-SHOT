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
    'atk/rocket.png',
    'atk/enetama.png',
    'atk/tuibi.png',
    'atk/kaminari.png'
  ];

  function img(src){
    if (!src) return null;

    if (!images.has(src)) {
      const image = new Image();
      image.src = src + '?v=skill_fx_bar_20260608';
      images.set(src, image);
    }

    return images.get(src);
  }

  function preload(){
    PRELOAD_IMAGES.forEach(src => img(src));

    if (
      window.MobShotSkills &&
      window.MobShotSkills.SKILL_MASTER
    ) {
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
        maxCd: Math.floor(skill.cooldown * 60),
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

  function update(){
    if (!gameState) return;

    frameCount++;

    updateEffects();
    updateCooldowns();
    updateBullets();
    updateBarrierDamage();
    updateHud();
  }

  function updateCooldowns(){
    slots.forEach(slot => {
      if (slot.cd > 0) {
        slot.cd--;
      }

      slot.ready = slot.cd <= 0;
    });
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
      power *= 1 + Number(dark.rate || 0);
    }

    return power;
  }

  function plusDamage(skill){
    return Number(skill.plus || 0);
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
      timer: Math.floor(Number(skill.duration || 5) * 60),
      wideBonus: Number(skill.wideBonus || 3)
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
      rot: 0
    });
  }

  function startDarkPower(skill){
    skillEffects.push({
      type: 'darkPower',
      skill,
      timer: Math.floor(Number(skill.duration || 5) * 60),
      rate: Number(skill.darkPowerRate || 0.5)
    });

    skillEffects.push({
      type: 'darkBurst',
      x: gameState.player.x,
      y: gameState.player.y,
      timer: 36
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
        bullet.y < -140 ||
        bullet.y > window.innerHeight + 140 ||
        bullet.x < -140 ||
        bullet.x > window.innerWidth + 140
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

  function findStrongestTarget(){
    if (!gameState) return null;

    let target = null;
    let bestHp = -1;

    gameState.entities.forEach(e => {
      if (
        e.dead ||
        e.kind === 'gate' ||
        e.kind === 'enemyBullet'
      ) {
        return;
      }

      const hp = Number(e.hp || 0);

      if (hp > bestHp) {
        bestHp = hp;
        target = e;
      }
    });

    return target;
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

        skillEffects.push({
          type: 'energyHit',
          x: bullet.x,
          y: bullet.y,
          timer: 10
        });
      }

      if (bullet.type === 'twinMissile') {
        damageEntity(e, playerPower() * bullet.skill.powerRate.bullet + plusDamage(bullet.skill));
        smallExplode(bullet.x, bullet.y, bullet.skill);
      }

      bullet.dead = true;
      break;
    }
  }

  function explode(x, y, skill){
    const radius = Math.min(window.innerWidth, window.innerHeight) * 0.55;

    skillEffects.push({
      type: 'explosion',
      x,
      y,
      radius,
      timer: 32
    });

    skillEffects.push({
      type: 'boomText',
      text: 'BOOM!!',
      x,
      y: y - 20,
      timer: 34
    });

    gameState.entities.forEach(e => {
      if (
        e.dead ||
        e.kind === 'gate' ||
        e.kind === 'enemyBullet'
      ) {
        return;
      }

      if (Math.hypot(e.x - x, e.y - y) <= radius) {
        damageEntity(e, playerPower() * skill.powerRate.explosion + plusDamage(skill));
      }
    });
  }

  function smallExplode(x, y, skill){
    const radius = 88;

    skillEffects.push({
      type: 'smallExplosion',
      x,
      y,
      radius,
      timer: 18
    });

    gameState.entities.forEach(e => {
      if (
        e.dead ||
        e.kind === 'gate' ||
        e.kind === 'enemyBullet'
      ) {
        return;
      }

      if (Math.hypot(e.x - x, e.y - y) <= radius) {
        damageEntity(e, playerPower() * 0.8 + plusDamage(skill));
      }
    });
  }

  function createThunder(skill){
    const targets = gameState.entities.filter(e =>
      !e.dead &&
      e.kind !== 'gate' &&
      e.kind !== 'enemyBullet'
    );

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

  function updateBarrierDamage(){
    const barrier = skillEffects.find(e => e.type === 'arcaneBarrier');

    if (!barrier || barrier.damage <= 0 || barrier.hitCd > 0) return;

    barrier.hitCd = 18;

    const p = gameState.player;
    const radius = 72;

    gameState.entities.forEach(e => {
      if (
        e.dead ||
        e.kind === 'gate' ||
        e.kind === 'enemyBullet'
      ) {
        return;
      }

      if (Math.hypot(e.x - p.x, e.y - p.y) <= radius + (e.r || 28)) {
        damageEntity(e, barrier.damage);
      }
    });
  }

  function damageEntity(entity, damage){
    entity.hp -= damage;

    if (entity.hp <= 0 && !entity.__rewarded) {
      if (window.MobShotGameCore && window.MobShotGameCore.killEntity) {
        window.MobShotGameCore.killEntity(entity);
      } else {
        entity.dead = true;
      }
    }
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
        entity.fromBoss
      )
    ) {
      return true;
    }

    return false;
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

      const image = img(bullet.skill.bulletImage);

      if (imageReady(image)) {
        const size =
          bullet.type === 'rocket' ? 54 :
          bullet.type === 'twinMissile' ? 34 :
          34;

        ctx.drawImage(
          image,
          bullet.x - size / 2,
          bullet.y - size / 2,
          size,
          size
        );
      } else {
        ctx.fillStyle = bullet.type === 'rocket' ? '#ff6b22' : '#9deeff';
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    drawEffects(ctx);
  }

  function drawEffects(ctx){
    const p = gameState.player;

    skillEffects.forEach(effect => {
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

      if (effect.type === 'energyHit') {
        const alpha = effect.timer / 10;

        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#9deeff';
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, 24 * (1 - alpha + .25), 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
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

      if (effect.type === 'boomText') {
        const alpha = effect.timer / 34;

        ctx.globalAlpha = alpha;
        ctx.font = '900 34px system-ui';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffe66b';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 6;
        ctx.strokeText(effect.text, effect.x, effect.y - (1 - alpha) * 28);
        ctx.fillText(effect.text, effect.x, effect.y - (1 - alpha) * 28);
        ctx.globalAlpha = 1;
      }

      if (effect.type === 'skillText') {
        const alpha = effect.timer / 42;

        ctx.globalAlpha = alpha;
        ctx.font = '900 20px system-ui';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffe66b';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 5;
        ctx.strokeText(effect.text, effect.x, effect.y - (1 - alpha) * 18);
        ctx.fillText(effect.text, effect.x, effect.y - (1 - alpha) * 18);
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
          ctx.lineTo(
            effect.x + Math.cos(a) * 62,
            effect.y + Math.sin(a) * 62
          );
          ctx.stroke();
        }

        ctx.globalAlpha = 1;
      }

      if (effect.type === 'arcaneBarrier') {
        const r1 = 72 + Math.sin(frameCount * 0.12) * 4;
        const r2 = 88 + Math.cos(frameCount * 0.1) * 4;

        ctx.globalAlpha = 0.72;
        ctx.strokeStyle = '#9deeff';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r1, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r2, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = '#60d9ff';
        ctx.lineWidth = 3;

        for (let i = 0; i < 8; i++) {
          const a = effect.rot + (Math.PI * 2 / 8) * i;
          ctx.beginPath();
          ctx.moveTo(
            p.x + Math.cos(a) * 60,
            p.y + Math.sin(a) * 60
          );
          ctx.lineTo(
            p.x + Math.cos(a + .18) * 88,
            p.y + Math.sin(a + .18) * 88
          );
          ctx.stroke();
        }

        ctx.globalAlpha = 1;
      }

      if (effect.type === 'darkPower') {
        const pulse = 1 + Math.sin(frameCount * 0.12) * 0.08;

        ctx.globalAlpha = 0.55;
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
        ctx.globalAlpha = 0.28;
        ctx.fillStyle = '#7cff8a';
        ctx.beginPath();
        ctx.arc(p.x - 42, p.y, 28, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(p.x + 42, p.y, 28, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    });
  }

  window.MobShotGameSkills = {
    init,
    update,
    draw,
    getWideBonus,
    isInvincibleAgainst
  };
})();
