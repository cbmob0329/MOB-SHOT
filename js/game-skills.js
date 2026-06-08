'use strict';

(function(){
  const images = new Map();

  let gameState = null;
  let slots = [];
  let skillBullets = [];
  let skillEffects = [];

  function img(src){
    if (!src) return null;

    if (!images.has(src)) {
      const image = new Image();
      image.src = src + '?v=skill_20260608';
      images.set(src, image);
    }

    return images.get(src);
  }

  function imageReady(image){
    return image && image.complete && image.naturalWidth > 0;
  }

  function init(state){
    gameState = state;
    skillBullets.length = 0;
    skillEffects.length = 0;
    slots.length = 0;

    if (!window.MobShotSkills || !window.MobShotSkills.getEquippedSkills) return;

    const equipped = window.MobShotSkills.getEquippedSkills();

    equipped.forEach((skill, index) => {
      slots.push({
        skill,
        slotIndex: index,
        cd: 0,
        ready: true
      });
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

  function update(){
    if (!gameState) return;

    updateEffects();
    updateSlots();
    updateBullets();
    updateBarrierDamage();
  }

  function updateSlots(){
    slots.forEach(slot => {
      slot.cd--;

      if (slot.cd <= 0) {
        activate(slot);
        slot.cd = Math.floor(slot.skill.cooldown * 60);
        slot.ready = false;
      }
    });
  }

  function activate(slot){
    const skill = slot.skill;

    if (skill.type === 'rocket') {
      fireRocket(skill);
    }

    if (skill.type === 'energyRush') {
      fireEnergyRush(skill);
    }

    if (skill.type === 'twinMissile') {
      fireTwinMissile(skill);
    }

    if (skill.type === 'shadowClone') {
      startShadowClone(skill);
    }

    if (skill.type === 'thunderbolt') {
      startThunderbolt(skill);
    }

    if (skill.type === 'arcaneBarrier') {
      startArcaneBarrier(skill);
    }

    if (skill.type === 'darkPower') {
      startDarkPower(skill);
    }
  }

  function fireRocket(skill){
    const count = Math.max(1, Number(skill.count || 1));

    for (let i = 0; i < count; i++) {
      skillBullets.push({
        type: 'rocket',
        skill,
        x: gameState.player.x + (i - (count - 1) / 2) * 28,
        y: gameState.player.y - 36 - i * 18,
        vx: 0,
        vy: -7.4,
        r: 18,
        dead: false
      });
    }
  }

  function fireEnergyRush(skill){
    const count = Math.max(1, Number(skill.count || 10));

    for (let i = 0; i < count; i++) {
      const dir = Math.floor(Math.random() * 3);
      let vx = 0;
      let vy = -8.2;

      if (dir === 1) {
        vx = -2.8;
        vy = -7.4;
      }

      if (dir === 2) {
        vx = 2.8;
        vy = -7.4;
      }

      skillBullets.push({
        type: 'energyRush',
        skill,
        x: gameState.player.x,
        y: gameState.player.y - 36,
        vx,
        vy,
        r: 9,
        delay: i * 3,
        dead: false
      });
    }
  }

  function fireTwinMissile(skill){
    const count = Math.max(1, Number(skill.count || 2));

    for (let i = 0; i < count; i++) {
      skillBullets.push({
        type: 'twinMissile',
        skill,
        x: gameState.player.x + (i - (count - 1) / 2) * 22,
        y: gameState.player.y - 20,
        vx: 0,
        vy: -3.8,
        r: 12,
        target: findStrongestTarget(),
        dead: false
      });
    }
  }

  function startShadowClone(skill){
    const duration = Math.floor(Number(skill.duration || 5) * 60);

    skillEffects.push({
      type: 'shadowClone',
      timer: duration,
      wideBonus: Number(skill.wideBonus || 3)
    });
  }

  function startThunderbolt(skill){
    const duration = Math.floor(Number(skill.duration || 5) * 60);

    skillEffects.push({
      type: 'thunderbolt',
      skill,
      timer: duration,
      tick: 0
    });
  }

  function startArcaneBarrier(skill){
    const duration = Math.floor(Number(skill.duration || 5) * 60);

    skillEffects.push({
      type: 'arcaneBarrier',
      skill,
      timer: duration,
      damage: Number(skill.barrierDamage || 0),
      hitCd: 0
    });
  }

  function startDarkPower(skill){
    const duration = Math.floor(Number(skill.duration || 5) * 60);

    skillEffects.push({
      type: 'darkPower',
      skill,
      timer: duration,
      rate: Number(skill.darkPowerRate || 0.5)
    });
  }

  function updateEffects(){
    for (const effect of skillEffects) {
      effect.timer--;

      if (effect.type === 'thunderbolt') {
        effect.tick--;

        if (effect.tick <= 0) {
          effect.tick = 12;
          dropThunder(effect.skill);
        }
      }

      if (effect.type === 'arcaneBarrier') {
        effect.hitCd--;
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

      checkBulletHit(bullet);

      if (
        bullet.y < -120 ||
        bullet.y > window.innerHeight + 120 ||
        bullet.x < -120 ||
        bullet.x > window.innerWidth + 120
      ) {
        bullet.dead = true;
      }
    }

    skillBullets = skillBullets.filter(b => !b.dead);
  }

  function updateMissile(bullet){
    if (!bullet.target || bullet.target.dead) {
      bullet.target = findStrongestTarget();
    }

    if (bullet.target) {
      const dx = bullet.target.x - bullet.x;
      const dy = bullet.target.y - bullet.y;
      const d = Math.max(1, Math.hypot(dx, dy));

      bullet.vx += (dx / d) * 0.42;
      bullet.vy += (dy / d) * 0.42;

      const sp = Math.hypot(bullet.vx, bullet.vy);
      const maxSp = 7.2;

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
    const radius = Math.min(window.innerWidth, window.innerHeight) * 0.42;

    skillEffects.push({
      type: 'explosion',
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

      const d = Math.hypot(e.x - x, e.y - y);

      if (d <= radius) {
        damageEntity(e, playerPower() * skill.powerRate.explosion + plusDamage(skill));
      }
    });
  }

  function smallExplode(x, y, skill){
    const radius = 68;

    skillEffects.push({
      type: 'smallExplosion',
      x,
      y,
      radius,
      timer: 12
    });

    gameState.entities.forEach(e => {
      if (
        e.dead ||
        e.kind === 'gate' ||
        e.kind === 'enemyBullet'
      ) {
        return;
      }

      const d = Math.hypot(e.x - x, e.y - y);

      if (d <= radius) {
        damageEntity(e, playerPower() * 0.8 + plusDamage(skill));
      }
    });
  }

  function dropThunder(skill){
    const targets = gameState.entities.filter(e =>
      !e.dead &&
      e.kind !== 'gate' &&
      e.kind !== 'enemyBullet'
    );

    if (!targets.length) return;

    const target = targets[Math.floor(Math.random() * targets.length)];

    skillEffects.push({
      type: 'thunderHit',
      image: skill.bulletImage,
      x: target.x,
      y: target.y,
      timer: 14
    });

    damageEntity(target, playerPower() * skill.powerRate.thunder + plusDamage(skill));
  }

  function updateBarrierDamage(){
    const barrier = skillEffects.find(e => e.type === 'arcaneBarrier');

    if (!barrier) return;

    if (barrier.damage <= 0) return;

    if (barrier.hitCd > 0) return;

    barrier.hitCd = 18;

    const p = gameState.player;
    const radius = 64;

    gameState.entities.forEach(e => {
      if (
        e.dead ||
        e.kind === 'gate' ||
        e.kind === 'enemyBullet'
      ) {
        return;
      }

      const d = Math.hypot(e.x - p.x, e.y - p.y);

      if (d <= radius + (e.r || 28)) {
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

  function draw(ctx){
    if (!gameState) return;

    for (const bullet of skillBullets) {
      if (bullet.delay && bullet.delay > 0) continue;

      const image = img(bullet.skill.bulletImage);

      if (imageReady(image)) {
        const size =
          bullet.type === 'rocket' ? 42 :
          bullet.type === 'twinMissile' ? 28 :
          22;

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
      if (effect.type === 'explosion' || effect.type === 'smallExplosion') {
        const alpha = Math.max(0, effect.timer / 18);

        ctx.globalAlpha = alpha * 0.55;
        ctx.fillStyle = '#ff9d2d';
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = alpha * 0.75;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.radius * 0.72, 0, Math.PI * 2);
        ctx.stroke();

        ctx.globalAlpha = 1;
      }

      if (effect.type === 'thunderHit') {
        const image = img(effect.image);

        if (imageReady(image)) {
          ctx.drawImage(image, effect.x - 32, effect.y - 68, 64, 96);
        } else {
          ctx.strokeStyle = '#fff36b';
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.moveTo(effect.x, effect.y - 80);
          ctx.lineTo(effect.x - 16, effect.y - 30);
          ctx.lineTo(effect.x + 10, effect.y - 34);
          ctx.lineTo(effect.x - 4, effect.y + 28);
          ctx.stroke();
        }
      }

      if (effect.type === 'arcaneBarrier') {
        ctx.globalAlpha = 0.55;
        ctx.strokeStyle = '#9deeff';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 64, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      if (effect.type === 'darkPower') {
        ctx.globalAlpha = 0.45;
        ctx.fillStyle = '#2b004f';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 58, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      if (effect.type === 'shadowClone') {
        ctx.globalAlpha = 0.28;
        ctx.fillStyle = '#7cff8a';
        ctx.beginPath();
        ctx.arc(p.x - 38, p.y, 24, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(p.x + 38, p.y, 24, 0, Math.PI * 2);
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
